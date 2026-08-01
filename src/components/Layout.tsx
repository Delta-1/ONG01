import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import type { ReactNode } from 'react'

const NAV = [
  { to: '/', label: 'Início', end: true },
  { to: '/observatorio', label: 'Observatório' },
  { to: '/vitrine', label: 'Vitrine' },
  { to: '/noticias', label: 'Notícias' },
  { to: '/legislacao', label: 'Legislação' },
  { to: '/sobre', label: 'Sobre' },
]

function Leaf() {
  return (
    <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden="true">
      <path
        d="M28 4C14 4 6 12 6 24c0 2 .3 4 .3 4s10 .3 16-5.7C29 15.5 28 4 28 4Z"
        fill="currentColor"
      />
      <path
        d="M10 26C14 18 20 12 26 8"
        stroke="#fff"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
        opacity=".7"
      />
    </svg>
  )
}

export default function Layout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-forest-100 bg-forest-50/85 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 text-forest-700">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-forest-600 text-white">
              <Leaf />
            </span>
            <span className="leading-tight">
              <span className="block font-display text-sm font-700 text-forest-800 sm:text-base">
                Observatório Acriano
              </span>
              <span className="block text-[11px] font-medium text-forest-500">
                da Sócio-bioeconomia
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `rounded-full px-3.5 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'bg-forest-100 text-forest-800'
                      : 'text-forest-600 hover:bg-forest-100/60 hover:text-forest-800'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <Link to="/entrar" className="btn-ghost">
              Entrar
            </Link>
            <Link to="/cadastro" className="btn-primary">
              Cadastre seu negócio
            </Link>
          </div>

          <button
            className="grid h-10 w-10 place-items-center rounded-lg border border-forest-200 text-forest-700 lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Abrir menu"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>

        {open && (
          <div className="border-t border-forest-100 bg-forest-50 lg:hidden">
            <div className="container-page flex flex-col gap-1 py-3">
              {NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2.5 text-sm font-medium ${
                      isActive ? 'bg-forest-100 text-forest-800' : 'text-forest-600'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              <div className="mt-2 flex gap-2">
                <Link to="/entrar" className="btn-ghost flex-1" onClick={() => setOpen(false)}>
                  Entrar
                </Link>
                <Link to="/cadastro" className="btn-primary flex-1" onClick={() => setOpen(false)}>
                  Cadastrar
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="mt-16 border-t border-forest-100 bg-forest-900 text-forest-100">
        <div className="container-page grid gap-8 py-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 text-white">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-forest-600">
                <Leaf />
              </span>
              <span className="font-display text-lg font-700">Observatório Acriano</span>
            </div>
            <p className="mt-4 max-w-md text-sm text-forest-200">
              Plataforma pública de dados, legislação e valorização dos empreendimentos da
              sociobiodiversidade e da bioeconomia do estado do Acre.
            </p>
            <p className="mt-4 text-xs text-forest-400">
              Protótipo em desenvolvimento · dados de demonstração fictícios.
            </p>
          </div>
          <div>
            <h4 className="font-display text-sm font-600 text-white">Navegação</h4>
            <ul className="mt-3 space-y-2 text-sm text-forest-200">
              {NAV.map((i) => (
                <li key={i.to}>
                  <Link to={i.to} className="hover:text-white">
                    {i.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-display text-sm font-600 text-white">Participe</h4>
            <ul className="mt-3 space-y-2 text-sm text-forest-200">
              <li>
                <Link to="/cadastro" className="hover:text-white">
                  Cadastre seu empreendimento
                </Link>
              </li>
              <li>
                <Link to="/entrar" className="hover:text-white">
                  Área do administrador
                </Link>
              </li>
              <li>
                <Link to="/observatorio" className="hover:text-white">
                  Explorar o dashboard
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-forest-800">
          <div className="container-page py-5 text-xs text-forest-400">
            © {new Date().getFullYear()} Observatório Acriano da Sócio-bioeconomia. Todos os direitos
            reservados.
          </div>
        </div>
      </footer>
    </div>
  )
}
