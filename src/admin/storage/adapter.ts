import { TenantConfig, TenantConfigSchema } from '../../domain/tenant.schema';

export interface TenantStorageAdapter {
  load(slug: string, fallback: TenantConfig): TenantConfig;
  save(tenant: TenantConfig): void;
  reset(slug: string): void;
}

const STORAGE_PREFIX = 'demofactory:tenant:v1:';

export class LocalStorageTenantAdapter implements TenantStorageAdapter {
  load(slug: string, fallback: TenantConfig): TenantConfig {
    if (typeof window === 'undefined') return fallback;
    try {
      const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${slug}`);
      if (!raw) return fallback;
      const parsed = TenantConfigSchema.safeParse(JSON.parse(raw));
      if (parsed.success) {
        return parsed.data;
      }
      console.warn(`[Storage] Invalid schema in localStorage for ${slug}, using fallback.`);
    } catch (e) {
      console.error(`[Storage] Failed to read localStorage for ${slug}`, e);
    }
    return fallback;
  }

  save(tenant: TenantConfig): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(
        `${STORAGE_PREFIX}${tenant.slug}`,
        JSON.stringify(tenant)
      );
    } catch (e) {
      console.error(`[Storage] Failed to save tenant ${tenant.slug}`, e);
    }
  }

  reset(slug: string): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(`${STORAGE_PREFIX}${slug}`);
    } catch (e) {
      console.error(`[Storage] Failed to reset tenant ${slug}`, e);
    }
  }
}

export const defaultStorageAdapter: TenantStorageAdapter = new LocalStorageTenantAdapter();
