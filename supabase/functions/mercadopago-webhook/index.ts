// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

declare const Deno: any;




type SupabaseAuthUser = {
  id: string;
  email: string | null;
  user_metadata?: Record<string, unknown>;
};

type SupabaseAdminClient = {
  auth: {
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
      listUsers: (
        params?: { page?: number; perPage?: number }
      ) => Promise<{
        data: { users: SupabaseAuthUser[] };
        error: unknown;
      }>;
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

  if (req.method !== "POST") {
    return new Response("Method not allowed", {
      status: 405,
      headers: corsHeaders,
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  const mpAccessToken = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN") || "";

  if (!supabaseUrl || !serviceRoleKey || !mpAccessToken) {
    return new Response(
      JSON.stringify({ error: "environment_not_configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  }) as SupabaseAdminClient;

  let payload: unknown;

  try {
    payload = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "invalid_json" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const preapprovalId = extractPreapprovalId(payload);

  if (!preapprovalId) {
    return new Response(
      JSON.stringify({ ok: true, ignored: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const preapprovalResponse = await fetch(`https://api.mercadopago.com/preapproval/${preapprovalId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${mpAccessToken}`,
    },
  });

  if (!preapprovalResponse.ok) {
    const errorText = await preapprovalResponse.text();
    return new Response(
      JSON.stringify({ error: "preapproval_fetch_error", details: errorText }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const preapprovalData = await preapprovalResponse.json();

  const userId = preapprovalData.external_reference as string | undefined;

  if (!userId) {
    return new Response(
      JSON.stringify({ error: "missing_external_reference" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const { data: userResult, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);

  if (userError || !userResult.user) {
    return new Response(
      JSON.stringify({ error: "user_not_found" }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const user = userResult.user;
  const metadata = user.user_metadata || {};

  const now = new Date();
  const status = preapprovalData.status as string | undefined;
  const nextPaymentDateStr = preapprovalData.next_payment_date as string | undefined;
  const nextPaymentDate = nextPaymentDateStr ? new Date(nextPaymentDateStr) : null;
  const freeTrial = preapprovalData.auto_recurring?.free_trial;
  const summarized = preapprovalData.summarized;
  const chargedCount = summarized?.charged_transactions_count as number | undefined;

  let newStatus = metadata.subscription_status as string | undefined;

  if (status === "authorized") {
    if (freeTrial && nextPaymentDate && chargedCount === 0 && now < nextPaymentDate) {
      newStatus = "trial_active";
    } else if (freeTrial && nextPaymentDate && chargedCount === 0 && now >= nextPaymentDate) {
      newStatus = "trial_expired";
    } else if (chargedCount && chargedCount > 0) {
      newStatus = "subscription_active";
    }
  } else if (status === "cancelled") {
    if (freeTrial && nextPaymentDate && now < nextPaymentDate) {
      newStatus = "trial_active";
    } else {
      newStatus = "blocked";
    }
  } else if (status === "paused") {
    newStatus = "payment_failed";
  }

  if (!newStatus) {
    return new Response(
      JSON.stringify({ ok: true, unchanged: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const updatedMetadata = {
    ...metadata,
    subscription_status: newStatus,
    subscription_preapproval_id: preapprovalData.id,
    subscription_trial_ends_at: metadata.subscription_trial_ends_at || nextPaymentDateStr || metadata.subscription_trial_ends_at,
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
    JSON.stringify({ ok: true, status: newStatus }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});

function extractPreapprovalId(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;

  const obj = payload as { [key: string]: unknown };

  if (obj.type === "subscription" || obj.type === "preapproval") {
    const data = obj.data as { [key: string]: unknown } | undefined;
    if (data && typeof data.id === "string") {
      return data.id;
    }
  }

  const data = obj.data as { [key: string]: unknown } | undefined;
  if (data && typeof data.preapproval_id === "string") {
    return data.preapproval_id;
  }

  if (typeof obj.preapproval_id === "string") {
    return obj.preapproval_id;
  }

  if (typeof obj.id === "string") {
    return obj.id;
  }

  return null;
}
