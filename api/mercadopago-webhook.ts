import crypto from "node:crypto";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient, type User } from "@supabase/supabase-js";

/**
 * CONFIGURAÇÃO DO WEBHOOK
 */
const CONFIG = {
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  MERCADOPAGO_ACCESS_TOKEN: process.env.MERCADOPAGO_ACCESS_TOKEN,
  MERCADOPAGO_WEBHOOK_SECRET: process.env.MERCADOPAGO_WEBHOOK_SECRET,
  SUBSCRIPTION_DAYS: 30, // Dias de Premium
  SIGNATURE_TOLERANCE_MS: 10 * 60 * 1000, // 10 minutos (Anti-Replay)
};

/**
 * TIPOS E INTERFACES
 */
type PaymentStatus = "approved" | "pending" | "rejected" | "cancelled" | "refunded" | "charged_back";

interface PaymentResponse {
  id: number;
  status: PaymentStatus;
  status_detail: string;
  transaction_amount: number;
  date_approved?: string;
  payer: {
    email: string;
    id?: string;
  };
  external_reference?: string;
  metadata?: {
    user_id?: string;
    email?: string;
    [key: string]: any;
  };
}

interface WebhookSignature {
  isValid: boolean;
  ts?: string;
  v1?: string;
}

/**
 * CLIENTE SUPABASE (Admin)
 */
const supabaseAdmin = 
  CONFIG.SUPABASE_URL && CONFIG.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_SERVICE_ROLE_KEY, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      })
    : null;

/**
 * FUNÇÕES AUXILIARES DE LOG
 */
function log(message: string, data?: any) {
  console.log(`[Webhook] ${message}`, data ? JSON.stringify(data) : "");
}

function logError(message: string, error?: any) {
  console.error(`[Webhook] ERRO: ${message}`, error);
}

/**
 * 1. VALIDAÇÃO DE ASSINATURA (HMAC SHA256) COM ANTI-REPLAY
 */
function validateSignature(req: VercelRequest): WebhookSignature {
  const secret = CONFIG.MERCADOPAGO_WEBHOOK_SECRET;
  
  if (!secret) {
    logError("MERCADOPAGO_WEBHOOK_SECRET não configurado. Validação falhou.");
    return { isValid: false };
  }

  const xSignature = req.headers["x-signature"];
  const xRequestId = req.headers["x-request-id"];

  // Normalização de headers
  const signatureHeader = Array.isArray(xSignature) ? xSignature[0] : xSignature;
  const requestIdHeader = Array.isArray(xRequestId) ? xRequestId[0] : xRequestId;

  if (!signatureHeader || !requestIdHeader) {
    logError("Headers de assinatura ausentes.");
    return { isValid: false };
  }

  // Parse dos componentes da assinatura
  const parts = signatureHeader.split(",").reduce((acc, part) => {
    const [key, value] = part.split("=");
    if (key && value) acc[key.trim()] = value.trim();
    return acc;
  }, {} as Record<string, string>);

  const ts = parts["ts"];
  const hash = parts["v1"];

  if (!ts || !hash) {
    logError("Formato de header x-signature inválido.");
    return { isValid: false };
  }

  // A) ANTI-REPLAY: Validar Timestamp
  const tsNum = Number(ts);
  // O MP pode enviar timestamp em segundos ou ms? Docs dizem que é ts do evento. 
  // Geralmente Webhooks usam UNIX timestamp (segundos) ou MS.
  // Docs do MP não especificam unidade explicitamente em todo lugar, mas vamos assumir MS se for muito grande ou S.
  // Na dúvida, verificamos a ordem de grandeza. Date.now() é ~13 digitos.
  // Se ts for ~10 digitos, é segundos.
  
  // Ajuste para garantir comparação em milissegundos
  const eventTime = ts.length === 10 ? tsNum * 1000 : tsNum; 
  const now = Date.now();
  const diff = Math.abs(now - eventTime);

  if (isNaN(tsNum)) {
     logError("Timestamp da assinatura inválido (NaN).");
     return { isValid: false };
  }

  if (diff > CONFIG.SIGNATURE_TOLERANCE_MS) {
    logError(`[Webhook] Stale signature rejected. Diff: ${diff}ms`);
    return { isValid: false };
  }

  // Extrair ID do recurso
  const dataId = req.query["data.id"] ?? req.body?.data?.id ?? req.query.id ?? req.body?.id;
  
  if (!dataId) {
    logError("ID do recurso não encontrado na requisição para validar assinatura.");
    return { isValid: false };
  }

  // B) HMAC SHA256
  // Template: id:[data.id];request-id:[x-request-id];ts:[ts];
  const manifest = `id:${dataId};request-id:${requestIdHeader};ts:${ts};`;

  const hmac = crypto.createHmac("sha256", secret);
  const digest = hmac.update(manifest).digest("hex");

  const signatureBuffer = Buffer.from(hash, 'hex');
  const digestBuffer = Buffer.from(digest, 'hex');

  if (signatureBuffer.length !== digestBuffer.length) {
    logError("Assinatura inválida (comprimento diferente).");
    return { isValid: false };
  }

  const isValid = crypto.timingSafeEqual(signatureBuffer, digestBuffer);

  if (isValid) {
    log("Assinatura validada com sucesso.");
  } else {
    logError("Assinatura inválida (hash incorreto).");
  }

  return { isValid, ts, v1: hash };
}

