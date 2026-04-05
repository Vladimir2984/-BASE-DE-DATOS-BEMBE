@echo off
echo ========================================
echo   BEMBE v3.1.0 - Instalacion
echo ========================================
echo.
echo Instalando BEMBE en tu PC...
echo.

REM Crear acceso directo en escritorio
set SCRIPT="$WS = New-Object -ComObject WScript.Shell; $SC = $WS.CreateShortcut([Environment]::GetFolderPath('Desktop') + '\BEMBE.lnk'); $SC.TargetPath = 'D:\ESCUELA BEMBE\BEMBE-PC\CODIGO OK.html'; $SC.IconLocation = 'D:\ESCUELA BEMBE\BEMBE-PC\INCONO-BEMBE.png,0'; $SC.Save()"
powershell -Command "%SCRIPT%"

echo ========================================
echo   INSTALACION COMPLETADA
echo ========================================
echo.
echo Caracteristicas:
echo   - Sincronizacion en la nube
echo   - Logo institucional
echo   - Horario 7 dias completo
echo   - 79 funciones totales
echo   - Backend Node.js incluido
echo.
echo Para usar BEMBE:
echo   1. Haz doble clic en "CODIGO OK.html"
echo   2. O usa el acceso directo en el escritorio
echo.
echo Para servidor local:
echo   cd backend
echo   npm install
echo   npm start
echo.
pause
