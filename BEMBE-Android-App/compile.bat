@echo off
REM Build script for BEMBE Android App

echo ============================================
echo   BEMBE - Compilando APK v3.0.1
echo ============================================
echo.

REM Set Java Home correctly
set "JAVA_HOME=C:\Program Files\Microsoft\jdk-17.0.18.8-hotspot"
set "PATH=%JAVA_HOME%\bin;%PATH%"

REM Increase Gradle memory
set "GRADLE_OPTS=-Xmx2048m -Dorg.gradle.daemon=false"

echo Java version:
java -version
echo.

echo Starting build...
echo.

call gradlew.bat clean assembleDebug --no-daemon

if %errorlevel% equ 0 (
    echo.
    echo ============================================
    echo   BUILD SUCCESS!
    echo ============================================
    echo.
    echo APK location:
    dir "app\build\outputs\apk\debug\*.apk" /b /s 2>nul
    echo.
) else (
    echo.
    echo ============================================
    echo   BUILD FAILED!
    echo ============================================
    echo.
    echo Error code: %errorlevel%
    echo.
)

pause
