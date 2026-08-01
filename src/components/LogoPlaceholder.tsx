/**
 * Placeholder da identidade visual.
 *
 * Enquanto a logo oficial não chega, exibimos um marcador "SUA LOGO".
 * Quando a arte estiver pronta, basta trocar este componente por um <img>
 * (ex.: <img src="/logo.svg" alt="Observatório Acriano" />).
 */
export default function LogoPlaceholder({
  variant = 'dark',
}: {
  variant?: 'dark' | 'light'
}) {
  const border = variant === 'light' ? 'border-white/50 text-white/90' : 'border-forest-300 text-forest-500'
  return (
    <span
      className={`grid h-10 w-10 place-items-center rounded-sm border border-dashed ${border} text-[8px] font-semibold uppercase leading-tight tracking-wider`}
      title="Espaço reservado para a logo oficial"
    >
      Sua<br />logo
    </span>
  )
}
