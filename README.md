# 📖 Aventuras da Bíblia - Bíblia Kids

> Um aplicativo educacional React Native + Expo para ensinar histórias da Bíblia para crianças de forma divertida e interativa.

---

## 🎮 **INSTALE O APP NO SEU CELULAR!**

### 📱 Opção 1: Expo Go (Mais Fácil)

1. **Baixe o Expo Go no seu celular:**
   - 🤖 [Android - Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - 🍎 [iOS - App Store](https://apps.apple.com/app/expo-go/id982107779)

2. **Acesse o app:**
   - Abra o Expo Go
   - Toque em "Enter URL manually"
   - Digite: `exp://u.expo.dev/a3a0f0e4-7bb8-4b4f-ab86-08702ed78695`

### 📦 Opção 2: Baixar APK (Android)

Acesse a página de [Releases](https://github.com/marceloitaipu/bibliakids/releases) para baixar o APK mais recente.

---

## 🌟 Sobre o Projeto

**Aventuras da Bíblia** ensina histórias bíblicas para crianças através de:
- 📚 **7 Níveis de histórias** com narração e texto
- 🎮 **Minijogos interativos** temáticos
- ❓ **Quizzes educativos** com perguntas aleatórias
- ⭐ **Sistema de estrelas** e progressão
- 🎨 **Visual colorido** com gradientes e animações
- 🔊 **Música de fundo** e efeitos sonoros
- 💾 **Salvamento automático** do progresso
- 🔄 **Botão de reiniciar** o jogo do zero

---

## ✨ Melhorias Recentes
- ✅ **Jogo randomizado**: Perguntas E opções embaralhadas
- ✅ **Reiniciar do zero**: Botão fácil de acessar
- ✅ **Persistência**: Progresso salvo automaticamente
- ✅ **Sistema de bloqueio**: Níveis desbloqueiam em sequência
- ✅ **21 testes unitários** passando
- ✅ **Analytics**: Rastreamento de uso
- ✅ **Acessibilidade**: Labels para leitores de tela

---

## 🚀 Como Rodar Localmente

### Pré-requisitos:
- Node.js (LTS)
- npm ou yarn
- Expo Go no celular

### Passos:
```bash
# Clone o repositório
git clone https://github.com/marceloitaipu/bibliakids.git
cd bibliakids

# Instale as dependências
npm install

# Inicie o servidor
npm start

# Ou com túnel público:
npx expo start --tunnel
```

Escaneie o QR Code com o Expo Go!

---

## 📚 Documentação
- 📖 [INICIO_RAPIDO.md](INICIO_RAPIDO.md) - Instruções passo-a-passo
- 📖 [README_COMPLETO.md](README_COMPLETO.md) - Documentação completa
- 📖 [GITHUB_SETUP.md](GITHUB_SETUP.md) - Como publicar no GitHub
- 📖 [BUILD_GUIDE.md](BUILD_GUIDE.md) - Como gerar builds Android/iOS
- 📖 [CHANGELOG.md](CHANGELOG.md) - Histórico de mudanças

## Fluxo do jogo
Avatar -> Mapa -> História -> Mini-jogo -> Quiz -> Recompensa -> Álbum

## Recursos principais
- ✅ **Persistência (AsyncStorage)** — Progresso salvo automaticamente
- ✅ **Modo aleatório** (perguntas embaralhadas) — "Para pais"
- ✅ **Narração (voz / TTS)** — "Para pais"
- ✅ **Som (SFX) offline**: acerto/erro/toque — "Para pais"
- ✅ **Música de fundo**: BGM por fase — "Para pais"
- ✅ **Animações leves**: confete/estrelas — “Para pais”

## Mini-jogos (7 fases) — implementados
1) Criação — Montar o Mundo
2) Noé — Animais na Arca (duplas)
3) Davi — A Pedra da Coragem
4) Daniel — Proteger Daniel (escudos)
5) Jonas — Guiar o Grande Peixe (3 pistas)
6) Jesus — Seguir a Estrela
7) Parábolas — Plantar no Solo Certo

## Onde está o som
- Hook: `src/sfx/useSfx.ts`
- Arquivos: `assets/sfx/*.wav` (offline)

## Onde está a animação de celebração
- `src/components/ConfettiBurst.tsx`


## Extras (novo)
- SFX extra: `assets/sfx/perfect.wav` (usado em acerto perfeito / 3 estrelas)
- Pulsar do botão “Próxima” quando liberado: `src/components/Pulse.tsx`
- Estrelas subindo na recompensa: `src/components/StarRise.tsx`


## Música de fundo (novo)
- Hook: `src/bgm/useBgm.ts`
- Arquivos: `assets/bgm/*.wav` (offline)
- Toggle em “Para Pais”: Música de fundo
## 🚀 Publicar no GitHub
Veja [GITHUB_SETUP.md](GITHUB_SETUP.md) para instruções passo-a-passo.

## 📱 Build para Android/iOS
Veja [BUILD_GUIDE.md](BUILD_GUIDE.md) para instruções completas de build.
