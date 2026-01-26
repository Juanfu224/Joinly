# ADR-002: Por qué Signals en lugar de Observables para Estado

## Status

Accepted

## Context

En Angular, el estado puede gestionarse de varias maneras:

1. **Observables RxJS** (tradicional en Angular)
2. **Signals** (nuevo en Angular 16+, maduro en Angular 21)
3. **Variables regulares** (sin reactividad)

El proyecto tiene estados de diferentes tipos:
- Estado global del usuario (currentUser)
- Estado de listas (grupos, suscripciones)
- Estado de carga (isLoading)
- Estado de modales (modalOpen)
- Estado de formulario (form data)
- Estado de temas (theme)

## Decision

Hemos elegido **Signals para estado local y Observables RxJS para streams asíncronos**.

### Estrategia Híbrida:

```typescript
// ✅ Usar Signals para:
// - Estado local simple
// - Estado derivado computado
// - Estado de UI (modales, toasts, loading)
// - Estado de formulario

// Estado local simple
currentUser = signal<User | null>(null);
theme = signal<'light' | 'dark'>('light');
modalOpen = signal(false);
isLoading = signal(false);

// Estado derivado computado
isAdmin = computed(() => {
  const user = this.currentUser();
  return user?.rol === 'ADMIN';
});

darkMode = computed(() => this.theme() === 'dark');

// ✅ Usar Observables RxJS para:
// - Streams asíncronos (HTTP)
// - Streams de tiempo (intervals, timers)
// - Streams de eventos (clicks, inputs)
// - Operaciones complejas (debounce, throttle, retry)

// HTTP requests
loadGrupos(): Observable<Grupo[]> {
  return this.http.get<Grupo[]>('/api/v1/unidades');
}

// Streams de eventos
searchTerms$ = new Subject<string>();
results$ = this.searchTerms$.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  switchMap(term => this.http.search(term))
);
```

### Razones para Signals (Estado Local):

1. **Sintaxis Más Simple**
   ```typescript
   // Signals
   count = signal(0);
   double = computed(() => this.count() * 2);
   increment() {
     this.count.update(c => c + 1);
   }
   
   // RxJS Subjects
   count$ = new BehaviorSubject<number>(0);
   double$ = this.count$.pipe(map(c => c * 2));
   increment() {
     this.count$.next(this.count$.value + 1);
   }
   ```

2. **Mejor Performance**
   - No requiere scheduling como RxJS
   - Change detection optimizado
   - Menor overhead de subscriptions
   - Sincronización automática con plantillas

3. **Type-Safety Mayor**
   ```typescript
   // Signals - Type-safe
   user = signal<User | null>(null);
   const user = this.user(); // User | null
   
   // RxJS - Type-safe pero más complejo
   user$ = new BehaviorSubject<User | null>(null);
   this.user$.subscribe(user => {
     // User | null
   });
   ```

4. **No Necesita Desuscripción**
   ```typescript
   // Signals - Auto-limpieza
   count = signal(0);
   
   // RxJS - Manual
   count$ = new BehaviorSubject(0);
   private destroy$ = new Subject();
   
   ngOnInit() {
     this.count$.subscribe();
   }
   
   ngOnDestroy() {
     this.destroy$.next();
     this.destroy$.complete();
   }
   ```

5. **Integración con Plantillas**
   ```html
   <!-- Signals - Automático -->
   <div>{{ count() }}</div>
   
   <!-- RxJS - Requiere async pipe -->
   <div>{{ count$ | async }}</div>
   ```

6. **Computado Automático**
   ```typescript
   // Signals - Computado
   count = signal(0);
   double = computed(() => this.count() * 2);
   // double se recalcula automáticamente cuando count cambia
   
   // RxJS - Manual
   count$ = new BehaviorSubject(0);
   double$ = this.count$.pipe(map(c => c * 2));
   // Necesita订阅 manual
   ```

### Razones para RxJS (Streams Asíncronos):

1. **Operadores Poderosos**
   - debounceTime, throttleTime
   - switchMap, mergeMap, concatMap
   - retry, retryWhen
   - distinctUntilChanged
   - combineLatest, forkJoin, zip

   ```typescript
   // Solo posible con RxJS
   searchResults$ = this.searchTerms$.pipe(
     debounceTime(300),
     distinctUntilChanged(),
     switchMap(term => this.http.search(term)),
     retry(3),
     catchError(error => of([]))
   );
   ```

2. **Manejo de Errores**
   ```typescript
   // RxJS - Manejo de errores flexible
   loadGrupos$ = this.http.get('/api/v1/unidades').pipe(
     retry(3),
     catchError(error => {
       console.error('Error loading grupos:', error);
       return of([]);
     })
   );
   ```

3. **Streams de Tiempo**
   ```typescript
   // Solo posible con RxJS
   currentTime$ = interval(1000).pipe(
     map(() => new Date()),
     shareReplay(1)
   );
   ```

