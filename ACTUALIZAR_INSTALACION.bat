@echo off
echo ========================================
echo   BEMBE - Actualizador de Instalacion
echo ========================================
echo.
echo Este script actualizara tu instalacion de BEMBE
echo con la ultima version disponible.
echo.
pause

echo.
echo [1/3] Buscando ultima version...

REM Buscar archivo principal
if exist "D:\ESCUELA BEMBE\BEMBE-PC\CODIGO OK.html" (
    set "SOURCE=D:\ESCUELA BEMBE\BEMBE-PC\CODIGO OK.html"
    echo ✅ Encontrada ultima version
) else (
    echo ❌ No se encontro ultima version
    echo Descargala de: https://github.com/Vladimir2984/-BASE-DE-DATOS-BEMBE
    pause
    exit /b 1
)

echo.
echo [2/3] Buscando instalaciones existentes...

set "UPDATED=0"

REM Actualizar paquete PC
if exist "D:\ESCUELA BEMBE\BEMBE-PC\BEMBE-v3.1.0-PC\CODIGO OK.html" (
    echo Actualizando paquete PC...
    copy /Y "%SOURCE%" "D:\ESCUELA BEMBE\BEMBE-PC\BEMBE-v3.1.0-PC\CODIGO OK.html" >nul
    echo ✅ Paquete PC actualizado
    set "UPDATED=1"
)

REM Actualizar assets Android
if exist "D:\ESCUELA BEMBE\BEMBE-PC\BEMBE-Android-App\app\src\main\assets\CODIGO_OK.html" (
    echo Actualizando assets Android...
    copy /Y "%SOURCE%" "D:\ESCUELA BEMBE\BEMBE-PC\BEMBE-Android-App\app\src\main\assets\CODIGO_OK.html" >nul
    echo ✅ Android actualizado
    set "UPDATED=1"
)

REM Actualizar si hay instalacion en otra ubicacion comun
for %%i in (
    "%USERPROFILE%\Desktop\BEMBE"
    "%USERPROFILE%\Documents\BEMBE"
    "C:\Program Files\BEMBE"
    "C:\BEMBE"
) do (
    if exist "%%i\CODIGO OK.html" (
        echo Actualizando: %%i
        copy /Y "%SOURCE%" "%%i\CODIGO OK.html" >nul
        echo ✅ Actualizado: %%i
        set "UPDATED=1"
    )
)

echo.
echo [3/3] Verificando actualizacion...

if "%UPDATED%"=="1" (
    echo.
    echo ========================================
    echo   ACTUALIZACION COMPLETADA
    echo ========================================
    echo.
    echo Tu instalacion de BEMBE ahora tiene:
    echo   ✅ Importacion 100%% compatible
    echo   ✅ Auto-actualizacion al conectar internet
    echo   ✅ Logo institucional
    echo   ✅ Horario 7 dias completo
    echo   ✅ Todas las funciones v3.1.2
    echo.
    echo Para actualizar en el futuro:
    echo   - Ejecuta este script nuevamente
    echo   - O abre BEMBE y ve a Configuracion ^> Forzar Actualizacion
    echo.
) else (
    echo.
    echo ========================================
    echo   NO SE ENCONTRO INSTALACION EXISTENTE
    echo ========================================
    echo.
    echo Para instalar BEMBE:
    echo   1. Ve a: D:\ESCUELA BEMBE\BEMBE-PC\BEMBE-v3.1.0-PC\
    echo   2. Ejecuta: INSTALAR.bat
    echo.
)

pause
