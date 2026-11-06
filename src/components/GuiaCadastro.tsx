import { useId, useState } from "react";

export function DicaCadastro({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  const [aberta, setAberta] = useState(true);
  const id = useId();
  return (
    <aside className="guia-cadastro" aria-label="Ajuda para preencher">
      <div className="flex items-center justify-between gap-3">
        <strong className="flex items-center gap-2"><span className="guia-icone" aria-hidden="true">?</span>{titulo}</strong>
        <button type="button" className="text-xs font-semibold underline underline-offset-4" aria-expanded={aberta} aria-controls={id} onClick={() => setAberta(!aberta)}>{aberta ? "Entendi" : "Mostrar ajuda"}</button>
      </div>
      {aberta && <p id={id} className="mt-3 text-sm leading-relaxed">{children}</p>}
    </aside>
  );
}

export function EtapasCadastro({ atual, nomes }: { atual: number; nomes: string[] }) {
  return (
    <ol className="etapas-cadastro" aria-label="Etapas do cadastro">
      {nomes.map((nome, i) => <li key={nome} aria-current={i === atual ? "step" : undefined} data-concluida={i < atual}>
        <span aria-hidden="true">{i < atual ? "✓" : i + 1}</span><span>{nome}</span>
      </li>)}
    </ol>
  );
}
