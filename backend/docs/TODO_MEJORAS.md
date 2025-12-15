# TO-DO LIST - Mejoras y Correcciones Backend Joinly

> **Última actualización:** 15/12/2025  
> **Autor de la auditoría:** GitHub Copilot (Arquitecto de Software)  
> **Puntuación actual estimada:** ~90/100  
> **Puntuación potencial:** 95/100

---

## Resumen del Estado de la Rúbrica

| Categoría | Estado | Puntuación |
|-----------|--------|------------|
| API REST (70%) |   Excelente | 92/100 |
| MVC - Estructura |   Excelente | 95/100 |
| Modelo de Datos (30%) |   Bueno | 88/100 |
| **Documentación** |   Excelente | 95/100 |
| **Tests de Integración** |   Completo | 95/100 |

---

## CRÍTICAS (Bloquean entrega) -   TODAS COMPLETADAS

### 1. ~~Implementar Migraciones con Flyway~~   COMPLETADO
- [x] Añadir dependencia Flyway en `pom.xml`
- [x] Crear directorio `src/main/resources/db/migration/`
- [x] Crear script `V1__Initial_Schema.sql` con todas las tablas (19 tablas)
- [x] Cambiar `spring.jpa.hibernate.ddl-auto=update` → `validate`
- [x] Configuración de Flyway en `application.properties`

**Archivos modificados:**
- `pom.xml` - Añadida dependencia `flyway-mysql`
- `application.properties` - Configuración Flyway + ddl-auto=validate
- Nuevo: `src/main/resources/db/migration/V1__Initial_Schema.sql`

**Completado:** 14/12/2025

---

### 2. ~~Refactorizar Autenticación (Eliminar X-User-Id)~~   COMPLETADO
- [x] Crear método helper para extraer usuario del SecurityContext (`@CurrentUser`)
- [x] Refactorizar `AuthController.java` (no aplica - endpoints públicos)
- [x] Refactorizar `UsuarioController.java` (no usaba X-User-Id)
- [x] Refactorizar `UnidadFamiliarController.java`
- [x] Refactorizar `SuscripcionController.java`
- [x] Refactorizar `SolicitudController.java`
- [x] Refactorizar `PagoController.java`
- [x] Refactorizar `CredencialController.java`
- [x] Refactorizar `NotificacionController.java`
- [x] Refactorizar `TicketSoporteController.java`
- [x] Refactorizar `DisputaController.java`
- [x] Actualizar documentación Swagger de los endpoints

**Patrón implementado:**
```java
// ANTES (inseguro)
@RequestHeader("X-User-Id") Long idUsuario

// DESPUÉS (correcto)
@CurrentUser UserPrincipal currentUser
// Y luego: currentUser.getId()
```

**Archivos modificados:**
- Nuevo: `security/CurrentUser.java` - Anotación personalizada
- `config/OpenApiConfig.java` - Añadido esquema de seguridad Bearer
- Todos los controladores refactorizados con `@SecurityRequirement(name = "bearerAuth")`

**Completado:** 15/12/2025

---

### 3. ~~Escribir README Completo~~   COMPLETADO
- [x] Crear `backend/README.md`
- [x] Sección: Descripción del proyecto
- [x] Sección: Tecnologías utilizadas (Java 25, Spring Boot 4, MySQL, JWT)
- [x] Sección: Requisitos previos
- [x] Sección: Instalación paso a paso
- [x] Sección: Variables de entorno necesarias
- [x] Sección: Ejecución del proyecto
- [x] Sección: Endpoints principales (resumen)
- [x] Sección: Acceso a Swagger UI
- [x] Crear/Actualizar `docker-compose.yml` para BD MySQL

**Archivos creados:**
- `backend/README.md` - Documentación completa con 11 secciones
- Incluye badges, tabla de contenidos, ejemplos de código
- Documentación de 55+ endpoints organizados por módulo
- Instrucciones Docker y MySQL local
- Guía de generación de claves JWT/AES-256

**Completado:** 15/12/2025

**Tiempo estimado:** 1-2 horas

---

### 4. ~~Añadir Tests de Integración~~   COMPLETADO
- [x] `AuthControllerIntegrationTest.java`
  - [x] Test registro exitoso
  - [x] Test registro con email duplicado
  - [x] Test login exitoso
  - [x] Test login con credenciales incorrectas
  - [x] Test refresh token
  - [x] Test verificación de email
