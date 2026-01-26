# ADR-003: Por qué Vitest en lugar de Karma/Jasmine

## Status

Accepted

## Context

Al inicio del proyecto, teníamos que elegir el framework de testing para el frontend Angular. Las opciones principales eran:

1. **Karma + Jasmine** (tradicional en Angular)
2. **Jest** (popular en React, soporte experimental en Angular)
3. **Vitest** (nuevo, basado en Vite, soporte experimental en Angular)
4. **Cypress** (E2E, no unit testing)

El proyecto requiere:
- Testing unitario de componentes
- Testing de servicios
- Testing de pipes y guards
- Testing de integración
- Coverage reporting
- Ejecución rápida de tests
- Integración con Angular CLI
- Soporte para TypeScript

## Decision

Hemos elegido **Vitest** para testing unitario frontend.

### Razones:

1. **Velocidad Dramáticamente Superior**

   Vitest está construido sobre Vite y es **10-100x más rápido** que Karma:

   ```bash
   # Karma + Jasmine (Angular CLI default)
   npm test
   # Tiempo: ~45 segundos para 50 tests
   
   # Vitest
   npm test -- --vitest
   # Tiempo: ~5 segundos para 50 tests
   ```

2. **Jest-compatible API**

   Vitest es API-compatible con Jest, lo que hace la transición suave:

   ```typescript
   // Jest / Vitest - Mismo API
   import { describe, it, expect, beforeEach } from 'vitest';
   
   describe('UserService', () => {
     beforeEach(() => {
       // Setup
     });
     
     it('should create user', () => {
       // Arrange & Act
       const user = service.create('test@joinly.com');
       
       // Assert
       expect(user.email).toBe('test@joinly.com');
     });
   });
   ```

3. **Soporte para ES Modules y TypeScript**

   Vitest tiene soporte nativo para ES Modules y TypeScript, sin necesidad de configuración compleja:

   ```typescript
   // Vitest soporta directamente
   import { UserService } from './user.service';
   import { TestBed } from '@angular/core/testing';
   
   // No necesita transformadores o loaders adicionales
   ```

4. **Watch Mode Instantáneo**

   Vitest detecta cambios y re-ejecuta tests en milisegundos:

   ```bash
   # Watch mode con re-ejecución instantánea
   npm test -- --watch
   ```

5. **Better Coverage Reporting**

   Vitest usa c8 o Istanbul para coverage, con reportes más detallados:

   ```bash
   # Coverage con reportes HTML
   npm run test:coverage
   # Genera: coverage/index.html
   ```

6. **Integración con Angular 21**

   Angular 21 tiene soporte experimental para Vitest:

   ```json
   // angular.json
   {
     "projects": {
       "joinly": {
         "architect": {
           "test": {
             "builder": "@angular-devkit/build-angular:vitest",
             "options": {
               "configFile": "vitest.config.ts"
             }
           }
         }
       }
     }
   }
   ```

7. **Parallel Execution**

   Vitest ejecuta tests en paralelo por defecto, mejorando la velocidad:

   ```typescript
   // vitest.config.ts
   export default defineConfig({
     test: {
       pool: 'threads',
       poolOptions: {
         threads: {
           singleThread: false
         }
       }
     }
   });
   ```

8. **Built-in Mocking**

   Vitest tiene mocking integrado, sin necesidad de librerías adicionales:

   ```typescript
   // Vitest - Mocking nativo
   vi.mock('./auth.service');
   
   const mockAuthService = vi.mocked(AuthService);
   mockAuthService.login.mockResolvedValue({ token: 'abc' });
   ```

## Configuración de Vitest en el Proyecto

### Instalación

```bash
npm install -D vitest @vitest/coverage-istanbul @angular-devkit/build-angular
```

### vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    include: ['**/*.spec.ts'],
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test-setup.ts',
        '**/*.spec.ts'
      ]
    }
  },
  plugins: [angular()]
});
```

### test-setup.ts

```typescript
import '@analogjs/vitest-angular/setup-zone';

// Global test setup
beforeEach(() => {
  // Resetear mocks antes de cada test
  vi.clearAllMocks();
});
```

### Ejemplo de Test

```typescript
import { render, screen } from '@testing-library/angular';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { expect, describe, it, beforeEach } from 'vitest';
import { UserService } from './user.service';
import { UserCardComponent } from './user-card.component';

