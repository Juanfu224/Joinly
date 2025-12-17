# TODO - Joinly Frontend

> Lista de tareas pendientes para completar los requisitos de manipulación DOM y componentes interactivos

**Última actualización:** 17 de diciembre de 2025  
**Estado del proyecto:** 85% completado

---

## 📊 Resumen Rápido

- ✅ **Completado:** Manipulación DOM, Sistema de Eventos, Modal, Menú Hamburguesa, Tooltips, Theme Switcher, Accordion
- 🚧 **En progreso:** -
- ❌ **Pendiente:** Tabs, Documentación de eventos

---

## 🎯 Componentes Interactivos Pendientes

### 1. Componente Accordion

**Prioridad:** Alta  
**Ubicación:** `frontend/src/app/components/shared/accordion/`

**Tareas:**
- [x] Crear estructura base del componente
  - [x] Archivo `accordion.ts` (componente contenedor)
  - [x] Archivo `accordion-item.ts` (componente de cada ítem)
  - [x] Archivo `accordion-item.html`
  - [x] Archivo `accordion-item.scss` con estilos BEM
  
- [x] Implementar funcionalidad
  - [x] Signal para controlar estado expandido/colapsado de cada ítem
  - [x] Método `toggle()` para expandir/colapsar
  - [x] Opción `allowMultiple` (permitir múltiples items abiertos simultáneamente)
  - [x] Opción `defaultExpanded` (items expandidos por defecto)
  - [x] Animación smooth para expandir/colapsar (CSS transitions)
  
- [x] Manipulación DOM y eventos
  - [x] ViewChild para acceder al contenido expandible
  - [x] Calcular altura dinámica del contenido con `ElementRef`
  - [x] Event binding en header del accordion item (click)
  - [x] `@HostListener` para eventos de teclado (Enter, Space)
  - [x] Modificar altura con `Renderer2` para animación
  
- [x] Accesibilidad
  - [x] Atributos ARIA: `role="region"`, `aria-expanded`, `aria-controls`
  - [x] IDs únicos para vinculación ARIA
  - [x] Navegación con teclado (Tab, Enter, Space)
  - [x] Focus visible en headers
  
- [x] Documentación inline
  - [x] JSDoc explicando ViewChild y ElementRef
  - [x] Comentarios sobre animaciones y transiciones
  - [x] Ejemplos de uso en `@usageNotes`

**Ejemplo de uso esperado:**
```html
<app-accordion>
  <app-accordion-item title="Sección 1" [expanded]="true">
    Contenido de la sección 1
  </app-accordion-item>
  <app-accordion-item title="Sección 2">
    Contenido de la sección 2
  </app-accordion-item>
</app-accordion>
```

---

### 2. Componente Tabs

**Prioridad:** Alta  
**Ubicación:** `frontend/src/app/components/shared/tabs/`

**Tareas:**
- [ ] Crear estructura base del componente
  - [ ] Archivo `tabs.ts` (componente contenedor)
  - [ ] Archivo `tab.ts` (componente de cada pestaña)
  - [ ] Archivo `tabs.html` y `tab.html`
  - [ ] Archivo `tabs.scss` con estilos BEM
  
- [ ] Implementar funcionalidad
  - [ ] Signal para controlar la pestaña activa
  - [ ] Método `selectTab(index: number)` para cambiar de pestaña
  - [ ] Input `@Input() activeIndex` para pestaña inicial
  - [ ] Output `@Output() tabChange` para emitir cambios
  - [ ] Transiciones smooth entre pestañas (fade in/out)
  
- [ ] Manipulación DOM y eventos
  - [ ] ViewChild para acceder al contenido de cada tab
  - [ ] Event binding en botones de navegación (click)
  - [ ] `@HostListener` para navegación con teclado (Arrow keys)
  - [ ] Modificar propiedades `display` o `opacity` dinámicamente
  - [ ] Gestionar clases CSS activas con `Renderer2`
  
