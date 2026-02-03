@echo off
echo ====================================
echo  Iniciando Expo no Navegador Web
echo ====================================
echo.

REM Configurar PATH para Node.js portable
set PATH=C:\Users\marcelos\nodejs-portable;%PATH%

REM Iniciar Expo no modo web
call .\node_modules\.bin\expo.cmd start --web

pause
