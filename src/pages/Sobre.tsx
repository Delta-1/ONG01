import { PageArtwork } from "../components/BrandArt";
import { Link } from "react-router-dom";
import { SectionTitle } from "../components/ui";

export default function Sobre() {
  return (
    <div className="container-page py-10 sm:py-14">
      <PageArtwork motif="olhos" />
      <SectionTitle
        eyebrow="Sobre o projeto"
        title="Observatório Acriano da Sócio-bioeconomia"
        desc="Uma plataforma pública que valoriza a floresta em pé, dando visibilidade a dados e a quem produz de forma sustentável no Acre."
      />

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {[
          {
            t: "Portal institucional",
            d: "Notícias, legislação e princípios de defesa da sociobiodiversidade e da bioeconomia.",
          },
          {
            t: "Dashboard público",
            d: "Um mapa interativo do Acre com dados aprovados de organizações, produtos, serviços e parceiros por município.",
          },
          {
            t: "Vitrine de empreendimentos",
            d: "Cada negócio da floresta pode se cadastrar, contar sua história e divulgar seus produtos (sem venda direta).",
          },
        ].map((c) => (
          <div key={c.t} className="card p-6">
            <h3 className="font-display font-700 text-forest-800">{c.t}</h3>
            <p className="mt-2 text-sm text-forest-600">{c.d}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 card p-8">
        <h2 className="font-display text-xl font-700 text-forest-800">
          Como funciona a participação
        </h2>
        <ol className="mt-5 space-y-4">
          {[
            "Crie seu acesso rápido com nome, e-mail e senha. Você entra no painel sem aguardar confirmação por e-mail.",
            "No painel, clique em Cadastrar minha organização e escolha somente vitrine, somente dashboard ou os dois.",
            "Preencha os dados em etapas, salve um rascunho se precisar e envie para análise da ONG.",
            "Acompanhe a aprovação ou o pedido de ajustes no painel. Os dados aparecem somente nos destinos escolhidos após a aprovação.",
            "Mantenha os dados atualizados e, se participar da vitrine, envie novas publicações. Cada alteração passa pela curadoria.",
          ].map((passo, i) => (
            <li key={i} className="flex gap-4">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-forest-600 font-display text-sm font-700 text-white">
                {i + 1}
              </span>
              <p className="pt-1 text-forest-600">{passo}</p>
            </li>
          ))}
        </ol>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/cadastro" className="btn-primary">
            Quero me cadastrar
          </Link>
          <Link to="/observatorio" className="btn-ghost">
            Ver o dashboard
          </Link>
        </div>
      </div>

      <p className="mt-8 rounded-xl border border-dashed border-forest-200 bg-forest-50 p-4 text-sm text-forest-500">
        A coleta abrange os 22 municípios do Acre. Os perfis e as publicações
        passam pela curadoria antes de aparecerem na vitrine pública.
      </p>
    </div>
  );
}
