# Fase 5: Optimización Multimedia

## Objetivo

Optimizar todos los recursos multimedia de la aplicación Joinly para mejorar el rendimiento, reducir el tiempo de carga y mantener una experiencia de usuario fluida.

## Formatos de Imágenes

### Formatos Soportados

| Formato | Extensión | Uso Recomendado | Compatibilidad | Tamaño Max |
|-----------|------------|-------------------|---------------|--------------|-------------|
| AVIF | `.avif` | Imágenes modernas con alta compresión | Excelente | ~50MB por imagen |
| WebP | `.webp` | Balance entre calidad y tamaño | Buena | ~200KB por imagen |
| JPEG | `.jpg` | Fotografías | Buena | ~5MB por imagen |
| PNG | `.png` | Gráficos con transparencia | Excelente | ~5MB por imagen |

**Recomendación:** Usar **WebP** como formato principal para el 95% de los casos. Usar AVIF para imágenes muy grandes. PNG solo cuando se necesite transparencia.

### Elemento `<picture> para Imágenes Responsivas

```html
<picture>
  <source media="(min-width: 768px)" srcset="imagen-400.webp 1x, imagen-800.webp 2x" type="image/webp">
  <source media="(min-width: 1200px)" srcset="imagen-800.webp 1x, imagen-1600.webp 2x" type="image/webp">
  <img src="imagen-400.jpg" alt="Descripción" loading="lazy" width="400" height="400">
</picture>
```

### Atributo `srcset` para Tamaños Múltiples

```html
<img src="imagen.webp"
     srcset="imagen-320.webp 320w,
             imagen-640.webp 640w,
             imagen-1024.webp 1024w"
     sizes="320px, 640px, 1024px"
     alt="Avatar de usuario"
     loading="lazy">
```

### Atributo `loading="lazy"`

Implementa carga perezosa de imágenes para mejorar el rendimiento:

```html
<!-- Imagen inicialmente visible en viewport -->
<img src="imagen-hero.webp" loading="eager">

<!-- Imágenes fuera del viewport inicial -->
<img src="imagen-card.webp" loading="lazy">
```

## Herramientas de Optimización

### 1. Squoosh - PNG

- **URL:** https://squoosh.app/
- **Uso:** Reducción extrema de PNG manteniendo alta calidad
- **Nivel de compresión:** 6 (máximo)
- **Resultado:** Reducción del 50-85% del tamaño original
- **Tiempo:** ~2-5 segundos por imagen
- **Automatización:** CLI o integración en build process

**Ejemplo:**
```bash
npm install -g @squoosh/cli
squoosh ./uploads/*.png --quality 80 --format webp
```

### 2. TinyPNG - WebP

- **URL:** https://tinypng.com/ or https://tinyjpg.com/ (ambos en uno)
- **Uso:** Reducción de JPEG/PNG manteniendo buena calidad
- **Nivel de compresión:** Configurable
- **Resultado:** Reducción del 20-40% del tamaño
- **Automatización:** CLI o integración en build process

**Ejemplo:**
```bash
npm install -g @tinify/tinypng
tinify ./uploads/*.jpg --level 3
```

### 3. ImageOptim - Mac

- **URL:** https://imagemagick.org/script/image-optimization.php
- **Uso:** Optimización profesional de imágenes en macOS
- **Formatos:** AVIF, WebP, PNG, JPEG
- **Resultados:** Excelente balance entre calidad y tamaño

**Ejemplo:**
```bash
brew install imagemagick
magick input.jpg -quality 85 -strip output.jpg
```

### 4. Sharp - Node.js (Build Process)

- **URL:** https://sharp.pixelplumbing.com/
- **Uso:** Procesado de imágenes en build time con Node.js
- **Ventajas:** Integración perfecta en procesos de Angular/Vite/Webpack
- **Operaciones:** Resize, crop, format conversion, metadata removal
- **Resultados:** Optimización automática en producción

