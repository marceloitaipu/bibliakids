@echo off
echo ========================================
echo   Iniciando Expo com TUNEL PUBLICO
echo ========================================
echo.

REM Adiciona Node.js portátil ao PATH temporariamente
set PATH=C:\Users\marcelos\nodejs-portable;%PATH%

REM Mata processos Node antigos
echo Limpando processos Node antigos...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo Iniciando servidor Expo com tunel...
echo ATENCAO: Pode demorar 30-60 segundos para conectar
echo Se der erro, tente rodar novamente.
echo.
echo A URL sera acessivel de qualquer lugar!
echo Escaneie o QR Code com o Expo Go
echo.
echo Pressione Ctrl+C para parar o servidor
echo ========================================
echo.

REM Inicia o Expo com tunnel
cd /d C:\Bibliakids
call node_modules\.bin\expo.cmd start --tunnel

pause
