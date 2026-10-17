import { useState } from "react";
import { Link } from "react-router-dom";
import { Field, TextField, Message, inputClass } from "../components/FormUI";
import { MUNICIPIOS } from "../data/municipios";
import { db, mensagemErro } from "../lib/queries";
const empty = {
  nome: "",
  municipio_codigo: "",
  categoria: "",
  historia: "",
  produtos: "",
  telefone: "",
  email: "",
  comunidade: "",
  responsavel: "",
  preenchido_por: "",
  instagram: "",
};
export default function FormularioRapido() {
  const [form, setForm] = useState(empty),
    [id, setId] = useState(() => crypto.randomUUID()),
    [consent, setConsent] = useState(false),
    [website, setWebsite] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [sent, setSent] = useState(false);
  function change(key: keyof typeof empty, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError("");
    setBusy(true);
    try {
      const { data, error } = await db().functions.invoke("cadastro-rapido", {
        body: {
          id,
          website,
          dados: {
            ...form,
            produtos: form.produtos
              .split(",")
              .map((x) => x.trim())
              .filter(Boolean),
            consentimento: consent,
          },
        },
      });
      if (error) {
        let message = mensagemErro(error);
        if ("context" in error) {
          try {
            message =
              (await (error.context as Response).json()).error || message;
          } catch {
            /* Keep original error. */
          }
        }
        throw new Error(message);
      }
      if (data.error) throw new Error(data.error);
      setSent(true);
    } catch (e) {
      setError(mensagemErro(e));
    } finally {
      setBusy(false);
    }
  }
  const mun = MUNICIPIOS.find((m) => m.codigo === form.municipio_codigo);
  if (sent)
    return (
      <div className="container-page py-12">
        <div className="card mx-auto max-w-xl space-y-5 p-7">
          <span className="chip">Enviado para a administração</span>
          <h1 className="font-display text-3xl">Cadastro recebido!</h1>
          <p>
            A equipe vai conferir os dados. O empreendimento só aparecerá na
            vitrine depois da aprovação.
          </p>
          <p className="text-sm text-forest-500">
            Você pode registrar outras empresas usando este mesmo formulário. O
            acesso da empresa será organizado pela administração.
          </p>
          <button
            className="btn-primary w-full"
            onClick={() => {
              setForm(empty);
              setConsent(false);
              setId(crypto.randomUUID());
              setSent(false);
            }}
          >
            Cadastrar outra empresa
          </button>
          <Link className="block underline" to="/vitrine">
            Ver a vitrine
          </Link>
        </div>
      </div>
    );
  return (
    <div className="container-page py-10">
      <div className="mx-auto max-w-2xl">
        <span className="eyebrow">Levantamento de empreendimentos do Acre</span>
        <h1 className="mt-3 font-display text-3xl text-forest-900">
          Cadastro rápido de empresa
        </h1>
        <p className="mt-3 text-forest-600">
          Preencha os dados do negócio. Não precisa criar conta. Tudo será
          enviado para análise do administrador antes de aparecer no site.
        </p>
        <form className="card mt-6 space-y-5 p-5 sm:p-8" onSubmit={submit}>
          <Field
            label="Seu nome (quem está preenchendo)"
            required
            minLength={2}
            maxLength={160}
            value={form.preenchido_por}
            onChange={(e) => change("preenchido_por", e.target.value)}
          />
          <Field
            label="Nome do empreendimento"
            required
            minLength={3}
            maxLength={160}
            value={form.nome}
            onChange={(e) => change("nome", e.target.value)}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="text-sm font-semibold">
              Município do Acre *
              <select
                required
                className={`${inputClass} mt-2`}
                value={form.municipio_codigo}
                onChange={(e) => change("municipio_codigo", e.target.value)}
              >
                <option value="">Selecione</option>
                {[...MUNICIPIOS]
                  .sort((a, b) => a.nome.localeCompare(b.nome))
                  .map((m) => (
                    <option key={m.codigo} value={m.codigo}>
                      {m.nome}
                    </option>
                  ))}
              </select>
            </label>
            <Field label="Região" readOnly value={mun?.regiao ?? ""} />
          </div>
          <Field
            label="Comunidade ou bairro (opcional)"
            maxLength={200}
            value={form.comunidade}
            onChange={(e) => change("comunidade", e.target.value)}
          />
          <Field
            label="Categoria ou atividade principal"
            required
            minLength={3}
            maxLength={120}
            placeholder="Ex.: castanha, artesanato, agricultura familiar"
            value={form.categoria}
            onChange={(e) => change("categoria", e.target.value)}
          />
          <Field
            label="Produtos ou serviços"
            required
            maxLength={1500}
            hint="Separe por vírgulas. Até 30 produtos ou serviços."
            value={form.produtos}
            onChange={(e) => change("produtos", e.target.value)}
          />
          <TextField
            label="Conte um pouco sobre o negócio"
            required
            minLength={30}
            maxLength={4000}
            hint="Como começou, o que faz e o que torna esse trabalho especial. Pelo menos 30 caracteres."
            value={form.historia}
            onChange={(e) => change("historia", e.target.value)}
          />
          <Field
            label="Nome do responsável pelo negócio (opcional)"
            maxLength={160}
            value={form.responsavel}
            onChange={(e) => change("responsavel", e.target.value)}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="WhatsApp ou telefone do negócio"
              type="tel"
              required
              minLength={8}
              maxLength={30}
              value={form.telefone}
              onChange={(e) => change("telefone", e.target.value)}
            />
            <Field
              label="E-mail público de contato (opcional)"
              type="email"
              maxLength={254}
              value={form.email}
              onChange={(e) => change("email", e.target.value)}
            />
          </div>
          <Field
            label="Instagram (opcional)"
            maxLength={100}
            value={form.instagram}
            onChange={(e) => change("instagram", e.target.value)}
          />
          <div aria-hidden="true" className="hidden">
            <label>
              Website
              <input
                name="website"
                value={website}
                tabIndex={-1}
                autoComplete="off"
                onChange={(e) => setWebsite(e.target.value)}
              />
            </label>
          </div>
          <label className="flex items-start gap-3 text-sm text-forest-700">
            <input
              required
              className="mt-1 h-5 w-5 shrink-0"
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
            />
            Confirmo que os dados são verdadeiros e que tenho autorização do
            responsável para divulgar as informações e os contatos deste
            empreendimento após a aprovação.
          </label>
          {error && <Message error>{error}</Message>}
          <button disabled={busy} className="btn-primary w-full py-4">
            {busy ? "Enviando…" : "Enviar cadastro para aprovação"}
          </button>
        </form>
      </div>
    </div>
  );
}
