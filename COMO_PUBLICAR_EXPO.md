# 🚀 COMO PUBLICAR O APP NO EXPO

## ⚠️ PROBLEMA ATUAL

Seu PowerShell está bloqueando scripts do npm/npx.

## ✅ SOLUÇÃO

### OPÇÃO 1: Usar CMD (Prompt de Comando) ao invés do PowerShell

1. Abra o **Prompt de Comando** (CMD):
   - Pressione `Win + R`
   - Digite: `cmd`
   - Enter

2. Navegue até a pasta:
   ```cmd
   cd c:\Bibliakids
   ```

3. Publique no Expo:
   ```cmd
   npx expo login
   ```
   (Digite seu email e senha do Expo)

4. Depois de logar:
   ```cmd
   npx expo publish
   ```

---

### OPÇÃO 2: Criar Conta Expo e Publicar

#### Passo 1: Criar Conta (se não tiver)

1. Acesse: https://expo.dev/signup
2. Crie conta com email ou GitHub
3. Confirme o email

#### Passo 2: Publicar (via CMD)

```cmd
cd c:\Bibliakids
npx expo login
npx expo publish
```

**O que acontece:**
- Expo faz upload do código
- Gera URL pública
- Qualquer pessoa pode acessar via Expo Go

#### Passo 3: Compartilhar

Após publicar, você recebe:
- 🌐 URL: `https://expo.dev/@SEU_USUARIO/bibliakids`
- 📱 Código QR para compartilhar
- 🔗 Link direto para Expo Go

---

### OPÇÃO 3: Publicar via Interface Web (Easiest)

O Expo também tem interface web, mas o ideal é via CLI.

---

## 📱 RESULTADO FINAL

Após publicar, você terá:

```
✅ URL Pública: https://expo.dev/@marceloitaipu/bibliakids
✅ QR Code para compartilhar
✅ Atualização instantânea (ao fazer expo publish novamente)
```

**Qualquer pessoa pode:**
1. Instalar Expo Go no celular
2. Escanear seu QR Code
3. Usar o app imediatamente!

---

## 🔄 ATUALIZAÇÕES FUTURAS

Quando fizer mudanças:

```cmd
cd c:\Bibliakids
npx expo publish
```

O app é atualizado automaticamente para todos os usuários!

---

## 💡 ALTERNATIVA: Build APK Direto

Se preferir ter um APK para instalar:

```cmd
cd c:\Bibliakids
npx eas build --platform android --profile preview
```

Isso gera um APK que pode ser instalado em qualquer Android.

---

## 📊 COMANDOS ÚTEIS

```cmd
# Ver quem está logado
npx expo whoami

# Logout
npx expo logout

# Ver projetos publicados
npx expo projects

# Abrir projeto no navegador
npx expo start --web
```

---

## 🆘 SE DER ERRO

### "Not logged in"
```cmd
npx expo login
```

### "Project not configured"
Adicione no app.json:
```json
{
  "expo": {
    "owner": "marceloitaipu",
    "slug": "bibliakids"
  }
}
```

### "Network error"
- Verifique internet
- Tente: `npx expo publish --max-workers 1`

---

## 🎯 PASSOS RESUMIDOS

1. Abra **CMD** (não PowerShell)
2. `cd c:\Bibliakids`
3. `npx expo login` (email/senha)
4. `npx expo publish`
5. Copie a URL gerada
6. Compartilhe! 🎉

---

## 📱 TESTAR APÓS PUBLICAR

1. Abra Expo Go no celular
2. Vá em "Enter URL manually"
3. Cole: `exp://exp.host/@marceloitaipu/bibliakids`
4. Ou escaneie o QR Code gerado

---

**🚀 Em 5 minutos seu app está online e acessível por qualquer pessoa!**
