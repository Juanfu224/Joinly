# Guía de Accesibilidad para el Equipo — Joinly

> Convenciones y buenas prácticas para mantener la accesibilidad en el desarrollo

**Última actualización:** 16 de febrero de 2026

---

## 1. Principios fundamentales

### WCAG 2.1 nivel AA

Nuestro objetivo es cumplir con las pautas WCAG 2.1 a nivel AA. Esto significa:

- **Perceptible**: La información debe ser presentable de forma que los usuarios puedan percibirla
- **Operable**: Los componentes de interfaz deben ser operables por todos los usuarios
- **Comprensible**: La información y el funcionamiento deben ser comprensibles
- **Robusto**: El contenido debe ser compatible con diferentes tecnologías de asistencia

---

## 2. HTML semántico

### Un solo `<main>` por página

```html
<!-- ✅ Correcto: un solo main en app.html -->
<a href="#contenido-principal" class="c-skip-link">
  Saltar al contenido principal
</a>
<app-header />
<main id="contenido-principal" tabindex="-1">
  <router-outlet />
</main>
<app-footer />

<!-- ❌ Incorrecto: main anidado en componentes hijo -->
<div class="p-dashboard">
  <main>...</main>  <!-- Ya existe un main en app.html -->
</div>
```

### Un solo `<h1>` por página

```html
<!-- ✅ Correcto -->
<article>
  <h1 class="visually-hidden">Iniciar sesión en Joinly</h1>
  <h2>Accede a tu cuenta</h2>
</article>

<!-- ❌ Incorrecto: múltiples h1 -->
<h1>Bienvenido</h1>
<h1>Inicia sesión</h1>
```

### Jerarquía de encabezados sin saltos

```html
<!-- ✅ Correcto: h1 → h2 → h3 -->
<h1>Dashboard</h1>
<h2>Mis grupos</h2>
<h3>Familia García</h3>

<!-- ❌ Incorrecto: salto de h2 a h4 -->
<h1>Dashboard</h1>
<h2>Mis grupos</h2>
<h4>Familia García</h4>  <!-- Falta h3 -->
```

---

## 3. ARIA

### Cuándo usar ARIA

**Regla de oro:** Solo usa ARIA cuando HTML nativo no sea suficiente.

```html
<!-- ✅ Preferir HTML nativo -->
<button (click)="toggle()">Abrir menú</button>

<!-- ❌ No reinventar con ARIA -->
<div role="button" tabindex="0" (click)="toggle()">Abrir menú</div>
```

### aria-label vs aria-labelledby

```html
<!-- aria-label: Cuando NO hay texto visible que sirva de etiqueta -->
<button aria-label="Cerrar diálogo" (click)="close()">
  <app-icon name="x" aria-hidden="true" />
</button>

<!-- aria-labelledby: Cuando SÍ hay texto visible -->
<h2 id="dialog-title">Confirmar eliminación</h2>
<div role="dialog" aria-labelledby="dialog-title">
  ...
</div>
```

### aria-expanded y aria-controls

```html
<!-- Botones que expanden/colapsan contenido -->
<button
  [attr.aria-expanded]="isExpanded"
  aria-controls="panel-id"
  (click)="toggle()"
>
  Mostrar opciones
</button>
<div id="panel-id" [hidden]="!isExpanded">
  ...
</div>
```

### aria-hidden

```html
<!-- ✅ Correcto: ocultar iconos decorativos -->
<button (click)="save()">
  <app-icon name="check" aria-hidden="true" />
  Guardar
</button>

<!-- ❌ Incorrecto: ocultar elemento enfocable -->
<button aria-hidden="true">No visible</button>

<!-- ❌ Incorrecto: contener elementos enfocables -->
<div aria-hidden="true">
  <button>Este botón es inaccesible</button>
</div>
```

---

## 4. Formularios accesibles

### Estructura básica

```html
<app-form-input
  formControlName="email"
  label="Correo electrónico"
  type="email"
  [required]="true"
  [helperText]="'Nunca compartiremos tu email'"
  autocomplete="email"
/>
```

### Componente genera automáticamente:

- `<label>` asociado al `<input>`
- `aria-required="true"` para campos obligatorios
- `aria-invalid="true"` cuando hay errores
- `aria-describedby` apuntando al mensaje de error/ayuda
- `role="alert"` en mensajes de error

