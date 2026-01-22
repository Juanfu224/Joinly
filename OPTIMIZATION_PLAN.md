# 🚀 Plan de Optimización Lighthouse - Joinly

**Fecha:** 22 de enero de 2026  
**Sitio:** joinly.studio  
**Herramienta:** Google Lighthouse

---

## 📊 Resultados Actuales

| Categoría | Score | Estado |
|-----------|-------|--------|
| **Performance** | 76 | 🟠 Necesita mejora |
| **Accessibility** | 94 | 🟢 Bueno |
| **Best Practices** | 100 | 🟢 Perfecto |
| **SEO** | 82 | 🟠 Necesita mejora |

### Métricas de Performance
- **FCP (First Contentful Paint):** 0.8s ✅
- **LCP (Largest Contentful Paint):** 0.8s ✅
- **Speed Index:** 1.0s ✅
- **CLS (Cumulative Layout Shift):** 0.708 ❌ (debe ser < 0.1)

---

## 🎯 Objetivos

| Categoría | Actual | Objetivo |
|-----------|--------|----------|
| Performance | 76 | 95+ |
| Accessibility | 94 | 100 |
| SEO | 82 | 100 |

---

## 📋 Checklist de Implementación

### 1. 🔴 Performance - Prioridad Alta

#### 1.1 Cumulative Layout Shift (CLS) - Crítico
El CLS actual es 0.708, muy por encima del umbral de 0.1. Esto afecta significativamente el score de performance.

- [ ] **1.1.1** Definir dimensiones explícitas para imágenes (`width` y `height`)
  - Añadir atributos `width` y `height` en todos los `<img>` y `<picture>`
  - Usar CSS `aspect-ratio` para mantener proporciones

- [ ] **1.1.2** Reservar espacio para fuentes web (Font Display)
  - Cambiar Google Fonts a `font-display: swap` o preferir `font-display: optional`
  - Considerar auto-hosting de la fuente Inter para mejor control

- [ ] **1.1.3** Precargar recursos críticos
  - Añadir `<link rel="preload">` para la fuente Inter
  - Usar `fetchpriority="high"` en LCP image

- [ ] **1.1.4** Reservar espacio para componentes dinámicos
  - Añadir `min-height` a contenedores hero y cards
  - Usar skeleton loaders con dimensiones fijas

#### 1.2 Optimización de JavaScript
- [ ] **1.2.1** Reducir JavaScript no utilizado
  - Revisar y eliminar código muerto con tree-shaking
  - Verificar que el lazy loading de rutas funciona correctamente
  - Analizar bundle con `ng build --stats-json` y webpack-bundle-analyzer

- [ ] **1.2.2** Minificación de JavaScript
  - Verificar que la build de producción tiene minificación habilitada
  - Revisar `angular.json` para confirmar optimizaciones en producción

---

### 2. 🟡 Accesibilidad - Prioridad Media-Alta

#### 2.1 Contraste de Colores
Los siguientes elementos no cumplen con el ratio de contraste mínimo (4.5:1 para texto normal, 3:1 para texto grande):

- [ ] **2.1.1** Botón "Empezar" en header móvil
  ```scss
  // Archivo: frontend/src/app/layout/header/header.scss
  // Clase: .c-header__btn--primario
  // Problema: color blanco sobre fondo naranja
  // Solución: Oscurecer el naranja o usar un tono más oscuro de texto
  ```

- [ ] **2.1.2** Texto del botón principal en hero
  ```scss
  // Archivo: frontend/src/styles/05-components/_c-button.scss
  // Componente: app-button variant="primary"
  // Problema: .c-button__text tiene bajo contraste
  ```

- [ ] **2.1.3** Enlaces del footer
  ```scss
  // Archivo: frontend/src/app/layout/footer/footer.scss
  // Clase: .c-footer__enlace
  // Problema: color gris sobre fondo oscuro
  // Solución: Aumentar luminosidad del texto del footer
  ```

#### 2.2 Orden de Encabezados
- [ ] **2.2.1** Corregir jerarquía de headings en home
  ```html
  <!-- Archivo: frontend/src/app/pages/home/home.html -->
  <!-- Problema: Se salta de H1 a H3 en la sección features -->
  <!-- Solución: Usar H2 en lugar de H3, o añadir H2 de sección oculto -->
  ```

#### 2.3 Textos Descriptivos en Enlaces
- [ ] **2.3.1** Mejorar texto del enlace "Empezar"
  ```html
  <!-- Problema: "Empezar" no es descriptivo -->
  <!-- Solución: Añadir aria-label o texto más descriptivo -->
  <!-- Ejemplo: aria-label="Empezar - Crear cuenta gratuita" -->
  ```

---

### 3. 🟡 SEO - Prioridad Media