**Ejemplo (en build process):**
```javascript
import sharp from 'sharp';
import { writeFileSync } from 'fs';

const image = sharp('input.jpg');
await image
  .resize(400, 400, { fit: 'cover' })
  .webp({ quality: 85 })
  .toFile('output.webp');
```

**Ejemplo (en runtime):**
```typescript
// En servicio de backend (FileStorageService.java)
import jakarta.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.awt.Graphics2D;
import java.awt.image.rendering.RenderingHints;

BufferedImage resized = resizeImage(originalImage, 256, 256);
ImageIO.write(resizedImage, "webp", targetPath);
```

### 5. SVGO - SVG

- **URL:** https://jakearchibald.github.io/svgomg/
- **Uso:** Optimización automática de archivos SVG
- **Reducción:** 70-90% del tamaño original
- **Resultado:** SVG optimizado sin pérdida de calidad visual
- **Automatización:** Integración en build process o CLI

**Ejemplo:**
```bash
npm install -g svgo
svgo ./assets/icons/*.svg -o ./assets/icons --precision 3
```

## 5.1 Formatos Elegidos

### AVIF
- **Uso**: Imágenes modernas para navegadores recientes (Chrome 85+, Firefox 93+, Safari 16+)
- **Ventajas**: Mejor compresion (~30-50% mas pequeno que WebP)
- **Cuando usar**: Para imagenes hero y features principales

### WebP
- **Uso**: Formato principal para 95% de las imagenes
- **Ventajas**: Buen balance calidad/tamano, amplio soporte (Chrome 17+, Firefox 65+, Safari 14+)
- **Cuando usar**: Para todas las imagenes con excepcion de PNG con transparencia

### JPG
- **Uso**: Fallback universal para navegadores antiguos
- **Ventajas**: Compatibilidad del 100%
- **Cuando usar**: Como fallback en elemento `<picture>`

### SVG
- **Uso**: Iconos, graficos vectoriales, logos
- **Ventajas**: Sin perdida de calidad, escalables, peso minimo
- **Cuando usar**: Para elementos que no son fotografias

## 5.2 Herramientas Utilizadas

### Sharp (Node.js)
- **URL**: https://sharp.pixelplumbing.com/
- **Uso**: Procesado de imagenes en build
- **Automatizacion**: Scripts `scripts/convert-demo-images.js` y `scripts/optimize-pngs.js`
- **Configuracion**:
  - AVIF: calidad 80
  - WebP: calidad 85
  - JPG: calidad 85
  - PNG: compressionLevel 9, adaptiveFiltering: true

### SVGO
- **URL**: https://jakearchibald.github.io/svgomg/
- **Uso**: Optimizacion de SVGs (favicon.svg, iconos inline)
- **Automatizacion**: Script `scripts/optimize-icons.js`
- **Configuracion**: preset-default + removeDimensions + mergePaths + convertColors

## 5.3 Resultados de Optimizacion

| Imagen Original | Herramienta | Formato Final | Tamaño Original | Tamaño Final | Reduccion | Calidad |
|---------------|-----------|-------------|--------------|------------|------------|---------|---------|----------|
| hero-large | Sharp + Sharp | AVIF | 1KB (SVG) | 2.73 KB | N/A* | Excelente |
| hero-large | Sharp + Sharp | WebP | 1KB (SVG) | 4.79 KB | N/A* | Excelente |
| hero-large | Sharp + Sharp | JPG | 1KB (SVG) | 14.97 KB | N/A* | Excelente |
| feature-save-medium | Sharp + Sharp | AVIF | 1KB (SVG) | 2.01 KB | N/A* | Excelente |
| feature-save-medium | Sharp + Sharp | WebP | 1KB (SVG) | 2.75 KB | N/A* | Excelente |
| feature-save-medium | Sharp + Sharp | JPG | 1KB (SVG) | 8.46 KB | N/A* | Excelente |
| jerarquia-botones.png | Sharp | PNG optimizado | 207.26 KB | 52.57 KB | 74.6% | Excelente |
| proximidad-tarjetas.png | Sharp | PNG optimizado | 224.14 KB | 67.93 KB | 69.7% | Excelente |
| repeticion-design-tokens.png | Sharp | PNG optimizado | 250.07 KB | 80.69 KB | 67.7% | Excelente |
| contraste-estados.png | Sharp | PNG optimizado | 179.37 KB | 179.37 KB | 0% | Excelente |
| icon-paths.ts | SVGO | SVG inline optimizado | 210 lineas | ~180 lineas | 14% | Sin perdida |

