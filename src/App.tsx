import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Layout from './components/Layout'
import LoadingScreen from './components/LoadingScreen'
import Home from './pages/Home'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const Vitrine = lazy(() => import('./pages/Vitrine'))
const EmpreendimentoDetalhe = lazy(() => import('./pages/EmpreendimentoDetalhe'))
const Noticias = lazy(() => import('./pages/Noticias'))
const Legislacao = lazy(() => import('./pages/Legislacao'))
const Sobre = lazy(() => import('./pages/Sobre'))
const Cadastro = lazy(() => import('./pages/Cadastro'))
const Login = lazy(() => import('./pages/Login'))
const NotFound = lazy(() => import('./pages/NotFound'))

/** Mostra a tela de carregamento por um instante a cada troca de aba. */
function RouteTransition() {
  const { pathname } = useLocation()
  const [loading, setLoading] = useState(false)
  const first = useRef(true)

  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    setLoading(true)
    const t = setTimeout(() => setLoading(false), 650)
    return () => clearTimeout(t)
  }, [pathname])

  return loading ? <LoadingScreen /> : null
}

export default function App() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])

  return (
    <Layout>
      <RouteTransition />
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/observatorio" element={<Dashboard />} />
          <Route path="/vitrine" element={<Vitrine />} />
          <Route path="/vitrine/:id" element={<EmpreendimentoDetalhe />} />
          <Route path="/noticias" element={<Noticias />} />
          <Route path="/legislacao" element={<Legislacao />} />
          <Route path="/sobre" element={<Sobre />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/entrar" element={<Login />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Layout>
  )
}
