# Acesso ao Observatório

Projeto Supabase: ONG01 (`rzsmvlfmjjujbipghmsl`).
Site atual: https://ong-brasil.vercel.app

## URLs

Em Authentication > URL Configuration:

- Site URL: `https://ong-brasil.vercel.app`
- Redirect URLs: `https://ong-brasil.vercel.app/**`
- Desenvolvimento: `http://127.0.0.1:5173/**` e `http://localhost:5173/**`
- Se o GitHub Pages for usado: `https://delta-1.github.io/ONG01/**`

Convites e recuperação retornam para `/redefinir-senha`. Essa tela permite escolher uma senha nova, incluindo no primeiro acesso por convite. O painel também oferece troca de senha para contas autenticadas.

## Cadastro e papéis

A confirmação de e-mail pode ser ativada ou desativada no Supabase. O cadastro trata ambas as situações: entra no painel quando recebe sessão, ou orienta confirmar o e-mail antes de entrar. A política pública que permitia cadastrar negócios sem autenticação foi removida.

A criação de perfil sempre atribui `empresa`. Um usuário não pode alterar o próprio papel nem o vínculo pelo navegador. Administrações existentes são preservadas. A criação de novos administradores exige uma operação confiável no servidor/banco.

## Convites e senhas

O administrador pode criar inicialmente o negócio e a publicação, sem depender de uma conta de empreendedor. Depois, em Empreendimentos e acessos, informa o e-mail real e escolhe convite ou senha provisória. E-mails de login ficam no Auth, consultados apenas pela função administrativa. Contatos públicos informados no formulário são independentes.

Uma conta já vinculada a outro negócio ou uma conta administrativa não pode ser vinculada automaticamente. Senhas existentes não são armazenadas em texto nem retornadas. Uma nova senha provisória é exibida uma única vez ao administrador, que deve entregá-la ao responsável.

## E-mails

Configure SMTP próprio em Authentication para entrega externa confiável. O serviço padrão do Supabase tem limites e restrições. O aplicativo informa falhas de envio e permite solicitar novamente.

Avisos de recebimento, aprovação e solicitação de ajustes ficam em `avisos` e aparecem no painel da empresa. Nenhum e-mail de aprovação é prometido nesta versão.

## Imagens e curtidas

Fotos ficam no bucket privado `publicacoes`, com limite de 5 MB e formatos JPEG, PNG e WebP. Antes da aprovação, somente remetente e administrador podem acessá-las. Após a aprovação, os visitantes recebem URLs de curta duração.

Curtidas de posts exigem login. Cada conta tem uma curtida por publicação e só pode remover a própria. A contagem pública não expõe a lista de usuários.
