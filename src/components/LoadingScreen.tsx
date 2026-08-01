import { useState } from 'react'

/**
 * Tela de carregamento: fundo escuro/borrado + o gif da marca "BRASIL" ao centro.
 *
 * O arquivo esperado é `public/marca-brasil.gif`. Enquanto ele não existir,
 * cai num marcador elegante (sem quebrar o layout).
 */
export default function LoadingScreen({ label = 'Carregando…' }: { label?: string }) {
  const [imgOk, setImgOk] = useState(true)
  const src = `${import.meta.env.BASE_URL}marca-brasil.gif`

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-forest-950/70 backdrop-blur-md animate-fade-in"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-4">
        {imgOk ? (
          <img
            src={src}
            alt="Carregando"
            onError={() => setImgOk(false)}
            className="h-24 w-auto drop-shadow-lg sm:h-32"
          />
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            <span className="rounded-sm border border-dashed border-white/40 px-3 py-1 text-xs uppercase tracking-widest text-white/80">
              marca-brasil.gif
            </span>
          </div>
        )}
        <span className="text-sm font-medium tracking-wide text-white/85">{label}</span>
      </div>
    </div>
  )
}
