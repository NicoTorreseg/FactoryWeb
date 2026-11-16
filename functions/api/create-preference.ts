// Cloudflare Pages Function: POST /api/create-preference
// Executes at the edge with 0 ms cold starts and zero hosting cost

interface RequestBody {
  items: Array<{
    id?: string;
    title: string;
    description?: string;
    quantity: number;
    unit_price: number;
    picture_url?: string;
  }>;
  payer?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  tenantSlug?: string;
  accessToken?: string;
  shippingCost?: number;
  backUrls?: {
    success?: string;
    failure?: string;
    pending?: string;
  };
}

export async function onRequestPost(context: {
  request: Request;
  env: Record<string, string>;
}): Promise<Response> {
  const { request, env } = context;

  // Add CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  try {
    const body = (await request.json()) as RequestBody;
    const { items, payer, tenantSlug, backUrls, shippingCost } = body;

    // Use tenant-provided Access Token, or fall back to platform env
    const accessToken = body.accessToken?.trim() || env.MP_ACCESS_TOKEN?.trim();

    if (!accessToken) {
      return new Response(
        JSON.stringify({
          error:
            'No se encontró el Access Token de Mercado Pago para esta tienda. Por favor configúralo en el Panel de Administración.',
          code: 'MISSING_ACCESS_TOKEN',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!items || items.length === 0) {
      return new Response(
        JSON.stringify({
          error: 'El carrito no contiene productos.',
          code: 'EMPTY_CART',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const origin =
      request.headers.get('origin') ||
      new URL(request.url).origin ||
      'https://aventotech.pages.dev';

    // Format items for Mercado Pago API
    const mpItems = items.map((item, idx) => ({
      id: item.id || `item-${idx + 1}`,
      title: item.title,
      description: item.description || item.title,
      quantity: Math.max(1, Number(item.quantity) || 1),
      currency_id: 'ARS',
      unit_price: Math.round(Number(item.unit_price)),
      picture_url: item.picture_url,
    }));

    // Add shipping as line item if greater than 0
    if (shippingCost && shippingCost > 0) {
      mpItems.push({
        id: 'envio-domicilio',
        title: 'Costo de Envío a Domicilio',
        description: 'Despacho directo',
        quantity: 1,
        currency_id: 'ARS',
        unit_price: Math.round(Number(shippingCost)),
        picture_url: undefined,
      });
    }

    const preferencePayload = {
      items: mpItems,
      payer: {
        name: payer?.name || 'Cliente Web',
        address: payer?.address
          ? {
              street_name: payer.address,
            }
          : undefined,
      },
      back_urls: {
        success:
          backUrls?.success ||
          `${origin}/?status=approved&tenant=${tenantSlug || ''}`,
        failure:
          backUrls?.failure ||
          `${origin}/?status=failure&tenant=${tenantSlug || ''}`,
        pending:
          backUrls?.pending ||
          `${origin}/?status=pending&tenant=${tenantSlug || ''}`,
      },
      auto_return: 'approved',
      statement_descriptor: 'AVENTOTECH',
      payment_methods: {
        installments: 12,
      },
      external_reference: `orden-${tenantSlug || 'direct'}-${Date.now()}`,
    };

    const mpResponse = await fetch(
      'https://api.mercadopago.com/checkout/preferences',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferencePayload),
      }
    );

    const mpData = (await mpResponse.json()) as Record<string, any>;

    if (!mpResponse.ok) {
      return new Response(
        JSON.stringify({
          error:
            mpData.message ||
            'Error al generar la preferencia con Mercado Pago.',
          details: mpData,
          status: 'error',
        }),
        {
          status: mpResponse.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        id: mpData.id,
        init_point: mpData.init_point,
        sandbox_init_point: mpData.sandbox_init_point,
        status: 'success',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        error: err.message || 'Error interno del servidor edge.',
        status: 'error',
      }),
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
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
