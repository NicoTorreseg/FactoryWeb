import React, { createContext, useContext, useState, useEffect } from 'react';
import { TenantConfig, CatalogItem } from '../domain/tenant.schema';
import { defaultStorageAdapter } from './storage/adapter';

interface AdminContextType {
  tenant: TenantConfig;
  activeTab: 'products' | 'commercial' | 'brand' | 'sync';
  setActiveTab: (tab: 'products' | 'commercial' | 'brand' | 'sync') => void;
  updateTenant: (updater: (prev: TenantConfig) => TenantConfig) => void;
  updateProduct: (product: CatalogItem) => void;
  addProduct: (product: CatalogItem) => void;
  deleteProduct: (productId: string) => void;
  toggleProductStock: (productId: string) => void;
  importProducts: (newItems: CatalogItem[], mode: 'replace' | 'append') => void;
  resetToOriginal: () => void;
  hasUnsavedChanges: boolean;
  isPublishing: boolean;
  lastPublishedAt: string | null;
  publishNotice: string | null;
  publishToCloud: () => Promise<boolean>;
}

const AdminContext = createContext<AdminContextType | null>(null);

export const AdminProvider: React.FC<{
  initialTenant: TenantConfig;
  children: React.ReactNode;
}> = ({ initialTenant, children }) => {
  const [activeTab, setActiveTab] = useState<
    'products' | 'commercial' | 'brand' | 'sync'
  >('products');
  const [tenant, setTenant] = useState<TenantConfig>(() => {
    return defaultStorageAdapter.load(initialTenant.slug, initialTenant);
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [lastPublishedAt, setLastPublishedAt] = useState<string | null>(null);
  const [publishNotice, setPublishNotice] = useState<string | null>(null);

  // Auto-fetch latest cloud version on mount if available
  useEffect(() => {
    let mounted = true;
    fetch(`/api/tenant?slug=${encodeURIComponent(initialTenant.slug)}`)
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((cloudTenant) => {
        if (mounted && cloudTenant && cloudTenant.slug === initialTenant.slug) {
          // If cloud data is present and user hasn't made unsaved local edits yet
          if (!hasUnsavedChanges) {
            setTenant(cloudTenant);
            defaultStorageAdapter.save(cloudTenant);
          }
        }
      })
      .catch(() => {
        // Silently ignore if running strictly local
      });
    return () => {
      mounted = false;
    };
  }, [initialTenant.slug]);

  // Persist locally in localStorage on every edit
  useEffect(() => {
    defaultStorageAdapter.save(tenant);
  }, [tenant]);

  const updateTenant = (updater: (prev: TenantConfig) => TenantConfig) => {
    setTenant((prev) => {
      const next = updater(prev);
      setHasUnsavedChanges(true);
      return next;
    });
  };

  const publishToCloud = async (): Promise<boolean> => {
    setIsPublishing(true);
    setPublishNotice(null);
    try {
      const res = await fetch('/api/tenant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: tenant.slug, tenant }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }

      defaultStorageAdapter.save(tenant);
      setHasUnsavedChanges(false);
      const timeStr = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      setLastPublishedAt(timeStr);
      setPublishNotice('¡Cambios publicados en vivo para todos los celulares y PCs!');
      setTimeout(() => setPublishNotice(null), 4000);
      return true;
    } catch (err: any) {
      console.warn('Could not reach cloud edge API, saved locally:', err.message);
      // Still saved in localStorage
      defaultStorageAdapter.save(tenant);
      setPublishNotice('Cambios guardados localmente. Al subir a Git o conectar KV se sincronizarán en la nube.');
      setTimeout(() => setPublishNotice(null), 5000);
      return false;
    } finally {
      setIsPublishing(false);
    }
  };

  const updateProduct = (product: CatalogItem) => {
    updateTenant((prev) => ({
      ...prev,
      items: prev.items.map((i) => (i.id === product.id ? product : i)),
    }));
  };

  const addProduct = (product: CatalogItem) => {
    updateTenant((prev) => ({
      ...prev,
      items: [product, ...prev.items],
    }));
  };

  const deleteProduct = (productId: string) => {
    updateTenant((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.id !== productId),
    }));
  };

  const toggleProductStock = (productId: string) => {
    updateTenant((prev) => ({
      ...prev,
      items: prev.items.map((i) =>
        i.id === productId
          ? {
              ...i,
              inStock: !i.inStock,
              stockLabel: !i.inStock ? 'En stock' : 'Sin stock',
            }
          : i
      ),
    }));
  };

  const importProducts = (
    newItems: CatalogItem[],
    mode: 'replace' | 'append'
  ) => {
    updateTenant((prev) => ({
      ...prev,
      items: mode === 'replace' ? newItems : [...newItems, ...prev.items],
    }));
  };

  const resetToOriginal = () => {
    defaultStorageAdapter.reset(initialTenant.slug);
    setTenant(initialTenant);
    setHasUnsavedChanges(false);
  };

  return (
    <AdminContext.Provider
      value={{
        tenant,
        activeTab,
        setActiveTab,
        updateTenant,
        updateProduct,
        addProduct,
        deleteProduct,
        toggleProductStock,
        importProducts,
        resetToOriginal,
        hasUnsavedChanges,
        isPublishing,
        lastPublishedAt,
        publishNotice,
        publishToCloud,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) throw new Error('useAdmin must be used within AdminProvider');
  return context;
}
