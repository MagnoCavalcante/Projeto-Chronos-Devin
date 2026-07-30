# Como testar o CHRONOS no iPhone (PWA via Safari)

Este guia explica como acessar a versão Web/PWA do CHRONOS diretamente no seu iPhone, sem precisar de conta Apple Developer ou TestFlight.

## 1. Ativar o GitHub Pages no repositório

1. Acesse o repositório do projeto no GitHub.
2. Vá em **Settings** (Configurações) no menu superior do repositório.
3. No menu lateral esquerdo, clique em **Pages**.
4. Em **Build and deployment > Source**, selecione **Deploy from a branch**.
5. Em **Branch**, selecione `gh-pages` e a pasta `/ (root)`. Clique em **Save**.
6. Aguarde alguns minutos. O GitHub vai gerar uma URL parecida com:
   `https://<seu-usuario>.github.io/<nome-do-repositorio>/`

> A branch `gh-pages` é criada e atualizada automaticamente pelo workflow `.github/workflows/deploy_web.yml` sempre que houver um push na branch `main` (ou pode ser disparada manualmente pela aba **Actions > Deploy Web (GitHub Pages) > Run workflow**).

## 2. Abrir o link no iPhone (Safari)

1. No iPhone, abra o app **Safari** (é obrigatório ser o Safari — Chrome ou outros navegadores não suportam "Adicionar à Tela Inicial" como app standalone no iOS).
2. Digite a URL do GitHub Pages gerada no passo anterior.
3. Aguarde o carregamento completo do app CHRONOS.

## 3. Adicionar à Tela de Início

1. Com a página do CHRONOS aberta no Safari, toque no ícone de **Compartilhar** (quadrado com seta para cima), na barra inferior.
2. Role para baixo na lista de opções e toque em **Adicionar à Tela de Início**.
3. Confirme o nome "CHRONOS" e toque em **Adicionar** no canto superior direito.
4. O ícone do CHRONOS aparecerá na sua Tela de Início, como um app nativo.

## 4. Abrir como app (modo tela cheia)

- Toque no ícone do CHRONOS na Tela de Início.
- O app abrirá em **modo standalone** (tela cheia, sem a barra de endereço do Safari), graças à configuração `display: "standalone"` no `manifest.json`.

## Observações

- Sempre que uma nova versão for enviada para a branch `main`, o workflow de deploy atualizará automaticamente a versão publicada no GitHub Pages.
- Pode ser necessário fechar e reabrir o app (ou remover e adicionar novamente à Tela de Início) para forçar o carregamento de uma versão mais recente, já que o Safari pode fazer cache agressivo de PWAs.
