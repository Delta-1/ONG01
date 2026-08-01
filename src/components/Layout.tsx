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
import { useEstrutura } from '../lib/estruturas'

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

/* ============================ Peças compartilhadas ============================ */

function BrandLogo({ stacked = false }: { stacked?: boolean }) {
  return (
    <Link
      to="/"
      className={stacked ? 'flex flex-col items-center gap-2 text-center' : 'flex items-center gap-3'}
    >
      <LogoPlaceholder />
      <span className="leading-tight">
        <span className={`block font-display font-700 text-ink ${stacked ? 'text-xl' : 'text-lg sm:text-xl'}`}>
          Observatório Acriano
        </span>
        <span className="eyebrow block">da Sócio-bioeconomia</span>
      </span>
    </Link>
  )
}

function NavLinks({ vertical = false, onNavigate }: { vertical?: boolean; onNavigate?: () => void }) {
  return (
    <>
      {NAV.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            vertical
              ? `rounded-md px-3 py-2 text-sm font-medium transition ${
                  isActive ? 'bg-forest-100 text-ink' : 'text-forest-700 hover:bg-forest-50'
                }`
              : `border-b-2 py-1 text-sm font-medium transition ${
                  isActive
                    ? 'border-sun-500 text-ink'
                    : 'border-transparent text-forest-700 hover:border-forest-300 hover:text-ink'
                }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </>
  )
}

function AuthLinks({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const cls = tone === 'dark' ? 'hover:text-white' : 'text-forest-700 hover:text-ink'
  if (user)
    return (
      <div className="flex items-center gap-3">
        <Link to={profile?.role === 'admin' ? '/admin' : '/painel'} className={cls}>
          {profile?.role === 'admin' ? 'Admin' : 'Meu painel'}
        </Link>
        <button onClick={async () => { await signOut(); navigate('/') }} className={cls}>
          Sair
        </button>
      </div>
    )
  return (
    <Link to="/entrar" className={cls}>
      Entrar
    </Link>
  )
}

function UtilityBar() {
  return (
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
          <AuthLinks tone="dark" />
        </div>
      </div>
    </div>
  )
}

function HamburgerButton({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button
      className="grid h-10 w-10 place-items-center rounded-sm border border-forest-300 text-forest-800 lg:hidden"
      onClick={onClick}
      aria-label="Abrir menu"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
        {open ? <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" /> : <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />}
      </svg>
    </button>
  )
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null
  return (
    <div className="border-t border-forest-100 bg-paper lg:hidden">
      <div className="container-page flex flex-col gap-1 py-3">
        <NavLinks vertical onNavigate={onClose} />
        <Link to="/cadastro" className="btn-primary mt-2" onClick={onClose}>
          Cadastre seu negócio
        </Link>
      </div>
    </div>
  )
}

function SiteFooter() {
  return (
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
            <li><Link to="/cadastro" className="hover:text-white">Cadastre seu empreendimento</Link></li>
            <li><Link to="/entrar" className="hover:text-white">Área do administrador</Link></li>
            <li><Link to="/observatorio" className="hover:text-white">Explorar o dashboard</Link></li>
          </ul>
        </div>
      </div>

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
        <div className="container-page flex justify-center pb-6">
          <MarcaBrasil />
        </div>
      </div>
    </footer>
  )
}

/* ================================ Estruturas ================================ */

/** Clássica: barra utilitária + cabeçalho horizontal (logo à esquerda, menu à direita). */
function ShellClassica({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="flex min-h-screen flex-col">
      <UtilityBar />
      <header className="sticky top-0 z-40 border-b border-forest-200 bg-paper/90 backdrop-blur">
        <div className="container-page flex h-20 items-center justify-between gap-4">
          <BrandLogo />
          <nav className="hidden items-center gap-6 lg:flex">
            <NavLinks />
          </nav>
          <div className="hidden items-center gap-2 xl:flex">
            <Link to="/cadastro" className="btn-primary">Cadastre seu negócio</Link>
          </div>
          <HamburgerButton open={open} onClick={() => setOpen((v) => !v)} />
        </div>
        <MobileMenu open={open} onClose={() => setOpen(false)} />
      </header>
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  )
}

/** Central: logo e menu centralizados (ar editorial). */
function ShellCentral({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-forest-200 bg-paper/90 backdrop-blur">
        {/* Desktop centralizado */}
        <div className="container-page hidden flex-col items-center gap-3 py-4 lg:flex">
          <BrandLogo stacked />
          <nav className="flex items-center gap-7">
            <NavLinks />
            <Link to="/cadastro" className="btn-primary !py-1.5">Cadastre seu negócio</Link>
          </nav>
        </div>
        {/* Mobile em linha */}
        <div className="container-page flex h-16 items-center justify-between lg:hidden">
          <BrandLogo />
          <HamburgerButton open={open} onClick={() => setOpen((v) => !v)} />
        </div>
        <MobileMenu open={open} onClose={() => setOpen(false)} />
      </header>
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  )
}

/** Minimalista: barra fina e compacta, sem barra utilitária. */
function ShellMinimalista({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-forest-200 bg-paper/95 backdrop-blur">
        <div className="container-page flex h-14 items-center justify-between">
          <Link to="/" className="font-display text-base font-700 text-ink">
            Observatório Acriano
          </Link>
          <nav className="hidden items-center gap-5 lg:flex">
            <NavLinks />
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/cadastro" className="hidden text-sm font-600 text-forest-700 hover:text-ink sm:inline">
              Cadastrar →
            </Link>
            <HamburgerButton open={open} onClick={() => setOpen((v) => !v)} />
          </div>
        </div>
        <MobileMenu open={open} onClose={() => setOpen(false)} />
      </header>
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  )
}

/** Lateral: menu fixo na lateral esquerda (estilo painel). */
function ShellLateral({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="min-h-screen">
      {/* Sidebar fixa (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-forest-200 bg-paper p-5 lg:flex">
        <BrandLogo />
        <nav className="mt-8 flex flex-col gap-1">
          <NavLinks vertical />
        </nav>
        <Link to="/cadastro" className="btn-primary mt-4">Cadastre seu negócio</Link>
        <div className="mt-auto border-t border-forest-100 pt-4">
          <div className="text-sm">
            <AuthLinks tone="light" />
          </div>
          <div className="mt-3 flex items-center gap-4 text-forest-500">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-ink"><InstagramIcon /></a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" className="hover:text-ink"><YoutubeIcon /></a>
          </div>
        </div>
      </aside>

      {/* Conteúdo (deslocado à direita da sidebar no desktop) */}
      <div className="flex min-h-screen flex-col lg:pl-64">
        {/* Barra superior (mobile) */}
        <header className="sticky top-0 z-30 border-b border-forest-200 bg-paper/90 backdrop-blur lg:hidden">
          <div className="container-page flex h-16 items-center justify-between">
            <BrandLogo />
            <HamburgerButton open={open} onClick={() => setOpen((v) => !v)} />
          </div>
          <MobileMenu open={open} onClose={() => setOpen(false)} />
        </header>
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </div>
    </div>
  )
}

const SHELLS: Record<string, (p: { children: ReactNode }) => JSX.Element> = {
  classica: ShellClassica,
  lateral: ShellLateral,
  central: ShellCentral,
  minimalista: ShellMinimalista,
}

export default function Layout({ children }: { children: ReactNode }) {
  const estrutura = useEstrutura()
  const Shell = SHELLS[estrutura] ?? ShellClassica
  return <Shell>{children}</Shell>
}
