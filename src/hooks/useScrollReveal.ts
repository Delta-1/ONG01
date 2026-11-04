import { useEffect, useRef } from "react";

/** Entradas discretas; o conteúdo continua visível sem JS ou com movimento reduzido. */
export function useScrollReveal() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!root.current || !window.IntersectionObserver) return;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const nodes = root.current.querySelectorAll<HTMLElement>(
      "[data-scroll-reveal]",
    );
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          (entry.target as HTMLElement).dataset.reveal = "visible";
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.08 },
    );
    nodes.forEach((node) => {
      node.dataset.reveal = media.matches ? "visible" : "waiting";
      observer.observe(node);
    });
    const revealAll = () => {
      if (media.matches)
        nodes.forEach((node) => {
          node.dataset.reveal = "visible";
        });
    };
    media.addEventListener("change", revealAll);
    return () => {
      observer.disconnect();
      media.removeEventListener("change", revealAll);
      nodes.forEach((node) => {
        delete node.dataset.reveal;
      });
    };
  }, []);
  return root;
}
