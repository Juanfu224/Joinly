# Proyecto 3: Maquetar para dar forma

## ¿De qué va esto?

Ya tienes el diseño visual definido en Figma. Ahora toca que funcione en el navegador.

Este proyecto transforma tus mockups de alta fidelidad en código HTML/CSS real, integrado en Angular. Aquí convertirás cada decisión visual en arquitectura técnica: variables CSS que escalan, componentes reutilizables que mantienen la coherencia, layouts responsive que funcionan en cualquier dispositivo, imágenes optimizadas que cargan rápido, y una base de accesibilidad que garantiza que tu interfaz sea usable por todas las personas.

No se trata solo de que "se vea igual", sino de construir código profesional, mantenible y escalable. Implementarás una metodología CSS (BEM), organizarás tus estilos siguiendo principios de arquitectura (ITCSS), crearás un sistema de componentes documentado, optimizarás todos los assets multimedia, implementarás responsive design con mobile-first o desktop-first, añadirás modo oscuro, y verificarás que todo sea accesible según WCAG.

Al final de este proyecto tendrás una aplicación Angular completamente funcional, desplegada en producción, con código limpio y bien documentado. Y lo harás siguiendo estándares profesionales: cada línea de CSS tiene un propósito, cada componente es reutilizable, cada imagen está optimizada, y cada interacción es accesible.

> **Requisito obligatorio:** La aplicación debe estar desplegada y accesible mediante una URL pública.

---

## Cronograma

### Bloque 1: Fundamentos (hasta 18 diciembre)
* **Fase 1:** Fundamentos y arquitectura CSS
* **Fase 2:** HTML semántico y estructura
* **Fase 3:** Sistema de componentes visuales

---

## FASE 3: COMPONENTES UI BÁSICOS

* **Criterios:** RA2.g, RA2.e, RA2.f, RA1.f
* **Entrega:** 18 de diciembre

### OBJETIVOS DE LA FASE

En esta fase crearás los componentes UI básicos que se reutilizarán en toda tu aplicación: botones, cards, elementos de formulario adicionales, navegación responsive, y elementos de feedback. Estos son los "bloques de construcción" que luego combinarás para crear páginas completas.

La clave aquí es que cada componente debe tener todas sus variantes, todos sus tamaños, y todos sus estados (hover, focus, active, disabled). Un botón bien hecho no es solo un rectángulo azul, es un sistema completo: botón primary, secondary, ghost; tamaños small, medium, large; estados normal, hover, focus, active, disabled.

También crearás un **Style Guide**: una página especial donde muestras TODOS tus componentes con TODAS sus variantes. Esto sirve como documentación visual y para testing rápido.

### TAREAS

#### 1. Botones (`app-button`)
Crea el componente usando:
`ng generate component components/shared/button`

Debe soportar:
* **Variantes (modificadores BEM):**
    * `.button--primary` (color principal, para acciones principales)
    * `.button--secondary` (color secundario, para acciones secundarias)
    * `.button--ghost` (sin fondo, solo texto y borde opcional)
    * `.button--danger` (rojo, para acciones destructivas como eliminar)
* **Tamaños:**
    * `.button--sm` (pequeño)
    * `.button--md` (mediano, por defecto)
    * `.button--lg` (grande)
* **Estados CSS:**
    * `:hover` (cambio al pasar el mouse)
    * `:focus` (outline visible para navegación con teclado)
    * `:active` (efecto al hacer clic)
    * `[disabled]` o `.button--disabled` (botón no clickeable, opacidad reducida)

#### 2. Cards (`app-card`)
Crea el componente usando:
`ng generate component components/shared/card`

Crea al menos dos variantes:
* **Variante básica:**
    * Imagen (opcional)
    * Título
    * Descripción
    * Botón de acción (opcional)
* **Variante horizontal (OPCIONAL):**
    * Imagen a la izquierda
    * Contenido a la derecha
* **Requisito:** Debe incluir estados hover con transiciones (elevación de sombra, transformación).

#### 3. Elementos de formulario adicionales
Además del `form-input` de la Fase 2, crea:

* **Textarea (OBLIGATORIO):**
    `ng generate component components/shared/form-textarea`
    Similar a form-input pero con `<textarea>` en lugar de `<input>`.
