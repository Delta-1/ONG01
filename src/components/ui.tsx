import type { ReactNode } from 'react'

export function StatCard({
  label,
  value,
  sub,
  icon,
}: {
  label: string
  value: string
  sub?: string
  icon?: ReactNode
}) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow">{label}</p>
          <p className="mt-1.5 font-display text-2xl font-700 text-ink">{value}</p>
          {sub && <p className="mt-0.5 text-xs text-forest-500">{sub}</p>}
        </div>
        {icon && (
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-sm bg-forest-100 text-forest-600">
            {icon}
          </span>
        )}
      </div>
    </div>
  )
}

export function SectionTitle({
  eyebrow,
  title,
  desc,
  center,
}: {
  eyebrow?: string
  title: string
  desc?: string
  center?: boolean
}) {
  return (
    <div className={center ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
      <h2 className="font-display text-2xl font-700 leading-tight text-ink sm:text-[2rem]">{title}</h2>
      <div className={`mt-3 ${center ? 'mx-auto' : ''} rule`} />
      {desc && <p className="mt-4 leading-relaxed text-forest-700">{desc}</p>}
    </div>
  )
}
