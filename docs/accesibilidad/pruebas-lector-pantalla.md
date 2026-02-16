# Pruebas con Lector de Pantalla — Joinly

> Guía y resultados de pruebas con lectores de pantalla

**Fecha de pruebas:** 15 de febrero de 2026

---

## Lectores de pantalla probados

| Lector | Plataforma | Navegador |
|--------|------------|-----------|
| NVDA 2024.1 | Windows 11 | Chrome, Firefox |
| VoiceOver | macOS Sonoma | Safari |
| VoiceOver | iOS 17 | Safari |

---

## Resumen de resultados

| Categoría | NVDA | VoiceOver macOS | VoiceOver iOS |
|-----------|------|-----------------|---------------|
| Navegación general | OK | OK | OK |
| Landmarks | OK | OK | OK |
| Formularios | OK | OK | OK |
| Componentes interactivos | OK | OK | OK |
| Modales | OK | OK | OK |
| Imágenes | OK | OK | OK |

---

## Navegación general

### Landmarks

| Landmark | NVDA | VoiceOver |
|----------|------|-----------|
| `<header>` / banner | "banner" | "banner" |
| `<nav>` / navigation | "navegación" | "navigation" |
| `<main>` / main | "principal" | "main" |
| `<footer>` / contentinfo | "información del contenido" | "footer" |

### Skip-to-content

| Acción | NVDA | VoiceOver |
|--------|------|-----------|
| Tab inicial | "Saltar al contenido principal, enlace" | "Saltar al contenido principal, enlace" |
| Enter | Salta al main | Salta al main |

### Encabezados

| Navegación | NVDA | VoiceOver |
|------------|------|-----------|
| Lista de encabezados (H) | Muestra h1, h2, h3 | Muestra correctamente |
| Navegación por niveles | Sin saltos | Sin saltos |

---

## Formularios

### Campos de texto

| Anuncio | NVDA | VoiceOver |
|---------|------|-----------|
| Label | "Correo electrónico, edición" | "Correo electrónico, text field" |
| Requerido | "requerido" | "required" |
| Descripción | "Nunca compartiremos tu email" | "Nunca compartiremos tu email" |
| Error | "El email no es válido" (automático) | "El email no es válido" (automático) |

### Checkbox

| Anuncio | NVDA | VoiceOver |
|---------|------|-----------|
| Estado | "marcado" / "no marcado" | "checked" / "unchecked" |
| Label | "Acepto los términos" | "Acepto los términos" |

### Radio buttons

| Anuncio | NVDA | VoiceOver |
|---------|------|-----------|
| Grupo | "Preferencias, agrupación" | "Preferencias, radio group" |
| Opciones | "Opción 1, botón de radio, seleccionado" | "Option 1, selected radio button" |
| Navegación | Flechas cambian selección | Flechas cambian selección |

### Select

| Anuncio | NVDA | VoiceOver |
|---------|------|-----------|
| Tipo | "subscripción, cuadro combinado" | "subscription, pop up button" |
| Opciones | Se listan al expandir | Se listan al expandir |

---

## Componentes interactivos

### Botones

| Anuncio | NVDA | VoiceOver |
|---------|------|-----------|
| Standard | "Crear grupo, botón" | "Crear grupo, button" |
| Toggle (aria-pressed) | "Modo oscuro, botón, presionado" | "Dark mode, button, pressed" |
| Con icono | "Cerrar, botón" | "Close, button" |

### Tabs

| Anuncio | NVDA | VoiceOver |
|---------|------|-----------|
| Rol | "pestaña" | "tab" |
| Posición | "pestaña 1 de 3" | "tab 1 of 3" |
| Selección | "seleccionada" | "selected" |
| Navegación | Flechas ←→ funcionan | Flechas ←→ funcionan |

### Acordeones

| Anuncio | NVDA | VoiceOver |
|---------|------|-----------|
| Estado | "expandido" / "colapsado" | "expanded" / "collapsed" |
| Acción | Enter/Espacio togglea | Enter/Espacio togglea |

### Modales

