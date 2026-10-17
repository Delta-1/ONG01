import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { db, mensagemErro } from "../lib/queries";
import type { Publicacao } from "../data/types";
import { Message } from "./FormUI";
export default function PublicacaoCard({
  post,
  showStatus = false,
}: {
  post: Publicacao;
  showStatus?: boolean;
}) {
  const { user } = useAuth(),
    [total, setTotal] = useState(0),
    [curtido, setCurtido] = useState(false),
    [busy, setBusy] = useState(false),
    [erro, setErro] = useState("");
  useEffect(() => {
    let active = true;
    db()
      .rpc("curtidas_publicacao", { p_ids: [post.id] })
      .then(({ data, error }) => {
        if (active) {
          if (error) setErro("Não foi possível carregar as curtidas.");
          else {
            setTotal(Number(data?.[0]?.total ?? 0));
            setCurtido(Boolean(data?.[0]?.curtido));
          }
        }
      });
    return () => {
      active = false;
    };
  }, [post.id, user?.id]);
  async function toggle() {
    if (!user || busy) return;
    setBusy(true);
    setErro("");
    try {
      const q = curtido
        ? db()
            .from("publicacao_curtidas")
            .delete()
            .eq("publicacao_id", post.id)
            .eq("user_id", user.id)
        : db()
            .from("publicacao_curtidas")
            .insert({ publicacao_id: post.id, user_id: user.id });
      const { error } = await q;
      if (error) throw error;
      setTotal((n) => n + (curtido ? -1 : 1));
      setCurtido(!curtido);
    } catch (e) {
      setErro(mensagemErro(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <article className="card overflow-hidden">
      {post.imagem_url && (
        <img
          src={post.imagem_url}
          alt={`Foto de ${post.titulo}`}
          className="max-h-96 w-full object-cover"
          loading="lazy"
        />
      )}
      <div className="space-y-4 p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <time className="text-xs text-forest-500">
            {new Date(post.created_at).toLocaleDateString("pt-BR")}
          </time>
          {showStatus && (
            <span className="chip">
              {post.status === "aprovado"
                ? "Aprovada"
                : post.status === "rejeitado"
                  ? "Precisa de ajustes"
                  : "Em análise"}
            </span>
          )}
        </div>
        <h3 className="font-display text-2xl font-semibold text-forest-900">
          {post.titulo}
        </h3>
        <p className="whitespace-pre-wrap break-words leading-relaxed text-forest-700">
          {post.conteudo}
        </p>
        {post.produtos.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.produtos.map((p, i) => (
              <span key={`${p}-${i}`} className="chip">
                {p}
              </span>
            ))}
          </div>
        )}
        {post.processo && (
          <div>
            <h4 className="font-semibold">Como fazemos</h4>
            <p className="whitespace-pre-wrap break-words text-forest-700">
              {post.processo}
            </p>
          </div>
        )}
        {post.impacto && (
          <div>
            <h4 className="font-semibold">Nossa contribuição</h4>
            <p className="whitespace-pre-wrap break-words text-forest-700">
              {post.impacto}
            </p>
          </div>
        )}
        {showStatus && post.parecer && <Message>{post.parecer}</Message>}
        {post.status === "aprovado" &&
          (user ? (
            <button
              disabled={busy}
              aria-pressed={curtido}
              onClick={toggle}
              className="btn-ghost"
            >
              {curtido ? "♥ Curtido" : "♡ Curtir"} · {total}
            </button>
          ) : (
            <Link className="btn-ghost" to="/entrar">
              ♡ {total} · Entre para curtir
            </Link>
          ))}
        {erro && <Message error>{erro}</Message>}
      </div>
    </article>
  );
}
