# Guía Rápida de Navegación - Joinly

Referencia rápida para trabajar con el sistema de navegación en Joinly.

---

## 🚀 Quick Start

### Navegar a una ruta

```html
<!-- En template -->
<a routerLink="/dashboard">Ir a Dashboard</a>
<a [routerLink]="['/grupos', grupo.id]">Ver Grupo</a>
```

```typescript
// En componente
this.router.navigate(['/dashboard']);
this.router.navigate(['/grupos', id]);
```

### Crear una nueva ruta

```typescript
// 1. Agregar en app.routes.ts
{
  path: 'mi-nueva-ruta',
  canActivate: [authGuard],  // Opcional: proteger
  resolve: { data: miResolver },  // Opcional: precargar datos
  loadComponent: () => import('./pages/mi-componente').then(m => m.MiComponente),
  title: 'Mi Título - Joinly',
  data: { breadcrumb: 'Mi Ruta' },  // Opcional: breadcrumb
}
```

### Proteger una ruta

```typescript
// En app.routes.ts
{
  path: 'ruta-privada',
  canActivate: [authGuard],  // ← Requiere autenticación
  loadComponent: () => import('./pages/privada').then(m => m.PrivadaComponent),
}
```

### Prevenir pérdida de datos

```typescript
// En app.routes.ts
{
  path: 'formulario',
  canDeactivate: [pendingChangesGuard],  // ← Confirma antes de salir
  loadComponent: () => import('./pages/form').then(m => m.FormComponent),
}

// En el componente
export class FormComponent implements CanComponentDeactivate {
  form = this.fb.group({ nombre: [''] });
  private saved = false;

  canDeactivate(): boolean {
    return this.saved || !this.form.dirty;
  }

  onSubmit() {
    // ... guardar datos
    this.saved = true;
    this.router.navigate(['/success']);
  }
}
```

### Precargar datos antes de mostrar la ruta

```typescript
// 1. Crear resolver
export const miResolver: ResolveFn<MisDatos> = () => {
  const service = inject(MiService);
  return service.obtenerDatos();
};

// 2. Agregar en app.routes.ts
{
  path: 'mi-ruta',
  resolve: { datos: miResolver },  // ← Precarga antes de activar
  loadComponent: () => import('./pages/mi-ruta').then(m => m.MiRutaComponent),
}

// 3. Leer en el componente
ngOnInit() {
  const datos = this.route.snapshot.data['datos'];
  console.log(datos);
}
```

---

## 📖 Patrones comunes

### Navegar con mensaje de éxito

```typescript
// Componente de origen
this.router.navigate(['/dashboard'], {
  state: { mensaje: '¡Operación exitosa!', tipo: 'success' }
});

// Componente de destino
ngOnInit() {
  const state = this.router.getCurrentNavigation()?.extras.state;
  if (state?.['mensaje']) {
    this.toastService.show(state['mensaje'], state['tipo']);
  }
}
```

### Navegar con query params

```typescript
// Filtrar dashboard
this.router.navigate(['/dashboard'], {
  queryParams: { categoria: 'streaming', page: 2 }
});
// URL: /dashboard?categoria=streaming&page=2

// Leer query params en el componente
this.route.queryParamMap.subscribe(params => {
  const categoria = params.get('categoria');
  const page = Number(params.get('page')) || 1;
});
```

### Redirección después de login

```typescript
// Guard captura returnUrl
export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  
  return auth.isAuthenticated()
    ? true
    : router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

// Login redirige a returnUrl
onLogin() {
  this.authService.login(credentials).subscribe(() => {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/dashboard';
    this.router.navigateByUrl(returnUrl);
  });
}
```

### Navegar sin historial

```typescript
// Útil para redirects de login/registro
this.router.navigate(['/dashboard'], {
  replaceUrl: true  // No añade al historial (botón "Atrás" no vuelve aquí)
});
```

---

## 🎨 Breadcrumbs

### Breadcrumb estático

```typescript
// En app.routes.ts
{
  path: 'dashboard',
  data: { breadcrumb: 'Mis Grupos' },  // ← String estático
  loadComponent: () => import('./pages/dashboard').then(m => m.DashboardComponent),
}
```

### Breadcrumb dinámico (desde resolver)

```typescript
// En app.routes.ts
{
  path: 'grupos/:id',
  resolve: { grupoData: grupoDetalleResolver },
  data: {
    breadcrumb: (data: Data) => {
      const resolved = data['grupoData'] as ResolvedData<GrupoDetalleData>;
      return resolved?.data?.grupo?.nombre ?? 'Grupo';
    }
  },
  loadComponent: () => import('./pages/grupo-detalle').then(m => m.GrupoDetalleComponent),
}
```

### Renderizar breadcrumbs

```html
<!-- En layout principal (app.html) -->
<main>
  <app-breadcrumbs></app-breadcrumbs>  <!-- Automático desde servicio -->
  <router-outlet></router-outlet>
</main>
```

---

## 🔒 Guards

### authGuard (Proteger rutas privadas)

