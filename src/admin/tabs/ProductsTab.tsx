import React, { useState } from 'react';
import { useAdmin } from '../AdminContext';
import { CatalogItem } from '../../domain/tenant.schema';
import { ProductFormModal } from './ProductFormModal';
import { parseProductsCsv, generateCsvTemplate } from '../importer/csv-parser';
import {
  Search,
  Plus,
  FileSpreadsheet,
  Download,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export const ProductsTab: React.FC = () => {
  const {
    tenant,
    updateProduct,
    addProduct,
    deleteProduct,
    toggleProductStock,
    importProducts,
  } = useAdmin();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingItem, setEditingItem] = useState<CatalogItem | null | undefined>(
    undefined
  );
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [importNotice, setImportNotice] = useState<string | null>(null);

  const sym = tenant.commerce.currencySymbol;

  const filteredItems = tenant.items.filter((item) => {
    const matchesCat =
      selectedCategory === 'all' || item.categoryId === selectedCategory;
    const matchesSearch =
      !search ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleDownloadTemplate = () => {
    const content = generateCsvTemplate();
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plantilla_productos_${tenant.slug}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleProcessCsv = (mode: 'replace' | 'append') => {
    if (!csvText.trim()) return;
    const defaultCat = tenant.categories[0]?.id || 'general';
    const parsed = parseProductsCsv(csvText, defaultCat);

    if (parsed.items.length > 0) {
      importProducts(parsed.items, mode);
      setImportNotice(
        `Se importaron ${parsed.totalParsed} productos con éxito.`
      );
      setShowCsvModal(false);
      setCsvText('');
      setTimeout(() => setImportNotice(null), 4000);
    } else {
      alert('No se encontraron filas válidas en el CSV.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) setCsvText(text);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900 border border-zinc-800 p-4 rounded-2xl">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            Catálogo de Productos ({tenant.items.length})
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Prendé/apagá stock con un toque o modificá precios en el acto.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCsvModal(true)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
            <span>Importar Excel / CSV</span>
          </button>
          <button
            onClick={() => setEditingItem(null)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-xs font-bold text-zinc-950 transition shadow"
          >
            <Plus className="h-4 w-4" />
            <span>Nuevo Producto</span>
          </button>
        </div>
      </div>

      {importNotice && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
          <CheckCircle2 className="h-4 w-4" />
          <span>{importNotice}</span>
        </div>
      )}

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título o descripción..."
            className="w-full rounded-xl bg-zinc-900 border border-zinc-800 pl-10 pr-4 py-2.5 text-xs text-zinc-200 outline-none focus:border-zinc-700"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="rounded-xl bg-zinc-900 border border-zinc-800 px-3.5 py-2.5 text-xs text-zinc-300 outline-none"
        >
          <option value="all">Todas las categorías ({tenant.items.length})</option>
          {tenant.categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Products List (Mobile Touch Cards) */}
      <div className="grid grid-cols-1 gap-3">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 rounded-2xl border transition ${
              item.inStock
                ? 'bg-zinc-900 border-zinc-800'
                : 'bg-zinc-950/60 border-zinc-900 opacity-60'
            }`}
          >
            <div className="flex items-start gap-3.5 min-w-0">
              <img
                src={item.images[0]}
                alt={item.title}
                className="h-16 w-16 sm:h-14 sm:w-14 rounded-xl object-cover shrink-0 border border-zinc-800 bg-zinc-800"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white truncate">
                    {item.title}
                  </h3>
                  {item.badge && (
                    <span className="shrink-0 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold">
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">
                  {item.description}
                </p>

                <div className="flex items-baseline gap-2 mt-1.5 text-xs">
                  <span className="font-extrabold text-emerald-400 text-sm">
                    {sym}
                    {item.price.toLocaleString('es-AR')}
                  </span>
                  {item.compareAtPlatformPrice && (
                    <span className="text-[11px] text-zinc-500 line-through">
                      MeLi: {sym}
                      {item.compareAtPlatformPrice.toLocaleString('es-AR')}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 mt-3 sm:mt-0 border-t sm:border-t-0 border-zinc-800/80">
              {/* Stock Toggle Button */}
              <button
                type="button"
                onClick={() => toggleProductStock(item.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  item.inStock
                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25'
                    : 'bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {item.inStock ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Disponible</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-3.5 w-3.5" />
                    <span>Sin Stock</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setEditingItem(item)}
                  className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition"
                  title="Editar"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`¿Eliminar "${item.title}"?`)) {
                      deleteProduct(item.id);
                    }
                  }}
                  className="p-2 rounded-xl bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition"
                  title="Eliminar"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CSV Import Modal */}
      {showCsvModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl bg-zinc-900 border border-zinc-800 p-6 space-y-4 text-zinc-100 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <h3 className="font-bold text-base flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-emerald-400" />
                Importar Productos con Excel o CSV
              </h3>
              <button
                onClick={() => setShowCsvModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Subí un archivo separado por comas (.csv) o pegá el contenido de tu planilla. Podés descargar la plantilla modelo para completarla en Excel o Google Sheets.
            </p>

            <div className="flex gap-2">
              <button
                onClick={handleDownloadTemplate}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-emerald-400 transition"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Descargar Plantilla Excel/CSV</span>
              </button>
              <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition cursor-pointer">
                <span>Seleccionar Archivo...</span>
                <input
                  type="file"
                  accept=".csv,.txt"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </div>

            <textarea
              rows={6}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="titulo,categoria,precio_web,precio_meli,descripcion,foto_url..."
              className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-xs font-mono text-zinc-300 outline-none focus:border-emerald-500"
            />

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => handleProcessCsv('append')}
                disabled={!csvText.trim()}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-xs font-bold transition"
              >
                Sumar a los existentes
              </button>
              <button
                onClick={() => {
                  if (confirm('¿Reemplazar TODO el catálogo por esta lista?')) {
                    handleProcessCsv('replace');
                  }
                }}
                disabled={!csvText.trim()}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-xs font-bold text-white transition shadow"
              >
                Reemplazar Catálogo Completo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit/Create Modal */}
      {editingItem !== undefined && (
        <ProductFormModal
          item={editingItem}
          categories={tenant.categories}
          currencySymbol={sym}
          onSave={(item) => {
            if (editingItem) {
              updateProduct(item);
            } else {
              addProduct(item);
            }
          }}
          onClose={() => setEditingItem(undefined)}
        />
      )}
    </div>
  );
};
