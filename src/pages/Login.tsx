import { useState } from 'react'
import { SectionTitle } from '../components/ui'
import { isSupabaseConfigured } from '../lib/supabase'

export default function Login() {
  const [perfil, setPerfil] = useState<'empresa' | 'adm'>('empresa')

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

        <form className="card mt-6 space-y-4 p-6" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="mb-1.5 block text-sm font-600 text-forest-700">E-mail</label>
            <input
              type="email"
              className="w-full rounded-xl border border-forest-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-forest-400 focus:ring-2 focus:ring-forest-100"
              placeholder="voce@email.com"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-600 text-forest-700">Senha</label>
            <input
              type="password"
              className="w-full rounded-xl border border-forest-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-forest-400 focus:ring-2 focus:ring-forest-100"
              placeholder="••••••••"
            />
          </div>
          <button className="btn-primary w-full">
            Entrar como {perfil === 'empresa' ? 'empreendedor' : 'administrador'}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-forest-400">
          {isSupabaseConfigured
            ? 'Supabase conectado. Autenticação real será ativada na Fase 3 (back-end).'
            : 'Supabase ainda não configurado (defina as variáveis em .env). Autenticação virá na Fase 3.'}
        </p>
      </div>
    </div>
  )
}
