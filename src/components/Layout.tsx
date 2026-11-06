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
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import BrandSignature from "./BrandSignature";
import { BrandRibbon } from "./BrandArt";
import { useAuth } from "../contexts/AuthContext";
import { useEstrutura } from "../lib/estruturas";

const NAV = [
  { to: "/", label: "Início", end: true },
  { to: "/observatorio", label: "Observatório" },
  { to: "/vitrine", label: "Vitrine" },
  { to: "/noticias", label: "Notícias" },
  { to: "/legislacao", label: "Legislação" },
  { to: "/sobre", label: "Sobre" },
];

/** Gif pequeno da marca no rodapé (com fallback se o arquivo não existir). */
function MarcaBrasil() {
  const [ok, setOk] = useState(true);
  const src = `${import.meta.env.BASE_URL}marca-brasil.gif`;
  if (!ok)
    return (
      <span className="rounded-sm border border-dashed border-forest-600 px-2 py-1 text-[9px] uppercase tracking-widest text-forest-300">
        marca-brasil.gif
      </span>
    );
  return (
    <img
      src={src}
      alt="Brasil"
      onError={() => setOk(false)}
      className="mx-auto block h-16 w-auto max-w-full object-contain opacity-90 sm:h-20"
    />
  );
}

/* ============================ Peças compartilhadas ============================ */

function BrandLogo({ stacked = false }: { stacked?: boolean }) {
  return (
    <Link
      to="/"
      className={
        stacked
          ? "flex flex-col items-center gap-2 text-center"
          : "flex items-center gap-3"
      }
    >
      <BrandSignature />
      <span className="leading-tight">
        <span
          className={`block font-display font-700 text-ink ${stacked ? "text-xl" : "text-base sm:text-xl"}`}
        >
          Observatório Acriano
        </span>
        <span className="eyebrow block">da Sócio-bioeconomia</span>
      </span>
    </Link>
  );
}

function NavLinks({
  vertical = false,
  onNavigate,
}: {
  vertical?: boolean;
  onNavigate?: () => void;
}) {
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
                  isActive
                    ? "bg-forest-100 text-ink"
                    : "text-forest-700 hover:bg-forest-50"
                }`
              : `border-b-2 py-1 text-sm font-medium transition ${
                  isActive
                    ? "border-sun-500 text-ink"
                    : "border-transparent text-forest-700 hover:border-forest-300 hover:text-ink"
                }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </>
  );
}

function AuthLinks({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const cls =
    tone === "dark" ? "hover:text-white" : "text-forest-700 hover:text-ink";
  if (user)
    return (
      <div className="flex items-center gap-3">
        <Link
          to={profile?.role === "admin" ? "/admin/novo" : "/publicar"}
          className={cls}
        >
          Publicar
        </Link>
        <Link
          to={profile?.role === "admin" ? "/admin" : "/painel"}
          className={cls}
        >
          {profile?.role === "admin" ? "Admin" : "Meu painel"}
        </Link>
        <button
          onClick={async () => {
            await signOut();
            navigate("/");
          }}
          className={cls}
        >
          Sair
        </button>
      </div>
    );
  return (
    <Link to="/entrar" className={cls}>
      Entrar
    </Link>
  );
}

function UtilityBar() {
  return (
    <div className="bg-brand-green text-brand-cream">
      <div className="container-page flex min-h-9 items-center justify-between gap-4 py-2 text-[12px]">
        <span className="hidden sm:inline">
          Feito de floresta, pessoas e histórias.
        </span>
        <Link
          to="/cadastro"
          className="underline underline-offset-4 hover:text-brand-yellow"
        >
          Contribua com o mapeamento ↗
        </Link>
        <AuthLinks tone="dark" />
      </div>
    </div>
  );
}

function HamburgerButton({
  open,
  onClick,
}: {
  open: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className="grid h-10 w-10 place-items-center rounded-sm border border-forest-300 text-forest-800 lg:hidden"
      onClick={onClick}
      aria-label={open ? "Fechar menu" : "Abrir menu"}
      aria-expanded={open}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        {open ? (
          <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
        ) : (
          <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
        )}
      </svg>
    </button>
  );
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="border-t border-forest-100 bg-paper lg:hidden">
      <div className="container-page flex flex-col gap-1 py-3">
        <NavLinks vertical onNavigate={onClose} />
        <Link
          to="/cadastro"
          className="rounded-md px-3 py-2 text-sm font-medium text-forest-700"
          onClick={onClose}
        >
          Contribuir com dados
        </Link>
        <Link
          to="/entrar"
          className="rounded-md px-3 py-2 text-sm font-medium text-forest-700"
          onClick={onClose}
        >
          Entrar na minha conta
        </Link>
        <Link
          to="/cadastro"
          className="btn-primary mt-2"
          onClick={onClose}
        >
          Cadastre seu negócio
        </Link>
      </div>
    </div>
  );
}

function SiteFooter() {
  return (
    <footer className="mt-16 bg-forest-950 text-forest-100">
      <BrandRibbon />
      <div className="container-page grid gap-8 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 text-white">
            <BrandSignature variant="light" />
            <span className="font-display text-lg font-700">
              Observatório Acriano
            </span>
          </div>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-forest-200">
            Plataforma pública de dados, legislação e valorização dos
            empreendimentos da sociobiodiversidade e da bioeconomia do estado do
            Acre.
          </p>
          <p className="mt-4 text-xs text-forest-400">
            Cadastros reais, com publicações verificadas pela equipe.
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

      <div className="border-t border-forest-800">
        <div className="container-page flex flex-col items-center justify-between gap-4 py-5 text-xs text-forest-400 sm:flex-row">
          <span>
            © {new Date().getFullYear()} Observatório Acriano da
            Sócio-bioeconomia.
          </span>
          <Link
            to="/cadastro"
            className="text-forest-200 hover:text-white"
          >
            Contribua com o mapeamento ↗
          </Link>
        </div>
        <div className="container-page flex justify-center pb-6">
          <MarcaBrasil />
        </div>
      </div>
    </footer>
  );
}

