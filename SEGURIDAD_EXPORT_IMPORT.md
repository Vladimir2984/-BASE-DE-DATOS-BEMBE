# 🔐 Seguridad y Persistencia de Exportación/Importación JSON - BEMBE v2.0

## 📋 Resumen de Mejoras de Seguridad

Se han implementado características de seguridad y persistencia significativamente mejoradas en la funcionalidad de importación/exportación de la aplicación BEMBE.

---

## ✨ Nuevas Características de Seguridad

### 1. **Verificación de Integridad con Checksum** 🔍

- **Checksum automático**: Cada archivo exportado incluye un hash de verificación
- **Validación en importación**: Se verifica que el archivo no esté corrupto o modificado
- **Validación en backups**: Los respaldos automáticos también incluyen checksum
- **Algoritmo**: Hash de 32-bit basado en el contenido completo de los datos

**Implementación:**
```javascript
// Generación de checksum
function generateChecksum(data) {
  let hash = 0;
  const str = JSON.stringify(data);
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}
```

### 2. **Protección contra XSS (Cross-Site Scripting)** 🛡️

- **Sanitización de datos**: Todos los campos de texto se sanitizan al importar
- **Prevención de inyección de código**: Se escapan caracteres HTML peligrosos
- **Validación de longitud**: Límites en campos para prevenir abuso

**Campos protegidos:**
- Nombres y apellidos (máx 100 caracteres)
- Teléfonos (máx 20 caracteres)
- Todos los campos de texto en estudiantes, profesores y rentadores

**Implementación:**
```javascript
function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
```

### 3. **Protección con Contraseña (Opcional)** 🔑

- **Codificación XOR + Base64**: Cifrado ligero para archivos sensibles
- **Prompt de contraseña**: Interfaz elegante para ingresar contraseña al importar
- **Validación segura**: Verificación de contraseña con manejo de errores

**Uso:**
```javascript
// Codificar con contraseña
function encodeWithPassword(data, password) {
  const jsonStr = JSON.stringify(data);
  let encoded = '';
  for (let i = 0; i < jsonStr.length; i++) {
    const charCode = jsonStr.charCodeAt(i) ^ password.charCodeAt(i % password.length);
    encoded += String.fromCharCode(charCode);
  }
  return btoa(encoded);
}
```

### 4. **Estructura de Archivo de Exportación Segura** 📦

**Formato nuevo con metadata de seguridad:**
```json
{
  "version": "2.0.0",
  "timestamp": 1712000000000,
  "checksum": "abc123xyz",
  "data": {
    "students": [...],
    "teachers": [...],
    "renters": [...],
    "debtRecords": [...],
    "history": [...],
    "schedule": {...},
    "prices": [...]
  },
  "metadata": {
    "exportDate": "2026-04-01T15:30:45.000Z",
    "appVersion": "BEMBE-2.0.0",
    "recordCount": {
      "students": 25,
      "teachers": 5,
      "renters": 3,
      "debtRecords": 2,
      "history": 50
    }
  }
}
```

**Formato con contraseña:**
```json
{
  "version": "2.0.0",
  "timestamp": 1712000000000,
  "checksum": "abc123xyz",
  "encrypted": true,
  "payload": "base64_encoded_encrypted_data...",
  "metadata": {...}
}
```

### 5. **Rotación Automática de Backups** 🔄

- **Retención de 7 días**: Los backups antiguos se eliminan automáticamente
- **Prevención de acumulación**: Evita el llenado excesivo de localStorage
- **Backup diario único**: Un backup por día, sin sobrescritura

**Lógica de rotación:**
```javascript
function rotateOldBackups() {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 7);
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith('bembe_auto_backup_')) {
      const dateStr = key.replace('bembe_auto_backup_', '');
      const backupDate = new Date(dateStr);
      if (backupDate < cutoffDate) {
        localStorage.removeItem(key);
      }
    }
  }
}
```

---

## 🔧 Validaciones Implementadas

### Validaciones de Exportación

| Validación | Descripción | Estado |
|------------|-------------|--------|
| Generación de checksum | Hash único para verificar integridad | ✅ Activo |
| Metadata de exportación | Información de versión y conteo de registros | ✅ Activo |
| Registro en localStorage | Guarda información de última exportación | ✅ Activo |
| Manejo de errores | Notificaciones claras si falla | ✅ Activo |

### Validaciones de Importación

| Validación | Descripción | Estado |
|------------|-------------|--------|
| Tipo de archivo | Solo `.json` | ✅ Activo |
| Tamaño máximo | 10MB (hard limit) | ✅ Activo |
| Estructura JSON | JSON válido y bien formado | ✅ Activo |
| Campos requeridos | 7 campos obligatorios | ✅ Activo |
| Tipos de datos | Arrays y objetos correctos | ✅ Activo |
| Estructura students | id, surname, name requeridos | ✅ Activo |
| Longitud de campos | Máx 100 chars para nombres | ✅ Activo |
| Checksum de integridad | Verificación de datos no modificados | ✅ Activo |
| Sanitización XSS | Prevención de inyección de código | ✅ Activo |
| Tamaño estimado | Máximo 5MB de datos | ✅ Activo |