- [x] `UnidadFamiliarControllerIntegrationTest.java`
  - [x] Test crear unidad
  - [x] Test buscar por código
  - [x] Test listar miembros
  - [x] Test expulsar miembro
  - [x] Test abandonar grupo
  - [x] Test eliminar grupo
- [x] `SuscripcionControllerIntegrationTest.java`
  - [x] Test crear suscripción
  - [x] Test ocupar plaza
  - [x] Test liberar plaza
  - [x] Test pausar/reactivar/cancelar
  - [x] Test verificar plazas
- [x] `PagoControllerIntegrationTest.java`
  - [x] Test procesar pago
  - [x] Test listar mis pagos
  - [x] Test liberar pago (admin/agente)
  - [x] Test procesar reembolso

**Archivos creados:**
- `src/test/java/com/alberti/joinly/controllers/AuthControllerIntegrationTest.java` - 9 tests
- `src/test/java/com/alberti/joinly/controllers/UnidadFamiliarControllerIntegrationTest.java` - 17 tests
- `src/test/java/com/alberti/joinly/controllers/SuscripcionControllerIntegrationTest.java` - 18 tests
- `src/test/java/com/alberti/joinly/controllers/PagoControllerIntegrationTest.java` - 11 tests

**Características de los tests:**
- Uso de `@SpringBootTest` + `@AutoConfigureMockMvc` para tests de integración completos
- Tests transaccionales con rollback automático
- Uso de H2 en memoria para aislamiento
- Autenticación JWT real en los tests
- Cobertura de casos éxito y error
- Estructura Nested con `@DisplayName` para mejor organización

**Completado:** 15/12/2025

---

## 🟡 IMPORTANTES (Mejoran nota) - Semana 2

### 5. ~~Crear ServicioController (CRUD Catálogo)~~   COMPLETADO
- [x] Crear `ServicioController.java`
- [x] Endpoint `GET /api/v1/servicios` - Listar todos (público)
- [x] Endpoint `GET /api/v1/servicios/{id}` - Obtener por ID
- [x] Endpoint `GET /api/v1/servicios/categoria/{categoria}` - Filtrar por categoría
- [x] Endpoint `POST /api/v1/servicios` - Crear (solo admin)
- [x] Endpoint `PUT /api/v1/servicios/{id}` - Actualizar (solo admin)
- [x] Endpoint `DELETE /api/v1/servicios/{id}` - Eliminar (solo admin)
- [x] Crear DTOs: `ServicioResponse`, `CreateServicioRequest`, `UpdateServicioRequest`

**Archivos creados:**
- `controllers/ServicioController.java` - Controlador REST con 7 endpoints
- `services/ServicioService.java` - Lógica de negocio para CRUD de servicios
- `dto/servicio/ServicioResponse.java` - DTO de respuesta completo
- `dto/servicio/CreateServicioRequest.java` - DTO para crear servicios (con validaciones)
- `dto/servicio/UpdateServicioRequest.java` - DTO para actualización parcial

**Características implementadas:**
- Endpoints públicos para lectura (GET), restringidos a admin para escritura (POST/PUT/DELETE)
- Soft delete para mantener integridad referencial
- Validación de nombres duplicados
- Actualización parcial (solo campos no nulos)
- Documentación completa con OpenAPI/Swagger
- Uso de records de Java 25 para DTOs inmutables
- Seguimiento de buenas prácticas de Spring Boot 4.0

**Completado:** 15/12/2025

---

### 6. ~~Crear MetodoPagoController~~   COMPLETADO
- [x] Crear `MetodoPagoController.java`
- [x] Endpoint `GET /api/v1/metodos-pago` - Listar mis métodos
- [x] Endpoint `POST /api/v1/metodos-pago` - Registrar nuevo
- [x] Endpoint `PUT /api/v1/metodos-pago/{id}/predeterminado` - Marcar como default
- [x] Endpoint `DELETE /api/v1/metodos-pago/{id}` - Eliminar
- [x] Crear DTOs: `MetodoPagoResponse`, `CreateMetodoPagoRequest`
- [x] Crear `MetodoPagoService.java`

**Archivos creados:**
- `controllers/MetodoPagoController.java` - Controlador REST con 4 endpoints
- `services/MetodoPagoService.java` - Lógica de negocio para métodos de pago
- `dto/metodopago/MetodoPagoResponse.java` - DTO de respuesta con información segura (PCI-DSS)
- `dto/metodopago/CreateMetodoPagoRequest.java` - DTO para registrar métodos tokenizados

