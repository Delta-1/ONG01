# Observatório Acriano da Sócio-bioeconomia

Portal do Acre com mapa, vitrine de empreendimentos reais e publicações moderadas.

## Fluxo do empreendedor

1. Cria conta ou entra em `/entrar`.
2. No `/painel`, clica em **Publicar**.
3. Na primeira publicação, informa o negócio, município, categoria, história e contato público. A região vem do município. Depois, informa título, conteúdo e produtos. Foto, processo produtivo e impacto são opcionais.
4. Envia para análise. Empresa e publicação são gravadas atomicamente e ficam privadas até a curadoria.
5. A decisão aparece nos avisos do painel. A publicação aprovada aparece em `/vitrine/:id`. Novas publicações também passam pela curadoria.

## Administração

Em `/admin`, o administrador revisa os envios, aprova ou solicita ajustes com uma justificativa. Pode criar um empreendimento e uma primeira publicação em `/admin/novo`, além de enviar outros posts por empresas cadastradas.

Na aba **Empreendimentos e acessos**, pode consultar/alterar o e-mail privado de login, convidar por e-mail, solicitar recuperação ou gerar uma senha provisória. Senhas já existentes nunca podem ser consultadas. A senha provisória só é exibida na operação de geração.

A área pública usa apenas dados reais validados. Exemplos antigos ficam preservados com `is_demo=true`, fora das consultas públicas. Município e região são dados geográficos. Faturamento, produção, famílias e área não são estimados automaticamente.

## Executar

```bash
npm ci
cp .env.example .env.local
# Preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.
npm run dev
npm run build
```

React 18, TypeScript, Vite, Tailwind, Supabase e mapa D3. A Vercel publica `dist` e resolve rotas via `vercel.json`.

## Banco e função administrativa

A migração `supabase/migrations/20261017124018_real_publications_workflow.sql` acrescenta publicações, avisos, curtidas, imagem privada e regras de curadoria. A função `empreendimento-acesso` usa a chave de serviço exclusivamente no servidor, valida o JWT e consulta o perfil administrativo no banco. As chaves de serviço não pertencem ao frontend.

Publique `supabase/functions/empreendimento-acesso`. `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` são fornecidas pelo ambiente das Edge Functions. `SITE_URL` é opcional e usa `https://ong-brasil.vercel.app` como padrão. Atualize `SITE_URL`, origens permitidas e URLs do Auth ao trocar o domínio.

Detalhes de autenticação: [docs/configuracao-auth.md](docs/configuracao-auth.md).

## Verificação

`npm run build` verifica TypeScript e gera o pacote de produção. `tests/publications-rls.sql` valida permissões, vínculo, isolamento, moderação, curtidas e exclusão de demonstrações. Execute em um ambiente Supabase configurado: o teste cria registros temporários em uma transação e usa `ROLLBACK`.

Avisos de publicação são internos ao painel. Convites e recuperação usam o serviço de e-mail do Supabase e devem ser testados com destinatário autorizado após configurar SMTP. Não há promessa de envio de e-mail de aprovação.

## Formulário rápido da equipe

Compartilhe `https://ong-brasil.vercel.app/formulario`. Não exige conta e permite cadastrar várias empresas. Cada envio fica privado em **Admin → Cadastros do formulário rápido**. Ao aprovar, a transação cria o empreendimento e uma primeira apresentação com a história informada. A administração organiza o acesso da empresa depois, em **Empreendimentos e acessos**. Rejeições exigem justificativa e ficam registradas para a equipe.

Em **Admin → Administradores**, um administrador informa o e-mail de uma conta já cadastrada para promover essa pessoa. Cadastros comuns continuam com perfil de empresa; a promoção exige autorização verificada no banco e gera registro de auditoria. O novo administrador atualiza a página ou entra novamente.

