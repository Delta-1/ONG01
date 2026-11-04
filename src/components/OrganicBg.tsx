import type { CSSProperties } from "react";
import { BrandArt } from "./BrandArt";

const LEAVES = [
  [5, 18, 22, 0, 16],
  [15, 65, 15, -7, 22],
  [28, 8, 12, -4, 19],
  [42, 82, 25, -12, 25],
  [53, 24, 16, -3, 21],
  [62, 72, 14, -9, 17],
  [72, 12, 27, -11, 23],
  [82, 58, 16, -6, 19],
  [92, 26, 20, -13, 26],
  [34, 49, 12, -8, 24],
  [9, 91, 18, -2, 20],
  [95, 88, 25, -5, 18],
];

/** Rios, folhas e sementes em camadas: brisa contínua com leve resposta ao cursor. */
export default function OrganicBg() {
  return (
    <div className="forest-atmosphere" aria-hidden="true">
      <div className="forest-halo forest-halo-one" />
      <div className="forest-halo forest-halo-two" />
      <svg
        className="forest-currents"
        viewBox="0 0 1440 800"
        preserveAspectRatio="xMidYMid slice"
      >
        <g className="wind-current wind-current-one">
          <path d="M-160 240C170 80 340 440 690 240S1200 100 1620 330" />
          <path d="M-160 256C170 96 340 456 690 256S1200 116 1620 346" />
        </g>
        <g className="wind-current wind-current-two">
          <path d="M-150 630C200 770 440 370 760 580S1200 740 1620 490" />
        </g>
      </svg>
      <div className="wind-parallax">
        {LEAVES.map(([x, y, size, delay, duration], i) => (
          <span
            key={i}
            className={`wind-leaf wind-leaf-${i % 3}`}
            style={
              {
                left: `${x}%`,
                top: `${y}%`,
                width: size,
                height: size * 1.8,
                "--leaf-delay": `${delay}s`,
                "--leaf-duration": `${duration}s`,
                "--leaf-turn": `${i * 27 - 70}deg`,
              } as CSSProperties
            }
          >
            <svg viewBox="0 0 32 52">
              <path d="M3 49C-3 19 9 3 28 0C36 25 25 45 3 49Z" />
              <path d="M4 46L26 5" />
            </svg>
          </span>
        ))}
      </div>
      <BrandArt motif="rio" className="atmosphere-river" />
      <span className="atmosphere-grain" />
    </div>
  );
}
