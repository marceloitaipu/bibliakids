# Estado Atual do Projeto BibliaKids
**Última atualização:** Junho de 2025  
**Repositório:** github.com/marceloitaipu/bibliakids  
**Status:** ✅ App completo e funcional | ⏳ Aguardando geração de APK

---

## 🎯 Objetivo Pendente
**Gerar APK para instalação permanente em Android** (sem precisar de servidor Expo rodando)

### Por que APK?
- ❌ EAS Build (nuvem): Falhou com erro de dependências
- ❌ Expo Go + tunnel: Rede corporativa bloqueia conexões
- ❌ Expo Go + LAN: PC e celular em redes diferentes
- ✅ **APK local via Android Studio**: Única opção gratuita viável

---

## 📦 O Que Já Foi Feito

### ✅ Desenvolvimento Completo
- 7 níveis bíblicos (Criação, Noé, Davi, Daniel, Jonas, Jesus Nascimento, Parábolas)
- 7 minigames interativos (creation_place, noe_pairs, david_stone, daniel_shields, jonah_guide, star_path, parables_seed)
- Sistema de quiz com randomização de perguntas E respostas
- Sistema de recompensas e álbum com barra de progresso
- Avatares personalizáveis com preview ao vivo
- Música de fundo + efeitos sonoros
- Tela para pais com configurações
- Histórias enriquecidas com 3 linhas de narrativa por nível

### ✅ Correções Implementadas (Rodada Anterior)
1. **Emoji corrompido**: Corrigido `👶🏻` (pele clara) em AvatarScreen.tsx
2. **Bug de desbloqueio**: Jonas (nível 5) aparecia desbloqueado incorretamente
   - **Arquivo**: `src/state/utils.ts` - função `isLevelUnlocked`
   - **Solução**: Verifica TODOS os níveis anteriores (não só o imediato)
3. **Randomização completa**: Perguntas E opções embaralhadas
   - **Arquivo**: `src/screens/QuizScreen.tsx` - `shuffledQuestions`
4. **Botão de reset**: 🔄 no cabeçalho do MapScreen para reiniciar progresso

### ✅ Correções e Melhorias (Rodada Atual)

#### Bugs Corrigidos
1. **BUG CRÍTICO — QuizScreen double-counting**: A função `next()` calculava `doneCorrect = correct + lastOk`, mas `correct` já era incrementado em `onPick()`. A última resposta correta era contada duas vezes, inflando a pontuação. Corrigido para usar `correct` diretamente.
2. **MapScreen "fase 0"**: Quando idx=1, mostrava "Complete a fase 0 primeiro!" (usando idx como 0-based). Corrigido para exibir o título real do nível anterior.
3. **Imports não utilizados**: Removidos `PanResponder` (ParablesSeedGame), `Dimensions` (DanielShieldsGame/JonahGuideGame), `useMemo` (JonahGuideGame).

#### Minigames Melhorados
4. **NoePairsGame**: Aumentado de 3 para 6 pares (12 cartas em grid 4×3). Limiares de avaliação agora dinâmicos baseados em `totalPairs` em vez de hardcoded.

#### Telas Reescritas
5. **StoryScreen**: Banner hero com gradiente por nível, emojis temáticos, animações de entrada (fade + slide + spring), styling de citação com borda lateral, suporte a 3 linhas de história.
6. **AlbumScreen**: Barra de progresso com gradiente, contagem de adesivos, mensagem de conclusão, badges circulares dos emojis, distinção visual entre adesivos conquistados/bloqueados.
7. **AvatarScreen**: Preview do avatar ao vivo (mostra skin + roupa + nome), ScrollView, maxLength no input de nome, accessibility labels/states, indicadores de cor e nomes para cada opção.
8. **MapScreen**: Header com gradiente mostrando saudação pelo nome, progresso total de estrelas com mini barra, cards de níveis com avatar circular de emoji, menu simplificado.

#### Conteúdo Enriquecido
9. **Stories**: Todas as 7 histórias enriquecidas com `line3` (terceira linha de narrativa). Interface `Story` atualizada com campo opcional `line3`.

### ✅ Testes
- 21/21 testes passando
- Cobertura: QuizScreen, utils, AppState, Analytics
- Comando: `npm test`

### ✅ GitHub
- Todo código commitado
- README atualizado com instruções
- Repositório: https://github.com/marceloitaipu/bibliakids

---

## 🚀 Próximos Passos (NO NOTEBOOK)

### Opção A: APK com Android Studio (Recomendado)
**Tempo total: ~1 hora**

#### 1. Instalar Android Studio
```
Download: https://developer.android.com/studio
Tamanho: ~1GB download + ~3GB instalação
Tempo: 15-30 minutos
```

Durante instalação, marcar:
- ✅ Android SDK
- ✅ Android SDK Platform
- ✅ Android Virtual Device

#### 2. Configurar Variáveis de Ambiente
```powershell
# Definir ANDROID_HOME (ajustar caminho se necessário)
[System.Environment]::SetEnvironmentVariable('ANDROID_HOME', 'C:\Users\SEU_USUARIO\AppData\Local\Android\Sdk', 'User')

# Adicionar ao PATH
$currentPath = [System.Environment]::GetEnvironmentVariable('Path', 'User')
$newPath = "$currentPath;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\tools;%ANDROID_HOME%\cmdline-tools\latest\bin"
[System.Environment]::SetEnvironmentVariable('Path', $newPath, 'User')

# REINICIAR TERMINAL OU VS CODE
```

