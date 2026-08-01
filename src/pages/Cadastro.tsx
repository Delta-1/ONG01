import { useState } from 'react'
import { SectionTitle } from '../components/ui'
import { MUNICIPIOS } from '../data/municipios'

export default function Cadastro() {
  const [enviado, setEnviado] = useState(false)

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="mx-auto max-w-2xl">
        <SectionTitle
          eyebrow="Credenciamento"
          title="Cadastre seu empreendimento"
          desc="Preencha os dados abaixo. Após o envio, a equipe do Observatório faz uma curadoria simples antes de publicar sua página na vitrine."
        />

        {enviado ? (
          <div className="card mt-10 p-8 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-forest-100 text-2xl">
              🌱
            </div>
            <h3 className="mt-4 font-display text-xl font-700 text-forest-800">Cadastro enviado!</h3>
            <p className="mt-2 text-forest-600">
              Recebemos sua apresentação (demonstração — nada foi salvo ainda). Assim que o backend
              estiver conectado ao Supabase, o cadastro seguirá para aprovação do administrador.
            </p>
            <button className="btn-ghost mt-5" onClick={() => setEnviado(false)}>
              Enviar outro
            </button>
          </div>
        ) : (
          <form
            className="card mt-10 space-y-5 p-6 sm:p-8"
            onSubmit={(e) => {
              e.preventDefault()
              setEnviado(true)
            }}
          >
            <Field label="Nome do empreendimento" name="nome" placeholder="Ex.: Cooperativa da Castanha" />
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-600 text-forest-700">Município</label>
                <select className="w-full rounded-xl border border-forest-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-forest-400 focus:ring-2 focus:ring-forest-100" required>
                  <option value="">Selecione…</option>
                  {[...MUNICIPIOS].sort((a, b) => a.nome.localeCompare(b.nome)).map((m) => (
                    <option key={m.codigo} value={m.codigo}>
                      {m.nome}
                    </option>
                  ))}
                </select>
              </div>
              <Field label="Categoria / cadeia" name="categoria" placeholder="Ex.: Castanha, Açaí…" />
            </div>
            <Field label="E-mail de contato" name="email" type="email" placeholder="voce@email.com" />
            <Field label="Telefone / WhatsApp" name="telefone" placeholder="(68) 9....." />
            <div>
              <label className="mb-1.5 block text-sm font-600 text-forest-700">Conte sua história</label>
              <textarea
                rows={4}
                className="w-full rounded-xl border border-forest-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-forest-400 focus:ring-2 focus:ring-forest-100"
                placeholder="De onde vem o seu produto? Quem faz parte? O que torna seu negócio especial?"
              />
            </div>
            <button type="submit" className="btn-primary w-full">
              Enviar para curadoria
            </button>
            <p className="text-center text-xs text-forest-400">
              Protótipo — o envio é apenas demonstrativo e nenhum dado é armazenado.
            </p>
          </form>
        )}
      </div>
    </div>
  )
}

function Field({
  label,
  name,
  type = 'text',
  placeholder,
}: {
  label: string
  name: string
  type?: string
  placeholder?: string
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-600 text-forest-700">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        className="w-full rounded-xl border border-forest-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-forest-400 focus:ring-2 focus:ring-forest-100"
      />
    </div>
  )
}
