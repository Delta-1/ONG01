import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLoad } from "../hooks/useData";
import { db, mensagemErro } from "../lib/queries";
import { novoId } from "../lib/uuid";
import { MUNICIPIOS } from "../data/municipios";
import { TIPOS_ORGANIZACAO } from "../lib/parceiros";
import { OPCOES_PARTICIPACAO, nomeParticipacao, type Contribuicao, type Participacao } from "../lib/participacao";
import { DicaCadastro, EtapasCadastro } from "../components/GuiaCadastro";
import { Field, TextField, Message, inputClass } from "../components/FormUI";
import { PageArtwork } from "../components/BrandArt";

const vazio = { participacao: "ambos" as Participacao, nome: "", tipo: "", funcionamento: "", municipio_codigo: "", comunidade: "", categoria: "", possui_produtos: "", produtos: "", historia: "", telefone: "", email: "", site: "", instagram: "", possui_cnpj: "", cnpj: "", situacao_cnpj: "", responsavel: "", colaboracao: "", trabalhadores: "", familias: "", producao_anual_ton: "", ano_referencia: "" };
type Form = typeof vazio;
const nomesEtapas = ["Participação", "Organização", "Apresentação", "Revisão"];

export default function Contribuir() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState<Form>(vazio);
  const [etapa, setEtapa] = useState(0);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [foto, setFoto] = useState<File | null>(null);
  const initialized = useRef(false);
  const submissionId = useRef(novoId());
  const state = useLoad(async () => {
    if (!auth.user) return null;
    const [envios, draft] = await Promise.all([
      db().from("cadastros_rapidos").select("*").eq("owner_id", auth.user.id).order("created_at", { ascending: false }),
      db().from("rascunhos_parceiros").select("dados,updated_at").eq("owner_id", auth.user.id).maybeSingle(),
    ]);
    if (envios.error) throw envios.error;
    if (draft.error) throw draft.error;
    return { envios: (envios.data ?? []) as Contribuicao[], draft: draft.data };
  }, auth.user?.id ?? "");
  const aprovado = state.data?.envios.find((c) => c.status === "aprovado");
  const pendente = state.data?.envios.find((c) => c.status === "pendente");
  const vitrine = form.participacao !== "dashboard";
  const dashboard = form.participacao !== "vitrine";
  const municipio = MUNICIPIOS.find((m) => m.codigo === form.municipio_codigo);

  useEffect(() => {
    if (!state.data || initialized.current) return;
    initialized.current = true;
    const ultimo = state.data.envios[0];
    const saved = (state.data.draft?.dados ?? ultimo?.dados ?? {}) as Record<string, unknown>;
    const next = { ...vazio };
    for (const k of Object.keys(vazio) as (keyof Form)[]) {
      const value = saved[k];
      if (k === "produtos" && Array.isArray(value)) next.produtos = value.join(", ");
      else if (value !== null && value !== undefined) (next as Record<string, string>)[k] = String(value);
    }
    if (!["vitrine", "dashboard", "ambos"].includes(next.participacao)) next.participacao = "ambos";
    const escolha = params.get("participacao");
    if (!ultimo && !state.data.draft && escolha && ["vitrine", "dashboard", "ambos"].includes(escolha)) next.participacao = escolha as Participacao;
    setForm(next);
    if (state.data.draft) setAviso("Seu rascunho foi recuperado. Continue de onde parou; ele ainda não foi enviado à ONG.");
  }, [state.data, params]);

  function change(k: keyof Form, value: string) { setForm((f) => ({ ...f, [k]: value })); }
  async function saveDraft() {
    if (!auth.user || busy) return;
    setBusy(true); setErro("");
    try {
      const { error } = await db().from("rascunhos_parceiros").upsert({ owner_id: auth.user.id, dados: form, updated_at: new Date().toISOString() });
      if (error) throw error;
      setAviso("Rascunho salvo na sua conta. Você pode sair e continuar depois. A foto deve ser selecionada novamente.");
    } catch (e) { setErro(mensagemErro(e)); } finally { setBusy(false); }
  }
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (etapa < 3) { setEtapa(etapa + 1); setErro(""); window.scrollTo({ top: 0 }); return; }
    if (!auth.user || busy) return;
    setBusy(true); setErro("");
    let path: string | null = null;
    try {
      if (vitrine && foto) {
        if (!["image/jpeg", "image/png", "image/webp"].includes(foto.type) || foto.size > 5 * 1024 * 1024) throw new Error("Escolha uma foto JPG, PNG ou WebP de até 5 MB.");
        const ext = foto.type === "image/png" ? "png" : foto.type === "image/webp" ? "webp" : "jpg";
        path = `${auth.user.id}/${novoId()}.${ext}`;
        const { error } = await db().storage.from("publicacoes").upload(path, foto, { contentType: foto.type });
        if (error) throw error;
      }
      const numero = (k: keyof Form) => dashboard && form[k] !== "" ? Number(form[k]) : null;
      const { error } = await db().rpc("enviar_contribuicao", {
        p_id: submissionId.current,
        p_referencia_id: aprovado ? aprovado.referencia_id ?? aprovado.id : null,
        p_dados: { ...form, preenchido_por: String(auth.user.user_metadata?.nome ?? form.responsavel ?? "Responsável"), produtos: form.possui_produtos === "sim" ? form.produtos.split(",").map((p) => p.trim()).filter(Boolean) : [], trabalhadores: numero("trabalhadores"), familias: numero("familias"), producao_anual_ton: numero("producao_anual_ton"), ano_referencia: numero("ano_referencia"), consentimento: consent, imagem_path: path },
      });
      if (error) throw error;
      navigate("/painel?envio=recebido");
    } catch (e) {
      if (path) await db().storage.from("publicacoes").remove([path]);
      setErro(mensagemErro(e));
    } finally { setBusy(false); }
  }
  if (auth.loading || state.loading) return <p className="container-page py-14">Preparando seu cadastro…</p>;
  if (!auth.user) return <Navigate to="/cadastro" replace />;
  if (auth.isAdmin) return <Navigate to="/admin" replace />;
  if (state.error) return <div className="container-page py-12"><Message error>{state.error}</Message><button className="btn-primary mt-4" onClick={state.refresh}>Tentar novamente</button></div>;
  if (pendente) return <div className="container-page py-12"><div className="card mx-auto max-w-xl space-y-5 p-8"><h1 className="font-display text-3xl">Seu envio está com a ONG</h1><p>A equipe está conferindo as informações. O retorno e eventuais pedidos de ajustes aparecerão no seu painel.</p><Link to="/painel" className="btn-primary">Acompanhar meu cadastro</Link></div></div>;
  return (
    <div className="container-page py-8 sm:py-12"><div className="mx-auto max-w-3xl">
      <Link className="text-sm underline" to="/painel">← Voltar ao meu painel</Link>
      <PageArtwork motif="semente-verde" />
      <span className="eyebrow">Seu trabalho faz parte desta história</span>
      <h1 className="mt-2 font-display text-3xl sm:text-4xl">{aprovado ? "Atualizar meus dados" : "Vamos conhecer sua organização"}</h1>
      <p className="mt-3 text-forest-600">Preencha no seu ritmo. Você pode salvar e continuar depois. A ONG confere tudo antes de divulgar.</p>
      <EtapasCadastro atual={etapa} nomes={nomesEtapas} />
      {aviso && <div className="mb-5"><Message>{aviso}</Message></div>}
      <DicaCadastro titulo={["Onde seu trabalho vai aparecer?", "Não precisa ter CNPJ para participar", "Conte do seu jeito", "Você está no controle"][etapa]}>
        {["A vitrine é sua apresentação pública. O dashboard reúne dados sobre o Acre. Escolha uma opção ou participe dos dois.", "Informe o nome da organização, a atividade e o município. A região é preenchida automaticamente. Quem trabalha de forma individual também pode participar.", "Explique o que sua organização faz, como começou e como podemos entrar em contato. Só divulgue contatos que podem ficar públicos na vitrine.", "Confira os dados e a finalidade. Ao enviar, o cadastro fica privado até a análise. Você acompanha a decisão aqui na sua conta; alterações também passam pela ONG."][etapa]}
      </DicaCadastro>
      <form onSubmit={submit} className="card mt-6 space-y-5 p-5 sm:p-8">
        <p className="text-xs text-forest-500">Etapa {etapa + 1} de 4 · Campos com * são obrigatórios.</p>
        {etapa === 0 && <fieldset className="space-y-3"><legend className="mb-4 font-display text-2xl">Como quer participar?</legend>{OPCOES_PARTICIPACAO.map((p) => <label key={p.id} className={`escolha-participacao ${form.participacao === p.id ? "escolha-ativa" : ""}`}><input type="radio" name="participacao" value={p.id} checked={form.participacao === p.id} onChange={() => change("participacao", p.id)} /><span><strong>{p.titulo}</strong><span className="mt-1 block text-sm font-normal text-forest-600">{p.descricao}</span></span></label>)}</fieldset>}
        {etapa === 1 && <>
          <Field label="Nome do empreendimento ou organização" required minLength={3} maxLength={160} value={form.nome} onChange={(e) => change("nome", e.target.value)} />
          <label className="block text-sm font-semibold">Tipo de organização *<select className={`${inputClass} mt-2`} required value={form.tipo} onChange={(e) => change("tipo", e.target.value)}><option value="">Selecione</option>{TIPOS_ORGANIZACAO.map((t) => <option key={t}>{t}</option>)}</select></label>
          <label className="block text-sm font-semibold">Está funcionando? *<select className={`${inputClass} mt-2`} required value={form.funcionamento} onChange={(e) => change("funcionamento", e.target.value)}><option value="">Selecione</option><option value="em_atividade">Sim, em atividade</option><option value="em_implantacao">Em implantação</option><option value="inativo">Não, está inativo</option></select></label>
          <div className="grid gap-5 sm:grid-cols-2"><label className="block text-sm font-semibold">Município do Acre *<select className={`${inputClass} mt-2`} required value={form.municipio_codigo} onChange={(e) => change("municipio_codigo", e.target.value)}><option value="">Selecione</option>{[...MUNICIPIOS].sort((a,b) => a.nome.localeCompare(b.nome)).map((m) => <option key={m.codigo} value={m.codigo}>{m.nome}</option>)}</select></label><Field label="Região" value={municipio?.regiao ?? "Selecione o município"} readOnly /></div>
          <Field label="Comunidade ou bairro (opcional)" maxLength={200} value={form.comunidade} onChange={(e) => change("comunidade", e.target.value)} />
          <Field label="Atividade principal" required minLength={3} maxLength={120} placeholder="Ex.: artesanato, castanha, pesquisa ou apoio comunitário" value={form.categoria} onChange={(e) => change("categoria", e.target.value)} />
          <label className="block text-sm font-semibold">Possui CNPJ? *<select className={`${inputClass} mt-2`} required value={form.possui_cnpj} onChange={(e) => { change("possui_cnpj", e.target.value); change("cnpj", ""); change("situacao_cnpj", ""); }}><option value="">Selecione</option><option value="sim">Sim</option><option value="nao">Não</option><option value="nao_sei">Não sei informar</option></select></label>
          {form.possui_cnpj === "sim" && <><Field label="CNPJ" required minLength={14} maxLength={18} value={form.cnpj} onChange={(e) => change("cnpj", e.target.value)} hint="Fica na análise administrativa e não aparece no dashboard público." /><label className="block text-sm font-semibold">Situação declarada do CNPJ *<select className={`${inputClass} mt-2`} required value={form.situacao_cnpj} onChange={(e) => change("situacao_cnpj", e.target.value)}><option value="">Selecione</option><option value="ativo">Ativo</option><option value="inativo">Inativo, baixado, suspenso ou inapto</option><option value="nao_sei">Não sei informar</option></select></label></>}
        </>}
        {etapa === 2 && <>
          <TextField label="Conte um pouco sobre seu trabalho" required minLength={30} maxLength={4000} value={form.historia} onChange={(e) => change("historia", e.target.value)} hint="Como começou? O que faz? O que torna seu trabalho especial? Pelo menos 30 caracteres." />
          <label className="block text-sm font-semibold">Oferece produtos ou serviços? *<select className={`${inputClass} mt-2`} required value={form.possui_produtos} onChange={(e) => change("possui_produtos", e.target.value)}><option value="">Selecione</option><option value="sim">Sim</option><option value="nao" disabled={vitrine}>Não</option></select></label>
          {vitrine && form.possui_produtos === "nao" && <Message error>A vitrine é para quem oferece produtos ou serviços. Volte à etapa 1 para escolher somente dashboard.</Message>}
          {form.possui_produtos === "sim" && <Field label="Produtos ou serviços" required maxLength={1500} value={form.produtos} onChange={(e) => change("produtos", e.target.value)} hint="Separe por vírgulas. Ex.: bolsas artesanais, oficinas de costura." />}
          <Field label="Nome do responsável" required minLength={2} maxLength={160} value={form.responsavel} onChange={(e) => change("responsavel", e.target.value)} />
          <Field label={vitrine ? "WhatsApp ou telefone público" : "Telefone para a equipe da ONG"} type="tel" required minLength={8} maxLength={30} value={form.telefone} onChange={(e) => change("telefone", e.target.value)} />
          <Field label="E-mail público de contato (opcional)" type="email" maxLength={254} value={form.email} onChange={(e) => change("email", e.target.value)} hint="Pode ser diferente do e-mail que você usa para entrar." />
          <Field label="Site (opcional)" type="url" maxLength={500} placeholder="https://" value={form.site} onChange={(e) => change("site", e.target.value)} />
          {vitrine && <><Field label="Instagram (opcional)" maxLength={100} value={form.instagram} onChange={(e) => change("instagram", e.target.value)} /><Field label="Foto para a apresentação (opcional)" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setFoto(e.target.files?.[0] ?? null)} hint="JPG, PNG ou WebP, até 5 MB. A imagem também passa pela análise." /></>}
          {dashboard && <>
            <TextField label="Como pode colaborar com o Observatório?" required={!vitrine} minLength={10} maxLength={2000} value={form.colaboracao} onChange={(e) => change("colaboracao", e.target.value)} hint="Ex.: dados, pesquisa, apoio técnico, formação ou articulação." />
            <fieldset className="space-y-4 rounded-xl bg-forest-50 p-4"><legend className="font-semibold">Números que ajudam a conhecer o território</legend><p className="text-sm">São opcionais. Deixe em branco o que não souber; zero significa que a quantidade é realmente zero.</p>
              <Field label="Ano de referência" type="number" min={2000} max={new Date().getFullYear()} required={[form.trabalhadores, form.familias, form.producao_anual_ton].some((v) => v !== "")} value={form.ano_referencia} onChange={(e) => change("ano_referencia", e.target.value)} />
              <Field label="Pessoas que trabalham na organização (opcional)" type="number" min={0} max={10000000} step={1} value={form.trabalhadores} onChange={(e) => change("trabalhadores", e.target.value)} />
              <Field label="Famílias diretamente envolvidas (opcional)" type="number" min={0} max={10000000} step={1} value={form.familias} onChange={(e) => change("familias", e.target.value)} />
              <Field label="Produção anual em toneladas (opcional)" type="number" min={0} max={1000000000} step="0.001" value={form.producao_anual_ton} onChange={(e) => change("producao_anual_ton", e.target.value)} hint="Somente produtos medidos em massa. Serviços não precisam desse campo." />
            </fieldset>
          </>}
        </>}
        {etapa === 3 && <>
          <h2 className="font-display text-2xl">Está tudo certo?</h2>
          <dl className="revisao-cadastro"><div><dt>Participação</dt><dd>{nomeParticipacao(form.participacao)}</dd></div><div><dt>Organização</dt><dd>{form.nome} · {form.tipo}</dd></div><div><dt>Localização</dt><dd>{municipio?.nome} · {municipio?.regiao}</dd></div><div><dt>Atividade</dt><dd>{form.categoria}</dd></div><div><dt>Apresentação</dt><dd className="whitespace-pre-wrap">{form.historia}</dd></div><div><dt>Produtos e serviços</dt><dd>{form.produtos || "Não se aplica"}</dd></div><div><dt>Contato</dt><dd>{form.telefone}</dd></div><div><dt>Foto</dt><dd>{foto?.name ?? "Nenhuma foto nova"}</dd></div></dl>
          <label className="flex items-start gap-3 text-sm"><input type="checkbox" required className="mt-1 h-5 w-5 shrink-0" checked={consent} onChange={(e) => setConsent(e.target.checked)} /><span>Confirmo que tenho autorização para enviar estes dados e autorizo {vitrine ? "a divulgação da apresentação, produtos, serviços e contatos na vitrine" : "a utilização dos dados nos indicadores públicos"}{vitrine && dashboard ? " e dos dados nos indicadores públicos" : ""}, somente após aprovação da ONG.</span></label>
          <Message>{aprovado ? "Os dados já publicados permanecem como estão até a ONG aprovar esta atualização." : "Depois do envio, acompanhe a análise no seu painel. A ONG pode aprovar ou pedir ajustes."}</Message>
        </>}
        {erro && <Message error>{erro}</Message>}
        <div className="flex flex-wrap gap-3 border-t border-forest-100 pt-5">
          {etapa > 0 && <button type="button" className="btn-ghost" disabled={busy} onClick={() => setEtapa(etapa - 1)}>← Voltar</button>}
          <button className="btn-primary grow" disabled={busy || (etapa === 3 && vitrine && form.possui_produtos !== "sim")}>{busy ? "Salvando…" : etapa === 3 ? "Enviar para análise da ONG" : "Continuar →"}</button>
          <button type="button" className="btn-ghost w-full text-sm" disabled={busy} onClick={saveDraft}>Salvar e continuar depois</button>
        </div>
      </form>
    </div></div>
  );
}