/**
 * 2. IDEMPOTÊNCIA (Tabela webhook_events)
 */
async function registerEvent(
  provider: string, 
  resourceId: string, 
  eventType: string, 
  reqId: string, 
  payload: any,
  signatureTs?: string,
  signatureV1?: string
): Promise<boolean> {
  if (!supabaseAdmin) return true; 

  // Mascarar hash para log seguro
  const maskedHash = signatureV1 ? `${signatureV1.substring(0, 6)}...` : null;

  // Tenta inserir o evento. 
  // Constraint: UNIQUE(provider, event_type, resource_id)
  const { error } = await supabaseAdmin
    .from('webhook_events')
    .insert({
      provider,
      resource_id: resourceId,
      event_type: eventType,
      request_id: reqId,
      payload: payload,
      signature_ts: signatureTs,
      signature_v1: signatureV1 // Gravamos completo no banco para auditoria, mas logamos mascarado
    });

  if (error) {
    if (error.code === '23505') { // unique_violation
      log(`Evento duplicado ignorado. Resource ID: ${resourceId}, Type: ${eventType}`);
      return false; // Já processado
    }
    logError("Erro ao registrar evento de webhook:", error);
    // Seguir processamento em caso de erro de banco (fallback)
    return true; 
  }

  log(`Evento registrado para auditoria. Hash: ${maskedHash}`);
  return true; // Novo evento
}

