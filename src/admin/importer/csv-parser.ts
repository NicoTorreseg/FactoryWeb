import Papa from 'papaparse';
import { CatalogItem } from '../../domain/tenant.schema';

export interface CsvProductRow {
  titulo?: string;
  title?: string;
  categoria?: string;
  category?: string;
  precio_web?: string | number;
  precio?: string | number;
  price?: string | number;
  precio_meli?: string | number;
  compare_price?: string | number;
  descripcion?: string;
  description?: string;
  foto_url?: string;
  image?: string;
  stock?: string;
  sku?: string;
  badge?: string;
}

export interface ParseResult {
  items: CatalogItem[];
  errors: string[];
  totalParsed: number;
}

/**
 * Parses user-uploaded CSV / exported Excel content 100% in the browser.
 * Free ($0), instant, and resilient to column naming differences.
 */
export function parseProductsCsv(csvContent: string, defaultCategoryId: string): ParseResult {
  const result = Papa.parse<CsvProductRow>(csvContent, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
  });

  const items: CatalogItem[] = [];
  const errors: string[] = [];

  result.data.forEach((row, idx) => {
    const rowNum = idx + 2; // account for header
    const title = (row.titulo || row.title || '').toString().trim();
    if (!title) {
      errors.push(`Fila ${rowNum}: El título del producto está vacío.`);
      return;
    }

    const rawPrice = row.precio_web ?? row.precio ?? row.price;
    const priceNum = typeof rawPrice === 'number' ? rawPrice : parseFloat(String(rawPrice || '0').replace(/[^0-9.]/g, ''));
    if (!priceNum || priceNum <= 0) {
      errors.push(`Fila ${rowNum} ("${title}"): Precio inválido.`);
      return;
    }

    const rawCompare = row.precio_meli ?? row.compare_price;
    const compareNum = typeof rawCompare === 'number' ? rawCompare : (rawCompare ? parseFloat(String(rawCompare).replace(/[^0-9.]/g, '')) : undefined);

    const categoryId = (row.categoria || row.category || defaultCategoryId).toString().trim().toLowerCase();
    const description = (row.descripcion || row.description || 'Elaboración y calidad garantizada.').toString().trim();
    const imageUrl = (row.foto_url || row.image || 'https://images.unsplash.com/photo-1546549032-9571cd6b27df?auto=format&fit=crop&w=900&q=80').toString().trim();
    const inStock = String(row.stock || 'SI').toUpperCase() !== 'NO' && String(row.stock || '1') !== '0';

    const slugifiedId = `imp-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;

    items.push({
      id: slugifiedId,
      sku: row.sku ? String(row.sku).trim() : undefined,
      title,
      description,
      categoryId,
      price: Math.round(priceNum),
      compareAtPlatformPrice: compareNum && compareNum > priceNum ? Math.round(compareNum) : undefined,
      images: [imageUrl],
      badge: row.badge ? String(row.badge).trim() : undefined,
      featured: false,
      inStock,
      stockLabel: inStock ? 'En stock' : 'Sin stock',
      variants: [],
    });
  });

  return {
    items,
    errors,
    totalParsed: items.length,
  };
}

export function generateCsvTemplate(): string {
  const header = ['titulo', 'categoria', 'precio_web', 'precio_meli', 'descripcion', 'foto_url', 'stock', 'badge'];
  const samples = [
    ['Tagliolini al Tartufo', 'pastas', '18500', '24500', 'Pasta al huevo con trufa negra y parmesano', 'https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=800', 'SI', 'Recomendado'],
    ['Pizza Margherita Verace', 'pizzas', '15800', '21000', 'Masa fermentada 48hs con tomate San Marzano', 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=800', 'SI', 'Horno a leña'],
    ['Scoby de Kombucha Starter', 'kombucha', '13000', '15900', 'Cultivo vivo fresco con líquido iniciador', 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=800', 'SI', 'Más vendido']
  ];

  return [header.join(','), ...samples.map(row => row.map(v => `"${v}"`).join(','))].join('\n');
}
