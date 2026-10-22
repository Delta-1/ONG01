import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Field, TextField, Message, inputClass } from "../components/FormUI";
import { MUNICIPIOS } from "../data/municipios";
import { db, mensagemErro } from "../lib/queries";
import { TIPOS_ORGANIZACAO } from "../lib/parceiros";
const empty = {
  finalidade: "vitrine",
  tipo: "",
  possui_produtos: "",
  possui_cnpj: "",
  cnpj: "",
  situacao_cnpj: "",
  funcionamento: "",
  site: "",
  colaboracao: "",
  trabalhadores: "",
  familias: "",
  producao_anual_ton: "",
  ano_referencia: "",
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
  const location = useLocation();
  const initial = {
    ...empty,
    finalidade: location.pathname.endsWith("/dashboard")
      ? "dashboard"
      : "vitrine",
  };
  const [form, setForm] = useState(initial),
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
            versao_formulario: 2,
            trabalhadores:
              form.trabalhadores === "" ? null : Number(form.trabalhadores),
            familias: form.familias === "" ? null : Number(form.familias),
            producao_anual_ton:
              form.producao_anual_ton === ""
                ? null
                : Number(form.producao_anual_ton),
            ano_referencia:
              form.ano_referencia === "" ? null : Number(form.ano_referencia),
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
            {form.finalidade === "dashboard"
              ? "A equipe vai analisar sua contribuição para os indicadores do Observatório. Este cadastro não cria um perfil na vitrine."
              : "A equipe vai conferir os dados antes de publicar o perfil na vitrine e incluí-lo no dashboard."}
          </p>
          <p className="text-sm text-forest-500">
            Você pode registrar outras empresas usando este mesmo formulário. O
            acesso da empresa será organizado pela administração.
          </p>
          <button
            className="btn-primary w-full"
            onClick={() => {
              setForm(initial);
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
          Cadastro de parceiros do Observatório
        </h1>
        <p className="mt-3 text-forest-600">
          Preencha os dados do negócio. Não precisa criar conta. Tudo será
          enviado para análise do administrador antes de aparecer no site.
        </p>
        <form className="card mt-6 space-y-5 p-5 sm:p-8" onSubmit={submit}>
          <fieldset className="space-y-3 rounded-xl bg-forest-50 p-4">
            <legend className="font-semibold">
              Como você quer participar?
            </legend>
            <label className="flex items-start gap-3">
              <input
                type="radio"
                name="finalidade"
                value="vitrine"
                checked={form.finalidade === "vitrine"}
                onChange={() => change("finalidade", "vitrine")}
              />
              Vitrine e dashboard: divulgar produtos ou serviços e participar do
              mapeamento
            </label>
            <label className="flex items-start gap-3">
              <input
                type="radio"
                name="finalidade"
                value="dashboard"
                checked={form.finalidade === "dashboard"}
                onChange={() => change("finalidade", "dashboard")}
              />
              Somente dashboard e parceria: contribuir com dados, pesquisa,
              apoio ou articulação, sem perfil na vitrine
            </label>
          </fieldset>
          <Field
            label="Seu nome (quem está preenchendo)"
            required
            minLength={2}
            maxLength={160}
            value={form.preenchido_por}
            onChange={(e) => change("preenchido_por", e.target.value)}
          />
          <Field
            label="Nome do empreendimento ou organização"
            required
            minLength={3}
            maxLength={160}
            value={form.nome}
            onChange={(e) => change("nome", e.target.value)}
          />
          <label className="block text-sm font-semibold">
            Tipo de empreendimento ou organização *
            <select
              required
              className={`${inputClass} mt-2`}
              value={form.tipo}
              onChange={(e) => change("tipo", e.target.value)}
            >
              <option value="">Selecione</option>
              {TIPOS_ORGANIZACAO.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-semibold">
            O empreendimento está funcionando? *
            <select
              required
              className={`${inputClass} mt-2`}
              value={form.funcionamento}
              onChange={(e) => change("funcionamento", e.target.value)}
            >
              <option value="">Selecione</option>
              <option value="em_atividade">Sim, em atividade</option>
              <option value="em_implantacao">Em implantação</option>
              <option value="inativo">Não, está inativo</option>
            </select>
          </label>
          <label className="block text-sm font-semibold">
            Possui CNPJ? *
            <select
              required
              className={`${inputClass} mt-2`}
              value={form.possui_cnpj}
              onChange={(e) => {
                change("possui_cnpj", e.target.value);
                change("cnpj", "");
                change("situacao_cnpj", "");
              }}
            >
              <option value="">Selecione</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
              <option value="nao_sei">Não sei informar</option>
            </select>
          </label>
          {form.possui_cnpj === "sim" && (
            <>
              <Field
                label="Número do CNPJ"
                required
                minLength={14}
                maxLength={18}
                value={form.cnpj}
                onChange={(e) => change("cnpj", e.target.value)}
                hint="Informe o CNPJ. Ele fica na análise administrativa; não é exibido no dashboard público."
              />
              <label className="block text-sm font-semibold">
                Qual é a situação do CNPJ? *
                <select
                  required
                  className={`${inputClass} mt-2`}
                  value={form.situacao_cnpj}
                  onChange={(e) => change("situacao_cnpj", e.target.value)}
                >
                  <option value="">Selecione</option>
                  <option value="ativo">Ativo</option>
                  <option value="inativo">
                    Inativo, baixado, suspenso ou inapto
                  </option>
                  <option value="nao_sei">Não sei informar</option>
                </select>
                <span className="mt-1 block font-normal text-forest-500">
                  Informação declarada por quem preenche. A equipe confere na
                  análise.
                </span>
              </label>
            </>
          )}
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
          <label className="block text-sm font-semibold">
            Oferece produtos ou serviços? *
            <select
              required
              className={`${inputClass} mt-2`}
              value={form.possui_produtos}
              onChange={(e) => change("possui_produtos", e.target.value)}
            >
              <option value="">Selecione</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </select>
          </label>
          {form.finalidade === "vitrine" && form.possui_produtos === "nao" && (
            <Message>
              Para entrar na vitrine é necessário oferecer produtos ou serviços.
              Selecione Somente dashboard e parceria para contribuir com o
              Observatório.
            </Message>
          )}
          {form.possui_produtos === "sim" && (
            <Field
              label="Produtos ou serviços"
              required
              maxLength={1500}
              hint="Separe por vírgulas. Até 30 produtos ou serviços."
              value={form.produtos}
              onChange={(e) => change("produtos", e.target.value)}
            />
          )}
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
          <Field
            label="Site da organização (opcional)"
            type="url"
            maxLength={500}
            placeholder="https://exemplo.org.br"
            value={form.site}
            onChange={(e) => change("site", e.target.value)}
          />
          <TextField
            label="Como pode colaborar com o Observatório?"
            required={form.finalidade === "dashboard"}
            maxLength={2000}
            minLength={10}
            hint="Ex.: pesquisa, dados, formação, apoio técnico, divulgação ou articulação de parceiros."
            value={form.colaboracao}
            onChange={(e) => change("colaboracao", e.target.value)}
          />
          <fieldset className="space-y-4 rounded-xl border border-forest-200 p-4">
            <legend className="font-semibold">Dados para os indicadores</legend>
            <p className="text-sm text-forest-600">
              Preencha apenas o que souber. Deixe em branco se não tiver a
              informação; informe 0 somente quando o valor for realmente zero.
              Os dados aprovados alimentam os indicadores públicos.
            </p>
            <Field
              label="Ano de referência dos números"
              type="number"
              min={2000}
              max={new Date().getFullYear()}
              required={
                !!(
                  form.trabalhadores ||
                  form.familias ||
                  form.producao_anual_ton
                )
              }
              value={form.ano_referencia}
              onChange={(e) => change("ano_referencia", e.target.value)}
            />
            <Field
              label="Quantidade de pessoas que trabalham na organização (opcional)"
              type="number"
              min={0}
              max={10000000}
              step={1}
              value={form.trabalhadores}
              onChange={(e) => change("trabalhadores", e.target.value)}
            />
            <Field
              label="Quantidade de famílias diretamente envolvidas (opcional)"
              type="number"
              min={0}
              max={10000000}
              step={1}
              value={form.familias}
              onChange={(e) => change("familias", e.target.value)}
            />
            <Field
              label="Produção anual em toneladas (opcional)"
              type="number"
              min={0}
              max={1000000000}
              step="0.001"
              value={form.producao_anual_ton}
              onChange={(e) => change("producao_anual_ton", e.target.value)}
              hint="Somente para produtos medidos em massa. Não estime serviços em toneladas."
            />
          </fieldset>
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
            responsável para usar os dados nos indicadores públicos após
            aprovação
            {form.finalidade === "vitrine"
              ? ", incluindo a divulgação do perfil, produtos, serviços e contatos na vitrine"
              : ". Este envio é somente para o dashboard e a parceria, sem divulgação de contatos na vitrine"}
            .
          </label>
          {error && <Message error>{error}</Message>}
          <button
            disabled={
              busy ||
              (form.finalidade === "vitrine" && form.possui_produtos !== "sim")
            }
            className="btn-primary w-full py-4"
          >
            {busy ? "Enviando…" : "Enviar cadastro para aprovação"}
          </button>
        </form>
      </div>
    </div>
  );
}
