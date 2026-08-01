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
          <p className="text-xs font-medium uppercase tracking-wide text-forest-400">{label}</p>
          <p className="mt-1 font-display text-2xl font-700 text-forest-800">{value}</p>
          {sub && <p className="mt-0.5 text-xs text-forest-500">{sub}</p>}
        </div>
        {icon && (
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-forest-100 text-forest-600">
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
      {eyebrow && (
        <p className="mb-2 text-xs font-600 uppercase tracking-widest text-forest-500">{eyebrow}</p>
      )}
      <h2 className="font-display text-2xl font-700 text-forest-900 sm:text-3xl">{title}</h2>
      {desc && <p className="mt-3 text-forest-600">{desc}</p>}
    </div>
  )
}