* **Select (OBLIGATORIO):**
    `ng generate component components/shared/form-select`
    Dropdown con `<select>` y `<option>`. Debe incluir label asociado.
* **Checkbox (OPCIONAL):**
    `ng generate component components/shared/form-checkbox`
    Input tipo checkbox con label asociado.
* **Radio buttons (OPCIONAL):**
    `ng generate component components/shared/form-radio-group`
    Grupo de radio buttons del mismo `name`.

#### 4. Navegación responsive
**Menú hamburguesa en header:**
Añade a tu componente header de Fase 2:
* Botón hamburguesa (visible solo en mobile).
* Menú que se muestra/oculta al hacer clic.
* Navegación horizontal en desktop.
* Transiciones suaves.

**Breadcrumbs (OPCIONAL):**
`ng generate component components/shared/breadcrumbs`
Navegación de migas de pan con lista ordenada mostrando la ruta actual.

#### 5. Elementos de feedback
**Alerts (OBLIGATORIO):**
`ng generate component components/shared/alert`

Tipos mediante modificadores BEM:
* `.alert--success` (verde, para confirmaciones)
* `.alert--error` (rojo, para errores)
* `.alert--warning` (naranja, para advertencias)
* `.alert--info` (azul, para información)
* Debe poder cerrarse (botón X opcional).

**Notificaciones/Toast (OPCIONAL):**
`ng generate component components/shared/notification`
Similar a alert pero con posición fixed (esquina de pantalla) y animaciones de entrada/salida.

#### 6. Componentes adicionales (OPCIONALES - elige según tiempo)
Si terminas lo obligatorio y tienes tiempo, añade 1-3 de estos:

* **Modales:** `ng generate component components/shared/modal` (Ventana superpuesta con overlay oscuro. Debe poder cerrarse con botón X y tecla ESC).
* **Tablas responsive:** `ng generate component components/shared/data-table` (Tabla que en mobile se adapta: cards o scroll horizontal).
* **Badges:** `ng generate component components/shared/badge` (Pequeñas etiquetas para estados, categorías, contadores).
* **Tabs:** `ng generate component components/shared/tabs` (Sistema de pestañas para organizar contenido).
* **Paginación:** `ng generate component components/shared/pagination` (Controles de paginación: anterior, siguiente, números de página).
* **Sistema de iconos:** Integra una librería de iconos (Heroicons, Font Awesome, Material Icons, Feather Icons) o crea componentes SVG propios.

#### 7. Style Guide
Crea una página especial para mostrar todos tus componentes.
`ng generate component pages/style-guide`

En el HTML muestra:
* TODOS los componentes creados.
* TODAS las variantes de cada componente.
* TODOS los tamaños.
* TODOS los estados.

Organiza por secciones: Botones, Cards, Formularios, Navegación, Feedback, etc.
**Nota:** Añade una ruta en tu router de Angular para acceder a `/style-guide`.

#### 8. Documentación en DOCUMENTACION.md
Añade la **Sección 3: Sistema de componentes UI** a tu archivo `docs/DOCUMENTACION.md`.

Esta sección debe incluir:
* **3.1 Componentes implementados:** Lista TODOS los componentes creados. Para cada uno documenta:
    * Nombre del componente.
    * Propósito.
    * Variantes disponibles.
    * Tamaños disponibles.
    * Estados que maneja.
    * Ejemplo de uso (código).
* **3.2 Nomenclatura y metodología:** Muestra ejemplos reales de tu nomenclatura BEM aplicada en los componentes. Explica tu estrategia: qué es block vs element, cuándo usas modificadores vs clases de estado.
* **3.3 Style Guide:** Incluye capturas de pantalla de tu página de Style Guide mostrando los componentes. Explica para qué sirve (documentación visual, testing, referencia).

---

### ENTREGABLES FASE 3

- [ ] 5 componentes obligatorios: botones, cards, textarea, select, alerts.
- [ ] Navegación responsive (menú hamburguesa funcional).
- [ ] Componentes adicionales opcionales (según tiempo).
- [ ] Archivo SCSS por cada componente siguiendo BEM.
- [ ] Style Guide funcional en `/style-guide`.
- [ ] Sección 3 del `docs/design/DOCUMENTACION.md` completada con capturas.