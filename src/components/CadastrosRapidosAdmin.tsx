import { useState } from "react";
import { Link } from "react-router-dom";
import { useLoad } from "../hooks/useData";
import { db, mensagemErro } from "../lib/queries";
import { MUNICIPIOS } from "../data/municipios";
import type { DadosParceiro } from "../lib/parceiros";
import { readAllPages } from "../lib/pagination";
import { Message, TextField } from "./FormUI";
interface Item {
  id: string;
  dados: DadosParceiro & {
    nome: string;
    municipio_codigo: string;
    categoria: string;
    historia: string;
    produtos: string[];
    telefone: string;
    email?: string;
    instagram?: string;
    comunidade?: string;
    responsavel?: string;
    preenchido_por: string;
  };
  status: string;
  created_at: string;
  parecer: string | null;
  empreendimento_id: string | null;
}
export default function CadastrosRapidosAdmin({
  onApproved,
}: {
  onApproved: () => void;
}) {
  const [filter, setFilter] = useState("pendente"),
    [busy, setBusy] = useState(""),
    [error, setError] = useState(""),
    [review, setReview] = useState(""),
    [note, setNote] = useState(""),
    [message, setMessage] = useState(""),
    [copied, setCopied] = useState("");
  const state = useLoad(async () => {
    const data = await readAllPages((from, to) =>
      db()
        .from("cadastros_rapidos")
        .select("*")
        .eq("status", filter)
        .not("dados", "cs", '{"is_demo":true}')
        .order("created_at", { ascending: false })
        .order("id")
        .range(from, to),
    );
    return data as Item[];
  }, filter);
  const link = `${location.origin}${import.meta.env.BASE_URL}formulario`;
  async function copy(path: string) {
    try {
      await navigator.clipboard.writeText(`${link}/${path}`);
      setCopied(path);
    } catch {
      setError("Selecione e copie o link no campo acima.");
    }
  }
  async function decide(id: string, approve: boolean) {
    setBusy(id);
    setError("");
    setMessage("");
    try {
      const { error } = await db().rpc("revisar_cadastro_rapido", {
        p_id: id,
        p_aprovar: approve,
        p_parecer: note,
      });
      if (error) throw error;
      setMessage(
        approve
          ? "Cadastro aprovado para a finalidade escolhida. Os indicadores foram atualizados; somente cadastros de vitrine geram perfil e publicação."
          : "Cadastro não aprovado. A justificativa foi registrada para a equipe.",
      );
      setReview("");
      setNote("");
      state.refresh();
      onApproved();
    } catch (e) {
      setError(mensagemErro(e));
    } finally {
      setBusy("");
    }
  }
  return (
    <section className="card mt-6 p-5 sm:p-6">
      <h2 className="font-display text-2xl">Cadastros do formulário rápido</h2>
      <p className="mt-2 text-sm text-forest-600">
        Compartilhe o link conforme a finalidade. Os dois formulários funcionam
        sem conta, recebem dados reais e passam por aprovação. O parceiro sem
        vitrine contribui somente para o dashboard.
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {[
          ["vitrine", "Autocadastro na vitrine"],
          ["dashboard", "Captação de dados e parceria"],
        ].map(([path, label]) => (
          <div
            className="space-y-3 rounded-lg border border-forest-200 p-4"
            key={path}
          >
            <label className="block text-sm font-semibold">
              {label}
              <input
                className="mt-2 w-full rounded border border-forest-200 p-2 text-xs"
                readOnly
                value={`${link}/${path}`}
                onFocus={(e) => e.target.select()}
              />
            </label>
            <button className="btn-primary" onClick={() => void copy(path)}>
              {copied === path ? "Link copiado" : "Copiar link"}
            </button>
            <Link className="ml-3 text-sm underline" to={`/formulario/${path}`}>
              Abrir
            </Link>
          </div>
        ))}
      </div>
      <div className="my-5 flex flex-wrap gap-2">
        {[
          ["pendente", "Para aprovar"],
          ["aprovado", "Aprovados"],
          ["rejeitado", "Não aprovados"],
        ].map(([v, label]) => (
          <button
            className={filter === v ? "btn-primary" : "btn-ghost"}
            key={v}
            onClick={() => setFilter(v)}
          >
            {label}
          </button>
        ))}
        <button className="btn-ghost" onClick={state.refresh}>
          Atualizar cadastros
        </button>
      </div>
      {(error || state.error) && (
        <Message error>{error || state.error}</Message>
      )}
      {message && <Message>{message}</Message>}
      {state.loading ? (
        <p>Carregando cadastros…</p>
      ) : (
        <div className="space-y-5">
          {!state.data?.filter((i) => i.status === filter).length && (
            <p className="text-sm text-forest-500">
              Nenhum cadastro nesta situação.
            </p>
          )}
          {state.data
            ?.filter((i) => i.status === filter)
            .map((i) => (
              <article
                key={i.id}
                className="rounded-xl border border-forest-200 p-5"
              >
                <h3 className="font-display text-xl font-semibold">
                  {i.dados.nome}
                </h3>
                <p className="mt-2 font-semibold text-sm">
                  {i.dados.finalidade === "dashboard"
                    ? "Somente dashboard e parceria"
                    : "Vitrine e dashboard"}
                </p>
                <p className="mt-2 text-sm text-forest-600">
                  {
                    MUNICIPIOS.find(
                      (m) => m.codigo === i.dados.municipio_codigo,
                    )?.nome
                  }{" "}
                  · {i.dados.categoria}
                  {i.dados.comunidade && ` · ${i.dados.comunidade}`}
                </p>
                <p className="mt-3 whitespace-pre-wrap break-words">
                  {i.dados.historia}
                </p>
                <p className="mt-3 text-sm">
                  Produtos: {i.dados.produtos.join(", ")}
                </p>
                <p className="mt-2 break-words text-sm">
                  Contato: {i.dados.telefone}{" "}
                  {i.dados.email && `· ${i.dados.email}`}{" "}
                  {i.dados.instagram && `· ${i.dados.instagram}`}
                </p>
                <p className="mt-2 text-sm">
                  Responsável: {i.dados.responsavel || "Não informado"}
                </p>
                <p className="mt-2 text-xs text-forest-500">
                  Enviado por {i.dados.preenchido_por}, em{" "}
                  {new Date(i.created_at).toLocaleString("pt-BR")}
                </p>
                <dl className="mt-4 grid gap-2 break-words text-sm sm:grid-cols-2">
                  <div>
                    <dt className="font-semibold">Tipo / funcionamento</dt>
                    <dd>
                      {i.dados.tipo || "Não informado"} ·{" "}
                      {i.dados.funcionamento || "Não informado"}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold">CNPJ (declarado)</dt>
                    <dd>
                      {i.dados.possui_cnpj || "Não informado"}
                      {i.dados.cnpj &&
                        ` · ${i.dados.cnpj} · ${i.dados.situacao_cnpj}`}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold">Site</dt>
                    <dd>{i.dados.site || "Não informado"}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold">Colaboração</dt>
                    <dd>{i.dados.colaboracao || "Não informada"}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold">Quantificação / ano</dt>
                    <dd>
                      {i.dados.ano_referencia ?? "Sem ano"} · Pessoas:{" "}
                      {i.dados.trabalhadores ?? "Não informado"} · Famílias:{" "}
                      {i.dados.familias ?? "Não informado"} · Produção (t):{" "}
                      {i.dados.producao_anual_ton ?? "Não informada"}
                    </dd>
                  </div>
                </dl>
                {i.parecer && (
                  <p className="mt-3 text-sm">Parecer: {i.parecer}</p>
                )}
                {i.status === "pendente" && (
                  <div className="mt-4 space-y-4">
                    {review === i.id && (
                      <TextField
                        label="Motivo da não aprovação"
                        minLength={5}
                        maxLength={1000}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                      />
                    )}
                    <div className="flex flex-wrap gap-3">
                      <button
                        disabled={Boolean(busy)}
                        className="btn-primary"
                        onClick={() => void decide(i.id, true)}
                      >
                        {busy === i.id
                          ? "Processando…"
                          : i.dados.finalidade === "dashboard"
                            ? "Aprovar dados para o dashboard"
                            : "Aprovar cadastro e publicar"}
                      </button>
                      {review === i.id ? (
                        <button
                          disabled={Boolean(busy) || note.trim().length < 5}
                          className="btn-ghost"
                          onClick={() => void decide(i.id, false)}
                        >
                          Confirmar não aprovação
                        </button>
                      ) : (
                        <button
                          className="btn-ghost"
                          onClick={() => {
                            setReview(i.id);
                            setNote("");
                          }}
                        >
                          Não aprovar
                        </button>
                      )}
                    </div>
                  </div>
                )}
                {i.status === "aprovado" && !i.empreendimento_id && (
                  <Link
                    className="mt-3 inline-block underline"
                    to="/observatorio"
                  >
                    Ver dashboard público
                  </Link>
                )}
                {i.empreendimento_id && (
                  <Link
                    className="mt-3 inline-block underline"
                    to={`/vitrine/${i.empreendimento_id}`}
                  >
                    Ver perfil publicado
                  </Link>
                )}
              </article>
            ))}
        </div>
      )}
    </section>
  );
}
