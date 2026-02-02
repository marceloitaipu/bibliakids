# 🚀 Como Publicar no GitHub

## Passo 1: Instalar Git (se necessário)

Se ainda não tem o Git instalado:
1. Baixe em: https://git-scm.com/download/win
2. Instale com as configurações padrão

## Passo 2: Criar Repositório no GitHub

1. Acesse: https://github.com/new
2. Nome do repositório: `bibliakids`
3. Descrição: "App educativo de histórias bíblicas para crianças"
4. Deixe **Público** (ou Privado se preferir)
5. **NÃO** marque "Add a README file"
6. Clique em **Create repository**

## Passo 3: Configurar Git Local (primeira vez)

Abra o PowerShell no VS Code e execute:

```powershell
# Configurar seu nome e email
git config --global user.name "Seu Nome"
git config --global user.email "seu.email@example.com"
```

## Passo 4: Enviar Projeto para o GitHub

Execute estes comandos no terminal (PowerShell) dentro da pasta do projeto:

```powershell
# 1. Inicializar repositório Git
git init

# 2. Adicionar todos os arquivos
git add .

# 3. Fazer o primeiro commit
git commit -m "🎉 Inicial: App Bíblia Kids completo com persistência"

# 4. Adicionar o repositório remoto
# SUBSTITUA 'SEU_USUARIO' pelo seu username do GitHub
git remote add origin https://github.com/SEU_USUARIO/bibliakids.git

# 5. Enviar para o GitHub
git branch -M main
git push -u origin main
```

### ⚠️ Se der erro de autenticação:

O GitHub não aceita mais senha. Use um **Personal Access Token**:

1. Vá em: https://github.com/settings/tokens
2. Clique em **Generate new token (classic)**
3. Marque o escopo `repo`
4. Copie o token gerado
5. Use o token como senha quando pedir

## Passo 5: Verificar no GitHub

1. Acesse: `https://github.com/SEU_USUARIO/bibliakids`
2. Você verá todos os arquivos publicados!

## 📱 Como Outras Pessoas Podem Usar

Qualquer pessoa pode clonar e usar:

```bash
git clone https://github.com/SEU_USUARIO/bibliakids.git
cd bibliakids
npm install
npm start
```

## 🔄 Atualizações Futuras

Quando fizer mudanças no código:

```powershell
# 1. Adicionar mudanças
git add .

# 2. Fazer commit com descrição
git commit -m "✨ Adiciona nova funcionalidade"

# 3. Enviar para GitHub
git push
```

## 📝 Dicas

- Use mensagens de commit descritivas
- Commit frequentemente (não espere acumular muitas mudanças)
- Sempre faça `git pull` antes de começar a trabalhar (se trabalhar em múltiplos computadores)

## 🎯 Próximos Passos Recomendados

1. ⭐ Adicione uma descrição no repositório
2. 📄 Adicione tags/releases quando fizer versões estáveis
3. 🔄 Configure GitHub Actions para CI/CD (opcional)
4. 📱 Publique na Play Store / App Store quando estiver pronto

---

**✅ Pronto! Seu projeto está agora no GitHub e pode ser compartilhado com o mundo!**
