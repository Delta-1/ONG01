import { Link, useParams } from "react-router-dom";
import { useLoad } from "../hooks/useData";
import { db, mapEmpresa, fetchPublicacoes } from "../lib/queries";
import { MUNICIPIOS } from "../data/municipios";
import PublicacaoCard from "../components/PublicacaoCard";
import { Message } from "../components/FormUI";
export default function EmpreendimentoDetalhe() {
  const { id } = useParams();
  const state = useLoad(async () => {
    const { data, error } = await db()
      .from("empreendimentos")
      .select("*")
      .eq("id", id!)
      .eq("aprovado", true)
      .eq("is_demo", false)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    const posts = await fetchPublicacoes(id);
    return {
      empresa: mapEmpresa(data),
      posts: posts.filter((p) => p.status === "aprovado"),
    };
  }, id);
  if (state.loading)
    return <p className="container-page py-14">Carregando perfil…</p>;
  if (state.error)
    return (
      <div className="container-page py-14">
        <Message error>{state.error}</Message>
        <button className="btn-primary mt-4" onClick={state.refresh}>
          Tentar novamente
        </button>
      </div>
    );
  if (!state.data)
    return (
      <div className="container-page py-14">
        <h1 className="font-display text-2xl">Perfil não disponível</h1>
        <p className="mt-3">Ele pode estar aguardando análise.</p>
        <Link className="btn-primary mt-5" to="/vitrine">
          Voltar à vitrine
        </Link>
      </div>
    );
  const { empresa: e, posts } = state.data,
    mun = MUNICIPIOS.find((m) => m.codigo === e.municipioCodigo),
    phone = e.contato.telefone.replace(/\D/g, "");
  return (
    <div className="container-page py-10">
      <Link className="text-sm underline" to="/vitrine">
        ← Todos os empreendimentos
      </Link>
      <header className="mt-6 rounded-2xl bg-forest-900 p-7 text-white sm:p-10">
        <span className="chip">{e.categoria}</span>
        <h1 className="mt-4 font-display text-3xl sm:text-4xl">{e.nome}</h1>
        <p className="mt-3 text-forest-100">
          {mun?.nome} · {mun?.regiao}
          {e.comunidade && ` · ${e.comunidade}`}
        </p>
      </header>
      <div className="mt-8 grid items-start gap-8 lg:grid-cols-3">
        <aside className="card space-y-5 p-6 lg:col-span-1">
          <h2 className="font-display text-xl font-semibold">Quem somos</h2>
          <p className="whitespace-pre-wrap break-words text-forest-700">
            {e.historia}
          </p>
          <p className="text-sm text-forest-500">{e.tipo}</p>
          <h3 className="font-semibold">Contato</h3>
          <p>{e.contato.telefone}</p>
          {phone && (
            <a
              href={`https://wa.me/${phone.startsWith("55") ? phone : `55${phone}`}`}
              target="_blank"
              rel="noreferrer"
              className="btn-primary w-full"
            >
              Conversar pelo WhatsApp
            </a>
          )}
          {e.contato.email && (
            <a
              className="block break-words underline"
              href={`mailto:${e.contato.email}`}
            >
              {e.contato.email}
            </a>
          )}
          {e.contato.instagram && (
            <p className="break-words">Instagram: {e.contato.instagram}</p>
          )}
          <Link className="block text-sm underline" to="/observatorio">
            Ver dados dos municípios
          </Link>
        </aside>
        <section className="space-y-6 lg:col-span-2">
          <h2 className="font-display text-2xl">Publicações</h2>
          {posts.length ? (
            posts.map((p) => <PublicacaoCard key={p.id} post={p} />)
          ) : (
            <Message>
              Este empreendimento ainda não tem publicações aprovadas.
            </Message>
          )}
        </section>
      </div>
    </div>
  );
}
