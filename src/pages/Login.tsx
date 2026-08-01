import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { SectionTitle } from '../components/ui'
import { useAuth } from '../contexts/AuthContext'
import { isSupabaseConfigured } from '../lib/supabase'

export default function Login() {
  const [perfil, setPerfil] = useState<'empresa' | 'adm'>('empresa')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isSupabaseConfigured) {
      setErro('Supabase não configurado. Configure as variáveis de ambiente.')
      return
    }
    setErro(null)
    setCarregando(true)
    const err = await signIn(email, senha)
    setCarregando(false)
    if (err) {
      setErro(err === 'Invalid login credentials' ? 'E-mail ou senha incorretos.' : err)
      return
    }
    navigate(perfil === 'adm' ? '/admin' : '/painel')
  }

  return (
    <div className="container-page py-14">
      <div className="mx-auto max-w-md">
        <SectionTitle
          center
          eyebrow="Acesso"
          title="Entrar na plataforma"
          desc="Área para empreendedores gerenciarem suas páginas e para administradores moderarem os cadastros."
        />

        <div className="mt-8 grid grid-cols-2 gap-2 rounded-full bg-forest-100 p-1">
          {(['empresa', 'adm'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPerfil(p)}
              className={`rounded-full py-2 text-sm font-600 transition ${
                perfil === p ? 'bg-white text-forest-800 shadow-sm' : 'text-forest-500'
              }`}
            >
              {p === 'empresa' ? 'Empreendedor' : 'Administrador'}
            </button>
          ))}
        </div>

        <form className="card mt-6 space-y-4 p-6" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1.5 block text-sm font-600 text-forest-700">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-forest-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-forest-400 focus:ring-2 focus:ring-forest-100"
              placeholder="voce@email.com"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-600 text-forest-700">Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              className="w-full rounded-xl border border-forest-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-forest-400 focus:ring-2 focus:ring-forest-100"
              placeholder="••••••••"
            />
          </div>

          {erro && (
            <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{erro}</p>
          )}

          <button className="btn-primary w-full" disabled={carregando}>
            {carregando ? 'Entrando…' : `Entrar como ${perfil === 'empresa' ? 'empreendedor' : 'administrador'}`}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-forest-500">
          Não tem conta?{' '}
          <Link to="/cadastro" className="font-600 text-forest-700 hover:text-forest-900">
            Cadastre seu empreendimento
          </Link>
        </p>
      </div>
    </div>
  )
}
