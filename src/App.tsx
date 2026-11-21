import React, { useEffect, useMemo, useState } from 'react';
import {
  Check,
  ExternalLink,
  Eye,
  Layers,
  Mail,
  Monitor,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import { calculateUnitPriceWithVariants } from './domain/pricing';
import { CartLineItem, CatalogItem, TenantConfig } from './domain/tenant.schema';
import { ThemeModeProvider } from './design/ThemeModeContext';
import {
  fetchRuntimeTenantBySlug,
  getAllTenants,
  getTenantBySlug,
  getValidationReports,
} from './engine/tenant-registry';
import { Storefront } from './engine/Storefront';
import { AdminApp } from './admin/AdminApp';
import { defaultStorageAdapter } from './admin/storage/adapter';
import { Sliders } from 'lucide-react';

function resolveInitialSlug(): {
  slug: string | null;
  isCleanCaptureMode: boolean;
  isAdminMode: boolean;
} {
  const path = window.location.pathname;
  const params = new URLSearchParams(window.location.search);
  const isCleanCaptureMode = params.get('capture') === '1';
  const isAdminParam = params.get('admin') === '1' || path.includes('/admin');

  // Support `/d/{slug}/admin` or `/admin`
  if (path === '/admin') {
    return { slug: params.get('demo') || null, isCleanCaptureMode, isAdminMode: true };
  }

  const adminMatch = path.match(/^\/d\/([^/]+)\/admin/);
  if (adminMatch && adminMatch[1]) {
    return { slug: decodeURIComponent(adminMatch[1]), isCleanCaptureMode, isAdminMode: true };
  }

  // Support `/d/{slug}` clean URLs (Cloudflare Pages / Vercel)
  const match = path.match(/^\/d\/([^/]+)/);
  if (match && match[1]) {
    return { slug: decodeURIComponent(match[1]), isCleanCaptureMode, isAdminMode: isAdminParam };
  }

  // Also support `?demo={slug}` query param
  const queryDemo = params.get('demo');
  if (queryDemo) {
    return { slug: queryDemo, isCleanCaptureMode, isAdminMode: isAdminParam };
  }

  return { slug: null, isCleanCaptureMode, isAdminMode: isAdminParam };
}

export const App: React.FC = () => {
  const allTenants = useMemo(() => getAllTenants(), []);
  const reports = useMemo(() => getValidationReports(), []);
  const initial = useMemo(() => resolveInitialSlug(), []);

  const [activeSlug, setActiveSlug] = useState<string>(() => {
    return initial.slug ?? 'pasta-comedia';
  });

  useEffect(() => {
    if (initial.slug && initial.slug !== activeSlug) {
      setActiveSlug(initial.slug);
    }
  }, [initial.slug]);
  const [runtimeTenant, setRuntimeTenant] = useState<TenantConfig | null>(null);
  const [cloudTenant, setCloudTenant] = useState<TenantConfig | null>(null);
  const [showFactoryBar, setShowFactoryBar] = useState<boolean>(
    !initial.isCleanCaptureMode
  );
  const [mobilePreview, setMobilePreview] = useState<boolean>(false);
  const [copiedEmail, setCopiedEmail] = useState<boolean>(false);
  const [isAdminView, setIsAdminView] = useState<boolean>(initial.isAdminMode);

  // Cart & Modal State (scoped per active tenant)
  const [cartBySlug, setCartBySlug] = useState<Record<string, CartLineItem[]>>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);

  const activeTenant = useMemo(() => {
    const base =
      (cloudTenant && cloudTenant.slug === activeSlug ? cloudTenant : undefined) ??
      (activeSlug ? getTenantBySlug(activeSlug) : undefined) ??
      runtimeTenant ??
      getTenantBySlug('pasta-comedia') ??
      allTenants[0];
    // Load local storage overrides if present
    return defaultStorageAdapter.load(base.slug, base);
  }, [activeSlug, cloudTenant, runtimeTenant, allTenants, isAdminView]);

  // Synchronize with cloud-published tenant for mobile devices & live customers
  useEffect(() => {
    let isCurrent = true;
    if (activeSlug) {
      fetch(`/api/tenant?slug=${encodeURIComponent(activeSlug)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (isCurrent && data && data.slug === activeSlug) {
            setCloudTenant(data);
            defaultStorageAdapter.save(data);
          }
        })
        .catch(() => {
          // Fallback to static base
        });
    }
    return () => {
      isCurrent = false;
    };
  }, [activeSlug]);

  useEffect(() => {
    if (!getTenantBySlug(activeSlug)) {
      fetchRuntimeTenantBySlug(activeSlug).then((loaded) => {
        if (loaded) setRuntimeTenant(loaded);
      });
    }
  }, [activeSlug]);

  useEffect(() => {
    if (activeTenant) {
      if (isAdminView) {
        document.title = `Panel de Control — ${activeTenant.brand.name} | AventoTech`;
      } else if (!showFactoryBar) {
        document.title = `${activeTenant.brand.name} — ${activeTenant.brand.tagline || 'Tienda Oficial & Pedidos Directos'}`;
      } else {
        document.title = `${activeTenant.brand.name} — AventoTech`;
      }
    }
  }, [activeTenant, isAdminView, showFactoryBar]);

  const currentLines = cartBySlug[activeTenant.slug] ?? [];

  const cartCount = useMemo(
    () => currentLines.reduce((acc, l) => acc + l.quantity, 0),
    [currentLines]
  );

  const cartSubtotal = useMemo(
    () =>
      currentLines.reduce(
        (acc, l) => acc + calculateUnitPriceWithVariants(l) * l.quantity,
        0
      ),
    [currentLines]
  );

  const handleAddToCart = (
    item: CatalogItem,
    quantity: number,
    selectedVariants: Record<string, { label: string; priceDelta: number }>,
    notes: string
  ) => {
    const variantKey = Object.entries(selectedVariants)
      .map(([k, v]) => `${k}:${v.label}`)
      .join('|');
    const lineId = `${item.id}::${variantKey}::${notes.trim()}`;

    setCartBySlug((prev) => {
      const existing = prev[activeTenant.slug] ?? [];
      const idx = existing.findIndex((l) => l.lineId === lineId);
      if (idx >= 0) {
        const updated = [...existing];
        updated[idx] = {
          ...updated[idx],
          quantity: updated[idx].quantity + quantity,
        };
        return { ...prev, [activeTenant.slug]: updated };
      }
      return {
        ...prev,
        [activeTenant.slug]: [
          ...existing,
          { lineId, item, quantity, selectedVariants, notes },
        ],
      };
    });
  };

  const handleQuickAdd = (item: CatalogItem) => {
    handleAddToCart(item, 1, {}, '');
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (lineId: string, delta: number) => {
    setCartBySlug((prev) => {
      const existing = prev[activeTenant.slug] ?? [];
      const updated = existing
        .map((l) =>
          l.lineId === lineId ? { ...l, quantity: l.quantity + delta } : l
        )
        .filter((l) => l.quantity > 0);
      return { ...prev, [activeTenant.slug]: updated };
    });
  };

  const handleRemoveLine = (lineId: string) => {
    setCartBySlug((prev) => {
      const existing = prev[activeTenant.slug] ?? [];
      return {
        ...prev,
        [activeTenant.slug]: existing.filter((l) => l.lineId !== lineId),
      };
    });
  };

  const handleSwitchTenant = (slug: string) => {
    setActiveSlug(slug);
    setSelectedItem(null);
    setIsCartOpen(false);
    window.history.replaceState({}, '', `/d/${slug}`);
  };

  const handleCopyOutreachEmail = () => {
    const demoUrl = `${window.location.origin}/d/${activeTenant.slug}`;
    const isEcom = activeTenant.templateType === 'ecommerce';
    const subject = isEcom
      ? `armé este catálogo web con los productos de ${activeTenant.brand.name}`
      : `boceto de carta interactiva para ${activeTenant.brand.name}`;

    const body = isEcom
      ? `Asunto: ${subject}\n\nHola equipo de ${activeTenant.brand.name}, ¿cómo están?\n\nVi sus publicaciones en ${activeTenant.platformComparison.platformName} y noté que todavía no tienen una tienda web directa para vender sin pagar el ${activeTenant.platformComparison.commissionSavedPercent}% de comisión de la plataforma.\n\nImporté algunos de sus productos reales y les armé una demostración funcional con carrito directo a WhatsApp y descuento por transferencia:\n👉 ${demoUrl}\n\nSi les gusta cómo quedó, avísenme por acá y la conectamos con su propio dominio esta semana.`
      : `Asunto: ${subject}\n\nHola equipo de ${activeTenant.brand.name}, ¿cómo están?\n\nVi su local en Google Maps (${activeTenant.brand.ratingScore}★) y les armé una demostración de carta interactiva para recibir pedidos calculados directo a su WhatsApp sin pagar el ${activeTenant.platformComparison.commissionSavedPercent}% de comisión de las apps:\n👉 ${demoUrl}\n\nPueden probar armar un pedido desde el celular. Si les sirve, me avisan y la dejamos activa.`;

    navigator.clipboard.writeText(body);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  if (isAdminView) {
    return (
      <AdminApp
        tenant={activeTenant}
        onExitAdmin={() => setIsAdminView(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Factory Operator Top Bar (Hidden when ?capture=1 is used by Playwright) */}
      {showFactoryBar && (
        <div className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-md px-4 py-2.5 text-zinc-100">
          <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 text-xs font-extrabold text-amber-400">
                <Layers className="h-3.5 w-3.5" />
                AventoTech Engine
              </span>

              {/* Tenant Selector Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {allTenants.map((t) => {
                  const isCurrent = t.slug === activeTenant.slug;
                  return (
                    <button
                      key={t.slug}
                      onClick={() => handleSwitchTenant(t.slug)}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                        isCurrent
                          ? 'bg-white text-zinc-950 shadow'
                          : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                      }`}
                    >
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: t.theme.primaryColor }}
                      />
                      <span>{t.brand.name}</span>
                      <span className="rounded bg-zinc-500/20 px-1.5 py-0.2 text-[10px] uppercase">
                        {t.templateType === 'ecommerce' ? 'MeLi/Tienda' : 'Gastro'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Operator Actions */}
            <div className="flex items-center gap-2">
              <span className="hidden xl:inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2.5 py-1">
                <Sparkles className="h-3 w-3" />
                {reports.filter((r) => r.valid).length}/{reports.length} JSONs
                validados (Zod)
              </span>

              <button
                onClick={() => setMobilePreview((m) => !m)}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition ${
                  mobilePreview
                    ? 'border-amber-500 bg-amber-500/15 text-amber-400'
                    : 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
                }`}
                title="Alternar vista Celular (390px) para captura de mail"
              >
                {mobilePreview ? (
                  <>
                    <Smartphone className="h-3.5 w-3.5" />
                    <span>Vista Celular (390px)</span>
                  </>
                ) : (
                  <>
                    <Monitor className="h-3.5 w-3.5" />
                    <span>Vista Escritorio</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setIsAdminView(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1.5 text-xs font-semibold text-amber-400 transition"
                title="Abrir Panel de Administración (/admin)"
              >
                <Sliders className="h-3.5 w-3.5" />
                <span>Panel /admin</span>
              </button>

              <button
                onClick={handleCopyOutreachEmail}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white transition"
              >
                {copiedEmail ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>¡Mail Copiado!</span>
                  </>
                ) : (
                  <>
                    <Mail className="h-3.5 w-3.5" />
                    <span>Copiar Mail de Venta</span>
                  </>
                )}
              </button>

              <a
                href={`/d/${activeTenant.slug}?capture=1`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 px-2.5 py-1.5 text-xs text-zinc-300"
                title="Abrir URL limpia de cliente (sin barra superior)"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Link Cliente</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Viewport Frame (Full width or Mobile 390px Mockup for Email Captures) */}
      <div
        className={
          mobilePreview
            ? 'py-8 px-4 flex justify-center bg-zinc-950 min-h-screen'
            : ''
        }
      >
        {mobilePreview ? (
          <div className="w-[390px] h-[844px] rounded-[48px] border-[10px] border-zinc-800 shadow-2xl overflow-hidden bg-black flex flex-col ring-1 ring-white/10">
            {/* Notch / Dynamic Island Simulator */}
            <div className="h-6 bg-black w-full flex items-center justify-center shrink-0">
              <div className="h-3.5 w-24 bg-zinc-900 rounded-full" />
            </div>
            <iframe
              src={`/d/${activeTenant.slug}?capture=1`}
              title="Mobile Preview Frame"
              className="w-full flex-1 border-none bg-white"
            />
          </div>
        ) : (
          <div className="w-full">
            <ThemeModeProvider
              key={activeTenant.slug}
              slug={activeTenant.slug}
              defaultMode={activeTenant.theme.mode}
              allowToggle={activeTenant.theme.allowModeToggle}
            >
              <Storefront
                tenant={activeTenant}
                lines={currentLines}
                cartCount={cartCount}
                cartSubtotal={cartSubtotal}
                isCartOpen={isCartOpen}
                selectedItem={selectedItem}
                onOpenCart={() => setIsCartOpen(true)}
                onCloseCart={() => setIsCartOpen(false)}
                onSelectItem={setSelectedItem}
                onQuickAdd={handleQuickAdd}
                onAddToCart={handleAddToCart}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveLine={handleRemoveLine}
              />
            </ThemeModeProvider>
          </div>
        )}
      </div>

      {/* Floating button to re-show operator bar if hidden */}
      {!showFactoryBar && !initial.isCleanCaptureMode && (
        <button
          onClick={() => setShowFactoryBar(true)}
          className="fixed bottom-4 left-4 z-50 rounded-full bg-zinc-900/90 border border-zinc-700 px-3 py-1.5 text-xs text-white shadow-lg flex items-center gap-1.5"
        >
          <Eye className="h-3.5 w-3.5" />
          Panel DemoFactory
        </button>
      )}
    </div>
  );
};
