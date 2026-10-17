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