#### 3.1 Archivo robots.txt
- [ ] **3.1.1** Crear archivo robots.txt válido
  ```
  # Archivo: frontend/public/robots.txt
  User-agent: *
  Allow: /
  
  # Rutas privadas
  Disallow: /dashboard/
  Disallow: /api/
  
  # Sitemap
  Sitemap: https://joinly.studio/sitemap.xml
  ```

- [ ] **3.1.2** Crear sitemap.xml
  ```xml
  <!-- Archivo: frontend/public/sitemap.xml -->
  ```

#### 3.2 Meta Tags Adicionales
- [ ] **3.2.1** Añadir meta tags Open Graph
  ```html
  <!-- Archivo: frontend/src/index.html -->
  <meta property="og:title" content="Joinly - Comparte suscripciones con tu familia">
  <meta property="og:description" content="...">
  <meta property="og:image" content="https://joinly.studio/assets/images/og-image.png">
  <meta property="og:url" content="https://joinly.studio">
  <meta property="og:type" content="website">
  ```

- [ ] **3.2.2** Añadir meta tags Twitter Card
  ```html
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Joinly - Comparte suscripciones">
  <meta name="twitter:description" content="...">
  <meta name="twitter:image" content="https://joinly.studio/assets/images/og-image.png">
  ```

#### 3.3 Structured Data (JSON-LD)
- [ ] **3.3.1** Añadir datos estructurados para la organización
  ```html
  <!-- Archivo: frontend/src/index.html -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Joinly",
    "description": "...",
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Web"
  }
  </script>
  ```

---

### 4. 🟢 Mejoras Adicionales - Prioridad Baja

#### 4.1 Optimización de Fuentes
- [ ] **4.1.1** Subconjunto de fuente Inter (solo caracteres latinos)
- [ ] **4.1.2** Considerar variable font para reducir requests

#### 4.2 Optimización de Imágenes
- [ ] **4.2.1** Servir imágenes en formato WebP/AVIF
- [ ] **4.2.2** Implementar responsive images con `srcset`
- [ ] **4.2.3** Lazy loading nativo para imágenes below-the-fold

#### 4.3 Configuración de Nginx
- [ ] **4.3.1** Habilitar Brotli compression (además de Gzip)
- [ ] **4.3.2** Optimizar cache headers para assets estáticos
  ```nginx
  # Archivo: nginx/nginx.conf
  location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
  ```

#### 4.4 Preconnect y DNS Prefetch
- [ ] **4.4.1** Ya implementado para Google Fonts ✅
- [ ] **4.4.2** Añadir preconnect para CDNs si se usan

---

## 📁 Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| `frontend/src/index.html` | Meta tags, preloads, structured data |
| `frontend/src/styles/00-settings/_css-variables.scss` | Colores con mejor contraste |
| `frontend/src/app/layout/header/header.scss` | Contraste botones |
| `frontend/src/app/layout/header/header.html` | Aria labels |
| `frontend/src/app/layout/footer/footer.scss` | Contraste enlaces |
| `frontend/src/app/pages/home/home.html` | Jerarquía headings |
| `frontend/src/app/components/shared/button/` | Contraste texto |
| `frontend/public/robots.txt` | Crear archivo |
| `frontend/public/sitemap.xml` | Crear archivo |
| `nginx/nginx.conf` | Brotli, cache headers |

---

## 🔧 Comandos Útiles

```bash
# Analizar bundle de Angular
cd frontend
ng build --stats-json
npx webpack-bundle-analyzer dist/joinly/stats.json

# Ejecutar Lighthouse localmente
npx lighthouse https://joinly.studio --view

# Verificar contraste de colores
# Usar: https://webaim.org/resources/contrastchecker/
```

---

## 📚 Referencias

- [Angular Performance Best Practices](https://angular.dev/best-practices/runtime-performance)
- [Web Vitals - CLS](https://web.dev/articles/cls)
- [WCAG 2.1 Contrast Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [robots.txt Specification](https://developers.google.com/search/docs/crawling-indexing/robots/intro)
- [Buenas Prácticas CSS - Proyecto](docs/buenas_practicas/css-moderno-arquitectura-y-organizacion.md)
- [Buenas Prácticas HTML5 - Proyecto](docs/buenas_practicas/HTML5-semantico-la-base-de-todo.md)

---

## ✅ Criterios de Aceptación

- [ ] Performance score ≥ 95
- [ ] Accessibility score = 100
- [ ] SEO score = 100
- [ ] CLS < 0.1
- [ ] Todos los contrastes cumplen WCAG AA (4.5:1)
- [ ] Jerarquía de headings correcta
- [ ] robots.txt y sitemap.xml funcionales
- [ ] Sin errores en la consola del navegador
