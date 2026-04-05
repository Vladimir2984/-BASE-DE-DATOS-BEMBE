# 📋 Guía de Migración - BEMBE v2.0 a v3.0

## ✨ Resumen de Cambios

La versión 3.0 introduce mejoras significativas en seguridad, persistencia y rendimiento.

---

## 🔄 Cambios Principales

### 1. **Room Database Agregado**

**Antes (v2.0):**
- Solo localStorage del WebView
- Datos vulnerables a pérdida

**Ahora (v3.0):**
- Room Database nativo (SQLite)
- localStorage del WebView (compatibilidad)
- Archivos JSON (exportación manual)

**Migración:**
- ✅ **Automática**: La app migra datos automáticamente al primer inicio
- ✅ **Sin pérdida**: Datos existentes se preservan
- ✅ **Transparente**: No requiere acción del usuario

---

### 2. **Encriptación de Datos**

**Antes:**
- Datos en texto plano
- Metadata accesible

**Ahora:**
- AES-GCM con Android Keystore
- SharedPreferences encriptados
- Checksums SHA-256

**Migración:**
- ✅ **Transparente**: Se aplica a nuevos datos automáticamente
- ✅ **No rompe compatibilidad**: Datos antiguos siguen funcionando

---

### 3. **Validación de Archivos JSON**

**Antes:**
- Validación básica
- Solo verificaba existencia de campos

**Ahora:**
- Validación estricta de estructura
- Verificación de tipos de datos
- Validación de estudiantes individualmente
- Detección de duplicados

**Migración:**
- ⚠️ **Archivos antiguos**: Pueden fallar validación estricta
- ✅ **Solución**: Re-exportar datos con v3.0 para nuevo formato

---

### 4. **Rate Limiting**

**Antes:**
- Sin límite de exportaciones

**Ahora:**
- Máximo 20 exportaciones/hora
- Previene abuso accidental

**Migración:**
- ⚠️ **Nuevo comportamiento**: Si necesitas más exportaciones, espera 1 hora

---

### 5. **WebView Security**

**Antes:**
- `setAllowUniversalAccessFromFileURLs(true)` ❌
- `setAllowFileAccessFromFileURLs(true)` ❌
- Sin manejo de errores SSL

**Ahora:**
- `setAllowUniversalAccessFromFileURLs(false)` ✅
- `setAllowFileAccessFromFileURLs(false)` ✅
- Rechazo automático de errores SSL
- Mixed Content Mode seguro

**Migración:**
- ✅ **No afecta**: La app carga desde `file:///android_asset/`
- ✅ **Mejora seguridad**: Previene ataques XSS

---

## 📊 Compatibilidad

### Datos

| Tipo de Dato | v2.0 → v3.0 | v3.0 → v2.0 |
|--------------|-------------|-------------|
| localStorage | ✅ Compatible | ✅ Compatible |
| Room Database | ✅ Se crea automáticamente | ❌ No existe en v2.0 |
| Archivos JSON | ✅ Compatible | ✅ Compatible |

### Archivos Exportados

| Versión Exportación | Importable en v3.0 |
|---------------------|-------------------|
| v1.0 | ✅ Sí (formato antiguo) |
| v2.0 | ✅ Sí |
| v3.0 | ✅ Sí (con checksum SHA-256) |

---

## 🚀 Pasos de Migración

### Para Usuarios Finales

1. **Desinstalar v2.0** (opcional, pero recomendado)
   ```
   Settings → Apps → BEMBE → Uninstall
   ```

2. **Instalar v3.0**
   ```
   Instalar APK nuevo normalmente
   ```

3. **Primer inicio**
   - La app migrará datos automáticamente
   - Puede tardar 2-3 segundos adicionales
   - ✅ **No perderás datos**

4. **Verificar datos**
   - Revisa que alumnos y profesores estén presentes
   - Si falta algo, usa "Restaurar Respaldo"

### Para Desarrolladores

1. **Pull del código nuevo**
   ```bash
   git pull origin main
   ```

2. **Sincronizar Gradle**
   ```bash
   gradlew.bat clean
   gradlew.bat build
   ```

3. **Actualizar dependencias**
   - Room Database 2.6.1
   - Security Crypto 1.1.0-alpha06
   - Gson 2.11.0

4. **Ejecutar migración de base de datos**
   - Room creará las tablas automáticamente
   - No hay migraciones destructivas en v3.0

---

## ⚠️ Cambios Rompientes (Breaking Changes)

### 1. Validación JSON Estricta

**v2.0:** Aceptaba JSON sin campo `teachers`  
**v3.0:** Requiere `students` y `teachers` mínimo

**Solución:**
```json
// Asegúrate de que tus archivos tengan:
{
  "students": [],
  "teachers": [],
  "renters": [],
  "debtRecords": [],
  "history": [],
  "schedule": {},
  "prices": []
}
```

### 2. Rate Limiting

**v2.0:** Exportaciones ilimitadas  
**v3.0:** Máximo 20/hora

**Solución:**
- Espera 1 hora para resetear contador
- O modifica `MAX_EXPORTS_PER_HOUR` en `FileHandlerInterface.java`

### 3. Min SDK Elevado

**v2.0:** API 24 (Android 7.0)  
**v3.0:** API 26 (Android 8.0)

**Impacto:**
- ~5% de dispositivos Android ya no son compatibles
- Permite usar encriptación moderna

---

## 🔧 Rollback (Si Algo Sale Mal)

### Volver a v2.0

1. **Exportar datos desde v3.0**
   ```
   Configuración → Exportar BD
   ```

2. **Desinstalar v3.0**
   ```
   Settings → Apps → BEMBE → Uninstall
   ```

3. **Instalar v2.0**
   ```
   Instalar APK v2.0
   ```

4. **Importar datos**
   ```
   Configuración → Importar BD → Seleccionar archivo
   ```

### Nota Importante
- Room Database no existe en v2.0
- Los datos volverán a localStorage únicamente
- Pierdes las mejoras de v3.0

---

## 🐛 Problemas Conocidos

### 1. "Database is locked" al iniciar

**Causa:** Migración concurrente  
**Solución:** Reiniciar app

### 2. "JSON validation failed" en importación antigua

**Causa:** Formato antiguo sin campos requeridos  
**Solución:**
- Re-exportar desde v2.0 primero
- O agregar campos faltantes manualmente

### 3. "Rate limit exceeded" inmediatamente

**Causa:** Bug en contador  
**Solución:** Limpiar datos de la app
```
Settings → Apps → BEMBE → Storage → Clear Data
```

---

## 📞 Soporte

Si experimentas problemas durante la migración:

1. **Revisar logs**
   ```bash
   adb logcat | grep BEMBE
   ```

2. **Verificar integridad**
   - Revisa checksum en archivos exportados
   - Compara con `DataEncryption.calculateSHA256()`

3. **Contactar soporte**
   - Incluye versión anterior y actual
   - Adjunta logs de error
   - Describe pasos para reproducir

---

## ✅ Checklist Post-Migración

- [ ] Datos de estudiantes presentes
- [ ] Datos de profesores presentes
- [ ] Exportar backup nuevo (formato v3.0)
- [ ] Verificar que importación funciona
- [ ] Confirmar que respaldos automáticos se crean
- [ ] Probar restauración de respaldo

---

**Última actualización:** 5 de abril de 2026  
**Versión:** 3.0.0
