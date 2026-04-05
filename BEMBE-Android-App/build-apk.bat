@echo off
echo ========================================
echo   BEMBE Android App - Build APK v3.1.0
echo   Sincronizacion en la Nube + Logo
echo ========================================
echo.

cd /d "%~dp0"

echo [1/3] Limpiando build anterior...
if exist "app\build" rmdir /s /q "app\build"

echo [2/3] Compilando APK de lanzamiento...
call gradlew.bat assembleRelease

if %errorlevel% neq 0 (
    echo.
    echo ERROR: La compilacion fallo!
    pause
    exit /b 1
)

echo.
echo [3/3] Buscando APK generado...

for /f "delims=" %%i in ('dir /b /s /o-d "app\build\outputs\apk\release\*.apk" 2^>nul') do (
    set "APK_PATH=%%i"
    goto :found
)

echo ERROR: No se encontro el APK!
pause
exit /b 1

:found
echo.
echo ========================================
echo   APK GENERADO EXITOSAMENTE
echo ========================================
echo.
echo Ubicacion: %APK_PATH%
echo.
echo Version: 3.1.0
 Caracteristicas:
   - Sincronizacion en la nube
   - Logo institucional
   - Horario 7 dias completo
   - 79 funciones totales
   - Backend Node.js integrado
echo.

REM Copiar al directorio principal
copy "%APK_PATH%" "..\BEMBE-v3.1.0.apk" /Y

echo APK copiado a: ..\BEMBE-v3.1.0.apk
echo.
pause

REM =====================================================
REM ✦ BEMBE ✦ - Script de Compilación Rápida v3.0
REM =====================================================

echo.
echo ============================================
echo   BEMBE Android App - Compilación
echo ============================================
echo.

REM Verificar si Gradle existe
if not exist "gradlew.bat" (
    echo [ERROR] No se encontro gradlew.bat
    echo Ejecuta este script desde la carpeta BEMBE-Android-App
    pause
    exit /b 1
)

echo [1/4] Limpiando proyecto anterior...
call gradlew.bat clean
if %errorlevel% neq 0 (
    echo [ERROR] Error al limpiar el proyecto
    pause
    exit /b 1
)

echo.
echo [2/4] Descargando dependencias...
call gradlew.bat --refresh-dependencies
if %errorlevel% neq 0 (
    echo [ADVERTENCIA] Algunas dependencias no se pudieron descargar
    echo Continuando de todas formas...
)

echo.
echo [3/4] Compilando APK de Debug...
call gradlew.bat assembleDebug
if %errorlevel% neq 0 (
    echo [ERROR] Error al compilar el APK
    echo Revisa los mensajes de error arriba
    pause
    exit /b 1
)

echo.
echo [4/4] Ejecutando tests unitarios...
call gradlew.bat test
if %errorlevel% neq 0 (
    echo [ADVERTENCIA] Algunos tests fallaron
    echo Revisa los resultados arriba
)

echo.
echo ============================================
echo   Compilación Completada!
echo ============================================
echo.
echo APK de Debug generada en:
echo app\build\outputs\apk\debug\app-debug.apk
echo.
echo Para compilar APK de Produccion (firmado):
echo   gradlew.bat assembleRelease
echo.
echo ============================================
echo.

pause
