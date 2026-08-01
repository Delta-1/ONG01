import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SectionTitle } from '../components/ui'
import { MUNICIPIOS } from '../data/municipios'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

export default function Cadastro() {
  const [passo, setPasso] = useState<'conta' | 'empreendimento' | 'ok'>('conta')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  // Campos conta
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')

  // Campos empreendimento
  const [nome, setNome] = useState('')
  const [municipio, setMunicipio] = useState('')
  const [categoria, setCategoria] = useState('')
  const [telefone, setTelefone] = useState('')
  const [instagram, setInstagram] = useState('')
  const [historia, setHistoria] = useState('')

  const navigate = useNavigate()

  async function handleConta(e: React.FormEvent) {
    e.preventDefault()
    if (!isSupabaseConfigured || !supabase) {
      setErro('Supabase não configurado.')
      return
    }
    setErro(null)
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: { data: { role: 'empresa' } },
    })
    setLoading(false)
    if (error) {
      setErro(error.message)
      return
    }
    setUserId(data.user?.id ?? null)
    setPasso('empreendimento')
  }

  async function handleEmpreendimento(e: React.FormEvent) {
    e.preventDefault()
    if (!isSupabaseConfigured || !supabase) {
      setErro('Supabase não configurado.')
      return
    }
    setErro(null)
    setLoading(true)

    // Insere empreendimento (aprovado=false, aguarda curadoria)
    const id = crypto.randomUUID()
    const { error } = await supabase.from('empreendimentos').insert({
      id,
      nome,
      municipio_codigo: municipio,
      categoria,
      historia,
      telefone,
      email,
      instagram: instagram || null,
      produtos: [],
      aprovado: false,
      destaque: false,
      cor: '#256b3d',
    })

    if (error) {
      setErro(error.message)
      setLoading(false)
      return
    }

    // Vincula empreendimento ao perfil do usuário
    if (userId) {
      await supabase
        .from('profiles')
        .update({ empreendimento_id: id })
        .eq('id', userId)
    }

    setLoading(false)
    setPasso('ok')
  }

  if (passo === 'ok') {
    return (
      <div className="container-page py-20">
        <div className="mx-auto max-w-md">
          <div className="card p-10 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-forest-100 text-3xl">🌱</div>
            <h3 className="mt-4 font-display text-2xl font-700 text-forest-800">Cadastro enviado!</h3>
            <p className="mt-3 text-forest-600">
              Recebemos sua apresentação. Nossa equipe vai analisar e publicar sua página na vitrine em breve.
            </p>
            <p className="mt-2 text-sm text-forest-400">
              Você receberá um e-mail quando seu empreendimento for aprovado.
            </p>
            <button
              className="btn-primary mt-6 w-full"
              onClick={() => navigate('/entrar')}
            >
              Entrar no painel
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="mx-auto max-w-2xl">
        <SectionTitle
          eyebrow="Credenciamento"
          title="Cadastre seu empreendimento"
          desc="Preencha os dados abaixo. Após o envio, a equipe do Observatório faz uma curadoria simples antes de publicar sua página na vitrine."
        />

        {/* Progresso */}
        <div className="mt-8 flex items-center gap-3">
          {[
            { id: 'conta', label: '1. Criar conta' },
            { id: 'empreendimento', label: '2. Empreendimento' },
          ].map((s, i) => (
            <div key={s.id} className="flex items-center gap-3">
              {i > 0 && <div className="h-px w-8 bg-forest-200" />}
              <span
                className={`rounded-full px-3 py-1 text-sm font-600 ${
                  passo === s.id
                    ? 'bg-forest-700 text-white'
                    : 'bg-forest-100 text-forest-400'
                }`}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {passo === 'conta' && (
          <form className="card mt-6 space-y-5 p-6 sm:p-8" onSubmit={handleConta}>
            <Field label="E-mail" type="email" value={email} onChange={setEmail} placeholder="voce@email.com" />
            <Field label="Senha" type="password" value={senha} onChange={setSenha} placeholder="Mínimo 6 caracteres" />
            {erro && <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{erro}</p>}
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Criando conta…' : 'Criar conta e continuar →'}
            </button>
          </form>
        )}

        {passo === 'empreendimento' && (
          <form className="card mt-6 space-y-5 p-6 sm:p-8" onSubmit={handleEmpreendimento}>
            <Field label="Nome do empreendimento" value={nome} onChange={setNome} placeholder="Ex.: Cooperativa da Castanha" />
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-600 text-forest-700">Município</label>
                <select
                  required
                  value={municipio}
                  onChange={(e) => setMunicipio(e.target.value)}
                  className="w-full rounded-xl border border-forest-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-forest-400 focus:ring-2 focus:ring-forest-100"
                >
                  <option value="">Selecione…</option>
                  {[...MUNICIPIOS].sort((a, b) => a.nome.localeCompare(b.nome)).map((m) => (
                    <option key={m.codigo} value={m.codigo}>{m.nome}</option>
                  ))}
                </select>
              </div>
              <Field label="Categoria / cadeia" value={categoria} onChange={setCategoria} placeholder="Ex.: Castanha, Açaí…" />
            </div>
            <Field label="E-mail de contato" type="email" value={email} onChange={setEmail} placeholder="voce@email.com" />
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Telefone / WhatsApp" value={telefone} onChange={setTelefone} placeholder="(68) 9....." />
              <Field label="Instagram (opcional)" value={instagram} onChange={setInstagram} placeholder="@seu_perfil" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-600 text-forest-700">Conte sua história</label>
              <textarea
                required
                rows={4}
                value={historia}
                onChange={(e) => setHistoria(e.target.value)}
                className="w-full rounded-xl border border-forest-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-forest-400 focus:ring-2 focus:ring-forest-100"
                placeholder="De onde vem o seu produto? Quem faz parte? O que torna seu negócio especial?"
              />
            </div>
            {erro && <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{erro}</p>}
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Enviando…' : 'Enviar para curadoria'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

function Field({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
}: {
  label: string
  type?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-600 text-forest-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={type !== 'text' || !label.includes('opcional')}
        className="w-full rounded-xl border border-forest-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-forest-400 focus:ring-2 focus:ring-forest-100"
      />
    </div>
  )
}
