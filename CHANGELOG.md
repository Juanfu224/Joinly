# Changelog

All notable changes to Joinly will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Documentación técnica completa (Arquitectura, Setup, Contribución, Changelog)
- Architecture Decision Records (ADRs) para decisiones técnicas
- Guía de configuración para desarrollo y producción
- Guía de contribución con estándares de código y procesos

---

## [1.0.0] - 2026-01-26

### Added
- Sistema de autenticación JWT con access y refresh tokens
- Registro de usuarios con verificación de email
- Login y logout
- Recuperación de contraseña
- Gestión de unidades familiares (grupos)
- Crear unidades familiares con código único de 12 dígitos
- Unirse a grupos mediante código de invitación
- Gestionar miembros (aprobar solicitudes, expulsar, abandonar)
- Sistema de roles (Admin, Anfitrión, Miembro)
- Gestión de suscripciones compartidas
- Catálogo de servicios (Netflix, Spotify, Disney+, etc.)
- Crear suscripciones en grupos
- Sistema de plazas (ocupadas/totales)
- Gestión de estados de suscripción (Activa, Pausada, Cancelada, Expirada)
- Gestión de credenciales encriptadas (AES-256-GCM)
- Acceso a credenciales por miembros del grupo
- Sistema de pagos
- Procesar pagos para ocupar plazas
- Retención de pagos hasta finalización de período
- Liberación de pagos a anfitriones
- Historial de pagos
- Sistema de reembolsos
- Tickets de soporte
- Crear tickets de soporte
- Enviar mensajes en tickets
- Cerrar tickets
- Sistema de disputas
- Abrir disputas por pagos o acceso
- Resolver disputas
- Notificaciones
- Sistema de notificaciones en tiempo real
- Marcar notificaciones como leídas
- Perfil de usuario
- Editar perfil
- Cambiar contraseña
- Sistema de temas (claro/oscuro)
- API REST completa con OpenAPI/Swagger
- 19 tablas en base de datos MySQL
- Migraciones con Flyway
- Sistema de logs y auditoría
- Configuración CORS
- Health checks
- Frontend completo con Angular 21
- Páginas públicas (Home, FAQ, Cómo Funciona)
- Autenticación (Login, Registro, Recuperar Contraseña)
- Dashboard principal
- Gestión de grupos familiares
- Gestión de suscripciones
- Gestión de pagos
- Perfil de usuario
- Mis solicitudes
- Notificaciones
- Sistema de modales
- Sistema de toasts/notificaciones
- Componentes reutilizables (Cards, Forms, Buttons, Inputs)
- Responsive design (mobile, tablet, desktop)
- Optimización de rendimiento
- Lazy loading de rutas
- Code splitting
- Optimización de imágenes
- Configuración Nginx para producción
- Docker multi-stage builds
- Scripts de despliegue automatizado
- Configuración SSL con Let's Encrypt
- Sistema de backups
- Health checks automatizados
- 55+ tests de integración en backend
- Cobertura de tests frontend con Vitest
- Documentación completa del proyecto

### Changed
- Migración a Spring Boot 4.0.0
- Actualización a Angular 21 con standalone components
- Actualización a Java 25 con Virtual Threads
- Actualización a MySQL 8.0
- Migración de NgModules a standalone components
- Uso de Signals en lugar de observables para estado local
- Uso de input()/output() en lugar de @Input/@Output
- Uso de control flow nativo (@if, @for, @switch)
- Arquitectura ITCSS para estilos
- Metodología BEM para naming de clases

### Fixed
- Bug en validación de códigos de invitación
- Bug en cálculo de plazas disponibles
- Bug en refresh token cuando expira
- Bug en redirección después de login
- Bug en sincronización de tema en navegación
- Bug en scroll del body con modal abierto
- Bug en focus management en modales
- Bug en responsive de grillas en tablet
- Bug en encoding de caracteres especiales en notificaciones
- Bug en límites de paginación en endpoints

### Security
- Encriptación AES-256-GCM para credenciales
- httpOnly cookies para refresh tokens
- CSRF protection configurado
- CORS restrictivo a orígenes permitidos
- Validación de entrada en todos los endpoints
- Sanitización de inputs en frontend
- Rate limiting configurable
- Headers de seguridad (HSTS, X-Frame-Options, X-Content-Type-Options)
- Logs sin información sensible (no passwords, no tokens)

---

## [0.6.0] - 2026-01-10

### Added
- Sistema de temas claro/oscuro
- Optimización de rendimiento frontend
- Lazy loading de todas las páginas
- Code splitting automático
- Optimización de imágenes (WebP, lazy loading)
- Virtualización de listas largas con CDK
- Service Worker para caché offline
- Progressive Web App (PWA)
- Mejoras en UI/UX
- Animaciones suaves
- Transiciones entre páginas
- Feedback visual en acciones
- Loading states globales
- Error boundaries
- Skeleton loaders
- Infinite scroll en listas
- Filtros y búsqueda en listas
- Ordenamiento en tablas
- Paginación en endpoints backend
- Búsqueda de usuarios por email
- Filtros en endpoints de suscripciones
- Filtros en endpoints de pagos

### Changed
- Refactorización de componentes a standalone
- Migración a OnPush change detection
- Uso de Signals en lugar de Subjects
- Simplificación de servicios HTTP
- Mejora de arquitectura de stores
- Optimización de bundles (tree shaking)
- Mejora de métricas de Lighthouse

---

## [0.5.0] - 2025-12-15

### Added
- Sistema de notificaciones
- Notificaciones en tiempo real
- Notificaciones de solicitudes
- Notificaciones de pagos
- Notificaciones de cambios en suscripciones
- Notificaciones de mensajes en tickets
- Marcar notificaciones como leídas
- Contador de notificaciones no leídas
- Sistema de prioridad en notificaciones
- Agrupación de notificaciones

