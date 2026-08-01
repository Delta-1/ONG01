/** Fundo orgânico animado — folhas, cipós e rios estilizados (identidade da floresta). */
export default function OrganicBg() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" viewBox="0 0 800 600">
        <defs>
          <radialGradient id="glow" cx="30%" cy="20%" r="80%">
            <stop offset="0%" stopColor="#57a56d" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#0a2015" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="800" height="600" fill="url(#glow)" />
        {/* rios sinuosos */}
        <path
          className="animate-drift-slow"
          d="M-50 120 C 150 80, 250 220, 450 180 S 780 260, 900 200"
          fill="none"
          stroke="#38b8c2"
          strokeWidth="2.5"
          strokeOpacity="0.25"
        />
        <path
          className="animate-drift-slow"
          style={{ animationDelay: '3s' }}
          d="M-50 460 C 180 500, 300 360, 520 420 S 760 380, 900 440"
          fill="none"
          stroke="#38b8c2"
          strokeWidth="2"
          strokeOpacity="0.2"
        />
        {/* folhas flutuantes */}
        {[
          { x: 120, y: 420, s: 1.4, d: '0s' },
          { x: 640, y: 130, s: 1.1, d: '1.5s' },
          { x: 520, y: 480, s: 0.9, d: '2.5s' },
          { x: 700, y: 360, s: 1.2, d: '0.8s' },
        ].map((l, i) => (
          <g key={i} className="animate-float" style={{ animationDelay: l.d }} transform={`translate(${l.x} ${l.y}) scale(${l.s})`}>
            <path d="M0 0 C 26 -8, 44 -30, 40 -56 C 14 -48, -4 -26, 0 0 Z" fill="#8bc499" fillOpacity="0.28" />
            <path d="M2 -4 C 12 -18, 24 -32, 36 -48" stroke="#dbeede" strokeWidth="1.2" strokeOpacity="0.4" fill="none" />
          </g>
        ))}
      </svg>
    </div>
  )
}
