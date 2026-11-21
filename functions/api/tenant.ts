// Cloudflare Pages Function: /api/tenant
// Provides global persistence across all devices (PC, mobile, customer devices)

// In-memory edge cache as fast fallback when KV binding is warming up or during local dev
const edgeTenantCache = new Map<string, any>();

interface Env {
  TENANT_KV?: {
    get: (key: string) => Promise<string | null>;
    put: (key: string, value: string) => Promise<void>;
  };
  [key: string]: any;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function onRequestGet(context: {
  request: Request;
  env: Env;
}): Promise<Response> {
  const url = new URL(context.request.url);
  const slug = url.searchParams.get('slug')?.trim();

  if (!slug) {
    return new Response(JSON.stringify({ error: 'Missing slug parameter' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    // 1. Try Cloudflare KV if configured
    if (context.env?.TENANT_KV) {
      const data = await context.env.TENANT_KV.get(slug);
      if (data) {
        return new Response(data, {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'X-Source': 'cloudflare-kv',
          },
        });
      }
    }

    // 2. Try In-Memory Edge Cache
    if (edgeTenantCache.has(slug)) {
      const cached = edgeTenantCache.get(slug);
      return new Response(JSON.stringify(cached), {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'X-Source': 'edge-cache',
        },
      });
    }

    // 3. Fallback: Not found in cloud storage (frontend will use static base JSON)
    return new Response(
      JSON.stringify({
        status: 'not_found',
        message: 'No cloud updates found for this tenant. Using factory baseline.',
      }),
      {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'Error fetching tenant' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
}

export async function onRequestPost(context: {
  request: Request;
  env: Env;
}): Promise<Response> {
  try {
    const body = (await context.request.json()) as any;
    const tenant = body.tenant || body;
    const slug = tenant?.slug || body.slug;

    if (!slug || !tenant) {
      return new Response(
        JSON.stringify({ error: 'Invalid payload: missing slug or tenant config' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const payloadString = JSON.stringify(tenant);
    let storageTarget = 'edge-cache';

    // 1. Save to Cloudflare KV if binding is present
    if (context.env?.TENANT_KV) {
      await context.env.TENANT_KV.put(slug, payloadString);
      storageTarget = 'cloudflare-kv';
    }

    // 2. Update edge memory cache
    edgeTenantCache.set(slug, tenant);

    return new Response(
      JSON.stringify({
        success: true,
        slug,
        storageTarget,
        updatedAt: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'Error saving tenant' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
}

export async function onRequestOptions(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}
