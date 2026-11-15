import React, { useRef, useState } from 'react';
import { CatalogItem, Category } from '../../domain/tenant.schema';
import { CheckCircle2, Image as ImageIcon, Sparkles, Upload, X } from 'lucide-react';
import { optimizeImageFile, OptimizedImageResult } from '../importer/image-optimizer';

interface ProductFormModalProps {
  item?: CatalogItem | null;
  categories: Category[];
  currencySymbol: string;
  onSave: (item: CatalogItem) => void;
  onClose: () => void;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  item,
  categories,
  currencySymbol,
  onSave,
  onClose,
}) => {
  const isEditing = !!item;

  const [title, setTitle] = useState(item?.title || '');
  const [description, setDescription] = useState(item?.description || '');
  const [price, setPrice] = useState(item?.price?.toString() || '');
  const [comparePrice, setComparePrice] = useState(
    item?.compareAtPlatformPrice?.toString() || ''
  );
  const [categoryId, setCategoryId] = useState(
    item?.categoryId || categories[0]?.id || 'general'
  );
  const [imageUrl, setImageUrl] = useState(
    item?.images?.[0] || 'https://images.unsplash.com/photo-1546549032-9571cd6b27df?auto=format&fit=crop&w=900&q=80'
  );
  const [badge, setBadge] = useState(item?.badge || '');
  const [sku] = useState(item?.sku || '');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [optimizedStats, setOptimizedStats] = useState<OptimizedImageResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessingImage(true);
      const result = await optimizeImageFile(file, 1000, 0.82);
      setImageUrl(result.dataUrl);
      setOptimizedStats(result);
    } catch (err) {
      console.error('Error optimizando imagen:', err);
      alert('No se pudo procesar la imagen. Verifica que sea un archivo JPG, PNG o WebP.');
    } finally {
      setIsProcessingImage(false);
      // Reset input value to allow re-uploading the same file if desired
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedPrice = parseInt(price.replace(/[^0-9]/g, ''), 10) || 1000;
    const parsedCompare = comparePrice
      ? parseInt(comparePrice.replace(/[^0-9]/g, ''), 10)
      : undefined;

    const payload: CatalogItem = {
      id: item?.id || `p-${Date.now().toString(36)}`,
      sku: sku.trim() || undefined,
      title: title.trim() || 'Nuevo Producto',
      description: description.trim() || 'Sin descripción detallada.',
      categoryId: categoryId || 'general',
      price: parsedPrice,
      compareAtPlatformPrice:
        parsedCompare && parsedCompare > parsedPrice ? parsedCompare : undefined,
      images: [imageUrl.trim()],
      badge: badge.trim() || undefined,
      featured: item?.featured ?? false,
      inStock: item?.inStock ?? true,
      stockLabel: item?.stockLabel ?? 'En stock',
      variants: item?.variants ?? [],
    };

    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-zinc-900 border border-zinc-800 text-zinc-100 p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <h2 className="text-lg font-bold">
            {isEditing ? 'Editar Producto' : 'Crear Nuevo Producto'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs">
          <div>
            <label className="block font-semibold mb-1 text-zinc-300">
              Título del Producto / Plato *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Tagliolini al Tartufo Nero"
              className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 outline-none focus:border-amber-500 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1 text-zinc-300">
                Precio Web Directo ({currencySymbol}) *
              </label>
              <input
                type="text"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Ej: 18500"
                className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 outline-none focus:border-amber-500 font-bold text-sm text-emerald-400"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-zinc-300">
                Precio MeLi / Apps (Opcional)
              </label>
              <input
                type="text"
                value={comparePrice}
                onChange={(e) => setComparePrice(e.target.value)}
                placeholder="Ej: 24500 (Para mostrar el ahorro)"
                className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 outline-none focus:border-amber-500 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1 text-zinc-300">Categoría</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 outline-none focus:border-amber-500 text-xs"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1 text-zinc-300">Distintivo / Badge</label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="Ej: Recomendado / -20%"
                className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 outline-none focus:border-amber-500 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1 text-zinc-300">Descripción</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalle de ingredientes, elaboración, medidas o características..."
              className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-3 outline-none focus:border-amber-500 text-xs leading-relaxed"
            />
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-zinc-300">
                Imagen del Producto
              </label>
              <span className="text-[10px] text-zinc-400 font-medium">
                Recomendado: 800×800 px (1:1) o 4:3
              </span>
            </div>

            {/* Direct Upload Button (Mobile camera / gallery / PC) */}
            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png,image/jpeg,image/webp,image/avif"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessingImage}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/15 py-2.5 px-4 text-xs font-bold text-amber-400 transition"
              >
                {isProcessingImage ? (
                  <>
                    <Sparkles className="h-4 w-4 animate-spin text-amber-400" />
                    <span>Comprimiendo y optimizando para web...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    <span>Subir foto desde este dispositivo / celular</span>
                  </>
                )}
              </button>
            </div>

            {/* Optimization Status Badge */}
            {optimizedStats && (
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2.5 py-1">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                <span>
                  Foto optimizada: {optimizedStats.originalSizeKb} KB ➔ {optimizedStats.sizeKb} KB ({optimizedStats.width}×{optimizedStats.height}px)
                </span>
              </div>
            )}

            {/* URL input fallback */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-zinc-400">O pegar enlace directo de imagen (URL):</span>
              </div>
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setOptimizedStats(null);
                  }}
                  placeholder="https://images.unsplash.com/... o https://http2.mlstatic.com/..."
                  className="flex-1 rounded-xl bg-zinc-900 border border-zinc-800 px-3.5 py-2 outline-none focus:border-amber-500 text-xs text-zinc-200"
                />
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="h-10 w-10 rounded-lg object-cover border border-zinc-700 shrink-0 bg-zinc-900"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-lg border border-zinc-800 bg-zinc-900 flex items-center justify-center shrink-0 text-zinc-600">
                    <ImageIcon className="h-4 w-4" />
                  </div>
                )}
              </div>
            </div>

            <p className="text-[10px] text-zinc-400 leading-tight">
              💡 Si subís una foto pesada tomada con la cámara del celular (10-15 MB), el navegador la redimensiona automáticamente a 800-1000px y la comprime a WebP para que cargue al instante en conexiones móviles.
            </p>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl py-3 border border-zinc-800 font-bold hover:bg-zinc-800 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl py-3 bg-amber-500 hover:bg-amber-400 font-bold text-zinc-950 transition shadow-lg"
            >
              {isEditing ? 'Guardar Cambios' : 'Crear Producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
