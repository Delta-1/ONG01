import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SectionTitle } from '../components/ui'
import { MUNICIPIOS } from '../data/municipios'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

export default function Cadastro() {
  const [passo, setPasso] = useState<'conta' | 'aguardando' | 'empreendimento' | 'ok'>('conta')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
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

  // Detecta a confirmação de e-mail: quando o usuário clica no link (mesmo em
  // outra aba ou ao voltar), a sessão é estabelecida e avançamos automaticamente
  // para a etapa de publicar o empreendimento.
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return

    // Se o usuário já chega autenticado (voltou do link de confirmação), pula
    // direto para a etapa do empreendimento.
    supabase.auth.getSession().then(({ data }) => {
      const uid = data.session?.user?.id
      if (uid) {
        setUserId(uid)
        setPasso((p) => (p === 'conta' || p === 'aguardando' ? 'empreendimento' : p))
      }
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const uid = session?.user?.id
      if (uid) {
        setUserId(uid)
        setPasso((p) => (p === 'conta' || p === 'aguardando' ? 'empreendimento' : p))
      }
    })

    return () => sub.subscription.unsubscribe()
  }, [])

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
      options: {
        data: { role: 'empresa' },
        emailRedirectTo: `${window.location.origin}/cadastro`,
      },
    })
    setLoading(false)
    if (error) {
      setErro(error.message)
      return
    }
    setUserId(data.user?.id ?? null)
    // Se o projeto exige confirmação de e-mail, signUp NÃO cria sessão: vamos
    // para a tela de espera. Se a confirmação estiver desativada, já há sessão
    // e seguimos direto para o empreendimento.
    setPasso(data.session ? 'empreendimento' : 'aguardando')
  }

  async function reenviarEmail() {
    if (!isSupabaseConfigured || !supabase) return
    setErro(null)
    setAviso(null)
    setLoading(true)
    const { error } = await supabase.auth.resend({ type: 'signup', email })
    setLoading(false)
    if (error) setErro(error.message)
    else setAviso('E-mail reenviado! Confira sua caixa de entrada e o spam.')
  }

  async function verificarConfirmacao() {
    if (!isSupabaseConfigured || !supabase) return
    setErro(null)
    setAviso(null)
    setLoading(true)
    const { data } = await supabase.auth.getSession()
    setLoading(false)
    const uid = data.session?.user?.id
    if (uid) {
      setUserId(uid)
      setPasso('empreendimento')
    } else {
      setAviso('Ainda não confirmamos seu e-mail. Clique no link que enviamos e tente de novo.')
    }
  }

  async function handleEmpreendimento(e: React.FormEvent) {
    e.preventDefault()
    if (!isSupabaseConfigured || !supabase) {
      setErro('Supabase não configurado.')
      return
    }
    setErro(null)
    setLoading(true)

    // Garante que há sessão ativa (e-mail confirmado) antes de publicar.
    const { data: sess } = await supabase.auth.getSession()
    const uid = sess.session?.user?.id ?? userId
    if (!uid) {
      setLoading(false)
      setPasso('aguardando')
      setErro('Confirme seu e-mail antes de publicar seu empreendimento.')
      return
    }

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
    await supabase
      .from('profiles')
      .update({ empreendimento_id: id })
      .eq('id', uid)

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
            { id: 'aguardando', label: '2. Confirmar e-mail' },
            { id: 'empreendimento', label: '3. Empreendimento' },
          ].map((s, i) => {
            const ordem = { conta: 0, aguardando: 1, empreendimento: 2, ok: 3 } as const
            const atual = ordem[passo]
            const concluido = i < atual
            const ativo = i === atual
            return (
              <div key={s.id} className="flex items-center gap-3">
                {i > 0 && <div className="h-px w-8 bg-forest-200" />}
                <span
                  className={`rounded-full px-3 py-1 text-sm font-600 ${
                    ativo
                      ? 'bg-forest-700 text-white'
                      : concluido
                        ? 'bg-forest-100 text-forest-700'
                        : 'bg-forest-100 text-forest-400'
                  }`}
                >
                  {concluido ? '✓ ' : ''}
                  {s.label}
                </span>
              </div>
            )
          })}
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

        {passo === 'aguardando' && (
          <div className="card mt-6 p-8 text-center sm:p-10">
            <div className="mx-auto grid h-16 w-16 animate-pulse place-items-center rounded-full bg-forest-100 text-3xl">
              ✉️
            </div>
            <h3 className="mt-4 font-display text-2xl font-700 text-forest-800">Confirme seu e-mail</h3>
            <p className="mt-3 text-forest-600">
              Enviamos um link de confirmação para{' '}
              <span className="font-600 text-forest-800">{email}</span>. Abra seu e-mail e clique no
              link para ativar sua conta.
            </p>
            <p className="mt-2 text-sm text-forest-400">
              Assim que você confirmar, esta página avança sozinha para o cadastro do empreendimento.
              (Não esqueça de olhar a caixa de spam.)
            </p>

            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-forest-500">
              <span className="h-2 w-2 animate-ping rounded-full bg-forest-500" />
              Aguardando confirmação…
            </div>

            {aviso && (
              <p className="mt-4 rounded-lg bg-forest-50 px-4 py-2.5 text-sm text-forest-700">{aviso}</p>
            )}
            {erro && <p className="mt-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{erro}</p>}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button className="btn-primary w-full" onClick={verificarConfirmacao} disabled={loading}>
                {loading ? 'Verificando…' : 'Já confirmei'}
              </button>
              <button
                className="w-full rounded-xl border border-forest-200 px-4 py-2.5 text-sm font-600 text-forest-700 hover:bg-forest-50 disabled:opacity-60"
                onClick={reenviarEmail}
                disabled={loading}
              >
                Reenviar e-mail
              </button>
            </div>
          </div>
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
