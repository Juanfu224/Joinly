# Auditoría de Accesibilidad - Punto 8.3

## Fecha de última actualización: 16 de febrero de 2026

---

## Estado general: Completado

---

## Cambios implementados

La implementación completa se detalla en el [plan de accesibilidad](PLAN-ACCESIBILIDAD.md). A continuación se resumen los cambios principales:

### HTML semántico

- Skip-to-content link en `app.html`
- Un solo `<main>` por página (eliminados los anidados en 12 plantillas)
- Un `<h1>` por cada página (añadidos con `.visually-hidden` donde era necesario)
- Eliminado `role="main"` redundante en not-found

### Foco visible

Se corrigieron todos los componentes de formulario para usar `:focus-visible`:

- `_formularios.scss`, `form-input.scss`, `form-textarea.scss`
- `form-select.scss`, `form-checkbox.scss`, `form-radio-group.scss`

### ARIA y semántica

- Clase `.u-sr-only` definida como alias de `.visually-hidden`
- Texto alt de avatar mejorado en `perfil.html`
- Sin `aria-hidden` en elementos enfocables

### Focus management para SPA

- `FocusManagementService` mueve el foco al contenido principal en cada navegación
- Live region para anuncios de cambio de ruta
- `tabindex="-1"` en `<main>` para foco programático

---

## 8.3.1 ARIA Attributes

Implementación verificada:

| Categoría | Detalle |
|-----------|---------|
| Landmarks | `<header>`, `<nav>`, `<main>`, `<footer>` correctos |
| Modales | `role="dialog"` y `aria-modal="true"` |
| Formularios | `aria-label`, `aria-describedby`, `aria-required`, `aria-invalid` |
| Alertas | `role="alert"` en errores de validación |
| Live regions | `aria-live="polite"` en toasts y navegación SPA |
| Tabs | `role="tablist"`, `role="tab"`, `role="tabpanel"` |
| Navegación | `aria-current` para página activa |

Para más detalle sobre convenciones ARIA, ver `docs/accesibilidad/guia-equipo.md`.

---

## 8.3.2 Contraste de colores

Todos los colores verificados cumplen WCAG AA (mínimo 4.5:1 para texto normal, 3:1 para texto grande y componentes UI).

Cambio realizado: `#9ca3af` (gray-400) a `#6b7280` (gray-500) para placeholder y texto secundario.

Tabla completa de ratios en `docs/accesibilidad/contraste-colores.md`.

---

## 8.3.3 Navegación por teclado

Todos los flujos probados manualmente (público, autenticación, dashboard, grupos, suscripciones, perfil, configuración, notificaciones). Sin problemas encontrados.

Resultados completos en `docs/accesibilidad/pruebas-teclado.md`.

---

## 8.3.4 Pruebas con lector de pantalla

Probado con NVDA (Windows, Chrome/Firefox) y VoiceOver (macOS Safari, iOS Safari). Todos los componentes anunciados correctamente.

Resultados completos en `docs/accesibilidad/pruebas-lector-pantalla.md`.

---

## 8.3.5 Tests automatizados

Tests de accesibilidad con axe-core implementados para los componentes compartidos principales:

| Test | Componente |
|------|------------|
| `form-input.a11y.spec.ts` | Campo de entrada |
| `form-checkbox.a11y.spec.ts` | Casilla de verificación |
| `form-select.a11y.spec.ts` | Selector desplegable |
| `button.a11y.spec.ts` | Botón |
| `tabs.a11y.spec.ts` | Pestañas |

Se ejecutan con `npm run test`.

---

## Resumen

| Categoría | Estado |
|-----------|--------|
| ARIA Attributes | Implementado |
| Semántica HTML | Correcta |
| Contraste de colores | Verificado |
| Focus management | Implementado |
| Navegación por teclado | Funciona |
| Lectores de pantalla | Verificado |
| Tests automatizados | Implementados |
