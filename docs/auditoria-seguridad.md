# Auditoría de Seguridad - Punto 8.2

## Fecha: 26 de enero de 2026

---

## 8.2.1 Seguridad Frontend

### Estado Actual: ⚠️ ACEPTABLE CON RECOMENDACIONES

#### ✅ Aspectos Correctos

1. **ARIA Attributes Implementados**
   - `aria-label`, `role`, `aria-labelledby` presentes en componentes interactivos
   - Modales con `role="dialog"` y focus management
   - Navegación con `aria-current` para páginas activas

2. **Formularios con Labels Adecuados**
   - Campos de formulario con labels correctos
   - `aria-describedby` para hints de campos
   - Validaciones visuales y accesibles

3. **Sanitización Implementada**
   - Angular sanitiza automáticamente inputs via template binding
   - Sin uso de `innerHTML` sin sanitización

4. **HTTPS Configurado**
   - Production URL configurada para HTTPS
   - HTTP → HTTPS redirect implementado en nginx

#### ⚠️ Aspectos a Mejorar

1. **Tokens en localStorage (Vulnerabilidad XSS)**
   - **Ubicación**: `frontend/src/app/interceptors/auth.interceptor.ts:42-46, 54-58`
   - **Problema**: Los tokens JWT se almacenan en localStorage
   - **Riesgo**: XSS puede acceder a localStorage y robar tokens
   - **Recomendación**:
     - Opción 1: Usar httpOnly cookies (mejor seguridad)
     - Opción 2: Migrar a sessionStorage (limpia al cerrar tab)
     - Opción 3: Mantener localStorage pero implementar Content Security Policy (CSP)

2. **Console.error en Producción**
   - **Ubicación**: `frontend/src/app/services/auth.ts:133` (corregido)
   - **Estado**: ✅ CORREGIDO - Se eliminó console.error

3. **Logging Interceptor en Producción**
   - **Ubicación**: `frontend/src/app/interceptors/logging.interceptor.ts:26`
   - **Estado**: ✅ CORREGIDO - Ahora usa `environment.production`

4. **Usuario en localStorage**
   - **Ubicación**: `frontend/src/app/services/auth.ts:141-159`
   - **Problema**: Datos de usuario almacenados en localStorage
   - **Riesgo**: XSS puede acceder a datos personales
   - **Recomendación**: Migrar a sessionStorage o usar signal en memoria

5. **Environment Files**
   - **Estado**: ✅ CREADOS - Se crearon `environment.ts` y `environment.prod.ts`

---

## 8.2.2 Seguridad Backend

### Estado Actual: ✅ BUENA PRÁCTICA

#### ✅ Aspectos Correctos

1. **Autenticación JWT Robusta**
   - **Ubicación**: `backend/src/main/java/com/alberti/joinly/security/JwtService.java`
   - **Algoritmo**: HS256 (HMAC-SHA256)
   - **Validación**: Clave mínima de 256 bits (32 bytes) verificada
   - **Tokens**: Access token + Refresh token implementados

2. **Encriptación de Contraseñas**
   - **Ubicación**: `backend/src/main/java/com/alberti/joinly/config/SecurityConfig.java:210-211`
   - **Algoritmo**: BCryptPasswordEncoder
   - **Strength**: Por defecto strength 10 (2^10 = 1024 iteraciones)

3. **Protección contra SQL Injection**
   - **Ubicación**: Múltiples repositories
   - **Implementación**:
     - Todas las queries usan JPA/JPQL con parámetros nombrados
     - No hay concatenación de strings SQL
     - Uso de `@Query` con `:nombre`, `:idUsuario`, etc.
   - **Estado**: ✅ SEGURO

4. **Validaciones de Entrada**
   - **Ubicación**: DTOs y Entities
   - **Implementación**:
     - `@Valid` en @RequestBody de controllers
     - `@NotBlank`, `@Email`, `@Size`, `@Min`, `@Max`, `@NotNull`
     - Mensajes de error personalizados
   - **Estado**: ✅ COMPLETO

5. **Autorización por Roles**
   - **Ubicación**: `backend/src/main/java/com/alberti/joinly/config/SecurityConfig.java:98-112`
   - **Endpoints protegidos**:
     - `/api/v1/admin/**` → requires `hasRole("ADMIN")`
     - `/api/v1/soporte/**` → requires `hasAnyRole("AGENTE", "ADMIN")`
     - Resto → requires `authenticated()`
   - **Estado**: ✅ CONFIGURADO

6. **CORS Configurado**
   - **Ubicación**: `backend/src/main/java/com/alberti/joinly/config/SecurityConfig.java:148-174`
   - **Implementación**:
     - Orígenes permitidos desde `CorsProperties`
     - Métodos permitidos: GET, POST, PUT, DELETE, etc.
     - Headers permitidos configurados
     - Credentials permitidas
   - **Estado**: ✅ CONFIGURADO