- [ ] Navegación con teclado
  - [ ] Arrow Left/Right para navegar entre pestañas
  - [ ] Home/End para ir a primera/última pestaña
  - [ ] Enter/Space para activar pestaña enfocada
  - [ ] preventDefault en teclas de navegación
  
- [ ] Accesibilidad
  - [ ] Atributos ARIA: `role="tablist"`, `role="tab"`, `role="tabpanel"`
  - [ ] `aria-selected` en pestaña activa
  - [ ] `aria-controls` vinculando tab con su panel
  - [ ] `tabindex="0"` en tab activo, `tabindex="-1"` en inactivos
  
- [ ] Documentación inline
  - [ ] JSDoc explicando arquitectura de eventos
  - [ ] Comentarios sobre gestión de foco
  - [ ] Ejemplos de uso en `@usageNotes`

**Ejemplo de uso esperado:**
```html
<app-tabs [activeIndex]="0">
  <app-tab title="General">
    Contenido general
  </app-tab>
  <app-tab title="Avanzado">
    Contenido avanzado
  </app-tab>
</app-tabs>
```

---

## 📚 Documentación Técnica Pendiente

### 3. Sección Arquitectura de Eventos en README

**Prioridad:** Media  
**Archivo:** `frontend/README.md`

**Tareas:**
- [ ] Añadir nueva sección "## 🎯 Arquitectura de Eventos"
  
- [ ] Subsección: Estrategias de Event Binding
  - [ ] Explicar `@HostListener` vs template event binding
  - [ ] Ejemplos de cuándo usar cada uno
  - [ ] Tabla comparativa de ventajas/desventajas
  
- [ ] Subsección: Manipulación del DOM
  - [ ] Explicar uso de `ViewChild` y `ElementRef`
  - [ ] Cuándo usar `Renderer2` vs acceso directo
  - [ ] Ejemplos prácticos de cada técnica
  
- [ ] Subsección: Gestión de Eventos del Usuario
  - [ ] Eventos de mouse (click, mouseenter, mouseleave)
  - [ ] Eventos de teclado (keydown, keypress, keyup)
  - [ ] Eventos de foco (focus, blur, focusin, focusout)
  - [ ] preventDefault() y stopPropagation() con ejemplos
  
- [ ] Subsección: Patrones de Eventos en el Proyecto
  - [ ] Focus trap en Modal
  - [ ] Click outside en Menú Hamburguesa
  - [ ] Delay pattern en Tooltips
  - [ ] Keyboard navigation en componentes

**Estructura propuesta:**
```markdown
## 🎯 Arquitectura de Eventos

### Event Binding Strategies
...

### DOM Manipulation
...

### User Event Handling
...

### Common Event Patterns
...
```

---

### 4. Diagrama de Flujo de Eventos

**Prioridad:** Media  
**Archivo:** `docs/design/event-architecture.md`

**Tareas:**
- [ ] Crear documento con diagramas de flujo
  
- [ ] Diagrama: Flujo de apertura de Modal
  - [ ] Usuario hace click en botón → ModalService.open()
  - [ ] Service actualiza signals → Modal se renderiza
  - [ ] onModalOpened() → Focus primer elemento
  - [ ] Setup event listeners (ESC, Tab trap, click outside)
  
- [ ] Diagrama: Flujo de Menú Hamburguesa
  - [ ] Usuario click en botón hamburguesa → toggleMenu()
  - [ ] Signal menuOpen cambia → Renderizado condicional
  - [ ] Setup listeners (ESC, click outside, navigation)
  - [ ] Bloqueo de scroll del body
  
- [ ] Diagrama: Flujo de Tooltip
  - [ ] mouseenter → Start timeout
  - [ ] Timeout completo → show()
  - [ ] Crear elemento → Calcular posición
  - [ ] Aplicar estilos → Animación fade-in
  - [ ] mouseleave → hide() → Destruir elemento
  
- [ ] Diagrama: Focus Trap en Modal
  - [ ] Detectar elementos focusables
  - [ ] Tab en último elemento → Foco a primero
  - [ ] Shift+Tab en primero → Foco a último
  - [ ] preventDefault para evitar salida

