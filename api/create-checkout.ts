import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

type PlanId = "monthly" | "yearly";
type PaymentMethod = "card" | "pix";

const PLANS: Record<PlanId, { amount: number; label: string; frequency: number }> = {
  monthly: { amount: 49.9, label: "Mensal", frequency: 1 },
  yearly: { amount: 499.9, label: "Anual", frequency: 12 },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function findOrCreateUser(
  supabase: ReturnType<typeof createClient>,
  supabaseUrl: string,
  serviceKey: string,
  email: string,
  meta: Record<string, unknown>
): Promise<string | undefined> {
  const { data: createdUser, error: createError } = await supabase.auth.admin.createUser({
    email,
    email_confirm: true,
    password: crypto.randomUUID(),
    user_metadata: meta,
  });

  if (!createError) return createdUser.user?.id;

  const isExisting =
    createError.message?.toLowerCase().includes("already been registered") ||
    createError.message?.toLowerCase().includes("already registered");

  if (!isExisting) {
    console.error("[create-checkout] Create user error:", createError);
    return undefined;
  }

  // Usuário já existe — busca e atualiza
  let userId: string | undefined;
  let page = 1;

  outer: while (true) {
    const { data: listData, error: listErr } = await supabase.auth.admin.listUsers({
      page,
      perPage: 50,
    });
    if (listErr || !listData?.users?.length) break;

    for (const u of listData.users) {
      if (u.email?.toLowerCase() === email) {
        userId = u.id;
        break outer;
      }
    }

    if (listData.users.length < 50) break;
    page++;
  }

  if (userId) {
    await supabase.auth.admin.updateUserById(userId, { user_metadata: meta });
  }

  return userId;
}

async function sendPasswordResetEmail(supabaseUrl: string, serviceKey: string, email: string) {
  await fetch(`${supabaseUrl}/auth/v1/recover`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: serviceKey },
    body: JSON.stringify({ email }),
  });
}

// ─── PIX handler ──────────────────────────────────────────────────────────────

async function handlePix(
  mpToken: string,
  supabase: ReturnType<typeof createClient>,
  supabaseUrl: string,
  serviceKey: string,
  email: string,
  planId: PlanId,
  plan: (typeof PLANS)[PlanId]
) {
  const pixRes = await fetch("https://api.mercadopago.com/v1/payments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${mpToken}`,
      "X-Idempotency-Key": `pix-${email}-${Date.now()}`,
    },
    body: JSON.stringify({
      transaction_amount: plan.amount,
      payment_method_id: "pix",
      description: `CALC - Plano ${plan.label}`,
      external_reference: email,
      payer: { email },
      // PIX expira em 30 minutos
      date_of_expiration: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    }),
  });

  const pixData = await pixRes.json();

  if (!pixRes.ok || pixData.status === "rejected") {
    console.error("[create-checkout] PIX error:", pixData);
    return { error: "pix_failed", detail: pixData.status_detail ?? "Erro ao gerar PIX." };
  }

  // Cria/atualiza usuário com status pendente até o pagamento ser confirmado
  const meta = {
    subscription_status: "pending_pix",
    subscription_plan: planId,
    subscription_mp_payment_id: String(pixData.id),
    subscription_plan_amount: plan.amount,
  };

  const userId = await findOrCreateUser(supabase, supabaseUrl, serviceKey, email, meta);
  if (!userId) return { error: "user_creation_failed" };

  // Registra pagamento na tabela payments (acesso expira após 30 dias para PIX)
  const pixExpiresAt = new Date();
  pixExpiresAt.setDate(pixExpiresAt.getDate() + (planId === "yearly" ? 365 : 30));

  await supabase.from("payments").insert({
    user_id: userId,
    payment_id: String(pixData.id),
    preapproval_id: null,
    plan: planId,
    amount: plan.amount,
    method: "pix",
    status: "pending",          // será atualizado para 'approved' quando PIX for confirmado
    expires_at: pixExpiresAt.toISOString(),
  });

  const txData = pixData.point_of_interaction?.transaction_data;

  return {
    ok: true,
    method: "pix",
    paymentId: pixData.id,
    qrCode: txData?.qr_code ?? null,
    qrCodeBase64: txData?.qr_code_base64 ?? null,
    ticketUrl: txData?.ticket_url ?? null,
    expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    userId,
  };
}

// ─── Card handler ─────────────────────────────────────────────────────────────

