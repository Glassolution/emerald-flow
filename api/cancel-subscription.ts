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
    // Busca pagamento ativo mais recente
    const { data: payment } = await supabase
      .from("payments")
      .select("expires_at, plan, preapproval_id")
      .eq("user_id", user.id)
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    // Se for assinatura com cartão (preapproval), cancela no MP também
    if (payment?.preapproval_id) {
      await fetch(
        `https://api.mercadopago.com/preapproval/${payment.preapproval_id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${mpToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "cancelled" }),
        }
      );
    }

    // Marca como cancelado no user_metadata — mantém acesso até expires_at
    const existingMeta = user.user_metadata ?? {};
    await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...existingMeta,
        subscription_status: "cancelled",
        subscription_cancelled_at: new Date().toISOString(),
      },
    });

    const accessUntil = payment?.expires_at;
    const accessUntilFormatted = accessUntil
      ? new Date(accessUntil).toLocaleDateString("pt-BR")
      : null;

    return res.status(200).json({
      success: true,
      access_until: accessUntil,
      message: accessUntilFormatted
        ? `Plano cancelado. Seu acesso premium continua até ${accessUntilFormatted}.`
        : "Plano cancelado com sucesso.",
    });
  } catch (err) {
    console.error("[cancel-subscription] Unexpected error:", err);
    return res.status(500).json({ error: "internal_error" });
  }
}
