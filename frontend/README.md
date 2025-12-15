# Joinly Frontend

> **Frontend Angular 19 de la plataforma de gestión de suscripciones compartidas**

Frontend moderno desarrollado con Angular 19, utilizando standalone components, SCSS con arquitectura ITCSS y metodología BEM.

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Requisitos](#-requisitos)
- [Instalación](#-instalación)
- [Desarrollo](#-desarrollo)
- [Build](#-build)
- [Testing](#-testing)
- [Arquitectura](#-arquitectura)
- [Estilos y CSS](#-estilos-y-css)
- [Recursos](#-recursos)

---

## ✨ Características

- 🎨 **Diseño Moderno y Responsivo** - Mobile-first, adaptable a todos los dispositivos
- 🧩 **Standalone Components** - Nueva arquitectura Angular sin módulos
- 🎭 **ViewEncapsulation None** - Control total sobre estilos globales
- 📐 **Arquitectura ITCSS** - Estilos organizados por especificidad
- 🔤 **Metodología BEM** - Nomenclatura CSS clara y mantenible
- 🎨 **Design Tokens** - Sistema de variables CSS para consistencia
- ♿ **Accesibilidad** - WCAG 2.1 nivel AA
- 🔐 **Guards de Autenticación** - Protección de rutas privadas
- 📡 **Servicios HTTP** - Comunicación con API REST
- 🎭 **Interceptores** - Manejo automático de tokens JWT
- 🎯 **Tipado Estricto** - TypeScript en modo strict

---

## 🛠 Tecnologías

- **Angular 19.0** - Framework principal
- **TypeScript 5.x** - Lenguaje
- **SCSS** - Preprocesador CSS
- **RxJS** - Programación reactiva
- **Angular Router** - Enrutamiento SPA
- **Angular Forms** - Formularios reactivos
- **Vitest** - Testing framework
- **ESLint** - Linter

---

## 📦 Requisitos

- **Node.js 18+**
- **npm 9+** o **yarn**
- **Angular CLI** (se instala automáticamente)

### Verificación

```bash
node -v    # Debe mostrar v18.x o superior
npm -v     # Debe mostrar v9.x o superior
```

---

## 🚀 Instalación

### 1. Navegar al Directorio

```bash
cd frontend
```

### 2. Instalar Dependencias

```bash
npm install
```

O con yarn:

```bash
yarn install
```

---

## 💻 Desarrollo

### Servidor de Desarrollo

Iniciar el servidor de desarrollo:

```bash
npm start
```

O directamente con Angular CLI:

```bash
ng serve
```

La aplicación estará disponible en: `http://localhost:4200/`

El servidor se recargará automáticamente cuando detecte cambios en los archivos fuente.

### Opciones Útiles

```bash
# Abrir automáticamente en el navegador
ng serve --open

# Usar otro puerto
ng serve --port 4300

# Modo producción (optimizado)
ng serve --configuration production
```

---

## 🏗 Build

### Build de Desarrollo

```bash
ng build
```

### Build de Producción

```bash
ng build --configuration production
```

O:

```bash
npm run build
```

Los archivos compilados se almacenarán en el directorio `dist/`. 

**Optimizaciones aplicadas en producción:**
- ✅ Minificación de JS y CSS
- ✅ Tree shaking
- ✅ Lazy loading de módulos
- ✅ AOT compilation
- ✅ Optimización de imágenes
- ✅ Code splitting

---

## 🧪 Testing

### Tests Unitarios

Ejecurar tests con [Vitest](https://vitest.dev/):

```bash
npm test
```

O:

```bash
ng test
```

### Tests E2E

Angular CLI no incluye framework E2E por defecto. Opciones recomendadas:

- **Cypress** (recomendado)
- **Playwright**
- **Protractor** (deprecado)

Para configurar Cypress:

```bash
npm install cypress --save-dev
npx cypress open
```

---

## 📁 Arquitectura

### Estructura de Directorios

```
frontend/
├── src/
│   ├── app/
│   │   ├── components/           # Componentes reutilizables
│   │   │   ├── shared/           # Componentes compartidos
│   │   │   │   ├── button/       # Componente botón
│   │   │   │   ├── form-input/   # Input de formulario
│   │   │   │   └── register-form/ # Formulario registro
│   │   │   └── ...
│   │   ├── pages/                # Páginas/Vistas
│   │   │   ├── home/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── dashboard/
│   │   │   └── ...
│   │   ├── layout/               # Componentes de layout
│   │   │   ├── header/
│   │   │   ├── footer/
│   │   │   └── main/
│   │   ├── services/             # Servicios HTTP
│   │   │   ├── auth.service.ts
│   │   │   ├── api.service.ts
│   │   │   └── ...
│   │   ├── guards/               # Guards de rutas
│   │   │   ├── auth.guard.ts
│   │   │   └── ...
│   │   ├── interceptors/         # HTTP Interceptors
│   │   │   └── jwt.interceptor.ts
│   │   ├── models/               # Interfaces y tipos
│   │   │   ├── usuario.model.ts
│   │   │   ├── suscripcion.model.ts
│   │   │   └── ...
│   │   ├── app.config.ts         # Configuración de la app
│   │   ├── app.routes.ts         # Definición de rutas
│   │   └── app.ts                # Componente principal
│   ├── styles/                   # Estilos globales (ITCSS)
│   │   ├── main.scss             # Archivo principal
│   │   ├── 00-settings/          # Variables, tokens
│   │   │   ├── _variables.scss
│   │   │   └── _css-variables.scss
│   │   ├── 01-tools/             # Mixins, funciones
│   │   │   └── _mixins.scss
│   │   ├── 02-generic/           # Reset, normalize
│   │   │   └── _reset.scss
│   │   ├── 03-elements/          # Estilos base HTML
│   │   │   ├── _base.scss
│   │   │   ├── _encabezados.scss
│   │   │   └── ...
│   │   └── 04-layout/            # Grid, flex, containers
│   │       ├── _rejilla.scss
│   │       ├── _flex.scss
│   │       └── _contenedor.scss
│   ├── assets/                   # Recursos estáticos
│   │   ├── images/
│   │   ├── icons/
│   │   └── fonts/
│   ├── index.html                # HTML principal
│   ├── main.ts                   # Punto de entrada
│   └── styles.scss               # Importa main.scss
├── public/                       # Archivos públicos
├── angular.json                  # Configuración Angular
├── tsconfig.json                 # Configuración TypeScript
├── package.json                  # Dependencias
└── README.md                     # Este archivo
```

### Standalone Components

Este proyecto utiliza la **nueva arquitectura de Angular** sin módulos (NgModules). Cada componente es independiente y declara sus propias dependencias.

**Ejemplo:**

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.html',
  styleUrls: ['./header.scss']
})
export class HeaderComponent { }
```

### Rutas

Las rutas se definen en `app.routes.ts`:

```typescript
import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [AuthGuard]  // Protegido
  },
  { path: '**', redirectTo: '' }
];
```

---

## 🎨 Estilos y CSS

### Arquitectura ITCSS

Los estilos están organizados siguiendo **ITCSS (Inverted Triangle CSS)**, una metodología que ordena el CSS por especificidad:

1. **Settings** - Variables, tokens
2. **Tools** - Mixins, funciones
3. **Generic** - Reset, normalize
4. **Elements** - Estilos base HTML
5. **Layout** - Grid, flexbox, contenedores
6. **Components** - Componentes específicos (en archivos `.scss` del componente)
7. **Utilities** - Clases de utilidad

### Metodología BEM

Usamos **BEM (Block Element Modifier)** para nombrar clases CSS:

```scss
// Block
.tarjeta { }

// Element
.tarjeta__titulo { }
.tarjeta__contenido { }

// Modifier
.tarjeta--destacada { }
.boton--primario { }
```

### Design Tokens (CSS Variables)

Definidos en `00-settings/_css-variables.scss`:

```css
:root {
  /* Colores */
  --color-primary: #8B5CF6;
  --color-secondary: #F97316;
  --color-danger: #EF4444;
  --color-success: #10B981;
  
  /* Espaciado */
  --spacing-xs: 0.5rem;
  --spacing-sm: 1rem;
  --spacing-md: 1.5rem;
  --spacing-lg: 2rem;
  
  /* Tipografía */
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
}
```

### ViewEncapsulation

Este proyecto usa `ViewEncapsulation.None` para tener control total sobre los estilos globales:

```typescript
import { ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-root',
  encapsulation: ViewEncapsulation.None,
  // ...
})
```

**Ventajas:**
- Control total sobre estilos globales
- Facilita metodología BEM
- Mejora reutilización de estilos
- Simplifica debugging

---

## 📚 Documentación Adicional

Para una guía completa de diseño, arquitectura CSS y principios de comunicación visual:

👉 **[DOCUMENTACION.md](../docs/design/DOCUMENTACION.md)** (2600+ líneas)

Incluye:
- Principios de comunicación visual (jerarquía, contraste, etc.)
- Metodología BEM en profundidad
- Arquitectura ITCSS explicada
- Sistema de Design Tokens
- Mixins y funciones SCSS
- HTML semántico y accesibilidad
- Ejemplos prácticos

---

## 🔧 Scaffolding de Código

Angular CLI incluye herramientas para generar código:

```bash
# Generar componente
ng generate component components/mi-componente

# Generar servicio
ng generate service services/mi-servicio

# Generar guard
ng generate guard guards/mi-guard

# Generar interceptor
ng generate interceptor interceptors/mi-interceptor

# Ver todas las opciones
ng generate --help
```

---

## 🔗 Recursos

- **[Angular Documentation](https://angular.dev/)** - Documentación oficial
- **[Angular CLI Reference](https://angular.dev/tools/cli)** - Referencia CLI
- **[RxJS Documentation](https://rxjs.dev/)** - Programación reactiva
- **[BEM Methodology](http://getbem.com/)** - Guía BEM
- **[ITCSS Architecture](https://www.xfive.co/blog/itcss-scalable-maintainable-css-architecture/)** - Arquitectura ITCSS

---

## 📞 Contacto

- **Proyecto:** Joinly - Frontend
- **Autor:** Juan
- **Repositorio:** https://github.com/Juanfu224/Joinly

---

<div align="center">
  <b>Desarrollado con Angular 19 💜</b>
</div>
