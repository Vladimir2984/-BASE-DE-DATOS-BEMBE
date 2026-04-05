# 🚀 BEMBE v3.0.0 - GUÍA COMPLETA DE INSTALACIÓN Y DESPLIEGUE

## ✨ NOVEDADES v3.0.0

- ✅ **Sincronización en la Nube**: Datos sincronizados automáticamente entre PC y móvil
- ✅ **Servidor Gratuito**: Despliegue en Render.com con base de datos Supabase (PostgreSQL)
- ✅ **Actualizaciones Automáticas**: PWA con Service Worker - se actualiza solo en PC y móvil
- ✅ **Seguridad Avanzada**: Autenticación JWT, encriptación AES-256, rate limiting, HTTPS
- ✅ **Persistencia Total**: Base de datos en la nube con backups automáticos
- ✅ **Modo Offline**: Funciona sin conexión, sincroniza cuando hay internet
- ✅ **Multi-plataforma**: PC, Android, iOS - todos sincronizados automáticamente

---

## 📋 ESTRUCTURA DEL PROYECTO

```
BEMBE-PC/
├── CODIGO OK.html                    # Aplicación principal PWA (mejorada)
├── CODIGO OK - BACKUP.html           # Backup de versión anterior
├── .gitignore                        # Git ignore
├── render.yaml                       # Configuración despliegue Render.com
│
├── backend/                          # Servidor Node.js
│   ├── server.js                     # Servidor principal
│   ├── package.json                  # Dependencias
│   ├── .env.example                  # Variables de entorno ejemplo
│   ├── routes/
│   │   ├── auth.js                   # Autenticación (login, registro)
│   │   ├── data.js                   # CRUD de datos
│   │   ├── sync.js                   # Sincronización
│   │   └── backup.js                 # Gestión de backups
│   ├── middleware/
│   │   ├── auth.js                   # Middleware JWT
│   │   └── errorHandler.js           # Manejo de errores
│   └── utils/
│       ├── database.js               # Inicialización DB
│       └── supabase.js               # Cliente Supabase
│
├── frontend/                         # Archivos PWA
│   ├── manifest.json                 # Manifiesto PWA
│   └── sw.js                         # Service Worker
│
├── BEMBE-Android-App/                # App Android (existente)
├── SITIO WEB BEMBE/                  # WordPress (existente)
└── PLUGIN BEMBE/                     # Plugin WordPress (existente)
```

---

## 🛠️ PASO 1: CREAR BASE DE DATOS SUPABASE (GRATIS)

1. Ve a https://supabase.com y crea una cuenta gratuita
2. Crea un nuevo proyecto llamado "bembe"
3. Espera a que se cree (2-3 minutos)
4. Ve a **Settings > API** y copia:
   - `Project URL` (ej: `https://xxxxx.supabase.co`)
   - `service_role secret` (clave larga)

5. Ve a **SQL Editor** y ejecuta este SQL:

```sql
-- Tabla de usuarios
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user',
  client_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla principal de datos
CREATE TABLE app_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  data_type VARCHAR(50) NOT NULL,
  data JSONB NOT NULL,
  version INTEGER DEFAULT 1,
  checksum VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, data_type)
);

-- Historial de cambios
CREATE TABLE data_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  data_type VARCHAR(50) NOT NULL,
  old_data JSONB,
  new_data JSONB NOT NULL,
  change_type VARCHAR(50) NOT NULL,
  changed_at TIMESTAMP DEFAULT NOW(),
  client_info JSONB
);

-- Backups
CREATE TABLE backups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  backup_data JSONB NOT NULL,
  backup_type VARCHAR(50) DEFAULT 'auto',
  checksum VARCHAR(255) NOT NULL,
  size_bytes INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB
);

-- Sesiones activas
CREATE TABLE active_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  client_type VARCHAR(50),
  client_version VARCHAR(50),
  last_sync TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_app_data_user_type ON app_data(user_id, data_type);
CREATE INDEX idx_data_history_user_time ON data_history(user_id, changed_at DESC);
CREATE INDEX idx_backups_user_time ON backups(user_id, created_at DESC);
CREATE INDEX idx_sessions_user_active ON active_sessions(user_id, is_active);
```

---

## 🛠️ PASO 2: CONFIGURAR VARIABLES DE ENTORNO

