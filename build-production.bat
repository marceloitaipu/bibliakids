@echo off
echo =================================================
echo   BibliaKids - Build Producao (App Bundle)
echo =================================================
echo.
echo ATENCAO: Este build gera um AAB para a Google Play Store.
echo.

set /p confirm=Continuar com build de producao? (S/N): 
if /i "%confirm%" neq "S" goto :end

echo.
echo Executando build de producao para Android...
call npx eas build -p android --profile production

echo.
echo Build de producao concluido!
echo O AAB estara disponivel no dashboard do Expo.
echo Acesse: https://expo.dev/accounts/marceloitaipu/projects/bibliakids/builds
echo.

:end
pause
