import { BrandArt } from "./BrandArt";

/** Elementos da identidade original, sem interferir nos controles da página. */
export default function OrganicBg() {
  return (
    <div className="brand-organic" aria-hidden="true">
      <BrandArt motif="rio" className="brand-organic-river" />
      <BrandArt motif="semente-oliva" className="brand-organic-seed" />
    </div>
  );
}
