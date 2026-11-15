import React, { useState } from 'react';
import { useAdmin } from '../AdminContext';
import { Download, Copy, CheckCircle2, FileJson, AlertTriangle } from 'lucide-react';

export const ExportSyncTab: React.FC = () => {
  const { tenant, resetToOriginal } = useAdmin();
  const [copied, setCopied] = useState(false);

  const jsonString = JSON.stringify(tenant, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tenant.slug}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    if (
      confirm(
        '¿Restablecer esta tienda a sus valores originales de fábrica? Se perderán los cambios locales no descargados.'
      )
    ) {
      resetToOriginal();
      alert('Valores restablecidos.');
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <FileJson className="h-5 w-5 text-amber-400" />
          Sincronización & Exportación de Configuración
        </h2>
        <p className="text-xs text-zinc-400 mt-0.5">
          Tus cambios se guardan automáticamente en tu navegador. Podés descargar el archivo final para tu repositorio o subirlo a producción.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={handleDownload}
          className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition shadow-lg"
        >
          <Download className="h-4 w-4" />
          <span>Descargar {tenant.slug}.json</span>
        </button>

        <button
          onClick={handleCopy}
          className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-bold text-xs transition border border-zinc-700"
        >
          {copied ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>¡JSON Copiado al Portapapeles!</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              <span>Copiar JSON Completo</span>
            </>
          )}
        </button>
      </div>

      {/* Code preview block */}
      <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-850 text-xs font-mono text-zinc-400">
          <span>Vista previa del Schema ({tenant.slug}.json)</span>
          <span>{tenant.items.length} productos</span>
        </div>
        <pre className="max-h-64 overflow-y-auto text-[11px] font-mono text-zinc-300 leading-relaxed no-scrollbar">
          {jsonString}
        </pre>
      </div>

      {/* Danger Zone: Factory Reset */}
      <div className="pt-4 border-t border-zinc-850">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-red-500/20 bg-red-500/5">
          <div>
            <h4 className="text-xs font-bold text-red-400 flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5" />
              Restablecer a valores de fábrica
            </h4>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Borra las modificaciones locales y recarga el archivo JSON base.
            </p>
          </div>
          <button
            onClick={handleReset}
            className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold transition shrink-0"
          >
            Restablecer
          </button>
        </div>
      </div>
    </div>
  );
};
