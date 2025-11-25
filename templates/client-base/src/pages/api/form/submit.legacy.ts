import type { APIContext } from "astro";

// Legacy universal form handler route.
// Kept in the base template for reference only. New sites should rely on
// the Form Builder Agent-generated submit implementation instead.
declare function runAgent(path: string, input: unknown): Promise<any>;

const handler = async (context: APIContext): Promise<Response> => {
  const { request, url, clientAddress, locals } = context;

  if (request.method !== "POST") {
    return new Response(
      JSON.stringify({
        success: false,
        leadDocument: null,
        crmForwardResult: null,
        attribution: null,
        errors: {
          status: 400,
          message: "Only POST requests are allowed for this endpoint.",
        },
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  let formPayload: any;
  try {
    formPayload = await request.json();
  } catch {
    return new Response(
      JSON.stringify({
        success: false,
        leadDocument: null,
        crmForwardResult: null,
        attribution: null,
        errors: {
          status: 400,
          message: "Invalid JSON body in request.",
        },
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const headers = request.headers;
  const referer = headers.get("referer") || "";

  const urlObj = url instanceof URL ? url : new URL(request.url);
  const searchParams = urlObj.searchParams;

  const utm_source = searchParams.get("utm_source") || undefined;
  const utm_medium = searchParams.get("utm_medium") || undefined;
  const utm_campaign = searchParams.get("utm_campaign") || undefined;
  const utm_term = searchParams.get("utm_term") || undefined;
  const utm_content = searchParams.get("utm_content") || undefined;

  const forwardedFor = headers.get("x-forwarded-for");
  const ipAddress =
    (forwardedFor && forwardedFor.split(",")[0].trim()) ||
    clientAddress ||
    undefined;

  const pagePath = urlObj.pathname || undefined;
  const siteName =
    (locals as any)?.siteName || headers.get("x-site-name") || undefined;

  // Lead source heuristic
  let leadSource: string;
  if (utm_source) {
    leadSource = "paid";
  } else if (/google|bing/i.test(referer)) {
    leadSource = "organic";
  } else if (/facebook|instagram/i.test(referer)) {
    leadSource = "social";
  } else if (!referer) {
    leadSource = "direct";
  } else {
    leadSource = "referral";
  }

  const requestMeta = {
    url: urlObj.toString(),
    pagePath,
    referer: referer || undefined,
    ipAddress,
    headers: {
      "user-agent": headers.get("user-agent") || undefined,
    },
    utm: {
      utm_source,
      utm_medium,
      utm_campaign,
      utm_term,
      utm_content,
    },
    siteName,
  };

  const clientConfig: Record<string, unknown> = {};
  if (process.env.CRM_WEBHOOK_URL) {
    clientConfig.webhookURL = process.env.CRM_WEBHOOK_URL;
  }
  if (process.env.JOBBER_API_KEY) {
    clientConfig.jobberApiKey = process.env.JOBBER_API_KEY;
  }
  if (process.env.HUBSPOT_API_KEY) {
    clientConfig.hubspotApiKey = process.env.HUBSPOT_API_KEY;
  }

  let result: any;
  try {
    result = await runAgent(".cursor/agents/factory/form_handler_agent.yaml", {
      formPayload,
      requestMeta,
      clientConfig,
      dataset: process.env.SANITY_DATASET,
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        success: false,
        leadDocument: null,
        crmForwardResult: null,
        attribution: requestMeta,
        errors: {
          status: 500,
          message: "Unexpected error invoking Universal Form Handler Agent.",
          detail: error?.message ?? String(error),
        },
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const leadDocument = result?.leadDocument ?? null;
  const crmForwardResult = result?.crmForwardResult ?? null;
  const attribution = result?.attribution ?? requestMeta ?? null;
  const errors = result?.errors ?? null;

  const success = !errors && !!leadDocument;

  return new Response(
    JSON.stringify({
      success,
      leadDocument,
      crmForwardResult,
      attribution,
      errors,
    }),
    {
      status: success ? 200 : 500,
      headers: { "Content-Type": "application/json" },
    }
  );
};

export default handler;


