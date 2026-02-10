## Arquitectura y metodologia

He maquetado la seccion de Preguntas Frecuentes con CSS, haciendola responsive y siguiendo la arquitectura de estilos del proyecto.

Añadi dos colores nuevos en las variables del proyecto para la seccion FAQ:

- --color-teal: un verde azulado (#14b8a6) que uso para bordes, hover de tarjetas y botones.
- --color-teal-oscuro: una version mas oscura (#0d9488) para titulos y estados activos.
- --color-fondo-teal: un fondo suave (#f0fdfa) para los hover.

Estas variables estan en src/styles/00-settings/\_variables.scss y \_css-variables.scss, que es donde van segun la arquitectura ITCSS del proyecto. Tienen version light y dark.

Use la metodologia BEM para nombrar las clases:

En el componente padre use el bloque .p-preguntas (p de pagina) con elementos como **hero, **titulo, **categorias, **rejilla, etc. Y modificadores como \_\_estado--error.

En el componente hijo use el bloque .c-pregunta-card (c de componente) con elementos como **header, **titulo, **body, **respuesta. Y el modificador \_\_header--activo para cuando el acordeon esta abierto.

Use CSS Grid para la rejilla de tarjetas:

- En movil: 1 columna
- En tablet (768px): 2 columnas
- En escritorio (1024px): 3 columnas

Cada tarjeta usa Flexbox en columna para apilar su contenido, y la cabecera del acordeon usa Flexbox en fila para poner el titulo y el icono del chevron a los lados.

## Metodologia

Use section para agrupar el contenido, header para la zona del titulo, article para cada tarjeta de pregunta, button para el acordeon (con aria-expanded), h1 para el titulo principal y h2 para los nombres de categoria. Tambien puse role="alert" en los errores y aria-live="polite" en la carga para accesibilidad.

Las variables van en Settings (capa 00) porque deben estar disponibles antes de cualquier otra capa ITCSS. Si importara Components antes que Settings, las variables no existirian cuando se compilen los estilos del componente, generando errores de SCSS. ITCSS establece un orden de cascada donde Settings define los tokens (variables, funciones, mixins) que todas las capas posteriores necesitan usar.

Con BEM, cada clase es independiente del DOM. Si escribiera `div > button`, seria frágil: mover el botón a otro contenedor rompería el estilo. Con `.c-pregunta-card__header`, el estilo funciona siempre porque la clase es explícita. Además, BEM evita problemas de especificidad (todas las clases pesan igual), mientras que selectores anidados crean especificidad creciente que genera conflictos al sobreescribir estilos.
