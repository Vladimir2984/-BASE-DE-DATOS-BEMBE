@echo off
echo ========================================
echo   BEMBE v3.1.0 - Creador de Paquete PC
echo   Sincronizacion en la Nube + Logo
echo ========================================
echo.

cd /d "%~dp0"

set "VERSION=3.1.0"
set "PACKAGE_NAME=BEMBE-v%VERSION%-PC"
set "PACKAGE_DIR=%PACKAGE_NAME%"

echo [1/5] Creando estructura del paquete...
if exist "%PACKAGE_DIR%" rmdir /s /q "%PACKAGE_DIR%"
mkdir "%PACKAGE_DIR%"
mkdir "%PACKAGE_DIR%\Documentacion"
mkdir "%PACKAGE_DIR%\backend"
mkdir "%PACKAGE_DIR%\frontend"

echo [2/5] Copiando archivos principales...
copy "CODIGO OK.html" "%PACKAGE_DIR%\" /Y
copy "INCONO-BEMBE.png" "%PACKAGE_DIR%\" /Y

echo [3/5] Copiando documentacion...
copy "GUIA_COMPLETA_DESPLIEGUE.md" "%PACKAGE_DIR%\Documentacion\" /Y
copy "CAMBIOS_REALIZADOS.md" "%PACKAGE_DIR%\Documentacion\" /Y
copy "RESUMEN_FINAL.md" "%PACKAGE_DIR%\Documentacion\" /Y
copy "VERIFICACION_FINAL.md" "%PACKAGE_DIR%\Documentacion\" /Y

echo [4/5] Copiando backend y frontend...
xcopy "backend\*" "%PACKAGE_DIR%\backend\" /E /I /Y /Q
xcopy "frontend\*" "%PACKAGE_DIR%\frontend\" /E /I /Y /Q

echo [5/5] Creando archivo de instalacion automatica...

(
echo @echo off
echo echo ========================================
echo echo   BEMBE v%VERSION% - Instalacion
echo echo ========================================
echo echo.
echo echo Instalando BEMBE en tu PC...
echo echo.
echo.
echo REM Crear acceso directo en escritorio
echo set SCRIPT="$WS = New-Object -ComObject WScript.Shell; $SC = $WS.CreateShortcut([Environment]::GetFolderPath('Desktop') + '\BEMBE.lnk'); $SC.TargetPath = '%CD%\CODIGO OK.html'; $SC.IconLocation = '%CD%\INCONO-BEMBE.png,0'; $SC.Save()"
echo powershell -Command "%%SCRIPT%%"
echo.
echo echo ========================================
echo echo   INSTALACION COMPLETADA
echo echo ========================================
echo echo.
echo echo Caracteristicas:
echo echo   - Sincronizacion en la nube
echo echo   - Logo institucional
echo echo   - Horario 7 dias completo
echo echo   - 79 funciones totales
echo echo   - Backend Node.js incluido
echo echo.
echo echo Para usar BEMBE:
echo echo   1. Haz doble clic en "CODIGO OK.html"
echo echo   2. O usa el acceso directo en el escritorio
echo echo.
echo echo Para servidor local:
echo echo   cd backend
echo echo   npm install
echo echo   npm start
echo echo.
echo pause
) > "%PACKAGE_DIR%\INSTALAR.bat"

echo.
echo ========================================
echo   PAQUETE CREADO EXITOSAMENTE
echo ========================================
echo.
echo Paquete: %PACKAGE_DIR%
echo Version: %VERSION%
echo.
echo Contenido:
echo   - CODIGO OK.html (App principal)
echo   - INCONO-BEMBE.png (Logo)
echo   - Documentacion completa
echo   - Backend Node.js
echo   - Frontend PWA
echo   - INSTALAR.bat (instalacion automatica)
echo.

REM Crear archivo README
(
echo # BEMBE v%VERSION% - Sistema de Gestion de Escuela de Danza
echo.
echo ## INSTALACION RAPIDA
echo.
echo 1. Ejecuta `INSTALAR.bat`
echo 2. Se creara un acceso directo en tu escritorio
echo 3. Abre BEMBE desde el acceso directo o desde `CODIGO OK.html`
echo.
echo ## CARACTERISTICAS
echo.
echo - Sincronizacion automatica con servidor en la nube
echo - Logo institucional visible
echo - Horario completo de 7 dias (Lunes a Domingo)
echo - 79 funciones totales (72 originales + 7 de sync)
echo - Backend Node.js incluido para uso local
echo.
echo ## SINCRONIZACION EN LA NUBE
echo.
echo Para activar la sincronizacion:
echo 1. Abre BEMBE
echo 2. Ve a Configuracion
echo 3. Clic en "Crear Cuenta Nube"
echo 4. Los datos se sincronizaran automaticamente cada 5 minutos
echo.
echo ## SERVIDOR LOCAL (Opcional)
echo.
echo Si quieres ejecutar el servidor en tu PC:
echo.
echo ```
echo cd backend
echo npm install
echo npm start
echo ```
echo.
echo El servidor estara disponible en: http://localhost:3000
echo.
echo ## DOCUMENTACION
echo.
echo Revisa la carpeta `Documentacion` para:
echo - GUIA_COMPLETA_DESPLIEGUE.md - Instrucciones completas
echo - CAMBIOS_REALIZADOS.md - Ultimos cambios
echo - RESUMEN_FINAL.md - Resumen tecnico
echo.
echo ## SOPORTE
echo.
echo - Web: https://bembespb.ru
echo - Email: contacto@bembespb.ru
echo.
echo ---
echo.
echo **BEMBE v%VERSION%** - Sistema completo con sincronizacion en la nube
) > "%PACKAGE_DIR%\README.md"

echo README.md creado.
echo.
echo ========================================
echo   LISTO PARA DISTRIBUCION
echo ========================================
echo.
echo Comprime la carpeta %PACKAGE_DIR% y distribuila!
echo.
pause
