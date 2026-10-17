import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLoad } from "../hooks/useData";
import {
  db,
  fetchEmpresasAdmin,
  fetchPublicacoes,
  mensagemErro,
} from "../lib/queries";
import { MUNICIPIOS } from "../data/municipios";
import PublicacaoCard from "../components/PublicacaoCard";
import AcessoEmpresa from "../components/AcessoEmpresa";
import AparenciaAdmin from "../components/AparenciaAdmin";
import { Message, TextField } from "../components/FormUI";
export default function Admin() {
  const auth = useAuth(),
    [tab, setTab] = useState<
      "pendente" | "aprovado" | "rejeitado" | "empresas"
    >("pendente"),
    [parecer, setParecer] = useState(""),
    [review, setReview] = useState(""),
    [busy, setBusy] = useState(""),
    [error, setError] = useState(""),
    [message, setMessage] = useState("");
  const state = useLoad(async () => {
    if (!auth.isAdmin) return null;
    const [empresas, posts] = await Promise.all([
      fetchEmpresasAdmin(),
      fetchPublicacoes(),
    ]);
    return { empresas, posts };
  }, `${auth.user?.id}:${auth.isAdmin}`);
  async function revisar(id: string, aprovar: boolean) {
    setBusy(id);
    setError("");
    setMessage("");
    try {
      const { error } = await db().rpc("revisar_publicacao", {
        p_id: id,
        p_aprovar: aprovar,
        p_parecer: parecer,
      });
      if (error) throw error;
      setReview("");
      setParecer("");
      setMessage(
        aprovar
          ? "Publicação aprovada. Perfil atualizado e aviso enviado ao painel da empresa."
          : "Pedido de ajuste enviado ao painel da empresa.",
      );
      state.refresh();
    } catch (e) {
      setError(mensagemErro(e));
    } finally {
      setBusy("");
    }
  }
  if (auth.loading)
    return <p className="container-page py-14">Carregando acesso…</p>;
  if (!auth.user) return <Navigate to="/entrar" replace />;
  if (auth.error)
    return (
      <div className="container-page py-14">
        <Message error>{auth.error}</Message>
      </div>
    );
  if (!auth.isAdmin) return <Navigate to="/painel" replace />;
  const empresas = state.data?.empresas ?? [],
    posts = state.data?.posts ?? [],
    byId = Object.fromEntries(empresas.map((e) => [e.id, e]));
  return (
    <div className="container-page py-10">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <span className="eyebrow">Administração</span>
          <h1 className="mt-2 font-display text-3xl">
            Empreendimentos e publicações
          </h1>
          <p className="mt-3 text-forest-600">
            Revise as informações antes de publicar e organize os acessos das
            empresas.
          </p>
        </div>
        <Link className="btn-primary" to="/admin/novo">
          + Criar cadastro de empreendimento
        </Link>
      </div>
      <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[
          [empresas.length, "Empreendimentos reais"],
          [
            posts.filter((p) => p.status === "pendente").length,
            "Publicações em análise",
          ],
          [
            posts.filter((p) => p.status === "aprovado").length,
            "Publicações aprovadas",
          ],
        ].map(([n, label]) => (
          <div className="card p-5" key={label}>
            <p className="font-display text-3xl">{n}</p>
            <p className="text-sm text-forest-500">{label}</p>
          </div>
        ))}
      </div>
      <div className="card mt-6 p-5">
        <h2 className="font-semibold">
          Link para receber novos empreendedores
        </h2>
        <input
          aria-label="Link de cadastro"
          className="mt-3 w-full bg-transparent text-sm"
          readOnly
          value={`${location.origin}${import.meta.env.BASE_URL}cadastro`}
          onFocus={(e) => e.target.select()}
        />
        <p className="mt-2 text-sm text-forest-500">
          Criar conta, entrar, clicar em Publicar e enviar o formulário.
        </p>
      </div>
      <div className="my-6 flex flex-wrap gap-2">
        {(
          [
            ["pendente", "Em análise"],
            ["aprovado", "Aprovadas"],
            ["rejeitado", "Ajustes solicitados"],
            ["empresas", "Empreendimentos e acessos"],
          ] as const
        ).map(([key, label]) => (
          <button
            aria-pressed={tab === key}
            key={key}
            onClick={() => setTab(key)}
            className={tab === key ? "btn-primary" : "btn-ghost"}
          >
            {label}
          </button>
        ))}
        <button className="btn-ghost" onClick={state.refresh}>
          Atualizar
        </button>
      </div>
      {(error || state.error) && (
        <Message error>{error || state.error}</Message>
      )}
      {message && <Message>{message}</Message>}
      {state.loading ? (
        <p className="py-12">Carregando dados…</p>
      ) : tab === "empresas" ? (
        <div className="space-y-4">
          {empresas.length === 0 && (
            <Message>
              Nenhum empreendimento real cadastrado ainda. Use Criar cadastro de
              empreendimento ou compartilhe o link.
            </Message>
          )}
          {empresas.map((e) => (
            <article className="card p-6" key={e.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-xl font-semibold">
                    {e.nome}
                  </h2>
                  <p className="text-sm text-forest-500">
                    {
                      MUNICIPIOS.find((m) => m.codigo === e.municipioCodigo)
                        ?.nome
                    }{" "}
                    · {e.categoria}
                  </p>
                  <p className="mt-2 text-sm">
                    {e.responsavel} {e.comunidade && `· ${e.comunidade}`}
                  </p>
                  <p className="mt-1 text-sm">
                    Contato público: {e.contato.telefone}{" "}
                    {e.contato.email && `· ${e.contato.email}`}
                  </p>
                </div>
                <Link className="btn-ghost" to={`/publicar?empresa=${e.id}`}>
                  Criar publicação
                </Link>
              </div>
              <p className="mt-4 whitespace-pre-wrap text-sm text-forest-700">
                {e.historia}
              </p>
              <AcessoEmpresa id={e.id} nome={e.nome} />
            </article>
          ))}
        </div>
      ) : (
        <div className="space-y-7">
          {posts.filter((p) => p.status === tab).length === 0 && (
            <Message>Nenhuma publicação nesta situação.</Message>
          )}
          {posts
            .filter((p) => p.status === tab)
            .map((p) => (
              <section className="space-y-3" key={p.id}>
                <div className="flex flex-wrap justify-between gap-2">
                  <h2 className="font-semibold">
                    {byId[p.empreendimento_id]?.nome}
                  </h2>
                  <span className="text-sm text-forest-500">
                    {
                      MUNICIPIOS.find(
                        (m) =>
                          m.codigo ===
                          byId[p.empreendimento_id]?.municipioCodigo,
                      )?.nome
                    }{" "}
                    · {byId[p.empreendimento_id]?.categoria}
                  </span>
                </div>
                <details className="card p-4">
                  <summary className="cursor-pointer text-sm font-semibold">
                    Ver dados do empreendimento
                  </summary>
                  <p className="mt-3 whitespace-pre-wrap text-sm">
                    {byId[p.empreendimento_id]?.historia}
                  </p>
                  <p className="mt-3 text-sm">
                    Responsável: {byId[p.empreendimento_id]?.responsavel} ·{" "}
                    {byId[p.empreendimento_id]?.contato.telefone}
                  </p>
                </details>
                <PublicacaoCard post={p} showStatus />
                {p.status === "pendente" && (
                  <div className="card space-y-4 p-5">
                    {review === p.id && (
                      <TextField
                        label="O que precisa ser ajustado?"
                        required
                        minLength={5}
                        maxLength={1000}
                        value={parecer}
                        onChange={(e) => setParecer(e.target.value)}
                      />
                    )}
                    <div className="flex flex-wrap gap-3">
                      <button
                        disabled={Boolean(busy)}
                        className="btn-primary"
                        onClick={() => void revisar(p.id, true)}
                      >
                        {busy === p.id ? "Processando…" : "Aprovar e publicar"}
                      </button>
                      {review === p.id ? (
                        <button
                          disabled={Boolean(busy) || parecer.trim().length < 5}
                          className="btn-ghost"
                          onClick={() => void revisar(p.id, false)}
                        >
                          Enviar pedido de ajuste
                        </button>
                      ) : (
                        <button
                          className="btn-ghost"
                          onClick={() => {
                            setReview(p.id);
                            setParecer("");
                          }}
                        >
                          Solicitar ajustes
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </section>
            ))}
        </div>
      )}
      <AparenciaAdmin />
    </div>
  );
}
