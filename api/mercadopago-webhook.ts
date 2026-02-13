import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "method_not_allowed" });
  }

  try {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || "";

    const contentType = (req.headers["content-type"] || "").toLowerCase();
    let payload: unknown = null;

    if (contentType.includes("application/json")) {
      payload = req.body;
    } else if (contentType.includes("text/plain")) {
      payload = req.body;
    } else {
      payload = req.body;
    }

    console.log("[MercadoPago Webhook] received:", {
      hasAccessToken: Boolean(accessToken),
      contentType,
      payload,
    });

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error("[MercadoPago Webhook] error parsing request:", err);
    return res.status(200).json({ received: true });
  }
}
