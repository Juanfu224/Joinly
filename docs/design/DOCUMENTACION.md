# Documentación de Diseño - Joinly

## Índice

- [1.1 Principios de comunicación visual](#11-principios-de-comunicación-visual)
  - [1.1.1 Jerarquía](#111-jerarquía)
  - [1.1.2 Contraste](#112-contraste)
  - [1.1.3 Alineación](#113-alineación)
  - [1.1.4 Proximidad](#114-proximidad)
  - [1.1.5 Repetición](#115-repetición)
  - [1.1.6 Resumen](#116-resumen)
- [1.2 Metodología CSS](#12-metodología-css)
  - [1.2.1 Introducción a BEM](#121-introducción-a-bem)
  - [1.2.2 Ejemplo Práctico: Tarjeta de Estadísticas](#122-ejemplo-práctico-tarjeta-de-estadísticas)
  - [1.2.3 Ejemplo Práctico: Sistema de Botones](#123-ejemplo-práctico-sistema-de-botones)
  - [1.2.4 Beneficios de BEM en Angular](#124-beneficios-de-bem-en-angular)
  - [1.2.5 Resumen](#125-resumen)
- [1.3 Organización de archivos](#13-organización-de-archivos)
  - [1.3.1 Arquitectura ITCSS](#131-arquitectura-itcss)
  - [1.3.2 Estructura de directorios](#132-estructura-de-directorios)
  - [1.3.3 Explicación capa por capa](#133-explicación-capa-por-capa)
  - [1.3.4 El archivo main.scss](#134-el-archivo-mainscss)
  - [1.3.5 Flujo de especificidad](#135-flujo-de-especificidad)
  - [1.3.6 Beneficios de ITCSS](#136-beneficios-de-itcss)
- [1.4 Sistema de Design Tokens](#14-sistema-de-design-tokens)
  - [1.4.1 Paleta de Colores](#141-paleta-de-colores)
  - [1.4.2 Escala Tipográfica](#142-escala-tipográfica)
  - [1.4.3 Sistema de Espaciado](#143-sistema-de-espaciado)
  - [1.4.4 Breakpoints (Responsive Design)](#144-breakpoints-responsive-design)
  - [1.4.5 Tokens Adicionales](#145-tokens-adicionales)
  - [1.4.6 Resumen](#146-resumen)
- [1.5 Mixins y Funciones](#15-mixins-y-funciones)
  - [1.5.1 Media Queries Responsive](#151-media-queries-responsive-responder-a)
  - [1.5.2 Centrado Flexbox](#152-centrado-flexbox-centrar-flex)
  - [1.5.3 Truncado de Texto](#153-truncado-de-texto-truncar-texto)
  - [1.5.4 Foco Visible Accesible](#154-foco-visible-accesible-foco-visible)
  - [1.5.5 Oculto Accesible](#155-oculto-accesible-oculto-accesible)
  - [1.5.6 Ratio de Aspecto](#156-ratio-de-aspecto-ratio-aspecto)
  - [1.5.7 Transición Suave](#157-transición-suave-transicion)
  - [1.5.8 Resumen de Mixins](#158-resumen-de-mixins)
  - [1.5.9 Por qué los mixins viven en 01-tools](#159-por-qué-los-mixins-viven-en-01-tools)
- [1.6 ViewEncapsulation en Angular](#16-viewencapsulation-en-angular)
  - [1.6.1 ¿Qué es ViewEncapsulation?](#161-qué-es-viewencapsulation)
  - [1.6.2 Análisis de cada estrategia](#162-análisis-de-cada-estrategia)
  - [1.6.3 Decisión para Joinly](#163-decisión-para-joinly-viewencapsulationnone)
  - [1.6.4 Implementación práctica](#164-implementación-práctica)
  - [1.6.5 Cuándo considerar otras estrategias](#165-cuándo-considerar-otras-estrategias)
  - [1.6.6 Resumen](#166-resumen)

---

## 1.1 Principios de comunicación visual

Los principios de comunicación visual son las reglas fundamentales que guían cada decisión de diseño en Joinly. No son arbitrarios: cada uno tiene un propósito claro orientado a mejorar la experiencia del usuario, facilitar la comprensión de la interfaz y reforzar la identidad de marca. A continuación, explicamos cómo aplicamos estos cinco principios en nuestra aplicación.

### 1.1.1 Jerarquía

La jerarquía visual establece el orden de importancia de los elementos en pantalla, guiando al usuario sobre qué debe ver primero y qué es secundario.

**Aplicación en Joinly:**

- **Tamaño y peso tipográfico:** Los títulos principales como "Familia López" o "Spotify Family" utilizan un tamaño de fuente mayor (entre 24px y 32px) y peso **bold**, mientras que los metadatos como "Gestiona suscripciones o crea alguna" emplean un tamaño menor (14px-16px) y peso regular en color gris atenuado. Esta diferenciación permite al usuario identificar instantáneamente el contexto de la página.

- **Jerarquía cromática en botones:** Implementamos una escala clara de importancia mediante el color:
  - **Acciones principales:** Botones rellenos con colores vibrantes (naranja `#F97316` para acciones de creación como "Crear suscripción", "Crear"; morado `#8B5CF6` para acciones de autenticación como "Registrar").
  - **Acciones secundarias:** Botones con fondo blanco, borde gris y texto oscuro ("Cancelar", "Copiar"), que visualmente "retroceden" frente a los botones principales.

Esta diferenciación reduce la carga cognitiva del usuario, ya que intuitivamente sabe qué botón cumple la acción esperada.

![Jerarquía visual de botones en Joinly](images/jerarquia-botones.png)

### 1.1.2 Contraste

El contraste garantiza la legibilidad y accesibilidad del contenido, además de crear separaciones visuales claras entre secciones.

**Aplicación en Joinly:**

- **Texto sobre fondos:** Utilizamos texto oscuro (gris oscuro `#1F2937` o negro) sobre tarjetas blancas (`#FFFFFF`), asegurando una ratio de contraste superior a 4.5:1, cumpliendo con las pautas WCAG 2.1 de accesibilidad nivel AA. Esto garantiza que usuarios con dificultades visuales puedan leer el contenido sin esfuerzo.

- **Delimitación de secciones:** El footer emplea un fondo azul oscuro/negro (`#0F172A`) que contrasta drásticamente con el cuerpo de la página (fondo off-white `#FFFBF5`). Este contraste extremo actúa como un "cierre visual", indicando claramente al usuario que ha llegado al final del contenido principal.

- **Estados de elementos:** Los badges de estado ("Disponible", "Admin", "Retenido") utilizan fondos de color con texto en contraste:
  - Verde para disponibilidad
  - Naranja para estados de administrador
  - Azul para estados de pago retenido

![Contraste y estados visuales en Joinly](images/contraste-estados.png)

### 1.1.3 Alineación

La alineación crea orden visual y conexiones implícitas entre elementos, facilitando el escaneo de información.

**Aplicación en Joinly:**

- **Alineación a la izquierda:** Todos los formularios, títulos y bloques de texto siguen una alineación predominante a la izquierda. Esta decisión se basa en el **patrón de lectura en F** (F-Pattern), documentado por estudios de eye-tracking de Nielsen Norman Group, que demuestra que los usuarios occidentales escanean las páginas formando una letra "F" imaginaria, comenzando por la esquina superior izquierda.

- **Consistencia en Header y Footer:** Los elementos de navegación del header (logo, menú, botones de acción, avatar) y las columnas del footer están distribuidos mediante un sistema de rejilla (CSS Grid/Flexbox) con espaciados consistentes. El logo siempre ancla el extremo izquierdo, mientras que las acciones del usuario (notificaciones, perfil) se ubican en el extremo derecho, siguiendo convenciones UX establecidas.

- **Formularios estructurados:** En los modales de creación (grupo, suscripción, login), cada campo mantiene una alineación vertical perfecta: etiqueta → input → siguiente campo, creando un flujo de lectura predecible y reduciendo errores de entrada.

![Alineación en formularios de Joinly](images/alineacion-formularios.png)

### 1.1.4 Proximidad

La proximidad agrupa elementos relacionados, ayudando al cerebro a procesar la información como unidades lógicas en lugar de elementos aislados.

**Aplicación en Joinly:**

- **Tarjetas de suscripción:** Dentro de cada card, los elementos relacionados se agrupan físicamente:

  - Nombre del servicio ("Spotify Family") + icono de miembros en la parte superior
  - Precio ("3,00€") + fecha de renovación + badge de estado en la parte inferior

  Estos elementos comparten un contenedor blanco con padding interno consistente (`16px-24px`), separándolos visualmente del resto de la interfaz mediante espacio negativo (whitespace).

- **Formularios:** La etiqueta (label) se posiciona inmediatamente encima de su input correspondiente (separación de `4px-8px`), mientras que campos diferentes mantienen una separación mayor (`16px-24px`). Esta diferencia de espaciado comunica visualmente qué label pertenece a qué campo sin necesidad de líneas o bordes adicionales.

- **Sección de miembros:** El avatar, nombre de usuario, email y badge de rol ("Admin") se agrupan horizontalmente en una misma fila, indicando que toda esa información pertenece a un único usuario.

![Proximidad y agrupación en tarjetas de Joinly](images/proximidad-tarjetas.png)

### 1.1.5 Repetición

La repetición crea consistencia y refuerza la identidad de marca. En términos técnicos, implementamos esto mediante **Design Tokens**: valores reutilizables para colores, espaciados, radios de borde y sombras.

**Aplicación en Joinly:**

- **Radio de borde (border-radius):** Todos los elementos interactivos comparten valores consistentes:

  - Botones: `8px` de radio para esquinas suavemente redondeadas
  - Tarjetas (Cards): `12px-16px` para un aspecto amigable y moderno
  - Inputs: `8px` para mantener coherencia con los botones

- **Sistema de sombras (elevation):** Las tarjetas utilizan una sombra sutil y consistente (`box-shadow: 0 1px 3px rgba(0,0,0,0.1)`) que crea una sensación de "elevación" sobre el fondo off-white sin resultar intrusiva. Esta misma sombra se repite en modales y dropdowns.

- **Espaciados (spacing):** Implementamos una escala de espaciado basada en múltiplos de 4px (`4px, 8px, 16px, 24px, 32px`), garantizando ritmo visual y consistencia en toda la aplicación.

- **Paleta cromática reducida:** Limitamos los colores de acento a dos tonos principales (naranja y morado) más sus variantes, evitando el ruido visual y creando una identidad reconocible. El usuario aprende rápidamente que "naranja = acción relacionada con grupos/suscripciones" y "morado = autenticación".

Esta repetición sistemática permite que nuevos usuarios comprendan intuitivamente la interfaz: si un elemento se ve como un botón, se comportará como un botón. Si una tarjeta tiene sombra, es interactiva o contiene información agrupada.

![Repetición y design tokens en Joinly](images/repeticion-design-tokens.png)

### 1.1.6 Resumen

| Principio      | Implementación en Joinly                                                              |
| -------------- | ------------------------------------------------------------------------------------- |
| **Jerarquía**  | Tamaños tipográficos diferenciados + botones primarios (color) vs secundarios (borde) |
| **Contraste**  | Texto oscuro sobre blanco + footer oscuro como cierre visual                          |
| **Alineación** | Alineación izquierda (patrón F) + grid consistente en header/footer                   |
| **Proximidad** | Agrupación en tarjetas + labels pegados a inputs                                      |
| **Repetición** | Design tokens: border-radius, shadows, spacing y colores consistentes                 |

Estos principios no son reglas aisladas, sino que trabajan en conjunto. Una tarjeta bien diseñada aplica los cinco: tiene jerarquía interna (título vs metadatos), contraste adecuado, alineación consistente, agrupa elementos relacionados por proximidad y repite los mismos estilos que otras tarjetas de la aplicación.

---

## 1.2 Metodología CSS

### 1.2.1 Introducción a BEM

**BEM** (Block, Element, Modifier) es una metodología de nomenclatura para clases CSS desarrollada por Yandex que proporciona una convención clara y predecible para nombrar selectores. En Joinly, adoptamos BEM como estándar porque resuelve problemas fundamentales del CSS a escala:

- **Evita conflictos de especificidad:** Al usar clases planas (sin anidamiento excesivo), eliminamos las guerras de especificidad donde un selector `.card .title` compite con `.section .card .title`.
- **Código autodocumentado:** Una clase como `.subscription-card__price--highlighted` comunica instantáneamente su propósito sin necesidad de buscar en el código fuente.
- **Escalabilidad:** Permite que múltiples desarrolladores trabajen en el mismo proyecto sin pisar el trabajo del otro.

**La sintaxis BEM se estructura así:**

```
.bloque {}
.bloque__elemento {}
.bloque--modificador {}
.bloque__elemento--modificador {}
```

| Componente   | Símbolo                 | Propósito                               |
| ------------ | ----------------------- | --------------------------------------- |
| **Block**    | (ninguno)               | Componente independiente y reutilizable |
| **Element**  | `__` (doble guion bajo) | Parte interna que depende del bloque    |
| **Modifier** | `--` (doble guion)      | Variación de apariencia o estado        |

### 1.2.2 Ejemplo Práctico: Tarjeta de Estadísticas

En la vista de detalle de una suscripción ("Spotify Family"), encontramos tres tarjetas que muestran información resumida: **Renovación**, **Plazas disponibles** y **Tu aporte**. Estas tarjetas comparten la misma estructura pero muestran datos diferentes.

![Ejemplo BEM: Tarjeta de estadísticas](images/bem-tarjeta-estadisticas.png)

**Estructura HTML con BEM:**

```html
<article class="stat-card">
  <div class="stat-card__icon stat-card__icon--calendar">
    <svg><!-- icono de calendario --></svg>
  </div>
  <div class="stat-card__content">
    <span class="stat-card__title">Renovación</span>
    <span class="stat-card__value">1 de Enero de 2026</span>
  </div>
</article>

<article class="stat-card">
  <div class="stat-card__icon stat-card__icon--users">
    <svg><!-- icono de usuarios --></svg>
  </div>
  <div class="stat-card__content">
    <span class="stat-card__title">Plazas disponibles</span>
    <span class="stat-card__value">3 plazas</span>
  </div>
</article>

<article class="stat-card">
  <div class="stat-card__icon stat-card__icon--money">
    <svg><!-- icono de dinero --></svg>
  </div>
  <div class="stat-card__content">
    <span class="stat-card__title">Tu aporte</span>
    <span class="stat-card__value">0,75€</span>
  </div>
</article>
```

**Estilos SCSS correspondientes:**

```scss
// === BLOQUE: Contenedor principal ===
.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 24px;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;

  // === ELEMENTO: Contenedor del icono ===
  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: 8px;

    // === MODIFICADORES: Variantes de color según el tipo ===
    &--calendar {
      background-color: #fef3c7; // Amarillo suave
      color: #f59e0b;
    }

    &--users {
      background-color: #dbeafe; // Azul suave
      color: #3b82f6;
    }

    &--money {
      background-color: #fef3c7; // Amarillo suave
      color: #f59e0b;
    }
  }

  // === ELEMENTO: Contenedor de texto ===
  &__content {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  // === ELEMENTO: Título descriptivo ===
  &__title {
    font-size: 14px;
    font-weight: 500;
    color: #1f2937;
  }

  // === ELEMENTO: Valor principal ===
  &__value {
    font-size: 16px;
    font-weight: 400;
    color: #6b7280;
  }
}
```

**Análisis del ejemplo:**

- **`.stat-card`** es el **Bloque**: representa el componente completo y autónomo. Puede existir en cualquier parte de la aplicación.
- **`.stat-card__icon`**, **`.stat-card__title`**, **`.stat-card__value`** son **Elementos**: solo tienen sentido dentro del contexto de `.stat-card`. Fuera de él, no tendrían propósito.
- **`.stat-card__icon--calendar`** es un **Modificador**: altera el color de fondo del icono sin cambiar su estructura. Podemos añadir `--users`, `--money`, etc., para otras variantes.

### 1.2.3 Ejemplo Práctico: Sistema de Botones

Los botones en Joinly siguen un patrón consistente con variaciones para diferentes contextos: acciones principales (crear, registrar), acciones secundarias (cancelar) y acciones de peligro (eliminar).

![Ejemplo BEM: Sistema de botones - Variantes primarias](images/bem-sistema-botones-1.png)
![Ejemplo BEM: Sistema de botones - Variantes secundarias](images/bem-sistema-botones-2.png)

**Estructura HTML con BEM:**

```html
<!-- Botón primario naranja (Crear grupo, Crear suscripción) -->
<button class="btn btn--primary">Crear</button>

<!-- Botón primario morado (Autenticación) -->
<button class="btn btn--primary btn--purple">Registrar</button>

<!-- Botón secundario con borde (Cancelar) -->
<button class="btn btn--outline">Cancelar</button>

<!-- Botón con icono -->
<button class="btn btn--primary btn--icon">
  <svg><!-- icono de + --></svg>
  Invitar
</button>

<!-- Botón de ancho completo (para móviles o modales) -->
<button class="btn btn--primary btn--full">Empezar ahora</button>
```

**Estilos SCSS correspondientes:**

```scss
// === BLOQUE: Estilos base compartidos por TODOS los botones ===
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 8px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  // === MODIFICADOR: Botón primario (acción principal) ===
  &--primary {
    background-color: #f97316; // Naranja Joinly
    color: #ffffff;
    border-color: #f97316;

    &:hover:not(:disabled) {
      background-color: #ea580c;
      border-color: #ea580c;
    }
  }

  // === MODIFICADOR: Variante morada (autenticación) ===
  &--purple {
    background-color: #8b5cf6;
    border-color: #8b5cf6;

    &:hover:not(:disabled) {
      background-color: #7c3aed;
      border-color: #7c3aed;
    }
  }

  // === MODIFICADOR: Botón con solo borde (acción secundaria) ===
  &--outline {
    background-color: #ffffff;
    color: #374151;
    border-color: #d1d5db;

    &:hover:not(:disabled) {
      background-color: #f9fafb;
      border-color: #9ca3af;
    }
  }

  // === MODIFICADOR: Ancho completo ===
  &--full {
    width: 100%;
  }

  // === MODIFICADOR: Con icono ===
  &--icon {
    svg {
      width: 16px;
      height: 16px;
    }
  }
}
```

**Análisis del ejemplo:**

- **`.btn`** define los estilos **base** que comparten todos los botones: padding, tipografía, border-radius, transiciones.
- Los **modificadores** (`--primary`, `--outline`, `--purple`) alteran **únicamente la apariencia** (colores), no la estructura.
- Los modificadores son **acumulables**: un botón puede ser `.btn .btn--primary .btn--full .btn--icon` simultáneamente.
- El estado `:disabled` se maneja dentro del bloque base, aplicándose automáticamente a todas las variantes.

### 1.2.4 Beneficios de BEM en Angular

#### Legibilidad inmediata del código

Al revisar el HTML de un componente, BEM permite entender la estructura sin consultar los estilos:

```html
<!-- Sin BEM: ¿Qué es esto? -->
<div class="card highlighted">
  <div class="icon orange"></div>
  <span class="title">...</span>
</div>

<!-- Con BEM: Autodocumentado -->
<div class="subscription-card subscription-card--featured">
  <div class="subscription-card__icon subscription-card__icon--netflix"></div>
  <span class="subscription-card__title">...</span>
</div>
```

#### Integración con la arquitectura de componentes Angular

Aunque Angular proporciona **encapsulación de estilos** mediante `ViewEncapsulation`, BEM aporta beneficios adicionales:

| Característica                  | ViewEncapsulation              | BEM                 |
| ------------------------------- | ------------------------------ | ------------------- |
| Aislamiento de estilos          | Sí (Automático)                | Sí (Por convención) |
| Reutilización entre proyectos   | No (Limitada)                  | Sí (Total)          |
| Claridad en componentes grandes | No (Se pierde contexto)        | Sí (Siempre claro)  |
| Estilos globales/compartidos    | Parcial (Requiere `::ng-deep`) | Sí (Natural)        |

En Joinly, usamos BEM incluso con encapsulación porque:

- Facilita el trabajo con **estilos globales** (tipografía, botones, layouts) definidos en `src/styles/`.
- Permite **copiar componentes** entre proyectos sin preocuparse por colisiones.
- Mantiene **disciplina de equipo** en proyectos colaborativos.

#### Prevención del "Spaghetti CSS"

Sin una metodología clara, el CSS tiende a degradarse:

```scss
// MAL - CSS sin metodología: difícil de mantener
.dashboard .card .header .title { ... }
.dashboard .card.active .header .title { ... }
.dashboard .sidebar .card .title { ... } // ¿Conflicto?

// BIEN - CSS con BEM: predecible y escalable
.dashboard-card__title { ... }
.dashboard-card__title--active { ... }
.sidebar-card__title { ... } // Sin conflicto posible
```

#### Mantenimiento a largo plazo

Cuando necesites modificar un componente meses después:

- **Sin BEM:** Debes rastrear selectores anidados, verificar especificidad, temer efectos secundarios.
- **Con BEM:** Buscas `.subscription-card__price`, lo modificas, y sabes que solo afectará a ese elemento específico.

### 1.2.5 Resumen

| Concepto     | Símbolo | Ejemplo en Joinly                                                             |
| ------------ | ------- | ----------------------------------------------------------------------------- |
| **Block**    | —       | `.stat-card`, `.btn`, `.subscription-card`                                    |
| **Element**  | `__`    | `.stat-card__icon`, `.btn__text`, `.subscription-card__price`                 |
| **Modifier** | `--`    | `.btn--primary`, `.stat-card__icon--calendar`, `.subscription-card--featured` |

BEM no es solo una convención de nombres: es una **filosofía de componentización** que nos obliga a pensar en piezas reutilizables, independientes y predecibles. En un proyecto Angular como Joinly, donde los componentes crecen y evolucionan, BEM actúa como una guía que mantiene el código CSS tan organizado como nuestros componentes TypeScript.

---

## 1.3 Organización de archivos

### 1.3.1 Arquitectura ITCSS

**ITCSS** (Inverted Triangle CSS) es una metodología de organización de archivos CSS creada por Harry Roberts que estructura el código en capas ordenadas por especificidad, de menor a mayor. El nombre "Triángulo Invertido" hace referencia a la forma visual de esta arquitectura: las capas superiores son amplias y genéricas (afectan a todo el proyecto), mientras que las capas inferiores son estrechas y específicas (afectan a componentes puntuales).

En Joinly, implementamos ITCSS para resolver tres problemas fundamentales del CSS a escala:

1. **Control de especificidad:** Cada capa tiene un nivel de especificidad predefinido. Las capas inferiores nunca deben tener menor especificidad que las superiores, evitando conflictos de cascada.
2. **Eliminación de `!important`:** Al respetar el orden de capas, los estilos se sobrescriben de forma natural siguiendo la cascada CSS, sin necesidad de forzar prioridades.
3. **Mantenibilidad:** Cualquier desarrollador puede localizar rápidamente dónde vive cada tipo de estilo.

---

### 1.3.2 Estructura de directorios

```
src/styles/
├── 00-settings/
│   └── _variables.scss
├── 01-tools/
│   └── _mixins.scss
├── 02-generic/
│   └── _reset.scss
├── 03-elements/
│   ├── _base.scss
│   ├── _encabezados.scss
│   ├── _enlaces.scss
│   ├── _formularios.scss
│   ├── _index.scss
│   ├── _listas.scss
│   └── _multimedia.scss
├── 04-layout/
│   ├── _contenedor.scss
│   ├── _flex.scss
│   ├── _index.scss
│   └── _rejilla.scss
└── main.scss
```

La numeración de las carpetas (`00-`, `01-`, `02-`...) no es decorativa: garantiza que cualquier herramienta de ordenación alfabética mantenga el orden correcto de especificidad.

### 1.3.3 Explicación capa por capa

#### 00-settings (Configuración)

**Propósito:** Almacenar los Design Tokens del proyecto: variables de colores, tipografía, espaciados, breakpoints y cualquier valor reutilizable.

**Característica clave:** Esta capa **no genera CSS compilado**. Solo contiene declaraciones de variables SCSS que serán consumidas por las capas posteriores.

**Contenido en Joinly:**

| Archivo           | Descripción                                                                                                                                                                        |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `_variables.scss` | Paleta de colores (`$color-primary`, `$color-secondary`), escalas tipográficas (`$font-size-base`), espaciados (`$spacing-unit`), radios de borde, sombras, breakpoints responsive |

**Ejemplo conceptual:**

```scss
// 00-settings/_variables.scss

// Colores de marca
$color-primary: #f97316; // Naranja Joinly
$color-secondary: #8b5cf6; // Morado autenticación
$color-background: #fffbf5; // Off-white
$color-surface: #ffffff; // Tarjetas

// Tipografía
$font-family-base: "Inter", sans-serif;
$font-size-base: 16px;

// Espaciados (escala de 4px)
$spacing-unit: 4px;
$spacing-sm: $spacing-unit * 2; // 8px
$spacing-md: $spacing-unit * 4; // 16px
$spacing-lg: $spacing-unit * 6; // 24px

// Bordes
$border-radius-sm: 8px;
$border-radius-md: 12px;
```

#### 01-tools (Herramientas)

**Propósito:** Contener mixins, funciones y placeholders de SCSS que encapsulan lógica reutilizable.

**Característica clave:** Al igual que Settings, esta capa **no genera CSS visible** por sí misma. Solo define herramientas que serán invocadas en capas posteriores.

**Contenido en Joinly:**

| Archivo        | Descripción                                                                                                                |
| -------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `_mixins.scss` | Mixins para media queries responsive, truncado de texto, centrado flex, generación de sombras, transiciones estandarizadas |

**Ejemplo conceptual:**

```scss
// 01-tools/_mixins.scss

// Mixin para media queries mobile-first
@mixin respond-to($breakpoint) {
  @if $breakpoint == "tablet" {
    @media (min-width: 768px) {
      @content;
    }
  } @else if $breakpoint == "desktop" {
    @media (min-width: 1024px) {
      @content;
    }
  }
}

// Mixin para truncar texto con ellipsis
@mixin text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// Mixin para centrado flex
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}
```

#### 02-generic (Genéricos)

**Propósito:** Primera capa que genera CSS real. Aquí se normalizan los estilos del navegador para que todos los browsers partan de la misma base visual.

**Característica clave:** Especificidad muy baja (selectores de elemento o universal). Afecta a todo el documento de forma global.

**Contenido en Joinly:**

| Archivo       | Descripción                                                                                                                  |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `_reset.scss` | Reset CSS que elimina márgenes, paddings y estilos por defecto del navegador. Establece `box-sizing: border-box` globalmente |

**Ejemplo conceptual:**

```scss
// 02-generic/_reset.scss

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-size: 100%;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  min-height: 100vh;
  line-height: 1.5;
}

img,
picture,
video,
canvas,
svg {
  display: block;
  max-width: 100%;
}

button {
  font: inherit;
  cursor: pointer;
}
```

#### 03-elements (Elementos)

**Propósito:** Definir estilos para etiquetas HTML puras, sin clases. Esta capa establece la apariencia base de los elementos nativos en Joinly.

**Característica clave:** Selectores de tipo (`h1`, `a`, `input`). Especificidad baja pero mayor que Generic. Aquí no usamos clases.

**Contenido en Joinly:**

| Archivo             | Descripción                                                     |
| ------------------- | --------------------------------------------------------------- |
| `_base.scss`        | Estilos globales del `body`: fuente base, color de texto, fondo |
| `_encabezados.scss` | Estilos para `h1` a `h6`: tamaños, pesos, márgenes              |
| `_enlaces.scss`     | Estilos para `a`: color, hover, focus, decoración               |
| `_formularios.scss` | Estilos para `input`, `textarea`, `select`, `label`             |
| `_listas.scss`      | Estilos para `ul`, `ol`, `li`                                   |
| `_multimedia.scss`  | Estilos para `img`, `video`, `figure`, `figcaption`             |
| `_index.scss`       | Archivo barril que importa todos los parciales de la capa       |

**Ejemplo conceptual:**

```scss
// 03-elements/_encabezados.scss
@use "../00-settings/variables" as *;

h1,
h2,
h3,
h4,
h5,
h6 {
  font-family: $font-family-base;
  font-weight: 700;
  line-height: 1.2;
  color: $color-text-primary;
}

h1 {
  font-size: 2rem;
} // 32px
h2 {
  font-size: 1.5rem;
} // 24px
h3 {
  font-size: 1.25rem;
} // 20px
```

```scss
// 03-elements/_enlaces.scss
@use "../00-settings/variables" as *;

a {
  color: $color-primary;
  text-decoration: none;
  transition: color 0.2s ease;

  &:hover {
    color: darken($color-primary, 10%);
    text-decoration: underline;
  }

  &:focus-visible {
    outline: 2px solid $color-primary;
    outline-offset: 2px;
  }
}
```

#### 04-layout (Estructura)

**Propósito:** Definir patrones de estructura macro: sistemas de rejilla (Grid), contenedores, utilidades Flexbox y wrappers de página.

**Característica clave:** Primera capa donde utilizamos clases. La especificidad aumenta respecto a Elements porque ahora seleccionamos por `.clase` en lugar de por etiqueta.

**Contenido en Joinly:**

| Archivo            | Descripción                                                               |
| ------------------ | ------------------------------------------------------------------------- |
| `_contenedor.scss` | Clase `.container` con ancho máximo y centrado horizontal                 |
| `_rejilla.scss`    | Sistema de grid con clases como `.grid`, `.grid--cols-2`, `.grid--cols-3` |
| `_flex.scss`       | Utilidades flexbox: `.flex`, `.flex--center`, `.flex--between`            |
| `_index.scss`      | Archivo barril que importa todos los parciales de la capa                 |

**Ejemplo conceptual:**

```scss
// 04-layout/_contenedor.scss
@use "../00-settings/variables" as *;

.container {
  width: 100%;
  max-width: 1200px;
  margin-inline: auto;
  padding-inline: $spacing-md;
}

.container--narrow {
  max-width: 800px;
}

.container--wide {
  max-width: 1400px;
}
```

```scss
// 04-layout/_rejilla.scss
@use "../00-settings/variables" as *;
@use "../01-tools/mixins" as *;

.grid {
  display: grid;
  gap: $spacing-md;

  &--cols-2 {
    grid-template-columns: repeat(2, 1fr);
  }

  &--cols-3 {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

### 1.3.4 El archivo main.scss

El archivo `main.scss` actúa como punto de entrada que orquesta la importación de todas las capas en el orden correcto. El orden de importación es **crítico**: si importamos `03-elements` antes de `00-settings`, la compilación fallará porque las variables referenciadas aún no existirían.

```scss
// main.scss
// =========================================
// JOINLY - Punto de entrada de estilos
// =========================================
// Las capas se importan en orden ascendente de especificidad.
// NO alterar el orden de importación.

// -----------------------------------------
// 00 - SETTINGS: Variables y tokens
// No genera CSS, solo define valores
// -----------------------------------------
@use "00-settings/variables";

// -----------------------------------------
// 01 - TOOLS: Mixins y funciones
// No genera CSS, solo define lógica
// -----------------------------------------
@use "01-tools/mixins";

// -----------------------------------------
// 02 - GENERIC: Reset y normalización
// Primera capa que genera CSS real
// Especificidad: *, elemento
// -----------------------------------------
@use "02-generic/reset";

// -----------------------------------------
// 03 - ELEMENTS: Estilos de etiquetas HTML
// Especificidad: elemento (h1, a, input)
// -----------------------------------------
@use "03-elements/index";

// -----------------------------------------
// 04 - LAYOUT: Estructura y rejillas
// Especificidad: .clase
// -----------------------------------------
@use "04-layout/index";
```

### 1.3.5 Flujo de especificidad

El siguiente diagrama ilustra cómo la especificidad aumenta progresivamente a través de las capas:

```
          ESPECIFICIDAD BAJA
                 ▲
                 │
    ┌────────────┴────────────┐
    │      00-settings        │  Variables (no compila)
    │      01-tools           │  Mixins (no compila)
    └────────────┬────────────┘
                 │
    ┌────────────┴────────────┐
    │      02-generic         │  *, html, body
    └────────────┬────────────┘
                 │
    ┌────────────┴────────────┐
    │      03-elements        │  h1, a, input, p
    └────────────┬────────────┘
                 │
    ┌────────────┴────────────┐
    │      04-layout          │  .container, .grid
    └────────────┬────────────┘
                 │
                 ▼
          ESPECIFICIDAD ALTA
```

Cada capa puede sobrescribir estilos de las capas superiores sin conflictos, porque la cascada CSS respeta naturalmente el orden de aparición cuando la especificidad es igual o mayor.

### 1.3.6 Beneficios de ITCSS

| Beneficio          | Descripción                                                                         |
| ------------------ | ----------------------------------------------------------------------------------- |
| **Predecibilidad** | Sabemos exactamente dónde buscar cada tipo de estilo                                |
| **Escalabilidad**  | Podemos añadir nuevas capas (05-components, 06-utilities) sin romper lo existente   |
| **Colaboración**   | Múltiples desarrolladores pueden trabajar en capas diferentes sin conflictos        |
| **Depuración**     | Los problemas de especificidad se identifican rápidamente por la capa donde ocurren |
| **Rendimiento**    | El orden optimizado reduce la probabilidad de estilos duplicados o redundantes      |

Esta arquitectura, combinada con la metodología BEM para nombrar clases, proporciona un sistema robusto y mantenible para gestionar los estilos de Joinly a medida que el proyecto crece.

---

## 1.4 Sistema de Design Tokens

Los **Design Tokens** son los valores atómicos que constituyen la "única fuente de verdad" del sistema de diseño de Joinly. Representan decisiones de diseño codificadas como variables reutilizables: colores, tipografía, espaciados, sombras y breakpoints. En lugar de dispersar valores hexadecimales o píxeles por todo el código, centralizamos estas decisiones en el archivo `_variables.scss`, garantizando consistencia y facilitando cambios globales.

En Joinly implementamos una **estrategia híbrida**: utilizamos CSS Custom Properties (variables nativas de CSS) para tokens que pueden cambiar dinámicamente o heredarse, combinadas con variables SCSS para valores que necesitan evaluarse en tiempo de compilación (como breakpoints en media queries).

### 1.4.1 Paleta de Colores

La paleta cromática de Joinly está diseñada para equilibrar la expresividad de marca con la funcionalidad y accesibilidad. Cada color tiene un propósito definido.

#### Colores de Marca (Primarios)

| Token                       | Valor     | Uso                                                                                                       |
| --------------------------- | --------- | --------------------------------------------------------------------------------------------------------- |
| `--color-naranja-principal` | `#F97316` | Acciones primarias relacionadas con grupos y suscripciones: "Crear grupo", "Crear suscripción", "Invitar" |
| `--color-naranja-oscuro`    | `#EA580C` | Estado hover de botones naranja                                                                           |
| `--color-morado-principal`  | `#9333EA` | Acciones de autenticación y branding: "Registrar", "Iniciar sesión"                                       |
| `--color-morado-oscuro`     | `#7C3AED` | Estado hover de botones morados                                                                           |

**Justificacion de la combinacion Naranja/Morado:**

La eleccion de esta dupla cromatica responde a criterios tanto psicologicos como funcionales:

- **Naranja (`#F97316`):** Transmite energia, entusiasmo y accion. Es un color calido que invita a la interaccion sin resultar agresivo. En el contexto de Joinly, donde los usuarios gestionan suscripciones compartidas, el naranja comunica dinamismo y colaboracion activa. Lo reservamos para las acciones mas frecuentes del flujo principal.

- **Morado (`#9333EA`):** Combina la estabilidad del azul con la creatividad del rojo. Evoca confianza, modernidad y sofisticacion. Lo utilizamos especificamente para acciones de autenticacion (registro, login), donde la percepcion de seguridad es critica. Esta separacion cromatica permite al usuario distinguir instantaneamente entre "gestionar mi contenido" (naranja) y "acceder a mi cuenta" (morado).

- **Contraste entre ambos:** El naranja (colores calidos) y el morado (colores frios) son complementarios en el circulo cromatico, creando un contraste vibrante pero armonioso que refuerza la identidad visual de la marca.

#### Estrategia de Neutrales

La gestion de los colores neutros es fundamental para crear profundidad visual sin recurrir a bordes duros o separadores explicitos.

| Token                         | Valor     | Uso                                               |
| ----------------------------- | --------- | ------------------------------------------------- |
| `--color-fondo-claro-naranja` | `#FEF8EB` | Fondo general de la aplicacion (Off-white calido) |
| `--color-fondo-claro-normal`  | `#F8FAFC` | Superficie de tarjetas y componentes elevados     |
| `--color-gris-medio`          | `#E5E7EB` | Bordes sutiles, separadores                       |
| `--color-texto-oscuro`        | `#111827` | Titulos y texto de alta importancia               |
| `--color-texto-normal`        | `#4B5563` | Cuerpo de texto, descripciones                    |
| `--color-footer`              | `#1E293B` | Fondo del footer (azul oscuro/negro)              |

**Tecnica Off-white vs White:**

Una decision clave en Joinly es el uso de **dos tonos de blanco diferenciados**:

1. **Fondo general (Off-white `#FEF8EB`):** Un blanco cremoso con un sutil tinte calido. Este tono reduce la fatiga visual en sesiones prolongadas (comparado con el blanco puro `#FFFFFF`) y crea una atmosfera acogedora coherente con la identidad de marca.

2. **Superficie de tarjetas (White `#F8FAFC`):** Las Cards utilizan un blanco mas neutro que, al colocarse sobre el fondo off-white, genera una sensacion natural de **elevacion** sin necesidad de bordes marcados. La diferencia de luminosidad entre ambos tonos (aproximadamente 2-3% en la escala de grises) es suficiente para que el ojo perciba separacion, pero lo bastante sutil para mantener una estetica limpia.

Esta tecnica, conocida como **"elevation through color"**, reduce el ruido visual eliminando lineas innecesarias mientras mantiene la estructura clara.

#### Colores Semánticos (Feedback)

Los colores semanticos comunican estados del sistema al usuario de forma universal:

| Token                 | Valor     | Significado                                        |
| --------------------- | --------- | -------------------------------------------------- |
| `--color-exito`       | `#22C55E` | Operacion completada, disponibilidad, confirmacion |
| `--color-error`       | `#EF4444` | Error, accion destructiva, validacion fallida      |
| `--color-advertencia` | `#FACC15` | Atencion requerida, estado pendiente               |
| `--color-informacion` | `#60A5FA` | Informacion neutral, ayuda contextual              |

Estos colores se aplican consistentemente en badges de estado, mensajes de validacion de formularios, toasts de notificacion y alertas del sistema.

#### Tokens Semánticos vs Primitivos

Implementamos un sistema de **dos niveles de abstraccion**:

```scss
// Nivel 1: Primitivos (valores raw)
--color-naranja-principal: #f97316;
--color-morado-principal: #9333ea;

// Nivel 2: Semanticos (significado contextual)
--color-principal: var(--color-morado-principal);
--color-acento: var(--color-naranja-principal);
```

Esta arquitectura permite:

- **Cambios globales rapidos:** Modificar `--color-naranja-principal` actualiza automaticamente todos los componentes que lo referencian.
- **Theming futuro:** Podriamos implementar un tema oscuro redefiniendo solo los tokens semanticos sin tocar los primitivos.
- **Claridad de intencion:** Un desarrollador que lee `--color-acento` entiende el proposito mejor que leyendo `#F97316`.

### 1.4.2 Escala Tipográfica

La tipografía es el vehículo principal de comunicacion en cualquier interfaz. En Joinly, hemos construido un sistema tipografico que prioriza la legibilidad, establece jerarquia clara y se adapta fluidamente a diferentes tamaños de pantalla.

#### Familia Tipográfica: Inter

| Token             | Valor                 |
| ----------------- | --------------------- |
| `--font-primaria` | `'Inter', sans-serif` |

**Justificacion de la eleccion:**

**Inter** es una familia tipografica sans-serif disenada especificamente para interfaces digitales por Rasmus Andersson. Seleccionamos Inter por las siguientes razones tecnicas:

1. **Optimizada para pantallas:** Inter fue creada con el renderizado en pantalla como prioridad. Su altura-x generosa y aperturas amplias garantizan legibilidad incluso en tamaños pequeños (12-14px), critico para metadatos, etiquetas y textos secundarios en dispositivos moviles.

2. **Variable Font disponible:** Inter soporta fuentes variables, permitiendo cargar un unico archivo que contiene todos los pesos (de 100 a 900). Esto reduce las peticiones HTTP y mejora el rendimiento de carga.

3. **Neutralidad con personalidad:** A diferencia de fuentes ultra-geometricas (como Futura) o humanistas (como Fira Sans), Inter ocupa un punto medio: es lo suficientemente neutra para no distraer del contenido, pero tiene suficiente caracter para no resultar generica.

4. **Soporte de OpenType:** Incluye caracteristicas tipograficas avanzadas como numeros tabulares (util para alinear precios en tablas), ligaduras contextuales y conjuntos estilisticos alternativos.

5. **Amplio soporte de idiomas:** Cubre caracteres latinos extendidos, cirilico y griego, preparando la aplicacion para internacionalizacion futura.

#### Escala de Tamaños (Ratio 1.25 - Major Third)

Utilizamos una **escala modular** basada en la proporcion Major Third (1.25). Esto significa que cada nivel de la escala es 1.25 veces mayor que el anterior, creando una progresion armonica y predecible.

| Nivel         | Token                    | Rango (clamp)   | Uso                                       |
| ------------- | ------------------------ | --------------- | ----------------------------------------- |
| H1 Display    | `--tamano-h1`            | `40px` - `64px` | Titulo principal de pagina, hero sections |
| H2 Seccion    | `--tamano-h2`            | `32px` - `48px` | Divisiones principales de contenido       |
| H3 Subseccion | `--tamano-h3`            | `24px` - `32px` | Encabezados de tarjetas, modales          |
| H4 Pequeno    | `--tamano-h4`            | `18px` - `20px` | Titulos terciarios, destacados menores    |
| Body Large    | `--tamano-texto-grande`  | `17px` - `18px` | Introducciones, textos destacados         |
| Body Regular  | `--tamano-texto-regular` | `15px` - `16px` | Contenido principal (80% del texto)       |
| Body Small    | `--tamano-texto-pequeno` | `13px` - `14px` | Metadatos, fechas, autores                |
| Caption       | `--tamano-caption`       | `11px` - `12px` | Notas al pie, etiquetas minimas           |

**Tipografia fluida con `clamp()`:**

En lugar de definir tamaños fijos con media queries, implementamos **tipografia fluida** usando la funcion CSS `clamp()`:

```scss
--tamano-h1: clamp(2.5rem, 5vw + 1rem, 4rem);
```

Esta sintaxis define:

- **Minimo:** `2.5rem` (40px) - El titulo nunca sera mas pequeño
- **Preferido:** `5vw + 1rem` - Escala proporcionalmente al viewport
- **Maximo:** `4rem` (64px) - El titulo nunca sera mas grande

Este enfoque elimina "saltos" bruscos entre breakpoints, creando una experiencia de escalado suave y continua.

#### Pesos de Fuente

| Token                        | Valor | Uso                           |
| ---------------------------- | ----- | ----------------------------- |
| `--peso-fuente-regular`      | `400` | Cuerpo de texto, parrafos     |
| `--peso-fuente-medio`        | `500` | Labels, texto enfatizado      |
| `--peso-fuente-semi-negrita` | `600` | Subtitulos, encabezados H3-H4 |
| `--peso-fuente-negrita`      | `700` | Titulos principales H1-H2     |

#### Alturas de Línea (Line Height)

| Token                     | Valor  | Uso                                          |
| ------------------------- | ------ | -------------------------------------------- |
| `--altura-linea-ajustada` | `1.1`  | Titulos grandes (H1) donde el texto es corto |
| `--altura-linea-compacta` | `1.25` | Subtitulos y encabezados                     |
| `--altura-linea-normal`   | `1.5`  | Cuerpo de texto, parrafos                    |
| `--altura-linea-relajada` | `1.6`  | Textos largos, articulos                     |

La regla general: a mayor tamaño de fuente, menor line-height proporcional necesario. Los titulos grandes con line-height 1.5 lucen excesivamente espaciados, mientras que el texto pequeño con line-height 1.1 se vuelve ilegible.

### 1.4.3 Sistema de Espaciado

El espaciado consistente es uno de los indicadores mas claros de un diseño profesional. En Joinly, todo el espaciado deriva de una **escala base de 8px**, evitando "numeros magicos" arbitrarios.

#### Escala de Espaciado (Base 8px)

| Token            | Valor    | Pixeles | Uso tipico                                   |
| ---------------- | -------- | ------- | -------------------------------------------- |
| `--espaciado-0`  | `0`      | 0px     | Reset, elementos sin margen                  |
| `--espaciado-1`  | `0.5rem` | 8px     | Separacion minima entre elementos inline     |
| `--espaciado-2`  | `1rem`   | 16px    | Padding interno de botones, gap en flex      |
| `--espaciado-3`  | `1.5rem` | 24px    | Padding de tarjetas, separacion entre campos |
| `--espaciado-4`  | `2rem`   | 32px    | Margen entre secciones menores               |
| `--espaciado-5`  | `2.5rem` | 40px    | Separacion entre bloques de contenido        |
| `--espaciado-6`  | `3rem`   | 48px    | Padding de secciones principales             |
| `--espaciado-8`  | `4rem`   | 64px    | Margen entre secciones mayores               |
| `--espaciado-10` | `5rem`   | 80px    | Espaciado de hero sections                   |
| `--espaciado-12` | `6rem`   | 96px    | Separacion entre areas de pagina             |
| `--espaciado-16` | `8rem`   | 128px   | Espaciado maximo, areas de respiro           |

**Por que base 8px y no 4px o 10px:**

1. **Divisibilidad:** 8 es divisible por 2 y 4, permitiendo medias (`4px`) y cuartos (`2px`) cuando se necesita precision fina sin salir del sistema.

2. **Alineacion con grids:** La mayoria de frameworks de diseño (Material Design, Apple HIG) usan sistemas de 8px, facilitando la integracion con bibliotecas de componentes.

3. **Densidad de pixeles:** En pantallas de alta densidad (2x, 3x), los valores en multiplos de 8 se renderizan de forma nítida sin subpixeles borrosos.

4. **Memoria muscular:** Los desarrolladores internalizan rapidamente la escala: "pequeno = 8, medio = 16, grande = 24".

**Aplicacion practica:**

```scss
// MAL - Numeros magicos arbitrarios
.card {
  padding: 18px 22px;
  margin-bottom: 37px;
}

// BIEN - Tokens del sistema
.card {
  padding: var(--espaciado-3); // 24px
  margin-bottom: var(--espaciado-4); // 32px
}
```

El segundo enfoque garantiza que todas las tarjetas de la aplicacion compartan el mismo ritmo vertical, creando una sensacion de orden y coherencia visual.

### 1.4.4 Breakpoints (Responsive Design)

Joinly adopta una estrategia **Mobile-First**, donde los estilos base estan optimizados para dispositivos moviles y se añaden modificaciones progresivas para pantallas mas grandes mediante `min-width`.

#### Puntos de Ruptura

| Token CSS                | Token SCSS        | Valor            | Dispositivo objetivo              |
| ------------------------ | ----------------- | ---------------- | --------------------------------- |
| `--bp-movil`             | `$bp-movil`       | `640px` (40rem)  | Movil grande / Phablet            |
| `--bp-tablet`            | `$bp-tablet`      | `768px` (48rem)  | Tablet vertical                   |
| `--bp-escritorio`        | `$bp-desktop`     | `1024px` (64rem) | Desktop / Tablet horizontal       |
| `--bp-escritorio-grande` | `$bp-big-desktop` | `1280px` (80rem) | Desktop grande / Monitores anchos |

**Justificacion de los valores:**

- **640px:** Captura la transicion entre moviles estandar (320-414px) y dispositivos mas amplios. A partir de este punto, podemos mostrar layouts de dos columnas sin comprometer la legibilidad.

- **768px:** Corresponde al ancho de un iPad en orientacion vertical, un punto de referencia historico que sigue siendo relevante. Muchos usuarios de tablet navegan en esta orientacion.

- **1024px:** Marca el inicio de la experiencia desktop tradicional. Aqui activamos navegacion expandida, sidebars permanentes y layouts de tres o mas columnas.

- **1280px:** Para monitores grandes, donde podemos aprovechar el espacio adicional con contenedores mas amplios o grids de mayor densidad.

**Enfoque Mobile-First:**

El enfoque Mobile-First no es solo una decision tecnica, sino filosofica:

1. **Rendimiento:** Los dispositivos moviles tipicamente tienen menor potencia de procesamiento y conexiones mas lentas. Al cargar primero los estilos moviles (mas simples), optimizamos la experiencia para el caso mas restrictivo.

2. **Priorizacion de contenido:** Diseñar primero para pantallas pequeñas obliga a identificar que es verdaderamente esencial. El contenido secundario se añade progresivamente en pantallas mas grandes.

3. **Estadisticas de uso:** Mas del 50% del trafico web global proviene de dispositivos moviles. Tiene sentido optimizar primero para la mayoria.

**Ejemplo de uso con mixin:**

```scss
.subscription-grid {
  display: grid;
  grid-template-columns: 1fr; // Movil: 1 columna
  gap: var(--espaciado-3);

  @include respond-to("tablet") {
    grid-template-columns: repeat(2, 1fr); // Tablet: 2 columnas
  }

  @include respond-to("desktop") {
    grid-template-columns: repeat(3, 1fr); // Desktop: 3 columnas
  }
}
```

### 1.4.5 Tokens Adicionales

#### Bordes y Radios

| Token              | Valor    | Uso                                   |
| ------------------ | -------- | ------------------------------------- |
| `--borde-delgado`  | `1px`    | Bordes sutiles de inputs, separadores |
| `--borde-medio`    | `2px`    | Bordes de botones, focus rings        |
| `--radio-pequeno`  | `4px`    | Badges, etiquetas pequenas            |
| `--radio-medio`    | `8px`    | Botones, inputs                       |
| `--radio-grande`   | `18px`   | Tarjetas, modales                     |
| `--radio-completo` | `9999px` | Avatares, pills, elementos circulares |

#### Sistema de Sombras (Elevation)

| Token        | Valor                             | Nivel                             |
| ------------ | --------------------------------- | --------------------------------- |
| `--sombra-1` | `0 2px 6px rgba(20,20,43,0.06)`   | Elevation 1 - Muy sutil           |
| `--sombra-2` | `0 2px 12px rgba(20,20,43,0.08)`  | Elevation 2 - Cards en reposo     |
| `--sombra-3` | `0 8px 28px rgba(20,20,43,0.10)`  | Elevation 3 - Cards en hover      |
| `--sombra-4` | `0 14px 42px rgba(20,20,43,0.14)` | Elevation 4 - Dropdowns           |
| `--sombra-5` | `0 24px 65px rgba(20,20,43,0.16)` | Elevation 5 - Modales             |
| `--sombra-6` | `0 32px 72px rgba(20,20,43,0.24)` | Elevation 6 - Elementos flotantes |

El sistema de sombras sigue una progresion donde cada nivel incrementa tanto el blur como el offset vertical, simulando una fuente de luz superior. Usamos un color base azulado oscuro (`#14142B`) en lugar de negro puro para sombras mas suaves y naturales.

#### Transiciones

| Token                   | Valor         | Uso                                           |
| ----------------------- | ------------- | --------------------------------------------- |
| `--duracion-rapida`     | `150ms`       | Hover de botones, cambios de color            |
| `--duracion-base`       | `300ms`       | Apertura de dropdowns, animaciones de entrada |
| `--duracion-lenta`      | `500ms`       | Transiciones de pagina, animaciones complejas |
| `--transicion-estandar` | `ease-in-out` | Movimiento natural                            |

#### Z-Index (Sistema de Capas)

| Token                | Valor | Uso                       |
| -------------------- | ----- | ------------------------- |
| `--z-dropdown`       | `100` | Menus desplegables        |
| `--z-sticky`         | `200` | Headers sticky            |
| `--z-fixed`          | `300` | Navbars fijas             |
| `--z-modal-backdrop` | `400` | Overlay oscuro de modales |
| `--z-modal`          | `500` | Modales y dialogos        |
| `--z-popover`        | `600` | Tooltips, popovers        |
| `--z-toast`          | `700` | Notificaciones toast      |

Este sistema escalonado previene conflictos de z-index, un problema comun en proyectos sin convencion establecida donde los valores crecen arbitrariamente hasta llegar a `z-index: 99999`.

### 1.4.6 Resumen

| Categoria       | Estrategia                                  | Beneficio                              |
| --------------- | ------------------------------------------- | -------------------------------------- |
| **Colores**     | Primitivos + Semanticos, Off-white vs White | Theming futuro, profundidad sin bordes |
| **Tipografia**  | Inter + escala modular 1.25 + clamp()       | Jerarquia clara, escalado fluido       |
| **Espaciado**   | Base 8px, tokens nombrados                  | Ritmo visual, consistencia             |
| **Breakpoints** | Mobile-First, 4 puntos                      | Rendimiento, priorizacion contenido    |
| **Extras**      | Sombras escalonadas, z-index sistematico    | Elevation predecible, sin conflictos   |

Los Design Tokens son la base sobre la que se construye todo el sistema visual de Joinly. Al documentarlos explicitamente y utilizarlos de forma consistente, garantizamos que cualquier desarrollador pueda contribuir al proyecto manteniendo la coherencia visual, y que cualquier cambio de diseño pueda propagarse globalmente modificando un unico archivo.

---

## 1.5 Mixins y Funciones

Los **mixins** son bloques de código SCSS reutilizables que encapsulan patrones CSS frecuentes. En lugar de repetir las mismas propiedades en múltiples selectores, definimos la lógica una vez y la invocamos donde sea necesario mediante `@include`.

En la arquitectura ITCSS de Joinly, los mixins residen en la capa **`01-tools`** por una razón fundamental: **no generan CSS por sí mismos**. Un archivo de mixins puede contener cientos de líneas de código, pero si ningún selector los invoca, el CSS compilado tendrá 0 bytes de esa capa. Los mixins son herramientas latentes que solo producen output cuando son llamadas.

Esta característica los diferencia de las capas posteriores (02-generic, 03-elements, 04-layout) que sí generan CSS inmediatamente al ser importadas.

**Ubicación:** `src/styles/01-tools/_mixins.scss`

### 1.5.1 Media Queries Responsive (`responder-a`)

**Descripción:**

Este mixin es el pilar del diseño responsive en Joinly. Genera media queries utilizando los breakpoints definidos en `_variables.scss`, eliminando la necesidad de recordar valores en píxeles y garantizando consistencia en todos los puntos de ruptura.

El mixin sigue el enfoque **Mobile-First**: los estilos base se escriben para móvil, y las modificaciones para pantallas más grandes se añaden progresivamente usando `min-width`.

**Parámetros:**

| Parámetro        | Tipo     | Valores aceptados                                            | Descripción                     |
| ---------------- | -------- | ------------------------------------------------------------ | ------------------------------- |
| `$punto-ruptura` | `string` | `'movil'`, `'tablet'`, `'escritorio'`, `'escritorio-grande'` | Nombre del breakpoint a aplicar |

**Correspondencia de breakpoints:**

| Valor del parámetro   | Variable SCSS     | Resolución       |
| --------------------- | ----------------- | ---------------- |
| `'movil'`             | `$bp-movil`       | `640px` (40rem)  |
| `'tablet'`            | `$bp-tablet`      | `768px` (48rem)  |
| `'escritorio'`        | `$bp-desktop`     | `1024px` (64rem) |
| `'escritorio-grande'` | `$bp-big-desktop` | `1280px` (80rem) |

**Código fuente:**

```scss
@mixin responder-a($punto-ruptura) {
  @if $punto-ruptura == "movil" {
    @media (min-width: $bp-movil) {
      @content;
    }
  } @else if $punto-ruptura == "tablet" {
    @media (min-width: $bp-tablet) {
      @content;
    }
  } @else if $punto-ruptura == "escritorio" {
    @media (min-width: $bp-desktop) {
      @content;
    }
  } @else if $punto-ruptura == "escritorio-grande" {
    @media (min-width: $bp-big-desktop) {
      @content;
    }
  } @else {
    @warn "Breakpoint '#{$punto-ruptura}' no existe.";
  }
}
```

**Ejemplo de uso (Componente BEM):**

```scss
.subscription-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--espaciado-3);

  @include responder-a("tablet") {
    grid-template-columns: repeat(2, 1fr);
  }

  @include responder-a("escritorio") {
    grid-template-columns: repeat(3, 1fr);
  }
}

.hero__title {
  font-size: var(--tamano-h2);

  @include responder-a("escritorio") {
    font-size: var(--tamano-h1);
  }
}
```

**CSS compilado:**

```css
.subscription-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--espaciado-3);
}

@media (min-width: 768px) {
  .subscription-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .subscription-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

**Ventajas:**

1. **Legibilidad:** `@include responder-a('tablet')` es más expresivo que `@media (min-width: 768px)`.
2. **Mantenibilidad:** Si decidimos cambiar el breakpoint de tablet de 768px a 800px, lo hacemos en `_variables.scss` y se propaga automáticamente.
3. **Prevención de errores:** El mixin emite un warning si se usa un breakpoint inexistente, evitando media queries vacías o mal escritas.

### 1.5.2 Centrado Flexbox (`centrar-flex`)

**Descripción:**

Mixin utilitario que aplica el patrón de centrado perfecto con Flexbox: tanto horizontal como verticalmente. Es uno de los patrones más utilizados en Joinly, apareciendo en:

- Iconos dentro de botones
- Avatares en tarjetas de miembros
- Contenido de modales
- Estados de carga (spinners)
- Páginas de error (404, 500)

Aunque son solo tres líneas de CSS, encapsularlas en un mixin garantiza que siempre se apliquen juntas y de forma consistente.

**Parámetros:**

Este mixin no recibe parámetros. Su simplicidad es intencional.

**Código fuente:**

```scss
@mixin centrar-flex {
  display: flex;
  justify-content: center;
  align-items: center;
}
```

**Ejemplo de uso (Componente BEM):**

```scss
.stat-card__icon {
  @include centrar-flex;
  width: 48px;
  height: 48px;
  border-radius: var(--radio-medio);
  background-color: var(--color-fondo-claro-naranja);

  svg {
    width: 24px;
    height: 24px;
  }
}

.modal__overlay {
  @include centrar-flex;
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: var(--z-modal-backdrop);
}

.btn--icon-only {
  @include centrar-flex;
  width: 40px;
  height: 40px;
  padding: 0;
}
```

**CSS compilado:**

```css
.stat-card__icon {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 48px;
  height: 48px;
  border-radius: var(--radio-medio);
  background-color: var(--color-fondo-claro-naranja);
}
```

### 1.5.3 Truncado de Texto (`truncar-texto`)

**Descripción:**

Este mixin maneja el desbordamiento de texto añadiendo puntos suspensivos (`...`) cuando el contenido excede el espacio disponible. Soporta dos modos:

1. **Truncado de una línea:** El patrón clásico con `text-overflow: ellipsis`.
2. **Truncado multilínea:** Usando la propiedad moderna `-webkit-line-clamp` (compatible con todos los navegadores actuales).

Es especialmente útil en tarjetas de suscripción donde los nombres de servicios o descripciones pueden variar en longitud.

**Parámetros:**

| Parámetro | Tipo     | Valor por defecto | Descripción                                        |
| --------- | -------- | ----------------- | -------------------------------------------------- |
| `$lineas` | `number` | `1`               | Número máximo de líneas a mostrar antes de truncar |

**Código fuente:**

```scss
@mixin truncar-texto($lineas: 1) {
  @if $lineas == 1 {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  } @else {
    display: -webkit-box;
    -webkit-line-clamp: $lineas;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}
```

**Ejemplo de uso (Componente BEM):**

```scss
.subscription-card__title {
  @include truncar-texto(1);
  font-size: var(--tamano-texto-regular);
  font-weight: var(--peso-fuente-semi-negrita);
}

.subscription-card__description {
  @include truncar-texto(2);
  font-size: var(--tamano-texto-pequeno);
  color: var(--color-texto-base);
}

.notification__message {
  @include truncar-texto(3);
  line-height: var(--altura-linea-normal);
}
```

**CSS compilado (para 1 línea):**

```css
.subscription-card__title {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
```

**CSS compilado (para 2 líneas):**

```css
.subscription-card__description {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

### 1.5.4 Foco Visible Accesible (`foco-visible`)

**Descripción:**

Este mixin implementa estilos de foco que solo se activan cuando el usuario navega con teclado (Tab), pero no cuando hace clic con el ratón. Utiliza el pseudo-selector `:focus-visible`, que es el estándar moderno para accesibilidad.

El foco visible es un requisito de las pautas WCAG 2.1 (criterio 2.4.7): los usuarios que navegan con teclado deben poder identificar qué elemento está activo en todo momento.

**Parámetros:**

Este mixin no recibe parámetros. Utiliza los tokens del sistema de diseño para mantener consistencia.

**Código fuente:**

```scss
@mixin foco-visible {
  &:focus-visible {
    outline: 2px solid var(--color-principal);
    outline-offset: 2px;
    border-radius: var(--radio-pequeno);
  }
}
```

**Ejemplo de uso (Componente BEM):**

```scss
.btn {
  @include foco-visible;
  // ... resto de estilos del botón
}

.nav__link {
  @include foco-visible;
  color: var(--color-texto-base);
  text-decoration: none;
}

.subscription-card {
  @include foco-visible;
  cursor: pointer;
}
```

**CSS compilado:**

```css
.btn:focus-visible {
  outline: 2px solid var(--color-principal);
  outline-offset: 2px;
  border-radius: var(--radio-pequeno);
}
```

**Comportamiento:**

- **Navegación con Tab:** Se muestra un anillo morado de 2px alrededor del elemento.
- **Clic con ratón:** No se muestra ningún outline, manteniendo la estética limpia.

### 1.5.5 Oculto Accesible (`oculto-accesible`)

**Descripción:**

Este mixin oculta un elemento visualmente pero lo mantiene accesible para tecnologías de asistencia como lectores de pantalla (NVDA, VoiceOver, JAWS). Es la implementación del patrón conocido como "visually hidden" o "sr-only".

**Casos de uso típicos:**

- Labels de formulario que visualmente son innecesarios pero semánticamente requeridos.
- Skip links ("Saltar al contenido principal") para navegación con teclado.
- Texto descriptivo adicional para iconos que no tienen texto visible.

**Importante:** Nunca usar `display: none` o `visibility: hidden` para ocultar contenido que debe ser leído por lectores de pantalla, ya que también lo ocultan de las tecnologías de asistencia.

**Código fuente:**

```scss
@mixin oculto-accesible {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

**Ejemplo de uso (Componente BEM):**

```scss
.search-form__label {
  @include oculto-accesible;
}

.skip-link {
  @include oculto-accesible;

  &:focus {
    // Cuando recibe foco con Tab, se vuelve visible
    position: fixed;
    top: var(--espaciado-2);
    left: var(--espaciado-2);
    width: auto;
    height: auto;
    padding: var(--espaciado-2);
    margin: 0;
    overflow: visible;
    clip: auto;
    background-color: var(--color-principal);
    color: white;
    z-index: var(--z-toast);
  }
}

.btn--icon-only__text {
  @include oculto-accesible;
  // El texto "Cerrar" está oculto visualmente pero los lectores lo anuncian
}
```

### 1.5.6 Ratio de Aspecto (`ratio-aspecto`)

**Descripción:**

Mantiene una proporción de aspecto fija en un contenedor, independientemente de su ancho. Utiliza la propiedad CSS moderna `aspect-ratio`, que tiene soporte completo en navegadores actuales.

Es especialmente útil para:

- Contenedores de video (16:9)
- Imágenes de preview en tarjetas
- Avatares cuadrados (1:1)
- Thumbnails de servicios de suscripción

**Parámetros:**

| Parámetro | Tipo     | Valor por defecto | Descripción           |
| --------- | -------- | ----------------- | --------------------- |
| `$ancho`  | `number` | `16`              | Proporción horizontal |
| `$alto`   | `number` | `9`               | Proporción vertical   |

**Código fuente:**

```scss
@mixin ratio-aspecto($ancho: 16, $alto: 9) {
  aspect-ratio: #{$ancho} / #{$alto};
}
```

**Ejemplo de uso (Componente BEM):**

```scss
.video-player__container {
  @include ratio-aspecto(16, 9);
  width: 100%;
  background-color: var(--color-texto-oscuro);
}

.member-card__avatar {
  @include ratio-aspecto(1, 1);
  width: 48px;
  border-radius: var(--radio-completo);
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.service-logo {
  @include ratio-aspecto(4, 3);
  max-width: 120px;
}
```

**CSS compilado:**

```css
.video-player__container {
  aspect-ratio: 16 / 9;
  width: 100%;
  background-color: var(--color-texto-oscuro);
}
```

### 1.5.7 Transición Suave (`transicion`)

**Descripción:**

Aplica transiciones CSS utilizando las duraciones definidas en el sistema de Design Tokens. Centralizar las transiciones garantiza que todas las animaciones de la interfaz se sientan coherentes y coordinadas.

**Parámetros:**

| Parámetro      | Tipo     | Valor por defecto      | Descripción                                                    |
| -------------- | -------- | ---------------------- | -------------------------------------------------------------- |
| `$propiedades` | `string` | `all`                  | Propiedades CSS a animar (ej: `color`, `transform`, `opacity`) |
| `$duracion`    | `time`   | `var(--duracion-base)` | Duración de la transición (usa tokens del sistema)             |

**Código fuente:**

```scss
@mixin transicion($propiedades: all, $duracion: var(--duracion-base)) {
  transition: $propiedades $duracion ease-out;
}
```

**Ejemplo de uso (Componente BEM):**

```scss
.btn {
  @include transicion(background-color, var(--duracion-rapida));

  &:hover {
    background-color: var(--color-naranja-oscuro);
  }
}

.subscription-card {
  @include transicion(transform box-shadow);

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--sombra-3);
  }
}

.nav__link {
  @include transicion(color);

  &:hover {
    color: var(--color-principal);
  }
}
```

**CSS compilado:**

```css
.btn {
  transition: background-color var(--duracion-rapida) ease-out;
}

.subscription-card {
  transition: transform box-shadow var(--duracion-base) ease-out;
}
```

### 1.5.8 Resumen de Mixins

| Mixin                                 | Propósito                                          | Parámetros                                                   |
| ------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------ |
| `responder-a($punto-ruptura)`         | Media queries responsive Mobile-First              | `'movil'`, `'tablet'`, `'escritorio'`, `'escritorio-grande'` |
| `centrar-flex`                        | Centrado horizontal y vertical con Flexbox         | Ninguno                                                      |
| `truncar-texto($lineas)`              | Truncado de texto con puntos suspensivos           | Número de líneas (por defecto: 1)                            |
| `foco-visible`                        | Outline accesible solo para navegación con teclado | Ninguno                                                      |
| `oculto-accesible`                    | Oculta visualmente pero mantiene accesibilidad     | Ninguno                                                      |
| `ratio-aspecto($ancho, $alto)`        | Mantiene proporción de aspecto fija                | Ancho y alto (por defecto: 16, 9)                            |
| `transicion($propiedades, $duracion)` | Transiciones consistentes con tokens del sistema   | Propiedades y duración                                       |

### 1.5.9 Por qué los mixins viven en 01-tools

La ubicación de `_mixins.scss` en la capa `01-tools` de ITCSS responde a su naturaleza de **herramienta sin output**:

1. **No generan CSS:** Un archivo con 500 líneas de mixins produce 0 bytes de CSS hasta que alguien escribe `@include`.

2. **Dependencia de Settings:** Los mixins necesitan acceso a las variables definidas en `00-settings` (como `$bp-tablet`), por eso se importan después.

3. **Consumidos por capas posteriores:** Los selectores en `03-elements`, `04-layout` y componentes de Angular utilizan estos mixins, estableciendo una dependencia unidireccional clara.

4. **Sin especificidad:** Como no generan selectores propios, no participan en conflictos de cascada CSS.

Esta organización garantiza que la capa Tools actúe como una caja de herramientas: siempre disponible, nunca intrusiva, esperando ser utilizada cuando se necesite.

---

## 1.6 ViewEncapsulation en Angular

Angular proporciona un sistema de **encapsulación de estilos** que determina cómo los estilos CSS de un componente interactúan con el resto de la aplicación. Esta funcionalidad, llamada `ViewEncapsulation`, es fundamental para entender cómo gestionar los estilos en una aplicación Angular, especialmente cuando ya contamos con una arquitectura CSS global bien definida como ITCSS.

### 1.6.1 ¿Qué es ViewEncapsulation?

`ViewEncapsulation` es una configuración que controla el **alcance de los estilos** definidos en un componente Angular. Responde a una pregunta simple pero crucial: _¿Los estilos de este componente afectan solo a este componente, o pueden "escapar" y afectar a otros elementos de la página?_

Angular ofrece tres estrategias de encapsulación:

| Estrategia  | Descripción                                                                                                                                                                        |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Emulated`  | **(Por defecto)** Simula el comportamiento de Shadow DOM añadiendo atributos únicos a los elementos y selectores. Los estilos del componente solo afectan a sus propios elementos. |
| `None`      | Sin encapsulación. Los estilos del componente se convierten en **estilos globales** que pueden afectar a cualquier elemento de la aplicación.                                      |
| `ShadowDom` | Utiliza el Shadow DOM nativo del navegador para encapsular estilos. Proporciona aislamiento real a nivel del navegador.                                                            |

### 1.6.2 Análisis de cada estrategia

#### ViewEncapsulation.Emulated (Por defecto)

Cuando usamos `Emulated`, Angular añade atributos autogenerados a los elementos del componente y modifica los selectores CSS para que solo coincidan con esos atributos específicos.

**Ejemplo práctico:**

```typescript
// component.ts
@Component({
  selector: 'app-card',
  template: `<div class="card"><h2>Título</h2></div>`,
  styles: [`.card { background: white; } h2 { color: blue; }`],
  encapsulation: ViewEncapsulation.Emulated // Por defecto, no es necesario declararlo
})
```

**Lo que Angular genera:**

```html
<!-- HTML renderizado -->
<app-card _nghost-abc-1>
  <div _ngcontent-abc-1 class="card">
    <h2 _ngcontent-abc-1>Título</h2>
  </div>
</app-card>
```

```css
/* CSS transformado */
.card[_ngcontent-abc-1] {
  background: white;
}
h2[_ngcontent-abc-1] {
  color: blue;
}
```

**Ventajas:**

- Aislamiento automático sin esfuerzo adicional.
- Los estilos del componente no "contaminan" otros componentes.
- Compatible con todos los navegadores.

**Desventajas:**

- Los estilos globales (como los de ITCSS) no penetran fácilmente en el componente.
- Puede requerir `::ng-deep` para aplicar estilos heredados (aunque está deprecado).
- La especificidad aumenta debido a los selectores de atributo añadidos.

#### ViewEncapsulation.None

Con `None`, Angular no modifica los estilos del componente. Se comportan exactamente como CSS tradicional: globales y afectando a cualquier elemento que coincida con el selector.

**Ejemplo práctico:**

```typescript
@Component({
  selector: 'app-card',
  template: `<div class="card"><h2>Título</h2></div>`,
  styles: [`.card { background: white; }`],
  encapsulation: ViewEncapsulation.None
})
```

**Lo que Angular genera:**

```html
<!-- HTML renderizado (sin atributos especiales) -->
<app-card>
  <div class="card">
    <h2>Título</h2>
  </div>
</app-card>
```

```css
/* CSS sin modificar */
.card {
  background: white;
}
```

**Ventajas:**

- Los estilos globales de ITCSS fluyen naturalmente al componente.
- Funciona perfectamente con metodologías como BEM.
- Menor complejidad en los selectores generados.
- Facilita la reutilización de estilos entre componentes.

**Desventajas:**

- Riesgo de colisiones de nombres si no se usa una metodología de nomenclatura estricta.
- Los estilos del componente pueden afectar accidentalmente a otros elementos.
- Requiere disciplina del equipo para mantener el CSS organizado.

#### ViewEncapsulation.ShadowDom

Utiliza la API nativa de Shadow DOM del navegador para crear una barrera de estilos real. Los estilos dentro del Shadow DOM están completamente aislados del documento principal.

```typescript
@Component({
  selector: 'app-card',
  template: `<div class="card"><h2>Título</h2></div>`,
  styles: [`.card { background: white; }`],
  encapsulation: ViewEncapsulation.ShadowDom
})
```

**Ventajas:**

- Aislamiento completo y nativo.
- Ideal para Web Components distribuibles.

**Desventajas:**

- Los estilos globales **no pueden penetrar** en el Shadow DOM.
- Requiere duplicar o pasar explícitamente estilos compartidos mediante CSS Custom Properties.
- Incompatible con arquitecturas CSS globales como ITCSS.
- Soporte limitado en navegadores antiguos.

### 1.6.3 Decisión para Joinly: `ViewEncapsulation.None`

Después de analizar las tres estrategias y considerando la arquitectura CSS establecida en Joinly, **recomendamos utilizar `ViewEncapsulation.None`** para los componentes del proyecto.

#### Justificación técnica

**1. Coherencia con la arquitectura ITCSS**

Nuestra arquitectura ITCSS está diseñada para que los estilos fluyan de forma predecible desde las capas más genéricas (reset, elements) hasta las más específicas (components). Con `Emulated`, esta cascada se interrumpe porque Angular añade selectores de atributo que aumentan la especificidad de forma artificial.

Como explica el recurso de referencia del curso sobre CSS moderno:

> _"La solución no es escribir más CSS, sino organizarlo mejor."_
> — [CSS Moderno: Arquitectura y Organización](https://github.com/envasador/DIW-FFEOE/blob/main/mkdocs/referencias/docs/orbita3.2-css-moderno-arquitectura-y-organizacion.md)

Nuestra organización en capas (`00-settings` → `01-tools` → `02-generic` → `03-elements` → `04-layout`) ya resuelve el problema de la cascada mediante orden de importación y control de especificidad. La encapsulación `Emulated` duplicaría esfuerzos y crearía conflictos.

**2. BEM como mecanismo de aislamiento**

La metodología BEM que usamos en Joinly ya proporciona un **aislamiento semántico** efectivo:

```scss
// Cada componente tiene su namespace único
.subscription-card { ... }
.subscription-card__title { ... }
.subscription-card__price--highlighted { ... }

// Imposible colisionar con:
.stat-card { ... }
.stat-card__title { ... }
```

Los nombres de clase BEM son tan específicos y descriptivos que las colisiones son prácticamente imposibles si se sigue la convención. Como documentamos en la sección 1.2:

> _"Una clase como `.subscription-card__price--highlighted` comunica instantáneamente su propósito sin necesidad de buscar en el código fuente."_

BEM hace innecesaria la encapsulación automática de Angular porque **el propio naming convention actúa como aislamiento**.

**3. Estilos globales reutilizables**

Con `None`, los estilos definidos en nuestras capas ITCSS (`03-elements` para tipografía base, `04-layout` para grids) se aplican automáticamente dentro de los componentes Angular:

```html
<!-- En cualquier componente Angular -->
<article class="subscription-card">
  <h2>Spotify Family</h2>
  <!-- Hereda estilos de 03-elements/_encabezados.scss -->
  <p>Gestiona tu suscripción</p>
  <!-- Hereda estilos base de 03-elements/_base.scss -->
</article>
```

Esto sigue el principio de **"CSS más limpio: puedes seleccionar elementos por su significado"** mencionado en el recurso de HTML5 semántico:

> _"Cuando escribes HTML, no solo estás diciéndole al navegador 'pon esto en pantalla'. Estás comunicando significado."_
> — [HTML5 Semántico: La base de todo](https://github.com/envasador/DIW-FFEOE/blob/main/mkdocs/referencias/docs/orbita3.1-HTML5-semantico-la-base-de-todo.md)

**4. Mantenibilidad y escalabilidad**

El recurso de CSS moderno enfatiza:

> _"El código que escribes hoy será leído (y maldecido o bendecido) por alguien mañana, posiblemente tú mismo."_

Con `None`, un desarrollador puede:

- Inspeccionar los estilos en DevTools sin ver atributos crípticos como `_ngcontent-abc-1`.
- Modificar estilos globales sabiendo que afectarán a todos los componentes de forma predecible.
- Reutilizar componentes en otros proyectos Angular (o incluso no-Angular) sin dependencias de encapsulación.

### 1.6.4 Implementación práctica

#### Configuración global en angular.json

Para establecer `None` como valor predeterminado para todos los componentes nuevos, añadimos la configuración en los schematics:

```json
{
  "projects": {
    "joinly": {
      "schematics": {
        "@schematics/angular:component": {
          "style": "scss",
          "encapsulation": "None"
        }
      }
    }
  }
}
```

#### Configuración por componente

Para componentes existentes o casos específicos, declaramos explícitamente la encapsulación:

```typescript
import { Component, ViewEncapsulation } from "@angular/core";

@Component({
  selector: "app-subscription-card",
  templateUrl: "./subscription-card.html",
  styleUrl: "./subscription-card.scss",
  encapsulation: ViewEncapsulation.None,
})
export class SubscriptionCardComponent {}
```

#### Estructura de estilos recomendada

Con `None`, la hoja de estilos del componente debe seguir las convenciones BEM y referenciar los tokens del sistema:

```scss
// subscription-card.component.scss
@use "../../styles/00-settings/variables" as *;

.subscription-card {
  background-color: var(--color-fondo-claro-normal);
  border-radius: var(--radio-borde-md);
  padding: var(--espacio-lg);
  box-shadow: var(--sombra-sm);

  &__header {
    display: flex;
    align-items: center;
    gap: var(--espacio-md);
    margin-bottom: var(--espacio-md);
  }

  &__title {
    font-size: var(--fuente-lg);
    font-weight: var(--peso-bold);
    color: var(--color-texto-oscuro);
  }

  &__price {
    font-size: var(--fuente-xl);
    color: var(--color-naranja-principal);

    &--discounted {
      text-decoration: line-through;
      color: var(--color-texto-normal);
    }
  }
}
```

### 1.6.5 Cuándo considerar otras estrategias

Aunque `None` es nuestra recomendación general, existen casos donde otras estrategias tienen sentido:

| Escenario                                                | Estrategia recomendada   |
| -------------------------------------------------------- | ------------------------ |
| Aplicación con arquitectura ITCSS + BEM                  | `None`                   |
| Componente distribuible como librería npm                | `ShadowDom` o `Emulated` |
| Migración gradual de proyecto legacy sin metodología CSS | `Emulated` (temporal)    |
| Web Components estándar para uso fuera de Angular        | `ShadowDom`              |

### 1.6.6 Resumen

| Aspecto                      | Decisión en Joinly                                           |
| ---------------------------- | ------------------------------------------------------------ |
| **Estrategia elegida**       | `ViewEncapsulation.None`                                     |
| **Razón principal**          | Coherencia con arquitectura ITCSS + BEM                      |
| **Mecanismo de aislamiento** | Nomenclatura BEM (`.bloque__elemento--modificador`)          |
| **Estilos globales**         | Fluyen naturalmente desde `src/styles/main.scss`             |
| **Configuración**            | Global en `angular.json` + explícita en componentes críticos |

La elección de `ViewEncapsulation.None` no es una decisión perezosa ni un "desactivar funcionalidades". Es una decisión arquitectónica consciente que reconoce que **ya tenemos un sistema de aislamiento robusto** (BEM) y una **organización de capas predecible** (ITCSS). Añadir encapsulación automática de Angular sería redundante y contraproducente.

Como concluye el recurso de CSS moderno:

> _"No se trata de memorizar todas las propiedades CSS que existen, sino de entender cómo pensar en componentes, cómo estructurar tu código para que otros lo entiendan, y cómo usar las características modernas de la plataforma web para escribir menos código y más expresivo."_

En Joinly, `ViewEncapsulation.None` + ITCSS + BEM es nuestra receta para CSS escalable, mantenible y predecible.
