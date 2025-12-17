# 📋 TODO: Proyecto 3 - Componentes Interactivos y Eventos

> Lista de tareas pendientes para completar los requisitos de la Fase 3
> Última actualización: 17 de diciembre de 2025

---

## 🎯 Visión General

Este documento organiza las tareas pendientes en orden de prioridad para completar los requisitos de la rúbrica. Se recomienda seguir el orden establecido para maximizar el impacto en la evaluación.

---

## 🔴 PRIORIDAD CRÍTICA (Requisitos obligatorios)

### 1. Theme Switcher Funcional

**Objetivo:** Implementar sistema completo de cambio de tema claro/oscuro con persistencia.

- [ ] **1.1 Crear servicio de temas**
  - [ ] Generar servicio: `ng g service services/theme`
  - [ ] Implementar detección de `prefers-color-scheme`
  - [ ] Crear método para aplicar tema (añadir/quitar clase en `<html>`)
  - [ ] Implementar persistencia en `localStorage`
  - [ ] Crear signal para estado del tema actual

- [ ] **1.2 Crear componente theme-toggle**
  - [ ] Generar componente: `ng g component components/shared/theme-toggle`
  - [ ] Diseñar botón de toggle (icono sol/luna)
  - [ ] Implementar event binding `(click)` para cambiar tema
  - [ ] Añadir transiciones suaves al cambio de tema
  - [ ] Implementar estados hover y focus accesibles

- [ ] **1.3 Definir variables CSS para tema oscuro**
  - [ ] Crear bloque `[data-theme="dark"]` en `_css-variables.scss`
  - [ ] Definir colores oscuros para backgrounds
  - [ ] Definir colores claros para texto
  - [ ] Ajustar colores de componentes (botones, cards, etc.)
  - [ ] Probar contraste accesible (WCAG AA)

- [ ] **1.4 Integrar theme-toggle en el layout**
  - [ ] Añadir componente al `HeaderComponent`
  - [ ] Posicionar en el área de utilidad (junto a botones de login)
  - [ ] Asegurar que sea visible en mobile y desktop
  - [ ] Probar funcionamiento en todas las páginas

- [ ] **1.5 Inicialización al cargar la app**
  - [ ] Inyectar `ThemeService` en `App` component
  - [ ] Llamar a método de inicialización en `ngOnInit` o constructor
  - [ ] Verificar que respeta la preferencia guardada
  - [ ] Fallback a preferencia del sistema si no hay guardada

---

### 2. Menú Hamburguesa Responsive

**Objetivo:** Implementar navegación móvil funcional en el header.

- [ ] **2.1 Actualizar HeaderComponent con estado**
  - [ ] Añadir signal para controlar apertura: `menuOpen = signal(false)`
  - [ ] Crear método `toggleMenu()` que invierte el estado
  - [ ] Crear método `closeMenu()` para cerrar explícitamente

- [ ] **2.2 Añadir botón hamburguesa al HTML**
  - [ ] Crear botón con icono de menú (3 líneas)
  - [ ] Añadir `(click)="toggleMenu()"` event binding
  - [ ] Mostrar solo en mobile con media query o clase condicional
  - [ ] Añadir atributos ARIA: `aria-label`, `aria-expanded`
  - [ ] Animar transformación a X cuando está abierto

- [ ] **2.3 Crear menú navegación móvil**
  - [ ] Añadir `<nav>` con lista de enlaces
  - [ ] Aplicar clase condicional: `[class.c-header__nav--abierto]="menuOpen()"`
  - [ ] Añadir enlaces: Inicio, Style Guide, Login, Registro
  - [ ] Ocultar por defecto con `transform: translateX(-100%)`
  - [ ] Mostrar con transición suave cuando `--abierto`

