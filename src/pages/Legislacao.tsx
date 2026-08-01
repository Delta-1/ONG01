import { SectionTitle } from '../components/ui'
import { useLegislacao } from '../hooks/useData'

const CORES = {
  Federal: 'bg-forest-100 text-forest-700',
  Estadual: 'bg-river-100 text-river-700',
  Municipal: 'bg-sun-500/20 text-sun-600',
}

export default function Legislacao() {
  const legislacao = useLegislacao()
  return (
    <div className="container-page py-10 sm:py-14">
      <SectionTitle
        eyebrow="Central de legislação"
        title="Leis e princípios de defesa da sociobiodiversidade"
        desc="Reunimos o marco legal que sustenta a bioeconomia e protege os povos e a floresta do Acre."
      />
      <div className="mt-10 space-y-4">
        {[...legislacao].sort((a, b) => b.ano - a.ano).map((l) => (
          <div key={l.id} className="card flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-600 ${CORES[l.esfera]}`}>
                  {l.esfera}
                </span>
                <span className="text-xs text-forest-400">{l.ano}</span>
              </div>
              <h2 className="mt-2 font-display text-lg font-700 text-forest-800">{l.titulo}</h2>
              <p className="mt-1 text-sm text-forest-600">{l.descricao}</p>
            </div>
            <button className="btn-ghost shrink-0">Ver documento</button>
          </div>
        ))}
      </div>
    </div>
  )
}
