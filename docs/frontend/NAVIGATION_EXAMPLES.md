# Ejemplos de Navegación Programática - Joinly

Esta guía contiene ejemplos reales de cómo se implementa la navegación programática en el proyecto Joinly.

---

## Tabla de contenidos

- [Navegación básica](#navegación-básica)
- [Navegación con parámetros](#navegación-con-parámetros)
- [Navegación con query params](#navegación-con-query-params)
- [Navegación con state (datos ocultos)](#navegación-con-state-datos-ocultos)
- [Redirección después de login](#redirección-después-de-login)
- [Navegación desde formularios](#navegación-desde-formularios)
- [Navegación condicional](#navegación-condicional)

---

## Navegación básica

### Desde componente Home a Dashboard

```typescript
// pages/home/home.component.ts
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.html',
})
export class HomeComponent {
  private readonly router = inject(Router);

  irAMisGrupos() {
    // Navegación absoluta simple
    this.router.navigate(['/dashboard']);
  }

  irACrearGrupo() {
    // Navegación absoluta con ruta directa
    this.router.navigate(['/crear-grupo']);
  }
}
```

**Template HTML:**

```html
<!-- Navegación declarativa -->
<app-button routerLink="/dashboard" variant="primary">
  Ver mis grupos
</app-button>

<!-- Navegación programática -->
<app-button (click)="irAMisGrupos()" variant="primary">
  Ver mis grupos
</app-button>
```

---

## Navegación con parámetros

### Ver detalle de un grupo

```typescript
// components/shared/group-card/group-card.component.ts
import { Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import type { GrupoCardData } from '../../../models';

@Component({
  selector: 'app-group-card',
  standalone: true,
  templateUrl: './group-card.html',
})
export class GroupCardComponent {
  private readonly router = inject(Router);

  readonly grupo = input.required<GrupoCardData>();

  verDetalle() {
    // Navegar con parámetro ID
    this.router.navigate(['/grupos', this.grupo().id]);
    // Resultado: /grupos/42
  }
}
```

**Template HTML:**

```html
<!-- Opción 1: Navegación declarativa con parámetro -->
<a [routerLink]="['/grupos', grupo().id]" class="group-card">
  {{ grupo().nombre }}
</a>

<!-- Opción 2: Navegación programática -->
<button (click)="verDetalle()" class="group-card">
  {{ grupo().nombre }}
</button>
```

### Crear suscripción dentro de un grupo

```typescript
// pages/grupo-detalle/grupo-detalle.component.ts
import { Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-grupo-detalle',
  standalone: true,
  templateUrl: './grupo-detalle.html',
})
export class GrupoDetalleComponent {
  private readonly router = inject(Router);

  // Router Input (Angular 21+)
  readonly id = input.required<string>();

  crearSuscripcion() {
    // Navegar a subruta con parámetro padre
    this.router.navigate(['/grupos', this.id(), 'crear-suscripcion']);
    // Resultado: /grupos/42/crear-suscripcion
  }
}
```

---

## Navegación con query params

### Filtrar dashboard por categoría

```typescript
// pages/dashboard/dashboard.component.ts
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.html',
})
export class DashboardComponent {
  private readonly router = inject(Router);

  filtrarPorCategoria(categoria: string) {
    // Navegar con query params
    this.router.navigate(['/dashboard'], {
      queryParams: { categoria },
    });
    // Resultado: /dashboard?categoria=streaming
  }

  aplicarFiltros(filtros: { categoria?: string; estado?: string; page: number }) {
    // Query params múltiples
    this.router.navigate(['/dashboard'], {
      queryParams: {
        categoria: filtros.categoria || null,  // null elimina el param
        estado: filtros.estado || null,
        page: filtros.page > 1 ? filtros.page : null,
      },
    });
    // Resultado: /dashboard?categoria=streaming&estado=activo&page=2
  }

  limpiarFiltros() {
    // Navegar sin query params (los elimina)
    this.router.navigate(['/dashboard']);
    // Resultado: /dashboard
  }

  agregarFiltroSinPerderExistentes(nuevoFiltro: string, valor: string) {
    // Preservar query params existentes
    this.router.navigate(['/dashboard'], {
      queryParams: { [nuevoFiltro]: valor },
      queryParamsHandling: 'merge',  // ← Fusiona con existentes
    });
    // Si URL era /dashboard?categoria=streaming
    // Resultado: /dashboard?categoria=streaming&estado=activo
  }
}
```

**Lectura de query params en componente:**

```typescript
// pages/dashboard/dashboard.component.ts
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export class DashboardComponent {
  private readonly route = inject(ActivatedRoute);

  readonly categoria = signal<string | null>(null);
  readonly page = signal<number>(1);

  constructor() {
    // Suscribirse a cambios en query params (reactivo)
    this.route.queryParamMap
      .pipe(takeUntilDestroyed())
      .subscribe((params) => {
        this.categoria.set(params.get('categoria'));
        this.page.set(Number(params.get('page')) || 1);
        
        // Recargar datos con nuevos filtros
        this.cargarGrupos();
      });
  }

  private cargarGrupos() {
    const filtros = {
      categoria: this.categoria(),
      page: this.page(),
    };
    // ... lógica de carga
  }
}
```

---

## Navegación con state (datos ocultos)

### Pasar datos entre componentes sin URL

```typescript
// pages/dashboard/dashboard.component.ts
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import type { UnidadFamiliar } from '../../models';

export class DashboardComponent {
  private readonly router = inject(Router);

  editarGrupo(grupo: UnidadFamiliar) {
    // Pasar datos en state (no aparecen en la URL)
    this.router.navigate(['/grupos', grupo.id], {
      state: { 
        grupo,                    // Datos completos del grupo
        origen: 'dashboard',      // Contexto de navegación
        mostrarModal: true,       // Flag para comportamiento
      },
    });
  }

  eliminarGrupo(grupoId: number) {
    this.grupoService.eliminar(grupoId).subscribe({
      next: () => {
        // Navegar con mensaje de éxito en state
        this.router.navigate(['/dashboard'], {
          state: { 
            mensaje: 'Grupo eliminado correctamente',
            tipo: 'success',
          },
        });
      },
      error: () => {
        // Navegar con mensaje de error en state
        this.router.navigate(['/dashboard'], {
          state: { 
            mensaje: 'Error al eliminar el grupo',
            tipo: 'error',
          },
        });
      },
    });
  }
}
```

**Lectura de state en componente destino:**

```typescript
// pages/grupo-detalle/grupo-detalle.component.ts
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

export class GrupoDetalleComponent {
  private readonly router = inject(Router);

  ngOnInit() {
    // Leer state de la navegación
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state;

    if (state) {
      const grupo = state['grupo'] as UnidadFamiliar | undefined;
      const origen = state['origen'] as string | undefined;
      const mostrarModal = state['mostrarModal'] as boolean | undefined;

      if (mostrarModal) {
        this.abrirModalEdicion();
      }

      console.log('Navegado desde:', origen);
    }
  }
}

// pages/dashboard/dashboard.component.ts (leer mensajes)
export class DashboardComponent {
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  ngOnInit() {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state;

    if (state?.['mensaje']) {
      const mensaje = state['mensaje'] as string;
      const tipo = state['tipo'] as 'success' | 'error';

      if (tipo === 'success') {
        this.toastService.success(mensaje);
      } else {
        this.toastService.error(mensaje);
      }
    }
  }
}
```

---

## Redirección después de login

### Guard + Login + Redirección

```typescript
// guards/auth.guard.ts
import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Redirigir a login guardando URL original
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url },
  });
};
```

```typescript
// pages/auth/login/login.component.ts
import { Component, inject, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth';
import { ToastService } from '../../../services/toast';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.html',
})
export class LoginComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);

  readonly loading = signal(false);

  onLogin(credentials: { email: string; password: string }) {
    this.loading.set(true);

    this.authService.login(credentials).subscribe({
      next: (response) => {
        // Login exitoso - leer returnUrl
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/dashboard';
        
        this.toastService.success(`¡Bienvenido, ${response.usuario.nombre}!`);
        
        // Navegar a la URL original o dashboard
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.loading.set(false);
        this.toastService.error(err.error?.message || 'Credenciales inválidas');
      },
    });
  }
}
```

**Flujo completo:**

1. Usuario sin autenticación intenta acceder a `/grupos/42`
2. `authGuard` redirige a `/login?returnUrl=/grupos/42`
3. Usuario hace login exitoso
4. Sistema navega a `/grupos/42` (URL original)

---

## Navegación desde formularios

### Después de crear un grupo

```typescript
// pages/crear-grupo/crear-grupo.component.ts
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { UnidadFamiliarService } from '../../services';
import { ToastService } from '../../services/toast';
import type { CanComponentDeactivate } from '../../guards/can-component-deactivate';

@Component({
  selector: 'app-crear-grupo',
  standalone: true,
  templateUrl: './crear-grupo.html',
})
export class CrearGrupoComponent implements CanComponentDeactivate {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly unidadService = inject(UnidadFamiliarService);
  private readonly toastService = inject(ToastService);

  readonly loading = signal(false);
  private saved = false;

  readonly form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    descripcion: [''],
    maxMiembros: [5, [Validators.required, Validators.min(2), Validators.max(10)]],
  });

  canDeactivate(): boolean {
    // Permitir salir si el formulario fue guardado o está limpio
    return this.saved || !this.form.dirty;
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.loading.set(true);

    this.unidadService.crearGrupo(this.form.value).subscribe({
      next: (nuevoGrupo) => {
        this.saved = true;  // ← Importante: marcar como guardado
        this.toastService.success('¡Grupo creado exitosamente!');
        
        // Navegar al detalle del nuevo grupo
        this.router.navigate(['/grupos', nuevoGrupo.id], {
          state: { 
            mensaje: 'Ahora puedes invitar miembros y agregar suscripciones',
            mostrarTutorial: true,
          },
        });
      },
      error: (err) => {
        this.loading.set(false);
        this.toastService.error(err.error?.message || 'Error al crear el grupo');
      },
    });
  }

  cancelar() {
    if (this.form.dirty) {
      const confirmar = confirm('¿Descartar los cambios?');
      if (!confirmar) return;
    }

    // Volver al dashboard
    this.router.navigate(['/dashboard']);
  }
}
```

### Después de crear una suscripción

```typescript
// pages/crear-suscripcion/crear-suscripcion.component.ts
import { Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { SuscripcionService } from '../../services';

export class CrearSuscripcionComponent {
  private readonly router = inject(Router);
  private readonly suscripcionService = inject(SuscripcionService);

  // Router Input - ID del grupo desde la URL
  readonly id = input.required<string>();

  onSubmit(formData: any) {
    const grupoId = Number(this.id());

    this.suscripcionService.crear(grupoId, formData).subscribe({
      next: (nuevaSuscripcion) => {
        // Volver al detalle del grupo con mensaje de éxito
        this.router.navigate(['/grupos', grupoId], {
          state: { 
            mensaje: `Suscripción "${nuevaSuscripcion.nombre}" creada`,
            scrollTo: 'suscripciones',  // Scroll a sección
          },
          // Opcional: reemplazar la URL actual (no añade al historial)
          replaceUrl: false,
        });
      },
    });
  }
}
```

---

## Navegación condicional

### Según rol o permisos

```typescript
// pages/grupo-detalle/grupo-detalle.component.ts
import { Component, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import type { UnidadFamiliar } from '../../models';

export class GrupoDetalleComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  readonly grupo = signal<UnidadFamiliar | null>(null);

  // Computed: verificar si el usuario es admin del grupo
  readonly esAdmin = computed(() => {
    const usuario = this.authService.currentUser();
    const grupo = this.grupo();
    return grupo?.adminId === usuario?.id;
  });

  editarGrupo() {
    if (!this.esAdmin()) {
      // No es admin - mostrar error y no navegar
      this.toastService.error('Solo el administrador puede editar el grupo');
      return;
    }

    // Es admin - permitir navegación
    this.router.navigate(['/grupos', this.grupo()!.id, 'editar']);
  }

  eliminarGrupo() {
    if (!this.esAdmin()) {
      this.toastService.error('Solo el administrador puede eliminar el grupo');
      return;
    }

    const confirmar = confirm('¿Eliminar el grupo? Esta acción no se puede deshacer.');
    if (!confirmar) return;

    this.grupoService.eliminar(this.grupo()!.id).subscribe({
      next: () => {
        this.router.navigate(['/dashboard'], {
          state: { mensaje: 'Grupo eliminado', tipo: 'success' },
        });
      },
    });
  }
}
```

### Según estado de autenticación

```typescript
// components/layout/header/header.component.ts
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth';

export class HeaderComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  readonly isAuthenticated = this.authService.isAuthenticated;

  navegarSegunAuth() {
    if (this.isAuthenticated()) {
      // Usuario autenticado - ir a dashboard
      this.router.navigate(['/dashboard']);
    } else {
      // Usuario no autenticado - ir a home
      this.router.navigate(['/']);
    }
  }

  logout() {
    this.authService.logout();  // Limpia token
    
    // Navegar a home
    this.router.navigate(['/'], {
      state: { mensaje: 'Sesión cerrada correctamente' },
    });
  }
}
```

### Según resultados de formulario

```typescript
// pages/unirse-grupo/unirse-grupo.component.ts
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SolicitudService } from '../../services';

export class UnirseGrupoComponent {
  private readonly router = inject(Router);
  private readonly solicitudService = inject(SolicitudService);

  solicitarUnirse(codigoInvitacion: string) {
    this.solicitudService.enviarSolicitud(codigoInvitacion).subscribe({
      next: (solicitud) => {
        if (solicitud.estado === 'APROBADA') {
          // Solicitud aprobada automáticamente - ir al grupo
          this.router.navigate(['/grupos', solicitud.unidadFamiliarId], {
            state: { mensaje: '¡Bienvenido al grupo!' },
          });
        } else if (solicitud.estado === 'PENDIENTE') {
          // Solicitud pendiente - ir a dashboard con mensaje
          this.router.navigate(['/dashboard'], {
            state: { 
              mensaje: 'Solicitud enviada. Espera la aprobación del administrador.',
              tipo: 'info',
            },
          });
        }
      },
      error: (err) => {
        if (err.status === 404) {
          // Código inválido - permanecer en la página con error
          this.errorMessage.set('Código de invitación inválido');
        } else if (err.status === 409) {
          // Ya es miembro - ir al grupo directamente
          const grupoId = err.error?.grupoId;
          this.router.navigate(['/grupos', grupoId]);
        }
      },
    });
  }
}
```

---

## Navegación con replaceUrl

### Evitar contaminar el historial

```typescript
// pages/auth/login/login.component.ts
export class LoginComponent {
  private readonly router = inject(Router);

  onLogin(credentials: any) {
    this.authService.login(credentials).subscribe({
      next: () => {
        // Navegar sin añadir al historial (evita volver a login con botón "Atrás")
        this.router.navigate(['/dashboard'], {
          replaceUrl: true,  // ← Reemplaza la entrada actual en el historial
        });
      },
    });
  }
}

// pages/auth/register/register.component.ts
export class RegisterComponent {
  private readonly router = inject(Router);

  onRegister(data: any) {
    this.authService.register(data).subscribe({
      next: () => {
        // Registrar y redirigir a login sin historial
        this.router.navigate(['/login'], {
          replaceUrl: true,
          state: { mensaje: 'Cuenta creada. Inicia sesión para continuar.' },
        });
      },
    });
  }
}
```

---

## Navegación relativa

### Desde una ruta padre

```typescript
// pages/usuario/usuario-layout.component.ts
import { Component, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

export class UsuarioLayoutComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  irAPerfil() {
    // Navegación relativa a la ruta actual (/usuario)
    this.router.navigate(['perfil'], {
      relativeTo: this.route,  // ← Relativo a /usuario
    });
    // Resultado: /usuario/perfil
  }

  irAConfiguracion() {
    // Navegación relativa
    this.router.navigate(['configuracion'], {
      relativeTo: this.route,
    });
    // Resultado: /usuario/configuracion
  }

  irAtras() {
    // Navegar al padre
    this.router.navigate(['..'], {
      relativeTo: this.route,
    });
    // Resultado: / (padre de /usuario)
  }
}
```

---

## Mejores prácticas

### ✅ DO: Usar navegación declarativa cuando sea posible

```html
<!-- Preferir routerLink en templates -->
<a routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
```

### ✅ DO: Validar datos antes de navegar

```typescript
verDetalle(id: number | undefined) {
  if (!id) {
    this.toastService.error('ID inválido');
    return;
  }
  this.router.navigate(['/grupos', id]);
}
```

### ✅ DO: Manejar errores en navegación

```typescript
this.router.navigate(['/dashboard']).then(
  (success) => {
    if (!success) {
      console.error('Navegación bloqueada por guard');
    }
  }
);
```

### ❌ DON'T: Navegar en constructores

```typescript
// ❌ MAL
constructor(private router: Router) {
  this.router.navigate(['/dashboard']);  // Puede causar errores
}

// ✅ BIEN
ngOnInit() {
  this.router.navigate(['/dashboard']);
}
```

### ❌ DON'T: Usar window.location.href

```typescript
// ❌ MAL - Recarga toda la aplicación
window.location.href = '/dashboard';

// ✅ BIEN - Navegación SPA
this.router.navigate(['/dashboard']);
```

---

## Referencias

- [Angular Router API](https://angular.io/api/router/Router)
- [Router Navigation Extras](https://angular.io/api/router/NavigationExtras)
- [ActivatedRoute](https://angular.io/api/router/ActivatedRoute)

---

**Última actualización**: 14 de enero de 2026
