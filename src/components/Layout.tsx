/*
 * ____  ____      _    ____ ___ _
 * | __ )|  _ \    / \  / ___|_ _| |
 * |  _ \| |_) |  / _ \ \___ \| || |
 * | |_) |  _ <  / ___ \ ___) | || |___
 * |____/|_| \_\/_/   \_\____/___|_____|
 *
 *  Observatório Acriano da Sócio-bioeconomia
 *  Feito no Acre, com raízes na floresta.  🌱🇧🇷
 */
import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import LogoPlaceholder from './LogoPlaceholder'
import { LeafMark } from './Leaf'
import { useAuth } from '../contexts/AuthContext'

const NAV = [
  { to: '/', label: 'Início', end: true },
  { to: '/observatorio', label: 'Observatório' },
  { to: '/vitrine', label: 'Vitrine' },
  { to: '/noticias', label: 'Notícias' },
  { to: '/legislacao', label: 'Legislação' },
  { to: '/sobre', label: 'Sobre' },
]

function InstagramIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}
function YoutubeIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
      <path d="M10 9.5l5 2.5-5 2.5v-5Z" fill="currentColor" stroke="none" />
    </svg>
  )
}

/** Gif pequeno da marca no rodapé (com fallback se o arquivo não existir). */
function MarcaBrasil() {
  const [ok, setOk] = useState(true)
  const src = `${import.meta.env.BASE_URL}marca-brasil.gif`
  if (!ok)
    return (
      <span className="rounded-sm border border-dashed border-forest-600 px-2 py-1 text-[9px] uppercase tracking-widest text-forest-300">
        marca-brasil.gif
      </span>
    )
  return (
    <img
      src={src}
      alt="Brasil"
      onError={() => setOk(false)}
      className="mx-auto block h-16 w-auto max-w-full object-contain opacity-90 sm:h-20"
    />
  )
}

export default function Layout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen flex-col">
      {/* Barra utilitária superior (estilo institucional) */}
      <div className="bg-forest-950 text-forest-100">
        <div className="container-page flex h-9 items-center justify-between text-[12px]">
          <span className="hidden items-center gap-2 sm:flex">
            <LeafMark className="h-3.5 w-3.5 text-forest-400" />
            Estado do Acre · Amazônia
          </span>
          <div className="flex items-center gap-4">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-white">
              <InstagramIcon className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Instagram</span>
            </a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-white">
              <YoutubeIcon className="h-3.5 w-3.5" /> <span className="hidden sm:inline">YouTube</span>
            </a>
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to={profile?.role === 'admin' ? '/admin' : '/painel'}
                  className="hover:text-white"
                >
                  {profile?.role === 'admin' ? 'Admin' : 'Meu painel'}
                </Link>
                <button
                  onClick={async () => { await signOut(); navigate('/') }}
                  className="hover:text-white"
                >
                  Sair
                </button>
              </div>
            ) : (
              <Link to="/entrar" className="hover:text-white">
                Entrar
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Cabeçalho principal */}
      <header className="sticky top-0 z-40 border-b border-forest-200 bg-paper/90 backdrop-blur">
        <div className="container-page flex h-20 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3">
            <LogoPlaceholder />
            <span className="leading-tight">
              <span className="block font-display text-lg font-700 text-ink sm:text-xl">
                Observatório Acriano
              </span>
              <span className="eyebrow block">da Sócio-bioeconomia</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-6 lg:flex">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `border-b-2 py-1 text-sm font-medium transition ${
                    isActive
                      ? 'border-sun-500 text-ink'
                      : 'border-transparent text-forest-700 hover:border-forest-300 hover:text-ink'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-2 xl:flex">
            <Link to="/cadastro" className="btn-primary">
              Cadastre seu negócio
            </Link>
          </div>

          <button
            className="grid h-10 w-10 place-items-center rounded-sm border border-forest-300 text-forest-800 lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Abrir menu"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              {open ? <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" /> : <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />}
            </svg>
          </button>
        </div>

        {open && (
          <div className="border-t border-forest-100 bg-paper lg:hidden">
            <div className="container-page flex flex-col gap-1 py-3">
              {NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `rounded-sm px-3 py-2.5 text-sm font-medium ${
                      isActive ? 'bg-forest-100 text-ink' : 'text-forest-700'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              <Link to="/cadastro" className="btn-primary mt-2" onClick={() => setOpen(false)}>
                Cadastre seu negócio
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      {/* Rodapé */}
      <footer className="mt-20 border-t-4 border-sun-500 bg-forest-950 text-forest-100">
        <div className="container-page grid gap-8 py-14 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 text-white">
              <LogoPlaceholder variant="light" />
              <span className="font-display text-lg font-700">Observatório Acriano</span>
            </div>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-forest-200">
              Plataforma pública de dados, legislação e valorização dos empreendimentos da
              sociobiodiversidade e da bioeconomia do estado do Acre.
            </p>
            <p className="mt-4 text-xs text-forest-400">
              Protótipo em desenvolvimento · dados de demonstração fictícios.
            </p>
          </div>
          <div>
            <h4 className="eyebrow !text-forest-300">Navegação</h4>
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
            <h4 className="eyebrow !text-forest-300">Participe</h4>
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

        {/* Barra de contatos / créditos */}
        <div className="border-t border-forest-800">
          <div className="container-page flex flex-col items-center justify-between gap-4 py-5 text-xs text-forest-400 sm:flex-row">
            <span>© {new Date().getFullYear()} Observatório Acriano da Sócio-bioeconomia.</span>
            <div className="flex items-center gap-4">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-white">
                <InstagramIcon /> Instagram
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-white">
                <YoutubeIcon /> YouTube
              </a>
            </div>
          </div>

          {/* Marca Brasil — linha própria, centralizada, nunca ultrapassa a tela */}
          <div className="container-page flex justify-center pb-6">
            <MarcaBrasil />
          </div>
        </div>
      </footer>
    </div>
  )
}
