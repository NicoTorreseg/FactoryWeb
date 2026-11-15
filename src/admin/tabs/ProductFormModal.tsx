import React, { useState } from 'react';
import { CatalogItem, Category } from '../../domain/tenant.schema';
import { X } from 'lucide-react';

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

          <div>
            <label className="block font-semibold mb-1 text-zinc-300">URL de Imagen</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="flex-1 rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 outline-none focus:border-amber-500 text-xs"
              />
              <img
                src={imageUrl}
                alt="Preview"
                className="h-10 w-10 rounded-lg object-cover border border-zinc-800 shrink-0"
              />
            </div>
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
