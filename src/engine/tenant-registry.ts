import { TenantConfig, TenantConfigSchema } from '../domain/tenant.schema';

export interface ValidationReport {
  slug: string;
  fileName: string;
  valid: boolean;
  config?: TenantConfig;
  errors?: string[];
}

/**
 * Automatically discovers and validates all JSON files inside `src/data/tenants/*.json`.
 * When the Python automation script drops a new `{slug}.json` file in `src/data/tenants/`,
 * Vite/Cloudflare Pages automatically bundles and validates it with zero manual code changes.
 */
const rawTenantModules = import.meta.glob('../data/tenants/*.json', {
  eager: true,
}) as Record<string, { default?: unknown } | unknown>;

const validatedTenantsMap = new Map<string, TenantConfig>();
const validationReports: ValidationReport[] = [];

for (const [filePath, mod] of Object.entries(rawTenantModules)) {
  const fileName = filePath.split('/').pop() ?? filePath;
  const fallbackSlug = fileName.replace(/\.json$/i, '');
  const payload =
    typeof mod === 'object' && mod !== null && 'default' in mod
      ? (mod as { default: unknown }).default
      : mod;

  const parsed = TenantConfigSchema.safeParse(payload);
  if (parsed.success) {
    validatedTenantsMap.set(parsed.data.slug, parsed.data);
    validationReports.push({
      slug: parsed.data.slug,
      fileName,
      valid: true,
      config: parsed.data,
    });
  } else {
    console.error(`Tenant validation failed for ${fileName}:`, parsed.error.issues);
    const errors = parsed.error.issues.map(
      (issue) => `${issue.path.join('.')}: ${issue.message}`
    );
    validationReports.push({
      slug: fallbackSlug,
      fileName,
      valid: false,
      errors,
    });
  }
}

// Expose for runtime inspection and diagnostics
if (typeof window !== 'undefined') {
  (window as unknown as { __validatedTenantsMap?: Map<string, TenantConfig> }).__validatedTenantsMap = validatedTenantsMap;
  (window as unknown as { __validationReports?: ValidationReport[] }).__validationReports = validationReports;
}

export function getAllTenants(): TenantConfig[] {
  return Array.from(validatedTenantsMap.values());
}

export function getTenantBySlug(slug: string): TenantConfig | undefined {
  return validatedTenantsMap.get(slug);
}

export function getValidationReports(): ValidationReport[] {
  return validationReports;
}

/**
 * Optional runtime loader for dynamic JSONs stored in `/public/tenants/{slug}.json`
 * on Cloudflare Pages / S3 / R2 without requiring a frontend build step.
 */
export async function fetchRuntimeTenantBySlug(
  slug: string
): Promise<TenantConfig | null> {
  const existing = getTenantBySlug(slug);
  if (existing) return existing;

  try {
    const response = await fetch(`/tenants/${encodeURIComponent(slug)}.json`);
    if (!response.ok) return null;
    const raw = await response.json();
    const parsed = TenantConfigSchema.safeParse(raw);
    if (!parsed.success) {
      console.error(`Invalid runtime tenant schema for ${slug}:`, parsed.error);
      return null;
    }
    validatedTenantsMap.set(parsed.data.slug, parsed.data);
    return parsed.data;
  } catch {
    return null;
  }
}