/* ================================ Estruturas ================================ */

/** Clássica: barra utilitária + cabeçalho horizontal (logo à esquerda, menu à direita). */
function ShellClassica({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
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
            <Link to="/cadastro" className="btn-primary">
              Cadastre seu negócio
            </Link>
          </div>
          <HamburgerButton open={open} onClick={() => setOpen((v) => !v)} />
        </div>
        <MobileMenu open={open} onClose={() => setOpen(false)} />
      </header>
      <main id="conteudo" tabIndex={-1} className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}

/** Central: logo e menu centralizados (ar editorial). */
function ShellCentral({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-forest-200 bg-paper/90 backdrop-blur">
        {/* Desktop centralizado */}
        <div className="container-page hidden flex-col items-center gap-3 py-4 lg:flex">
          <BrandLogo stacked />
          <nav className="flex items-center gap-7">
            <NavLinks />
            <Link to="/cadastro" className="btn-primary !py-1.5">
              Cadastre seu negócio
            </Link>
          </nav>
        </div>
        {/* Mobile em linha */}
        <div className="container-page flex h-16 items-center justify-between lg:hidden">
          <BrandLogo />
          <HamburgerButton open={open} onClick={() => setOpen((v) => !v)} />
        </div>
        <MobileMenu open={open} onClose={() => setOpen(false)} />
      </header>
      <main id="conteudo" tabIndex={-1} className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}

/** Minimalista: barra fina e compacta, sem barra utilitária. */
function ShellMinimalista({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
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
            <Link
              to="/cadastro"
              className="hidden text-sm font-600 text-forest-700 hover:text-ink sm:inline"
            >
              Cadastrar →
            </Link>
            <HamburgerButton open={open} onClick={() => setOpen((v) => !v)} />
          </div>
        </div>
        <MobileMenu open={open} onClose={() => setOpen(false)} />
      </header>
      <main id="conteudo" tabIndex={-1} className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}

/** Lateral: menu fixo na lateral esquerda (estilo painel). */
function ShellLateral({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen">
      {/* Sidebar fixa (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-forest-200 bg-paper p-5 lg:flex">
        <BrandLogo />
        <nav className="mt-8 flex flex-col gap-1">
          <NavLinks vertical />
        </nav>
        <Link to="/cadastro" className="btn-primary mt-4">
          Cadastre seu negócio
        </Link>
        <div className="mt-auto border-t border-forest-100 pt-4">
          <div className="text-sm">
            <AuthLinks tone="light" />
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
        <main id="conteudo" tabIndex={-1} className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </div>
    </div>
  );
}

/** Imersiva: header minimalista com botão flutuante que abre um menu em tela cheia. */
function ShellImersiva({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 bg-paper/80 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between">
          <Link to="/" className="font-display text-lg font-700 text-ink">
            Observatório Acriano
          </Link>
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 rounded-full border border-forest-300 px-4 py-2 text-sm font-600 text-forest-800 transition hover:bg-forest-50"
          >
            <span className="flex flex-col gap-1">
              <span className="block h-0.5 w-5 bg-current" />
              <span className="block h-0.5 w-5 bg-current" />
              <span className="block h-0.5 w-5 bg-current" />
            </span>
            Menu
          </button>
        </div>
      </header>

      {/* Overlay de tela cheia */}
      {open && (
        <div className="animate-fade-in fixed inset-0 z-[60] flex flex-col bg-forest-950 text-white">
          <div className="container-page flex h-16 items-center justify-between">
            <span className="font-display text-lg font-700">
              Observatório Acriano
            </span>
            <button
              onClick={() => setOpen(false)}
              aria-label="Fechar menu"
              className="grid h-10 w-10 place-items-center rounded-full border border-white/30 text-lg transition hover:bg-white/10"
            >
              ✕
            </button>
          </div>
          <nav className="flex flex-1 flex-col items-center justify-center gap-3 px-4">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `font-display text-3xl font-700 transition sm:text-4xl ${
                    isActive ? "text-sun-400" : "text-white/80 hover:text-white"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <Link
              to="/cadastro"
              onClick={() => setOpen(false)}
              className="mt-6 rounded-full bg-sun-500 px-8 py-3 text-lg font-700 text-forest-950 transition hover:bg-sun-400"
            >
              Cadastre seu negócio
            </Link>
          </nav>
          <div className="flex justify-center pb-8">
            <AuthLinks tone="dark" />
          </div>
        </div>
      )}

      <main id="conteudo" tabIndex={-1} className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}

const SHELLS: Record<string, (p: { children: ReactNode }) => JSX.Element> = {
  classica: ShellClassica,
  lateral: ShellLateral,
  central: ShellCentral,
  minimalista: ShellMinimalista,
  imersiva: ShellImersiva,
};

export default function Layout({ children }: { children: ReactNode }) {
  const estrutura = useEstrutura();
  const Shell = SHELLS[estrutura] ?? ShellClassica;
  return (
    <>
      <a href="#conteudo" className="skip-link">
        Pular para o conteúdo
      </a>
      <Shell>{children}</Shell>
    </>
  );
}
