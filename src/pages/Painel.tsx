import { useEffect } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLoad } from "../hooks/useData";
import {
  fetchMinhaEmpresa,
  fetchPublicacoes,
  fetchAvisos,
} from "../lib/queries";
import { Message } from "../components/FormUI";
import PublicacaoCard from "../components/PublicacaoCard";
export default function Painel() {
  const auth = useAuth(),
    [params] = useSearchParams();
  const state = useLoad(async () => {
    if (!auth.user) return null;
    const empresa = await fetchMinhaEmpresa(auth.user.id);
    if (!empresa) return { empresa: null, posts: [], avisos: [] };
    const [posts, avisos] = await Promise.all([
      fetchPublicacoes(empresa.id),
      fetchAvisos(empresa.id),
    ]);
    return { empresa, posts, avisos };
  }, auth.user?.id ?? "");
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible") state.refresh();
    };
    const interval = window.setInterval(refresh, 30000);
    window.addEventListener("focus", refresh);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", refresh);
    };
  }, [state.refresh]);
  if (auth.loading)
    return <p className="container-page py-14">Carregando acesso…</p>;
  if (!auth.user) return <Navigate to="/entrar" replace />;
  if (auth.isAdmin) return <Navigate to="/admin" replace />;
  const d = state.data;
  return (
    <div className="container-page py-10">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <span className="eyebrow">Área do empreendedor</span>
          <h1 className="mt-2 font-display text-3xl">
            {d?.empresa?.nome ?? "Meu painel"}
          </h1>
          <p className="mt-2 text-forest-600">
            Apresente seu negócio e acompanhe suas publicações.
          </p>
        </div>
        <Link to="/publicar" className="btn-primary px-8">
          + Publicar
        </Link>
      </div>
      {params.get("senha") === "alterada" && (
        <div className="mt-5">
          <Message>Senha alterada com sucesso.</Message>
        </div>
      )}
      {(auth.error || state.error) && (
        <div className="mt-6">
          <Message error>{auth.error || state.error}</Message>
        </div>
      )}
      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <Link className="underline" to="/redefinir-senha">
          Alterar minha senha
        </Link>
        <button className="underline" onClick={state.refresh}>
          Atualizar publicações
        </button>
        {d?.empresa?.aprovado && (
          <Link className="underline" to={`/vitrine/${d.empresa.id}`}>
            Ver meu perfil público
          </Link>
        )}
      </div>
      {state.loading ? (
        <p className="py-12">Carregando publicações…</p>
      ) : d && !d.empresa ? (
        <div className="card mt-8 space-y-4 p-8">
          <h2 className="font-display text-2xl">
            Seu negócio merece ser conhecido
          </h2>
          <p>
            Clique em Publicar, preencha as informações do empreendimento e
            envie sua primeira publicação. Depois da análise, ela aparece no seu
            perfil público.
          </p>
          <Link className="btn-primary" to="/publicar">
            Publicar pela primeira vez
          </Link>
        </div>
      ) : (
        d?.empresa && (
          <>
            <section className="card mt-8 p-6" aria-label="Avisos da equipe">
              <h2 className="font-display text-xl font-semibold">
                Avisos da equipe
              </h2>
              {d.avisos.length ? (
                d.avisos.slice(0, 5).map((a) => (
                  <p
                    key={a.id}
                    className="mt-4 border-t border-forest-100 pt-3 text-sm"
                  >
                    <time className="mr-3 text-forest-500">
                      {new Date(a.created_at).toLocaleDateString("pt-BR")}
                    </time>
                    {a.mensagem}
                  </p>
                ))
              ) : (
                <p className="mt-3">Os retornos da equipe aparecerão aqui.</p>
              )}
            </section>
            <section className="mt-8 space-y-5">
              <h2 className="font-display text-2xl">Minhas publicações</h2>
              {d.posts.length ? (
                d.posts.map((p) => (
                  <div key={p.id}>
                    <PublicacaoCard post={p} showStatus />
                    {p.status === "rejeitado" && (
                      <Link className="btn-primary mt-3" to="/publicar">
                        Enviar nova versão para análise
                      </Link>
                    )}
                  </div>
                ))
              ) : (
                <Message>
                  Você ainda não enviou publicações. Clique em Publicar para
                  começar.
                </Message>
              )}
            </section>
          </>
        )
      )}
    </div>
  );
}
