# Plan de Implementación de Accesibilidad — Joinly

> **Objetivo:** Cumplir WCAG 2.1 nivel AA al 100% y completar todos los puntos del [checklist de accesibilidad](../accesibilidad/orbita5.8-checklist.md).
>
> **Fecha de creación:** 15 de febrero de 2026
>
> **Estado actual:** La aplicación tiene una excelente base de accesibilidad (8.5/10 según auditoría). Este plan cubre las brechas restantes para alcanzar la conformidad total.

---

## Resumen del estado actual

### ✅ Ya implementado correctamente
- `lang="es"` en `<html>`
- Landmarks: `<header>`, `<nav>` (con `aria-label`), `<main>`, `<footer>`
- ARIA extensivo: 100+ atributos (`aria-label`, `aria-expanded`, `aria-controls`, `aria-pressed`, etc.)
- Modales con focus trap, cierre con Escape, `role="dialog"`, `aria-modal="true"`
- Formularios: `<label>` asociado a cada `<input>`, `aria-required`, `aria-invalid`, `aria-describedby`
- `<fieldset>` + `<legend>` en grupos de radio/checkbox
- Live regions: `aria-live="polite"` en toasts, `role="alert"` en errores, `role="status"` en estados
- Tabs con `role="tablist"` / `role="tab"` / `role="tabpanel"` y roving tabindex
- Breadcrumbs con `aria-current="page"`
- Paginación con `aria-label`, `aria-current`, `aria-disabled`
- Imágenes con `[alt]` dinámico, `loading="lazy"`, `decoding="async"`
- `:focus-visible` global con outline de 3px
- `prefers-reduced-motion: reduce` en reset
- `forced-colors: active` parcial (header)
- Clases `.visually-hidden` y `.u-visually-hidden`
- Todas las rutas con `title` en Angular Router
- Tema oscuro completo con CSS custom properties
- Tamaño mínimo táctil de 44px (`--tamano-minimo-tactil: 2.75rem`)
- Sin `tabindex` positivos (no hay trampas de teclado)
- Sin `<video>`, `<audio>` ni `<iframe>` (multimedia no aplica actualmente)

### ❌ Brechas detectadas
- Skip-to-content link sin implementar en HTML
- 13 páginas con `<main>` anidado (solo debe haber 1 por página)
- 5 páginas sin `<h1>` (login, register, crear-grupo, unirse-grupo, crear-suscripción)
- `outline: none` en form controls sin `:focus-visible` compensatorio en algunos componentes
- Clase `u-sr-only` usada pero no definida en SCSS
- `role="main"` redundante en `not-found.html`
- `alt="Preview"` genérico en avatar de perfil
- Sin tests automatizados de accesibilidad
- Contraste sin verificar empíricamente
- Sin pruebas con lector de pantalla documentadas
- Lighthouse Accessibility score no medido

---

## Fase 1 — Correcciones críticas de HTML semántico
> **Prioridad:** 🔴 Crítica | **WCAG:** 1.3.1, 2.4.1, 4.1.1
> **Esfuerzo estimado:** 2-3 horas

### 1.1 — Implementar skip-to-content link
**WCAG 2.4.1 — Bypass Blocks**

- [ ] Añadir enlace de salto al contenido al inicio de `app.html`, antes del `<app-header>`:
  ```html
  <a href="#contenido-principal" class="c-skip-link">Saltar al contenido</a>
  ```
- [ ] Verificar que el `id="contenido-principal"` ya existe en el `<main>` de `app.html` (ya existe en L12)
- [ ] Verificar que los estilos de `.c-skip-link` en `app.scss` funcionan correctamente (se oculta visualmente y aparece al recibir foco con teclado)
- [ ] Probar con teclado: al pulsar Tab en la página, el primer foco debe ser el skip link
- [ ] Comprobar que al pulsar Enter, el foco salta al `<main>`

**Archivos a modificar:**
- `frontend/src/app/app.html`

---

### 1.2 — Eliminar `<main>` anidados (solo 1 por página)
**WCAG 4.1.1 — Parsing / HTML válido**

El `<main>` raíz en `app.html` ya envuelve el `<router-outlet>`. Las páginas hijas NO deben tener su propio `<main>`, porque genera anidamiento inválido.

- [ ] **`home.html` L1** — Cambiar `<main class="p-home">` → `<div class="p-home">`  
  (o `<section>` si tiene aria-labelledby)