**Formato:** Usar Mermaid.js o herramienta similar para diagramas

---

### 5. Tabla de Compatibilidad de Navegadores

**Prioridad:** Baja  
**Archivo:** `frontend/README.md` o `docs/browser-compatibility.md`

**Tareas:**
- [ ] Crear tabla de compatibilidad para eventos usados
  
- [ ] Eventos básicos
  - [ ] `click`, `mouseenter`, `mouseleave`
  - [ ] `keydown`, `keypress`, `keyup`
  - [ ] `focus`, `blur`
  
- [ ] APIs modernas
  - [ ] `@HostListener` (Angular - compatible todos)
  - [ ] `getBoundingClientRect()`
  - [ ] `matchMedia('(prefers-color-scheme: dark)')`
  - [ ] `localStorage` API
  - [ ] `crypto.randomUUID()`
  
- [ ] Especificar versiones mínimas soportadas
  - [ ] Chrome/Edge
  - [ ] Firefox
  - [ ] Safari
  - [ ] Navegadores móviles
  
- [ ] Incluir notas sobre polyfills necesarios (si aplica)

**Formato de tabla:**
```markdown
| Evento/API | Chrome | Firefox | Safari | Edge | Notas |
|------------|--------|---------|--------|------|-------|
| click | ✅ All | ✅ All | ✅ All | ✅ All | - |
| ...
```

---

## 🔄 Orden de Implementación Sugerido

### Fase 1: Componentes Core (Prioridad Alta)
1. **Accordion** (2-3 horas)
   - Crear estructura base
   - Implementar funcionalidad básica
   - Añadir accesibilidad
   - Documentar

2. **Tabs** (2-3 horas)
   - Crear estructura base
   - Implementar funcionalidad básica
   - Añadir navegación con teclado
   - Documentar

### Fase 2: Documentación (Prioridad Media)
3. **Sección Arquitectura de Eventos en README** (1-2 horas)
   - Escribir explicaciones
   - Añadir ejemplos de código
   - Crear tabla comparativa

4. **Diagramas de Flujo** (1-2 horas)
   - Crear diagramas con Mermaid.js
   - Documentar flujos principales
   - Integrar en documentación

### Fase 3: Compatibilidad (Prioridad Baja)
5. **Tabla de Compatibilidad** (30 min - 1 hora)
   - Investigar compatibilidad de APIs
   - Crear tabla
   - Añadir notas relevantes

**Tiempo estimado total:** 7-12 horas

---

## 📝 Checklist Final

Una vez completadas todas las tareas:

- [ ] Todos los componentes tienen tests unitarios
- [ ] Todos los componentes están documentados con JSDoc
- [ ] Todos los componentes están exportados en `index.ts`
- [ ] README actualizado con nueva documentación
- [ ] Ejemplos de uso en Style Guide (si aplica)
- [ ] No hay errores de TypeScript
- [ ] No hay errores de linting
- [ ] Build de producción funciona correctamente

---

## 🎓 Conceptos Demostrados

Al completar este TODO, habrás demostrado:

✅ Manipulación del DOM
- ViewChild y ElementRef
- Renderer2 para modificaciones seguras
- Creación/eliminación de elementos dinámicos
- Cálculo de dimensiones y posiciones

✅ Sistema de Eventos
- Event binding en templates
- @HostListener para eventos globales
- Eventos de mouse, teclado y foco
- preventDefault() y stopPropagation()

✅ Componentes Interactivos
- Modal con focus trap
- Menú hamburguesa con click outside
- Acordeones expandibles
- Tabs navegables
- Tooltips posicionables

✅ Accesibilidad
- Atributos ARIA correctos
- Navegación con teclado
- Focus management
- Compatibilidad con lectores de pantalla

✅ Documentación Técnica
- Arquitectura explicada
- Diagramas de flujo
- Tabla de compatibilidad
- Ejemplos de código

---

**¡Éxito con la implementación! 🚀**
