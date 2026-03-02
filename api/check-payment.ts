import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "method_not_allowed" });

  const { paymentId, email } = req.query;

  if (!paymentId || !email) {
    return res.status(400).json({ error: "missing_params" });
  }

  const mpToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!mpToken || !supabaseUrl || !serviceKey) {
    return res.status(500).json({ error: "server_misconfigured" });
  }

  try {
    // Consulta o status do pagamento no MP
    const paymentRes = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      { headers: { Authorization: `Bearer ${mpToken}` } }
    );

    if (!paymentRes.ok) {
      return res.status(400).json({ error: "payment_not_found" });
    }

    const payment = await paymentRes.json();
    const { status, status_detail } = payment;

    if (status !== "approved") {
      return res.status(200).json({ paid: false, status, status_detail });
    }

    // Pagamento aprovado — ativa a conta do usuário
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const normalizedEmail = String(email).toLowerCase().trim();

    // Busca o usuário pelo email
    let userId: string | undefined;
    let page = 1;

    outer: while (true) {
      const { data: listData, error } = await supabase.auth.admin.listUsers({ page, perPage: 50 });
      if (error || !listData?.users?.length) break;

      for (const u of listData.users) {
        if (u.email?.toLowerCase() === normalizedEmail) {
          userId = u.id;
          break outer;
        }
      }

      if (listData.users.length < 50) break;
      page++;
    }

    if (userId) {
      const { data: existing } = await supabase.auth.admin.getUserById(userId);
      const existingMeta = existing?.user?.user_metadata ?? {};

      await supabase.auth.admin.updateUserById(userId, {
        user_metadata: {
          ...existingMeta,
          subscription_status: "trial_active",
          subscription_mp_payment_id: String(paymentId),
          subscription_updated_at: new Date().toISOString(),
        },
      });

      // Envia email de configuração de senha (se ainda não enviado)
      await fetch(`${supabaseUrl}/auth/v1/recover`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: serviceKey },
        body: JSON.stringify({ email: normalizedEmail }),
      });
    }

    return res.status(200).json({ paid: true, status, userId });
  } catch (err) {
    console.error("[check-payment] Error:", err);
    return res.status(500).json({ error: "internal_error" });
  }
}
