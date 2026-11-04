/** Grafismos fornecidos no kit IDV. Vazios e ocultos para leitores de tela. */
export type BrandMotif =
  | "castanha"
  | "fruto"
  | "semente-verde"
  | "semente-oliva"
  | "rio"
  | "olhos";

export function BrandArt({
  motif,
  className = "",
}: {
  motif: BrandMotif;
  className?: string;
}) {
  return (
    <img
      src={`${import.meta.env.BASE_URL}identidade/${motif}.webp`}
      alt=""
      aria-hidden="true"
      className={`pointer-events-none select-none object-contain ${className}`}
      decoding="async"
    />
  );
}

export function BrandRibbon() {
  return (
    <div className="brand-ribbon" aria-hidden="true">
      {["#b4765f", "#ec4318", "#9a0318", "#ffbe00", "#a0984b", "#166340"].map(
        (color) => (
          <span key={color} style={{ backgroundColor: color }} />
        ),
      )}
    </div>
  );
}

export function PageArtwork({
  motif = "semente-verde",
}: {
  motif?: BrandMotif;
}) {
  return (
    <div className="page-artwork" aria-hidden="true">
      <BrandArt motif={motif} />
      <BrandArt motif="rio" />
    </div>
  );
}
