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

## Tabla de Resultados de Optimización

| Imagen Original | Herramienta | Formato Final | Tamaño Original | Tamaño Final | Reducción | Calidad |
|---------------|-----------|-------------|--------------|------------|------------|---------|---------|----------|
| foto-perfil.jpg | Squoosh | foto-perfil.webp | 1.2 MB | 180 KB | 85% | Excelente |
| banner-hero.jpg | TinyPNG | banner-hero.webp | 500 KB | 95 KB | 80% | Muy Buena |
| icon-logo.svg | SVGO | icon-logo.svg | 12 KB | 3 KB | 75% | Sin pérdida |

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

- [ ] Todas las imágenes < 200KB
- [ ] Formato WebP para 95% de imágenes
- [ ] Lazy loading en imágenes fuera viewport
- [ ] Animaciones CSS optimizadas (transform, opacity)
- [ ] SVGs optimizados con SVGO
- [ ] Avatares redimensionados a 256x256px
- [ ] Loading="eager" solo en hero/LCP
- [ ] Eliminar metadata de imágenes
- [ ] Tamaño total de bundle < 500KB (gzip)
