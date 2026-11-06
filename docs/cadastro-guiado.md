# Cadastro guiado e validação

Acesso rápido: nome, e-mail e senha com no mínimo 10 caracteres. A função `cadastro-acesso` cria somente uma conta nova, confirma seu e-mail no servidor e devolve uma sessão. Contas existentes continuam com as próprias credenciais e permissões. A configuração global de confirmação do Supabase não foi alterada.

No painel, o participante preenche Participação, Organização, Apresentação e Revisão. Pode salvar rascunho na própria conta e escolher somente vitrine, somente dashboard ou ambos. O envio e as atualizações entram em `cadastros_rapidos`; a versão pública só muda após a curadoria. A aprovação mantém uma linha canônica em `parceiros_observatorio` e cria ou atualiza o empreendimento apenas quando há vitrine. O retorno aparece no painel. E-mail de notificação não integra esta entrega.

O banco de referência é `mcvlslxazwxtlxrywqzu`, região São Paulo. `.env.production` contém somente a configuração pública do cliente. Nenhuma chave administrativa deve ser incluída no front-end. Em Vercel, confirme que as variáveis VITE do projeto apontam ao mesmo banco, pois o ambiente da plataforma tem precedência sobre o arquivo.

## Publicação

1. Aplicar as migrações incrementais e publicar `supabase/functions/cadastro-acesso` com verificação JWT e as variáveis padrão do Supabase disponíveis no servidor.
2. Executar `npm ci` e `npm run build`.
3. Para GitHub Pages, usar Source GitHub Actions. O workflow compila com base `/ONG01/`; em Vercel a base é `/`.
4. Publicar a mesma revisão aprovada no repositório de produção e verificar o hash dos arquivos, as imagens e o banco no site publicado.

A função de acesso permite somente as origens previstas no seu código. Ao acrescentar um domínio, revisar essa lista. CNPJ tem validação de formato e dígitos numéricos ou alfanuméricos; situação cadastral continua declarada, sem consulta à Receita.

## Verificação

- `npm run build` valida TypeScript e compila o site.
- `npm exec -- esbuild tests/*.test.ts --bundle --platform=node --format=esm --outdir=.test-build --out-extension:.js=.mjs` seguido de `node --test .test-build/*.mjs`: CSV, paginação, revisões e indicadores.
- Os três arquivos SQL em `tests/` usam transações com rollback para isolamento, curadoria, permissões, limites, curtidas e indicadores.
- Ensaios de integração usam contas e organizações explicitamente fictícias. Após capturar evidências, arquivar cadastros, ocultar parceiros e empreendimentos, retirar o administrador de teste e bloquear as contas de ensaio. Não publicar senhas, sessões ou os acessos locais temporários.

A proteção contra senhas vazadas está desativada no projeto e deve ser avaliada pelo responsável pela conta. O ensaio não substitui auditoria independente, teste de carga, teste em aparelho móvel real nem validação de SMTP e recuperação de senha por e-mail.