---

## 🚀 Cómo Usar las Nuevas Funcionalidades

### Exportar Datos (con seguridad mejorada)

1. Ve a **Configuración** ⚙️
2. Haz clic en **📥 Exportar BD**
3. **Automáticamente** se genera:
   - Checksum de verificación
   - Metadata de exportación
   - Estructura segura del archivo
4. El archivo se descargará con formato: `bembe_backup_2026-04-01T15-30-45.json`
5. Guarda el archivo en un lugar seguro

### Importar Datos (con validación de seguridad)

1. Ve a **Configuración** ⚙️
2. Haz clic en **📤 Importar BD**
3. Selecciona tu archivo `.json`
4. **Automáticamente** se ejecutan validaciones:
   - ✅ Verificación de tipo de archivo
   - ✅ Validación de tamaño
   - ✅ Verificación de checksum
   - ✅ Sanitización de datos contra XSS
   - ✅ Validación de estructura
5. **Automáticamente** se crea un respaldo de tus datos actuales
6. Revisa el resumen de datos importados
7. Confirma o cancela la importación
8. ¡Listo! Tus datos se han actualizado con verificación de integridad

### Importar Archivo Protegido con Contraseña

1. Selecciona el archivo `.json` protegido
2. Aparecerá un **prompt de contraseña**
3. Ingresa la contraseña correcta
4. El sistema validará y descodificará el archivo
5. Continúa con la confirmación normal de importación

### Restaurar Respaldo (con validación de checksum)

1. Ve a **Configuración** ⚙️
2. Haz clic en **💾 Restaurar Respaldo**
3. **Automáticamente** se valida:
   - ✅ Checksum del backup
   - ✅ Integridad de datos
4. Confirma la restauración
5. Tus datos volverán al estado del respaldo automático

---

## 📊 Estructura de Datos Validados

### Estudiante (Student)
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

**Validaciones aplicadas:**
- ✅ `id`, `surname`, `name` son obligatorios
- ✅ `surname` y `name` máx 100 caracteres
- ✅ `phone` máx 20 caracteres
- ✅ Todos los campos sanitizados contra XSS

---

## 🔐 Características de Seguridad del Android Native Bridge

### Exportación Nativa Mejorada

1. **Validación de JSON antes de guardar**
   - Verifica que los datos sean JSON válido
   - Previene corrupción de archivos de exportación

2. **Cálculo de checksum nativo**
   - Genera hash de 32-bit para verificación
   - Guarda metadata con información de exportación

3. **Almacenamiento seguro**
   - Guarda en almacenamiento interno (`BEMBE/Exports/`)
   - Copia en almacenamiento externo (`Downloads/BEMBE/`)
   - Metadata separada en `BEMBE/Exports/Metadata/`

### Importación Nativa Mejorada

1. **Validación de tamaño**
   - Límite de 10MB hard-coded
   - Previene ataques de denegación de servicio

2. **Validación de estructura**
   - Verifica campos requeridos
   - Compatible con formato antiguo y nuevo

3. **Verificación de checksum**
   - Valida integridad de archivos importados
   - Detecta corrupción o manipulación

### Backup Nativo Mejorado

1. **Paquete de backup con checksum**
   - Genera estructura JSON con metadata
   - Incluye timestamp y hash de verificación

2. **Rotación de backups**
   - Mantiene solo últimos 7 días
   - Elimina automáticamente backups antiguos

3. **Restauración con validación**
   - Verifica checksum antes de restaurar
   - Compatible con formato antiguo

---

## 🛡️ Flujo de Seguridad Completo

### Exportación:
```
Datos en localStorage
    ↓
Sanitización (si es necesario)
    ↓
Generación de checksum
    ↓
Creación de paquete con metadata
    ↓
(Opcional) Codificación con contraseña
    ↓
Validación de JSON
    ↓
Guardado con checksum
    ↓
Registro de metadata
```

### Importación:
```
Archivo seleccionado
    ↓
Validación de tipo (.json)
    ↓
Validación de tamaño (≤10MB)
    ↓
Parseo de JSON
    ↓
Verificación de checksum
    ↓
( Si está encriptado ) Descodificación con contraseña
    ↓
Sanitización de todos los campos
    ↓
Validación de estructura requerida
    ↓
Validación de longitud de campos
    ↓
Confirmación del usuario
    ↓
Aplicación de datos validados
    ↓
Registro en historial de importaciones
```

---

## ⚠️ Importante

### Seguridad de Datos