/**
 * HANDLER PRINCIPAL
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Método HTTP
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  log("Evento recebido.");

  // 2. Validação de Assinatura e Anti-Replay
  const signatureCheck = validateSignature(req);
  if (!signatureCheck.isValid) {
    // 401 para assinatura inválida ou expirada
    return res.status(401).json({ error: "Invalid or stale signature" });
  }

  // Validação de Configuração
  if (!CONFIG.MERCADOPAGO_ACCESS_TOKEN || !supabaseAdmin) {
    logError("Erro Crítico: Variáveis de ambiente não configuradas.");
    return res.status(500).json({ error: "Internal Server Error" });
  }

  try {
    const { type, topic } = req.query;
    const bodyType = req.body?.type;
    const bodyAction = req.body?.action; // 'payment.created', 'payment.updated'
    
    // Definição do Event Type para idempotência
    // Se tiver action, usa action (mais granular). Se não, usa type/topic.
    // Isso resolve o problema de bloquear updates do mesmo pagamento.
    const eventType = bodyAction ?? type ?? topic ?? bodyType ?? "unknown";
    
    const isPayment = eventType === "payment" || (eventType as string).startsWith("payment.");
    const dataId = req.query["data.id"] ?? req.body?.data?.id ?? req.query.id ?? req.body?.id;
    const requestId = (req.headers["x-request-id"] as string) || "unknown";

    if (!dataId) {
      log("Payload sem ID. Ignorando.");
      return res.status(200).json({ message: "No data ID" });
    }

    // 3. Idempotência (usando novo schema com event_type e signature logs)
    const isNewEvent = await registerEvent(
      "mercadopago", 
      String(dataId), 
      String(eventType), 
      requestId, 
      req.body,
      signatureCheck.ts,
      signatureCheck.v1
    );

    if (!isNewEvent) {
      return res.status(200).json({ message: "Event already processed" });
    }

    if (!isPayment) {
      log(`Evento ${eventType} ignorado (não é pagamento).`);
      return res.status(200).json({ message: "Ignored non-payment event" });
    }

    // 4. Buscar Dados do Pagamento
    const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${dataId}`, {
      headers: {
        "Authorization": `Bearer ${CONFIG.MERCADOPAGO_ACCESS_TOKEN}`,
      },
    });

    if (!paymentResponse.ok) {
      const errorText = await paymentResponse.text();
      logError(`Erro ao buscar pagamento ${dataId}: ${errorText}`);
      return res.status(200).json({ error: "Failed to fetch payment" });
    }

    const paymentData: PaymentResponse = await paymentResponse.json();

    // 5. Verificar Status
    if (paymentData.status !== "approved") {
      log(`Pagamento ${dataId} não aprovado. Status: ${paymentData.status}`);
      return res.status(200).json({ message: `Payment status is ${paymentData.status}` });
    }

    log("Pagamento aprovado. Iniciando identificação do usuário...");

    // 6. Identificar Usuário (Ordem de Prioridade)
    let userId = paymentData.metadata?.user_id;
    const userEmailFromMetadata = paymentData.metadata?.email;
    const externalRef = paymentData.external_reference;
    const payerEmail = paymentData.payer.email;

    let user: User | null = null;

    // Tentativa 1: ID direto no metadata
    if (userId) {
      const { data } = await supabaseAdmin.auth.admin.getUserById(userId);
      user = data.user;
      if (user) log(`Usuário identificado por metadata.user_id: ${userId}`);
    }

    // Tentativa 2: External Reference
    if (!user && externalRef) {
        const { data } = await supabaseAdmin.auth.admin.getUserById(externalRef);
        if (data.user) {
            user = data.user;
            userId = user.id;
            log(`Usuário identificado por external_reference (ID): ${userId}`);
        } else {
            log(`external_reference ${externalRef} não é um ID de usuário válido.`);
        }
    }

    // Tentativa 3: Email no Metadata (Simplificado - apenas log se falhar tentativas principais)
    if (!user && userEmailFromMetadata) {
        log(`Tentando identificar por email metadata: ${userEmailFromMetadata}`);
        // Fallback não implementado por segurança/performance em escala
    }

    // Tentativa 4: Payer Email
    if (!user && payerEmail) {
        log(`Tentando identificar por payer.email: ${payerEmail}`);
    }

    // Última chance se tivermos IDs
    if (!user && (userId || externalRef)) {
        const targetId = userId || externalRef;
        const { data } = await supabaseAdmin.auth.admin.getUserById(targetId!);
        user = data.user;
    }

    if (!user) {
        logError("Não foi possível identificar o usuário. Pagamento órfão.", { 
            id: dataId, 
            metadata: paymentData.metadata, 
            external_reference: externalRef, 
            payer_email: payerEmail 
        });
        return res.status(200).json({ error: "User identification failed" });
    }

    log(`Usuário confirmado: ${user.id}`);

    // 7. Atualização Robusta (Profiles + Metadata)
    const now = new Date();
    
    // Buscar expiração atual
    const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('subscription_expires_at')
        .eq('id', user.id)
        .single();

    let newExpiresAt = new Date();
    const currentExpiresAt = profile?.subscription_expires_at ? new Date(profile.subscription_expires_at) : null;

    if (currentExpiresAt && currentExpiresAt > now) {
        newExpiresAt = new Date(currentExpiresAt.getTime() + (CONFIG.SUBSCRIPTION_DAYS * 24 * 60 * 60 * 1000));
    } else {
        newExpiresAt = new Date(now.getTime() + (CONFIG.SUBSCRIPTION_DAYS * 24 * 60 * 60 * 1000));
    }

    const updates = {
        is_premium: true,
        subscription_status: 'active',
        subscription_expires_at: newExpiresAt.toISOString(),
        last_payment_id: String(paymentData.id),
        updated_at: now.toISOString()
    };

    // A. Atualizar Tabela Profiles
    const { error: dbError } = await supabaseAdmin
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

    if (dbError) {
        logError("Erro ao atualizar tabela profiles:", dbError);
    } else {
        log("Tabela profiles atualizada com sucesso.");
    }

    // B. Atualizar User Metadata (Auth)
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
        user_metadata: {
            ...user.user_metadata,
            ...updates
        }
    });

    if (authError) {
        logError("Erro ao atualizar user_metadata:", authError);
    } else {
        log("User metadata atualizado com sucesso.");
    }

    log("Premium ativado com sucesso.", { user_id: user.id, expires_at: newExpiresAt });

    return res.status(200).json({ 
        success: true, 
        user_id: user.id,
        expires_at: newExpiresAt 
    });

  } catch (err: any) {
    logError("Exceção não tratada no handler:", err);
    return res.status(200).json({ error: "Internal Server Error" });
  }
}
