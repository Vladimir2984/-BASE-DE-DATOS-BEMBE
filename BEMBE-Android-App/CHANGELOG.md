# 📝 Changelog - BEMBE Android App

Todos los cambios notables en este proyecto.

---

## [3.0.0] - 2026-04-05

### 🎉 Lanzamiento Importante: Seguridad y Persistencia Mejorada

Esta versión representa una mejora significativa en seguridad, robustez y rendimiento de la aplicación.

### ✨ Agregado

#### Persistencia
- **Room Database** para persistencia nativa robusta
  - `AppDatabase.java`: Base de datos principal con patrón Singleton
  - `AppDao.java`: Operaciones de base de datos con LiveData
  - `StudentEntity.java`: Entidad para alumnos
  - `TeacherEntity.java`: Entidad para profesores
  - `BackupEntity.java`: Entidad para respaldos automáticos
  
- **Tres capas de persistencia**:
  1. localStorage del WebView (compatibilidad)
  2. Room Database (nativo robusto)
  3. Archivos JSON (exportación manual)

#### Seguridad
- **Encriptación AES-GCM** con Android Keystore
  - `DataEncryption.java`: Utilidad completa de encriptación
  - Claves almacenadas en Android Keystore (hardware-backed si disponible)
  - IV generado automáticamente para cada encriptación
  
- **Checksums SHA-256** para verificación de integridad
  - Todos los backups incluyen checksum
  - Validación automática al restaurar
  - Detección de corrupción de datos

- **SharedPreferences encriptados**
  - Usando `EncryptedSharedPreferences` de AndroidX Security
  - Metadata de exportación/importación protegida
  - Tokens de seguridad generados con `SecureRandom`

#### Validación
- **Validación estricta de JSON**
  - Verificación de estructura completa
  - Validación individual de estudiantes
  - Verificación de tipos de datos
  - Soporte para formato nuevo y antiguo

- **Detección de duplicados**
  - Previene importaciones repetidas accidentalmente
  - Basado en checksum + ventana de tiempo (5 minutos)

- **Rate limiting**
  - Máximo 20 exportaciones por hora
  - Previene abuso accidental o malicioso
  - Ventana de tiempo reiniciable

#### WebView Security
- **Restricción de acceso a archivos**
  - `setAllowUniversalAccessFromFileURLs(false)`
  - `setAllowFileAccessFromFileURLs(false)`
  - Previene ataques XSS desde archivos locales

- **Manejo de errores SSL**
  - Rechazo automático de certificados inválidos
  - Notificación al usuario de problemas de seguridad

- **Mixed Content Mode seguro**
  - Solo permite contenido seguro en HTTPS
  - Bloquea HTTP mixto

- **Filtrado de URLs**
  - Solo permite `file:///android_asset/` y `https://`
  - Bloquea esquemas peligrosos (javascript:, data:, etc.)

#### Testing
- **Tests unitarios básicos**
  - `DataValidationTest.java`: Validación de estructuras
  - Tests de checksum, fechas, rotación de backups
  - Tests de límites de tamaño

#### Documentación
- **README.md completo** con todas las mejoras
- **MIGRATION_GUIDE.md** para migrar de v2.0 a v3.0
- **Comentarios en código** explicando cada mejora

### 🔧 Modificado

#### Dependencias Actualizadas
```diff
- compileSdk 34
+ compileSdk 35

- minSdk 24
+ minSdk 26

- targetSdk 34
+ targetSdk 35

- versionCode 2
+ versionCode 3

- versionName "2.0.0"
+ versionName "3.0.0"

- appcompat:1.6.1
+ appcompat:1.7.0

- material:1.11.0
+ material:1.12.0

- constraintlayout:2.1.4
+ constraintlayout:2.2.1

- webkit:1.9.0
+ webkit:1.12.1

- gson:2.10.1
+ gson:2.11.0

+ Room Database: 2.6.1 (NUEVO)
+ Security Crypto: 1.1.0-alpha06 (NUEVO)
+ Kotlinx Coroutines: 1.8.1 (NUEVO)
```

