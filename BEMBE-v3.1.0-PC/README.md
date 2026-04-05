# ✦ BEMBE v3.1.0 ✦ - Sistema de Gestión de Escuela de Danza

## 📦 PAQUETE COMPLETO PARA DISTRIBUCIÓN

Este paquete contiene todo lo necesario para instalar y ejecutar BEMBE en cualquier PC.

---

## 🚀 INSTALACIÓN RÁPIDA

### Opción 1: Instalación Automática
1. Ejecuta `INSTALAR.bat`
2. Se creará un acceso directo en tu escritorio
3. Abre BEMBE desde el acceso directo

### Opción 2: Manual
1. Abre `CODIGO OK.html` en tu navegador (Chrome/Edge recomendado)
2. ¡Listo! La app funciona inmediatamente

---

## ✨ CARACTERÍSTICAS v3.1.0

### Sincronización en la Nube ☁️
- **Automática** cada 5 minutos
- **Multi-dispositivo**: PC ↔ Móvil sincronizados
- **Backups automáticos** en servidor gratuito
- **Modo offline** funcional sin internet

### Interfaz Mejorada 🎨
- **Logo institucional** en esquina superior izquierda
- **Horario completo de 7 días**:
  - Lunes a Viernes: Clases regululares
  - Sábado: Práctica Libre (10:00-12:00)
  - Domingo: Clase Especial (18:00-20:00)

### Funcionalidades Completas
- ✅ **79 funciones totales** (72 originales + 7 de sync)
- ✅ Calendario con asistencia
- ✅ Gestión de alumnos y profesores
- ✅ Alquileres y deudores
- ✅ Horario semanal editable
- ✅ Dashboard con estadísticas
- ✅ Import/Export con seguridad
- ✅ Internacionalización (ES/RU/EN)

### Backend Incluido 🔧
- Servidor Node.js completo
- API REST con 18 endpoints
- Autenticación JWT
- Base de datos Supabase (PostgreSQL gratuito)

---

## 📂 ESTRUCTURA DEL PAQUETE

```
BEMBE-v3.1.0-PC/
├── CODIGO OK.html          # Aplicación principal
├── INCONO-BEMBE.png        # Logo institucional
├── INSTALAR.bat            # Instalación automática
├── README.md               # Este archivo
│
├── Documentacion/
│   ├── GUIA_COMPLETA_DESPLIEGUE.md
│   ├── CAMBIOS_REALIZADOS.md
│   ├── RESUMEN_FINAL.md
│   └── VERIFICACION_FINAL.md
│
├── backend/                # Servidor Node.js
│   ├── server.js
│   ├── package.json
│   ├── routes/
│   ├── middleware/
│   └── utils/
│
└── frontend/               # Archivos PWA
    ├── manifest.json
    └── sw.js
```

---

## ☁️ ACTIVAR SINCRONIZACIÓN EN LA NUBE

### Paso 1: Crear Base de Datos (5 min)
1. Ve a https://supabase.com
2. Crea cuenta gratuita
3. Crea proyecto "bembe"
4. Ejecuta el SQL de `GUIA_COMPLETA_DESPLIEGUE.md`

### Paso 2: Desplegar Servidor (10 min)
1. Ve a https://render.com
2. Crea cuenta gratuita
3. Sube la carpeta `backend/`
4. Configura variables de entorno

### Paso 3: Activar en App (1 min)
1. Abre BEMBE
2. Ve a **Configuración**
3. Clic en **"📝 Crear Cuenta Nube"**
4. Email + contraseña
5. ✅ ¡Sincronización activada!

---

## 🔧 SERVIDOR LOCAL (Opcional)

Si quieres ejecutar el servidor en tu PC para pruebas:

```bash
cd backend
npm install
npm start
```

El servidor estará disponible en: **http://localhost:3000**

---

## 📱 VERSIÓN ANDROID

El APK para Android se encuentra en:
```
D:\ESCUELA BEMBE\BEMBE-PC\BEMBE-Android-App\
```

Para compilar:
1. Abre Android Studio
2. Abre el proyecto `BEMBE-Android-App`
3. Build > Generate Signed Bundle / APK
4. O ejecuta `build-apk.bat`

---

## 🌐 IDIOMAS

BEMBE está disponible en:
- 🇪🇸 **Español** (predeterminado)
- 🇷🇺 **Русский** (Ruso)
- 🇬🇧 **English** (Inglés)

Clic en los botones ES/RU/EN en la esquina superior derecha.

---

## 🔒 SEGURIDAD

- ✅ Autenticación JWT con tokens de 30 días
- ✅ Contraseñas encriptadas con bcrypt
- ✅ Rate limiting (100 solicitudes/15 min)
- ✅ Headers HTTPS (Helmet.js)
- ✅ Checksums SHA-256 para integridad
- ✅ Validación de datos anti-XSS

---

## 💾 PERSISTENCIA

### Capas de almacenamiento:
1. **localStorage** del navegador (inmediato)
2. **Supabase PostgreSQL** en la nube (sincronizado)
3. **Backups automáticos** cada 5 minutos
4. **Export/Import** manual con JSON

---

## 📊 ESTADÍSTICAS DEL PROYECTO

| Métrica | Valor |
|---------|-------|
| **Líneas de código** | ~2,800+ (HTML) + ~1,200+ (Backend) |
| **Funciones totales** | 79 |
| **Endpoints API** | 18 |
| **Tablas de BD** | 5 |
| **Idiomas** | 3 (ES/RU/EN) |
| **Archivos del paquete** | 3,240+ |
| **Costo mensual** | $0 (servidor + BD gratuitos) |

---

## 🎯 HORARIO SEMANAL

| Día | Horario | Clase |
|---|---|---|
| **Lunes** | 20:00, 21:00 | Porasino |
| **Martes** | 20:00, 21:00 | Afro |
| **Miércoles** | 20:00, 21:00 | Salsa |
| **Jueves** | 20:00, 21:00 | Cursos |
| **Viernes** | 20:00, 21:00 | Cursos |
| **Sábado** | 10:00, 11:00 | Práctica Libre |
| **Domingo** | 18:00-20:00 | Clase Especial |

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### La app no abre
- Usa Chrome o Edge
- Verifica que el archivo `CODIGO OK.html` no esté corrupto
- Intenta con doble clic o arrastrar al navegador

### Error de sincronización
- Verifica que tengas cuenta en la nube
- Revisa tu conexión a internet
- Consulta `GUIA_COMPLETA_DESPLIEGUE.md`

### Los datos no se guardan
- Verifica el almacenamiento local del navegador
- Exporta tus datos regularmente como backup

---

## 📞 SOPORTE

- **Web**: https://bembespb.ru
- **Email**: contacto@bembespb.ru
- **Teléfono**: +79111139958

---

## 📄 LICENCIA

Este software es propiedad de Escuela Bembe.
Todos los derechos reservados.

---

## ✅ CHECKLIST DE INSTALACIÓN

- [ ] Paquete descargado y extraído
- [ ] `INSTALAR.bat` ejecutado (o manual)
- [ ] Acceso directo creado en escritorio
- [ ] App abierta y funcionando
- [ ] Datos de prueba agregados
- [ ] (Opcional) Cuenta en la nube creada
- [ ] (Opcional) Sincronización activada

---

**✦ BEMBE v3.1.0 ✦**

*Sistema completo con sincronización en la nube*

*Fecha de lanzamiento: 5 de abril de 2026*

---

*¡Gracias por usar BEMBE!* 🎉
