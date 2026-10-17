import { useEffect, useState } from "react";
import {
  TEMAS,
  aplicarTema,
  useTemaAtual,
  temaEmCache,
  carregarTemaGlobal,
  salvarTemaGlobal,
} from "../lib/temas";
import {
  ESTRUTURAS,
  useEstrutura,
  definirEstrutura,
  carregarEstruturaGlobal,
  salvarEstruturaGlobal,
} from "../lib/estruturas";
/** Miniatura esquemática de cada estrutura, para o preview dos cards. */
function MiniLayout({ tipo }: { tipo: string }) {
  const barra = "bg-forest-600";
  const bloco = "bg-forest-100";
  const wrap =
    "flex h-16 w-full overflow-hidden rounded-md border border-forest-200 bg-white p-1";

  if (tipo === "lateral")
    return (
      <div className={`${wrap} gap-1`}>
        <div className={`h-full w-1/4 rounded-sm ${barra}`} />
        <div className="flex h-full flex-1 flex-col gap-1">
          <div className={`h-2 w-2/3 rounded-sm ${bloco}`} />
          <div className={`flex-1 rounded-sm ${bloco}`} />
        </div>
      </div>
    );
  if (tipo === "central")
    return (
      <div className={`${wrap} flex-col items-center gap-1`}>
        <div className={`h-2 w-1/3 rounded-sm ${barra}`} />
        <div className={`h-1.5 w-1/2 rounded-sm ${barra} opacity-50`} />
        <div className={`w-full flex-1 rounded-sm ${bloco}`} />
      </div>
    );
  if (tipo === "minimalista")
    return (
      <div className={`${wrap} flex-col gap-1`}>
        <div className={`h-1.5 w-full rounded-sm ${barra}`} />
        <div className={`flex-1 rounded-sm ${bloco}`} />
      </div>
    );
  if (tipo === "imersiva")
    return (
      <div className={`${wrap} flex-col gap-1`}>
        <div className="flex items-center justify-between">
          <div className={`h-2 w-1/4 rounded-sm ${barra}`} />
          <div className="flex flex-col gap-0.5">
            <span className={`h-0.5 w-2.5 rounded-sm ${barra}`} />
            <span className={`h-0.5 w-2.5 rounded-sm ${barra}`} />
            <span className={`h-0.5 w-2.5 rounded-sm ${barra}`} />
          </div>
        </div>
        <div className={`flex-1 rounded-sm ${bloco}`} />
      </div>
    );
  // classica
  return (
    <div className={`${wrap} flex-col gap-1`}>
      <div className={`h-3 w-full rounded-sm ${barra}`} />
      <div className={`flex-1 rounded-sm ${bloco}`} />
    </div>
  );
}

/**
 * Painel de estrutura do site: o admin escolhe o layout (clássica, lateral,
 * central, minimalista) e aplica para todos. Clicar em uma opção pré-visualiza
 * ao vivo; ao sair sem aplicar, volta à estrutura salva.
 */
function ConfiguracaoEstrutura() {
  const atual = useEstrutura();
  const [salvo, setSalvo] = useState<string>(atual);
  const [salvando, setSalvando] = useState(false);
  const [msg, setMsg] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(
    null,
  );

  useEffect(() => {
    // Apenas carrega qual é a estrutura salva (para o selo "ATIVO" e o botão).
    // Não reaplica aqui: o App já aplicou o global no carregamento, e o preview
    // vive no store (sobrevive à remontagem do Layout ao trocar de estrutura).
    carregarEstruturaGlobal().then(setSalvo);
  }, []);

  async function aplicarParaTodos() {
    setSalvando(true);
    setMsg(null);
    const { error } = await salvarEstruturaGlobal(atual);
    setSalvando(false);
    if (error) {
      setMsg({ tipo: "erro", texto: "Não foi possível salvar: " + error });
      return;
    }
    setSalvo(atual);
    setMsg({
      tipo: "ok",
      texto: "Estrutura aplicada para todos os usuários! 🎉",
    });
  }

  const mudou = atual !== salvo;

  return (
    <div className="card mt-6 p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="eyebrow">Configurações do site</span>
          <h3 className="mt-1 font-display text-xl font-700 text-forest-800">
            Estrutura do layout
          </h3>
          <p className="mt-1 text-sm text-forest-500">
            Modelos de estrutura para apresentar ao público. Clique para
            pré-visualizar ao vivo e aplique o preferido para todos os
            visitantes.
          </p>
        </div>
        <button
          onClick={aplicarParaTodos}
          disabled={!mudou || salvando}
          className="btn-primary text-sm disabled:cursor-not-allowed disabled:opacity-50"
        >
          {salvando
            ? "Aplicando…"
            : mudou
              ? "Aplicar para todos"
              : "Estrutura aplicada"}
        </button>
      </div>

      {msg && (
        <p
          className={`mt-4 rounded-lg px-4 py-2.5 text-sm ${
            msg.tipo === "ok"
              ? "bg-forest-50 text-forest-700"
              : "bg-red-50 text-red-600"
          }`}
        >
          {msg.texto}
        </p>
      )}

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {ESTRUTURAS.map((e) => {
          const ativo = atual === e.id;
          return (
            <button
              key={e.id}
              onClick={() => definirEstrutura(e.id)}
              className={`flex flex-col gap-2 rounded-xl border p-3 text-left transition ${
                ativo
                  ? "border-forest-500 bg-forest-50 ring-2 ring-forest-200"
                  : "border-forest-100 hover:border-forest-300 hover:bg-forest-50/50"
              }`}
            >
              <MiniLayout tipo={e.preview} />
              <div className="flex items-center gap-1.5">
                <p className="font-600 text-forest-800">{e.nome}</p>
                {salvo === e.id && (
                  <span className="rounded-full bg-forest-600 px-1.5 py-0.5 text-[10px] font-700 text-white">
                    ATIVO
                  </span>
                )}
              </div>
              <p className="text-xs leading-snug text-forest-500">
                {e.descricao}
              </p>
            </button>
          );
        })}
      </div>

      {mudou && (
        <p className="mt-4 text-xs text-forest-400">
          👀 Pré-visualizando{" "}
          <span className="font-600">
            {ESTRUTURAS.find((e) => e.id === atual)?.nome}
          </span>
          . Clique em <span className="font-600">“Aplicar para todos”</span>{" "}
          para salvar (recarregar a página volta ao salvo).
        </p>
      )}
    </div>
  );
}

