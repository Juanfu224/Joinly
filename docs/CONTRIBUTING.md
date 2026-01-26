# Guía de Contribución - Joinly

Gracias por tu interés en contribuir a Joinly. Esta guía te ayudará a entender cómo contribuir de manera efectiva al proyecto.

## Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [Cómo Empezar](#cómo-empezar)
- [Proceso de Desarrollo](#proceso-de-desarrollo)
- [Pull Requests](#pull-requests)
- [Estándares de Código](#estándares-de-código)
- [Testing](#testing)
- [Documentación](#documentación)
- [Reportar Bugs](#reportar-bugs)
- [Proponer Features](#proponer-features)

---

## Código de Conducta

### Nuestros Principios

1. **Respeto**: Trata a todos con respeto y cortesía
2. **Inclusión**: Fomentamos la participación de todos
3. **Colaboración**: Trabajamos juntos para construir algo mejor
4. **Aprendizaje**: Estamos aquí para aprender unos de otros

### Comportamiento Esperado

- Ser constructivo y respetuoso en todas las comunicaciones
- Aceptar y dar retroalimentación de manera amable
- Respetar las decisiones del equipo de mantenimiento
- Centrarse en lo que es mejor para la comunidad

### Comportamiento Inaceptable

- Lenguaje despectivo o discriminatorio
- Hostigamiento o intimidación
- Ataques personales o insultos
- Publicar información privada de otros

### Reportar Incidencias

Si observas un comportamiento inaceptable, por favor contáctanos mediante:
- Email: [tu-email@example.com]
- Issue en GitHub: [Crear Issue Privado]

---

## Cómo Empezar

### 1. Configurar tu Entorno

Sigue la guía de configuración: `docs/SETUP.md`

```bash
# Clonar el repositorio
git clone https://github.com/Juanfu224/Joinly.git
cd Joinly

# Configurar el entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Iniciar servicios
make start
```

### 2. Entender el Proyecto

- Lee el `README.md` principal
- Revisa la arquitectura en `docs/ARCHITECTURE.md`
- Explora la documentación del backend (`backend/README.md`) y frontend (`frontend/README.md`)
- Examina el código existente para entender los patrones utilizados

### 3. Encontrar algo para trabajar

Busca Issues con las etiquetas:
- `good first issue`: Para nuevos contribuidores
- `help wanted`: Issues que necesitan ayuda
- `bug`: Bugs reportados
- `enhancement`: Mejoras propuestas
- `documentation`: Mejoras en la documentación

### 4. Comunicarte antes de trabajar

Antes de empezar a trabajar en algo grande:
1. Busca Issues existentes o crea uno nuevo
2. Comenta en el Issue para comunicar tu intención
3. Espera aprobación del mantenedor
4. Pregunta si tienes dudas

---

## Proceso de Desarrollo

### Flujo de Trabajo

```bash
# 1. Asegurarte de estar en la rama main y actualizar
git checkout main
git pull origin main

# 2. Crear una nueva rama desde main
git checkout -b feature/tu-feature
# O para bug fixes:
git checkout -b fix/tu-bug-fix

# 3. Hacer tus cambios
# ... editar archivos ...

# 4. Commit tus cambios
git add .
git commit -m "feat: add new feature"

# 5. Push a tu fork/rama remota
git push origin feature/tu-feature

# 6. Crear Pull Request desde GitHub
```

### Convenciones de Ramas

Usa el siguiente prefijo para tus ramas:

| Prefijo | Uso | Ejemplo |
|---------|-----|---------|
| `feat/` | Nueva funcionalidad | `feat/user-profile` |
| `fix/` | Corrección de bug | `fix/login-error` |
| `docs/` | Cambios en documentación | `docs/update-readme` |
| `refactor/` | Refactorización | `refactor/auth-service` |
| `test/` | Añadir tests | `test/suscripcion-tests` |
| `chore/` | Tareas de mantenimiento | `chore/update-dependencies` |

### Convenciones de Commits

Usa el formato **Conventional Commits**:

```
<tipo>(<alcance>): <descripción>

[opcional cuerpo]

[opcional pie]
```

**Tipos permitidos:**

| Tipo | Descripción | Ejemplo |
|------|-------------|---------|
| `feat` | Nueva funcionalidad | `feat(auth): add refresh token` |
| `fix` | Corrección de bug | `fix: resolve login redirect issue` |
| `docs` | Cambios en documentación | `docs(readme): update installation guide` |
| `style` | Cambios de formato (sin lógica) | `style: format code with prettier` |
| `refactor` | Refactorización | `refactor(auth): simplify token validation` |
| `perf` | Mejora de rendimiento | `perf(api): optimize database queries` |
| `test` | Añadir o actualizar tests | `test(auth): add login validation tests` |
| `chore` | Tareas de mantenimiento | `chore: update dependencies` |

**Ejemplos de commits válidos:**

```bash
# Nueva funcionalidad
git commit -m "feat(auth): add refresh token support"

# Bug fix
git commit -m "fix(suscripcion): resolve plaza calculation error"

# Documentación
git commit -m "docs(api): update endpoint documentation"

# Refactorización
git commit -m "refactor(frontend): extract common components"
```

**Ejemplos de commits NO válidos:**

```bash
# Mal: falta tipo
git commit -m "fix bug"

# Mal: muy genérico
git commit -m "fix: fix stuff"

# Mal: mayúsculas al inicio
git commit -m "Feat: Add feature"
```

### Verificar Código antes de Commitear

Antes de hacer un commit, ejecuta:

```bash
# Backend
cd backend
./mvnw test
./mvnw checkstyle:check

# Frontend
cd frontend
npm test
npm run lint
npm run format:check
```

---

## Pull Requests

### Cómo Crear un Pull Request

1. **Asegúrate de que tu rama está actualizada:**

```bash
git fetch origin
git rebase origin/main
```

2. **Resuelve cualquier conflicto:**

```bash
# Si hay conflictos, resuélvelos manualmente
git add .
git rebase --continue
```

3. **Push tus cambios:**

```bash
git push origin feature/tu-feature --force-with-lease
```

4. **Crea el Pull Request en GitHub:**
   - Ve a la página de Pull Requests
   - Clic en "New Pull Request"
   - Selecciona tu rama
   - Llena el template del PR

### Plantilla de Pull Request

```markdown
## Descripción
Breve descripción de los cambios realizados.

## Tipo de Cambio
- [ ] Bug fix (corrección de error)
- [ ] New feature (nueva funcionalidad)
- [ ] Breaking change (cambio importante)
- [ ] Documentation update (actualización de documentación)

## Cómo Prueba
Pasos para probar estos cambios:
1. Paso 1
2. Paso 2
3. ...

## Capturas de Pantalla (si aplica)
Añade capturas de pantalla o GIFs para demostrar los cambios.

## Issues Relacionados
Closes #(número de issue)

## Checklist
- [ ] Mi código sigue los estándares de estilo del proyecto
- [ ] He realizado self-review de mi propio código
- [ ] He comentado mi código, especialmente en áreas complejas
- [ ] He actualizado la documentación
- [ ] He añadido tests que prueban mis cambios
- [ ] Todos los nuevos y existentes tests pasan
- [ ] He actualizado el CHANGELOG.md
```

### Revisión de Pull Requests

1. **Revisión Automática:**
   - CI/CD ejecuta tests automáticamente
   - Linters verifican el código
   - Build debe pasar sin errores

2. **Revisión Manual:**
   - Un mantenedor revisará tu código
   - Puede solicitar cambios
   - Responde a los comentarios de revisión

3. **Aprobación:**
   - Al menos una aprobación requerida
   - Sin conflictos con main
   - Tests verdes

### Integración Continua

El proyecto usa GitHub Actions para CI:

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up JDK 25
        uses: actions/setup-java@v3
        with:
          java-version: '25'
          distribution: 'temurin'
      - name: Test Backend
        run: ./mvnw test
      - name: Test Frontend
        run: npm test
```

---

## Estándares de Código

### Backend (Java + Spring Boot)

#### Estilo de Código

Sigue la **Google Java Style Guide**: https://google.github.io/styleguide/javaguide.html

```java
// Bien
public class UnidadFamiliarService {
    private final UnidadFamiliarRepository repository;

    public UnidadFamiliarService(UnidadFamiliarRepository repository) {
        this.repository = repository;
    }

    public UnidadFamiliar createUnidad(CreateUnidadRequest request) {
        UnidadFamiliar unidad = new UnidadFamiliar();
        unidad.setNombre(request.nombre());
        return repository.save(unidad);
    }
}

// Mal
public class unidadfamiliarservice{
    UnidadFamiliarRepository r;
    public UnidadFamiliar create(CreateUnidadRequest req){
        UnidadFamiliar u=new UnidadFamiliar();
        u.setNombre(req.nombre());
        return r.save(u);
    }
}
```

#### Reglas Específicas

1. **Naming:**
   - Clases: PascalCase (`UnidadFamiliarService`)
   - Métodos: camelCase (`createUnidad`)
   - Constantes: UPPER_SNAKE_CASE (`MAX_PLAZAS`)
   - Variables: camelCase (`usuarioId`)

2. **Imports:**
   - Ordenar imports alfabéticamente
   - No usar wildcards (`import java.util.*`)
   - Eliminar imports no usados

3. **Comentarios:**
   - Javadoc para clases y métodos públicos
   - Comentarios inline solo para lógica compleja
   - No usar `// TODO` sin issue relacionado

4. **Excepciones:**
   - Lanzar excepciones específicas
   - No usar excepciones genéricas
   - Incluir mensajes descriptivos

```java
// Bien
if (unidad == null) {
    throw new ResourceNotFoundException("Unidad no encontrada con ID: " + id);
}

// Mal
if (unidad == null) {
    throw new RuntimeException("Error");
}
```

### Frontend (Angular 21 + TypeScript)

#### Estilo de Código

Usamos **Prettier** y **ESLint** con configuración Angular:

```bash
# Formatear código
npm run format

# Verificar formato
npm run format:check

# Linter
npm run lint
```

#### Reglas Específicas

1. **Componentes:**
   - Usar standalone components siempre
   - Input/Output como functions (sin decoradores)
   - OnPush change detection

```typescript
@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-user-card',
  imports: [CommonModule],
  templateUrl: './user-card.html',
  styleUrls: ['./user-card.scss']
})
export class UserCardComponent {
  user = input.required<User>();
  userClick = output<User>();
}
```

2. **TypeScript:**
   - Tipos estrictos (`strict: true`)
   - No usar `any`
   - Interfaces para modelos de datos

```typescript
// Bien
interface User {
  id: number;
  nombre: string;
  email: string;
}

function getUser(id: number): User {
  // ...
}

// Mal
function getUser(id: any): any {
  // ...
}
```

3. **RxJS:**
   - Usar pipeables operators
   - Desuscribir observables (takeUntil, async pipe)
   - No ansubscribe() manual

```typescript
// Bien
private destroy$ = new Subject<void>();

ngOnInit() {
  this.userService.getUser()
    .pipe(takeUntil(this.destroy$))
    .subscribe(user => {
      this.user.set(user);
    });
}

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}

// Mal
ngOnInit() {
  const subscription = this.userService.getUser()
    .subscribe(user => {
      this.user.set(user);
    });
}

ngOnDestroy() {
  subscription.unsubscribe(); // Evitar esto
}
```

4. **HTML Templates:**
   - Control flow nativo (`@if`, `@for`)
   - No usar `*ngIf`, `*ngFor`
   - Atributos ARIA para accesibilidad

```html
<!-- Bien -->
@if (loading) {
  <app-spinner />
} @else {
  @for (user of users(); track user.id) {
    <app-user-card [user]="user" (userClick)="onUserClick($event)" />
  }
}

<!-- Mal -->
<div *ngIf="loading">
  <app-spinner />
</div>
<div *ngFor="let user of users">
  <app-user-card [user]="user"></app-user-card>
</div>
```

### CSS / SCSS

#### Metodología BEM + ITCSS

Sigue las guías en `docs/design/DOCUMENTACION.md`:

```scss
// Bloque
.user-card {
  display: flex;
  gap: 1rem;

  // Elemento
  &__avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
  }

  // Modificador
  &--small {
    padding: 0.5rem;
  }

  // Modificador
  &--active {
    border: 2px solid var(--color-primary);
  }
}
```

#### Reglas Específicas

1. **Variables CSS:**
   - Usar custom properties (`--color-primary`)
   - No usar SCSS variables para colores
   - Escalas de espaciado consistentes

```scss
// Bien
:root {
  --color-primary: oklch(0.6 0.2 250);
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
}

.card {
  padding: var(--spacing-md);
  background: var(--color-primary);
}

// Mal
$primary-color: #007bff;
.card {
  padding: 1rem;
  background: $primary-color;
}
```

2. **Responsive:**
   - Mobile-first approach
   - Usar media queries estándar
   - Unidades relativas (rem, %, vh, vw)

```scss
// Mobile (base)
.container {
  padding: 1rem;
  display: block;
}

// Tablet
@media (min-width: 768px) {
  .container {
    padding: 2rem;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }
}

// Desktop
@media (min-width: 1024px) {
  .container {
    max-width: 1200px;
    margin-inline: auto;
    grid-template-columns: repeat(3, 1fr);
  }
}
```

---

## Testing

### Backend Testing

#### Escribir Tests

Usa JUnit 5 con Spring Boot Test:

```java
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class UnidadFamiliarControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(username = "test@joinly.com")
    void shouldReturnListOfUnidades() throws Exception {
        mockMvc.perform(get("/api/v1/unidades"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data", hasSize(greaterThan(0))));
    }

    @Test
    void shouldReturnUnauthorizedWithoutToken() throws Exception {
        mockMvc.perform(post("/api/v1/unidades"))
            .andExpect(status().isUnauthorized());
    }
}
```

#### Reglas de Tests

1. **AAA Pattern:** Arrange, Act, Assert
2. **Un test por caso de uso**
3. **Tests independientes** (no dependen de orden)
4. **Nombre descriptivo** del test

```java
// Bien
@Test
void shouldCreateUnidadWithValidData() {
    // Arrange
    CreateUnidadRequest request = new CreateUnidadRequest("Mi Familia");

    // Act
    UnidadFamiliar result = service.createUnidad(request);

    // Assert
    assertThat(result.getNombre()).isEqualTo("Mi Familia");
    assertThat(result.getCodigo()).hasSize(12);
}

// Mal
@Test
void test() {
    // Código sin claridad
}
```

### Frontend Testing

#### Escribir Tests

Usa Vitest con Angular Testing Library:

```typescript
import { render, screen } from '@testing-library/angular';
import { LoginFormComponent } from './login-form.component';

describe('LoginFormComponent', () => {
  it('should render login form', async () => {
    await render(LoginFormComponent, {
      componentProperties: {
        onSubmit: jest.fn()
      }
    });

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it('should submit form with valid data', async () => {
    const onSubmit = jest.fn();
    await render(LoginFormComponent, {
      componentProperties: { onSubmit }
    });

    await userEvent.type(screen.getByLabelText(/email/i), 'test@joinly.com');
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'password123');
    await userEvent.click(screen.getByRole('button'));

    expect(onSubmit).toHaveBeenCalledWith({
      email: 'test@joinly.com',
      password: 'password123'
    });
  });
});
```

#### Reglas de Tests

1. **AAA Pattern:** Arrange, Act, Assert
2. **Un test por caso de uso**
3. **Tests independientes**
4. **Nombre descriptivo** del test
5. **Usar Testing Library** (no probar implementación)

```typescript
// Bien
it('should display error message when email is invalid', async () => {
  await render(LoginFormComponent);
  
  await userEvent.type(screen.getByLabelText(/email/i), 'invalid-email');
  await userEvent.click(screen.getByRole('button'));
  
  expect(screen.getByText(/email inválido/i)).toBeInTheDocument();
});

// Mal
it('should work', async () => {
  // Código sin claridad
});
```

#### Ejecutar Tests

```bash
# Todos los tests
npm test

# Tests en modo watch
npm test -- --watch

# Con coverage
npm run test:coverage

# Tests de un solo archivo
npm test login-form.component
```

---

## Documentación

### Documentación de Código

#### Backend (Javadoc)

```java
/**
 * Service for managing family units (UnidadFamiliar).
 *
 * <p>This service provides operations for creating, updating, and managing
 * family units including member management and invitation codes.</p>
 *
 * @author Juan Alberto Fuentes
 * @version 1.0.0
 * @since 2024-09-01
 */
@Service
public class UnidadFamiliarService {

    /**
     * Creates a new family unit.
     *
     * @param request the request containing family unit details
     * @return the created UnidadFamiliar entity
     * @throws DuplicateResourceException if a unit with same name exists
     */
    public UnidadFamiliar createUnidad(CreateUnidadRequest request) {
        // Implementation
    }
}
```

#### Frontend (JSDoc)

```typescript
/**
 * Service for authenticating users with JWT tokens.
 *
 * Provides methods for login, logout, token refresh,
 * and checking authentication status.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  /**
   * Authenticates a user with email and password.
   *
   * @param credentials - The user's login credentials
   * @returns Observable with authentication response containing tokens
   * @throws {HttpError} If authentication fails
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    // Implementation
  }
}
```

### Actualizar Documentación

Cuando añadas una nueva funcionalidad:

1. **README.md**: Añade a la lista de características
2. **CHANGELOG.md**: Documenta el cambio
3. **docs/**: Actualiza documentación relevante
4. **Swagger**: Añade documentación API (backend)
5. **Code comments**: Añade Javadoc/JSDoc

---

## Reportar Bugs

### Plantilla de Bug Report

```markdown
## Descripción
Breve descripción del bug.

## Pasos para Reproducir
1. Ir a '...'
2. Clic en '....'
3. Desplazarse hasta '....'
4. Ver error

## Comportamiento Esperado
Descripción de lo que debería ocurrir.

## Comportamiento Actual
Descripción de lo que realmente ocurre.

## Capturas de Pantalla
Adjunta capturas si es relevante.

## Entorno
- OS: [e.g. Windows 10, macOS 14]
- Browser: [e.g. Chrome 120, Firefox 121]
- Versión: [e.g. v1.0.0]

## Logs Adjuntos
Copia y pega logs relevantes aquí.
```

---

## Proponer Features

### Plantilla de Feature Request

```markdown
## Descripción del Problema
Descripción clara y concisa del problema.

## Solución Propuesta
Descripción de lo que quieres que suceda.

## Alternativas Consideradas
Descripción de soluciones alternativas que has considerado.

## Contexto Adicional
Información adicional o capturas de pantalla sobre la feature.
```

---

## Preguntas Frecuentes

### ¿Puedo trabajar en cualquier issue?

Sí, pero te recomendamos:
- Buscar issues etiquetados con `good first issue`
- Dejar un comentario antes de empezar
- Esperar confirmación del mantenedor

### ¿Necesito firmar un CLA?

No, este es un proyecto académico sin CLA requerido.

### ¿Cómo configuro mi entorno?

Sigue la guía de configuración: `docs/SETUP.md`

### ¿Puedo cambiar algo que no está en un issue?

Sí, pero te recomendamos:
1. Crear un issue primero describiendo tu propuesta
2. Discutir con el equipo
3. Esperar aprobación antes de empezar

### ¿Qué pasa si mi PR es rechazado?

No te preocupes:
- Pregunta qué necesitas cambiar
- Haz las modificaciones solicitadas
- Vuelve a hacer push a tu rama
- El PR se actualizará automáticamente

---

## Recursos Adicionales

### Documentación Externa

- [Google Java Style Guide](https://google.github.io/styleguide/javaguide.html)
- [Angular Style Guide](https://angular.dev/style-guide)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [JSDoc](https://jsdoc.app/)

### Herramientas

- **Backend**: IntelliJ IDEA, Eclipse, VS Code
- **Frontend**: VS Code, WebStorm
- **Testing**: JUnit 5, Vitest
- **CI/CD**: GitHub Actions

---

## Contacto

- **GitHub Issues**: [Crear Issue](https://github.com/Juanfu224/Joinly/issues)
- **Email**: [tu-email@example.com]
- **Discord**: [Servidor de Discord](https://discord.gg/...)

---

**¡Gracias por contribuir a Joinly!** 🎉

---

**Última actualización**: 26 de enero de 2026
**Versión**: 1.0.0
