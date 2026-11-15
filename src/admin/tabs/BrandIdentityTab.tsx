import React, { useState } from 'react';
import { useAdmin } from '../AdminContext';
import { Store, CheckCircle2 } from 'lucide-react';

export const BrandIdentityTab: React.FC = () => {
  const { tenant, updateTenant } = useAdmin();
  const [savedNotice, setSavedNotice] = useState(false);

  const [name, setName] = useState(tenant.brand.name);
  const [tagline, setTagline] = useState(tenant.brand.tagline);
  const [heroHeadline, setHeroHeadline] = useState(tenant.brand.heroHeadline);
  const [heroSubheadline, setHeroSubheadline] = useState(
    tenant.brand.heroSubheadline
  );
  const [locationLabel, setLocationLabel] = useState(
    tenant.brand.locationLabel
  );
  const [scheduleLabel, setScheduleLabel] = useState(
    tenant.brand.scheduleLabel
  );
  const [isOpenNow, setIsOpenNow] = useState(tenant.brand.isOpenNow);
  const [instagram, setInstagram] = useState(
    tenant.brand.instagramHandle || ''
  );
  const [preset, setPreset] = useState(tenant.theme.preset);
  const [mode, setMode] = useState(tenant.theme.mode);
  const [allowModeToggle, setAllowModeToggle] = useState(
    tenant.theme.allowModeToggle
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateTenant((prev) => ({
      ...prev,
      brand: {
        ...prev.brand,
        name: name.trim(),
        tagline: tagline.trim(),
        heroHeadline: heroHeadline.trim(),
        heroSubheadline: heroSubheadline.trim(),
        locationLabel: locationLabel.trim(),
        scheduleLabel: scheduleLabel.trim(),
        isOpenNow,
        instagramHandle: instagram.trim() || undefined,
      },
      theme: {
        ...prev.theme,
        preset,
        mode,
        allowModeToggle,
      },
    }));
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
      <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Store className="h-5 w-5 text-amber-400" />
          Identidad del Negocio & Diseño
        </h2>
        <p className="text-xs text-zinc-400 mt-0.5">
          Modificá el nombre, estado del local (abierto/cerrado), titulares y estética.
        </p>
      </div>

      {savedNotice && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
          <CheckCircle2 className="h-4 w-4" />
          <span>¡Identidad y estética actualizadas con éxito!</span>
        </div>
      )}

      <div className="space-y-4 bg-zinc-900/60 border border-zinc-800 p-5 rounded-2xl text-xs">
        {/* Open / Closed Toggle */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-950 border border-zinc-800">
          <div>
            <span className="font-bold text-white text-sm block">
              Estado de Cocina / Local
            </span>
            <span className="text-[11px] text-zinc-400">
              Muestra la luz verde pulsante o roja en la portada de la web.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsOpenNow(!isOpenNow)}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition ${
              isOpenNow
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}
          >
            {isOpenNow ? '🟢 Abierto Ahora' : '🔴 Cerrado'}
          </button>
        </div>

        <div>
          <label className="block font-semibold mb-1 text-zinc-300">
            Nombre Comercial del Negocio *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-sm text-white font-bold outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1 text-zinc-300">
            Lema / Frase Corta (Tagline)
          </label>
          <input
            type="text"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-xs text-zinc-200 outline-none focus:border-amber-500 font-serif"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1 text-zinc-300">
            Usuario de Instagram (ej: @pastacomedia)
          </label>
          <input
            type="text"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-xs text-zinc-200 outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1 text-zinc-300">
            Titular Principal (Hero Headline) — Usá *palabra* para resaltar en cursiva
          </label>
          <input
            type="text"
            required
            value={heroHeadline}
            onChange={(e) => setHeroHeadline(e.target.value)}
            className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-sm text-zinc-200 outline-none focus:border-amber-500 font-serif"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1 text-zinc-300">
            Subtítulo Explicativo (Propuesta de Ahorro / Oficio)
          </label>
          <textarea
            rows={3}
            value={heroSubheadline}
            onChange={(e) => setHeroSubheadline(e.target.value)}
            className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-xs text-zinc-300 outline-none focus:border-amber-500 leading-relaxed"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div>
            <label className="block font-semibold mb-1 text-zinc-300">Ubicación / Zona</label>
            <input
              type="text"
              value={locationLabel}
              onChange={(e) => setLocationLabel(e.target.value)}
              className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-xs text-zinc-200 outline-none"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1 text-zinc-300">Horarios de Atención</label>
            <input
              type="text"
              value={scheduleLabel}
              onChange={(e) => setScheduleLabel(e.target.value)}
              className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-xs text-zinc-200 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-zinc-800">
          <div>
            <label className="block font-semibold mb-1 text-zinc-300">Estilo Visual (Preset)</label>
            <select
              value={preset}
              onChange={(e) => setPreset(e.target.value as 'modern' | 'editorial')}
              className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-zinc-200 outline-none"
            >
              <option value="editorial">Editorial (Serif + Cálido)</option>
              <option value="modern">Modern (Sans-Serif / Clean)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1 text-zinc-300">Modo Inicial</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as 'light' | 'dark')}
              className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-zinc-200 outline-none"
            >
              <option value="light">Modo Claro (Día)</option>
              <option value="dark">Modo Oscuro (Noche)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1 text-zinc-300">Botón Sol/Luna</label>
            <select
              value={allowModeToggle ? 'yes' : 'no'}
              onChange={(e) => setAllowModeToggle(e.target.value === 'yes')}
              className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-zinc-200 outline-none"
            >
              <option value="yes">Habilitado para clientes</option>
              <option value="no">Fijo (Ocultar botón)</option>
            </select>
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 font-bold text-zinc-950 text-xs transition shadow-lg"
      >
        Guardar Identidad
      </button>
    </form>
  );
};