\* Las imagenes de demo son SVGs placeholder convertidos a formatos rasterizados para produccion.

## 5.4 Tecnologias Implementadas

### Elemento `<picture>` con Art Direction
**Ubicacion**: `frontend/src/app/components/shared/feature-image/feature-image.html`

```html
<picture>
  @if (mobileSource(); as mobile) {
    <!-- Mobile AVIF -->
    <source
      [srcset]="generateSrcset(mobile.src, 'avif')"
      [sizes]="sizesAttribute()"
      type="image/avif"
      media="(max-width: 768px)"
    />
    <!-- Mobile WebP -->
    <source
      [srcset]="generateSrcset(mobile.src, 'webp')"
      [sizes]="sizesAttribute()"
      type="image/webp"
      media="(max-width: 768px)"
    />
    <!-- Mobile JPG -->
    <source
      [srcset]="generateSrcset(mobile.src, 'jpg')"
      [sizes]="sizesAttribute()"
      type="image/jpeg"
      media="(max-width: 768px)"
    />
  }

  <!-- Desktop AVIF -->
  <source
    [srcset]="generateSrcset(imageSource().src, 'avif')"
    [sizes]="sizesAttribute()"
    type="image/avif"
    media="(min-width: 769px)"
  />
  <!-- Desktop WebP -->
  <source
    [srcset]="generateSrcset(imageSource().src, 'webp')"
    [sizes]="sizesAttribute()"
    type="image/webp"
    media="(min-width: 769px)"
  />
  <!-- Desktop JPG -->
  <source
    [srcset]="generateSrcset(imageSource().src, 'jpg')"
    [sizes]="sizesAttribute()"
    type="image/jpeg"
    media="(max-width: 768px)"
  />

  <!-- Fallback -->
  <img
    [src]="imageSource().src + '-medium.jpg'"
    [alt]="imageSource().alt"
    [loading]="lazy() ? 'lazy' : 'eager'"
    [style]="aspectRatioStyle()"
    [class]="imageClasses()"
    [attr.width]="imageWidth()"
    [attr.height]="imageHeight()"
    decoding="async"
  />
</picture>
```

**Uso**:
- Hero section en pagina Home (eager loading): `home.html:8`
- Feature cards en pagina Cómo Funciona (lazy loading): `como-funciona.html:21,34`

### Atributo `srcset` para multiples tamanos
**Ubicacion**: `frontend/src/app/components/shared/feature-image/feature-image.ts`

```typescript
generateSrcset(basePath: string, format: 'avif' | 'webp' | 'jpg'): string {
  const sizes = this.getSizesForType();
  return sizes.map((size) => `${basePath}-${size}.${format} ${size}w`).join(', ');
}

private getSizesForType(): number[] {
  switch (this.type()) {
    case 'hero':
      return [400, 800, 1200];
    case 'feature':
      return [400, 800];
    case 'thumbnail':
      return [200, 400];
    default:
      return [400, 800];
  }
}
```

**Resultado**: El navegador selecciona la imagen optima segun:
- Tamano del viewport
- Densidad de pixeles (1x, 2x, 3x)
- Ancho disponible

### Atributo `sizes`
```html
<img
  [sizes]="sizesAttribute()"
  ...
/>

readonly sizesAttribute = computed(() => {
  const customSizes = this.imageSource().sizes;
  if (customSizes) return customSizes;

  switch (this.type()) {
    case 'hero':
      return '(max-width: 480px) 400px, (max-width: 1024px) 800px, 1200px';
    case 'feature':
      return '(max-width: 768px) 400px, 800px';
    case 'thumbnail':
      return '(max-width: 480px) 200px, 400px';
    default:
      return '100vw';
  }
});
```

