import { useEffect, useRef, useState } from "react";
import type { PointerEvent } from "react";
import { Link } from "react-router-dom";
import AcreMapHero from "./AcreMapHero";
import { BrandArt, BrandRibbon } from "./BrandArt";
import OrganicBg from "./OrganicBg";
import "../styles/living-home.css";

/** Conteúdo fixo; o movimento fica restrito à ambientação e aos grafismos. */
export default function ForestHero() {
  const root = useRef<HTMLElement>(null);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(!document.hidden);
  const [inView, setInView] = useState(true);
  const [reduced, setReduced] = useState(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const motionPaused = paused || reduced || !visible || !inView;

  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const motionChange = () => setReduced(media.matches);
    const visibilityChange = () => setVisible(!document.hidden);
    media.addEventListener("change", motionChange);
    document.addEventListener("visibilitychange", visibilityChange);
    const observer =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver(
            ([entry]) => setInView(entry.isIntersecting),
            { threshold: 0.1 },
          );
    if (root.current) observer?.observe(root.current);
    return () => {
      media.removeEventListener("change", motionChange);
      document.removeEventListener("visibilitychange", visibilityChange);
      observer?.disconnect();
    };
  }, []);

  function resetWind() {
    root.current?.style.setProperty("--wind-x", "0px");
    root.current?.style.setProperty("--wind-y", "0px");
  }

  function moveWind(event: PointerEvent<HTMLElement>) {
    if (event.pointerType !== "mouse" || motionPaused || !root.current) return;
    const box = event.currentTarget.getBoundingClientRect();
    root.current.style.setProperty(
      "--wind-x",
      `${((event.clientX - box.left) / box.width - 0.5) * 18}px`,
    );
    root.current.style.setProperty(
      "--wind-y",
      `${((event.clientY - box.top) / box.height - 0.5) * 10}px`,
    );
  }

  return (
    <section
      ref={root}
      className="living-hero"
      aria-label="Observatório do Acre"
      data-motion={motionPaused ? "paused" : "playing"}
      onPointerMove={moveWind}
      onPointerLeave={resetWind}
    >
      <OrganicBg />
      <div className="container-page living-hero-inner">
        <div className="living-layout">
          <div className="living-copy">
            <p className="living-kicker">
              <span />
              Acre · Amazônia · Sociobiodiversidade
            </p>
            <h1 className="living-title">
              O valor da
              <br />
              floresta em pé,
              <br />
              <em>em dados e histórias.</em>
            </h1>
            <p className="living-description">
              Um olhar para quem vive, produz e mantém a floresta viva. Explore
              o Acre e descubra as conexões entre os territórios e os
              empreendimentos.
            </p>
            <div className="living-actions">
              <Link to="/observatorio" className="btn living-primary">
                Explorar o dashboard <span aria-hidden="true">↗</span>
              </Link>
              <Link to="/vitrine" className="btn living-secondary">
                Conhecer a vitrine <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
          <div className="living-art">
            <div className="living-scene">
              <div className="scene-orbit scene-orbit-one" aria-hidden="true" />
              <div className="scene-orbit scene-orbit-two" aria-hidden="true" />
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
              <BrandArt motif="rio" className="scene-river" />
            </div>
          </div>
        </div>
        <div className="living-footer">
          <p className="living-motion-hint">
            <span className="wind-icon" aria-hidden="true">
              ≈
            </span>
            Territórios, pessoas e saberes que se conectam.
          </p>
          <button
            type="button"
            className="living-pause"
            aria-label={
              reduced
                ? "Movimento reduzido ativo"
                : paused
                  ? "Retomar efeitos do fundo"
                  : "Pausar efeitos do fundo"
            }
            aria-pressed={paused || reduced}
            disabled={reduced}
            onClick={() => {
              resetWind();
              setPaused((value) => !value);
            }}
          >
            <span aria-hidden="true">{paused || reduced ? "▶" : "Ⅱ"}</span>
            {reduced
              ? "Movimento reduzido"
              : paused
                ? "Retomar efeitos"
                : "Pausar efeitos"}
          </button>
        </div>
      </div>
      <BrandRibbon />
    </section>
  );
}
