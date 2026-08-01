export const nf = new Intl.NumberFormat('pt-BR')

export function fmtInt(n: number): string {
  return nf.format(Math.round(n))
}

/** R$ mil -> texto legível (ex.: 2500 -> "R$ 2,5 mi", 320 -> "R$ 320 mil"). */
export function fmtReaisMil(mil: number): string {
  if (mil >= 1000) {
    return `R$ ${(mil / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} mi`
  }
  return `R$ ${fmtInt(mil)} mil`
}

export function fmtData(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}
