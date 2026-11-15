import React, { useState } from 'react';
import { TenantConfig } from '../domain/tenant.schema';
import { AdminProvider, useAdmin } from './AdminContext';
import { AdminAuthGuard } from './AdminAuthGuard';
import { ProductsTab } from './tabs/ProductsTab';
import { CommercialTab } from './tabs/CommercialTab';
import { BrandIdentityTab } from './tabs/BrandIdentityTab';
import { ExportSyncTab } from './tabs/ExportSyncTab';
import {
  Package,
  CreditCard,
  Sliders,
  FileJson,
  ArrowLeft,
  Eye,
} from 'lucide-react';

interface AdminAppProps {
  tenant: TenantConfig;
  onExitAdmin: () => void;
}

const AdminLayout: React.FC<{ onExitAdmin: () => void }> = ({ onExitAdmin }) => {
  const { tenant, activeTab, setActiveTab } = useAdmin();

  const tabs = [
    { id: 'products', label: 'Productos & Precios', icon: Package },
    { id: 'commercial', label: 'WhatsApp & Pagos', icon: CreditCard },
    { id: 'brand', label: 'Identidad & Textos', icon: Sliders },
    { id: 'sync', label: 'Exportar / Sincronizar', icon: FileJson },
  ] as const;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-amber-500">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-zinc-950/95 border-b border-zinc-800 backdrop-blur-md px-4 py-3">
        <div className="mx-auto max-w-6xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onExitAdmin}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 transition"
              title="Volver a la tienda"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">
                  {tenant.brand.name}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold">
                  Panel de Control
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Cambios guardados en vivo
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`/d/${tenant.slug}?capture=1`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-200 transition"
            >
              <Eye className="h-3.5 w-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Ver Tienda en Vivo</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Tab Navigator (Desktop horizontal / Mobile sticky bottom) */}
      <div className="border-b border-zinc-800/60 bg-zinc-900/40 hidden sm:block">
        <div className="mx-auto max-w-6xl px-4 flex gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3 px-4 text-xs font-bold transition border-b-2 ${
                  isActive
                    ? 'border-amber-500 text-white'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Icon
                  className={`h-4 w-4 ${
                    isActive ? 'text-amber-400' : 'text-zinc-500'
                  }`}
                />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 mx-auto max-w-6xl w-full p-4 sm:p-6 pb-24 sm:pb-8">
        {activeTab === 'products' && <ProductsTab />}
        {activeTab === 'commercial' && <CommercialTab />}
        {activeTab === 'brand' && <BrandIdentityTab />}
        {activeTab === 'sync' && <ExportSyncTab />}
      </main>

      {/* Mobile Sticky Bottom Tab Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 border-t border-zinc-800 backdrop-blur-lg sm:hidden p-1.5 flex justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center p-2 rounded-xl transition ${
                isActive
                  ? 'text-amber-400 font-bold'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] mt-1">{tab.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const AdminApp: React.FC<AdminAppProps> = ({ tenant, onExitAdmin }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.sessionStorage.getItem(`aventotech:auth:${tenant.slug}`) === 'true'
    );
  });

  const handleAuthenticated = () => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(`aventotech:auth:${tenant.slug}`, 'true');
    }
    setIsAuthenticated(true);
  };

  const correctPin = tenant.theme.adminPin || '1234';

  if (!isAuthenticated) {
    return (
      <AdminAuthGuard
        correctPin={correctPin}
        brandName={tenant.brand.name}
        onAuthenticated={handleAuthenticated}
      />
    );
  }

  return (
    <AdminProvider initialTenant={tenant}>
      <AdminLayout onExitAdmin={onExitAdmin} />
    </AdminProvider>
  );
};