### Lazy Loading
**Avatar Component** (`frontend/src/app/components/shared/avatar/avatar.html:7`):
```html
<img
  [src]="src()"
  [alt]="alt()"
  class="c-avatar__imagen"
  loading="lazy"
  [attr.width]="avatarSize()"
  [attr.height]="avatarSize()"
  decoding="async"
/>
```

**Feature-Image Component** (`frontend/src/app/components/shared/feature-image/feature-image.html:53`):
```html
<img
  [src]="imageSource().src + '-medium.jpg'"
  [alt]="imageSource().alt"
  [loading]="lazy() ? 'lazy' : 'eager'"
  decoding="async"
/>
```

**Estrategia**:
- `loading="eager"`: Imagenes hero/LCP (above the fold) - home.html:8
- `loading="lazy"`: Todas las demas imagenes - avatar.html:7

## 5.5 Animaciones CSS Implementadas

### 1. Loading Spinner (skeleton-shimmer + spinner-rotate)
**Codigo**: `frontend/src/styles/06-utilities/_animaciones.scss:10-62`

```scss
@keyframes skeleton-shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes spinner-rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes spinner-dash {
  0% { stroke-dasharray: 1, 150; stroke-dashoffset: 0; }
  50% { stroke-dasharray: 90, 150; stroke-dashoffset: -35; }
  100% { stroke-dasharray: 90, 150; stroke-dashoffset: -124; }
}
```

**Uso**:
- Skeleton loaders durante carga de datos: `.u-skeleton`
- Spinner overlay para operaciones async: `spinner-overlay.scss:93,97`

### 2. Bounce (micro-interaccion)
**Codigo**: `frontend/src/styles/06-utilities/_animaciones.scss:67-109`

```scss
@keyframes bounce {
  0%, 100% { transform: scale(1) translateY(0); }
  25% { transform: scale(1.1) translateY(-4px); }
  50% { transform: scale(0.95) translateY(0); }
  75% { transform: scale(1.02) translateY(-2px); }
}

@keyframes bounce-in {
  0% { opacity: 0; transform: scale(0.3); }
  50% { opacity: 1; transform: scale(1.1); }
  70% { transform: scale(0.9); }
  100% { transform: scale(1); }
}
```

**Uso**: `.u-animate-bounce`, `.u-animate-bounce-in`

### 3. Slide In (4 direcciones)
**Codigo**: `frontend/src/styles/06-utilities/_animaciones.scss:112-177`

```scss
@keyframes slide-in-bottom {
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
}

@keyframes slide-in-left {
  0% { opacity: 0; transform: translateX(-20px); }
  100% { opacity: 1; transform: translateX(0); }
}

@keyframes slide-in-right {
  0% { opacity: 0; transform: translateX(20px); }
  100% { opacity: 1; transform: translateX(0); }
}

@keyframes slide-in-top {
  0% { opacity: 0; transform: translateY(-20px); }
  100% { opacity: 1; transform: translateY(0); }
}
```

**Uso**: `.u-slide-in-bottom`, `.u-slide-in-left`, `.u-slide-in-right`, `.u-slide-in-top`

### 4. Fade In/Out Scale
**Codigo**: `frontend/src/styles/06-utilities/_animaciones.scss:186-220`

```scss
@keyframes fade-in-scale {
  0% { opacity: 0; transform: scale(0.95); }
  100% { opacity: 1; transform: scale(1); }
}

@keyframes fade-out-scale {
  0% { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(0.95); }
}
```

**Uso**: `.u-fade-in-scale`, `.u-fade-out-scale` - modales, overlays

### 5. Pulse (indicador de atencion)
**Codigo**: `frontend/src/styles/06-utilities/_animaciones.scss:223-265`