1. Ve a la carpeta `backend/`
2. Copia el archivo `.env.example` a `.env`:
   ```bash
   copy .env.example .env
   ```

3. Edita `.env` y completa:

```env
PORT=3000
JWT_SECRET=cualquier_cadena_larga_y_aleatoria_aqui_2026
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu-clave-anon
SUPABASE_SERVICE_ROLE_KEY=tu-clave-service-role
ENCRYPTION_KEY=otra_cadena_aleatoria_para_encriptacion
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
NODE_ENV=production
```

**⚠️ IMPORTANTE:**
- `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` los obtienes de Supabase > Settings > API
- `JWT_SECRET` y `ENCRYPTION_KEY` pueden ser cualquier cadena larga y aleatoria

---

## 🛠️ PASO 3: DESPLEGAR EN RENDER.COM (GRATIS)

### Opción A: Despliegue Automático (Recomendado)

1. Ve a https://render.com y crea una cuenta
2. Haz clic en **New +** > **Blueprint**
3. Conecta tu repositorio de GitHub (o sube el proyecto)
4. Render leerá automáticamente el archivo `render.yaml`
5. Completa las variables de entorno que faltan
6. Haz clic en **Apply**

### Opción B: Despliegue Manual

1. En Render.com, clic en **New +** > **Web Service**
2. Conecta tu repositorio
3. Configura:
   - **Name**: bembe-server
   - **Environment**: Node
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: Free

4. Agrega las variables de entorno (todas las del `.env`)

5. Haz clic en **Create Web Service**

### Una vez desplegado:

Render te dará una URL como: `https://bembe-server-xxxx.onrender.com`

**Copia esta URL** - la necesitaras en el siguiente paso.

---

## 🛠️ PASO 4: CONFIGurar LA APP PWA

1. Abre el archivo `CODIGO OK.html` en un editor de texto

2. Busca la línea (aproximadamente línea 250):
   ```javascript
   const SERVER_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000' : window.location.origin;
   ```

3. Reemplázala con la URL de Render:
   ```javascript
   const SERVER_URL = 'https://bembe-server-xxxx.onrender.com';
   ```

4. Guarda el archivo

---

## 🛠️ PASO 5: INSTALAR LA APP EN PC Y MÓVIL

### En PC:

1. Abre `CODIGO OK.html` en tu navegador (Chrome/Edge recomendado)
2. Verás la pantalla de login
3. Crea una cuenta nueva o usa modo offline
4. Para instalar:
   - **Chrome/Edge**: Clic en ícono de instalar (aparece en la barra de dirección)
   - O menú > **Instalar BEMBE**

### En Android:

**Opción 1: Usar la app Android existente**
- La app `BEMBE-Android-App` ya funciona con WebView
- Solo actualiza la URL del servidor en `MainActivity.java`

**Opción 2: Usar PWA directamente**
1. Abre la URL del servidor en Chrome
2. Menú > **Agregar a pantalla de inicio**
3. Se instalará como app nativa

### En iOS:

1. Abre Safari y ve a la URL
2. Botón compartir > **Agregar a inicio**
3. Funcionará como app nativa

---

## 🔄 SINCRONIZACIÓN AUTOMÁTICA

### ¿Cómo funciona?

1. **En PC**: Haces cambios → Se guardan localmente → Se suben al servidor automáticamente (cada 5 min)
2. **En Móvil**: Abres la app → Se sincroniza con el servidor → Tiene los datos actualizados
3. **Sin Internet**: Los datos se guardan localmente → Se sincronizan cuando hay conexión

### Indicadores de sincronización:

- 🟢 **Conectado**: Sincronizado con el servidor
- 🔵 **Sincronizando**: Subiendo/bajando datos
- 🔴 **Error**: Problema de sincronización
- ⚪ **Modo Offline**: Sin conexión a internet

### Sincronización manual:

- Ve a **Configuración** > **🔄 Sincronizar Ahora**

---

## 🔒 SEGURIDAD IMPLEMENTADA

### Backend:
- ✅ Autenticación JWT con tokens de 30 días
- ✅ Contraseñas encriptadas con bcrypt (12 rounds)
- ✅ Rate limiting (100 solicitudes/15 min)
- ✅ Helmet.js para headers de seguridad HTTPS
- ✅ CORS configurado
- ✅ Validación de datos con express-validator
- ✅ Compresión gzip