### Fieldset y legend para grupos

```html
<fieldset>
  <legend>Preferencias de notificación</legend>
  <app-form-checkbox>...</app-form-checkbox>
  <app-form-checkbox>...</app-form-checkbox>
</fieldset>
```

---

## 5. Focus visible

### Patrón obligatorio

Todos los elementos interactivos deben mostrar un indicador de foco visible para navegación por teclado.

```scss
// ✅ Patrón correcto
.mi-elemento {
  // Oculta outline solo cuando NO es navegación por teclado
  &:focus:not(:focus-visible) {
    outline: none;
    // Efecto visual alternativo para mouse (opcional)
    border-color: var(--color-principal);
  }

  // Muestra outline para navegación por teclado
  &:focus-visible {
    outline: 2px solid var(--color-principal);
    outline-offset: 2px;
  }
}
```

### Usar el mixin existente

```scss
@use '../../../../styles/01-tools/mixins' as *;

.mi-componente {
  @include foco-visible; // Aplica el patrón estándar
}
```

---

## 6. Clases de ocultación

### .visually-hidden / .u-visually-hidden / .u-sr-only

Oculta visualmente pero mantiene accesible para lectores de pantalla.

```html
<!-- Texto solo para lectores de pantalla -->
<nav aria-label="Navegación principal">
  <a href="/">
    <app-icon name="home" aria-hidden="true" />
    <span class="visually-hidden">Inicio</span>
  </a>
</nav>

<!-- Skip link -->
<a href="#contenido-principal" class="c-skip-link visually-hidden">
  Saltar al contenido principal
</a>
```

### aria-hidden="true"

Oculta completamente para lectores de pantalla. Solo para contenido decorativo.

```html
<!-- Icono decorativo -->
<app-icon name="chevron-right" aria-hidden="true" />

<!-- Separador visual -->
<hr aria-hidden="true" />
```

---

## 7. Modales

### Requisitos obligatorios

1. **Focus trap**: El foco debe quedar atrapado dentro del modal
2. **Escape para cerrar**: Debe poder cerrarse con la tecla Escape
3. **ARIA correcto**: `role="dialog"` y `aria-modal="true"`
4. **Foco inicial**: El foco debe moverse al modal al abrirse
5. **Restaurar foco**: Al cerrar, el foco vuelve al elemento que abrió el modal

### Estructura

```html
<div
  class="c-modal"
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
>
  <div class="c-modal__overlay" aria-hidden="true" (click)="close()"></div>
  <div class="c-modal__content">
    <h2 id="modal-title">Título del modal</h2>
    <!-- Contenido -->
  </div>
</div>
```

---

## 8. Navegación por teclado

### Componentes interactivos

| Componente | Teclas esperadas |
|------------|------------------|
| Botones | Enter, Espacio |
| Enlaces | Enter |
| Checkboxes | Espacio |
| Radio buttons | Flechas ↑↓←→ |
| Tabs | Flechas ←→, Home, End |
| Modales | Escape para cerrar |
| Dropdowns | Escape para cerrar, Flechas para navegar |
| Acordeones | Enter, Espacio |

### Orden de foco lógico

- El orden del DOM debe reflejar el orden visual
- Usar `tabindex="0"` solo cuando sea necesario
- **Nunca** usar `tabindex` positivo (> 0)

---

## 9. Contraste de colores

### Requisitos mínimos

| Tipo | Ratio mínimo |
|------|--------------|
| Texto normal | 4.5:1 |
| Texto grande (≥18px o ≥14px negrita) | 3:1 |
| Componentes UI (bordes, iconos) | 3:1 |

### Verificar antes de commit

