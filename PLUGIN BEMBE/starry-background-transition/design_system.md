# 🎨 Sistema de Diseño Consistente

## 1. Principios Fundamentales
- **Consistencia visual**: Colores, tipografía y espaciado uniformes
- **Jerarquía clara**: Elementos visuales bien organizados
- **Accesibilidad**: Contraste adecuado, soporte para lectores de pantalla
- **Responsive**: Funciona en todos los dispositivos

## 2. Colores Base
```css
:root {
  --primary-color: #4a90e2;
  --secondary-color: #50c878;
  --danger-color: #e74c3c;
  --warning-color: #f39c12;
  --success-color: #2ecc71;
  --text-color: #333333;
  --bg-color: #ffffff;
  --border-color: #e0e0e0;
  --shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}
```

## 3. Tipografía
```css
body {
  font-family: 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif;
  font-size: 16px;
  line-height: 1.6;
}

h1, h2, h3, h4, h5, h6 {
  font-weight: 600;
  color: var(--text-color);
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}

h1 { font-size: 2.5rem; }
h2 { font-size: 2rem; }
h3 { font-size: 1.75rem; }
h4 { font-size: 1.5rem; }
h5 { font-size: 1.25rem; }
h6 { font-size: 1rem; }
```

## 4. Componentes de Formulario
### Formulario General
```css
.form-container {
  max-width: 500px;
  margin: 0 auto;
  padding: 2rem;
  background: var(--bg-color);
  border-radius: 8px;
  box-shadow: var(--shadow);
  border: 1px solid var(--border-color);
}

.form-title {
  text-align: center;
  margin-bottom: 1.5rem;
  color: var(--primary-color);
}

.form-group {
  margin-bottom: 1.2rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-color);
}

input[type="text"],
input[type="email"],
input[type="password"],
textarea,
select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

input:focus,
textarea:focus,
select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
}

.btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  text-align: center;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-secondary {
  background: var(--secondary-color);
  color: white;
}

.btn-danger {
  background: var(--danger-color);
  color: white;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.btn:active {
  transform: translateY(0);
}

/* Estado de error */
.input-error {
  border-color: var(--danger-color) !important;
}

.error-message {
  color: var(--danger-color);
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: none;
}

.input-error + .error-message {
  display: block;
}

/* Estado de éxito */
.input-success {
  border-color: var(--success-color) !important;
}
```

## 5. Diseño de Login/Register
### Layout Principal
```css
.login-register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  padding: 2rem;
}

.login-card {
  width: 100%;
  max-width: 450px;
  background: var(--bg-color);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.login-header {
  background: var(--primary-color);
  color: white;
  padding: 2rem;
  text-align: center;
}

.login-body {
  padding: 2rem;
}

.login-footer {
  background: var(--bg-color);
  border-top: 1px solid var(--border-color);
  padding: 1.5rem;
  text-align: center;
  font-size: 0.9rem;
  color: var(--text-color);
}

.login-footer a {
  color: var(--primary-color);
  text-decoration: none;
}

.login-footer a:hover {
  text-decoration: underline;
}
```

## 6. Diseño de Dashboard
### Layout Principal
```css
.dashboard-container {
  min-height: 100vh;
  background: var(--bg-color);
  font-family: 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif;
}

.dashboard-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 250px;
  height: 100vh;
  background: var(--primary-color);
  color: white;
  padding: 2rem 1rem;
  box-shadow: 2px 0 6px rgba(0, 0, 0, 0.1);
}

.sidebar-logo {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 2rem;
  text-align: center;
}

.sidebar-nav {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar-nav li {
  margin-bottom: 0.5rem;
}

.sidebar-nav a {
  display: block;
  padding: 0.75rem 1rem;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.sidebar-nav a:hover,
.sidebar-nav a.active {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.sidebar-nav a.active {
  font-weight: 600;
}

.main-content {
  margin-left: 250px;
  padding: 2rem;
  min-height: 100vh;
}

.page-title {
  margin-bottom: 1.5rem;
  color: var(--primary-color);
}

.page-header {
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: var(--shadow);
}

.page-content {
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: var(--shadow);
}

.page-footer {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
  text-align: center;
  color: #666;
  font-size: 0.9rem;
}
```

## 7. Uso del Sistema
1. Incluir el CSS en todas las páginas:
   ```html
   <link rel="stylesheet" href="assets/css/design-system.css">
   ```
2. Usar las clases en los elementos HTML:
   ```html
   <div class="form-container">
     <h2 class="form-title">Iniciar sesión</h2>
     <form>
       <div class="form-group">
         <label for="email">Correo electrónico</label>
         <input type="email" id="email" name="email" class="form-control">
       </div>
       <button type="submit" class="btn btn-primary">Iniciar sesión</button>
     </form>
   </div>
   ```

## 8. Mantenimiento
- Actualizar colores en `:root` para cambios de tema
- Añadir nuevas clases según necesidades
- Documentar nuevos componentes en este archivo
- Verificar accesibilidad con herramientas como Lighthouse