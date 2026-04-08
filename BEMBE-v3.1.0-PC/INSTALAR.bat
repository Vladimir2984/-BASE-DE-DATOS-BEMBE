@echo off
echo ========================================
echo   BEMBE v3.1.5 - Instalador con Auto-Update
echo   Se actualiza automaticamente!
echo ========================================
echo.

cd /d "%~dp0"

REM Verificar si hay archivo mas reciente en directorio padre
echo [1/5] Verificando version mas reciente...
if exist "..\CODIGO OK.html" (
    echo Encontrada version local en directorio padre
    copy /Y "..\CODIGO OK.html" "CODIGO OK.html" >nul
    echo ✅ Archivo principal actualizado
) else (
    echo Usando version incluida en el paquete
)

REM Copiar Launcher
echo.
echo [2/5] Instalando sistema de auto-actualizacion...
if exist "..\BEMBE-Launcher.html" (
    copy /Y "..\BEMBE-Launcher.html" "BEMBE-Launcher.html" >nul
    echo ✅ Launcher actualizado
)

echo.
echo [3/5] Verificando logo...
if not exist "INCONO-BEMBE.png" (
    if exist "..\INCONO-BEMBE.png" (
        copy /Y "..\INCONO-BEMBE.png" "INCONO-BEMBE.png" >nul
        echo ✅ Logo copiado
    )
)

echo.
echo [4/5] Creando acceso directo en escritorio...
REM Create shortcut pointing to Launcher (which always downloads latest version)
set SCRIPT="$WS = New-Object -ComObject WScript.Shell; $Desktop = [Environment]::GetFolderPath('Desktop'); $SC = $WS.CreateShortcut($Desktop + '\BEMBE.lnk'); $SC.TargetPath = '%CD%\BEMBE-Launcher.html'; $SC.IconLocation = '%CD%\INCONO-BEMBE.png,0'; $SC.WorkingDirectory = '%CD%'; $SC.Description = 'BEMBE - Se actualiza automaticamente al conectar a internet'; $SC.Save()"
powershell -Command "%SCRIPT%"
echo ✅ Acceso directo creado: BEMBE.lnk en escritorio

echo.
echo [5/5] Abriendo aplicacion con auto-actualizacion...
timeout /t 2 /nobreak >nul
start "" "BEMBE-Launcher.html"

echo.
echo ========================================
echo   BEMBE v3.1.5 - INSTALADO
echo ========================================
echo.
echo ✨ CARACTERISTICA ESPECIAL:
echo   La aplicacion se ACTUALIZARA AUTOMATICAMENTE
echo   cada vez que se conecte a internet.
echo   ^!No necesitas reinstalar nunca mas^!
echo.
echo Caracteristicas incluidas:
echo   ✅ Importacion 100%% compatible con versiones antiguas
echo   ✅ Actualizacion automatica al conectar a internet
echo   ✅ Logo institucional visible
echo   ✅ Horario 7 dias completo
echo   ✅ 79 funciones totales
echo   ✅ Exportacion completa con todos los datos
echo.
echo Para usar BEMBE:
echo   - Haz doble clic en el acceso directo "BEMBE" del escritorio
echo   - O abre "BEMBE-Launcher.html" directamente
echo.
echo ^> El Launcher SIEMPRE descarga la ultima version de GitHub
echo ^> Luego abre la aplicacion actualizada
echo.
pause
