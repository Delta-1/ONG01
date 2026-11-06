import { useEffect } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLoad } from "../hooks/useData";
import { db, fetchMinhaEmpresa, fetchPublicacoes, fetchAvisos } from "../lib/queries";
import { Message } from "../components/FormUI";
import PublicacaoCard from "../components/PublicacaoCard";
import { DicaCadastro, EtapasCadastro } from "../components/GuiaCadastro";
import { PageArtwork } from "../components/BrandArt";
import { nomeParticipacao, type Contribuicao } from "../lib/participacao";

export default function Painel() {
  const auth = useAuth(), [params] = useSearchParams();
  const state = useLoad(async () => {
    if (!auth.user) return null;
    const [empresa, envios, rascunho] = await Promise.all([
      fetchMinhaEmpresa(auth.user.id),
      db().from("cadastros_rapidos").select("*").eq("owner_id", auth.user.id).order("created_at", { ascending: false }),
      db().from("rascunhos_parceiros").select("updated_at").eq("owner_id", auth.user.id).maybeSingle(),
    ]);
    if (envios.error) throw envios.error;
    if (rascunho.error) throw rascunho.error;
    const [posts, avisos] = empresa ? await Promise.all([fetchPublicacoes(empresa.id), fetchAvisos(empresa.id)]) : [[], []];
    return { empresa, posts, avisos, envios: (envios.data ?? []) as Contribuicao[], rascunho: rascunho.data };
  }, auth.user?.id ?? "");
  useEffect(() => {
    const refresh = () => { if (document.visibilityState === "visible") state.refresh(); };
    const interval = window.setInterval(refresh, 30000);
    window.addEventListener("focus", refresh);
    return () => { window.clearInterval(interval); window.removeEventListener("focus", refresh); };
  }, [state.refresh]);
  if (auth.loading) return <p className="container-page py-14">Carregando acesso…</p>;
  if (!auth.user) return <Navigate to="/entrar" replace />;
  if (auth.isAdmin) return <Navigate to="/admin" replace />;
  const d = state.data;
  const ultimo = d?.envios[0];
  const pendente = ultimo?.status === "pendente";
  const aprovado = d?.envios.some((c) => c.status === "aprovado") || d?.empresa?.aprovado;
  const nome = String(auth.user.user_metadata?.nome ?? "").split(" ")[0];
  const escolha = params.get("participacao");
  const editar = "/contribuir" + (escolha ? "?participacao=" + encodeURIComponent(escolha) : "");
  return (
    <div className="container-page py-8 sm:py-12"><div className="mx-auto max-w-5xl">
      <PageArtwork motif="castanha" />
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div><span className="eyebrow">Meu espaço no Observatório</span><h1 className="mt-2 font-display text-3xl sm:text-4xl">{d?.empresa?.nome ?? (nome ? "Olá, " + nome + "!" : "Bem-vindo ao seu painel")}</h1><p className="mt-3 text-forest-600">Cadastre sua organização, acompanhe a análise e mantenha seus dados atualizados.</p></div>
        <div className="flex flex-wrap gap-3">{!pendente && <Link to={editar} className="btn-primary">{aprovado ? "Editar dados e participação" : d?.rascunho ? "Continuar meu cadastro" : "Cadastrar minha organização"}</Link>}{d?.empresa?.aprovado && <Link to="/publicar" className="btn-ghost">+ Nova publicação</Link>}</div>
      </div>
      <EtapasCadastro atual={aprovado ? 2 : ultimo ? 2 : 1} nomes={["Acesso criado", "Dados da organização", "Análise e publicação"]} />
      {params.get("envio") === "recebido" && <div className="mb-5"><Message>Envio recebido! A ONG vai analisar as informações. O retorno aparece neste painel; seus dados ainda não foram publicados.</Message></div>}
      {params.get("senha") === "alterada" && <Message>Senha alterada com sucesso.</Message>}
      {(auth.error || state.error) && <Message error>{auth.error || state.error}</Message>}
      {state.loading ? <p className="py-12">Carregando seu cadastro…</p> : <>
        {!ultimo && <DicaCadastro titulo={d?.rascunho ? "Seu rascunho está guardado" : "O próximo passo é apresentar seu trabalho"}>{d?.rascunho ? "Clique em Continuar meu cadastro para recuperar as informações salvas. A ONG só recebe o formulário quando você concluir o envio." : "Clique em Cadastrar minha organização. Você escolhe vitrine, dashboard ou ambos, preenche algumas informações e envia para a ONG aprovar. Não é preciso fazer tudo de uma vez."}</DicaCadastro>}
        {ultimo && <section className="card space-y-4 p-6 sm:p-8" aria-label="Situação do meu cadastro">
          <span className="chip">{ultimo.status === "pendente" ? "Em análise pela ONG" : ultimo.status === "aprovado" ? "Cadastro aprovado" : "A ONG pediu ajustes"}</span>
          <h2 className="font-display text-2xl">{String(ultimo.dados.nome)}</h2>
          <p className="font-semibold text-forest-700">{nomeParticipacao(String(ultimo.dados.participacao ?? ""), String(ultimo.dados.finalidade ?? ""))}</p>
          <p>{ultimo.status === "pendente" ? "Recebemos seus dados. A equipe vai conferir antes de divulgar. Você pode voltar aqui para acompanhar." : ultimo.status === "aprovado" ? "A equipe aprovou seu envio para a finalidade escolhida. Para alterar informações, envie uma atualização; a versão publicada só muda depois de nova aprovação." : "Veja a orientação abaixo, corrija as informações e envie novamente."}</p>
          {ultimo.parecer && <div className="rounded-xl bg-forest-50 p-4"><strong className="text-sm">Retorno da equipe</strong><p className="mt-2 whitespace-pre-wrap">{ultimo.parecer}</p></div>}
          <p className="text-xs text-forest-500">Enviado em {new Date(ultimo.created_at).toLocaleString("pt-BR")}{ultimo.reviewed_at && " · Analisado em " + new Date(ultimo.reviewed_at).toLocaleString("pt-BR")}</p>
          {ultimo.status === "rejeitado" && <Link className="btn-primary" to={editar}>Corrigir e reenviar</Link>}
          {ultimo.status === "aprovado" && <div className="flex flex-wrap gap-3">{d?.empresa?.aprovado && <Link className="btn-primary" to={"/vitrine/" + d.empresa.id}>Ver minha página na vitrine</Link>}{ultimo.dados.participacao !== "vitrine" && <Link className="btn-ghost" to="/observatorio">Explorar o dashboard</Link>}</div>}
        </section>}
        {d?.empresa && <>
          <section className="card mt-7 p-6" aria-label="Avisos da equipe"><h2 className="font-display text-xl">Avisos e publicações</h2>{d.avisos.length ? d.avisos.slice(0,5).map((a) => <p key={a.id} className="mt-4 border-t border-forest-100 pt-3 text-sm">{a.mensagem}</p>) : <p className="mt-3 text-sm">Os avisos da ONG aparecem aqui.</p>}</section>
          {d.posts.length > 0 && <section className="mt-8 space-y-5"><h2 className="font-display text-2xl">Minhas publicações</h2>{d.posts.map((p) => <PublicacaoCard key={p.id} post={p} showStatus />)}</section>}
        </>}
        {d && d.envios.length > 1 && <details className="card mt-7 p-5"><summary className="cursor-pointer font-semibold">Histórico dos meus envios ({d.envios.length})</summary><ul className="mt-4 space-y-3">{d.envios.map((c) => <li key={c.id} className="border-t border-forest-100 pt-3 text-sm">{new Date(c.created_at).toLocaleString("pt-BR")} · {c.status === "aprovado" ? "Aprovado" : c.status === "pendente" ? "Em análise" : "Ajustes solicitados"} · {nomeParticipacao(String(c.dados.participacao ?? ""), String(c.dados.finalidade ?? ""))}</li>)}</ul></details>}
      </>}
      <div className="mt-8 flex flex-wrap gap-5 text-sm"><button className="underline" onClick={state.refresh}>Atualizar situação</button><Link className="underline" to="/redefinir-senha">Alterar minha senha</Link><button className="underline" onClick={() => void auth.signOut()}>Sair da minha conta</button></div>
    </div></div>
  );
}
