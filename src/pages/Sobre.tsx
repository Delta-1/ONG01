import { Link } from 'react-router-dom'
import { SectionTitle } from '../components/ui'

export default function Sobre() {
  return (
    <div className="container-page py-10 sm:py-14">
      <SectionTitle
        eyebrow="Sobre o projeto"
        title="Observatório Acriano da Sócio-bioeconomia"
        desc="Uma plataforma pública que valoriza a floresta em pé, dando visibilidade a dados e a quem produz de forma sustentável no Acre."
      />

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {[
          {
            t: 'Portal institucional',
            d: 'Notícias, legislação e princípios de defesa da sociobiodiversidade e da bioeconomia.',
          },
          {
            t: 'Dashboard público',
            d: 'Um painel de dados feito sob medida, com mapa interativo do Acre e indicadores por município — sem depender de ferramentas engessadas.',
          },
          {
            t: 'Vitrine de empreendimentos',
            d: 'Cada negócio da floresta pode se cadastrar, contar sua história e divulgar seus produtos (sem venda direta).',
          },
        ].map((c) => (
          <div key={c.t} className="card p-6">
            <h3 className="font-display font-700 text-forest-800">{c.t}</h3>
            <p className="mt-2 text-sm text-forest-600">{c.d}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 card p-8">
        <h2 className="font-display text-xl font-700 text-forest-800">Como funciona a participação</h2>
        <ol className="mt-5 space-y-4">
          {[
            'O empreendedor cria sua conta e preenche o formulário de apresentação do negócio.',
            'A equipe administradora revisa e aprova (ou recusa) o cadastro.',
            'Aprovado, o empreendedor ganha um painel para criar e editar sua própria página.',
            'A página é publicada na vitrine e qualquer visitante pode conhecê-la.',
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
        <strong>Nota do protótipo:</strong> escopo geográfico atual é apenas o Acre (estrutura
        pronta para expandir). O nome oficial do projeto ainda está em confirmação. Dados exibidos
        são fictícios, para desenvolvimento.
      </p>
    </div>
  )
}
