import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Barra de progresso fina no topo, exibida rapidamente a cada troca de rota.
 * Dá o feedback de "carregando" sem cobrir a tela — deixa a navegação fluida.
 */
export default function TopProgressBar() {
  const { pathname } = useLocation()
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)
  const first = useRef(true)

  useEffect(() => {
    // Não anima no primeiro carregamento da página.
    if (first.current) {
      first.current = false
      return
    }

    setVisible(true)
    setProgress(12)
    const t1 = setTimeout(() => setProgress(72), 90)
    const t2 = setTimeout(() => setProgress(100), 420)
    const t3 = setTimeout(() => setVisible(false), 600)
    const t4 = setTimeout(() => setProgress(0), 780)

    return () => [t1, t2, t3, t4].forEach(clearTimeout)
  }, [pathname])

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[200] h-[3px]">
      <div
        className="h-full bg-gradient-to-r from-forest-500 via-sun-500 to-forest-500 shadow-[0_0_8px] shadow-forest-400/50 transition-[width,opacity] duration-300 ease-out"
        style={{ width: `${progress}%`, opacity: visible ? 1 : 0 }}
      />
    </div>
  )
}