/**
 * Painel de configurações do site: o admin escolhe o tema (aparência) e aplica
 * para todos os usuários. A escolha é salva no Supabase (site_config) e carregada
 * no início de cada visita.
 */
function ConfiguracoesSite() {
  const selecionado = useTemaAtual();
  const [salvo, setSalvo] = useState<string>(temaEmCache());
  const [salvando, setSalvando] = useState(false);
  const [msg, setMsg] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(
    null,
  );

  useEffect(() => {
    // Só carrega qual é o tema salvo (para o selo "ATIVO" e o botão). O preview
    // vive no store reativo e sobrevive à remontagem do Layout.
    carregarTemaGlobal().then(setSalvo);
  }, []);

  function preview(id: string) {
    aplicarTema(id);
    setMsg(null);
  }

  async function aplicarParaTodos() {
    setSalvando(true);
    setMsg(null);
    const { error } = await salvarTemaGlobal(selecionado);
    setSalvando(false);
    if (error) {
      setMsg({ tipo: "erro", texto: "Não foi possível salvar: " + error });
      return;
    }
    setSalvo(selecionado);
    setMsg({ tipo: "ok", texto: "Tema aplicado para todos os usuários! 🎉" });
  }

  const mudou = selecionado !== salvo;

  return (
    <div className="card mt-6 p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="eyebrow">Configurações do site</span>
          <h3 className="mt-1 font-display text-xl font-700 text-forest-800">
            Aparência e tema
          </h3>
          <p className="mt-1 text-sm text-forest-500">
            Escolha o estilo de cores. Ao aplicar, o tema vale para todos os
            visitantes do site.
          </p>
        </div>
        <button
          onClick={aplicarParaTodos}
          disabled={!mudou || salvando}
          className="btn-primary text-sm disabled:cursor-not-allowed disabled:opacity-50"
        >
          {salvando
            ? "Aplicando…"
            : mudou
              ? "Aplicar para todos"
              : "Tema aplicado"}
        </button>
      </div>

      {msg && (
        <p
          className={`mt-4 rounded-lg px-4 py-2.5 text-sm ${
            msg.tipo === "ok"
              ? "bg-forest-50 text-forest-700"
              : "bg-red-50 text-red-600"
          }`}
        >
          {msg.texto}
        </p>
      )}

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {TEMAS.map((t) => {
          const ativo = selecionado === t.id;
          return (
            <button
              key={t.id}
              onClick={() => preview(t.id)}
              className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                ativo
                  ? "border-forest-500 bg-forest-50 ring-2 ring-forest-200"
                  : "border-forest-100 hover:border-forest-300 hover:bg-forest-50/50"
              }`}
            >
              {/* Amostra de cores */}
              <div className="flex shrink-0 -space-x-1.5">
                {t.swatch.map((cor, i) => (
                  <span
                    key={i}
                    className="h-7 w-7 rounded-full border-2 border-white shadow-sm"
                    style={{ background: cor }}
                  />
                ))}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="font-600 text-forest-800">{t.nome}</p>
                  {salvo === t.id && (
                    <span className="rounded-full bg-forest-600 px-1.5 py-0.5 text-[10px] font-700 text-white">
                      ATIVO
                    </span>
                  )}
                </div>
                <p className="truncate text-xs text-forest-500">
                  {t.descricao}
                </p>
              </div>
              {ativo && <span className="shrink-0 text-forest-600">✓</span>}
            </button>
          );
        })}
      </div>

      {mudou && (
        <p className="mt-4 text-xs text-forest-400">
          👀 Você está pré-visualizando{" "}
          <span className="font-600">
            {TEMAS.find((t) => t.id === selecionado)?.nome}
          </span>
          . Clique em <span className="font-600">“Aplicar para todos”</span>{" "}
          para salvar (recarregar a página volta ao salvo).
        </p>
      )}
    </div>
  );
}

export default function AparenciaAdmin() {
  return (
    <details className="mt-8">
      <summary className="cursor-pointer font-semibold">
        Aparência do site
      </summary>
      <ConfiguracaoEstrutura />
      <ConfiguracoesSite />
    </details>
  );
}
