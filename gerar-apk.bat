@echo off
echo ========================================
echo   GERANDO APK ANDROID
echo ========================================
echo.
echo Isso vai criar um arquivo APK que voce
echo pode compartilhar com qualquer pessoa!
echo.
echo O APK pode ser instalado direto no Android.
echo.
pause
echo.

REM Adiciona Node.js ao PATH
set PATH=C:\Users\marcelos\nodejs-portable;%PATH%

cd /d C:\Bibliakids

echo Gerando APK...
echo AGUARDE: Isso pode demorar 10-15 minutos!
echo.

call node_modules\.bin\eas.cmd build --platform android --profile preview

echo.
echo ========================================
echo   APK GERADO!
echo ========================================
echo.
echo O link para download do APK foi gerado.
echo Copie o link e compartilhe com quem quiser!
echo.
pause
