import { useEffect, useId, useRef } from "react";
import type { PointerEvent } from "react";

/** Mantém a arte original; só as pupilas se movem sobre o próprio grafismo. */
export default function BrandSignature({
  variant = "dark",
}: {
  variant?: "dark" | "light";
}) {
  const root = useRef<HTMLSpanElement>(null);
  const hovering = useRef(false);
  const reduced = useRef(false);
  const id = useId().replace(/:/g, "");
  const image = `${import.meta.env.BASE_URL}identidade/olhos.webp`;

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    let idleTimer: ReturnType<typeof setTimeout>;
    let returnTimer: ReturnType<typeof setTimeout>;
    let inView = true;
    let disposed = false;

    function center() {
      element?.style.setProperty("--eye-x", "0px");
      element?.style.setProperty("--eye-y", "0px");
    }

    function stop() {
      clearTimeout(idleTimer);
      clearTimeout(returnTimer);
      center();
    }

    function schedule() {
      clearTimeout(idleTimer);
      if (disposed || reduced.current || document.hidden || !inView) return;
      idleTimer = setTimeout(() => {
        if (!hovering.current) {
          const direction = Math.random() < 0.5 ? -1 : 1;
          element?.style.setProperty("--eye-x", `${direction * (12 + Math.random() * 6)}px`);
          element?.style.setProperty("--eye-y", `${Math.random() * 4 - 2}px`);
          returnTimer = setTimeout(() => {
            if (!hovering.current) center();
          }, 1100 + Math.random() * 700);
        }
        schedule();
      }, 9000 + Math.random() * 15000);
    }

    function sync() {
      reduced.current = media.matches;
      stop();
      schedule();
    }

    const observer = typeof IntersectionObserver === "undefined" ? null :
      new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting;
        stop();
        schedule();
      });
    observer?.observe(element);
    media.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    sync();
    return () => {
      disposed = true;
      stop();
      observer?.disconnect();
      media.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  function look(event: PointerEvent<HTMLSpanElement>) {
    if (event.pointerType !== "mouse" || reduced.current) return;
    hovering.current = true;
    const box = event.currentTarget.getBoundingClientRect();
    const x = Math.max(-1, Math.min(1, ((event.clientX - box.left) / box.width - 0.5) * 2));
    const y = Math.max(-1, Math.min(1, ((event.clientY - box.top) / box.height - 0.5) * 2));
    event.currentTarget.style.setProperty("--eye-x", `${x * 20}px`);
    event.currentTarget.style.setProperty("--eye-y", `${y * 5}px`);
  }

  return (
    <span
      ref={root}
      className={`brand-symbol ${variant === "light" ? "brand-symbol-light" : ""}`}
      aria-hidden="true"
      onPointerEnter={look}
      onPointerMove={look}
      onPointerLeave={() => {
        hovering.current = false;
        root.current?.style.setProperty("--eye-x", "0px");
        root.current?.style.setProperty("--eye-y", "0px");
      }}
    >
      <svg viewBox="0 0 500 163" width="113" height="37" focusable="false">
        <defs>
          <clipPath id={`${id}-left`}><ellipse cx="164" cy="63" rx="37" ry="38" /></clipPath>
          <clipPath id={`${id}-right`}><ellipse cx="403" cy="63" rx="37" ry="38" /></clipPath>
        </defs>
        <image href={image} width="500" height="163" />
        <g fill="#fff9eb">
          <ellipse cx="164" cy="63" rx="40" ry="40" />
          <ellipse cx="403" cy="63" rx="40" ry="40" />
        </g>
        <g className="brand-pupils">
          <image href={image} width="500" height="163" clipPath={`url(#${id}-left)`} />
          <image href={image} width="500" height="163" clipPath={`url(#${id}-right)`} />
        </g>
      </svg>
    </span>
  );
}
