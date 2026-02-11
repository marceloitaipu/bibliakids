@echo off
echo =================================================
echo   BibliaKids - Build APK para Preview
echo =================================================
echo.

echo Executando build para Android (APK)...
call npx eas build -p android --profile preview

echo.
echo Build concluido! O APK estara disponivel no dashboard do Expo.
echo Acesse: https://expo.dev/accounts/marceloitaipu/projects/bibliakids/builds
echo.
pause
