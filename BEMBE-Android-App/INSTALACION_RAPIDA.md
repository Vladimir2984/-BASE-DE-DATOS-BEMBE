# 📱 BEMBE Android App - Instalación en 5 Minutos

## Método Más Fácil (Sin Instalar Nada)

### Usando Android Studio Portable

1. **Descargar Android Studio Portable**
   - Ve a: https://portableapps.com/apps/development/android-studio-portable
   - O usa la versión oficial: https://developer.android.com/studio

2. **Instalar**
   - Ejecuta el instalador
   - Acepta todas las opciones por defecto
   - Espera a que termine (15-20 minutos)

3. **Abrir el Proyecto**
   - Abre Android Studio
   - Click en **"Open"**
   - Busca: `D:\ESCUELA BEMBE\BEMBE-PC\BEMBE-Android-App`
   - Click **"OK"**

4. **Compilar APK**
   - Espera a que termine de sincronizar (5-10 min)
   - Menú: **Build → Build APK**
   - ¡Listo!

---

## Método Manual (Scripts Automáticos)

### Paso 1: Ejecutar Instalador

```powershell
# Click derecho en el archivo → Ejecutar con PowerShell
install-requirements.ps1
```

### Paso 2: Reiniciar Computadora

### Paso 3: Compilar APK

```cmd
# Doble click en este archivo:
build-apk.bat
```

---

## Método Express (Solo APK)

Si ya tienes Android Studio instalado:

1. **Doble click** en `build-apk.bat`
2. **Espera** a que termine
3. **APK lista** en: `app\build\outputs\apk\debug\app-debug.apk`

---

## 📲 Instalar APK en tu Teléfono

### Opción A: Cable USB

1. **Activar Depuración USB** en tu teléfono:
   - Ajustes → Acerca del teléfono
   - Toca "Número de compilación" 7 veces
   - Regresa → Opciones de desarrollador
   - Activa "Depuración USB"

2. **Conectar el teléfono** a la PC

3. **Instalar con ADB**:
   ```cmd
   adb install app\build\outputs\apk\debug\app-debug.apk
   ```

### Opción B: Sin Cable

1. **Copiar APK** a tu teléfono (por Bluetooth, email, etc.)

2. **Abrir el APK** en tu teléfono

3. **Permitir** instalación de fuentes desconocidas

4. **Instalar**

---

## ✅ Verificar que Funciona

1. Abre la app en tu teléfono
2. Deberías ver la pantalla de carga con estrellas ✦
3. Toca cualquier parte para continuar
4. ¡Debería cargar tu aplicación BEMBE!

---

## 🐛 Problemas Comunes

### "Java no está instalado"
- Ejecuta: `install-requirements.ps1` como administrador
- O instala Android Studio manualmente

### "SDK no encontrado"
- Abre Android Studio
- Tools → SDK Manager
- Instala: Android SDK Platform 34

### "Gradle falla"
```cmd
gradlew.bat clean
gradlew.bat assembleDebug
```

### "No se encuentra CODIGO_OK.html"
```powershell
Copy-Item "D:\ESCUELA BEMBE\BEMBE-PC\CODIGO OK.html" "D:\ESCUELA BEMBE\BEMBE-PC\BEMBE-Android-App\app\src\main\assets\CODIGO_OK.html"
```

---

## 📞 ¿Necesitas Ayuda?

1. **Verifica** que Android Studio esté instalado
2. **Reinicia** tu computadora
3. **Ejecuta** `build-apk.bat` como administrador
4. **Revisa** el archivo `build.log` si hay errores

---

**Tiempo estimado**: 20-30 minutos (incluyendo descargas)  
**Espacio requerido**: 20 GB libres

**Versión**: 2.0.0  
**Fecha**: 1 de abril de 2026