#### 3. Gerar APK
```powershell
# No diretório C:\Bibliakids
npx expo prebuild --clean

# Gerar APK release
npx expo run:android --variant release
```

**APK estará em:** `android/app/build/outputs/apk/release/app-release.apk`

#### 4. Upload no GitHub
1. Ir em: https://github.com/marceloitaipu/bibliakids/releases/new
2. Tag: `v1.0.0`
3. Título: `BibliaKids v1.0 - APK Android`
4. Arrastar `app-release.apk` na área de anexos
5. Publicar release

**Link para compartilhar:**
```
https://github.com/marceloitaipu/bibliakids/releases/latest/download/app-release.apk
```

---

### Opção B: Expo Go (Teste Rápido, Requer Servidor)
**Tempo: 5 minutos**

```powershell
# No notebook (com celular na mesma rede Wi-Fi)
npx expo start --lan

# OU se tiver boa internet:
npx expo start --tunnel

# Escanear QR code com Expo Go
```

⚠️ **Desvantagem**: Precisa manter terminal rodando sempre que usar o app

---

## 📁 Estrutura do Projeto

### Arquivos Principais
```
App.tsx              → Entrada principal
app.json             → Configuração Expo
eas.json             → Configuração EAS Build
package.json         → Dependências
tsconfig.json        → TypeScript config
```

### Código Fonte (`src/`)
```
screens/             → 9 telas principais
  ├── MapScreen.tsx        (seleção de níveis)
  ├── QuizScreen.tsx       (quiz com randomização)
  ├── StoryScreen.tsx      (narrativas bíblicas)
  ├── MiniGameScreen.tsx   (minigames)
  ├── RewardScreen.tsx     (recompensas)
  ├── AlbumScreen.tsx      (coleção)
  ├── AvatarScreen.tsx     (personalização)
  ├── ParentScreen.tsx     (área dos pais)
  └── DevTestScreen.tsx    (debug)

state/
  ├── AppState.tsx         (Context + useReducer)
  └── utils.ts             (lógica de desbloqueio)

minigames/
  ├── registry.ts          (registro de jogos)
  ├── types.ts             (interfaces)
  └── games/               (7 minigames)

components/          → Componentes reutilizáveis
data/                → levels.json (dados dos níveis)
theme.ts             → Cores e estilos
```

### Assets
```
assets/
  ├── bgm/           → Música de fundo (.mp3)
  └── sfx/           → Efeitos sonoros (.mp3)
```

---

## 🔧 Comandos Úteis

```powershell
# Instalar dependências
npm install

# Rodar testes
npm test

# Iniciar servidor web (teste no navegador)
npx expo start --web

# Iniciar servidor para mobile
npx expo start --lan

# Limpar cache se der problema
npx expo start --clear
```

---

## ⚙️ Configurações Técnicas

### Versões
- React: 19.1.0
- React Native: 0.81.5
- Expo SDK: 54
- TypeScript: 5.3.3
- Jest: 29.7.0

### EAS Build Config (eas.json)
```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleRelease"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

---

## 🐛 Problemas Conhecidos e Soluções

### EAS Build falha com "Unknown error"
- **Causa**: Possível conflito de dependências (jest-expo 52.0.6 vs esperado 54.0.17)
- **Solução**: Usar Android Studio localmente (Opção A acima)

### Expo Go não conecta
- **Causa**: Firewall corporativo ou redes diferentes
- **Solução**: No notebook pessoal, usar `--lan` com celular no mesmo Wi-Fi

### "Cannot find module" ao rodar testes
- **Solução**: `npm install` e verificar que jest-expo está instalado

---

## 📝 Notas Importantes

1. **Backup antes de `npx expo prebuild`**: O comando cria pasta `android/` nativa
2. **Keystore**: Se perguntado, deixar Expo gerar automaticamente
3. **Primeira build**: Pode demorar 10-15 minutos (baixa dependências)
4. **Celular**: Precisa habilitar "Instalar de fontes desconhecidas" para APK

---

## 🎮 Como Testar o App

### Web (mais rápido)
```powershell
npx expo start --web
# Abre automaticamente em localhost:8082
```

### Android (Expo Go - requer servidor)
```powershell
npx expo start --lan
# Escanear QR code com app Expo Go
```

### Android (APK - permanente)
1. Gerar APK com Android Studio (Opção A)
2. Transferir para celular via USB ou upload no GitHub
3. Instalar e usar offline

---

## ✅ Checklist Final

- [x] App desenvolvido e funcional
- [x] Bugs corrigidos (emoji, unlock, randomização, double-counting, fase 0)
- [x] Telas reescritas (StoryScreen, AlbumScreen, AvatarScreen, MapScreen)
- [x] Minigames melhorados (NoePairsGame)
- [x] Conteúdo enriquecido (histórias com 3 linhas)
- [x] Testes passando (21/21)
- [x] Código no GitHub
- [ ] **APK gerado** ← PRÓXIMO PASSO
- [ ] APK no GitHub Releases
- [ ] Link compartilhável criado

---

**Quando retornar no notebook, siga a Opção A (Android Studio) para gerar o APK final! 🚀**
