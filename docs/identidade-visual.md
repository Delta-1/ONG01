# Identidade visual do Observatório

Aplicação do kit `idv.zip` fornecido pela equipe em 4 de novembro de 2026.

## Cores

| Uso                         | Cor                |
| --------------------------- | ------------------ |
| Cor principal, botões, mapa | Verde `#166340`    |
| Fundo principal             | Creme `#fff9eb`    |
| Títulos de destaque         | Vermelho `#9a0318` |
| Grafismos e destaques       | Laranja `#ec4318`  |
| Filetes, indicadores e CTA  | Amarelo `#ffbe00`  |
| Elementos de apoio          | Oliva `#a0984b`    |
| Elementos de apoio          | Castanha `#b4765f` |

A arte da paleta repete o código do laranja sobre a amostra amarela. Foi adotada a cor **visível da amostra amarela**, `#ffbe00`, obtida diretamente dos pixels da imagem. Os tons auxiliares claros e escuros preservam contraste na interface.

## Tipografia e imagens

- Títulos: Stack Sans Headline. Interface: Stack Sans Text.
- Fontes variáveis originais convertidas em WOFF2 e hospedadas localmente. Licenças OFL preservadas em `public/identidade/fonts`.
- Os seis grafismos originais foram redimensionados, mantendo proporção e transparência, e convertidos para WebP.
- Os olhos do kit compõem a assinatura do cabeçalho/rodapé. O ícone do navegador usa um olho do mesmo arquivo. Não há afirmação de que esse grafismo seja uma nova logo oficial.
- A home usa apenas conteúdo institucional e dados aprovados do banco. Os grafismos não representam empresas cadastradas nem fotografias de produtos reais.

## Interface

A home combina mapa interativo, indicadores reais, caminhos para explorar o portal e chamadas separadas para os formulários de vitrine e dashboard. Vitrine vazia e notícias sem registros recebem mensagens úteis, sem gerar conteúdo fictício.

Os títulos, botões, cartões e formulários compartilham as fontes e cores. Cabeçalhos ilustrados foram aplicados em vitrine, formulários de coleta, dashboard, notícias, legislação e sobre. O tema `floresta` já existente passa a representar a identidade do kit; os outros temas continuam disponíveis ao administrador.

Foram removidos os links genéricos de Instagram/YouTube. Os perfis oficiais podem ser adicionados depois que a equipe fornecer os endereços corretos.

A navegação inclui link para pular ao conteúdo, foco visível, menu mobile com estado expandido e uma identificação acessível da busca. A preferência por movimento reduzido continua sendo respeitada.

## Movimento e interação

A abertura combina fundo de floresta em camadas, correntes suaves e folhas que oscilam para sugerir vento. O deslocamento do cursor gera uma resposta discreta de profundidade, sem movimentar textos e controles. Os grafismos flutuam sobre três composições: mapa do território, diversidade de produtos e rede de parceiros.

O carrossel troca de destaque a cada sete segundos. Há setas, seleção direta de capítulos, navegação por setas do teclado, arraste horizontal com mouse ou toque e botão para pausar/retomar. Navegação manual interrompe a rotação; foco e ponteiro sobre a região suspendem a troca para permitir leitura. A rotação e os efeitos pausam ao sair da tela ou ocultar a aba. A preferência por movimento reduzido desliga os efeitos e a rotação automática, preservando todos os controles manuais.

As seções abaixo aparecem suavemente conforme entram no campo de visão. Não foi acrescentado nenhum dado fictício.

## Validar e publicar

```
npm ci
npm run build
```

Configure `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no ambiente do projeto correto da ONG. A chave precisa ser pública (`anon` ou publishable), nunca `service_role`. O código não altera dados, políticas de acesso ou senhas.

As alterações foram preparadas em uma branch do repositório acessível `Delta-1/ONG01`. Elas precisam ser levadas para `sarahsoaresc/observatorio-ccm` e publicadas no projeto Vercel `observatorio-ccm`, preservando o vínculo com `observatorio.comitechicomendes.org`. As conexões atuais não dão acesso a esses dois destinos; portanto o PR não equivale a uma publicação no domínio oficial.

A prévia HTTP também utiliza UUID v4 com `crypto.getRandomValues` quando `crypto.randomUUID` não está disponível. A publicação em HTTPS mantém o caminho nativo já existente.