4. **Múltiples Suscriptores**
   ```typescript
   // RxJS - Compartir stream entre múltiples suscriptores
   grupos$ = this.http.get<Grupo[]>('/api/v1/unidades').pipe(
     shareReplay(1)
   );
   
   // Varios componentes se suscriben al mismo stream
   ```

## Reglas del Proyecto

### Cuándo Usar Signals:

1. **Estado local simple**
   ```typescript
   user = signal<User | null>(null);
   loading = signal(false);
   theme = signal<'light' | 'dark'>('light');
   ```

2. **Estado derivado computado**
   ```typescript
   count = signal(0);
   double = computed(() => this.count() * 2);
   isAdmin = computed(() => this.user()?.rol === 'ADMIN');
   ```

3. **Estado de UI**
   ```typescript
   modalOpen = signal(false);
   activeTab = signal(0);
   searchQuery = signal('');
   ```

4. **Estado de formularios**
   ```typescript
   formData = signal({
     nombre: '',
     email: '',
     password: ''
   });
   ```

### Cuándo Usar RxJS:

1. **HTTP requests**
   ```typescript
   loadGrupos(): Observable<Grupo[]> {
     return this.http.get<Grupo[]>('/api/v1/unidades');
   }
   ```

2. **Streams de búsqueda**
   ```typescript
   search(query: string) {
     this.searchTerms$.next(query);
   }
   
   results$ = this.searchTerms$.pipe(
     debounceTime(300),
     switchMap(q => this.http.search(q))
   );
   ```

3. **Streams de eventos**
   ```typescript
   clicks$ = fromEvent(document, 'click');
   ```
   
4. **Streams de tiempo**
   ```typescript
   timer$ = interval(1000);
   ```

5. **Operaciones complejas**
   ```typescript
   combined$ = combineLatest([user$, grupos$, suscripciones$]).pipe(
     map(([user, grupos, suscripciones]) => ({ user, grupos, suscripciones }))
   );
   ```

### Patrón de Conversión (Observable → Signal):

```typescript
// Servicio: Devuelve Observable (para streams asíncronos)
@Injectable({ providedIn: 'root' })
export class GrupoService {
  loadGrupos(): Observable<Grupo[]> {
    return this.http.get<Grupo[]>('/api/v1/unidades');
  }
}

// Componente: Convierte a Signal (para estado local)
@Component({ standalone: true })
export class DashboardComponent {
  private grupoService = inject(GrupoService);
  
  // Convertir Observable a Signal (toSignal)
  grupos = toSignal(this.grupoService.loadGrupos(), { initialValue: [] });
  loading = computed(() => this.grupos().length === 0);
}
```

## Consecuencias

### Positivas:

1. **Código Más Simple**
   - Menos boilerplate con Signals
   - No necesita gestión de suscripciones
   - Sintaxis más intuitiva

2. **Mejor Performance**
   - Change detection optimizado
   - Menor overhead
   - Sincronización automática

3. **Type-Safety Mayor**
   - Type-checking más fuerte
   - Less runtime errors

4. **Mejor DX**
   - Más fácil de aprender para nuevos desarrolladores
   - Menos código boilerplate
   - Más código expressivo

### Negativas:

1. **Curva de Aprendizaje**
   - Nuevo paradigma para desarrolladores Angular tradicionales
   - Dos formas diferentes de manejar estado

2. **Menos Operadores**
   - Signals no tiene operadores como debounce, throttle
   - Necesita RxJS para casos complejos

3. **Ecosistema en Transición**
   - Menos librerías compatibles con Signals
   - Más recursos para RxJS tradicional

## Alternativas Consideradas

### Solo RxJS (Tradicional en Angular)

**Ventajas:**
- Consistente con Angular tradicional
- Ecosistema maduro
- Más recursos educativos
- Operadores poderosos

**Desventajas:**
- Más boilerplate
- Gestión manual de suscripciones
- Más complejo para estado simple
- Mayor overhead de rendimiento

**No elegido porque:**
- Signals ofrece mejor DX para estado simple
- Signals ofrece mejor performance
- Angular 21 recomienda Signals para estado local

### Solo Signals (Experimental)

**Ventajas:**
- Parcialidad completa (un solo paradigma)
- Más simple
- Menos conceptos que aprender

**Desventajas:**
- Signals no es maduro para streams asíncronos
- Falta de operadores poderosos
- Limitaciones actuales

**No elegido porque:**
- RxJS es necesario para streams asíncronos
- RxJS ofrece operadores que Signals no tiene
- Estrategia híbrida ofrece lo mejor de ambos mundos

## Referencias

- [Angular Docs - Signals](https://angular.dev/guide/signals)
- [Angular Docs - RxJS](https://angular.dev/guide/rxjs-observables)
- [Signals vs RxJS](https://angular.dev/guide/signals/signal-vs-rxjs)

---

**Fecha de Decisión:** 2024-09-15
**Decidido por:** Juan Alberto Fuentes
**Estado:** Accepted
