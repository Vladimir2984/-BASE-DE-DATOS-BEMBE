# 🚀 Instalador Automático BEMBE Android App
# Este script descarga e instala los requisitos necesarios

Write-Host "✦ BEMBE ✦ - Instalador Automático" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Verificar permisos de administrador
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "⚠️  Este script necesita permisos de administrador" -ForegroundColor Yellow
    Write-Host "Presiona cualquier tecla para salir..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit
}

# Función para descargar archivo con progreso
function Download-File {
    param($url, $output)
    try {
        $ProgressPreference = 'SilentlyContinue'
        Invoke-WebRequest -Uri $url -OutFile $output -UseBasicParsing
        return $true
    } catch {
        Write-Host "❌ Error al descargar: $_" -ForegroundColor Red
        return $false
    }
}

# Paso 1: Verificar espacio en disco
Write-Host "📊 Verificando espacio en disco..." -ForegroundColor Green
$disk = Get-PSDrive C
$freeGB = [math]::Round($disk.Free / 1GB, 2)

if ($freeGB -lt 20) {
    Write-Host "⚠️  Espacio insuficiente. Se requieren al menos 20 GB libres." -ForegroundColor Red
    Write-Host "   Espacio disponible: ${freeGB} GB" -ForegroundColor Yellow
    pause
    exit
}
Write-Host "✓ Espacio disponible: ${freeGB} GB" -ForegroundColor Green
Write-Host ""

# Paso 2: Descargar e instalar JDK 17
Write-Host "📦 Paso 1/3: Descargando JDK 17..." -ForegroundColor Cyan

$jdkUrl = "https://download.oracle.com/java/17/latest/jdk-17_windows-x64_bin.exe"
$jdkInstaller = "$env:TEMP\jdk-17_installer.exe"

Write-Host "   Descargando JDK 17 (aproximadamente 160 MB)..."
if (Download-File $jdkUrl $jdkInstaller) {
    Write-Host "   Instalando JDK 17..."
    Start-Process -FilePath $jdkInstaller -ArgumentList "/s" -Wait
    Write-Host "✓ JDK 17 instalado" -ForegroundColor Green
} else {
    Write-Host "⚠️  No se pudo descargar JDK. Continuando..." -ForegroundColor Yellow
}
Write-Host ""

# Paso 3: Descargar Android Studio Command Line Tools
Write-Host "📦 Paso 2/3: Preparando Android Studio Command Line Tools..." -ForegroundColor Cyan

$androidToolsUrl = "https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip"
$androidToolsZip = "$env:TEMP\android-tools.zip"
$androidSdkPath = "C:\Android\Sdk"

Write-Host "   Descargando Android SDK Tools..."
if (Download-File $androidToolsUrl $androidToolsZip) {
    Write-Host "   Extrayendo herramientas..."
    
    # Crear directorio SDK
    if (-not (Test-Path $androidSdkPath)) {
        New-Item -ItemType Directory -Force -Path $androidSdkPath | Out-Null
    }
    
    # Extraer ZIP
    Expand-Archive -Path $androidToolsZip -DestinationPath "$androidSdkPath\temp" -Force
    
    # Mover cmdline-tools
    $cmdlineSource = "$androidSdkPath\temp\cmdline-tools"
    $cmdlineDest = "$androidSdkPath\cmdline-tools"
    if (Test-Path $cmdlineSource) {
        if (Test-Path $cmdlineDest) {
            Remove-Item -Path $cmdlineDest -Recurse -Force
        }
        Move-Item -Path $cmdlineSource -Destination $cmdlineDest -Force
        Remove-Item -Path "$androidSdkPath\temp" -Recurse -Force
    }
    
    Write-Host "✓ Android SDK Tools instalado en: $androidSdkPath" -ForegroundColor Green
} else {
    Write-Host "⚠️  No se pudo descargar Android SDK Tools" -ForegroundColor Yellow
}
Write-Host ""

# Paso 4: Configurar variables de entorno
Write-Host "⚙️  Paso 3/3: Configurando variables de entorno..." -ForegroundColor Cyan

# JAVA_HOME
$javaHome = "C:\Program Files\Java\jdk-17"
if (Test-Path $javaHome) {
    [System.Environment]::SetEnvironmentVariable("JAVA_HOME", $javaHome, "Machine")
    Write-Host "✓ JAVA_HOME configurado" -ForegroundColor Green
}

# ANDROID_HOME
[System.Environment]::SetEnvironmentVariable("ANDROID_HOME", $androidSdkPath, "Machine")

# Actualizar PATH
$currentPath = [System.Environment]::GetEnvironmentVariable("Path", "Machine")
$newPaths = @(
    "$javaHome\bin",
    "$androidSdkPath\cmdline-tools\latest\bin",
    "$androidSdkPath\platform-tools",
    "$androidSdkPath\tools"
)

foreach ($newPath in $newPaths) {
    if ($currentPath -notlike "*$newPath*") {
        $currentPath = "$currentPath;$newPath"
    }
}
[System.Environment]::SetEnvironmentVariable("Path", $currentPath, "Machine")

Write-Host "✓ Variables de entorno configuradas" -ForegroundColor Green
Write-Host ""

# Paso 5: Actualizar local.properties
Write-Host "📝 Actualizando configuración del proyecto..." -ForegroundColor Cyan

$localPropertiesPath = "D:\ESCUELA BEMBE\BEMBE-PC\BEMBE-Android-App\local.properties"
$localPropertiesContent = "sdk.dir=$androidSdkPath.Replace('\', '\\')`n"
Set-Content -Path $localPropertiesPath -Value $localPropertiesContent

Write-Host "✓ local.properties actualizado" -ForegroundColor Green
Write-Host ""

# Resumen
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "✅ Instalación completada" -ForegroundColor Green
Write-Host ""
Write-Host "Siguientes pasos:" -ForegroundColor Yellow
Write-Host "1. Reinicia tu computadora para aplicar cambios" -ForegroundColor White
Write-Host "2. Abre PowerShell como administrador" -ForegroundColor White
Write-Host "3. Ejecuta: cd 'D:\ESCUELA BEMBE\BEMBE-PC\BEMBE-Android-App'" -ForegroundColor White
Write-Host "4. Ejecuta: .\gradlew.bat assembleDebug" -ForegroundColor White
Write-Host ""
Write-Host "Presiona cualquier tecla para salir..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
