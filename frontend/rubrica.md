# Rúbrica de Evaluación: Proyecto 3 - Nivel Excelente (10)

Este documento detalla los criterios necesarios para alcanzar la máxima calificación en cada Resultado de Aprendizaje (RA), así como los entregables obligatorios.

## 1. Fundamentos y Diseño (RA1)

### RA1.a: Comunicación Visual
* **Identificación y aplicación:** Se identifican y aplican correctamente los principios de comunicación visual.
* **Documentación:** La documentación (`DOCUMENTACION.md`) explica detalladamente las decisiones de diseño, incluyendo la justificación completa de la paleta de colores y tipografías seleccionadas para su visualización en pantalla.

### RA1.c: Plantillas de Diseño
* **Componentes:** Se han creado más de 7 componentes reutilizables y totalmente documentados.
* **Layouts:** Los layouts son fluidos, responden correctamente al diseño (responsive) y la estructura visual es sólida.

---

## 2. HTML y CSS Avanzado (RA2)

### RA2.a: Modificar Etiquetas HTML
* **Semántica:** Uso estricto de HTML5 semántico.
* **Documentación:** En `DOCUMENTACION.md` se explican detalladamente las decisiones semánticas tomadas y la estructura elegida.

### RA2.c: Estilos Globales
* **Arquitectura:** Estilos organizados meticulosamente (ej. ITCSS o patrón 7-1), con una estructura de carpetas clara y documentada.
* **Grid:** Se ha implementado un sistema de Grid global funcional.

### RA2.d: Hojas Alternativas (Temas)
* **Sistema de Temas:** Sistema completo utilizando *CSS Custom Properties* (variables CSS).
* **Funcionalidad:** El cambio de tema es funcional, respeta la preferencia del sistema (`prefers-color-scheme`) y cuenta con persistencia (se guarda la elección del usuario).
* **Documentación:** Documentación completa sobre la implementación del sistema de temas.

### RA2.e: Redefinir Estilos (Reset)
* **Reset:** Se utiliza un Reset CSS moderno (o Normalize) importado y configurado correctamente para asegurar la consistencia entre navegadores.

### RA2.f: Propiedades de Elementos
* **Semántica y Accesibilidad:** HTML semántico con etiquetas correctas y uso de atributos ARIA donde sea necesario para la accesibilidad.
* **CSS Moderno:** Uso correcto de propiedades modernas de layout (Flexbox/Grid).
* **Documentación:** Se justifican las propiedades elegidas en la documentación.

### RA2.g: Clases de Estilos (Metodología)
* **Metodología:** Uso consistente de la metodología **BEM** (Bloque, Elemento, Modificador) en todo el proyecto.
* **Consistencia:** Nomenclatura clara y constante en todos los componentes (mínimo 6-7 componentes implementados bajo esta metodología).

---

## 3. Multimedia e Imágenes (RA3)

### RA3.b: Formatos Multimedia
* **Formatos Modernos:** Uso de formatos de próxima generación (WebP, AVIF) con fallbacks adecuados (PNG/JPG/SVG).
* **Documentación:** Explicación técnica en la documentación sobre por qué se eligieron los formatos específicos.

### RA3.c: Herramientas Multimedia
* **Herramientas:** Uso justificado de herramientas de optimización (ej. Squoosh, SVGO, TinyPNG).
* **Documentación:** Se documenta el proceso de optimización y las herramientas utilizadas.

### RA3.d: Tratamiento de Imagen
* **Optimización:** Todas las imágenes están optimizadas (peso reducido).
* **Responsive Images:** Uso de técnicas de imágenes responsivas (atributo `srcset` o etiqueta `<picture>`) para servir múltiples tamaños según el dispositivo.
* **Evidencia:** Se evidencia la mejora de rendimiento en la documentación.

### RA3.f: Animaciones CSS
* **Implementación:** Transiciones y animaciones funcionales y suaves (2-4 animaciones significativas implementadas).
* **Performance:** Uso de propiedades de alto rendimiento (`transform`, `opacity`) para evitar *reflows*.
* **Documentación:** Las animaciones están comentadas en código y explicadas en la documentación.

---

## 4. Integración Multimedia (RA4)

### RA4.a: Tecnologías Multimedia
* **Carga Diferida:** Implementación de `loading="lazy"` en imágenes y recursos que no están en el *viewport* inicial.
* **Fallback:** Estrategias de *fallback* adecuadas para navegadores antiguos o fallos de carga.
* **Documentación:** Se explican las técnicas de carga y optimización empleadas.

### RA4.e: Agregar Elementos Multimedia
* **Etiquetado Correcto:** Uso impecable de etiquetas `<picture>`, `<source>`, `<video>`, etc.
* **CLS (Layout Shift):** Implementación correcta de atributos de tamaño (`width` y `height`) para prevenir cambios de diseño acumulativos (Cumulative Layout Shift).

---

## 5. Entregables y Requisitos Técnicos (Obligatorios)

Para optar a la nota máxima, se deben cumplir estrictamente los siguientes requisitos de entrega y rendimiento:

### Código y Repositorio
* [ ] Repositorio Git con historial de *commits* descriptivos.
* [ ] Estructura de carpetas profesional y organizada.
* [ ] HTML validado (W3C Validator).
* [ ] CSS validado (W3C Validator).

### Despliegue y Rendimiento
* [ ] **URL Pública:** La aplicación debe estar desplegada y ser accesible.
* [ ] **Lighthouse Performance:** Puntuación > 80.
* [ ] **Lighthouse Accessibility:** Puntuación > 90.
* [ ] **Carga:** Peso total de la página completa < 2MB.

### Documentación (`docs/DOCUMENTACION.md`)
Debe incluir las 7 secciones completas:
1.  Arquitectura CSS y comunicación visual.
2.  HTML semántico y estructura.
3.  Sistema de componentes UI.
4.  Estrategia Responsive.
5.  Optimización multimedia.
6.  Sistema de temas (Dark Mode).
7.  Informe de accesibilidad.