- [ ] **`dashboard.html` L1** — Cambiar `<main class="p-dashboard">` → `<div class="p-dashboard">`
- [ ] **`login.html` L1** — Cambiar `<main>` → `<div>` o `<section>`
- [ ] **`register.html` L1** — Cambiar `<main>` → `<div>` o `<section>`
- [ ] **`crear-grupo.html` L1** — Cambiar `<main>` → `<div>` o `<section>`
- [ ] **`unirse-grupo.html` L1** — Cambiar `<main>` → `<div>` o `<section>`
- [ ] **`crear-suscripcion.html` L1** — Cambiar `<main>` → `<div>` o `<section>`
- [ ] **`grupo-detalle.html` L1** — Cambiar `<main>` → `<div>` o `<section>`
- [ ] **`usuario-layout.html` L52** — Cambiar `<main>` → `<div>` o `<section>`
- [ ] **`style-guide.html` L1** — Cambiar `<main>` → `<div>` o `<section>`
- [ ] **`responsive-test.html` L1** — Cambiar `<main>` → `<div>` o `<section>`
- [ ] **`navigation-guide.html` L51** — Cambiar `<main>` → `<div>` o `<section>`
- [ ] Considerar si `layout/main/main.html` (que no se usa) debe eliminarse o ajustarse
- [ ] Validar HTML con el validador W3C (https://validator.w3.org/) tras los cambios

**Archivos a modificar:**
- `frontend/src/app/pages/home/home.html`
- `frontend/src/app/pages/dashboard/dashboard.html`
- `frontend/src/app/pages/auth/login/login.html`
- `frontend/src/app/pages/auth/register/register.html`
- `frontend/src/app/pages/crear-grupo/crear-grupo.html`
- `frontend/src/app/pages/unirse-grupo/unirse-grupo.html`
- `frontend/src/app/pages/crear-suscripcion/crear-suscripcion.html`
- `frontend/src/app/pages/grupo-detalle/grupo-detalle.html`
- `frontend/src/app/pages/usuario/usuario-layout.html`
- `frontend/src/app/pages/style-guide/style-guide.html`
- `frontend/src/app/pages/style-guide/responsive-test/responsive-test.html`
- `frontend/src/app/pages/style-guide/navigation-guide/navigation-guide.html`

---

### 1.3 — Asegurar un `<h1>` por cada página
**WCAG 1.3.1 — Info and Relationships**

Las siguientes páginas carecen de `<h1>`. Cada página debe tener exactamente un `<h1>` que describa su contenido principal.

- [ ] **`login.html`** — Añadir `<h1 class="u-visually-hidden">Iniciar sesión</h1>` como primer hijo del contenedor, o convertir el `<h2>` del `form-card` en `<h1>`
- [ ] **`register.html`** — Añadir `<h1 class="u-visually-hidden">Crear cuenta</h1>` o ajustar `form-card`
- [ ] **`crear-grupo.html`** — Añadir `<h1 class="u-visually-hidden">Crear grupo</h1>` o ajustar `form-card`
- [ ] **`unirse-grupo.html`** — Añadir `<h1 class="u-visually-hidden">Unirse a grupo</h1>` o ajustar `form-card`
- [ ] **`crear-suscripcion.html`** — Añadir `<h1 class="u-visually-hidden">Crear suscripción</h1>` o ajustar `form-card`
- [ ] **`style-guide.html`** — Añadir `<h1>` (aquí puede ser visible: "Guía de estilos")
- [ ] Verificar que NO haya más de un `<h1>` visible por página en ninguna ruta
- [ ] Revisar la jerarquía de encabezados: después de `<h1>` → `<h2>` → `<h3>` (sin saltos)

> **Decisión de diseño:** Se recomienda usar `<h1 class="u-visually-hidden">` cuando el título ya aparece visualmente dentro del `form-card` como `<h2>`. Alternativa: refactorizar `form-card` para aceptar un `@Input() headingLevel` que permita renderizar el título como `<h1>` o `<h2>` según el contexto.

**Archivos a modificar:**
- `frontend/src/app/pages/auth/login/login.html`
- `frontend/src/app/pages/auth/register/register.html`
- `frontend/src/app/pages/crear-grupo/crear-grupo.html`
- `frontend/src/app/pages/unirse-grupo/unirse-grupo.html`
- `frontend/src/app/pages/crear-suscripcion/crear-suscripcion.html`
- `frontend/src/app/pages/style-guide/style-guide.html`
- (Opcional) `frontend/src/app/components/shared/form-card/form-card.html` y `form-card.ts`

---

### 1.4 — Corregir `role="main"` redundante en not-found
**WCAG 4.1.1**

- [ ] En `not-found.html` L1: eliminar `role="main"` del `<section>`, ya que se renderiza dentro del `<main>` de `app.html`

**Archivos a modificar:**
- `frontend/src/app/components/shared/not-found/not-found.html`

---

### 1.5 — Validar HTML con W3C Validator
**Checklist: HTML válido (validador W3C)**

- [ ] Desplegar la app (o usar la versión de desarrollo)
- [ ] Validar cada página principal con https://validator.w3.org/
- [ ] Corregir cualquier error de parsing detectado
- [ ] Documentar el resultado en la auditoría
- [ ] Verificar que los elementos están correctamente anidados según la especificación HTML5

---

## Fase 2 — Indicador de foco visible en todos los controles
> **Prioridad:** 🟠 Alta | **WCAG:** 2.4.7, 2.4.11
> **Esfuerzo estimado:** 1-2 horas

### 2.1 — Auditar y corregir `outline: none` en form controls
**WCAG 2.4.7 — Focus Visible**

El reset global define `:focus-visible` con outline 3px, pero varios componentes de formulario lo sobreescriben con `:focus { outline: none }` y solo cambian `border-color`, lo que puede no ser suficiente.

**Estrategia:** Cambiar de `:focus { outline: none }` a `:focus:not(:focus-visible) { outline: none }` en estos componentes, y añadir un estilo `:focus-visible` con outline explícito de al menos 3px con contraste suficiente (3:1 respecto al fondo).

- [ ] **`_formularios.scss` L52** — Verificar que la regla `outline: none` tiene un `:focus-visible` compensatorio. Si no, refactorizar a:
  ```scss
  &:focus:not(:focus-visible) {
    outline: none;
  }
  &:focus-visible {
    @include foco-visible; // Usar el mixin existente
  }
  ```
- [ ] **`form-input.scss` L55** — Aplicar la misma corrección
- [ ] **`form-textarea.scss` L50** — Aplicar la misma corrección
- [ ] **`form-select.scss` L51** — Aplicar la misma corrección
- [ ] **`form-checkbox.scss` L56** — Aplicar la misma corrección
- [ ] **`form-radio-group.scss` L90** — Aplicar la misma corrección
- [ ] **`group-card.scss` L14** — Verificar que tiene `:focus-visible` compensatorio
- [ ] **`subscription-card.scss` L28** — Verificar que tiene `:focus-visible` compensatorio
- [ ] Usar el mixin `foco-visible` existente en `_mixins.scss` para consistencia
- [ ] Comprobar visualmente (con teclado): todos los controles deben mostrar un indicador de foco claro al navegarlos con Tab

**Archivos a modificar:**
- `frontend/src/styles/03-elements/_formularios.scss`
- `frontend/src/app/components/shared/form-input/form-input.scss`
- `frontend/src/app/components/shared/form-textarea/form-textarea.scss`
- `frontend/src/app/components/shared/form-select/form-select.scss`
- `frontend/src/app/components/shared/form-checkbox/form-checkbox.scss`
- `frontend/src/app/components/shared/form-radio-group/form-radio-group.scss`
- `frontend/src/app/components/shared/group-card/group-card.scss`
- `frontend/src/app/components/shared/subscription-card/subscription-card.scss`

---

### 2.2 — Verificar `.u-btn-wrapper` focus visible
**WCAG 2.4.7**

- [ ] Revisar `_interactivo.scss` L46-48: confirmar que cuando `.u-btn-wrapper:focus-visible { outline: none }`, el componente hijo (ej: `app-card`) muestra un indicador de foco visual alternativo (borde, sombra, etc.)
- [ ] Si no lo muestra, añadir estilo al componente wrapper:
  ```scss
  .u-btn-wrapper:focus-visible > * {
    // indicador de foco delegado al hijo
    outline: 3px solid var(--color-foco);
    outline-offset: 2px;
  }
  ```
- [ ] Probar con teclado en el dashboard (tarjetas "Crear grupo" y "Unirse a grupo")

**Archivos a modificar:**
- `frontend/src/styles/06-utilities/_interactivo.scss`
- (Opcional) `frontend/src/app/pages/dashboard/dashboard.scss`

---

## Fase 3 — Correcciones de ARIA y semántica
> **Prioridad:** 🟡 Media | **WCAG:** 1.1.1, 1.3.1, 4.1.2
> **Esfuerzo estimado:** 1 hora

### 3.1 — Definir la clase CSS `u-sr-only`
**WCAG 1.3.1**

La clase `u-sr-only` se usa en `usuario-layout.html` y `notificaciones.html` pero no está definida en ningún archivo SCSS.

- [ ] Añadir en el archivo de utilidades (`_utilities.scss` o similar) un alias:
  ```scss
  .u-sr-only {
    @extend .u-visually-hidden;
  }
  ```
  O bien reemplazar `u-sr-only` por `u-visually-hidden` en los templates que la usan.
- [ ] Verificar que los elementos con `u-sr-only` se ocultan visualmente pero son leídos por lectores de pantalla

**Archivos a modificar:**
- `frontend/src/styles/06-utilities/` (crear definición) o
- `frontend/src/app/pages/usuario/usuario-layout.html`
- `frontend/src/app/pages/usuario/notificaciones/notificaciones.html`

---

### 3.2 — Mejorar texto alt de avatar en perfil
**WCAG 1.1.1 — Non-text Content**

- [ ] En `perfil.html` L76: cambiar `alt="Preview"` → `alt="Vista previa de tu nuevo avatar"`
- [ ] Revisar que todas las demás imágenes de avatar tengan un alt descriptivo (ej: "Avatar de {nombre de usuario}")

**Archivos a modificar:**
- `frontend/src/app/pages/usuario/perfil/perfil.html`

---

### 3.3 — Verificar `aria-hidden` no en elementos enfocables
**Checklist: Sin `aria-hidden` en elementos enfocables**

- [ ] Buscar en todo el proyecto combinaciones de `aria-hidden="true"` y verificar que ninguno:
  - Tiene `tabindex="0"` simultáneamente
  - Es un `<button>`, `<a>`, `<input>`, `<select>` o `<textarea>`
  - Contiene elementos enfocables como hijos
- [ ] Los overlays de modal con `aria-hidden="true"` + `(click)` son aceptables porque no son enfocables por teclado (no tienen tabindex)

---

### 3.4 — Revisar uso semántico de `<article>` vs `<section>`
**WCAG 1.3.1 — Info and Relationships**

- [ ] Audit rápido: los `<article>` en tarjetas (group-card, subscription-card, member-card) son correctos (contenido autocontenido)
- [ ] Evaluar si los `<article>` en páginas completas (como-funciona, notificaciones, configuración, perfil) deberían ser `<section>` o mantenerlos si son autocontenidos
- [ ] No es obligatorio cambiarlos si el contenido es redistribuible, pero documentar la decisión

---

### 3.5 — Verificar jerarquía de encabezados en cada página
**Checklist: Jerarquía de encabezados sin saltos**

- [ ] Navegar por cada ruta y verificar la jerarquía con la herramienta de encabezados de axe DevTools o la extensión HeadingsMap:
  - Home: ¿h1 → h2 → h3 sin saltos?
  - Dashboard: ¿h1 → h2 → h3 sin saltos?
  - Grupo detalle: ¿h1 → h2 → h3 sin saltos?
  - Login / Register: ¿h1 → h2 sin saltos?
  - Perfil / Configuración / Notificaciones: ¿h1 → h2 → h3 sin saltos?
  - FAQ: ¿h1 → h2 → h3 sin saltos?
  - Como funciona: ¿h1 → h2 → h3 sin saltos?
  - Páginas legales: ¿h1 → h2 sin saltos?
- [ ] Corregir los saltos detectados (especialmente en componentes reutilizables como `group-card` que usa h3/h4 sin garantizar h2 previo)
- [ ] En `navigation-guide.html` (style-guide): corregir la secuencia h1 → h3 → h4 → h2

**Archivos potencialmente a modificar:** múltiples templates de páginas y componentes según hallazgos.

---

## Fase 4 — Color y contraste
> **Prioridad:** 🟡 Media | **WCAG:** 1.4.3, 1.4.6, 1.4.11
> **Esfuerzo estimado:** 2-3 horas

### 4.1 — Verificar contraste de TODOS los pares texto/fondo
**Checklist: Contraste ≥ 4.5:1 (texto normal)**

Usar la herramienta https://webaim.org/resources/contrastchecker/ o la función "Inspect > Contrast ratio" de Chrome DevTools.

**Tema claro — Verificar y documentar:**
- [ ] Texto principal (`--color-texto-normal` #4b5563) sobre fondo claro (`--color-fondo-claro` #f8fafc) → Calcular ratio
- [ ] Texto secundario (`--color-gris-oscuro` #9ca3af) sobre fondo claro → Mínimo 4.5:1, si no cumple → oscurecer
- [ ] Texto en tarjetas (`--color-text-secondary` #475569) sobre blanco (#fefefe) → Calcular ratio
- [ ] Placeholders en inputs → verificar que cumplen 4.5:1 contra fondo del input
- [ ] Texto de botones → contraste contra color de fondo del botón
- [ ] Texto de enlaces → contraste contra fondo
- [ ] Color de error (#ef4444 o similar) sobre fondo claro → verificar
- [ ] Color de éxito (#22c55e o similar) sobre fondo claro → verificar
- [ ] Color de warning → verificar

**Tema oscuro — Verificar y documentar:**
- [ ] Texto principal (`--color-text-primary-dark` #f8fafc) sobre fondo oscuro (#0f172a) → Calcular ratio
- [ ] Texto secundario sobre fondo oscuro
- [ ] Texto en tarjetas sobre fondo de tarjeta oscuro
- [ ] Botones, enlaces, estados de error/éxito/warning

**Footer — Verificar:**
- [ ] Texto del footer sobre fondo del footer (ya documentado como 7.52:1 ✓, confirmar)

- [ ] Documentar TODOS los ratios de contraste en una tabla en el archivo de auditoría
- [ ] Ajustar cualquier color que no cumpla el mínimo de 4.5:1 para texto normal y 3:1 para texto grande

**Herramientas:**
- Chrome DevTools → Inspect → CSS Overview → Colors
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- axe DevTools extension

**Archivos potencialmente a modificar:**
- `frontend/src/styles/00-settings/_css-variables.scss`

---

### 4.2 — Verificar que la información no se transmite solo por color
**Checklist: Información no solo por color**

- [ ] Revisar estados de validación de formularios: ¿los errores se identifican SOLO con borde rojo? Verificar que también tienen:
  - Icono o texto de error (ya implementado con `role="alert"` ✅)
  - `aria-invalid` (ya implementado ✅)
- [ ] Revisar botones de estado (filtros con `aria-pressed`): ¿se distinguen solo por color o también por forma/texto?
- [ ] Revisar toasts de éxito/error/warning: ¿tienen icono además de color?
- [ ] Verificar con simuladores de daltonismo (Chrome DevTools → Rendering → Emulate vision deficiencies) que toda la interfaz es comprensible sin colores

---

### 4.3 — Contraste de iconos y gráficos
**WCAG 1.4.11 — Non-text Contrast (3:1)**

- [ ] Verificar que los iconos funcionales (no decorativos) tienen contraste mínimo 3:1 contra el fondo
- [ ] Verificar bordes de inputs/selects/textareas contra el fondo → mínimo 3:1
- [ ] Verificar indicadores de foco → mínimo 3:1 contra el fondo

---

## Fase 5 — Navegación por teclado exhaustiva
> **Prioridad:** 🟡 Media | **WCAG:** 2.1.1, 2.1.2, 2.4.3, 2.4.7
> **Esfuerzo estimado:** 2-3 horas

### 5.1 — Prueba de teclado completa en cada flujo
**Checklist: Todo accesible con teclado + Orden de foco lógico + Sin trampas de teclado**

Desconectar el ratón y navegar TODA la app con teclado:

- [ ] **Flujo público:**
  - Home → Tab entre secciones, botones CTA, links del footer
  - Como funciona → Tab entre secciones
  - FAQ → Acordeones: ¿abren/cierran con Enter y Espacio?
  - Páginas legales → Navegación por enlaces internos
  
- [ ] **Flujo de autenticación:**
  - Login → Tab a cada campo, llenar con teclado, enviar con Enter
  - Register → Tab a cada campo, checkboxes con Espacio, enviar con Enter
  - ¿Password toggle funciona con teclado?
  
- [ ] **Flujo autenticado:**
  - Dashboard → Tab a tarjetas, grupos, búsqueda, botones de acción
  - Crear grupo → Tab a campos del formulario, enviar
  - Unirse a grupo → Tab a campos, enviar
  - Grupo detalle → Tab a tabs, filtros, tarjetas de suscripción
  - Crear suscripción → Tab a campos, enviar
  - Suscripción detalle → Tab a toda la información
  
- [ ] **Flujo de usuario:**
  - Perfil → Tab a campos, subir avatar, guardar
  - Configuración → Tab a campos, guardar
  - Notificaciones → Tab a switches, activar con Espacio
  - Solicitudes → Tab a filtros, tarjetas
  
- [ ] **Componentes interactivos:**
  - Header → Menú hamburguesa abre/cierra con Enter, menú de usuario
  - User dropdown → abre con Enter, navega con flechas, cierra con Escape
  - Modales → Se abren, foco atrapado, cierran con Escape
  - Invite modal → mismo que modal
  - Tabs → Flechas izquierda/derecha cambian pestaña
  - Acordeón → Enter/Espacio abre/cierra
  - Paginación → Tab y Enter entre páginas
  - Toasts → ¿Tienen botón de cierre accesible?
  - Theme toggle → funciona con Enter/Espacio

- [ ] Documentar cada problema encontrado indicando: página, componente, tecla esperada, comportamiento real

---

### 5.2 — Verificar indicador de foco visible en TODOS los elementos
**Checklist: Indicador de foco visible**

- [ ] Al hacer Tab, ¿TODO elemento interactivo muestra un indicador de foco claro?
- [ ] ¿El indicador de foco tiene contraste suficiente (3:1) contra adjacent colors?
- [ ] ¿Los custom components (group-card, subscription-card) muestran foco?
- [ ] ¿Los botones del user-dropdown muestran foco individual al navegar?
- [ ] ¿Los radio buttons y checkboxes muestran foco?

---

### 5.3 — Verificar focus management en SPA
**WCAG 2.4.3 — Focus Order**

- [ ] Al cambiar de ruta (SPA navigation), ¿el foco se maneja correctamente?
  - Idealmente, el foco se mueve al contenido principal o al `<h1>` de la nueva página
  - O al menos, el título de la página se actualiza (ya implementado con route titles ✅)
- [ ] Evaluar si es necesario implementar un servicio de focus management para cambios de ruta:
  ```typescript
  // En un servicio de accesibilidad
  router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
    document.getElementById('contenido-principal')?.focus();
  });
  ```
- [ ] Si se implementa, añadir `tabindex="-1"` al `<main>` para que pueda recibir foco programático

---

## Fase 6 — Multimedia accesible
> **Prioridad:** 🟢 Baja (actualmente no hay multimedia) | **WCAG:** 1.2.1, 1.2.2, 1.2.3
> **Esfuerzo estimado:** Según necesidad futura

### 6.1 — Preparar política de multimedia accesible
**Checklist: Vídeos con subtítulos + Audio con transcripción**

Actualmente NO hay `<video>`, `<audio>` ni `<iframe>` en la aplicación.

- [ ] Documentar la política para cuando se añada multimedia:
  - Todo vídeo debe incluir subtítulos (track `<track kind="subtitles">`)
  - Todo audio debe tener transcripción disponible
  - Reproductores deben ser operables con teclado
  - Iframes deben tener `title` descriptivo
- [ ] Si se integra contenido de YouTube/Vimeo, verificar que los embeds tienen subtítulos activados

---

### 6.2 — Verificar textos alternativos en imágenes
**Checklist: Imágenes con alt apropiado**

- [ ] Confirmar que todas las `<img>` con contenido informativo tienen `alt` descriptivo (no genérico)
- [ ] Confirmar que las imágenes decorativas tienen `alt=""` (vacío, no omitido)
- [ ] Corregir `alt="Preview"` en perfil → `alt="Vista previa de tu nuevo avatar"`
- [ ] Verificar que el logo SVG con `role="img"` tiene `aria-label` o `<title>` descriptivo
- [ ] Revisar las imágenes de `<picture>` en feature-image: ¿tienen alt contextual?

---

## Fase 7 — Testing automatizado de accesibilidad
> **Prioridad:** 🟠 Alta | **WCAG:** Mantenibilidad
> **Esfuerzo estimado:** 3-4 horas

### 7.1 — Ejecutar Lighthouse y alcanzar >90
**Checklist: Lighthouse >90**

- [ ] Ejecutar Lighthouse Accessibility en cada página principal:
  - `/` (Home)
  - `/login`
  - `/register`
  - `/como-funciona`
  - `/faq`
  - `/dashboard`
  - `/crear-grupo`
  - `/unirse-grupo`
  - `/grupos/:id` (grupo detalle)
  - `/grupos/:id/crear-suscripcion`
  - `/usuario/perfil`
  - `/usuario/configuracion`
  - `/usuario/notificaciones`
  - Páginas legales
- [ ] Documentar el score de cada página
- [ ] Corregir TODOS los issues reportados por Lighthouse hasta alcanzar >90 en cada página
- [ ] Repetir la auditoría hasta lograr el objetivo

---

### 7.2 — Ejecutar axe DevTools
- [ ] Instalar la extensión axe DevTools en el navegador
- [ ] Ejecutar análisis en cada página principal
- [ ] Los issues de axe son más detallados que Lighthouse — corregir los que Lighthouse no detectó
- [ ] Documentar los resultados

---

### 7.3 — Integrar tests de accesibilidad en el pipeline de CI
- [ ] Instalar `axe-core` para tests automatizados:
  ```bash
  npm install --save-dev axe-core @axe-core/playwright
  # o con vitest
  npm install --save-dev vitest-axe
  ```
- [ ] Crear tests de accesibilidad por componente o por página que ejecuten axe-core:
  ```typescript
  // Ejemplo con vitest + axe
  import { axe, toHaveNoViolations } from 'vitest-axe';
  expect.extend(toHaveNoViolations);
  
  it('should have no accessibility violations', async () => {
    const { container } = render(MyComponent);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  ```
- [ ] Añadir al menos 1 test de accesibilidad por cada componente clave:
  - [ ] form-input
  - [ ] form-textarea
  - [ ] form-select
  - [ ] form-checkbox
  - [ ] form-radio-group
  - [ ] modal
  - [ ] tabs
  - [ ] accordion
  - [ ] pagination
  - [ ] toast
  - [ ] breadcrumbs
  - [ ] user-dropdown
  - [ ] button
- [ ] Configurar para que los tests de accesibilidad se ejecuten en CI (pipeline)

---

### 7.4 — Probar con WAVE (herramienta visual)
- [ ] Visitar https://wave.webaim.org/ o instalar la extensión
- [ ] Analizar cada página y revisar las alertas/errores visuales sobrepuestos en la interfaz
- [ ] Comparar con los resultados de Lighthouse y axe para cobertura completa

---

## Fase 8 — Pruebas manuales con lector de pantalla
> **Prioridad:** 🟠 Alta | **WCAG:** 4.1.2 — Name, Role, Value
> **Esfuerzo estimado:** 2-3 horas

### 8.1 — Probar con lector de pantalla básico
**Checklist: Probado con lector de pantalla (básico)**

Usar NVDA (Windows) o VoiceOver (macOS/iOS) o Orca (Linux):

- [ ] **Navegación general:**
  - ¿Los landmarks se anuncian correctamente? ("banner", "navegación", "principal", "pie de página")
  - ¿Los encabezados se listan y navegan por secciones?
  - ¿El skip-to-content funciona con el lector?

- [ ] **Formularios:**
  - ¿Cada campo anuncia su label? ("Correo electrónico, campo de edición")
  - ¿Los campos obligatorios se anuncian? ("requerido")
  - ¿Los errores se anuncian automáticamente? (live regions)
  - ¿El `aria-describedby` funciona? (lee la descripción/error asociado)

- [ ] **Componentes interactivos:**
  - ¿Los botones se anuncian con su nombre? ("Crear grupo, botón")
  - ¿Los botones toggle anuncian su estado? ("Modo oscuro, botón presionado")
  - ¿Los tabs se anuncian correctamente? ("pestaña 1 de 3, seleccionada")
  - ¿Los acordeones se anuncian como expandidos/colapsados?
  - ¿Los modales se anuncian como diálogos?
  - ¿Los toasts se anuncian automáticamente?

- [ ] **Imágenes:**
  - ¿Las imágenes informativas se leen con su alt?
  - ¿Las imágenes decorativas se ignoran?
  - ¿El logo se identifica correctamente?

- [ ] Documentar issues encontrados con captura/grabación

---

### 8.2 — Testing con zoom de texto al 200%
**WCAG 1.4.4 — Resize Text**

- [ ] En el navegador, hacer Ctrl +/- hasta zoom del 200%
- [ ] Verificar en cada página:
  - ¿El texto sigue siendo legible?
  - ¿Aparecen scroll horizontales? (no deberían)
  - ¿Se superponen elementos?
  - ¿Los botones y controles siguen siendo usables?
  - ¿La navegación sigue funcional?

---

## Fase 9 — Mejoras avanzadas (nice-to-have para WCAG 2.2 / AAA)
> **Prioridad:** 🔵 Baja | **WCAG 2.2 / Nivel AAA parcial**
> **Esfuerzo estimado:** 2-4 horas

### 9.1 — Ampliar soporte de `forced-colors` y `prefers-contrast`
- [ ] Actualmente solo hay 1 regla `forced-colors: active` (en el header)
- [ ] Añadir `@media (forced-colors: active)` en botones, inputs, tarjetas, modales para asegurar visibilidad en modo de alto contraste de Windows
- [ ] Considerar `@media (prefers-contrast: more)` para mejorar bordes/contraste en navegadores compatibles

---

### 9.2 — Focus management en navegación SPA
- [ ] Implementar servicio de accesibilidad que gestione el foco al cambiar de ruta
- [ ] Al navegar a nueva página, mover foco al `<main>` o al `<h1>`
- [ ] Anunciar el cambio de página con una live region (ej: "Navegando a Dashboard")

---

### 9.3 — Mejorar `<article>` semántica en páginas
- [ ] Evaluar si `<article>` en páginas completas (como-funciona, perfil, configuración) es semánticamente correcto
- [ ] Si no es autocontenido, cambiar a `<section>` con `aria-labelledby`

---

### 9.4 — Declaración de accesibilidad pública
- [ ] Crear página `/accesibilidad` con:
  - Nivel de conformidad alcanzado (WCAG 2.1 AA)
  - Fecha de última evaluación
  - Problemas conocidos y timeline de solución
  - Información de contacto para reportar barreras
- [ ] Añadir enlace en el footer

---

### 9.5 — Considerar `aria-roledescription` en componentes custom
- [ ] Evaluar si componentes como `group-card` (que tiene `role="button"`) se beneficiarían de `aria-roledescription` para dar contexto más rico ("tarjeta de grupo, botón")

---

## Fase 10 — Documentación y cierre
> **Prioridad:** 🟡 Media | **Esfuerzo estimado:** 1-2 horas

### 10.1 — Actualizar la auditoría de accesibilidad
- [ ] Actualizar `docs/auditoria-accesibilidad.md` con:
  - Nuevos hallazgos corregidos
  - Scores de Lighthouse por página
  - Tabla de contraste de colores con ratios verificados
  - Resultados de testing con lector de pantalla
  - Resultados de testing con teclado

---

### 10.2 — Crear guía interna de accesibilidad para el equipo
- [ ] Documentar convenciones adoptadas:
  - Cuándo usar `aria-label` vs `aria-labelledby`
  - Reglas de headings (un h1 por página, sin saltos)
  - Reglas de landmarks (un `<main>` global en app.html)
  - Patrón de formularios accesibles (form-input con label + aria-describedby)
  - Patrón de modales accesibles (focus trap, Escape, role="dialog")
  - Cuándo usar `u-visually-hidden` vs `aria-hidden`
  - Política de multimedia accesible
- [ ] Documentar el workflow de testing:
  1. Lighthouse > 90
  2. axe DevTools sin errores
  3. Navegación completa con teclado
  4. Lector de pantalla básico
  5. Zoom 200% sin problemas

---

### 10.3 — Completar el checklist final
Verificar cada punto del [checklist de accesibilidad](../accesibilidad/orbita5.8-checklist.md):

**HTML y estructura:**
- [ ] ✅ HTML válido (validador W3C)
- [ ] ✅ Un solo `<h1>` por página
- [ ] ✅ Jerarquía de encabezados sin saltos
- [ ] ✅ Landmarks usados (`<header>`, `<nav>`, `<main>`, `<footer>`)
- [ ] ✅ `lang` en `<html>`

**ARIA:**
- [ ] ✅ ARIA solo cuando HTML nativo no basta
- [ ] ✅ Roles correctos y consistentes
- [ ] ✅ Estados actualizados dinámicamente
- [ ] ✅ Live regions para cambios importantes
- [ ] ✅ Sin `aria-hidden` en elementos enfocables

**Teclado:**
- [ ] ✅ Todo accesible con teclado
- [ ] ✅ Orden de foco lógico
- [ ] ✅ Indicador de foco visible
- [ ] ✅ Modales atrapan foco y cierran con Escape
- [ ] ✅ Sin trampas de teclado

**Color y contraste:**
- [ ] ✅ Contraste ≥ 4.5:1 (texto normal)
- [ ] ✅ Información no solo por color

**Multimedia:**
- [ ] ✅ Vídeos con subtítulos (N/A actualmente)
- [ ] ✅ Audio con transcripción (N/A actualmente)
- [ ] ✅ Imágenes con alt apropiado

**Formularios:**
- [ ] ✅ Cada campo con `<label>`
- [ ] ✅ Campos obligatorios indicados
- [ ] ✅ Errores descriptivos

**Testing:**
- [ ] ✅ Lighthouse >90
- [ ] ✅ Probado con teclado completo
- [ ] ✅ Probado con lector de pantalla (básico)

---

## Cronograma sugerido

| Día | Fase | Esfuerzo |
|-----|------|----------|
| 1 | Fase 1: Correcciones críticas HTML | 2-3h |
| 1 | Fase 2: Foco visible | 1-2h |
| 2 | Fase 3: ARIA y semántica | 1h |
| 2 | Fase 4: Color y contraste | 2-3h |
| 3 | Fase 5: Testing de teclado | 2-3h |
| 3 | Fase 6: Multimedia | 30min |
| 4 | Fase 7: Testing automatizado | 3-4h |
| 4 | Fase 8: Lector de pantalla | 2-3h |
| 5 | Fase 9: Mejoras avanzadas | 2-4h |
| 5 | Fase 10: Documentación y cierre | 1-2h |

**Total estimado: 17-26 horas de trabajo (~5 días)**

---

## Recursos clave

| Recurso | URL |
|---------|-----|
| WCAG 2.1 Quick Reference | https://www.w3.org/WAI/WCAG21/quickref/ |
| Accesible.es | https://accesible.es/ |
| ARIA Patterns | https://www.w3.org/WAI/ARIA/apg/patterns/ |
| WebAIM Contrast Checker | https://webaim.org/resources/contrastchecker/ |
| axe DevTools | https://www.deque.com/axe/devtools/ |
| WAVE | https://wave.webaim.org/ |
| NVDA (lector de pantalla) | https://www.nvaccess.org/ |
| W3C HTML Validator | https://validator.w3.org/ |