```typescript
// Uso en rutas
{
  path: 'dashboard',
  canActivate: [authGuard],  // ← Solo usuarios autenticados
  loadComponent: () => import('./pages/dashboard').then(m => m.DashboardComponent),
}
```

**Comportamiento**:
- ✅ Si autenticado → Permite acceso
- ❌ Si no → Redirige a `/login?returnUrl=/dashboard`

### pendingChangesGuard (Prevenir pérdida de datos)

```typescript
// Uso en rutas
{
  path: 'crear-grupo',
  canDeactivate: [pendingChangesGuard],  // ← Confirma antes de salir
  loadComponent: () => import('./pages/crear-grupo').then(m => m.CrearGrupoComponent),
}
```

**Comportamiento**:
- ✅ Si `form.pristine` o `saved` → Permite salir
- ❌ Si `form.dirty` → Muestra `confirm()`

---

## 📦 Resolvers

### Crear un resolver

```typescript
// mi-datos.resolver.ts
export interface MisDatos {
  items: Item[];
  total: number;
}

export const miDatosResolver: ResolveFn<ResolvedData<MisDatos>> = () => {
  const service = inject(MiService);
  
  return service.obtenerDatos().pipe(
    map(data => resolveSuccess<MisDatos>(data)),
    catchError(err => of(resolveError<MisDatos>('Error al cargar datos')))
  );
};
```

### Usar un resolver

```typescript
// app.routes.ts
{
  path: 'mi-ruta',
  resolve: { misDatos: miDatosResolver },  // ← Clave para acceder a los datos
  loadComponent: () => import('./pages/mi-ruta').then(m => m.MiRutaComponent),
}
```

### Leer datos del resolver

```typescript
// mi-ruta.component.ts
ngOnInit() {
  const resolved = this.route.snapshot.data['misDatos'] as ResolvedData<MisDatos>;
  
  if (resolved.error) {
    this.toastService.error(resolved.error);
  } else if (resolved.data) {
    this.items.set(resolved.data.items);
  }
}
```

---

## ⚡ Lazy Loading

### Crear una ruta lazy

```typescript
// app.routes.ts
{
  path: 'mi-feature',
  loadComponent: () => import('./pages/mi-feature').then(m => m.MiFeatureComponent),
}
```

### Crear un grupo de rutas lazy

```typescript
// 1. Crear archivo de rutas (routes/mi-feature.routes.ts)
export const MI_FEATURE_ROUTES: Routes = [
  { path: '', loadComponent: () => import('../pages/mi-feature/index') },
  { path: 'detalle', loadComponent: () => import('../pages/mi-feature/detalle') },
];

// 2. Cargar en app.routes.ts
{
  path: 'mi-feature',
  loadChildren: () => import('./routes/mi-feature.routes').then(m => m.MI_FEATURE_ROUTES),
}
```

### Excluir de la precarga

```typescript
// app.routes.ts - Útil para rutas de desarrollo
{
  path: 'dev-tools',
  loadChildren: () => import('./routes/dev.routes').then(m => m.DEV_ROUTES),
  data: { preload: false },  // ← NO se precarga automáticamente
}
```

---

## 🔍 Router Inputs (Angular 21+)

### Leer parámetros de ruta como inputs

```typescript
// Ruta: /grupos/:id
@Component({
  selector: 'app-grupo-detalle',
  standalone: true,
})
export class GrupoDetalleComponent {
  // El parámetro 'id' se inyecta automáticamente
  readonly id = input.required<string>();

  ngOnInit() {
    console.log('ID del grupo:', this.id());
  }
}
```

**Configuración requerida** en `app.config.ts`:

```typescript
provideRouter(
  routes,
  withComponentInputBinding()  // ← Habilita Router Inputs
)
```

---

## 📝 Checklist para nuevas rutas

- [ ] Agregar en `app.routes.ts`
- [ ] Usar `loadComponent` para lazy loading
- [ ] Definir `title` para SEO
- [ ] Agregar `data.breadcrumb` si aplica
- [ ] Proteger con `authGuard` si es privada
- [ ] Usar `pendingChangesGuard` si es formulario
- [ ] Crear resolver si necesita precargar datos
- [ ] Verificar navegación en navegador
- [ ] Verificar que el chunk se genere en build

---

## 🛠️ Comandos útiles

```bash
# Ejecutar app en desarrollo
cd frontend
npm start

# Build de producción
npm run build

# Ver chunks generados
ls -lh dist/joinly/browser/*.js

# Servir build de producción
npm run preview

# Lint
npm run lint

# Tests
npm test
```

---

## 📚 Más información

- [NAVIGATION.md](./NAVIGATION.md) - Documentación completa
- [NAVIGATION_EXAMPLES.md](./NAVIGATION_EXAMPLES.md) - Ejemplos prácticos
- [LAZY_LOADING.md](./LAZY_LOADING.md) - Análisis de chunks
- [Angular Router Docs](https://angular.io/guide/router)

---

**Última actualización**: 14 de enero de 2026