### Frontend:
- ✅ Token almacenado seguro en localStorage
- ✅ Saneamiento de XSS
- ✅ Checksums SHA-256 para integridad
- ✅ Validación de datos antes de enviar
- ✅ Service Worker con seguridad

### Base de datos:
- ✅ PostgreSQL con Supabase
- ✅ Restricciones de clave foránea
- ✅ Índices optimizados
- ✅ Backups automáticos

---

## 💾 BACKUPS Y RECUPERACIÓN

### Automáticos:
- Se crean cada 5 minutos cuando hay conexión
- Se almacenan en Supabase con checksum
- Rotación automática (7 días)

### Manuales:
- **Exportar BD**: Configuración > 📥 Exportar BD
- **Importar BD**: Configuración > 📤 Importar BD
- **Restaurar**: Configuración > 💾 Restaurar Respaldo

---

## 🚀 PRUEBA RÁPIDA

1. **Crear cuenta**:
   - Abre la app
   - Clic en "Crear Cuenta"
   - Ingresa email y contraseña

2. **Agregar alumno**:
   - Usa "Agregar Rápido"
   - Los datos se guardan localmente

3. **Sincronizar**:
   - Clic en "Sincronizar Ahora"
   - Verás "Conectado" en verde

4. **Probar en otro dispositivo**:
   - Abre la app en otro dispositivo
   - Inicia sesión con la misma cuenta
   - ¡Los datos aparecerán automáticamente!

---

## 📱 ACTUALIZACIONES AUTOMÁTICAS

### ¿Cómo funcionan?

1. Modificas `CODIGO OK.html` o el código del servidor
2. Haces deploy a Render
3. La próxima vez que un usuario abra la app:
   - El Service Worker detecta la nueva versión
   - Muestra: "Nueva versión disponible. ¿Actualizar ahora?"
   - Al aceptar, se actualiza automáticamente
   - ¡PC y móvil se actualizan al mismo tiempo!

### Para forzar actualización:

- PC: Ctrl + F5
- Móvil: Borrar caché del navegador o reinstallar PWA

---

## 🎯 CARACTERÍSTICAS MANTENIDAS

**TODO el código original funciona exactamente igual:**
- ✅ Calendario y asistencia
- ✅ Profesores
- ✅ Alumnos y abonos
- ✅ Alquileres y deudores
- ✅ Horario semanal
- ✅ Dashboard
- ✅ Precios configurables
- ✅ Import/Export
- ✅ Internacionalización (ES/RU/EN)
- ✅ Fondo de estrellas animado
- ✅ Todas las modales

**MÁS las nuevas funciones:**
- ✅ Login/Registro
- ✅ Sincronización automática
- ✅ Persistencia en la nube
- ✅ Actualizaciones automáticas
- ✅ Multi-dispositivo sincronizado
- ✅ Indicadores de estado sync
- ✅ Toasts de notificación

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### "Error de sincronización"
- Verifica que el servidor en Render esté activo (puede tardar 1-2 min en despertar en plan gratuito)
- Revisa las variables de entorno

### "Token expirado"
- Inicia sesión nuevamente
- Los tokens duran 30 días

### "Modo Offline"
- Sin problema - funciona normal
- Se sincronizará cuando haya internet

### La app no se instala
- Usa Chrome o Edge
- Verifica que estás en HTTPS (no file://)
- Para pruebas locales, usa: `python -m http.server 8080`

---

## 📞 SOPORTE

- Documentación completa en este archivo
- Revisa logs del navegador (F12) para errores
- Logs del servidor en Render.com > Logs

---

## ✅ CHECKLIST FINAL

- [ ] Base de datos Supabase creada
- [ ] Tablas SQL creadas
- [ ] Variables .env configuradas
- [ ] Servidor desplegado en Render.com
- [ ] URL del servidor configurada en CODIGO OK.html
- [ ] App probada en PC
- [ ] App probada en móvil
- [ ] Sincronización verificada entre dispositivos
- [ ] Backup automático funcionando

---

**✦ BEMBE v3.0.0 - Sistema completo con sincronización en la nube ✦**

*Desarrollado con: Node.js, Express, Supabase, JWT, PWA, Service Workers*