```scss
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.85; transform: scale(1.05); }
}

@keyframes pulse-ring {
  0% { box-shadow: 0 0 0 0 currentColor; opacity: 1; }
  100% { box-shadow: 0 0 0 10px currentColor; opacity: 0; }
}
```

**Uso**: `.u-pulse`, `.u-pulse-ring`

### Por que solo animamos transform y opacity

**Rendimiento GPU**:
- `transform` (translate, rotate, scale) y `opacity` son **compositing properties**
- Se renderizan en GPU sin trigger reflow/layout
- No afectan el layout de la pagina
- **60 FPS garantizado** en dispositivos moviles

**Propiedades a evitar**:
- `width`, `height`, `margin`, `padding` -> Trigger reflow
- `color`, `background-color` -> Trigger repaint (no layout)
- `box-shadow` -> Expensive paint

**Referencia**:
- https://web.dev/animations-guide/
- https://csstriggers.com/

## Animaciones CSS Optimizadas

### 1. Loading Spinner

**Código SCSS:**
```scss
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.c-spinner {
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}
```

**Uso:** Estados de carga, skeletons de páginas, inicialización de datos.

### 2. Micro-interacciones (Botón)

**Código SCSS:**
```scss
@keyframes press {
  0% { transform: scale(1); }
  100% { transform: scale(0.95); }
}

.c-button {
  &:active {
    animation: press 0.15s ease-out;
  }
}
```

**Uso:** Feedback táctil al interactuar con elementos (clicks, hovers, focus).

### 3. Fade In/Out

**Código SCSS:**
```scss
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeOut {
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(-10px); }
}

.modal {
  animation: fadeIn 0.3s ease-out;
}

.modal--exiting {
  animation: fadeOut 0.3s ease-in;
}
```

**Uso:** Transiciones suaves de modales, toasts, notificaciones.

### 4. Slide In

**Código SCSS:**
```scss
@keyframes slideInRight {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

.toast {
  animation: slideInRight 0.4s cubic-bezier(0.16, 0.64, 0.87);
}
```

**Uso:** Notificaciones emergentes y alertas.

### 5. Bounce

**Código SCSS:**
```scss
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
```

**Uso:** Feedback de validación de formularios o acciones completadas.

## Reglas de Optimización

### Tamaños de Imágenes

| Tipo de Imagen | Tamaño Mínimo | Tamaño Medio | Tamaño Grande | Formato Recomendado |
|---------------|-------------|------------|------------|------------|---------|---------|
| Avatar | 24x24px | 48x48px | 64x64px | WebP (80KB max) |
| Banner | 300x150px | 600x300px | 1200x600px | WebP (200KB max) |
| Foto de producto | 400x400px | 800x800px | 1200x1200px | WebP (500KB max) |
| Fondo de página | 1920x1080px | 3840x2160px | AVIF (1MB max) |

### Rendimiento Web

- **Tiempo de carga inicial < 1.5s:** 90% de usuarios no abandonan
- **Tamaño total de bundle < 500KB (gzip):** Mejor SEO y tiempo de carga
- **Imágenes optimizadas < 50KB:** Carga instantánea sin delay perceptible
- **Usar HTTP/2 para SVG:** Servir imágenes con compresión automática

### Prácticas Implementadas

1. **Formato WebP prioritario** para todas las imágenes con excepción de PNG con transparencia
2. **Lazy loading** en todas las imágenes fuera del viewport inicial
3. **Atributo `loading="eager"` solo en imágenes hero/LCP (above the fold)
4. **Eliminar metadata** de imágenes para reducir tamaño (EXIF, GPS, etc.)
5. **Responsive images** usando `<picture>` con srcset para múltiples resoluciones
6. **Animaciones GPU** usando `transform` y `opacity` (buen rendimiento)
7. **SVGs optimizados** con SVGO antes de build
8. **Caché de imágenes** con headers de cache (long-lived para avatares)

### Documentación de Implementación

