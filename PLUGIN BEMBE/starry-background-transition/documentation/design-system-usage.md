# 📚 Guía de Uso del Sistema de Diseño Consistente

## 1. Instalación
1. Copia el archivo `assets/css/design-system.css` al directorio `assets/css/`
2. Incluye el CSS en todas las páginas que necesiten diseño consistente:
   ```html
   <link rel="stylesheet" href="assets/css/design-system.css">
   ```

## 2. Componentes Principales

### Formularios
- Usa la clase `.form-container` como contenedor principal
- Usa `.form-title` para títulos de formularios
- Usa `.form-group` para grupos de campos
- Usa `.btn` para botones, con modificadores:
  - `.btn-primary`: Botón principal
  - `.btn-secondary`: Botón secundario
  - `.btn-danger`: Botón de error

### Login/Register
- Usa `.login-register-container` como contenedor principal
- Usa `.login-card` como tarjeta principal
- Usa `.login-header` para encabezado
- Usa `.login-body` para cuerpo del formulario
- Usa `.login-footer` para pie de página

### Dashboard
- Usa `.dashboard-container` como contenedor principal
- Usa `.dashboard-sidebar` para barra lateral
- Usa `.main-content` para contenido principal
- Usa `.page-title` para títulos de páginas
- Usa `.page-header` y `.page-content` para secciones de contenido

## 3. Personalización
Puedes personalizar el sistema editando las variables CSS en `:root`:
```css
:root {
  --primary-color: #4a90e2;
  --secondary-color: #50c878;
  --text-color: #333333;
  --bg-color: #ffffff;
  --border-color: #e0e0e0;
}
```

## 4. Pruebas
Para verificar que el diseño funciona correctamente:
1. Abre los archivos de ejemplo en diferentes navegadores
2. Prueba en diferentes tamaños de pantalla (responsive)
3. Verifica el acceso a través de lectores de pantalla
4. Comprueba el contraste de colores

## 5. Mantenimiento
- Actualiza el sistema cuando cambies de tema o diseño
- Añade nuevos componentes según necesidades
- Documenta cualquier cambio importante
- Verifica accesibilidad regularmente

## 6. Soporte
Si tienes problemas con el sistema de diseño:
- Revisa la documentación
- Consulta los archivos de ejemplo
- Contacta al equipo de desarrollo si necesitas ayuda adicional