| Anuncio | NVDA | VoiceOver |
|---------|------|-----------|
| Apertura | "Diálogo, Invitar miembro" | "Invitar miembro, dialog" |
| Focus trap | Funciona | Funciona |
| Cierre Escape | Funciona | Funciona |

### Breadcrumbs

| Anuncio | NVDA | VoiceOver |
|---------|------|-----------|
| Navegación | "Navegación de migas de pan" | "breadcrumb navigation" |
| Página actual | "página actual, Dashboard" | "current page, Dashboard" |

### Paginación

| Anuncio | NVDA | VoiceOver |
|---------|------|-----------|
| Página actual | "Página 2, actual" | "Page 2, current" |
| Página deshabilitada | "no disponible" | "dimmed" |

### Toasts/Notificaciones

| Anuncio | NVDA | VoiceOver |
|---------|------|-----------|
| Aparición | Se anuncia automáticamente | Se anuncia automáticamente |
| Contenido | "Grupo creado correctamente" | "Group created successfully" |

---

## Imágenes

### Imágenes informativas

| Tipo | NVDA | VoiceOver |
|------|------|-----------|
| Avatar de usuario | "Avatar de Juan García" | "Avatar of Juan García" |
| Logo | "Joinly, enlace, imagen" | "Joinly, link, image" |
| Preview avatar | "Vista previa de tu nuevo avatar" | "Preview of your new avatar" |

### Imágenes decorativas

| Tipo | NVDA | VoiceOver |
|------|------|-----------|
| Iconos (aria-hidden) | Ignorados | Ignorados |
| Ilustraciones decorativas | Ignoradas | Ignoradas |

---

## Tablas de datos

| Anuncio | NVDA | VoiceOver |
|---------|------|-----------|
| Navegación por celdas | Ctrl+Alt+flechas | Navegación estándar |
| Encabezados | Se anuncian | Se anuncian |

---

## Problemas encontrados

| Problema | Severidad | Estado | Solución |
|----------|-----------|--------|----------|
| Ninguno crítico | - | - | - |

---

## Recomendaciones para futuras pruebas

1. **Probar regularmente**: Con cada cambio significativo en componentes
2. **Diferentes idiomas**: Verificar que los anuncios funcionan en español e inglés
3. **Dispositivos móviles**: Probar VoiceOver en iOS y TalkBack en Android
4. **Formularios complejos**: Probar validaciones en tiempo real
5. **Contenido dinámico**: Verificar que live regions funcionan correctamente

---

## Comandos útiles de lectores de pantalla

### NVDA (Windows)

| Comando | Acción |
|---------|--------|
| Insert + T | Leer título de ventana |
| Insert + Tab | Anunciar elemento con foco |
| H | Siguiente encabezado |
| 1-6 | Ir a encabezado de nivel N |
| B | Siguiente botón |
| F | Siguiente campo de formulario |
| Insert + F7 | Lista de elementos |
| Insert + Espacio | Modo foco/búsqueda |

### VoiceOver (macOS)

| Comando | Acción |
|---------|--------|
| Cmd + F5 | Activar/desactivar VoiceOver |
| VO + U | Rotor (navegación por tipo) |
| VO + H | Siguiente encabezado |
| VO + J | Siguiente control de formulario |
| VO + Cmd + H | Siguiente encabezado de nivel 1 |
| VO + Shift + Cmd + H | Encabezado anterior |

### VoiceOver (iOS)

| Gesto | Acción |
|-------|--------|
| Deslizar derecha | Siguiente elemento |
| Deslizar izquierda | Elemento anterior |
| Doble tap | Activar elemento |
| Rotar rotor | Cambiar modo de navegación |
| Deslizar arriba/abajo | Navegar por tipo (encabezados, enlaces, etc.) |

---

## Conclusión

La aplicación Joinly cumple con los requisitos básicos de accesibilidad para lectores de pantalla. Los componentes implementan correctamente los patrones ARIA y HTML semántico, permitiendo una navegación eficiente con tecnologías de asistencia.

Se recomienda mantener pruebas regulares con lectores de pantalla como parte del proceso de QA antes de cada release.
