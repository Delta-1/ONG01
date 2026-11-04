/** Assinatura do site com o grafismo dos olhos fornecido no kit de identidade. */
export default function BrandSignature({
  variant = "dark",
}: {
  variant?: "dark" | "light";
}) {
  return (
    <span
      className={`brand-symbol ${variant === "light" ? "brand-symbol-light" : ""}`}
      aria-hidden="true"
    >
      <img
        src={`${import.meta.env.BASE_URL}identidade/olhos.webp`}
        alt=""
        width="113"
        height="37"
      />
    </span>
  );
}
