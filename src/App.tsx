import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
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

function Loader() {
  return (
    <div className="container-page grid place-items-center py-32">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-forest-200 border-t-forest-600" />
    </div>
  )
}

export default function App() {
  return (
    <Layout>
      <Suspense fallback={<Loader />}>
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