- [ ] **2.4 Estilos responsive en header.scss**
  - [ ] Estilos para botón hamburguesa (solo mobile)
  - [ ] Estilos para menú cerrado (fuera de pantalla)
  - [ ] Estilos para menú abierto (visible con animación)
  - [ ] Media query desktop: ocultar hamburguesa, mostrar nav horizontal
  - [ ] Transiciones suaves con `transition: transform 300ms ease-out`

- [ ] **2.5 Cerrar al hacer click fuera (ClickOutside)**
  - [ ] Usar `@HostListener('document:click', ['$event'])`
  - [ ] Verificar si el click fue fuera del menú
  - [ ] Llamar a `closeMenu()` si es fuera
  - [ ] Asegurar que el click en el botón no cierra inmediatamente

- [ ] **2.6 Cerrar con tecla ESC**
  - [ ] Añadir `@HostListener('document:keydown.escape')`
  - [ ] Llamar a `closeMenu()` al presionar ESC
  - [ ] Solo cerrar si el menú está abierto

- [ ] **2.7 Cerrar al navegar a otra ruta**
  - [ ] Inyectar `Router` de Angular
  - [ ] Suscribirse a eventos de navegación
  - [ ] Llamar a `closeMenu()` en cada navegación
  - [ ] Limpiar suscripción en `ngOnDestroy`

---

## 🟡 PRIORIDAD ALTA (Mejora significativa de experiencia)

### 3. Sistema de Eventos Avanzado

**Objetivo:** Implementar manejo robusto de eventos en componentes.

- [ ] **3.1 Eventos de teclado**
  - [ ] Implementar navegación con Tab en modales
  - [ ] Trap focus dentro de modales abiertos
  - [ ] Cerrar modales con ESC
  - [ ] Submit en formularios con Enter
  - [ ] Prevenir submit múltiple con throttle

- [ ] **3.2 Eventos de mouse avanzados**
  - [ ] Implementar hover en tooltips con `(mouseenter)` y `(mouseleave)`
  - [ ] Añadir delay antes de mostrar tooltip (200-300ms)
  - [ ] Cancelar timeout si el mouse sale antes
  - [ ] Posicionar tooltip dinámicamente según espacio disponible

- [ ] **3.3 Prevención de comportamientos por defecto**
  - [ ] Usar `$event.preventDefault()` en enlaces que abren modales
  - [ ] Prevenir scroll de fondo cuando modal está abierto
  - [ ] Restaurar scroll al cerrar modal
  - [ ] Documentar cada uso de `preventDefault()`

- [ ] **3.4 Control de propagación**
  - [ ] Usar `$event.stopPropagation()` en elementos anidados clickeables
  - [ ] Evitar que clicks en modal interior cierren el modal
  - [ ] Documentar casos de uso de `stopPropagation()`

---

### 4. Componentes Interactivos Adicionales

**Objetivo:** Crear componentes UI avanzados con interactividad completa.

- [ ] **4.1 Modal Component**
  - [ ] Generar componente: `ng g component components/shared/modal`
  - [ ] Crear estructura HTML: overlay + contenido
  - [ ] Input para título, contenido (ng-content)
  - [ ] Output para evento de cierre: `@Output() closed = new EventEmitter()`
  - [ ] Botón X para cerrar con `(click)`
  - [ ] Cerrar al hacer click en overlay (no en contenido)
  - [ ] Cerrar con tecla ESC usando `@HostListener`
  - [ ] Trap focus dentro del modal (solo TAB dentro)
  - [ ] Prevenir scroll del body cuando está abierto
  - [ ] Animación de entrada y salida
  - [ ] Añadir al style-guide con ejemplos

- [ ] **4.2 Tooltip Component**
  - [ ] Generar componente: `ng g component components/shared/tooltip`
  - [ ] Implementar directiva tooltip o componente wrapper
  - [ ] Mostrar con `@HostListener('mouseenter')` con delay
  - [ ] Ocultar con `@HostListener('mouseleave')`
  - [ ] Mostrar con focus para accesibilidad
  - [ ] Posicionamiento dinámico (arriba, abajo, izquierda, derecha)
  - [ ] Flecha apuntando al elemento
  - [ ] Animación de fade-in/fade-out
  - [ ] Añadir al style-guide