1. Usar [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
2. Chrome DevTools → Inspect → Contrast ratio
3. La información NUNCA debe transmitirse solo por color

---

## 10. Multimedia

### Política actual

Actualmente Joinly no tiene contenido multimedia (video/audio). Cuando se añada:

- Todo video debe tener subtítulos (`<track kind="subtitles">`)
- Todo audio debe tener transcripción
- Reproductores deben ser operables con teclado
- Iframes deben tener `title` descriptivo

---

## 11. Checklist antes de PR

- [ ] ¿Hay un solo `<h1>` por página?
- [ ] ¿La jerarquía de encabezados no tiene saltos?
- [ ] ¿Todos los campos de formulario tienen `<label>`?
- [ ] ¿Los estados de error se anuncian con `role="alert"`?
- [ ] ¿Todos los elementos interactivos tienen focus visible?
- [ ] ¿Los iconos decorativos tienen `aria-hidden="true"`?
- [ ] ¿Las imágenes informativas tienen `alt` descriptivo?
- [ ] ¿El contraste de colores cumple WCAG AA?
- [ ] ¿Se puede navegar todo con teclado?
- [ ] ¿Los modales atrapan el foco y cierran con Escape?

---

## 12. Herramientas recomendadas

| Herramienta | Uso |
|-------------|-----|
| [axe DevTools](https://www.deque.com/axe/devtools/) | Auditoría de accesibilidad (extensión navegador) |
| [WAVE](https://wave.webaim.org/) | Evaluación visual |
| [Lighthouse](https://developers.google.com/web/tools/lighthouse) | Auditoría integrada en Chrome DevTools |
| [NVDA](https://www.nvaccess.org/) | Lector de pantalla (Windows) |
| [VoiceOver](https://www.apple.com/accessibility/voiceover/) | Lector de pantalla (macOS/iOS) |
| [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) | Verificar contraste |

---

## 13. Cómo ejecutar las pruebas de accesibilidad

### Pruebas manuales

1. **Navegación por teclado**
   - Desconecta el ratón
   - Navega toda la app con Tab, Shift+Tab, Enter, Espacio, Flechas, Escape
   - Verifica que todos los elementos interactivos son accesibles

2. **Lector de pantalla**
   - Activa NVDA (Windows) o VoiceOver (macOS)
   - Navega por la app verificando que el contenido se anuncia correctamente

3. **Lighthouse (Chrome DevTools)**
   - Abre DevTools → Lighthouse
   - Selecciona "Accessibility"
   - Ejecuta la auditoría
   - Objetivo: Score > 90

4. **axe DevTools**
   - Instala la extensión axe DevTools
   - Abre DevTools → axe DevTools
   - Ejecuta "Scan ALL of my page"
   - Corrige todas las violaciones

### Verificación de contraste

1. Usa Chrome DevTools → Inspect → selecciona un texto
2. Busca el indicador de contraste en el panel de estilos
3. El ratio debe ser ≥ 4.5:1 para texto normal

---

## 14. Tests automatizados de accesibilidad

### ¿Qué son?

Son tests que simulan el HTML que genera un componente y lo analizan con **axe-core** (el mismo motor que usa la extensión axe DevTools) para detectar violaciones de accesibilidad automáticamente.

### ¿Dónde están?

Los archivos de test de accesibilidad siguen el patrón `*.a11y.spec.ts` junto a cada componente:

```
components/shared/form-input/form-input.a11y.spec.ts
components/shared/form-checkbox/form-checkbox.a11y.spec.ts
components/shared/form-select/form-select.a11y.spec.ts
components/shared/button/button.a11y.spec.ts
components/shared/tabs/tabs.a11y.spec.ts
```

### ¿Cómo crear un test de accesibilidad?

```typescript
import { describe, it, expect } from 'vitest';
import axe from 'axe-core';

describe('MiComponente — Accesibilidad', () => {
  it('no tiene violaciones de accesibilidad', async () => {
    // 1. Renderizar el HTML que genera el componente
    document.body.innerHTML = `
      <label for="campo">Nombre</label>
      <input id="campo" type="text" />
    `;

    // 2. Ejecutar axe-core sobre el DOM
    const results = await axe.run(document.body);

    // 3. Verificar que no hay violaciones
    expect(results).toHaveNoViolations();
  });
});
```

### ¿Cómo ejecutarlos?

```bash
# Ejecutar todos los tests (incluye los de accesibilidad)
npm run test

# Ejecutar solo los tests de accesibilidad
npx vitest --run --reporter=verbose "a11y"
```

---

## Recursos adicionales

- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/patterns/)
- [Accesible.es](https://accesible.es/)
- [MDN Accessibility](https://developer.mozilla.org/es/docs/Web/Accessibility)
- [Documentación de axe-core](https://github.com/dequelabs/axe-core)
