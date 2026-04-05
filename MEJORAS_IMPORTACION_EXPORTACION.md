# 📦 Mejoras de Importación/Exportación JSON - BEMBE

## 📋 Resumen de Mejoras

Se ha mejorado significativamente la funcionalidad de importación/exportación de la aplicación BEMBE PWA (`CODIGO OK.html`).

---

## ✨ Nuevas Características

### 1. **Exportación Mejorada** 📥

- **Timestamp único**: Los archivos ahora incluyen marca de tiempo precisa en el nombre
  - Formato: `bembe_backup_2026-04-01T15-30-45.json`
- **Registro de exportación**: Se guarda información de la última exportación en localStorage
- **Manejo de errores**: Notificaciones claras si falla la exportación

### 2. **Importación Segura** 📤

- **Validación de archivo**:
  - Verifica que sea archivo `.json`
  - Valida tamaño máximo (10MB límite)
  - Valida estructura de datos requerida
  
- **Validación de estructura**:
  - Verifica todos los campos requeridos (students, teachers, renters, debtRecords, history, schedule, prices)
  - Valida tipos de datos
  - Verifica estructura de cada estudiante

- **Confirmación del usuario**:
  - Muestra resumen de datos antes de importar
  - Diálogo de confirmación con detalles
  - Opción de cancelar en cualquier momento

### 3. **Respaldo Automático** 💾

- **Backup antes de importar**: Crea automáticamente un respaldo antes de cada importación
- **Respaldo diario único**: Solo crea un respaldo por día
- **Botón de restaurar**: Nuevo botón en Configuración para restaurar el respaldo del día

### 4. **Historial de Importaciones** 📚

- Guarda las últimas 10 importaciones realizadas
- Registra: fecha, nombre del archivo, resumen de datos

---

## 🚀 Cómo Usar

### Exportar Datos

1. Ve a **Configuración** ⚙️
2. Haz clic en **📥 Exportar BD**
3. El archivo se descargará automáticamente
4. Guarda el archivo en un lugar seguro

### Importar Datos

1. Ve a **Configuración** ⚙️
2. Haz clic en **📤 Importar BD**
3. Selecciona tu archivo `.json`
4. **Automáticamente** se crea un respaldo de tus datos actuales
5. Revisa el resumen de datos importados
6. Confirma o cancela la importación
7. ¡Listo! Tus datos se han actualizado

### Restaurar Respaldo

1. Ve a **Configuración** ⚙️
2. Haz clic en **💾 Restaurar Respaldo**
3. Confirma la restauración
4. Tus datos volverán al estado del respaldo automático

---

## ⚠️ Importante

### La APK no tiene funcionalidad nativa de importación/exportación

El archivo `BEMBE-BASE-DATOS.apk` es una aplicación compilada que probablemente:
- Usa localStorage del navegador (si es PWA wrapper)
- Tiene almacenamiento interno de Android

**Solución recomendada**:
- Usa el archivo `CODIGO OK.html` en un navegador web
- Todas las funciones de importación/exportación están disponibles allí
- Los datos se sincronizan vía localStorage del navegador

---

## 🔧 Estructura del Archivo JSON

```json
{
  "students": [],      // Lista de alumnos
  "teachers": [],      // Lista de profesores
  "renters": [],       // Lista de rentadores
  "debtRecords": [],   // Registro de deudas
  "history": [],       // Historial de transacciones
  "schedule": {},      // Horarios de clases
  "prices": []         // Tabla de precios
}
```

### Estructura de Estudiante
```json
{
  "id": "unique_id",
  "surname": "Apellido",
  "name": "Nombre",
  "phone": "Teléfono",
  "birthDate": "YYYY-MM-DD",
  "registerDate": "YYYY-MM-DD",
  "hours": "4",
  "start": "YYYY-MM-DD",
  "end": "YYYY-MM-DD",
  "cost": 2000
}
```

---

## 🛠️ Solución de Problemas

### Error: "Archivo inválido"
- Asegúrate de que el archivo termine en `.json`
- Verifica que el archivo no esté corrupto
- El archivo debe tener la estructura correcta

### Error: "Archivo demasiado grande"
- Límite: 10MB
- Considera exportar con menos historial
- Elimina registros antiguos si es necesario

### Error: "Campos faltantes"
- El archivo JSON debe tener TODOS los campos requeridos
- Compara con una exportación reciente

### No aparece el botón de restaurar
- Solo hay respaldo si se intentó una importación hoy
- El respaldo se crea automáticamente al importar

---

## 📊 Validaciones Implementadas

| Validación | Descripción |
|------------|-------------|
| Tipo de archivo | Solo `.json` |
| Tamaño máximo | 10MB (hard limit) |
| Campos requeridos | 7 campos obligatorios |
| Tipos de datos | Arrays y objetos correctos |
| Estructura students | id, surname, name requeridos |
| Tamaño estimado | Máximo 5MB de datos |

---

## 🌐 Traducciones

Las nuevas funciones están disponibles en:
- **Español** (ES): "Restaurar Respaldo"
- **Русский** (RU): "Восстановить резервную копию"
- **English** (EN): "Restore Backup"

---

## 📝 Notas Técnicas

### Funciones Agregadas

1. `createAutoBackup()` - Crea respaldo automático
2. `validateImportData(imported)` - Valida datos importados
3. `showImportConfirmation(summary, file, resolve, reject)` - Muestra diálogo de confirmación
4. `restoreAutoBackup()` - Restaura respaldo del día

### Funciones Modificadas

1. `handleExport()` - Mejorada con timestamp y manejo de errores
2. `handleImport()` - Ahora crea backup automático primero
3. `processImport(event)` - Validación completa y confirmación

### Keys de localStorage

- `bembe_app_data` - Datos principales
- `bembe_auto_backup_YYYY-MM-DD` - Respaldo automático del día
- `bembe_last_export` - Información de última exportación
- `bembe_import_history` - Historial de importaciones (últimas 10)

---

## 🔐 Seguridad

- **No se envían datos a servidores externos**
- **Todo se almacena localmente en el navegador**
- **Los archivos JSON son solo para uso local**
- **No compartas tus archivos de backup con nadie**

---

## 📞 Soporte

Si experimentas problemas:
1. Verifica que estás usando el navegador más reciente
2. Limpia el caché del navegador
3. Intenta con otro archivo de backup
4. Usa la función de restaurar respaldo

---

**Última actualización**: 1 de abril de 2026
**Versión**: 2.0.0
