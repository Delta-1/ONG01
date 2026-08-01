import { SectionTitle } from '../components/ui'
import { useNoticias } from '../hooks/useData'
import { fmtData } from '../lib/format'

export default function Noticias() {
  const NOTICIAS = useNoticias()
  return (
    <div className="container-page py-10 sm:py-14">
      <SectionTitle
        eyebrow="Portal institucional"
        title="Notícias e atualizações"
        desc="Acompanhe as novidades do Observatório, das cadeias produtivas e das comunidades da floresta."
      />
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {NOTICIAS.map((n) => (
          <article key={n.id} className="card p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-600 uppercase tracking-wide text-river-600">{n.categoria}</span>
              <span className="text-xs text-forest-400">{fmtData(n.data)}</span>
            </div>
            <h2 className="mt-3 font-display text-lg font-700 text-forest-800">{n.titulo}</h2>
            <p className="mt-2 text-forest-600">{n.resumo}</p>
            <button className="mt-4 text-sm font-600 text-forest-600 hover:text-forest-800">
              Ler matéria →
            </button>
          </article>
        ))}
      </div>
    </div>
  )
}