- [ ] **4.3 Accordion Component (OPCIONAL)**
  - [ ] Generar componente: `ng g component components/shared/accordion`
  - [ ] Estructura: accordion-item con header y content
  - [ ] Toggle al hacer click en header
  - [ ] Animación de expansión/colapso
  - [ ] Solo uno abierto a la vez (opcional)
  - [ ] Iconos que rotan al abrir/cerrar
  - [ ] Accesible con teclado (Enter/Space para toggle)
  - [ ] Añadir al style-guide

- [ ] **4.4 Tabs Component (OPCIONAL)**
  - [ ] Generar componente: `ng g component components/shared/tabs`
  - [ ] Lista de pestañas + paneles de contenido
  - [ ] Cambiar contenido al hacer click en pestaña
  - [ ] Indicador visual de pestaña activa
  - [ ] Animación de transición entre paneles
  - [ ] Navegación con flechas de teclado
  - [ ] ARIA roles: `role="tablist"`, `role="tab"`, `role="tabpanel"`
  - [ ] Añadir al style-guide

---

### 5. Manipulación Avanzada del DOM

**Objetivo:** Demostrar uso de ViewChild, ElementRef y manipulación directa.

- [ ] **5.1 Ejemplo práctico en Modal**
  - [ ] Usar `@ViewChild('modalContent', { read: ElementRef })` 
  - [ ] Enfocar primer elemento interactivo al abrir modal
  - [ ] Usar `nativeElement.focus()` programáticamente
  - [ ] Guardar elemento que abrió el modal
  - [ ] Restaurar foco al elemento original al cerrar

- [ ] **5.2 Ejemplo práctico en Tooltip**
  - [ ] Usar `@ViewChild` para referenciar contenedor del tooltip
  - [ ] Calcular posición dinámica con `getBoundingClientRect()`
  - [ ] Aplicar estilos inline dinámicos: `top`, `left`
  - [ ] Ajustar posición si se sale de la pantalla
  - [ ] Documentar el proceso en código

- [ ] **5.3 Ejemplo práctico en Form**
  - [ ] Usar `@ViewChild` para acceder a un input específico
  - [ ] Enfocar input automáticamente al mostrar error
  - [ ] Scroll hasta el primer campo con error
  - [ ] Modificar clases CSS dinámicamente con Renderer2

- [ ] **5.4 Documentar uso de ViewChild**
  - [ ] Añadir comentarios JSDoc en cada uso
  - [ ] Explicar por qué se manipula el DOM directamente
  - [ ] Documentar alternativas (data binding vs manipulación directa)

---

## 🟢 PRIORIDAD MEDIA (Valor añadido)

### 6. Documentación Técnica

**Objetivo:** Completar documentación sobre arquitectura de eventos.

- [ ] **6.1 Añadir sección a DOCUMENTACION.md**
  - [ ] Crear sección: "4. Arquitectura de Eventos"
  - [ ] Subsección 4.1: Tipos de eventos implementados
  - [ ] Subsección 4.2: Patrones de event binding
  - [ ] Subsección 4.3: Gestión de eventos del DOM vs Angular

- [ ] **6.2 Diagrama de flujo de eventos**
  - [ ] Crear diagrama de flujo para apertura/cierre de modal
  - [ ] Diagrama para menú hamburguesa
  - [ ] Diagrama para theme switcher
  - [ ] Incluir capturas o usar Mermaid.js para diagramas
  - [ ] Añadir al documento

- [ ] **6.3 Tabla de compatibilidad de navegadores**
  - [ ] Listar eventos utilizados (click, keydown, mouseenter, etc.)
  - [ ] Indicar compatibilidad con navegadores modernos
  - [ ] Señalar polyfills necesarios si aplica
  - [ ] Incluir referencias a Can I Use

