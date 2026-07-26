Para gerar o APK do seu projeto RC Bíblia, siga estes passos:

1. **Faça o Download do Projeto**: Clique no botão "Download" ou exporte para o GitHub e clone em sua máquina.
2. **Ambiente Local**: Certifique-se de ter o **Node.js**, **Bun** (ou npm) e o **Android Studio** instalados.
3. **Instale as Dependências**: No terminal da pasta do projeto, rode `npm install`.
4. **Build do Projeto**:
   - `bun run build` (para gerar a pasta /dist)
   - `npx cap sync android` (para sincronizar o código com a pasta android)
5. **Gerar o APK**:
   - Abra o projeto no **Android Studio** (`npx cap open android`).
   - No menu superior, vá em **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
6. **Localize o arquivo**: O Android Studio mostrará um balão no canto inferior direito com um link "locate" para o arquivo `.apk` gerado.

O APK de teste estará pronto para instalação em dispositivos Android físicos.