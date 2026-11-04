import { useEffect, useRef, useState } from "react";
import type { PointerEvent } from "react";
import { Link } from "react-router-dom";
import AcreMapHero from "./AcreMapHero";
import { BrandArt, BrandRibbon } from "./BrandArt";
import OrganicBg from "./OrganicBg";
import "../styles/living-home.css";

const INTERVAL = 7000;
const SLIDES = [
  {
    label: "Território",
    kicker: "Acre · Amazônia · Sociobiodiversidade",
    title: (
      <>
        O valor da
        <br />
        floresta em pé,
        <br />
        <em>em dados e histórias.</em>
      </>
    ),
    description:
      "Um olhar para quem vive, produz e mantém a floresta viva. Explore o Acre e descubra as conexões entre os territórios e os empreendimentos.",
    to: "/observatorio",
    cta: "Explorar o dashboard",
    secondary: "/vitrine",
    secondaryLabel: "Conhecer a vitrine",
    scene: "territorio",
  },
  {
    label: "Saberes e produtos",
    kicker: "Da floresta para o nosso cotidiano",
    title: (
      <>
        Cada semente,
        <br />
        um saber.
        <br />
        <em>
          Cada negócio,
          <br />
          uma história.
        </em>
      </>
    ),
    description:
      "Produtos, serviços e conhecimentos que carregam a identidade do Acre. Uma vitrine para conhecer quem transforma a sociobiodiversidade em trabalho e cuidado.",
    to: "/vitrine",
    cta: "Descobrir a vitrine",
    secondary: "/formulario/vitrine",
    secondaryLabel: "Cadastrar meu negócio",
    scene: "frutos",
  },
  {
    label: "Conexões",
    kicker: "Gente que cuida · Rede que fortalece",
    title: (
      <>
        O futuro da
        <br />
        floresta se faz
        <br />
        <em>com muita gente.</em>
      </>
    ),
    description:
      "Cooperativas, associações, empreendedores e parceiros: cada contribuição ajuda a construir um retrato mais vivo do nosso território. Faça parte dessa rede.",
    to: "/formulario/dashboard",
    cta: "Contribuir com dados",
    secondary: "/formulario/vitrine",
    secondaryLabel: "Participar da vitrine",
    scene: "rede",
  },
];

function Scene({ kind }: { kind: string }) {
  return (
    <div className={`living-scene living-scene-${kind}`}>
      <div className="scene-orbit scene-orbit-one" aria-hidden="true" />
      <div className="scene-orbit scene-orbit-two" aria-hidden="true" />
      {kind === "territorio" ? (
        <>
          <span className="scene-caption">
            UM TERRITÓRIO. MUITAS HISTÓRIAS.
          </span>
          <div className="scene-map">
            <AcreMapHero />
          </div>
          <div className="scene-floating scene-seed">
            <BrandArt motif="castanha" />
          </div>
          <div className="scene-floating scene-fruit">
            <BrandArt motif="fruto" />
          </div>
          <div className="scene-territory-note">
            <strong>22</strong>
            <span>
              municípios
              <br />
              conectados pelo mapa
            </span>
          </div>
        </>
      ) : kind === "frutos" ? (
        <>
          <span className="scene-caption">
            A DIVERSIDADE TEM MUITAS FORMAS.
          </span>
          <div className="scene-harvest" aria-hidden="true">
            <div className="scene-floating harvest-nut">
              <BrandArt motif="castanha" />
            </div>
            <div className="scene-floating harvest-fruit">
              <BrandArt motif="fruto" />
            </div>
            <div className="scene-floating harvest-green">
              <BrandArt motif="semente-verde" />
            </div>
            <div className="scene-floating harvest-olive">
              <BrandArt motif="semente-oliva" />
            </div>
          </div>
          <p className="scene-note">
            Raízes na floresta.
            <br />
            <strong>Histórias na vitrine.</strong>
          </p>
        </>
      ) : (
        <>
          <span className="scene-caption">
            QUANDO A GENTE SE CONECTA, A FLORESTA GANHA.
          </span>
          <div className="scene-network" aria-hidden="true">
            <svg viewBox="0 0 500 400">
              <path d="M65 110Q250 0 415 90M65 110Q100 360 410 310M415 90Q490 200 410 310M65 110L410 310M415 90L100 300" />
            </svg>
            <div className="scene-network-eyes scene-floating">
              <BrandArt motif="olhos" />
            </div>
            <div className="scene-network-green scene-floating">
              <BrandArt motif="semente-verde" />
            </div>
            <div className="scene-network-fruit scene-floating">
              <BrandArt motif="fruto" />
            </div>
            <div className="scene-network-olive scene-floating">
              <BrandArt motif="semente-oliva" />
            </div>
          </div>
          <p className="scene-note">
            Pessoas. Territórios. Saberes.
            <br />
            <strong>Uma rede em construção.</strong>
          </p>
        </>
      )}
      <BrandArt motif="rio" className="scene-river" />
    </div>
  );
}

