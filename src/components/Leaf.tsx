/** Pequenos detalhes em folha para representar a natureza (decorativos). */

export function LeafMark({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true" fill="none">
      <path
        d="M28 4C14 4 6 12 6 24c0 2 .3 4 .3 4s10 .3 16-5.7C29 15.5 28 4 28 4Z"
        fill="currentColor"
      />
      <path
        d="M10 26C14 18 20 12 26 8"
        stroke="#fff"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity=".65"
      />
    </svg>
  )
}

/** Ramo/galho com folhas — usado como divisor decorativo. */
export function LeafBranch({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 40" className={className} aria-hidden="true" fill="none">
      <path d="M4 20h212" stroke="currentColor" strokeWidth="1" opacity=".3" />
      <g fill="currentColor">
        <path d="M110 20c0-8 6-14 14-15-1 9-6 14-14 15Z" opacity=".9" />
        <path d="M110 20c0-8-6-14-14-15 1 9 6 14 14 15Z" opacity=".6" />
      </g>
    </svg>
  )
}

/** Folha isolada que balança suavemente (canto decorativo). */
export function FloatingLeaf({
  className = '',
  style,
}: {
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <svg viewBox="0 0 60 60" className={className} style={style} aria-hidden="true">
      <path d="M6 54C10 30 26 12 54 6c-4 26-22 44-48 48Z" fill="currentColor" />
      <path
        d="M14 46C22 32 34 20 48 12"
        stroke="#ffffff"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity=".4"
        fill="none"
      />
    </svg>
  )
}