7. **Manejo de Excepciones**
   - **Ubicación**: Excepciones personalizadas y `GlobalExceptionHandler`
   - **Tipos**:
     - `BusinessException`
     - `ResourceNotFoundException`
     - `DuplicateResourceException`
     - `UnauthorizedException`
     - `BusinessRuleException`
     - `NoPlazasDisponiblesException`
     - `LimiteAlcanzadoException`
   - **Estado**: ✅ IMPLEMENTADO

8. **Logging Adecuado**
   - **Ubicación**: Múltiples servicios con `@Slf4j`
   - **Implementación**:
     - Uso de `log.info()`, `log.warn()`, `log.error()`
     - Sin `System.out.println()` o `printStackTrace()`
   - **Estado**: ✅ CORRECTO

9. **CSRF Deshabilitado**
   - **Justificación**: API stateless con JWT (no usa sesiones)
   - **Configuración**: `csrf(AbstractHttpConfigurer::disable)`
   - **Estado**: ✅ CORRECTO

10. **HTTPS Obligatorio**
    - **Estado**: Configurado en nginx para producción
    - **Implementación**: HTTP → HTTPS redirect, HSTS header
    - **Estado**: ✅ CONFIGURADO

11. **Encriptación de Credenciales**
    - **Ubicación**: `backend/src/main/java/com/alberti/joinly/services/EncryptionService.java`
    - **Algoritmo**: AES-256-GCM (seguro y autenticado)
    - **Implementación**:
      - Clave de 32 bytes (256 bits)
      - IV (Initialization Vector) único por encriptación
      - Tag de autenticación para verificar integridad
    - **Estado**: ✅ IMPLEMENTADO

#### ⚠️ Recomendaciones

1. **Implementar Rate Limiting**
   - **Estado**: No implementado
   - **Recomendación**:
     - Usar `@RateLimiter` de Spring Cloud Gateway
     - O Bucket4j para rate limiting local
     - Límites por endpoint y usuario
     - Prevenir DoS y fuerza bruta

2. **Implementar Content Security Policy (CSP)**
   - **Estado**: No implementado
   - **Recomendación**:
     - Configurar CSP headers en nginx
     - Prevenir XSS y data exfiltration
     - Whitelist de scripts y estilos permitidos

3. **Implementar HTTP Security Headers**
   - **Headers recomendados**:
     - `X-Content-Type-Options: nosniff`
     - `X-Frame-Options: DENY`
     - `X-XSS-Protection: 1; mode=block`
     - `Strict-Transport-Security: max-age=31536000; includeSubDomains`
   - **Estado**: Parcialmente implementado

---

## Resumen de Hallazgos

| Aspecto | Frontend | Backend | Estado |
|----------|------------|-----------|---------|
| Autenticación | ⚠️ localStorage | ✅ JWT robusto | Mejorable |
| Autorización | ✅ Guards | ✅ Roles | OK |
| SQL Injection | ✅ Sanitización | ✅ JPQL | OK |
| XSS | ⚠️ localStorage | N/A | Mejorable |
| CSRF | ✅ No aplica | ✅ Deshabilitado | OK |
| HTTPS | ✅ Configurado | ✅ Obligatorio | OK |
| Input Validation | ✅ Angular forms | ✅ Bean Validation | OK |
| Exception Handling | ✅ HTTP errors | ✅ Custom exceptions | OK |
| Logging | ✅ Sin console.log | ✅ Log levels | OK |
| Rate Limiting | ❌ No | ❌ No | Pendiente |
| CSP | ❌ No | ❌ No | Pendiente |
| Security Headers | ❌ Parcial | ❌ Parcial | Pendiente |

---

## Conclusión

El proyecto tiene un **nivel de seguridad BUENO** con los pilares fundamentales bien implementados:

### Fortalezas
1. Autenticación JWT robusta
2. Encriptación BCrypt para contraseñas
3. Protección completa contra SQL injection
4. Validaciones exhaustivas de entrada
5. Autorización por roles bien configurada

### Debilidades
1. **CRÍTICO**: Tokens en localStorage (vulnerabilidad XSS)
2. **MEDIA**: Falta rate limiting
3. **MEDIA**: Falta Content Security Policy
4. **BAJA**: Falta algunos security headers

### Prioridad de Correcciones
1. **ALTA**: Migrar tokens a httpOnly cookies o sessionStorage
2. **MEDIA**: Implementar rate limiting en endpoints críticos
3. **MEDIA**: Configurar CSP en nginx
4. **BAJA**: Completar headers de seguridad

---

**Calificación de Seguridad: 8/10**
- Fortalezas robustas en autenticación y autorización
- Vulnerabilidad XSS en frontend requiere atención
- Buenas prácticas en prevención de SQL injection
- Mejoras recomendadas para nivel de seguridad superior
