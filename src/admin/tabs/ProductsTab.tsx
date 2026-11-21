import React, { useState } from 'react';
import { useAdmin } from '../AdminContext';
import { CatalogItem } from '../../domain/tenant.schema';
import { ProductFormModal } from './ProductFormModal';
import { parseProductsCsv, generateCsvTemplate } from '../importer/csv-parser';
import { formatARS } from '../../domain/pricing';
import {
  Search,
  Plus,
  FileSpreadsheet,
  Download,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  Truck,
  UploadCloud,
  Loader2,
  Settings2,
  X,
} from 'lucide-react';

export const ProductsTab: React.FC = () => {
  const {
    tenant,
    updateTenant,
    updateProduct,
    addProduct,
    deleteProduct,
    toggleProductStock,
    importProducts,
    hasUnsavedChanges,
    isPublishing,
    publishToCloud,
  } = useAdmin();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingItem, setEditingItem] = useState<CatalogItem | null | undefined>(
    undefined
  );
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [importNotice, setImportNotice] = useState<string | null>(null);

  // Quick Shipping Editor state
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [tempShippingCost, setTempShippingCost] = useState(
    tenant.commerce.flatShippingCost.toString()
  );
  const [tempFreeThreshold, setTempFreeThreshold] = useState(
    tenant.commerce.freeShippingThreshold?.toString() || ''
  );

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

  const handleSaveShipping = (e: React.FormEvent) => {
    e.preventDefault();
    updateTenant((prev) => ({
      ...prev,
      commerce: {
        ...prev.commerce,
        flatShippingCost: parseInt(tempShippingCost, 10) || 0,
        freeShippingThreshold: tempFreeThreshold
          ? parseInt(tempFreeThreshold, 10)
          : undefined,
      },
    }));
    setShowShippingModal(false);
  };

  return (
    <div className="space-y-4">
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

        <div className="flex flex-wrap items-center gap-2">
          {/* Botón de Publicar Cambios integrado */}
          <button
            onClick={() => publishToCloud()}
            disabled={isPublishing}
            className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition shadow ${
              hasUnsavedChanges
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white animate-pulse'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700'
            }`}
            title="Publica los cambios para que se vean en celulares y nuevos clientes"
          >
            {isPublishing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Publicando...</span>
              </>
            ) : (
              <>
                <UploadCloud className="h-4 w-4 text-emerald-400" />
                <span>
                  {hasUnsavedChanges
                    ? 'Publicar Cambios'
                    : 'Sincronizado'}
                </span>
              </>
            )}
          </button>

          <button
            onClick={() => setShowCsvModal(true)}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
            <span>Excel / CSV</span>
          </button>

          <button
            onClick={() => setEditingItem(null)}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-xs font-bold text-zinc-950 transition shadow"
          >
            <Plus className="h-4 w-4" />
            <span>Nuevo Producto</span>
          </button>
        </div>
      </div>

      {/* Quick Logistics & Shipping Config Bar */}
      <div className="bg-zinc-900/60 border border-zinc-800 p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-500/15 text-blue-400 shrink-0">
            <Truck className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-zinc-200">Tarifa de Envío Fijo:</span>
              <span className="font-mono font-bold text-emerald-400">
                {tenant.commerce.flatShippingCost > 0
                  ? formatARS(tenant.commerce.flatShippingCost, sym)
                  : 'Gratis ($0)'}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              {tenant.commerce.freeShippingThreshold
                ? `Envío Gratis bonificado en compras superiores a ${formatARS(
                    tenant.commerce.freeShippingThreshold,
                    sym
                  )}`
                : 'Sin umbral de envío gratis configurado'}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setTempShippingCost(tenant.commerce.flatShippingCost.toString());
            setTempFreeThreshold(
              tenant.commerce.freeShippingThreshold?.toString() || ''
            );
            setShowShippingModal(true);
          }}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs border border-zinc-700 transition"
        >
          <Settings2 className="h-3.5 w-3.5 text-blue-400" />
          <span>Configurar Envío</span>
        </button>
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
          className="rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2.5 text-xs text-zinc-200 outline-none focus:border-zinc-700"
        >
          <option value="all">Todas las categorías ({tenant.items.length})</option>
          {tenant.categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Products Table/Cards */}
      <div className="space-y-2">
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 text-xs bg-zinc-900/40 rounded-2xl border border-zinc-850">
            No se encontraron productos que coincidan con la búsqueda.
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border transition ${
                item.inStock
                  ? 'bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700'
                  : 'bg-zinc-950/40 border-zinc-900 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={item.images[0]}
                  alt={item.title}
                  className="h-12 w-12 rounded-xl object-cover shrink-0 bg-zinc-950"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-xs text-white truncate">
                      {item.title}
                    </h3>
                    {item.badge && (
                      <span className="shrink-0 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 font-bold text-[9px]">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                    {item.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-bold text-emerald-400 text-xs">
                      {formatARS(item.price, sym)}
                    </span>
                    {item.compareAtPlatformPrice && (
                      <span className="text-[10px] text-zinc-500 line-through">
                        MeLi: {formatARS(item.compareAtPlatformPrice, sym)}
                      </span>
                    )}
                    {item.variants && item.variants.length > 0 && (
                      <span className="text-[10px] text-zinc-500">
                        · {item.variants.length} variante(s)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-zinc-850">
                <button
                  onClick={() => toggleProductStock(item.id)}
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition flex items-center gap-1.5 ${
                    item.inStock
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                  }`}
                  title="Cambiar estado de stock"
                >
                  {item.inStock ? (
                    <>
                      <CheckCircle2 className="h-3 w-3" /> Disponible
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3" /> Sin Stock
                    </>
                  )}
                </button>

                <button
                  onClick={() => setEditingItem(item)}
                  className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition"
                  title="Editar producto"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>

                <button
                  onClick={() => {
                    if (confirm(`¿Eliminar "${item.title}"?`)) {
                      deleteProduct(item.id);
                    }
                  }}
                  className="p-2 rounded-xl bg-zinc-800 hover:bg-red-950 text-zinc-400 hover:text-red-400 border border-zinc-700 transition"
                  title="Eliminar producto"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick Shipping Modal */}
      {showShippingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleSaveShipping}
            className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-800 p-5 space-y-4 text-xs shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Truck className="h-4 w-4 text-blue-400" />
                Configurar Tarifas de Envío
              </h3>
              <button
                type="button"
                onClick={() => setShowShippingModal(false)}
                className="rounded-full p-1 text-zinc-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-zinc-300">
                Costo de Envío Fijo ($)
              </label>
              <input
                type="number"
                min="0"
                value={tempShippingCost}
                onChange={(e) => setTempShippingCost(e.target.value)}
                placeholder="Ej: 4900 (o 0 para gratis)"
                className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-sm font-bold text-emerald-400 outline-none focus:border-blue-500"
              />
              <p className="text-[11px] text-zinc-400 mt-1">
                Es el costo que se cobra en checkout al elegir "Envío a Domicilio".
              </p>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-zinc-300">
                Monto Mínimo para Envío Gratis ($)
              </label>
              <input
                type="number"
                min="0"
                value={tempFreeThreshold}
                onChange={(e) => setTempFreeThreshold(e.target.value)}
                placeholder="Ej: 38000 (Dejar vacío si no aplica)"
                className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-sm font-bold text-zinc-200 outline-none focus:border-blue-500"
              />
              <p className="text-[11px] text-zinc-400 mt-1">
                Si el carrito supera este valor, el envío pasa a ser $0 automáticamente.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setShowShippingModal(false)}
                className="px-4 py-2 rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-300 font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow"
              >
                Guardar Tarifas
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CSV Import Modal */}
      {showCsvModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-800 p-5 space-y-4 text-xs shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
                Importar Productos masivamente (Excel / CSV)
              </h3>
              <button
                onClick={() => setShowCsvModal(false)}
                className="rounded-full p-1 text-zinc-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-zinc-400 leading-relaxed text-[11px]">
              Pegá el contenido copiado de un Excel o cargá un archivo .csv con
              las columnas estándar.
            </p>

            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="inline-flex items-center gap-1.5 text-amber-400 hover:underline text-[11px] font-semibold"
              >
                <Download className="h-3.5 w-3.5" />
                Descargar plantilla de ejemplo .csv
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
