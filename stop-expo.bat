@echo off
echo ========================================
echo   Parando Servidor Expo
echo ========================================
echo.

echo Parando todos os processos Node.js...
taskkill /F /IM node.exe 2>nul

if %errorlevel% equ 0 (
    echo.
    echo ✓ Servidor parado com sucesso!
) else (
    echo.
    echo Nenhum servidor Expo estava rodando.
)

echo.
pause
