# 📱 Guia de Build para Android e iOS

## 🎯 Checklist Pré-Build

Antes de gerar o build de produção, verifique:

- [x] TypeScript sem erros: `npx tsc --noEmit`
- [x] Testes passando: `npm test`
- [x] Assets existem: icon.png, splash.png, adaptive-icon.png
- [x] app.json configurado com bundleIdentifier/package corretos
- [x] eas.json configurado
- [x] Versão atualizada em app.json

## 🤖 Android

### Scripts Disponíveis

```bash
# APK para testes internos
build-preview.bat

# App Bundle para Play Store
build-production.bat
```

### Opção 1: APK para Testes (Mais Simples)

```bash
# Instalar EAS CLI
npm install -g eas-cli

# Login no Expo
eas login

# Configurar projeto
eas build:configure

# Gerar APK
eas build --platform android --profile preview
```

O APK será gerado e você pode baixar pelo link fornecido.

### Opção 2: App Bundle para Play Store

```bash
# Gerar AAB (Android App Bundle)
eas build --platform android --profile production
```

### Configurar no Google Play Console

1. Acesse: https://play.google.com/console
2. Crie um novo app
3. Faça upload do AAB gerado
4. Preencha as informações do app
5. Envie para revisão

**Custo**: Taxa única de $25 USD para desenvolvedores

---

## 🍎 iOS (iPhone/iPad)

### Pré-requisitos

- Conta Apple Developer ($99 USD/ano)
- Provisioning Profiles configurados

### Build

```bash
# Gerar IPA
eas build --platform ios --profile production
```

### Publicar na App Store

1. Baixe o IPA gerado
2. Acesse: https://appstoreconnect.apple.com
3. Crie um novo app
4. Use o Transporter ou Xcode para fazer upload
5. Preencha metadados
6. Envie para revisão

**Custo**: $99 USD/ano para Apple Developer Program

---

## 🧪 Testar Builds Localmente

### Android (Sem Publicar)

1. **Emulador Android Studio**:
   ```bash
   npm run android
   ```

2. **Dispositivo Físico via USB**:
   - Ative "Depuração USB" no celular
   - Conecte via cabo USB
   - Execute: `npm run android`

### iOS (Requer Mac)

1. **Simulador iOS**:
   ```bash
   npm run ios
   ```

2. **iPhone Físico**:
   - Requer Xcode e conta Apple Developer
   - Configure no Xcode

---

## 🌐 Alternativa: Expo Go (Desenvolvimento)

**Mais rápido para testes** sem gerar builds:

```bash
npm start
```

Depois escaneie o QR Code com:
- **Android**: Expo Go app
- **iOS**: Câmera nativa ou Expo Go

**Limitação**: Não pode ser publicado nas lojas assim.

---

## 📋 Checklist Antes de Publicar

### Geral
- [ ] Testar em dispositivos reais (Android e iOS)
- [ ] Verificar todas as funcionalidades
- [ ] Testar com/sem internet
- [ ] Verificar permissões de áudio
- [ ] Testar narração (TTS)

### Android
- [ ] Configurar `android.package` único
- [ ] Incrementar `versionCode` a cada update
- [ ] Gerar ícone adaptativo
- [ ] Testar em diferentes tamanhos de tela

### iOS
- [ ] Configurar `ios.bundleIdentifier` único
- [ ] Incrementar `buildNumber`
- [ ] Adicionar permissões necessárias
- [ ] Testar em iPad também

---

## 🔧 Configurações Importantes

### app.json já está configurado com:

```json
{
  "ios": {
    "bundleIdentifier": "com.bibliakids.app",
    "buildNumber": "1.0.0"
  },
  "android": {
    "package": "com.bibliakids.app",
    "versionCode": 1
  }
}
```

**⚠️ IMPORTANTE**: Mude `com.bibliakids.app` para algo único para você!

Exemplo: `com.seuNome.bibliakids`

---

## 💰 Resumo de Custos

| Plataforma | Custo | Tipo |
|------------|-------|------|
| Google Play | $25 USD | Taxa única |
| Apple App Store | $99 USD/ano | Assinatura anual |
| Expo/EAS | Grátis ou $29/mês | Plano gratuito disponível |

---

## 🆘 Problemas Comuns

### "Build failed"
- Verifique se todos os assets existem
- Execute: `npm install` novamente
- Limpe cache: `npx expo start -c`

### "Signing error" (iOS)
- Verifique credenciais Apple Developer
- Configure Provisioning Profiles

### "Permission denied"
- Verifique permissões no app.json
- No Android: adicione no array `permissions`

---

## 🚀 Build Rápido para Amigos Testarem

Use o **Expo Update** para compartilhar sem build:

```bash
# Publicar update
npx expo publish

# Compartilhe o link gerado
```

Qualquer pessoa com Expo Go pode testar!

---

**📚 Mais Informações:**
- [Documentação EAS Build](https://docs.expo.dev/build/introduction/)
- [Submeter para Lojas](https://docs.expo.dev/submit/introduction/)
- [Guia React Native](https://reactnative.dev/docs/running-on-device)