A migração `20261017131138_quick_intake_and_admin_access.sql` cria a fila privada, as operações de aprovação e as operações administrativas. Publique também a Edge Function `cadastro-rapido`, mantendo a verificação JWT habilitada: o cliente público usa a chave anon, sem precisar de conta. Somente o servidor pode receber os envios no banco. Há limite de 60 envios por hora por identificação de rede com hash, proteção de repetição por UUID e campo antispam. As tabelas privadas de auditoria e limite usam RLS sem políticas de cliente por intenção.

`tests/quick-intake-admin.sql` verifica isolamento, aprovação exclusiva por administradores, promoção por e-mail, idempotência e limite de envios dentro de uma transação revertida.

## Exportação e organização da base

Em `/admin`, **Exportar todos os empreendimentos (.csv)** baixa uma planilha compatível com Excel e Google Planilhas. Inclui todos os empreendimentos reais, os envios do formulário rápido ainda não convertidos e o status de cada registro, sem duplicar os formulários já aprovados. Traz município, região, categoria, contatos públicos, história, produtos e contagem de publicações. Não contém e-mail privado de login, senhas ou identificadores de acesso. Os filtros da tela não limitam a exportação. Dados de demonstração ficam excluídos.

A aba **Empreendimentos e acessos** permite buscar por nome, categoria, comunidade ou responsável e filtrar por município. Use **Publicar por uma empresa** ou **Criar publicação** no cadastro da empresa; o envio passa pela análise e precisa de aprovação. Os perfis aprovados e suas publicações aprovadas são públicos em `/vitrine`; o dashboard público em `/observatorio` conta os perfis aprovados por município e região.

A leitura de empreendimentos e da exportação percorre todas as páginas da API. O CSV usa UTF-8 com BOM, separador `;` e neutraliza conteúdo que poderia ser interpretado como fórmula por uma planilha. `tests/export-empresas.test.ts` verifica essas propriedades e a paginação com mais de mil registros.

## Dois tipos de participação no Observatório

- `/formulario/vitrine`: autocadastro de quem oferece produtos ou serviços, com perfil na vitrine e participação no dashboard após aprovação.
- `/formulario/dashboard`: captação de dados e parceria sem perfil nem publicação na vitrine. Não exige catálogo; permite informar colaboração, pesquisa, apoio ou articulação.
- `/formulario` continua funcionando e permite escolher entre as duas finalidades. Nenhum desses formulários exige criar uma conta.

A coleta inclui tipo de organização, município/região, funcionamento, presença e situação declarada de CNPJ, site, colaboração, pessoas que trabalham, famílias envolvidas e produção anual em toneladas. Quantidades são opcionais e exigem ano de referência quando preenchidas; ausência não equivale a zero. A situação do CNPJ é autodeclarada e não representa consulta automática à Receita Federal. O número do CNPJ e contatos do formulário permanecem na fila administrativa, fora da tabela pública de indicadores.

A aprovação é atômica. Ambos os tipos geram um registro aprovado em `parceiros_observatorio`; somente a finalidade vitrine cria empreendimento e apresentação pública. O dashboard une parceiros novos e empresas anteriores sem contar duas vezes o vínculo entre eles. Números só são somados após selecionar um ano, com cobertura das respostas informadas. A exportação administrativa inclui as duas finalidades, as informações de cadastro e os novos indicadores.

A migração `20261022172919_observatorio_partner_intake.sql` preserva formulários anteriores, restringe as escritas a funções protegidas e mantém RLS nos dados públicos e administrativos. `tests/partner-intake.sql` testa finalidades, permissões, validações, aprovação, privacidade, zero e ausência em transação revertida. Não é necessário mudar a Edge Function `cadastro-rapido`, que já encaminha os campos para a validação no banco.

Cadastros de teste arquivados com `dados.is_demo=true` ficam fora da fila administrativa e da exportação. Parceiros de teste têm `aprovado=false`; empresas de teste usam `is_demo=true`.
