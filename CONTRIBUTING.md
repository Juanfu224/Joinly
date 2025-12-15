# Guía de Contribución - Joinly

Gracias por tu interés en contribuir a Joinly. Esta guía te ayudará a entender cómo puedes participar en el desarrollo del proyecto.

---

## Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [¿Cómo puedo contribuir?](#cómo-puedo-contribuir)
- [Proceso de Desarrollo](#proceso-de-desarrollo)
- [Estándares de Código](#estándares-de-código)
- [Commits y Mensajes](#commits-y-mensajes)
- [Pull Requests](#pull-requests)
- [Reportar Bugs](#reportar-bugs)
- [Sugerir Mejoras](#sugerir-mejoras)

---

## Código de Conducta

Este proyecto se adhiere a un código de conducta profesional y respetuoso:

- Sé respetuoso con otros colaboradores
- Acepta críticas constructivas
- Enfócate en lo mejor para la comunidad
- Muestra empatía hacia otros miembros
- No uses lenguaje ofensivo o inapropiado
- No ataques personalmente a otros
- No publiques información privada de otros sin permiso

---

## ¿Cómo puedo contribuir?

### 1. Reportar Bugs

Si encuentras un bug, por favor:

1. Verifica que no haya sido reportado en [Issues](https://github.com/Juanfu224/Joinly/issues)
2. Crea un nuevo issue con la etiqueta `bug`
3. Incluye:
   - Descripción clara del problema
   - Pasos para reproducirlo
   - Comportamiento esperado vs actual
   - Screenshots (si aplica)
   - Información del entorno (OS, versión de Java/Node, navegador)

### 2. Proponer Mejoras

Para proponer nuevas funcionalidades:

1. Abre un issue con la etiqueta `enhancement`
2. Describe claramente:
   - Qué problema resuelve
   - Cómo funcionaría
   - Ejemplos de uso
   - Alternativas consideradas

### 3. Contribuir Código

1. Fork el repositorio
2. Crea una rama desde `main`
3. Implementa tu cambio
4. Escribe o actualiza tests
5. Asegúrate de que todos los tests pasan
6. Crea un Pull Request

---

## Proceso de Desarrollo

### 1. Fork y Clone

```bash
# Fork el repositorio en GitHub

# Clonar tu fork
git clone https://github.com/TU_USUARIO/Joinly.git
cd Joinly

# Añadir upstream
git remote add upstream https://github.com/Juanfu224/Joinly.git
```

### 2. Crear Rama

```bash
# Actualizar main
git checkout main
git pull upstream main

# Crear rama descriptiva
git checkout -b feature/nombre-funcionalidad
# o
git checkout -b fix/nombre-bug
```

**Tipos de ramas:**
- `feature/` - Nuevas funcionalidades
- `fix/` - Corrección de bugs
- `docs/` - Cambios en documentación
- `refactor/` - Refactorización de código
- `test/` - Añadir o mejorar tests
- `chore/` - Tareas de mantenimiento

### 3. Desarrollar

Sigue las [convenciones de código](#estándares-de-código) y asegúrate de:

- Escribir código limpio y legible
- Añadir comentarios donde sea necesario
- Seguir los patrones existentes
- Escribir tests para tu código

### 4. Testing

**Backend:**
```bash
cd backend
./mvnw test
./mvnw verify
```

**Frontend:**
```bash
cd frontend
npm test
npm run lint
```

### 5. Commit

Sigue las [convenciones de commits](#commits-y-mensajes).

```bash
git add .
git commit -m "tipo: descripción breve

Descripción detallada (opcional)"
```

### 6. Push

```bash
git push origin feature/nombre-funcionalidad
```

### 7. Pull Request

Abre un PR en GitHub desde tu rama hacia `main` del repositorio original.

---

## Estándares de Código

### Backend (Java)

**Convenciones:**
- Seguir [Google Java Style Guide](https://google.github.io/styleguide/javaguide.html)
- Usar Lombok para reducir boilerplate
- Documentar clases y métodos públicos con Javadoc
- Nombres descriptivos para variables y métodos
- Máximo 120 caracteres por línea

**Estructura de clases:**
```java
@Service
@RequiredArgsConstructor
public class MiServicio {
    
    private final MiRepository repository;
    private static final Logger log = LoggerFactory.getLogger(MiServicio.class);
    
    /**
     * Descripción del método
     * 
     * @param id identificador del recurso
     * @return el recurso encontrado
     * @throws ResourceNotFoundException si no se encuentra
     */
    public MiEntidad obtenerPorId(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("No encontrado: " + id));
    }
}
```

**DTOs:**
- Usar records cuando sea posible
- Validaciones con `@Valid` y annotations de `jakarta.validation`

**Tests:**
- Seguir patrón AAA (Arrange, Act, Assert)
- Nombres descriptivos: `deberiaCrearUsuarioCuandoDatosValidos()`
- Usar `@DisplayName` para mejor legibilidad

### Frontend (Angular/TypeScript)

**Convenciones:**
- Seguir [Angular Style Guide](https://angular.dev/style-guide)
- TypeScript en modo strict
- Usar standalone components
- Máximo 120 caracteres por línea

**Componentes:**
```typescript
import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mi-componente',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mi-componente.html',
  styleUrls: ['./mi-componente.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MiComponente {
  // Propiedades públicas
  public titulo = 'Mi Componente';
  
  // Propiedades privadas
  private contador = 0;
  
  // Métodos públicos
  public incrementar(): void {
    this.contador++;
  }
}
```

**Servicios:**
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MiService {
  private readonly API_URL = '/api/v1';
  
  constructor(private http: HttpClient) { }
  
  public obtenerDatos(): Observable<Datos[]> {
    return this.http.get<Datos[]>(`${this.API_URL}/datos`);
  }
}
```

### CSS/SCSS

**Convenciones:**
- Usar metodología BEM
- Seguir arquitectura ITCSS
- Preferir CSS Variables para tokens
- Mobile-first para media queries

**Ejemplo BEM:**
```scss
// Block
.tarjeta {
  padding: var(--spacing-md);
  border-radius: 8px;
  
  // Element
  &__titulo {
    font-size: var(--font-size-lg);
    font-weight: bold;
  }
  
  &__contenido {
    margin-top: var(--spacing-sm);
    color: var(--color-text-secondary);
  }
  
  // Modifier
  &--destacada {
    background-color: var(--color-primary);
    color: white;
  }
}
```

---

## Commits y Mensajes

### Formato de Commits

Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

```
<tipo>(<alcance>): <descripción breve>

[cuerpo opcional]

[footer opcional]
```

**Tipos:**
- `feat` - Nueva funcionalidad
- `fix` - Corrección de bug
- `docs` - Cambios en documentación
- `style` - Cambios de formato (sin afectar lógica)
- `refactor` - Refactorización de código
- `test` - Añadir o modificar tests
- `chore` - Tareas de mantenimiento
- `perf` - Mejoras de rendimiento

**Ejemplos:**

```bash
# Nueva funcionalidad
git commit -m "feat(suscripciones): añadir endpoint para pausar suscripción"

# Corrección de bug
git commit -m "fix(auth): corregir validación de token expirado"

# Documentación
git commit -m "docs(readme): actualizar instrucciones de instalación"

# Refactorización
git commit -m "refactor(services): extraer lógica de pago a servicio separado"

# Tests
git commit -m "test(pagos): añadir tests de integración para reembolsos"
```

### Reglas para Commits

- Presente imperativo ("añadir" no "añadido")
- Primera línea máximo 72 caracteres
- Descripción en español
- Un commit por cambio lógico
- No incluir archivos generados

---

## Pull Requests

### Checklist antes de Crear PR

- [ ] Tests pasan correctamente
- [ ] Código sigue los estándares
- [ ] Documentación actualizada
- [ ] No hay conflictos con `main`
- [ ] Commits son claros y descriptivos

### Título del PR

```
[Tipo] Descripción breve

Ejemplos:
[Feature] Añadir sistema de notificaciones
[Fix] Corregir error en cálculo de pagos
[Docs] Actualizar guía de instalación
```

### Descripción del PR

Usa la siguiente plantilla:

```markdown
## Descripción

Breve descripción de los cambios

## Motivación

Por qué son necesarios estos cambios

## Tipo de Cambio

- [ ] Bug fix
- [ ] Nueva funcionalidad
- [ ] Breaking change
- [ ] Documentación

## Checklist

- [ ] Tests añadidos/actualizados
- [ ] Documentación actualizada
- [ ] Código sigue estándares
- [ ] Sin conflictos con main

## Screenshots (si aplica)

Capturas de pantalla para cambios visuales

## Testing

Cómo se probaron los cambios
```

### Revisión de Código

- Responde a los comentarios constructivamente
- Realiza los cambios solicitados
- Marca conversaciones como resueltas cuando corresponda
- Haz push de los cambios en la misma rama

---

## Reportar Bugs

### Plantilla de Bug Report

```markdown
**Descripción del Bug**
Descripción clara y concisa del problema

**Pasos para Reproducir**
1. Ir a '...'
2. Hacer clic en '...'
3. Scrollear hasta '...'
4. Ver error

**Comportamiento Esperado**
Qué debería suceder

**Comportamiento Actual**
Qué sucede realmente

**Screenshots**
Si aplica, añade screenshots

**Entorno:**
 - OS: [ej. Windows 11]
 - Navegador: [ej. Chrome 120]
 - Java Version: [ej. Java 25]
 - Node Version: [ej. Node 18.17]

**Información Adicional**
Cualquier otro contexto sobre el problema
```

---

## Sugerir Mejoras

### Plantilla de Feature Request

```markdown
**¿El feature está relacionado con un problema?**
Descripción clara del problema. Ej: "Siempre me frustro cuando [...]"

**Solución Propuesta**
Descripción clara de lo que quieres que suceda

**Alternativas Consideradas**
Otras soluciones o features que has considerado

**Contexto Adicional**
Screenshots, mockups, ejemplos de otras apps, etc.
```

---

## Documentación

### Documentar Código

**Javadoc (Backend):**
```java
/**
 * Procesa el pago de una suscripción.
 * 
 * <p>Este método retiene el pago hasta que finalice el período de suscripción.
 * Luego libera el pago al anfitrión automáticamente.
 * 
 * @param idSuscripcion ID de la suscripción
 * @param idUsuario ID del usuario que paga
 * @param request datos del pago
 * @return el pago procesado
 * @throws ResourceNotFoundException si la suscripción no existe
 * @throws InvalidPaymentException si los datos de pago son inválidos
 */
public PagoResponse procesarPago(Long idSuscripcion, Long idUsuario, PagoRequest request) {
    // ...
}
```

**TSDoc (Frontend):**
```typescript
/**
 * Servicio para gestionar autenticación de usuarios.
 * 
 * Proporciona métodos para login, registro, logout y validación de tokens.
 * Los tokens se almacenan en localStorage y se renuevan automáticamente.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  
  /**
   * Inicia sesión con credenciales de usuario.
   * 
   * @param email - Email del usuario
   * @param password - Contraseña del usuario
   * @returns Observable con los tokens de acceso
   * @throws {HttpErrorResponse} Si las credenciales son incorrectas
   */
  public login(email: string, password: string): Observable<AuthResponse> {
    // ...
  }
}
```

---

## Herramientas Útiles

### Formateo de Código

**Backend:**
```bash
# Formatear con Google Java Format
./mvnw spotless:apply
```

**Frontend:**
```bash
# Formatear con Prettier
npm run format

# Verificar formato
npm run format:check
```

### Análisis Estático

**Backend:**
```bash
# SpotBugs
./mvnw spotbugs:check

# Checkstyle
./mvnw checkstyle:check
```

**Frontend:**
```bash
# ESLint
npm run lint

# Corregir automáticamente
npm run lint:fix
```

---

## Recursos

- [README Principal](README.md)
- [Backend README](backend/README.md)
- [Frontend README](frontend/README.md)
- [Documentación de Diseño](docs/design/DOCUMENTACION.md)
- [Guía de Seguridad](backend/docs/SECURITY.md)
- [Lista de Mejoras](backend/docs/TODO_MEJORAS.md)

---

## ¿Necesitas Ayuda?

Si tienes dudas o necesitas ayuda:

1. Revisa la [documentación](README.md)
2. Busca en [Issues](https://github.com/Juanfu224/Joinly/issues)
3. Abre un nuevo issue con la etiqueta `question`

---

## Agradecimientos

Gracias por contribuir a Joinly. Cada contribución, grande o pequeña, es valiosa y apreciada.

---

<div align="center">
  <b>¡Feliz coding!  </b>
</div>