async function handleCard(
  mpToken: string,
  supabase: ReturnType<typeof createClient>,
  supabaseUrl: string,
  serviceKey: string,
  email: string,
  planId: PlanId,
  plan: (typeof PLANS)[PlanId],
  cardNumber: string,
  cardExpiry: string,
  cardCvv: string,
  cardHolderName: string
) {
  // 1. Tokenizar cartão
  const expiryParts = String(cardExpiry).split("/");
  if (expiryParts.length !== 2) return { error: "invalid_expiry_format" };

  const expMonth = parseInt(expiryParts[0], 10);
  const expYear = parseInt("20" + expiryParts[1], 10);

  const tokenRes = await fetch("https://api.mercadopago.com/v1/card_tokens", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${mpToken}`,
    },
    body: JSON.stringify({
      card_number: String(cardNumber).replace(/\D/g, ""),
      expiration_month: expMonth,
      expiration_year: expYear,
      security_code: String(cardCvv).replace(/\D/g, ""),
      cardholder: { name: cardHolderName },
    }),
  });

  const tokenData = await tokenRes.json();
  if (!tokenData.id) {
    const detail = tokenData.cause?.[0]?.description ?? "Cartão inválido.";
    return { error: "invalid_card", detail };
  }

  // 2. Criar preapproval (assinatura com trial)
  const now = new Date();
  const trialEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const endDate = new Date(now);
  endDate.setFullYear(endDate.getFullYear() + 5);

  const preapprovalRes = await fetch("https://api.mercadopago.com/preapproval", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${mpToken}`,
    },
    body: JSON.stringify({
      reason: `CALC - Plano ${plan.label}`,
      external_reference: email,
      payer_email: email,
      card_token_id: tokenData.id,
      currency_id: "BRL",
      auto_recurring: {
        frequency: plan.frequency,
        frequency_type: "months",
        start_date: now.toISOString(),
        end_date: endDate.toISOString(),
        transaction_amount: plan.amount,
        currency_id: "BRL",
        free_trial: { frequency: 7, frequency_type: "days" },
      },
      status: "authorized",
    }),
  });

  const preapprovalData = await preapprovalRes.json();
  if (!preapprovalRes.ok) {
    const detail = preapprovalData.message ?? "Falha no pagamento.";
    return { error: "payment_failed", detail };
  }

  // 3. Criar/atualizar usuário
  const meta = {
    subscription_status: "trial_active",
    subscription_plan: planId,
    subscription_preapproval_id: preapprovalData.id,
    subscription_trial_ends_at: trialEnd.toISOString(),
    subscription_plan_amount: plan.amount,
  };

  const userId = await findOrCreateUser(supabase, supabaseUrl, serviceKey, email, meta);
  if (!userId) return { error: "user_creation_failed" };

  // 4. Registra pagamento na tabela payments
  const cardExpiresAt = new Date();
  if (planId === "yearly") {
    cardExpiresAt.setFullYear(cardExpiresAt.getFullYear() + 1);
  } else {
    cardExpiresAt.setDate(cardExpiresAt.getDate() + 30);
  }

  await supabase.from("payments").insert({
    user_id: userId,
    payment_id: preapprovalData.id,   // para cartão, payment_id é o preapproval_id
    preapproval_id: preapprovalData.id,
    plan: planId,
    amount: plan.amount,
    method: "card",
    status: "approved",
    expires_at: cardExpiresAt.toISOString(),
  });

  // 5. Enviar email de configuração de senha
  await sendPasswordResetEmail(supabaseUrl, serviceKey, email);

  return {
    ok: true,
    method: "card",
    preapprovalId: preapprovalData.id,
    trialEndsAt: trialEnd.toISOString(),
    userId,
  };
}

// ─── Handler principal ────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });

  try {
    const { email, paymentMethod, planId, cardNumber, cardExpiry, cardCvv, cardHolderName } =
      req.body ?? {};

    if (!email || !paymentMethod || !planId) {
      return res.status(400).json({ error: "missing_fields" });
    }

    const plan = PLANS[planId as PlanId];
    if (!plan) return res.status(400).json({ error: "invalid_plan" });

    if (!["card", "pix"].includes(paymentMethod)) {
      return res.status(400).json({ error: "invalid_payment_method" });
    }

    const mpToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!mpToken || !supabaseUrl || !serviceKey) {
      return res.status(500).json({ error: "server_misconfigured" });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    let result: Record<string, unknown>;

    if ((paymentMethod as PaymentMethod) === "pix") {
      result = await handlePix(mpToken, supabase, supabaseUrl, serviceKey, normalizedEmail, planId, plan);
    } else {
      if (!cardNumber || !cardExpiry || !cardCvv || !cardHolderName) {
        return res.status(400).json({ error: "missing_card_fields" });
      }
      result = await handleCard(
        mpToken, supabase, supabaseUrl, serviceKey,
        normalizedEmail, planId, plan,
        cardNumber, cardExpiry, cardCvv, cardHolderName
      );
    }

    if (result.error) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (err) {
    console.error("[create-checkout] Unexpected error:", err);
    return res.status(500).json({ error: "internal_error" });
  }
}
