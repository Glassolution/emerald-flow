// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

declare const Deno: any;




type StartTrialBody = {
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
  cardHolderName: string;
  identificationType?: string;
  identificationNumber?: string;
  planAmount: number;
  currencyId?: string;
  trialDays?: number;
};

type CancelBody = {
  action: "cancel";
};

type SupabaseAuthUser = {
  id: string;
  email: string | null;
  user_metadata?: Record<string, unknown>;
};

type SupabaseAdminClient = {
  auth: {
    getUser: (
      token: string
    ) => Promise<{
      data: { user: SupabaseAuthUser | null };
      error: unknown;
    }>;
    admin: {
      getUserById: (
        id: string
      ) => Promise<{
        data: { user: SupabaseAuthUser | null };
        error: unknown;
      }>;
      updateUserById: (
        id: string,
        attributes: { user_metadata: Record<string, unknown> }
      ) => Promise<{ error: unknown }>;
    };
  };
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: corsHeaders,
    });
  }

  const url = new URL(req.url);
  const path = url.pathname.split("/").filter(Boolean).pop() || "";

  if (req.method === "POST" && path === "mercadopago-subscription") {
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "").trim();

    if (!token) {
      return new Response(
        JSON.stringify({ error: "missing_bearer_token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: "supabase_not_configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    }) as SupabaseAdminClient;

    const { data: userResult, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !userResult.user) {
      return new Response(
        JSON.stringify({ error: "invalid_user" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const user = userResult.user as SupabaseAuthUser;

    const contentType = req.headers.get("content-type") || "";
    if (!contentType.toLowerCase().includes("application/json")) {
      return new Response(
        JSON.stringify({ error: "invalid_content_type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body = (await req.json()) as StartTrialBody | CancelBody;

    if ("action" in body && (body as CancelBody).action === "cancel") {
      return handleCancelSubscription(supabaseAdmin, user.id);
    }

    return handleStartTrial(body as StartTrialBody, supabaseAdmin, user);
  }

  return new Response("Not Found", { status: 404, headers: corsHeaders });
});

async function handleStartTrial(body: StartTrialBody, supabaseAdmin: SupabaseAdminClient, user: SupabaseAuthUser) {
  const mpAccessToken = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");

  if (!mpAccessToken) {
    return new Response(
      JSON.stringify({ error: "mercadopago_not_configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const planAmount = body.planAmount || 0;
  const trialDays = body.trialDays || 7;
  const currencyId = body.currencyId || "BRL";

  if (!body.cardNumber || !body.cardExpiry || !body.cardCvv || !body.cardHolderName) {
    return new Response(
      JSON.stringify({ error: "missing_card_data" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const normalizedNumber = body.cardNumber.replace(/\D/g, "");
  const normalizedCvv = body.cardCvv.replace(/\D/g, "");
  const expiryParts = body.cardExpiry.split("/");

  if (expiryParts.length !== 2) {
    return new Response(
      JSON.stringify({ error: "invalid_expiry_format" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const expirationMonth = parseInt(expiryParts[0], 10);
  const expirationYear = parseInt("20" + expiryParts[1], 10);

  if (!expirationMonth || !expirationYear) {
    return new Response(
      JSON.stringify({ error: "invalid_expiry_values" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const cardTokenResponse = await fetch("https://api.mercadopago.com/v1/card_tokens", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${mpAccessToken}`,
    },
    body: JSON.stringify({
      card_number: normalizedNumber,
      expiration_month: expirationMonth,
      expiration_year: expirationYear,
      security_code: normalizedCvv,
      cardholder: {
        name: body.cardHolderName,
        identification: body.identificationType && body.identificationNumber
          ? {
            type: body.identificationType,
            number: body.identificationNumber,
          }
          : undefined,
      },
    }),
  });

  if (!cardTokenResponse.ok) {
    const errorText = await cardTokenResponse.text();
    return new Response(
      JSON.stringify({ error: "card_token_error", details: errorText }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const cardTokenData = await cardTokenResponse.json();
  const cardTokenId = cardTokenData.id as string;

  const now = new Date();
  const startDate = now.toISOString();
  const trialEnd = new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000);
  const endDate = new Date(trialEnd);
  endDate.setFullYear(endDate.getFullYear() + 5);

  const preapprovalResponse = await fetch("https://api.mercadopago.com/preapproval", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${mpAccessToken}`,
    },
    body: JSON.stringify({
      reason: "Assinatura Calc Pro",
      external_reference: user.id,
      payer_email: user.email,
      card_token_id: cardTokenId,
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        start_date: startDate,
        end_date: endDate.toISOString(),
        transaction_amount: planAmount,
        currency_id: currencyId,
        free_trial: {
          frequency: trialDays,
          frequency_type: "days",
        },
      },
      status: "authorized",
    }),
  });

  if (!preapprovalResponse.ok) {
    const errorText = await preapprovalResponse.text();
    return new Response(
      JSON.stringify({ error: "preapproval_error", details: errorText }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const preapprovalData = await preapprovalResponse.json();

  const existingMetadata = user.user_metadata || {};
  const updatedMetadata = {
    ...existingMetadata,
    subscription_status: "trial_active",
    subscription_trial_ends_at: trialEnd.toISOString(),
    subscription_preapproval_id: preapprovalData.id,
    subscription_plan_amount: planAmount,
    subscription_currency: currencyId,
  };

  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
    user_metadata: updatedMetadata,
  });

  if (updateError) {
    return new Response(
      JSON.stringify({ error: "metadata_update_error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  return new Response(
    JSON.stringify({
      ok: true,
      status: "trial_active",
      trialEndsAt: trialEnd.toISOString(),
      preapprovalId: preapprovalData.id,
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
}

async function handleCancelSubscription(supabaseAdmin: SupabaseAdminClient, userId: string) {
  const mpAccessToken = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");

  if (!mpAccessToken) {
    return new Response(
      JSON.stringify({ error: "mercadopago_not_configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const { data: userResult, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);

  if (userError || !userResult.user) {
    return new Response(
      JSON.stringify({ error: "invalid_user" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const user = userResult.user;
  const metadata = user.user_metadata || {};
  const preapprovalId = metadata.subscription_preapproval_id as string | undefined;

  if (!preapprovalId) {
    return new Response(
      JSON.stringify({ error: "no_subscription_found" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const cancelResponse = await fetch(`https://api.mercadopago.com/preapproval/${preapprovalId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${mpAccessToken}`,
    },
    body: JSON.stringify({
      status: "cancelled",
    }),
  });

  if (!cancelResponse.ok) {
    const errorText = await cancelResponse.text();
    return new Response(
      JSON.stringify({ error: "cancel_error", details: errorText }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const now = new Date().toISOString();
  const updatedMetadata = {
    ...metadata,
    subscription_cancelled_at: now,
  };

  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    user_metadata: updatedMetadata,
  });

  if (updateError) {
    return new Response(
      JSON.stringify({ error: "metadata_update_error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  return new Response(
    JSON.stringify({ ok: true, cancelledAt: now }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
}
