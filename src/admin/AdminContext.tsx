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
}

const AdminContext = createContext<AdminContextType | null>(null);

export const AdminProvider: React.FC<{
  initialTenant: TenantConfig;
  children: React.ReactNode;
}> = ({ initialTenant, children }) => {
  const [activeTab, setActiveTab] = useState<'products' | 'commercial' | 'brand' | 'sync'>('products');
  const [tenant, setTenant] = useState<TenantConfig>(() => {
    return defaultStorageAdapter.load(initialTenant.slug, initialTenant);
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

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

  const importProducts = (newItems: CatalogItem[], mode: 'replace' | 'append') => {
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
