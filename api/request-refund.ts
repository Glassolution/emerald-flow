import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });

  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "unauthorized" });

  const mpToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!mpToken || !supabaseUrl || !serviceKey) {
    return res.status(500).json({ error: "server_misconfigured" });
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Autentica usuário pelo token Bearer
  const { data: { user }, error: authError } = await supabase.auth.getUser(
    authHeader.replace("Bearer ", "")
  );
  if (authError || !user) return res.status(401).json({ error: "invalid_token" });

  try {
    // Busca pagamento mais recente aprovado do usuário
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (paymentError || !payment) {
      return res.status(404).json({ error: "payment_not_found", message: "Nenhum pagamento encontrado." });
    }

    // Verifica prazo de 7 dias (CDC Art. 49)
    const daysSincePurchase =
      (Date.now() - new Date(payment.created_at).getTime()) / (1000 * 60 * 60 * 24);

    if (daysSincePurchase > 7) {
      return res.status(400).json({
        error: "refund_period_expired",
        message: "O prazo de 7 dias para estorno já expirou.",
        days_since_purchase: Math.floor(daysSincePurchase),
      });
    }

    // Chama API do Mercado Pago para estorno
    const mpRes = await fetch(
      `https://api.mercadopago.com/v1/payments/${payment.payment_id}/refunds`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${mpToken}`,
          "Content-Type": "application/json",
          "X-Idempotency-Key": `refund-${payment.id}`,
        },
        body: JSON.stringify({}),
      }
    );

    if (!mpRes.ok) {
      const mpError = await mpRes.json();
      console.error("[request-refund] MP error:", mpError);
      return res.status(500).json({ error: "mp_refund_failed", details: mpError });
    }

    const refundData = await mpRes.json();

    // Atualiza registro na tabela payments
    await supabase
      .from("payments")
      .update({
        status: "refunded",
        refunded_at: new Date().toISOString(),
        refund_id: String(refundData.id),
      })
      .eq("id", payment.id);

    // Revoga acesso premium no user_metadata
    const existingMeta = user.user_metadata ?? {};
    await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...existingMeta,
        subscription_status: "cancelled",
        subscription_refund_id: String(refundData.id),
        subscription_refunded_at: new Date().toISOString(),
      },
    });

    const message =
      payment.method === "pix"
        ? "Estorno aprovado. O valor retorna em até 1 dia útil."
        : "Estorno aprovado. O valor retorna em 1–10 dias úteis dependendo da operadora.";

    return res.status(200).json({ success: true, refund_id: refundData.id, message });
  } catch (err) {
    console.error("[request-refund] Unexpected error:", err);
    return res.status(500).json({ error: "internal_error" });
  }
}
