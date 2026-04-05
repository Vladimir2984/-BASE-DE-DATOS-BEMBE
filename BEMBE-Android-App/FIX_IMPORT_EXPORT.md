# 🔧 Corrección de Importación/Exportación - BEMBE v3.0

## ❌ Problema Identificado

La aplicación **no podía importar ni exportar archivos JSON** correctamente.

### Causas Raíz:

1. **Conflicto de arquitectura**: El código Android inyectado sobrescribía las funciones `handleExport` y `handleImport` del HTML, creando un conflicto de comunicación.

2. **Flujo de importación roto**: 
   - Android leía el archivo nativamente
   - Pero los datos nunca llegaban correctamente al JavaScript para su procesamiento
   - El diálogo de confirmación del HTML y el de Android chocaban

3. **Duplicación de lógica**: Tanto el HTML como Android tenían sus propios sistemas de export/import que entraban en conflicto.

---

## ✅ Soluciones Implementadas

### 1. **Exportación Corregida**

**Antes:**
```javascript
// El HTML intentaba usar AndroidFileHandler pero fallaba
AndroidFileHandler.exportData(data); // Llamada bloqueada o ignorada
```

**Ahora:**
```javascript
function handleExport() {
  // Si estamos en Android nativo, usar el handler nativo
  if (typeof AndroidFileHandler !== 'undefined' && AndroidFileHandler.exportData) {
    AndroidFileHandler.exportData(JSON.stringify(appData, null, 2));
    return; // Salir inmediatamente
  }
  
  // Fallback para navegador web (descarga normal)
  const blob = new Blob([JSON.stringify(appData, null, 2)], {type:'application/json'});
  // ... descarga ...
}
```

**Flujo Android:**
1. Usuario hace clic en "Exportar BD"
2. `handleExport()` detecta `AndroidFileHandler`
3. Llama a `AndroidFileHandler.exportData(jsonString)`
4. **Java** guarda en:
   - Almacenamiento interno (`/data/data/com.bembe2026/files/Exports/`)
   - Downloads (`/storage/emulated/0/Download/BEMBE/`)
   - Room Database (tabla `backups`)
5. Notifica éxito: `onExportSuccess(fileName)` → muestra toast en JS

---

### 2. **Importación Corregida**

**Antes:**
```
1. handleImport() → AndroidFileHandler.importData()
2. Android abre selector de archivos
3. Usuario selecciona archivo
4. Android lee archivo → onFileSelected() en JS
5. ¿¿¿ Pero los datos no se procesan ???
```

**Ahora:**
```
1. handleImport() → AndroidFileHandler.importData()
2. Android abre selector de archivos nativo
3. Usuario selecciona archivo
4. Android lee y VALIDA el archivo (checksum, estructura, tamaño)
5. Android procesa importación DIRECTAMENTE en WebView:
   - Crea respaldo automático
   - Parsea JSON
   - Actualiza appData
   - Ejecuta saveData() y renderAll()
   - Muestra toast de éxito
6. Notifica confirmación: AndroidFileHandler.confirmImport('true')
```

**Código clave (`processImportInWebView`):**
```java
private void processImportInWebView(String jsonData) {
    String script = 
        "(function() { " +
        "  try { " +
        "    createAutoBackup(); " +
        "    var imported = JSON.parse(" + gson.toJson(jsonData) + "); " +
        "    appData = { students: imported.students || [], ... };" +
        "    saveData(); " +
        "    renderAll(); " +
        "    showToast('✅ Datos importados correctamente'); " +
        "    AndroidFileHandler.confirmImport('true'); " +
        "    return true; " +
        "  } catch(err) { " +
        "    showToast('❌ Error al importar: ' + err.message); " +
        "    return false; " +
        "  } " +
        "})();";
    
    webView.evaluateJavascript(script, null);
}
```

---

### 3. **Limpieza de Código**

**MainActivity.java:**
- ✅ Eliminado script inyectado complejo que sobrescribía funciones
- ✅ Ahora solo inyecta callbacks simples (`onExportSuccess`, `onImportError`, etc.)
- ✅ HTML mantiene sus funciones originales intactas

**FileHandlerInterface.java:**
- ✅ `handleFileSelected()` ahora llama a `processImportInWebView()`
- ✅ `confirmImport()` solo guarda metadata, no reprocesa datos
- ✅ Flujo lineal y sin conflictos

**CODIGO_OK.html:**
- ✅ `handleExport()` e `handleImport()` detectan si están en Android
- ✅ Si es así, usan `AndroidFileHandler` directamente
- ✅ Si no, usan fallback de navegador (descarga normal)

---

## 🧪 Pruebas a Realizar

### Prueba de Exportación

1. **Abrir la app** en emulador o dispositivo
2. **Agregar datos de prueba**:
   - Agregar 2-3 estudiantes
   - Agregar 1 profesor