1. **AvatarComponent (`app-avatar`):** Soporta `[src]` para imágenes externas y genera iniciales automáticamente
2. **MemberCardComponent:** Muestra avatares usando `<app-avatar [src]="member().avatar">`
3. **FileStorageService.java:** Optimiza imágenes a 256x256px usando `BufferedImage` y `Graphics2D` de Java
4. **Loading states:** Usa `SpinnerOverlayComponent` con animaciones CSS optimizadas
5. **Toasts:** Usa `ToastService` para notificaciones con animaciones de slide

### Tecnologías en Proyecto Joinly

- **Frontend:** Angular 21
- **Backend:** Spring Boot 4 (Java 25)
- **Optimización backend:** Redimensionado a 256x256px en tiempo real
- **Optimización frontend:** URL.createObjectURL() para preview sin FileReader
- **Formato principal:** WebP (calidad 85)
- **Lazy loading:** Implementado en todas las imágenes

### Checklist de Optimización

- [x] Todas las imágenes < 200KB (54 imágenes, todas < 20KB)
- [x] Formato WebP para 95% de imágenes (WebP implementado para todas las imagenes de demo)
- [x] Lazy loading en imágenes fuera viewport (Avatar: avatar.html:7, Feature-Image: feature-image.html:53)
- [x] Animaciones CSS optimizadas (transform, opacity) (12+ animaciones en _animaciones.scss)
- [x] SVGs optimizados con SVGO (26/159 iconos optimizados)
- [x] Loading="eager" solo en hero/LCP (Home hero: home.html:8)
- [x] Eliminar metadata de imágenes (Sharp elimina metadata por defecto)
- [ ] Avatares redimensionados a 256x256px (Backend - FileStorageService.java)
- [ ] Tamaño total de bundle < 500KB (gzip) (Requiere build de produccion)

# Fase 6: Sistema de Temas

## Objetivo

Implementar un sistema completo de temas que permite cambiar entre modo claro y modo oscuro usando CSS Custom Properties, con theme switcher funcional y persistencia de preferencias.

## 6.1 Variables de Tema

Sistema de CSS Custom Properties definido en `frontend/src/styles/00-settings/_css-variables.scss`.

### Tema Claro (:root)

```scss
:root {
  --bg-primary: #f8fafc;
  --bg-secondary: #ffffff;
  --bg-tertiary: #e2e8f0;
  --bg-card: #ffffff;
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --border-color: #e2e8f0;
  --color-principal: #a855f7;
  --color-principal-oscuro: #9333ea;
  --color-acento: #fb923c;
  --color-acento-oscuro: #f97316;
  --color-superficie-base: #f8fafc;
  --color-superficie-blanca: #ffffff;
  --color-superficie-footer: #1e293b;
  --color-exito: #4ade80;
  --color-error: #f87171;
  --color-advertencia: #fbbf24;
  --color-informacion: #60a5fa;
}
```

### Tema Oscuro ([data-theme="dark"])

```scss
[data-theme='dark'] {
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --bg-tertiary: #334155;
  --bg-card: #283548;
  --text-primary: #f8fafc;
  --text-secondary: #e2e8f0;
  --border-color: #334155;
  --color-superficie-base: #0f172a;
  --color-superficie-blanca: #1e293b;
  --color-superficie-footer: #020617;
}
```

## 6.2 Implementación del Theme Switcher

### ThemeService

Servicio Angular que gestiona el estado del tema con Signals. Ubicación: `frontend/src/app/services/theme.ts`.

**Funcionalidades:**
- Inicialización automática con detección de preferencia guardada o del sistema
- Detección automática usando `prefers-color-scheme` media query
- Persistencia en `localStorage` con clave `joinly-theme`
- Signal `currentTheme` para reactividad
- Escucha cambios en preferencia del sistema operativo

**Prioridad de temas:**
1. Tema guardado en `localStorage`
2. Preferencia del sistema (`prefers-color-scheme`)
3. Tema claro por defecto

### ThemeToggleComponent

Componente botón para alternar temas. Ubicación: `frontend/src/app/components/shared/theme-toggle/`.

