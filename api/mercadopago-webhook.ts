import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

type SupabaseClient = ReturnType<typeof createClient>;

// ── Helpers ───────────────────────────────────────────────────────────────────

async function findUserByEmail(supabase: SupabaseClient, email: string): Promise<string | undefined> {
  const emailLower = email.toLowerCase();
  let page = 1;
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 50 });
    if (error || !data?.users?.length) break;
    const found = data.users.find((u) => u.email?.toLowerCase() === emailLower);
    if (found) return found.id;
    if (data.users.length < 50) break;
    page++;
  }
  return undefined;
}

async function findUserByEmailOrId(
  supabase: SupabaseClient,
  externalRef: string,
  fallbackEmail?: string
): Promise<string | undefined> {
  const isEmail = externalRef?.includes("@");
  if (isEmail) {
    const userId = await findUserByEmail(supabase, externalRef);
    if (userId) return userId;
    if (fallbackEmail && fallbackEmail !== externalRef) {
      return findUserByEmail(supabase, fallbackEmail);
    }
    return undefined;
  }
  // Trata como UUID
  const { data } = await supabase.auth.admin.getUserById(externalRef);
  return data?.user?.id;
}

async function updateUserMeta(
  supabase: SupabaseClient,
  userId: string,
  meta: Record<string, string>
): Promise<void> {
  const { data: existing } = await supabase.auth.admin.getUserById(userId);
  const existingMeta = existing?.user?.user_metadata ?? {};
  const { error } = await supabase.auth.admin.updateUserById(userId, {
    user_metadata: { ...existingMeta, ...meta },
  });
  if (error) {
    console.error("[webhook] Update user error:", error);
  } else {
    console.log("[webhook] Updated user", userId, "→", meta);
  }
}

// ── PIX payment handler ───────────────────────────────────────────────────────

async function handlePaymentEvent(
  supabase: SupabaseClient,
  mpToken: string,
  supabaseUrl: string,
  serviceKey: string,
  paymentId: string
): Promise<void> {
  const paymentRes = await fetch(
    `https://api.mercadopago.com/v1/payments/${paymentId}`,
    { headers: { Authorization: `Bearer ${mpToken}` } }
  );

  if (!paymentRes.ok) {
    console.error("[webhook] Could not fetch payment:", paymentId);
    return;
  }

  const payment = await paymentRes.json();
  const { status, external_reference, payer } = payment as {
    status: string;
    external_reference: string;
    payer: { email: string };
  };

  console.log("[webhook] Payment details:", { id: paymentId, status, external_reference });

  if (status !== "approved") {
    console.log("[webhook] Payment not approved, status:", status);
    return;
  }

  // Localizar usuário pelo external_reference (email) ou email do pagador
  const userId = await findUserByEmailOrId(supabase, external_reference, payer?.email);

  if (!userId) {
    console.error("[webhook] User not found for payment external_reference:", external_reference);
    return;
  }

  await updateUserMeta(supabase, userId, {
    subscription_status: "trial_active",
    subscription_mp_payment_id: paymentId,
    subscription_updated_at: new Date().toISOString(),
  });

  // Envia email de configuração de senha
  await fetch(`${supabaseUrl}/auth/v1/recover`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: serviceKey },
    body: JSON.stringify({ email: external_reference.includes("@") ? external_reference : payer?.email }),
  });
}

// ── Main handler ──────────────────────────────────────────────────────────────

async function processWebhook(body: unknown): Promise<void> {
  const mpToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!mpToken || !supabaseUrl || !serviceKey) {
    console.error("[webhook] Missing env vars");
    return;
  }

  const payload = body as Record<string, unknown>;
  console.log("[webhook] Received:", JSON.stringify(payload));

  const eventType = payload?.type as string | undefined;
  const resourceId = (payload?.data as Record<string, unknown>)?.id as string | undefined;

  if (!eventType || !resourceId) {
    console.log("[webhook] No actionable data, skipping.");
    return;
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // ── Evento de PIX (pagamento avulso) ──────────────────────────────────────
  if (eventType === "payment") {
    await handlePaymentEvent(supabase, mpToken, supabaseUrl, serviceKey, resourceId);
    return;
  }

  // ── Evento de preapproval (assinatura com cartão) ─────────────────────────
  if (eventType !== "preapproval" && eventType !== "subscription_preapproval") {
    console.log("[webhook] Event type not handled:", eventType);
    return;
  }

  const preapprovalRes = await fetch(
    `https://api.mercadopago.com/preapproval/${resourceId}`,
    { headers: { Authorization: `Bearer ${mpToken}` } }
  );

  if (!preapprovalRes.ok) {
    console.error("[webhook] Could not fetch preapproval:", resourceId);
    return;
  }

  const preapproval = await preapprovalRes.json();
  const { external_reference, status, payer_email } = preapproval as {
    external_reference: string;
    status: string;
    payer_email: string;
  };

  console.log("[webhook] Preapproval details:", { id: resourceId, status, external_reference });

  let subscriptionStatus: string;
  if (status === "authorized") {
    subscriptionStatus = "trial_active";
  } else if (status === "cancelled") {
    subscriptionStatus = "cancelled";
  } else if (status === "paused") {
    subscriptionStatus = "payment_failed";
  } else {
    subscriptionStatus = status;
  }

  const userId = await findUserByEmailOrId(supabase, external_reference, payer_email);

  if (!userId) {
    console.error("[webhook] User not found for external_reference:", external_reference);
    return;
  }

  await updateUserMeta(supabase, userId, {
    subscription_status: subscriptionStatus,
    subscription_preapproval_id: resourceId,
    subscription_updated_at: new Date().toISOString(),
  });
}

function verifySignature(req: VercelRequest): boolean {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  // Se não houver secret configurado, pula validação (ambiente dev)
  if (!secret) return true;

  const xSignature = req.headers["x-signature"] as string | undefined;
  const xRequestId = req.headers["x-request-id"] as string | undefined;
  const dataId = (req.query?.["data.id"] as string | undefined) ??
    (req.body as Record<string, unknown>)?.data?.["id" as keyof object];

  if (!xSignature) return false;

  // Formato: ts=...,v1=...
  const parts = Object.fromEntries(
    xSignature.split(",").map((p) => p.split("=") as [string, string])
  );
  const ts = parts["ts"];
  const v1 = parts["v1"];
  if (!ts || !v1) return false;

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;

  const crypto = require("crypto") as typeof import("crypto");
  const expected = crypto.createHmac("sha256", secret).update(manifest).digest("hex");

  return expected === v1;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "method_not_allowed" });
  }

  if (!verifySignature(req)) {
    console.warn("[webhook] Invalid signature — rejecting request");
    return res.status(401).json({ error: "invalid_signature" });
  }

  // Processa e responde — Mercado Pago espera 200 rápido
  try {
    await processWebhook(req.body);
  } catch (err) {
    console.error("[webhook] Unhandled error:", err);
  }

  return res.status(200).json({ received: true });
}
