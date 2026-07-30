# CHRONOS — Guia de Publicação iOS (CI/CD & TestFlight)
## RFC-014 — Automação de Build iOS na Nuvem (Sprint 5.3)

Este documento descreve o funcionamento do workflow `.github/workflows/ios_build.yml` e os passos necessários para evoluí-lo de uma build **não assinada** (para validação de compilação) para um pipeline completo de **assinatura automática e envio direto ao TestFlight**.

---

## 1. O que o workflow atual já faz

O workflow `iOS Build` é disparado automaticamente a cada `push` na branch `main`, ou manualmente via `workflow_dispatch` (botão "Run workflow" na aba **Actions** do GitHub).

Ele executa, em um runner `macos-latest` hospedado pelo GitHub:

1. Checkout do repositório.
2. Instalação do JDK (necessário para as ferramentas do Flutter/Gradle).
3. Instalação do Flutter (versão fixada via `subosito/flutter-action`).
4. `flutter pub get`.
5. `flutter test` (a build falha se algum teste quebrar).
6. `flutter build ipa --release --no-codesign` — compila o aplicativo iOS **sem assinatura de código**, pois o runner não possui nossos certificados Apple.
7. Upload dos artefatos (`Runner.xcarchive` e a pasta `build/ios/ipa`) como artefatos do GitHub Actions, disponíveis para download por 14 dias.

> **Por que `--no-codesign`?** Sem um certificado de distribuição Apple e um perfil de provisionamento configurados no runner, o Xcode não consegue assinar o binário. A flag permite validar que o código Dart/Flutter compila corretamente para iOS sem exigir credenciais Apple neste estágio.

---

## 2. O que falta para assinatura automática + envio ao TestFlight

Para evoluir o pipeline, precisamos de 3 coisas do **Apple Developer Portal / App Store Connect**, e configurá-las como **Secrets** no GitHub. Nenhuma credencial deve ser commitada no repositório.

### 2.1 App Store Connect API Key

1. Acesse [App Store Connect](https://appstoreconnect.apple.com/) → **Users and Access** → aba **Integrations (API Keys)**.
2. Clique em **Generate API Key** (ou **+**), dê um nome (ex: `chronos-ci`) e selecione o papel **App Manager** (ou `Admin`, se necessário para gerenciar builds).
3. Baixe o arquivo `.p8` **imediatamente** — a Apple só permite o download uma única vez.
4. Anote também o **Key ID** e o **Issuer ID**, exibidos na mesma tela.

### 2.2 Certificado de Distribuição + Perfil de Provisionamento

1. No [Apple Developer Portal](https://developer.apple.com/account/resources/certificates/list), crie um certificado do tipo **Apple Distribution** (se ainda não existir).
2. Exporte o certificado junto com sua chave privada como um arquivo `.p12`, protegido por senha (via **Acesso às Chaves / Keychain Access** no macOS: clique com o botão direito no certificado → **Exportar**).
3. Em **Profiles**, crie (ou reutilize) um **App Store Distribution Provisioning Profile** vinculado ao *Bundle Identifier* do app (`com.chronos.app`) e baixe o arquivo `.mobileprovision`.

### 2.3 Codificação dos arquivos para Secrets

Como o GitHub Secrets armazena apenas texto, os arquivos binários (`.p8`, `.p12`, `.mobileprovision`) devem ser convertidos para Base64 antes de serem colados:

```bash
# macOS/Linux
base64 -i AuthKey_XXXXXXXXXX.p8 | pbcopy
base64 -i certificado_distribuicao.p12 | pbcopy
base64 -i perfil_app_store.mobileprovision | pbcopy
```

### 2.4 Secrets a cadastrar no GitHub

Em **Settings → Secrets and variables → Actions → New repository secret**, crie:

| Secret | Conteúdo |
| :--- | :--- |
| `APPSTORE_ISSUER_ID` | Issuer ID da API Key (passo 2.1). |
| `APPSTORE_KEY_ID` | Key ID da API Key (passo 2.1). |
| `APPSTORE_API_PRIVATE_KEY` | Conteúdo Base64 do arquivo `.p8` (passo 2.3). |
| `IOS_DISTRIBUTION_CERTIFICATE_P12` | Conteúdo Base64 do certificado `.p12` (passo 2.3). |
| `IOS_DISTRIBUTION_CERTIFICATE_PASSWORD` | Senha definida ao exportar o `.p12`. |
| `IOS_PROVISIONING_PROFILE` | Conteúdo Base64 do `.mobileprovision` (passo 2.3). |

> [!WARNING]
> **Nunca** cole esses valores diretamente no código YAML ou em arquivos versionados. Eles devem existir **somente** como GitHub Secrets, acessados no workflow via `${{ secrets.NOME_DO_SECRET }}`.

---

## 3. Próximos passos de evolução do workflow (visão geral)

Uma vez com os secrets acima cadastrados, o job de build passará a incluir, antes do `flutter build ipa`, uma etapa de importação de certificado/perfil no *keychain* temporário do runner (via ação como `apple-actions/import-codesign-certs`), e a chamada final passará a ser:

```bash
flutter build ipa --release \
  --export-options-plist=ios/ExportOptions.plist
```

seguida do envio via `xcrun altool` (ou a ferramenta mais recente `xcrun notarytool`/`fastlane pilot upload`) usando a API Key do App Store Connect para publicar automaticamente a build no **TestFlight**.

Esta etapa será implementada em uma sprint futura, assim que as credenciais Apple estiverem disponíveis para a equipe.

---

## 4. Checklist de pré-requisitos

- [ ] Conta Apple Developer Program ativa (paga, USD 99/ano).
- [ ] App criado no App Store Connect com o Bundle ID `com.chronos.app`.
- [ ] API Key gerada (`.p8`) com papel adequado.
- [ ] Certificado de Distribuição (`.p12`) exportado com senha.
- [ ] Provisioning Profile de distribuição (`.mobileprovision`) gerado.
- [ ] Todos os 6 secrets cadastrados em **Settings → Secrets and variables → Actions**.