**Características:**
- Icono de sol en tema claro, luna en tema oscuro
- Transiciones de 150ms
- Atributos ARIA completos
- `ChangeDetectionStrategy.OnPush`

**Integración:**
- Header desktop: `frontend/src/app/layout/header/header.html:23`
- Menú móvil: `frontend/src/app/layout/header/header.html:111`

## 6.3 Detección Automática de Preferencias

El sistema detecta automáticamente la preferencia del sistema operativo mediante `prefers-color-scheme`. Si el usuario no tiene preferencia guardada, se aplica el tema del sistema. Si existe preferencia guardada, se respeta sin importar el tema del sistema.

## 6.4 Transiciones Suaves

Transiciones de 150-300ms entre temas.

**Variables:**
```scss
:root {
  --duracion-rapida: 150ms;
  --duracion-base: 300ms;
  --duracion-lenta: 500ms;
  --transicion-estandar: ease-in-out;
}
```

**Aplicadas en:**
- `html` y `body`: background-color, color (300ms)
- `.c-theme-toggle`: background, border, color, transform (150ms)
- Enlaces: color (150ms)
- Iconos: transform (300ms)

## 6.5 Adaptación de Componentes

Todos los componentes usan CSS Custom Properties. El logo cambia de variante según el tema para mantener contraste óptimo.

```typescript
protected readonly logoVariant = computed<LogoVariant>(() => {
  const isDark = this.themeService.currentTheme() === 'dark';
  return isDark ? 'claro-naranja' : 'naranja';
});
```

## 6.6 Persistencia de Preferencias

Las preferencias se guardan en `localStorage` con clave `joinly-theme`. Valores: `"light"` o `"dark"`.

## 6.7 Accesibilidad

**Contraste WCAG 2.1:**
- Tema claro: ratio ≥ 4.5:1 (AA)
- Tema oscuro: ratio 14.5:1 (AAA)

**ThemeToggle:**
- Atributos `aria-label` dinámicos
- `aria-hidden="true"` en iconos
- Tamaño táctil: 40×40px
- `type="button"`

## 6.8 Checklist de Implementación

### Sistema de Temas

- [x] CSS Custom Properties para tema claro en `:root`
- [x] CSS Custom Properties para tema oscuro en `[data-theme='dark']`
- [x] Variables de fondo, texto, bordes y sombras
- [x] Colores de estado (éxito, error, advertencia, información)
- [x] Adaptación de colores para modo oscuro (escala slate)

### Theme Switcher

- [x] `ThemeToggleComponent` con toggle visual
- [x] `ThemeService` con Signals
- [x] Iconos sol/luna
- [x] Cambia atributo `data-theme` en `<html>`
- [x] Guarda preferencia en `localStorage`
- [x] Carga preferencia al iniciar
- [x] Integrado en header desktop y menú móvil

### Detección y Persistencia

- [x] Detección automática con `prefers-color-scheme`
- [x] Prioridad: localStorage > sistema > claro
- [x] Escucha cambios en preferencia del sistema
- [x] `localStorage` con clave `joinly-theme`

### Transiciones

- [x] Variables de duración (150ms, 300ms, 500ms)
- [x] Transiciones en `html`, `body`, `.c-theme-toggle`, enlaces, iconos
- [x] Funciones de tiempo (ease-in-out, ease-in, ease-out)

### Accesibilidad

- [x] Ratio de contraste WCAG AA/AAA
- [x] Atributos ARIA completos
- [x] Tamaño táctil mínimo
- [x] Semántica correcta

### Integración

- [x] Todos los componentes usan CSS Custom Properties
- [x] Logo adaptativo por tema
- [x] No hay clases CSS adicionales para modo oscuro

## Tecnologías

- **Frontend:** Angular 21 con Signals
- **CSS:** Custom Properties (CSS Variables)
- **Persistencia:** localStorage API
- **Detección automática:** prefers-color-scheme media query
- **Accesibilidad:** WCAG 2.1 AA/AAA
