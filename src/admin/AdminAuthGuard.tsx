import React, { useState } from 'react';
import { Lock, ShieldCheck } from 'lucide-react';

interface AdminAuthGuardProps {
  correctPin: string;
  brandName: string;
  onAuthenticated: () => void;
}

export const AdminAuthGuard: React.FC<AdminAuthGuardProps> = ({
  correctPin,
  brandName,
  onAuthenticated,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleKeyPress = (num: string) => {
    if (pin.length < 6) {
      const nextPin = pin + num;
      setPin(nextPin);
      setError(false);
      if (nextPin === correctPin) {
        onAuthenticated();
      } else if (nextPin.length === correctPin.length) {
        setError(true);
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  const handleBypass = () => {
    onAuthenticated();
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-4 selection:bg-amber-500">
      <div className="w-full max-w-sm flex flex-col items-center text-center space-y-6">
        <div className="h-16 w-16 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-xl">
          <Lock className="h-7 w-7 text-amber-500" />
        </div>

        <div>
          <h1 className="text-2xl font-black tracking-tight">{brandName}</h1>
          <p className="text-xs text-zinc-400 mt-1">Panel de Control & Catálogo</p>
        </div>

        {/* PIN Indicators */}
        <div className="flex gap-3 my-2">
          {Array.from({ length: Math.max(4, correctPin.length) }).map((_, i) => (
            <div
              key={i}
              className={`h-3.5 w-3.5 rounded-full transition-all duration-200 ${
                i < pin.length
                  ? error
                    ? 'bg-red-500 scale-110'
                    : 'bg-amber-500 scale-110'
                  : 'bg-zinc-800 border border-zinc-700'
              }`}
            />
          ))}
        </div>

        {error && (
          <p className="text-xs text-red-400 font-semibold animate-shake">
            PIN incorrecto. Reintentá o ingresá el PIN de demostración.
          </p>
        )}

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-[280px]">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleKeyPress(digit)}
              className="h-16 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xl font-bold transition active:scale-95"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={handleBypass}
            className="h-16 rounded-2xl text-[11px] font-bold text-zinc-500 hover:text-zinc-300 transition"
          >
            Demo
          </button>
          <button
            type="button"
            onClick={() => handleKeyPress('0')}
            className="h-16 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xl font-bold transition active:scale-95"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="h-16 rounded-2xl bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 text-sm font-semibold transition active:scale-95 text-zinc-400"
          >
            Borrar
          </button>
        </div>

        <div className="pt-4 text-center">
          <p className="text-[11px] text-zinc-500 flex items-center justify-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            Acceso seguro · PIN de prueba predeterminado: <strong className="text-zinc-300">{correctPin}</strong>
          </p>
        </div>
      </div>
    </div>
  );
};
