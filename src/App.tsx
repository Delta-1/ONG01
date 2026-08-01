import { Suspense, lazy, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Layout from './components/Layout'
import LoadingScreen from './components/LoadingScreen'
import TopProgressBar from './components/TopProgressBar'
import Home from './pages/Home'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const Vitrine = lazy(() => import('./pages/Vitrine'))
const EmpreendimentoDetalhe = lazy(() => import('./pages/EmpreendimentoDetalhe'))
const Noticias = lazy(() => import('./pages/Noticias'))
const Legislacao = lazy(() => import('./pages/Legislacao'))
const Sobre = lazy(() => import('./pages/Sobre'))
const Cadastro = lazy(() => import('./pages/Cadastro'))
const Login = lazy(() => import('./pages/Login'))
const Painel = lazy(() => import('./pages/Painel'))
const Admin = lazy(() => import('./pages/Admin'))
const NotFound = lazy(() => import('./pages/NotFound'))

export default function App() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])

  return (
    <Layout>
      <TopProgressBar />
      <Suspense fallback={<LoadingScreen />}>
        {/* Chave por rota: remonta e reproduz a animação de entrada a cada troca */}
        <div key={pathname} className="animate-page-in">
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
            <Route path="/painel" element={<Painel />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Suspense>
    </Layout>
  )
}
