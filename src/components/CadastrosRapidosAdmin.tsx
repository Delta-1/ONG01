import { useState } from "react";
import { Link } from "react-router-dom";
import { useLoad } from "../hooks/useData";
import { db, mensagemErro } from "../lib/queries";
import { MUNICIPIOS } from "../data/municipios";
import { Message, TextField } from "./FormUI";
interface Item {
  id: string;
  dados: {
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
    [copied, setCopied] = useState(false);
  const state = useLoad(async () => {
    const { data, error } = await db()
      .from("cadastros_rapidos")
      .select("*")
      .eq("status", filter)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    return data as Item[];
  }, filter);
  const link = `${location.origin}${import.meta.env.BASE_URL}formulario`;
  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
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
          ? "Cadastro aprovado. O empreendimento e sua apresentação já estão na vitrine. Gerencie o acesso da empresa na aba Empreendimentos e acessos."
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
        Compartilhe este link com a equipe da ONG. Eles podem registrar várias
        empresas sem criar contas.
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          className="min-w-0 flex-1 rounded-lg border border-forest-200 p-3 text-sm"
          aria-label="Link do formulário rápido"
          readOnly
          value={link}
          onFocus={(e) => e.target.select()}
        />
        <button className="btn-primary" onClick={copy}>
          {copied ? "Link copiado" : "Copiar link"}
        </button>
        <Link className="btn-ghost" to="/formulario">
          Abrir formulário
        </Link>
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