/** Carrossel editorial: controles reais, toque, teclado e respeito a movimento reduzido. */
export default function HeroCarousel() {
  const root = useRef<HTMLElement>(null);
  const gestureStart = useRef<{ x: number; y: number } | null>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(!document.hidden);
  const [inView, setInView] = useState(true);
  const [reduced, setReduced] = useState(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [announcement, setAnnouncement] = useState("");
  const motionPaused = paused || reduced || !visible || !inView;
  const playing = !motionPaused && !hovered && !focused;
  const slide = SLIDES[index];

  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const motionChange = () => setReduced(media.matches);
    const visibilityChange = () => setVisible(!document.hidden);
    media.addEventListener("change", motionChange);
    document.addEventListener("visibilitychange", visibilityChange);
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.1 },
    );
    if (root.current) observer.observe(root.current);
    return () => {
      media.removeEventListener("change", motionChange);
      document.removeEventListener("visibilitychange", visibilityChange);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(
      () => setIndex((i) => (i + 1) % SLIDES.length),
      INTERVAL,
    );
    return () => window.clearTimeout(timer);
  }, [index, playing]);

  function goTo(next: number) {
    const target = (next + SLIDES.length) % SLIDES.length;
    setIndex(target);
    setPaused(true);
    setAnnouncement(
      `${target + 1} de ${SLIDES.length}: ${SLIDES[target].label}`,
    );
  }

  function moveWind(event: PointerEvent<HTMLElement>) {
    if (event.pointerType !== "mouse" || motionPaused || !root.current) return;
    const box = event.currentTarget.getBoundingClientRect();
    root.current.style.setProperty(
      "--wind-x",
      `${((event.clientX - box.left) / box.width - 0.5) * 22}px`,
    );
    root.current.style.setProperty(
      "--wind-y",
      `${((event.clientY - box.top) / box.height - 0.5) * 14}px`,
    );
  }

  function swipeEnd(event: PointerEvent<HTMLDivElement>) {
    const start = gestureStart.current;
    gestureStart.current = null;
    if (!start) return;
    const dx = event.clientX - start.x,
      dy = event.clientY - start.y;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5)
      goTo(index + (dx < 0 ? 1 : -1));
  }

  return (
    <section
      ref={root}
      className="living-hero"
      aria-roledescription="carrossel"
      aria-label="Explore o Observatório"
      data-motion={motionPaused ? "paused" : "playing"}
      data-autoplay={playing ? "playing" : "paused"}
      onPointerMove={moveWind}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        root.current?.style.setProperty("--wind-x", "0px");
        root.current?.style.setProperty("--wind-y", "0px");
      }}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setFocused(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
          event.preventDefault();
          goTo(index + (event.key === "ArrowRight" ? 1 : -1));
        }
      }}
    >
      <OrganicBg />
      <div className="container-page living-hero-inner">
        <div
          key={index}
          className="living-slide"
          role="group"
          aria-roledescription="slide"
          aria-label={`${index + 1} de ${SLIDES.length}: ${slide.label}`}
        >
          <div className="living-copy">
            <p className="living-kicker">
              <span />
              {slide.kicker}
            </p>
            <h1 className="living-title">{slide.title}</h1>
            <p className="living-description">{slide.description}</p>
            <div className="living-actions">
              <Link to={slide.to} className="btn living-primary">
                {slide.cta} <span aria-hidden="true">↗</span>
              </Link>
              <Link to={slide.secondary} className="btn living-secondary">
                {slide.secondaryLabel} <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
          <div
            className="living-art"
            onPointerDown={(event) => {
              if (event.button === 0)
                gestureStart.current = { x: event.clientX, y: event.clientY };
            }}
            onPointerUp={swipeEnd}
            onPointerCancel={() => {
              gestureStart.current = null;
            }}
          >
            <Scene kind={slide.scene} />
          </div>
        </div>
        <div className="living-controls">
          <div className="living-chapters" aria-label="Escolher destaque">
            {SLIDES.map((item, i) => (
              <button
                key={item.scene}
                type="button"
                aria-label={`Mostrar destaque ${i + 1}: ${item.label}`}
                aria-current={index === i ? "true" : undefined}
                onClick={() => goTo(i)}
                className={index === i ? "is-active" : ""}
              >
                <span className="chapter-number">0{i + 1}</span>
                <span>{item.label}</span>
                <span className="chapter-track" aria-hidden="true">
                  <span
                    key={`${index}-${i}-${playing}`}
                    style={{
                      animationDuration: `${INTERVAL}ms`,
                      animationPlayState:
                        playing && index === i ? "running" : "paused",
                    }}
                  />
                </span>
              </button>
            ))}
          </div>
          <div className="living-transport">
            <button
              type="button"
              className="living-arrow"
              aria-label="Destaque anterior"
              onClick={() => goTo(index - 1)}
            >
              ←
            </button>
            <button
              type="button"
              className="living-arrow"
              aria-label="Próximo destaque"
              onClick={() => goTo(index + 1)}
            >
              →
            </button>
            <button
              type="button"
              className="living-pause"
              aria-label={
                reduced
                  ? "Movimento reduzido ativo"
                  : paused
                    ? "Ativar movimento automático"
                    : "Pausar movimento automático"
              }
              disabled={reduced}
              onClick={() => setPaused((value) => !value)}
            >
              <span aria-hidden="true">{paused || reduced ? "▶" : "Ⅱ"}</span>
              <span>
                {reduced ? "Movimento reduzido" : paused ? "Retomar" : "Pausar"}
              </span>
            </button>
          </div>
        </div>
        <p className="living-motion-hint">
          <span className="wind-icon" aria-hidden="true">
            ≈
          </span>{" "}
          Floresta viva. Histórias em movimento.
          <span className="living-touch-hint"> Deslize para explorar.</span>
        </p>
        <p className="sr-only" aria-live="polite" aria-atomic="true">
          {announcement}
        </p>
      </div>
      <BrandRibbon />
    </section>
  );
}
