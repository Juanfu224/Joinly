# ADR-001: Por qué Angular 21 Standalone Components

## Status

Accepted

## Context

Al inicio del proyecto en 2024, teníamos que elegir el framework de frontend para Joinly. Las opciones principales eran:

1. React 18+ con TypeScript
2. Vue 3 con Composition API
3. Angular 17+ (última versión estable en ese momento)
4. Angular 21 (versión en desarrollo, con nuevas características)

El proyecto requiere:
- Arquitectura de componentes modular
- Soporte corporativo y larga vida útil
- TypeScript integrado
- Sistema de routing completo
- Soporte para forms reactivos
- Testing integrado
- Herramientas de CLI robustas

## Decision

Hemos elegido **Angular 21 con Standalone Components**.

### Razones:

1. **Standalone Components (Novedad en Angular 14+, maduro en Angular 21)**
   - Elimina la necesidad de NgModules
   - Componentes son verdaderamente independientes
   - Imports declarativos en cada componente
   - Tree-shaking más eficiente
   - Menos boilerplate

   ```typescript
   // Angular 21 - Standalone
   @Component({
     standalone: true,
     imports: [CommonModule, ReactiveFormsModule],
     selector: 'app-user-card',
     template: '...'
   })
   export class UserCardComponent {}
   
   // Angular <14 - Con NgModule
   @Component({
     selector: 'app-user-card',
     template: '...'
   })
   export class UserCardComponent {}
   
   @NgModule({
     declarations: [UserCardComponent],
     imports: [CommonModule, ReactiveFormsModule],
     exports: [UserCardComponent]
   })
   export class UserCardModule {}
   ```

2. **Signals (Novedad en Angular 16+, maduro en Angular 21)**
   - Estado reactivo más simple que RxJS
   - Mejor rendimiento para estado local
   - Sincronización automática con change detection
   - Menor curva de aprendizaje

   ```typescript
   // Signals - Más simple
   count = signal(0);
   double = computed(() => this.count() * 2);
   
   increment() {
     this.count.update(c => c + 1);
   }
   
   // RxJS - Más complejo
   count$ = new BehaviorSubject<number>(0);
   double$ = this.count$.pipe(map(c => c * 2));
   
   increment() {
     this.count$.next(this.count$.value + 1);
   }
   ```

3. **Control Flow Nativo (@if, @for, @switch)**
   - Sintaxis más legible que *ngIf, *ngFor
   - Mejor rendimiento (no requiere funciones de Angular)
   - Type-checking más fuerte

   ```html
   <!-- Angular 21 - Nativo -->
   @if (loading) {
     <app-spinner />
   } @else {
     <div>Content</div>
   }
   
   @for (item of items; track item.id) {
     <app-item [item]="item" />
   }
   
   <!-- Angular <21 - Directivas -->
   <div *ngIf="loading">
     <app-spinner />
   </div>
   <div *ngIf="!loading">
     <div>Content</div>
   </div>
   
   <app-item *ngFor="let item of items; trackBy: trackById" [item]="item"></app-item>
   ```

4. **input()/output() Functions**
   - Sintaxis más moderna que @Input/@Output
   - Type-checking más fuerte
   - Integración con Signals

   ```typescript
   // Angular 21 - Functions
   user = input.required<User>();
   userChange = output<User>();
   
   // Angular <21 - Decorators
   @Input() user!: User;
   @Output() userChange = new EventEmitter<User>();
   ```

5. **Soporte Corporativo a Largo Plazo**
   - Mantenido por Google
   - Roadmap estable y predecible
   - Versiones LTS de 2 años
   - Migraciones guiadas entre versiones mayores

6. **Ecosistema Completo**
   - Router integrado
   - Forms reactivos
   - HttpClient optimizado
   - Testing utilities
   - CLI robusta

## Consecuencias

### Positivas:

1. **Productividad Mayor**
   - Menos código boilerplate
   - Mejor DX (Developer Experience)
   - Estructura más limpia

2. **Mejor Performance**
   - Tree-shaking más eficiente sin NgModules
   - Change detection más eficiente con OnPush + Signals
   - Control flow nativo más rápido

3. **Mantenibilidad**
   - Componentes verdaderamente independientes
   - Dependencias declarativas
   - Estructura más modular

4. **Futuro-Proof**
   - Angular 21 es el futuro del framework
   - Standalone Components es el patrón recomendado
   - Signals reemplazarán gradualmente a RxJS para estado local

### Negativas:

1. **Curva de Aprendizaje**
   - Nuevos conceptos (Signals, input()/output(), control flow)
   - Documentación en transición
   - Menos ejemplos en Stack Overflow

2. **Dependencia de Versiones Recientes**
   - Requiere Node.js 18+
   - Requiere TypeScript 5.2+
   - Menos librerías de terceros adaptadas

3. **Ecosistema Menor que React**
   - Menos librerías de componentes
   - Menos comunidad
   - Menos recursos educativos

## Alternativas Consideradas

### React 18+ con TypeScript

**Ventajas:**
- Ecosistema más grande
- Más librerías de componentes
- Comunidad más grande
- Más recursos educativos

**Desventajas:**
- No tiene router oficial (usar React Router)
- No tiene forms integrados (usar formik, react-hook-form)
- Testing requiere configuración adicional
- No tiene CLI oficial
- Menor estructura de proyecto opinionated

**No elegido porque:**
- Angular ofrece más out-of-the-box
- React requiere más decisiones arquitectónicas
- Angular tiene mejor estructura para aplicaciones grandes empresariales

### Vue 3 con Composition API

**Ventajas:**
- Curva de aprendizaje más suave
- Más flexible que Angular
- Buen performance
- Documentation excelente

**Desventajas:**
- Soporte corporativo menor (no Google)
- Ecosistema más pequeño
- Menos uso en empresas grandes
- Router y state management son add-ons

**No elegido porque:**
- Angular tiene mejor soporte a largo plazo
- Angular tiene más out-of-the-box
- Requisito de proyecto académico sugiere tecnología empresarial

## Referencias

- [Angular Docs - Standalone Components](https://angular.dev/guide/standalone-components)
- [Angular Docs - Signals](https://angular.dev/guide/signals)
- [Angular Docs - Control Flow](https://angular.dev/guide/control-flow)
- [Angular Roadmap](https://angular.dev/roadmap)

---

**Fecha de Decisión:** 2024-09-01
**Decidido por:** Juan Alberto Fuentes
**Estado:** Accepted
