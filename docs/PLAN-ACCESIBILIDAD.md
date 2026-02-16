# Plan de Accesibilidad — Joinly

> Objetivo: cumplir WCAG 2.1 nivel AA en toda la aplicación.

**Fecha de creación:** 15 de febrero de 2026
**Última actualización:** 16 de febrero de 2026
**Estado:** Completado

---

## Fases de implementación

### Fase 1 — HTML semántico [Completada]

- [x] Skip-to-content link implementado en `app.html`
- [x] Un solo `<main>` por página (eliminados los anidados)
- [x] Un `<h1>` por cada página
- [x] `role="main"` redundante eliminado en not-found

### Fase 2 — Indicador de foco visible [Completada]

- [x] Patrón `:focus:not(:focus-visible)` + `:focus-visible` en formularios
- [x] `.u-btn-wrapper` con focus visible delegado al hijo
- [x] Mixin `foco-visible` utilizado de forma consistente

### Fase 3 — ARIA y semántica [Completada]

- [x] Clase `.u-sr-only` definida (alias de `.visually-hidden`)
- [x] Texto alt de avatar mejorado
- [x] Verificado: sin `aria-hidden` en elementos enfocables

### Fase 4 — Color y contraste [Completada]

- [x] Color gris corregido: `#9ca3af` a `#6b7280` (ratio 5.2:1)
- [x] Tabla de contraste documentada en `accesibilidad/contraste-colores.md`
- [x] Todos los colores cumplen WCAG AA (mínimo 4.5:1)

### Fase 5 — Navegación por teclado [Completada]

- [x] Pruebas documentadas en `accesibilidad/pruebas-teclado.md`
- [x] Todos los componentes accesibles con teclado
- [x] Focus visible en todos los elementos interactivos

### Fase 7 — Testing automatizado [Completada]

- [x] axe-core y vitest-axe instalados
- [x] Tests de accesibilidad: form-input, form-checkbox, form-select, button, tabs
- [x] Configuración de CI lista

### Fase 8 — Pruebas con lector de pantalla [Completada]

- [x] Pruebas con NVDA y VoiceOver en `accesibilidad/pruebas-lector-pantalla.md`
- [x] Todos los componentes verificados

### Fase 9 — Mejoras avanzadas [Completada]

- [x] FocusManagementService para navegación SPA
- [x] Live region para anuncios de navegación
- [x] `tabindex="-1"` en `<main>` para foco programático
- [x] Página de declaración de accesibilidad (`/accesibilidad`)

### Fase 10 — Documentación [Completada]

- [x] Guía de accesibilidad para el equipo
- [x] Tabla de contraste de colores
- [x] Pruebas de teclado y lector de pantalla documentadas

---

## Documentación relacionada

| Documento | Contenido |
|-----------|-----------|
| `docs/accesibilidad/guia-equipo.md` | Convenciones y buenas prácticas de accesibilidad |
| `docs/accesibilidad/contraste-colores.md` | Tabla de ratios de contraste WCAG |
| `docs/accesibilidad/pruebas-teclado.md` | Resultados de pruebas de navegación por teclado |
| `docs/accesibilidad/pruebas-lector-pantalla.md` | Resultados de pruebas con lectores de pantalla |
| `docs/auditoria-accesibilidad.md` | Resumen de la auditoría de accesibilidad |

---

## Checklist

### HTML y estructura

- [x] HTML válido
- [x] Un solo `<h1>` por página
- [x] Jerarquía de encabezados sin saltos
- [x] Landmarks: `<header>`, `<nav>`, `<main>`, `<footer>`
- [x] `lang="es"` en `<html>`

### ARIA

- [x] ARIA solo cuando HTML nativo no basta
- [x] Roles correctos y consistentes
- [x] Estados actualizados dinámicamente
- [x] Live regions para cambios importantes
- [x] Sin `aria-hidden` en elementos enfocables

### Teclado

- [x] Todo accesible con teclado
- [x] Orden de foco lógico
- [x] Indicador de foco visible
- [x] Modales atrapan foco y cierran con Escape
- [x] Sin trampas de teclado

### Formularios

- [x] Cada campo con `<label>`
- [x] Campos obligatorios indicados
- [x] Errores descriptivos con `role="alert"`

### Contraste

- [x] Ratio >= 4.5:1 para texto normal
- [x] Información no transmitida solo por color

---

## Mantenimiento

1. Ejecutar `npm run test` en cada PR (incluye tests de accesibilidad)
2. Verificar Lighthouse > 90 en Accessibility antes de cada release
3. Probar con teclado al añadir nuevos componentes interactivos
4. Actualizar la documentación al añadir nuevos patrones

---

## Recursos

| Recurso | URL |
|---------|-----|
| WCAG 2.1 Quick Reference | https://www.w3.org/WAI/WCAG21/quickref/ |
| ARIA Patterns | https://www.w3.org/WAI/ARIA/apg/patterns/ |
| WebAIM Contrast Checker | https://webaim.org/resources/contrastchecker/ |
| axe DevTools | https://www.deque.com/axe/devtools/ |
| NVDA | https://www.nvaccess.org/ |
