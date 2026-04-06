# 🔄 SISTEMA DE ACTUALIZACIÓN BEMBE v3.1.4+

## 📋 VISIÓN GENERAL

A partir de la versión **v3.1.4**, BEMBE utiliza un sistema de actualización basado en **archivos JSON** alojados en GitHub. Esto permite que:

1. **Los usuarios reciban actualizaciones automáticamente** al abrir la app
2. **No necesiten reinstalar** nada desde un .exe
3. **Los datos se mantengan intactos** durante la actualización

---

## 🏗️ ARQUITECTURA DEL SISTEMA

### Archivos en GitHub:

| Archivo | Propósito |
|---------|-----------|
| `update.json` | Última versión disponible (siempre actualizado) |
| `update-vX.Y.Z.json` | Detalles de cada versión específica |
| `CODIGO OK.html` | Archivo de la aplicación (se descarga automáticamente) |

### Flujo de actualización:

```
1. Usuario abre BEMBE (cualquier versión instalada)
   ↓
2. App descarga update.json desde GitHub
   ↓
3. Compara versión actual vs versión disponible
   ↓
4. Si hay nueva versión: muestra notificación
   ↓
5. Usuario confirma actualización
   ↓
6. App descarga CODIGO OK.html nuevo
   ↓
7. Verifica integridad (SHA256 checksum)
   ↓
8. Guarda en carpeta local de la app
   ↓
9. Reinicia con la nueva versión
   ↓
10. ¡Datos del usuario intactos!
```

---

## 📝 CÓMO CREAR UNA NUEVA ACTUALIZACIÓN

### Paso 1: Actualizar el código local
```bash
# Hacer cambios en CODIGO OK.html
# Probar que funciona correctamente
```

### Paso 2: Generar SHA256 del archivo
```bash
certutil -hashfile "CODIGO OK.html" SHA256
```

### Paso 3: Crear/Actualizar update.json
```json
{
  "version": "X.Y.Z",
  "releaseDate": "2026-MM-DD",
  "minVersion": "3.0.0",
  "description": "Descripción de la actualización",
  "changelog": [
    "Cambio 1",
    "Cambio 2"
  ],
  "files": {
    "CODIGO OK.html": {
      "url": "https://raw.githubusercontent.com/Vladimir2984/-BASE-DE-DATOS-BEMBE/master/CODIGO%20OK.html",
      "sha256": "HASH_SHA256_AQUI",
      "size": TAMAÑO_EN_BYTES,
      "description": "Archivo principal de la aplicación"
    }
  },
  "breaking": false,
  "forceUpdate": false
}
```

### Paso 4: Subir a GitHub
```bash
git add update.json CODIGO\ OK.html
git commit -m "vX.Y.Z - Descripción del cambio"
git push origin master
```

---

## 🔒 SEGURIDAD

### Verificación de integridad:
1. **SHA256 Checksum**: La app verifica que el archivo descargado coincida con el hash en update.json
2. **Tamaño del archivo**: Verificación adicional del tamaño
3. **Validación de contenido**: Verifica que contenga "BEMBE" y "appData"

### Si la verificación falla:
- ❌ No se instala el archivo
- ❌ Se mantiene la versión anterior
- ✅ Se muestra error al usuario

---

## 📊 TIPOS DE ACTUALIZACIÓN

### Normal (breaking: false, forceUpdate: false)
- El usuario puede actualizar cuando quiera
- Se muestra notificación opcional

### Importante (forceUpdate: true)
- Se recomienda actualizar inmediatamente
- Notificación más prominente

### Ruptura (breaking: true)
- Cambios que requieren actualización obligatoria
- La app puede dejar de funcionar si no se actualiza

---

## 🛠️ ESTRUCTURA DE UPDATE.JSON

```json
{
  "version": "3.1.4",           // Versión semántica
  "releaseDate": "2026-04-06",  // Fecha de lanzamiento
  "minVersion": "3.0.0",        // Versión mínima compatible
  "description": "...",         // Descripción corta
  "changelog": [],              // Lista de cambios
  "files": {                    // Archivos a descargar
    "nombre.ext": {
      "url": "...",             // URL directa al archivo
      "sha256": "...",          // Hash para verificación
      "size": 12345,            // Tamaño en bytes
      "description": "..."      // Descripción del archivo
    }
  },
  "breaking": false,            // ¿Rompe compatibilidad?
  "forceUpdate": false          // ¿Forzar actualización?
}
```

---

## 📱 COMPATIBILIDAD

### Funciona con:
- ✅ BEMBE v3.1.4+ (con sistema de actualización incluido)
- ✅ App instalada (.exe)
- ✅ Archivo HTML suelto
- ✅ Launcher

### No funciona con:
- ❌ Versiones anteriores a v3.1.4 (requieren actualización manual inicial)

---

## 🔮 FUTURAS MEJORAS

- [ ] Actualizaciones incrementales (solo archivos cambiados)
- [ ] Descarga en segundo plano
- [ ] Rollback automático si hay error
- [ ] Notificaciones push
- [ ] Canal de actualizaciones beta

---

**✦ BEMBE v3.1.4 - Sistema de Actualización JSON ✦**

*Documentación creada el 6 de abril de 2026*
