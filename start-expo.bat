@echo off
echo ========================================
echo   Iniciando Expo - Bibliakids
echo ========================================
echo.

REM Adiciona Node.js portátil ao PATH temporariamente
set PATH=C:\Users\marcelos\nodejs-portable;%PATH%

REM Mata processos Node antigos
echo Limpando processos Node antigos...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo Iniciando servidor Expo...
echo.
echo Quando o QR Code aparecer:
echo 1. Abra o Expo Go no celular
echo 2. Escaneie o QR Code
echo.
echo Pressione Ctrl+C para parar o servidor
echo ========================================
echo.

REM Inicia o Expo
cd /d C:\Bibliakids
call node_modules\.bin\expo.cmd start

pause