3. **Ir a Configuración → Exportar BD**
4. **Verificar**:
   - ✅ Aparece toast "📥 Datos exportados: bembe_backup_XXXX.json"
   - ✅ El archivo existe en almacenamiento interno
   - ✅ El archivo existe en Downloads/BEMBE/
   - ✅ El archivo es JSON válido (abrir con editor de texto)

### Prueba de Importación

1. **Usar el archivo exportado** en el paso anterior
2. **Modificar datos actuales** (agregar estudiantes dummy)
3. **Ir a Configuración → Importar BD**
4. **Seleccionar el archivo** exportado
5. **Verificar**:
   - ✅ Aparece toast "💾 Respaldo automático creado"
   - ✅ Aparece toast "✅ Datos importados correctamente"
   - ✅ Los datos del archivo se muestran en la lista de estudiantes
   - ✅ Dashboard actualizado correctamente

### Prueba de Respaldo Automático

1. **Importar un archivo**
2. **Ir a Configuración → Restaurar Respaldo**
3. **Verificar**:
   - ✅ Aparece diálogo de confirmación
   - ✅ Al confirmar, datos vuelven al estado anterior
   - ✅ Toast "✅ Respaldo restaurado correctamente"

### Prueba de Validación

1. **Intentar importar un archivo no-JSON** (.txt, .xml, etc.)
2. **Verificar**:
   - ✅ Toast de error: "❌ Error al leer archivo" o "Archivo inválido"
   - ✅ No se importan datos corruptos

3. **Intentar importar un JSON con estructura inválida**
4. **Verificar**:
   - ✅ Toast de error específico: "Archivo inválido: falta campo requerido 'X'"
   - ✅ No se importan datos incompletos

---

## 📊 Flujo Completo de Datos

```
┌─────────────────────────────────────────────────────────────┐
│                    USUARIO INTERACTÚA                       │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │  Clic en Exportar/Importar    │
        └───────────┬───────────────────┘
                    │
        ┌───────────▼───────────────────┐
        │  handleExport/Import() en JS  │
        │  Detecta si es Android        │
        └───────────┬───────────────────┘
                    │
        ┌───────────▼───────────────────┐
        │ AndroidFileHandler.exportData │
        │ AndroidFileHandler.importData │
        └───────────┬───────────────────┘
                    │
    ┌───────────────▼───────────────┐
    │    FileHandlerInterface.java  │
    │  - Validar JSON               │
    │  - Calcular checksum SHA-256  │
    │  - Rate limiting              │
    │  - Detección duplicados       │
    └───────────────┬───────────────┘
                    │
    ┌───────────────▼───────────────┐
    │   Si es EXPORTACIÓN:          │
    │  - Guardar en interno         │
    │  - Guardar en Downloads       │
    │  - Guardar en Room Database   │
    │  - Notificar éxito a JS       │
    │                               │
    │   Si es IMPORTACIÓN:          │
    │  - Crear respaldo automático  │
    │  - Procesar en WebView        │
    │  - Actualizar appData         │
    │  - Ejecutar saveData()        │
    │  - Ejecutar renderAll()       │
    │  - Notificar éxito a JS       │
    └───────────────┬───────────────┘
                    │
        ┌───────────▼───────────────────┐
        │  showToast() en JavaScript    │
        │  Usuario ve confirmación      │
        └───────────────────────────────┘
```

---

## 🎯 Cambios en Archivos

### Modificados:
- ✅ `MainActivity.java` - Script inyectado simplificado
- ✅ `FileHandlerInterface.java` - `handleFileSelected` y `confirmImport` corregidos
- ✅ `CODIGO_OK.html` - `handleExport` e `handleImport` con detección de Android

### No modificados (funcionaban bien):
- `AppDatabase.java`
- `AppDao.java`
- `StudentEntity.java`
- `TeacherEntity.java`
- `BackupEntity.java`
- `DataEncryption.java`

---

## ⚠️ Notas Importantes

1. **No se requiere diálogo de confirmación en Android**: La importación se procesa directamente porque el archivo ya fue validado por Android antes de leerlo.

2. **Respaldo automático**: Se crea ANTES de procesar la importación, no después.

3. **Fallback de navegador**: Si el mismo HTML se abre en un navegador, las funciones de export/import funcionan normalmente (descarga/sube archivos).

4. **Rate limiting**: Solo afecta exportaciones, no importaciones.

---

## 🚀 Próximos Pasos

1. **Compilar y probar**:
   ```bash
   gradlew.bat clean
   gradlew.bat assembleDebug
   ```

2. **Probar en emulador**:
   - Exportar datos
   - Importar datos
   - Verificar respaldos

3. **Probar en dispositivo físico**:
   - Verificar que los archivos se guardan en Downloads
   - Probar con archivos grandes (5MB+)

4. **Documentar resultados**:
   - Si funciona: Actualizar CHANGELOG
   - Si hay errores: Reportar logs con `adb logcat | grep BEMBE`

---

**Fecha de corrección:** 5 de abril de 2026  
**Versión:** 3.0.1 (hotfix)  
**Estado:** ✅ LISTO PARA PRUEBAS