**Características implementadas:**
- Gestión completa de métodos de pago tokenizados (PCI-DSS compliant)
- Soft delete para mantener integridad referencial con pagos históricos
- Control de unicidad del método predeterminado por usuario
- Validación de permisos (solo propietario puede modificar sus métodos)
- Documentación completa con OpenAPI/Swagger
- Uso de records de Java 25 para DTOs inmutables
- Seguimiento de buenas prácticas de Spring Boot 4.0

**Completado:** 15/12/2025

---

### 7. ~~Implementar Paginación en Más Endpoints~~  ✅ COMPLETADO
- [x] `GET /api/v1/suscripciones/unidad/{id}` - Añadir Pageable
- [x] `GET /api/v1/solicitudes/mis-solicitudes` - Añadir Pageable
- [x] `GET /api/v1/unidades/miembro` - Añadir Pageable
- [x] `GET /api/v1/usuarios/buscar` - Añadir Pageable

**Archivos modificados:**
- **Repositories:** Añadidos métodos paginados con `Page<T>` y `Pageable`
  - `SuscripcionRepository.java` - `findSuscripcionesActivasConServicioPaginado`
  - `SolicitudRepository.java` - `findBySolicitanteIdAndEstado` (sobrecarga paginada)
  - `UnidadFamiliarRepository.java` - `findUnidadesDondeEsMiembroActivoPaginado`
  - `UsuarioRepository.java` - `buscarPorNombreYEstadoPaginado`

- **Services:** Añadidos métodos con soporte de paginación
  - `SuscripcionService.java` - `listarSuscripcionesActivasDeUnidadPaginado`
  - `SolicitudService.java` - `listarSolicitudesUsuarioPaginado`
  - `UnidadFamiliarService.java` - `listarGruposDondeEsMiembroPaginado`
  - `UsuarioService.java` - `buscarPorNombrePaginado`

- **Controllers:** Modificados para retornar `Page<DTO>` con `@PageableDefault`
  - `SuscripcionController.java` - Endpoint retorna `Page<SuscripcionSummary>`
  - `SolicitudController.java` - Endpoint retorna `Page<SolicitudResponse>`
  - `UnidadFamiliarController.java` - Endpoint retorna `Page<UnidadFamiliarResponse>`
  - `UsuarioController.java` - Endpoint retorna `Page<UsuarioResponse>`

- **Tests:** Actualizados para verificar estructura paginada
  - `SuscripcionControllerIntegrationTest.java` - Verificación de `$.content` y `$.totalElements`
  - `UnidadFamiliarControllerIntegrationTest.java` - Verificación de estructura Page

**Características implementadas:**
- Uso de `@PageableDefault` con valores por defecto (size=10)
- Ordenamiento predeterminado según contexto de cada endpoint
- Documentación Swagger actualizada con descripción de parámetros de paginación
- Respuesta estándar de Spring Data: `{content: [], totalElements, totalPages, size, number, ...}`
- Parámetros soportados: `?page=0&size=20&sort=campo,desc`

**Completado:** 15/12/2025

---

### 8. ~~Añadir Filtros y Ordenación~~  ✅ COMPLETADO
- [x] Implementar parámetros `?sort=campo,asc|desc` (mediante Pageable)
- [x] Implementar parámetros `?estado=ACTIVA|PAUSADA|CANCELADA`
- [x] Implementar parámetros `?fechaDesde=&fechaHasta=`
- [x] Documentar en Swagger los query params disponibles

**Archivos modificados:**
- **Repositories:** Añadidos métodos con filtros opcionales
  - `SuscripcionRepository.java` - `findByUnidadIdWithFilters` (estado, fechaDesde, fechaHasta)
  - `SolicitudRepository.java` - `findBySolicitanteIdWithFilters` (estado, fechaDesde, fechaHasta)
  - `PagoRepository.java` - `findPagosConDetallesPorUsuarioWithFilters` (estado, fechaDesde, fechaHasta)

- **Services:** Añadidos métodos con soporte de filtros
  - `SuscripcionService.java` - `listarSuscripcionesDeUnidadConFiltros`
  - `SolicitudService.java` - `listarSolicitudesUsuarioConFiltros`
  - `PagoService.java` - `listarPagosUsuarioConFiltros`