describe('UserService', () => {
  let service: UserService;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserService]
    });
    
    service = TestBed.inject(UserService);
  });
  
  it('should create user', () => {
    const user = service.create('test@joinly.com');
    
    expect(user.email).toBe('test@joinly.com');
    expect(user.id).toBeDefined();
  });
});

describe('UserCardComponent', () => {
  it('should render user card', async () => {
    await render(UserCardComponent, {
      componentProperties: {
        user: {
          id: 1,
          nombre: 'Juan',
          email: 'juan@joinly.com'
        }
      }
    });
    
    expect(screen.getByText('Juan')).toBeInTheDocument();
    expect(screen.getByText('juan@joinly.com')).toBeInTheDocument();
  });
});
```

## Comparación: Vitest vs Karma+Jasmine

| Característica | Vitest | Karma+Jasmine |
|---------------|--------|---------------|
| **Velocidad** | ⚡ Ultra rápido (5-10s) | 🐢 Lento (30-60s) |
| **Watch Mode** | ⚡ Instantáneo | 🐢 Lento (~10s) |
| **ES Modules** | ✅ Nativo | ❌ Requiere transformadores |
| **TypeScript** | ✅ Nativo | ⚠️ Requiere configuración |
| **Mocking** | ✅ Built-in | ⚠️ Requiere bibliotecas |
| **Parallel** | ✅ Por defecto | ❌ No soportado |
| **Coverage** | ✅ Integrado | ✅ Integrado |
| **API** | ✅ Jest-compatible | ✅ Jasmine API |
| **Angular CLI** | ⚠️ Experimental | ✅ Soportado |
| **Comunidad** | 🔄 Creciendo | ✅ Establecida |

## Consecuencias

### Positivas:

1. **Productividad Dramáticamente Mejorada**
   - Tests ejecutados en segundos, no minutos
   - Watch mode instantáneo
   - Feedback más rápido

2. **Mejor DX (Developer Experience)**
   - API familiar (Jest-compatible)
   - Less configuración
   - Better error messages

3. **Performance Superior**
   - Ejecución paralela
   - No overhead de browser real
   - Re-ejecución instantánea en watch mode

4. **Coverage Reporting Mejorado**
   - Reportes HTML interactivos
   - Métricas detalladas
   - Integración con CI/CD

### Negativas:

1. **Soporte Experimental en Angular**
   - Angular CLI tiene soporte experimental para Vitest
   - Menos documentación oficial
   - Posibles breaking changes en futuras versiones

2. **Menor Ecosistema Angular**
   - Menos librerías Angular compatibles con Vitest
   - Menos ejemplos en Stack Overflow
   - Más difícil encontrar soluciones

3. **Curva de Aprendizaje**
   - Nuevo framework para desarrolladores Angular
   - Diferente de Karma+Jasmine tradicional
   - Requiere aprendizaje de Vitest específico

## Alternativas Consideradas

### Karma + Jasmine (Tradicional en Angular)

**Ventajas:**
- Soporte oficial de Angular CLI
- Estable y maduro
- Amplia documentación
- Amplio ecosistema

**Desventajas:**
- Muy lento (30-60 segundos)
- Watch mode lento (~10 segundos)
- Configuración compleja
- No soporta ES modules nativamente
- No tiene ejecución paralela

**No elegido porque:**
- Velocidad es crítica para productividad
- Vitest ofrece mismo API con mejor performance
- Angular 21 soporta Vitest (aunque experimental)

### Jest con Angular

**Ventajas:**
- Popular y maduro
- Mejor performance que Karma
- Ecosistema grande

**Desventajas:**
- Requiere configuración compleja para Angular
- No soporte oficial de Angular CLI
- Transformadores necesarios para TypeScript y templates
- Menor integración con Angular

**No elegido porque:**
- Vitest tiene mejor integración con Vite (que usa Angular 21)
- Vitest es más rápido (especialmente en watch mode)
- Vitest tiene mejor soporte para ES modules

---

**Fecha de Decisión:** 2024-09-01
**Decidido por:** Juan Alberto Fuentes
**Estado:** Accepted