- [ ] **6.4 Mejores prácticas documentadas**
  - [ ] Cuándo usar event binding vs @HostListener
  - [ ] Cuándo usar ViewChild vs template reference
  - [ ] Performance: debounce y throttle en eventos
  - [ ] Accesibilidad en eventos (focus, keyboard)

---

### 7. Testing de Componentes Interactivos

**Objetivo:** Asegurar calidad mediante tests unitarios.

- [ ] **7.1 Tests para ThemeService**
  - [ ] Test: detecta preferencia del sistema
  - [ ] Test: guarda tema en localStorage
  - [ ] Test: lee tema de localStorage al iniciar
  - [ ] Test: aplica clase correcta al HTML

- [ ] **7.2 Tests para MenuHamburguesa**
  - [ ] Test: abre menú al hacer click
  - [ ] Test: cierra menú al hacer click fuera
  - [ ] Test: cierra menú con ESC
  - [ ] Test: cierra menú al navegar

- [ ] **7.3 Tests para Modal**
  - [ ] Test: se cierra con ESC
  - [ ] Test: se cierra al hacer click en overlay
  - [ ] Test: emite evento closed correctamente
  - [ ] Test: previene scroll del body

- [ ] **7.4 Tests para componentes con ViewChild**
  - [ ] Test: accede correctamente al elemento
  - [ ] Test: modifica propiedades del DOM
  - [ ] Test: restaura foco correctamente

---



## 🎓 Recursos Útiles

### Angular
- [ViewChild y ViewChildren](https://angular.dev/api/core/ViewChild)
- [ElementRef](https://angular.dev/api/core/ElementRef)
- [HostListener](https://angular.dev/api/core/HostListener)
- [Renderer2](https://angular.dev/api/core/Renderer2)

### Eventos del DOM
- [MDN: Introducción a Eventos](https://developer.mozilla.org/es/docs/Learn/JavaScript/Building_blocks/Events)
- [MDN: preventDefault](https://developer.mozilla.org/es/docs/Web/API/Event/preventDefault)
- [MDN: stopPropagation](https://developer.mozilla.org/es/docs/Web/API/Event/stopPropagation)

### Accesibilidad
- [WAI-ARIA: Modal Dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
- [WAI-ARIA: Tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/)
- [Focus Management](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/)

### Temas
- [prefers-color-scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme)
- [Window.matchMedia](https://developer.mozilla.org/es/docs/Web/API/Window/matchMedia)
- [Dark Mode Best Practices](https://web.dev/prefers-color-scheme/)

---

## 💡 Consejos para la Implementación

1. **Orden recomendado:** Sigue el orden de prioridad establecido
2. **Commits frecuentes:** Haz commit después de cada tarea completada
3. **Testing continuo:** Prueba en mobile y desktop después de cada implementación
4. **Accesibilidad primero:** Verifica con teclado y lector de pantalla
5. **Performance:** Usa ChangeDetectionStrategy.OnPush en todos los componentes
6. **Documentación:** Comenta código complejo, especialmente manipulación del DOM
7. **Style Guide:** Actualiza `/style-guide` con cada nuevo componente

---

## ✅ Criterios de Aceptación

Una tarea se considera **completada** cuando:

- ✅ El código funciona correctamente en Chrome, Firefox y Safari
- ✅ Es responsive (funciona en mobile, tablet y desktop)
- ✅ Es accesible (navegable con teclado, compatible con lectores de pantalla)
- ✅ Está documentado (comentarios JSDoc en funciones complejas)
- ✅ Sigue las convenciones del proyecto (BEM, ITCSS, TypeScript strict)
- ✅ Está añadido al Style Guide (si es componente visual)
- ✅ No genera errores en consola
- ✅ Pasa los tests (si aplica)

---

**¡Buena suerte con la implementación! 🚀**
