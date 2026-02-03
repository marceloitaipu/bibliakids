@echo off
echo ========================================
echo   PUBLICANDO APP NO EXPO
echo ========================================
echo.
echo Isso vai criar uma URL permanente que
echo funciona de qualquer lugar do mundo!
echo.
echo Voce precisa:
echo 1. Ter uma conta no Expo (expo.dev)
echo 2. Estar logado (expo login)
echo.
pause
echo.

REM Adiciona Node.js ao PATH
set PATH=C:\Users\marcelos\nodejs-portable;%PATH%

cd /d C:\Bibliakids

echo Verificando login...
call node_modules\.bin\expo.cmd whoami

echo.
echo Se NAO estiver logado, execute: expo login
echo Depois rode este script novamente.
echo.
pause

echo.
echo Publicando app...
echo AGUARDE: Isso pode demorar alguns minutos!
echo.

call node_modules\.bin\eas.cmd update --branch production --message "Versao inicial"

echo.
echo ========================================
echo   PUBLICACAO CONCLUIDA!
echo ========================================
echo.
echo Seu app agora esta disponivel em:
echo https://expo.dev/@marceloitaipu/bibliakids
echo.
echo Qualquer pessoa pode acessar pelo Expo Go!
echo.
pause
