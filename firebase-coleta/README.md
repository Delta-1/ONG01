# Coleta assistida da ONG com Firebase

Projeto informado: observatorioccm-c7184. Este diretório é independente do site React do ONG01.

## Estado desta alteração

Código preparado para revisão. Firebase ainda não configurado nem publicado. O console foi aberto com a conta Delta, que não tem permissão para o projeto. A autenticação da outra conta foi interrompida. Não foram criados serviços nem ativada cobrança.

O formulário permanece bloqueado por padrão. Não exibe sucesso fictício e não recebe dados reais antes da configuração.

## Função prevista

Uma pessoa da equipe entra com Google, preenche a organização e envia um registro privado para coletas_ong no Firestore. A confirmação e o protocolo só aparecem após a promessa de gravação ser confirmada pelo SDK. Não há rascunho de dados pessoais no armazenamento local do navegador.

Há três finalidades: vitrine, dashboard ou ambos. CNPJ é opcional; sua situação é declarada. Os dígitos do CNPJ são verificados no navegador. As regras conferem formato, mas não implementam o algoritmo completo nem consultam a Receita. Números desconhecidos ficam vazios/null; zero tem significado próprio e os indicadores informados exigem ano.

Somente contas Google verificadas e presentes na lista equipe_coleta podem enviar. Essa lista é controlada pelo administrador do projeto; o cliente não a altera. Não há leitura pública dos cadastros.

## Antes de liberar

1. Entrar no console com a conta que tenha permissão em observatorioccm-c7184. Conferir os recursos existentes e o plano, sem substituir regras ou ativar serviços pagos automaticamente.
2. Registrar ou selecionar o app Web e copiar sua configuração pública exata para public/firebase-config.js. Não colocar contas de serviço, senhas ou chaves privadas no frontend.
3. Configurar Google em Firebase Authentication e autorizar o domínio que hospedará o formulário.
4. Inspecionar as regras existentes. Integrar as regras deste diretório somente para as coleções novas. O arquivo fornecido contém negação padrão; substituí-lo sem mesclagem pode bloquear outros apps. Este projeto NÃO foi inspecionado por falta de acesso.
5. Pelo console/IAM, liberar somente as pessoas indicadas pela ONG em equipe_coleta/{uid}, com ativo boolean true. Não usar regras abertas.
6. Testar as regras no emulador: visitante e conta não liberada não podem enviar; operador não pode ler a coleção, atribuir outro dono, enviar status aprovado, alterar ou excluir o registro; somente o próprio documento de autorização pode ser consultado.
7. Testar os casos válidos e inválidos, indicadores, repetição, falha de rede e chegada do protocolo. A validação de regras e a navegação real ainda não foram executadas nesta preparação.
8. Publicar em um Hosting separado ou target próprio após conferir o que já existe. O firebase.json usa um target coleta-ong para impedir publicação acidental no Hosting padrão. Vincular esse target a um site de Hosting escolhido antes do deploy.
9. Só então definir coletaHabilitada como true, publicar e conferir uma gravação fictícia. Remover o registro de teste pelo console após a verificação, com autorização da equipe.

Para compilar não é necessário instalar dependências; a página usa módulos web. O SDK CDN 13.2.0 segue a documentação consultada em 06/11/2026.

## Integração com a plataforma atual

Não há sincronização com Supabase nesta alteração. Os dados não aparecem automaticamente no painel atual, na vitrine ou no dashboard. A conferência inicial depende do console Firestore. Antes de usar como entrada oficial para a curadoria existente, implementar e testar uma ponte autenticada no servidor, com idempotência e registro da decisão. Não copiar dados privados para uma coleção pública.

Essa função demonstra uso real do Firebase quando configurada e testada. Ela não equivale à migração integral da base e não deve ser apresentada como funcional antes da publicação e do ensaio real.

## Verificação

Executar, a partir da raiz do repositório:

    node --test firebase-coleta/tests/validation.test.mjs

Os testes cobrem finalidades, campos condicionais, dados inválidos, geografia, números e minimização dos campos de autoridade. O workflow da proposta verifica sintaxe JS e esses testes. Eles não substituem o emulador de regras, a validação no console ou testes no navegador.

## Fontes oficiais

- https://firebase.google.com/docs/web/setup
- https://firebase.google.com/docs/auth/web/google-signin
- https://firebase.google.com/docs/firestore/security/rules-fields
- https://firebase.google.com/docs/reference/rules/rules.Timestamp_
