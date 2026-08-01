# Observatório Acriano da Sócio-bioeconomia

Portal público do Observatório Acriano da Sócio-bioeconomia (nome oficial a confirmar) — um
site institucional com três frentes integradas:

- **Portal institucional** — notícias e central de legislação da sociobiodiversidade/bioeconomia.
- **Dashboard público** — mapa **interativo dos 22 municípios do Acre**, com indicadores por
  cidade (hover mostra os dados, clique abre o detalhamento). Feito sob medida, sem Power BI.
- **Vitrine de empreendimentos** — showcase estilo "estante/Netflix" dos negócios da floresta,
  com história, catálogo e contato (sem e-commerce).

> ⚠️ **Protótipo em desenvolvimento.** Todos os **dados numéricos são fictícios**, gerados de
> forma determinística apenas para demonstração. A geometria dos municípios é real (IBGE).
> A estrutura já está pronta para receber os dados reais via **Supabase**.

## Stack

- [Vite](https://vitejs.dev/) + [React 18](https://react.dev/) + TypeScript
- [Tailwind CSS](https://tailwindcss.com/) (identidade visual orgânica: floresta, rio, terra)
- [d3-geo](https://github.com/d3/d3-geo) para o mapa coroplético interativo
- [Recharts](https://recharts.org/) para os gráficos do dashboard
- [@supabase/supabase-js](https://supabase.com/) (cliente já configurado para a fase de back-end)

## Rodando localmente

```bash
npm install
cp .env.example .env   # e preencha a VITE_SUPABASE_ANON_KEY
npm run dev
```

Abra http://localhost:5173.

## Build de produção

```bash
npm run build
npm run preview
```

## Variáveis de ambiente

| Variável                 | Descrição                                                        |
| ------------------------ | ---------------------------------------------------------------- |
| `VITE_SUPABASE_URL`      | URL do projeto Supabase.                                         |
| `VITE_SUPABASE_ANON_KEY` | Chave **pública** (anon) do Supabase. Protegida por RLS no back. |

A `anon key` é feita para rodar no navegador. **Nunca** use a `service_role` no front-end.
No deploy (ex.: Vercel), configure essas variáveis no painel do projeto.

## Estrutura

```
public/data/acre-municipios.geojson   # 22 municípios do Acre (IBGE, simplificado)
src/
  components/   AcreMap (mapa interativo), Layout, OrganicBg, ui
  data/         municipios (indicadores fictícios), conteudo (vitrine/notícias/leis), métricas
  lib/          supabase (cliente), format (helpers pt-BR)
  pages/        Home, Dashboard, Vitrine, EmpreendimentoDetalhe, Noticias, Legislacao,
                Sobre, Cadastro, Login, NotFound
```

## Próximos passos (roadmap)

1. Confirmar nome/identidade oficial do projeto.
2. Substituir os dados fictícios por tabelas no Supabase (municípios, indicadores, empreendimentos).
3. Autenticação real (empreendedor + administrador) e área ADM de aprovação de cadastros.
4. Editor de página do empreendedor (mini-blog: história, fotos, catálogo).