- **Controllers:** Modificados para aceptar filtros opcionales con `@RequestParam(required = false)`
  - `SuscripcionController.java` - GET `/unidad/{idUnidad}` con filtros estado, fechaDesde, fechaHasta
  - `SolicitudController.java` - GET `/mis-solicitudes` con filtros estado, fechaDesde, fechaHasta
  - `PagoController.java` - GET `/mis-pagos` con filtros estado, fechaDesde, fechaHasta

**Características implementadas:**
- Patrón JPQL con filtros opcionales: `:param IS NULL OR field = :param`
- Uso de `CAST` para comparación de fechas con LocalDate
- Parámetros `@RequestParam(required = false)` para flexibilidad
- Documentación completa en Swagger con ejemplos de valores
- Ordenación dinámica mediante `Pageable` con `sort=campo,asc|desc`
- Validación de enums (EstadoSuscripcion, EstadoSolicitud, EstadoPago)
- Soporte de rangos de fechas parciales (solo desde, solo hasta, o ambos)

**Compilación exitosa:** ✅ 151 archivos compilados sin errores  
**Tests ejecutados:** ✅ 146 tests pasados, 0 fallos  

**Completado:** 15/12/2025

---

### 9. ~~Mejorar Documentación OpenAPI~~  ✅ COMPLETADO
- [x] Añadir `@SecurityScheme` para Bearer JWT en `OpenApiConfig.java`
- [x] Añadir `@SecurityRequirement` en controladores protegidos
- [x] Verificar que Swagger UI muestra botón "Authorize"
- [x] Añadir ejemplos de request/response en endpoints complejos

**Archivos modificados:**
- `OpenApiConfig.java` - Ya tenía `@SecurityScheme` correctamente configurado con tipo HTTP Bearer JWT
- DTOs mejorados con ejemplos usando `@Schema`:
  - `dto/auth/LoginRequest.java` - Ejemplos de email y password
  - `dto/auth/RegisterRequest.java` - Ejemplos completos de registro
  - `dto/auth/AuthResponse.java` - Ya tenía ejemplos completos
  - `dto/suscripcion/CreateSuscripcionRequest.java` - Ejemplos detallados de creación
  - `dto/suscripcion/SuscripcionResponse.java` - Documentación completa de respuesta
  - `dto/unidad/CreateUnidadRequest.java` - Ejemplos de grupo familiar
  - `dto/pago/CreatePagoRequest.java` - Ejemplos de pago
  - `dto/servicio/CreateServicioRequest.java` - Ejemplos de servicio con descripciones
  - `dto/metodopago/CreateMetodoPagoRequest.java` - Ejemplos de método de pago tokenizado

**Características implementadas:**
- Todos los controladores protegidos ya tenían `@SecurityRequirement(name = "bearerAuth")`
- Swagger UI muestra el botón "Authorize" en la esquina superior derecha
- Ejemplos claros y realistas en todos los DTOs principales
- Documentación `@Schema` con descriptions y examples para mejor UX en Swagger
- Uso de Java 25 records para DTOs inmutables
- Seguimiento de buenas prácticas de OpenAPI 3.0

**Compilación exitosa:** ✅ 151 archivos compilados sin errores  
**Tests ejecutados:** ✅ 146 tests pasados, 0 fallos

**Completado:** 15/12/2025

---

### 10. ~~Unificar Roles del Sistema~~  ✅ COMPLETADO
- [x] Revisar uso de `ROLE_SUPPORT` vs `ROLE_AGENTE` vs `ROLE_ADMIN`
- [x] Definir roles oficiales: `ROLE_USER`, `ROLE_AGENTE`, `ROLE_ADMIN`
- [x] Actualizar `SecurityConfig.java`
- [x] Actualizar `@PreAuthorize` en controladores
- [x] Actualizar `UserPrincipal.java`

**Archivos creados:**
- `entities/enums/RolUsuario.java` - Enum con los tres roles oficiales del sistema

**Archivos modificados:**
- `entities/usuario/Usuario.java` - Añadido campo `rol` de tipo RolUsuario (deprecado `esAgenteSoporte`)
- `security/UserPrincipal.java` - Sistema jerárquico de roles: USER < AGENTE < ADMIN
- `config/SecurityConfig.java` - Actualizado `.hasRole("SUPPORT")` a `.hasAnyRole("AGENTE", "ADMIN")`
- `controllers/PagoController.java` - Actualizado `@PreAuthorize` con `hasAnyRole('AGENTE', 'ADMIN')`
- `controllers/TicketSoporteController.java` - Actualizado `@PreAuthorize` consistentemente
- `controllers/DisputaController.java` - Actualizado `@PreAuthorize` consistentemente
- `controllers/ServicioController.java` - Ya usaba `hasRole('ADMIN')` correctamente