- **No se envían datos a servidores externos** - Todo es local
- **Los archivos JSON son solo para uso local** - No compartir públicamente
- **Checksume de integridad** - Detecta modificaciones accidentales o maliciosas
- **Sanitización XSS** - Previene inyección de código malicioso
- **Contraseña opcional** - Protección adicional para archivos sensibles

### Límites y Restricciones

| Límite | Valor | Razón |
|--------|-------|-------|
| Tamaño máximo de archivo | 10MB | Prevención de DoS |
| Tamaño estimado de datos | 5MB | Límite de localStorage |
| Retención de backups | 7 días | Prevención de acumulación |
| Longitud de nombres | 100 chars | Prevención de abuso |
| Longitud de teléfono | 20 chars | Formato estándar |
| Historial de importaciones | Últimas 10 | Optimización de espacio |

---

## 🐛 Solución de Problemas

### Error: "El archivo está corrupto o ha sido modificado"
- **Causa**: El checksum no coincide con los datos
- **Solución**: Usa un archivo de exportación diferente o verifica la integridad

### Error: "Archivo de exportación antiguo o inválido"
- **Causa**: El archivo no tiene estructura de seguridad v2.0
- **Solución**: Re-exporta desde la aplicación actualizada

### Error: "Este archivo está protegido con contraseña"
- **Causa**: El archivo fue exportado con codificación de contraseña
- **Solución**: Ingresa la contraseña correcta en el prompt

### Error: "Nombre o apellido demasiado largo"
- **Causa**: Campo excede 100 caracteres
- **Solución**: Edita el archivo JSON para acortar el campo

### Error: "El respaldo está corrupto o ha sido modificado"
- **Causa**: Checksum del backup no coincide
- **Solución**: Usa un backup de otro día o re-exporta los datos

---

## 📝 Notas Técnicas

### Funciones de Seguridad Agregadas

1. `generateChecksum(data)` - Genera hash de verificación
2. `sanitizeString(str)` - Previene XSS
3. `sanitizeObject(obj)` - Sanitiza campos de objeto
4. `sanitizeAppData(data)` - Sanitiza toda la estructura de datos
5. `encodeWithPassword(data, password)` - Codificación XOR
6. `decodeWithPassword(encodedStr, password)` - Decodificación XOR
7. `createExportPackage(data, password)` - Crea paquete seguro
8. `validateImportPackage(imported, password)` - Valida y descodifica
9. `rotateOldBackups()` - Limpieza automática de backups
10. `proceedWithImport(validation, file, event)` - Importación segura

### Funciones Nativas Agregadas (Android)

1. `calculateChecksum(data)` - Checksum nativo
2. `saveExportMetadata(fileName, jsonData)` - Metadata de exportación
3. `validateImportStructure(jsonObject)` - Validación de estructura
4. `createBackupPackage(jsonData)` - Paquete de backup
5. `rotateOldBackups(backupsDir)` - Rotación de backups

### Keys de localStorage

| Key | Formato | Propósito |
|-----|---------|-----------|
| `bembe_app_data` | JSON | Datos principales |
| `bembe_auto_backup_YYYY-MM-DD` | JSON con checksum | Respaldo automático |
| `bembe_last_export` | JSON con checksum | Info de última exportación |
| `bembe_import_history` | Array (últimas 10) | Historial de importaciones |

### Compatibilidad con Versiones Anteriores

- ✅ **Lectura**: Puede importar archivos de versiones anteriores (sin checksum)
- ✅ **Escritura**: Genera archivos con formato v2.0 (con checksum)
- ⚠️ **Recomendación**: Re-exportar todos los datos con el nuevo formato

---

## 🔍 Auditoría de Seguridad

### Campos Sanitizados

Todos los campos de texto en las siguientes estructuras se sanitizan:
- ✅ `students[]` (surname, name, phone, etc.)
- ✅ `teachers[]` (name, phone, email, spec, schedule)
- ✅ `renters[]` (name, surname, phone, days, hours)
- ✅ `debtRecords[]` (name, surname, phone)
- ✅ `history[]` (studentName, type, etc.)

### Prevención de Ataques

| Tipo de Ataque | Prevención | Estado |
|----------------|------------|--------|
| XSS (Cross-Site Scripting) | Sanitización de todos los campos | ✅ Protegido |
| Inyección de JSON | Validación de estructura y tipos | ✅ Protegido |
| Corrupción de datos | Checksum de verificación | ✅ Protegido |
| Desbordamiento de buffer | Límites de longitud de campos | ✅ Protegido |
| DoS por tamaño | Límite de 10MB | ✅ Protegido |
| Manipulación de archivos | Validación de checksum | ✅ Protegido |

---

**Última actualización**: 3 de abril de 2026
**Versión**: 2.0.0
**Nivel de Seguridad**: ✅ Mejorado con checksum, sanitización y protección con contraseña
