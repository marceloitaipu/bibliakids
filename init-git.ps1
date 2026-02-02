# Script para inicializar Git e preparar para GitHub
# Execute: .\init-git.ps1

Write-Host "🚀 Inicializando Git para BibliaKids..." -ForegroundColor Cyan

# 1. Verificar se já existe repositório Git
if (Test-Path .git) {
    Write-Host "⚠️  Repositório Git já existe!" -ForegroundColor Yellow
    $confirm = Read-Host "Deseja reiniciar? (s/n)"
    if ($confirm -ne 's') {
        Write-Host "❌ Cancelado." -ForegroundColor Red
        exit
    }
    Remove-Item .git -Recurse -Force
}

# 2. Inicializar Git
Write-Host "`n📦 Inicializando repositório..." -ForegroundColor Green
git init

# 3. Adicionar todos os arquivos
Write-Host "📝 Adicionando arquivos..." -ForegroundColor Green
git add .

# 4. Fazer primeiro commit
Write-Host "💾 Criando commit inicial..." -ForegroundColor Green
git commit -m "🎉 Inicial: App Bíblia Kids com persistência e melhorias"

# 5. Instruções para conectar ao GitHub
Write-Host "`n✅ Git inicializado com sucesso!" -ForegroundColor Green
Write-Host "`n📋 PRÓXIMOS PASSOS:" -ForegroundColor Cyan
Write-Host "1. Crie um repositório no GitHub: https://github.com/new" -ForegroundColor Yellow
Write-Host "2. Execute os comandos abaixo (substitua SEU_USUARIO):" -ForegroundColor Yellow
Write-Host "`ngit remote add origin https://github.com/SEU_USUARIO/bibliakids.git" -ForegroundColor White
Write-Host "git branch -M main" -ForegroundColor White
Write-Host "git push -u origin main" -ForegroundColor White
Write-Host "`n📖 Leia GITHUB_SETUP.md para instruções detalhadas" -ForegroundColor Cyan