### Changed
- Mejora de rendimiento en endpoints
- Caché de consultas frecuentes
- Optimización de queries con índices
- Mejora de respuesta de la API

---

## [0.4.0] - 2025-11-20

### Added
- Sistema de pagos
- Procesar pagos para ocupar plazas
- Retención de pagos hasta finalización
- Liberación de pagos a anfitriones
- Historial completo de pagos
- Estado de pagos (Pendiente, Retenido, Liberado, Reembolsado)
- Sistema de reembolsos
- Múltiples métodos de pago (Tarjeta, PayPal, Bizum)
- Configuración de métodos de pago por usuario
- Validación de métodos de pago
- Cálculo automático de costes por miembro
- Notificaciones de pagos
- Dashboard de pagos para anfitriones

### Changed
- Actualización de modelo de datos para pagos
- Relaciones entre pagos, plazas y suscripciones
- Triggers automáticos para liberar pagos
- Jobs programados para expiración de pagos

---

## [0.3.0] - 2025-10-25

### Added
- Sistema de suscripciones
- Catálogo de servicios (Netflix, Spotify, Disney+, Prime, HBO, Apple TV+, YouTube Premium)
- Crear suscripciones en grupos
- Definir plazas totales y disponibles
- Coste mensual y periodicidad
- Gestión de credenciales encriptadas
- Acceso a credenciales por miembros
- Actualización de credenciales por anfitriones
- Historial de cambios de credenciales
- Estados de suscripción (Activa, Pausada, Cancelada, Expirada)
- Ocupar plazas en suscripciones
- Liberar plazas
- Validación de disponibilidad de plazas
- Cálculo de coste individual
- Dashboard de suscripciones
- Detalle de suscripción con miembros y plazas
- Gestión de anfitrión de suscripción

### Changed
- Actualización de modelo de datos para suscripciones
- Relaciones entre suscripciones, grupos, plazas y credenciales
- Encriptación AES-256-GCM para credenciales
- Keys de encriptación rotativas

---

## [0.2.0] - 2025-09-30

### Added
- Sistema de grupos familiares (Unidades Familiares)
- Crear grupos con nombre y descripción
- Generar código único de 12 dígitos para invitaciones
- Unirse a grupos mediante código
- Solicitudes de membresía
- Aprobar/rechazar solicitudes
- Gestionar miembros del grupo
- Expulsar miembros (solo admin/anfitrión)
- Abandonar grupo
- Sistema de roles (Admin, Anfitrión, Miembro)
- Cambiar rol de miembros
- Transferir anfitrión de grupo
- Listado de grupos del usuario
- Detalle de grupo con información y miembros
- Validación de códigos de invitación
- Límite de grupos por usuario
- Límite de miembros por grupo
- Dashboard de grupos

### Changed
- Actualización de modelo de datos para grupos
- Relaciones entre usuarios, grupos y membresías
- Códigos de invitación con validación
- Permisos basados en roles

---

## [0.1.0] - 2025-09-01

### Added
- Sistema de autenticación completo
- Registro de usuarios con validaciones
- Verificación de email
- Login con email y contraseña
- Autenticación JWT con access y refresh tokens
- Refresh automático de tokens
- Logout
- Recuperación de contraseña
- Reset de contraseña con token
- Cambiar contraseña
- Perfil de usuario básico
- Edición de perfil
- API REST básica
- Estructura inicial del proyecto
- Configuración de Spring Boot 3.x
- Configuración de Angular 17
- Configuración de MySQL
- Migraciones iniciales de Flyway
- Estructura de capas (Controller, Service, Repository)
- DTOs básicos
- Validaciones con Bean Validation
- Excepciones personalizadas
- Manejo global de excepciones
- Configuración de seguridad con Spring Security
- Filtro de autenticación JWT
- Configuración de CORS
- Documentación inicial de API con Swagger
- Tests básicos de integración
- Frontend básico con Angular
- Página de login
- Página de registro
- Página de recuperación de contraseña
- Layout básico (header, footer)
- Sistema de routing
- Guards de autenticación
- Interceptor de autenticación HTTP
- Servicio de autenticación
- Componentes de formularios (login, registro, recuperación)
- Validaciones de formularios
- Responsive design básico
- Tema por defecto

---

## Versiones Futuras

### [2.0.0] - Planeado
- Sistema de chat en tiempo real
- Videoconferencias entre grupos
- Integración con más servicios
- Sincronización de perfiles con redes sociales
- Gamificación y sistema de logros
- Recomendaciones de servicios
- Estadísticas y reportes avanzados
- Exportación de datos
- Modo offline
- Aplicación móvil nativa (iOS/Android)
- Integración con asistentes de voz
- Soporte multi-idioma
- Monetización premium

---

## Notas de Versión

### Formato de Versiones

Joinly utiliza [Semantic Versioning](https://semver.org/):

- **MAJOR**: Cambios incompatibles en la API
- **MINOR**: Funcionalidades nuevas backwards-compatible
- **PATCH**: Correcciones de bugs backwards-compatible

### Tipos de Cambios

- **Added**: Nueva funcionalidad
- **Changed**: Cambio en funcionalidad existente
- **Deprecated**: Funcionalidad obsoleta en próximas versiones
- **Removed**: Funcionalidad eliminada
- **Fixed**: Corrección de bug
- **Security**: Issue de seguridad parcheado

---

## Referencias

- [Keep a Changelog](https://keepachangelog.com/)
- [Semantic Versioning](https://semver.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

**Última actualización**: 26 de enero de 2026
**Versión**: 1.0.0