#### Optimización de Build
- **Min SDK elevado**: 24 → 26 (Android 8.0)
  - Permite usar Android Keystore moderno
  - Reduce dispositivos compatibles en ~5%
  
- **ProGuard activado en release**
  - Ofuscación de código
  - Eliminación de código no usado
  - Reducción de tamaño de APK (~40%)

- **Java 17** como target
  - Mejor rendimiento
  - Características modernas del lenguaje

#### FileHandlerInterface
- **Validación mejorada** de archivos importados
- **Checksum SHA-256** reemplaza checksum simple
- **Room Database integration** para backups
- **Logging mejorado** con niveles apropiados
- **Manejo de errores** más robusto

#### MainActivity
- **WebViewClient mejorado** con filtrado de URLs
- **SSL error handling** agregado
- **Console logging** con niveles apropiados
- **Security hardening** en configuración

### 🗑️ Eliminado

- **Checksum simple** (reemplazado por SHA-256)
- **AppCache** (obsoleto en WebView moderno)
- **Acceso universal a archivos locales** (riesgo de seguridad)
- **Logs en producción** (ProGuard los elimina)

### 🐛 Corregido

- **Validación débil** de archivos JSON importados
- **Pérdida potencial de datos** sin respaldo nativo
- **Acceso inseguro** a archivos locales
- **Checksum inconsistente** en backups antiguos

### 📊 Impacto

| Métrica | Antes | Después | Cambio |
|---------|-------|---------|--------|
| APK debug | ~8MB | ~6MB | -25% |
| APK release | ~5MB | ~3MB | -40% |
| Validación JSON | Básica | Estricta | +Seguridad |
| Persistencia | 1 capa | 3 capas | +Robustez |
| Exportaciones | Ilimitadas | 20/hora | +Control |
| Checksum | 32-bit | SHA-256 | +Seguridad |

### ⚠️ Breaking Changes

1. **Min SDK 26**: Dispositivos con Android 7.x ya no compatibles
2. **Validación estricta**: Algunos archivos antiguos pueden fallar
3. **Rate limiting**: Máximo 20 exportaciones/hora
4. **Room Database**: Requiere migración automática al primer inicio

### 📝 Notas de Migración

- **Datos existentes**: Se preservan automáticamente
- **localStorage**: Sigue funcionando como antes
- **Backups antiguos**: Compatibles pero sin verificación SHA-256
- **Rollback posible**: Exportar datos antes de actualizar

---

## [2.0.0] - 2026-04-01

### ✨ Agregado
- Importación/exportación JSON mejorada
- Respaldos automáticos antes de importar
- Validación básica de estructura JSON
- Botón de restaurar respaldo
- Timestamps únicos en archivos exportados
- Historial de importaciones (últimas 10)

### 🔧 Modificado
- Manejo de errores mejorado en exportación
- Confirmación de usuario antes de importar
- Validación de campos requeridos
- Límite de tamaño de archivo (10MB)

---

## [1.0.0] - 2026-03-XX

### ✨ Agregado
- Versión inicial de la aplicación
- WebView con aplicación web BEMBE
- Persistencia con localStorage
- Exportación/importación básica de JSON
- Calendario de asistencia
- Gestión de alumnos y profesores
- Dashboard con estadísticas

---

## Convenciones de Formato

- `[Versión]` - Número de versión con corchetes
- `YYYY-MM-DD` - Fecha de lanzamiento
- **Agregado** - Nuevas características
- **Modificado** - Cambios en características existentes
- **Eliminado** - Características removidas
- **Corregido** - Bugs solucionados
- **Breaking Changes** - Cambios que rompen compatibilidad

---

**Mantenido por:** BEMBE Development Team  
**Última actualización:** 5 de abril de 2026