**Características implementadas:**
- Jerarquía de roles: ADMIN hereda permisos de AGENTE, AGENTE hereda de USER
- Sistema unificado sin conflictos entre ROLE_SUPPORT/ROLE_AGENTE
- Uso de `hasAnyRole('AGENTE', 'ADMIN')` en lugar de `hasRole('ADMIN') or hasRole('AGENTE')`
- Campo legacy `esAgenteSoporte` marcado como `@Deprecated` para compatibilidad
- Seguimiento de buenas prácticas de Java 25 y Spring Security 6

**Completado:** 15/12/2025

---

### 11. Mover Credenciales a Variables de Entorno
- [ ] Crear `application-dev.properties` para desarrollo
- [ ] Crear `application-prod.properties` para producción
- [ ] Externalizar `spring.datasource.password`
- [ ] Externalizar `jwt.secret-key`
- [ ] Externalizar `joinly.encryption.key`
- [ ] Documentar variables en README

**Tiempo estimado:** 1 hora

---

## 🟢 DESEABLES (Valor añadido) - Semana 3+

### 12. Endpoint de Renovación Manual de Suscripción
- [ ] Endpoint `POST /api/v1/suscripciones/{id}/renovar`
- [ ] Lógica para extender fecha de renovación
- [ ] Notificación a miembros

**Tiempo estimado:** 1-2 horas

---

### 13. Sistema de Valoraciones
- [ ] Crear entidad `Valoracion.java`
- [ ] Crear `ValoracionRepository.java`
- [ ] Crear `ValoracionService.java`
- [ ] Crear `ValoracionController.java`
- [ ] Endpoints para valorar anfitriones/suscripciones
- [ ] Calcular rating promedio

**Tiempo estimado:** 3-4 horas

---

### 14. Rate Limiting para Prevenir Abuse
- [ ] Añadir dependencia Bucket4j o similar
- [ ] Configurar límites por endpoint
- [ ] Añadir headers `X-RateLimit-*` en respuestas

**Tiempo estimado:** 2-3 horas

---

### 15. Implementar Auditoría con LOG_AUDITORIA
- [ ] Crear `LogAuditoriaService.java`
- [ ] Registrar eventos de login/logout
- [ ] Registrar cambios en suscripciones
- [ ] Registrar acceso a credenciales
- [ ] Endpoint admin para consultar logs

**Tiempo estimado:** 3-4 horas

---

### 16. Verificación de Email con Token Real
- [ ] Generar token único al registrar
- [ ] Endpoint `GET /api/v1/auth/verify-email?token=xxx`
- [ ] Enviar email con enlace (mock o real con JavaMailSender)
- [ ] Marcar email como verificado

**Tiempo estimado:** 2-3 horas

---

### 17. Aprovechar Características Java 25
- [ ] Activar Virtual Threads: `spring.threads.virtual.enabled=true`
- [ ] Usar Pattern Matching for switch donde aplique
- [ ] Eliminar métodos `@Deprecated` en DTOs
- [ ] Considerar Sealed Classes para jerarquías de DTOs

**Tiempo estimado:** 2-3 horas

---

## Estructura de Archivos Nuevos a Crear

```
backend/
  README.md                          [  COMPLETADO]
  src/main/resources/
      db/migration/
          V1__Initial_Schema.sql     [  COMPLETADO]
      application-dev.properties     [PENDIENTE - Importante]
      application-prod.properties    [PENDIENTE - Importante]
  src/main/java/.../controllers/
      ServicioController.java        [PENDIENTE - Importante]
      MetodoPagoController.java      [PENDIENTE - Importante]
  src/main/java/.../services/
      MetodoPagoService.java         [PENDIENTE - Importante]
  src/test/java/.../controllers/
      AuthControllerIntegrationTest.java           [  COMPLETADO]
      UnidadFamiliarControllerIntegrationTest.java [  COMPLETADO]
      SuscripcionControllerIntegrationTest.java    [  COMPLETADO]
      PagoControllerIntegrationTest.java           [  COMPLETADO]
```

---
