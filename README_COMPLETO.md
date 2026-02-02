# 📱 Aventuras da Bíblia - App Infantil

Um aplicativo educativo de histórias bíblicas com mini-jogos, quiz e sistema de recompensas para crianças de 4-8 anos.

## 🎮 Características

- ✅ **7 Fases**: Criação, Noé, Davi, Daniel, Jonas, Jesus e Parábolas
- ✅ **Mini-jogos Interativos**: Jogos educativos para cada fase
- ✅ **Quiz com 8 Perguntas** por fase
- ✅ **Sistema de Estrelas**: 0-3 estrelas por desempenho
- ✅ **Álbum de Adesivos**: Colecione recompensas
- ✅ **Narração (TTS)**: Voz do aparelho em português
- ✅ **100% Offline**: Funciona sem internet
- ✅ **Persistência**: Progresso salvo automaticamente

## 🛠️ Tecnologias

- **React Native** + **Expo** (~50.0.0)
- **TypeScript** para segurança de tipos
- **React Navigation** para navegação
- **AsyncStorage** para persistência
- **Expo AV** para áudio/música
- **Expo Speech** para narração

## 📦 Instalação

### Pré-requisitos
- Node.js 18+ (LTS)
- npm ou yarn
- App **Expo Go** no celular ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) | [iOS](https://apps.apple.com/app/expo-go/id982107779))

### Passos

```bash
# 1. Clone o repositório
git clone https://github.com/SEU_USUARIO/bibliakids.git
cd bibliakids

# 2. Instale as dependências
npm install

# 3. Inicie o servidor Expo
npm start
```

### 📱 Testar no Celular

1. Abra o app **Expo Go** no seu celular
2. Escaneie o QR Code que aparece no terminal
3. Aguarde o carregamento do app

## 🚀 Build para Produção

### Android (APK)

```bash
# Gerar APK
npx expo build:android -t apk

# Ou usar EAS (recomendado)
npx eas build --platform android
```

### iOS (IPA)

```bash
# Requer conta Apple Developer
npx eas build --platform ios
```

## 📁 Estrutura do Projeto

```
bibliakids/
├── App.tsx                 # Componente raiz + navegação
├── app.json               # Configurações Expo
├── package.json           # Dependências
├── assets/                # Recursos estáticos
│   ├── bgm/              # Músicas de fundo (.wav)
│   ├── sfx/              # Efeitos sonoros (.wav)
│   ├── icon.png          # Ícone do app
│   └── splash.png        # Splash screen
└── src/
    ├── theme.ts          # Sistema de design
    ├── bgm/              # Hook de música
    ├── sfx/              # Hook de efeitos sonoros
    ├── components/       # Componentes reutilizáveis
    ├── data/             # JSON com fases e perguntas
    ├── minigames/        # 7 mini-jogos
    ├── screens/          # 8 telas do app
    └── state/            # Gerenciamento de estado
```

## 🎯 Fluxo do Aplicativo

```
Avatar → Mapa → História → Mini-jogo → Quiz → Recompensa → Álbum
```

## ⚙️ Configurações (Tela "Para Pais")

- **Modo Aleatório**: Embaralha perguntas
- **Narração**: Ativa/desativa voz (TTS)
- **Efeitos Sonoros**: Sons de acerto/erro
- **Música de Fundo**: Música por fase
- **Animações**: Confetes e estrelas

## 📊 Sistema de Pontuação

- **3 Estrelas**: 90%+ de acerto
- **2 Estrelas**: 60-89% de acerto
- **1 Estrela**: 30-59% de acerto
- **0 Estrelas**: < 30% de acerto

## 🌍 Compatibilidade

- ✅ **Android**: 5.0+ (API 21+)
- ✅ **iOS**: 13.0+
- ✅ **Web**: Suporte experimental (Expo Web)

## 📝 Scripts Disponíveis

```bash
npm start          # Inicia servidor Expo
npm run android    # Abre no emulador Android
npm run ios        # Abre no simulador iOS
npm run web        # Abre no navegador
npm run lint       # Verifica código (ESLint)
npm run typecheck  # Verifica tipos (TypeScript)
```

## 🔒 Privacidade

- ✅ Sem coleta de dados pessoais
- ✅ Sem analytics
- ✅ Sem publicidade
- ✅ 100% offline após instalação

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Commit: `git commit -m 'Adiciona nova funcionalidade'`
4. Push: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

## 📄 Licença

Este projeto é de código aberto para fins educacionais.

## 👨‍💻 Autor

Desenvolvido com ❤️ para ensinar crianças sobre histórias bíblicas de forma lúdica e interativa.

## 📞 Suporte

Se encontrar algum problema:
1. Verifique se tem a versão correta do Node.js
2. Execute `npm install` novamente
3. Limpe o cache: `npx expo start -c`
4. Abra uma [issue no GitHub](https://github.com/SEU_USUARIO/bibliakids/issues)

---

**⭐ Se gostou do projeto, deixe uma estrela no GitHub!**
