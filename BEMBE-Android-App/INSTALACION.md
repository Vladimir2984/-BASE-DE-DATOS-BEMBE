# 🚀 Guía de Instalación y Compilación - BEMBE Android App

## ⚠️ Requisitos Previos (NO INSTALADOS)

Para compilar la aplicación Android, necesitas instalar:

### 1. Java Development Kit (JDK) 17

**Opción A: Usando el JDK incluido con Android Studio**
- Android Studio incluye su propio JDK (JBR)
- Ruta típica: `C:\Program Files\Android\Android Studio\jbr`

**Opción B: Instalar JDK por separado**
1. Descargar desde: https://www.oracle.com/java/technologies/downloads/#java17
2. O usar OpenJDK: https://adoptium.net/
3. Instalar en: `C:\Program Files\Java\jdk-17`
4. Agregar a PATH: `C:\Program Files\Java\jdk-17\bin`

### 2. Android Studio (Recomendado)

1. Descargar desde: https://developer.android.com/studio
2. Instalar Android Studio
3. Durante la instalación, se instalará:
   - Android SDK
   - Android Platform Tools
   - JDK incluido

### 3. Variables de Entorno

Después de instalar, configura estas variables:

```
JAVA_HOME = C:\Program Files\Java\jdk-17
ANDROID_HOME = C:\Users\TU_USUARIO\AppData\Local\Android\Sdk
```

Agregar al PATH:
```
%JAVA_HOME%\bin
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\tools
```

---

## 📋 Pasos para Compilar (DESPUÉS DE INSTALAR REQUISITOS)

### Método 1: Usando Android Studio (Más Fácil)

1. **Abrir Android Studio**

2. **Abrir el proyecto**
   - Click en "Open" o "File → Open"
   - Navegar a: `D:\ESCUELA BEMBE\BEMBE-PC\BEMBE-Android-App`
   - Click "OK"

3. **Esperar sincronización**
   - Android Studio descargará Gradle y dependencias
   - Esto puede tomar 5-10 minutos la primera vez

4. **Compilar APK**
   - Menú: `Build → Build Bundle(s) / APK(s) → Build APK(s)`
   - Esperar a que termine la compilación

5. **Encontrar el APK**
   - Ruta: `D:\ESCUELA BEMBE\BEMBE-PC\BEMBE-Android-App\app\build\outputs\apk\debug\app-debug.apk`

### Método 2: Usando Línea de Comandos

1. **Abrir PowerShell o CMD como Administrador**

2. **Navegar al proyecto**
   ```cmd
   cd "D:\ESCUELA BEMBE\BEMBE-PC\BEMBE-Android-App"
   ```

3. **Compilar APK**
   ```cmd
   gradlew.bat assembleDebug
   ```

4. **Encontrar el APK**
   - Mismo ruta que arriba

---

## 🔧 Solución de Problemas Comunes

### Error: "JAVA_HOME no está configurado"

```cmd
# Establecer JAVA_HOME temporalmente
set JAVA_HOME=C:\Program Files\Java\jdk-17

# O permanentemente (PowerShell como Admin)
[System.Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Java\jdk-17", "User")
```

### Error: "SDK no encontrado"

1. Instalar Android Studio
2. El SDK se instala en: `C:\Users\TU_USUARIO\AppData\Local\Android\Sdk`
3. Editar `local.properties`:
   ```
   sdk.dir=C\:\\Users\\TU_USUARIO\\AppData\\Local\\Android\\Sdk
   ```

### Error: "Gradle no responde"

```cmd
# Matar procesos Gradle
taskkill /F /IM java.exe

# Limpiar caché
gradlew.bat --stop
gradlew.bat clean

# Reintentar
gradlew.bat assembleDebug
```

### Error: "No se encuentra el archivo CODIGO_OK.html"

Verificar que el archivo existe en:
```
D:\ESCUELA BEMBE\BEMBE-PC\BEMBE-Android-App\app\src\main\assets\CODIGO_OK.html
```

Si no existe, copiarlo:
```powershell
Copy-Item "D:\ESCUELA BEMBE\BEMBE-PC\CODIGO OK.html" "D:\ESCUELA BEMBE\BEMBE-PC\BEMBE-Android-App\app\src\main\assets\CODIGO_OK.html"
```

---

## 📲 Instalar APK en Dispositivo

### Habilitar Depuración USB en el teléfono

1. Ir a **Ajustes → Acerca del teléfono**
2. Tocar **Número de compilación** 7 veces
3. Regresar a **Ajustes → Opciones de desarrollador**
4. Activar **Depuración USB**

### Instalar APK

**Opción A: Usando ADB**
```cmd
adb install "D:\ESCUELA BEMBE\BEMBE-PC\BEMBE-Android-App\app\build\outputs\apk\debug\app-debug.apk"
```

**Opción B: Transferir archivo**
1. Copiar el APK al teléfono
2. Abrir el archivo en el teléfono
3. Permitir instalación de fuentes desconocidas
4. Instalar

---

## 📦 Archivos Generados

Después de compilar exitosamente:

```
BEMBE-Android-App/
├── app/
│   └── build/
│       └── outputs/
│           ├── apk/
│           │   └── debug/
│           │       └── app-debug.apk         ← APK para testing
│           └── bundle/
│               └── debug/
│                   └── app-debug.aab         ← Android App Bundle
```

---

## 🔐 Generar APK para Producción (Release)

1. **Crear Keystore**
   ```cmd
   keytool -genkey -v -keystore bembe-release-key.jks -alias bembe -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Configurar en build.gradle** (app/build.gradle):
   ```gradle
   android {
       signingConfigs {
           release {
               storeFile file('bembe-release-key.jks')
               storePassword 'TU_CONTRASEÑA'
               keyAlias 'bembe'
               keyPassword 'TU_CONTRASEÑA'
           }
       }
       buildTypes {
           release {
               signingConfig signingConfigs.release
               minifyEnabled false
           }
       }
   }
   ```

3. **Compilar APK firmado**
   ```cmd
   gradlew.bat assembleRelease
   ```

---

## ✅ Verificación Post-Instalación

Después de instalar la app en el dispositivo:

1. **Abrir la app** - Debe mostrar la pantalla de carga con estrellas
2. **Verificar datos** - Los datos anteriores deberían estar (localStorage)
3. **Probar exportación**:
   - Ir a Configuración → Exportar BD
   - Debería guardar en Downloads/BEMBE/
4. **Probar importación**:
   - Ir a Configuración → Importar BD
   - Seleccionar archivo JSON
   - Debería mostrar confirmación

---

## 📞 Enlaces Útiles

- **Android Studio**: https://developer.android.com/studio
- **JDK 17**: https://www.oracle.com/java/technologies/downloads/#java17
- **OpenJDK**: https://adoptium.net/
- **Android SDK**: Se instala con Android Studio
- **ADB Drivers**: https://developer.android.com/studio/run/win-usb

---

## 🎯 Resumen Rápido

1. **Instalar Android Studio** → https://developer.android.com/studio
2. **Abrir proyecto** → `D:\ESCUELA BEMBE\BEMBE-PC\BEMBE-Android-App`
3. **Esperar sincronización** → 5-10 minutos
4. **Build → Build APK** → Menú de Android Studio
5. **Instalar APK** → En tu dispositivo Android

---

**Soporte**: Si tienes problemas, verifica que Java y Android Studio estén correctamente instalados.

**Versión**: 2.0.0  
**Fecha**: 1 de abril de 2026
