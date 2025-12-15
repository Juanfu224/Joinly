# Joinly

> **Plataforma inteligente de gestión de suscripciones compartidas**

Joinly es una solución completa para gestionar suscripciones digitales compartidas entre familias, amigos y grupos. Centraliza pagos, automatiza divisiones de costes y proporciona transparencia total en la gestión de servicios de streaming, gaming, música y más.

[![Java](https://img.shields.io/badge/Java-25-orange.svg)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Angular](https://img.shields.io/badge/Angular-19-red.svg)](https://angular.io/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue.svg)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-Academic-yellow.svg)](LICENSE)

---

## Tabla de Contenidos

- [Características](#-características)
- [Stack Tecnológico](#-stack-tecnológico)
- [Requisitos](#-requisitos)
- [Instalación Rápida](#-instalación-rápida)
- [Documentación Completa](#-documentación-completa)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Testing](#-testing)
- [Contribución](#-contribución)
- [Licencia](#-licencia)

---

## Características

### Gestión de Unidades Familiares
- Crear grupos con código único de 12 dígitos
- Sistema de solicitudes de membresía
- Control de roles: Admin, Anfitrión, Miembro
- Expulsión y abandono de grupos

### Gestión de Suscripciones
- Catálogo de servicios (Netflix, Spotify, Disney+, etc.)
- Sistema de plazas disponibles/ocupadas
- División automática de costes
- Gestión de credenciales encriptadas (AES-256)
- Estados: Activa, Pausada, Cancelada, Expirada

### Sistema de Pagos
- Retención de pagos hasta finalización de período
- Liberación automática a anfitriones
- Soporte para múltiples métodos de pago
- Historial completo de transacciones
- Sistema de reembolsos

### Soporte y Disputas
- Sistema de tickets de soporte
- Estados: Abierto, En Proceso, Resuelto, Cerrado
- Gestión de disputas por pagos o acceso
- Chat con agentes de soporte

### Seguridad
- Autenticación JWT (Access + Refresh tokens)
- Encriptación AES-256 para credenciales
- Verificación de email
- Protección CSRF y CORS configurado
- Migraciones de BD con Flyway

### Características Adicionales
- API REST documentada con OpenAPI/Swagger
- Notificaciones en tiempo real
- Sistema de valoraciones
- Auditoría de acciones
- Paginación y filtros en endpoints

---

## Stack Tecnológico

### Backend
- **Java 25** (Virtual Threads, Pattern Matching)
- **Spring Boot 4.0.0** (Framework principal)
- **Spring Security** (Autenticación JWT)
- **Spring Data JPA** (ORM)
- **MySQL 8.0** (Base de datos)
- **Flyway** (Migraciones)
- **Lombok** (Reducción boilerplate)
- **JUnit 5 + MockMvc** (Testing)
- **Swagger/OpenAPI** (Documentación API)

### Frontend
- **Angular 19** (Framework principal)
- **TypeScript** (Lenguaje)
- **SCSS** (Estilos)
- **BEM + ITCSS** (Metodología CSS)
- **Standalone Components** (Nueva arquitectura Angular)
- **RxJS** (Programación reactiva)

### DevOps
- **Docker & Docker Compose** (Containerización)
- **Maven** (Build tool)
- **Git** (Control de versiones)

---

## Requisitos

### Obligatorios
- **Java Development Kit (JDK) 25** o superior
- **Node.js 18+** y npm
- **Docker** y **Docker Compose**
- **Git**

### Verificación
```bash
java -version    # Debe mostrar Java 25+
node -v          # Debe mostrar v18+
docker -v        # Debe mostrar Docker instalado
git --version    # Debe mostrar Git instalado
```

---

## Instalación Rápida

### 1. Clonar el Repositorio

```bash
git clone https://github.com/Juanfu224/Joinly.git
cd Joinly
```

### 2. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```bash
cp .env.example .env
```

Edita el archivo `.env` y genera claves seguras:

```bash
# Generar clave JWT (64 bytes)
openssl rand -base64 64

# Generar clave de encriptación AES-256 (32 bytes)
openssl rand -base64 32
```

**Contenido del archivo `.env`:**

```properties
# Base de datos
MYSQL_ROOT_PASSWORD=tu_password_seguro
MYSQL_DATABASE=bbdd_joinly
MYSQL_USER=joinly_user
MYSQL_PASSWORD=tu_password_mysql
MYSQL_PORT=3306

# Backend
DB_URL=jdbc:mysql://localhost:3306/bbdd_joinly
DB_USERNAME=root
DB_PASSWORD=tu_password_seguro

# JWT (pegar salida de: openssl rand -base64 64)
JWT_SECRET_KEY=tu_clave_jwt_generada
JWT_ACCESS_TOKEN_EXPIRATION=3600000
JWT_REFRESH_TOKEN_EXPIRATION=2592000000

# Encriptación (pegar salida de: openssl rand -base64 32)
ENCRYPTION_KEY=tu_clave_aes_generada
```

### 3. Iniciar Base de Datos

```bash
docker-compose up -d
```

Esto iniciará MySQL en el puerto 3306.

### 4. Ejecutar Backend

```bash
cd backend
./mvnw spring-boot:run
```

En Windows:
```cmd
cd backend
mvnw.cmd spring-boot:run
```

El backend estará disponible en: `http://localhost:8080`

**Verificar:**
- Health: `http://localhost:8080/actuator/health`
- Swagger: `http://localhost:8080/swagger-ui.html`

### 5. Ejecutar Frontend

```bash
cd frontend
npm install
npm start
```

El frontend estará disponible en: `http://localhost:4200`

---

## Documentación Completa

- **[Backend README](backend/README.md)** - Configuración detallada del backend, endpoints, testing
- **[Frontend README](frontend/README.md)** - Guía del frontend Angular
- **[Documentación de Diseño](docs/design/DOCUMENTACION.md)** - Principios de diseño, CSS, BEM, ITCSS (2600+ líneas)
- **[Guía de Seguridad](backend/docs/SECURITY.md)** - Buenas prácticas, generación de claves, rotación
- **[Configuración de Entorno](docs/ENV_CONFIG.md)** - Variables de entorno centralizadas
- **[Lista de Mejoras](backend/docs/TODO_MEJORAS.md)** - Roadmap y tareas completadas
- **[Modelo ER](backend/docs/Modelo%20ER/)** - Diagrama de base de datos

### API REST Documentada

Accede a la documentación interactiva de la API:

```
http://localhost:8080/swagger-ui.html
```

**Principales módulos:**
- **Auth** - Registro, login, refresh token, verificación email
- **Usuarios** - Perfil, búsqueda, actualización
- **Unidades Familiares** - Crear, unirse, gestionar miembros
- **Suscripciones** - CRUD, ocupar/liberar plazas, gestión estados
- **Pagos** - Procesar, listar, liberar, reembolsos
- **Solicitudes** - Aprobar/rechazar, estados
- **Credenciales** - Acceso encriptado a credenciales
- **Notificaciones** - Marcar leídas, listar
- **Tickets Soporte** - Crear, responder, cerrar
- **Disputas** - Abrir, resolver, escalar
- **Servicios** - Catálogo de servicios disponibles

---

## Estructura del Proyecto

```
Joinly/
  backend/                    # Backend Spring Boot
      src/
          main/
              java/com/alberti/joinly/
                  config/        # Configuraciones (Security, OpenAPI)
                  controllers/   # Endpoints REST
                  dto/           # Data Transfer Objects
                  entities/      # Entidades JPA (19 tablas)
                  exceptions/    # Manejo de excepciones
                  repositories/  # Repositorios JPA
                  security/      # JWT, UserDetails, filtros
                  services/      # Lógica de negocio
                  utils/         # Utilidades (encriptación)
              resources/
                  application.properties
                  db/migration/  # Scripts Flyway
          test/                  # Tests unitarios e integración
      docs/                      # Documentación backend
      pom.xml                    # Dependencias Maven
      README.md
  frontend/                   # Frontend Angular 19
      src/
          app/
              components/       # Componentes reutilizables
              layout/           # Header, Footer, Main
              pages/            # Páginas/Rutas
              services/         # Servicios HTTP
              guards/           # Guards de autenticación
          styles/               # SCSS con ITCSS
              00-settings/      # Variables, tokens
              01-tools/         # Mixins, funciones
              02-generic/       # Reset, normalize
              03-elements/      # Estilos base HTML
              04-layout/        # Grid, flex, containers
      package.json
      angular.json
      README.md
  docs/                       # Documentación general
      design/
          DOCUMENTACION.md      # 2600+ líneas de diseño
      ENV_CONFIG.md
  docker-compose.yml          # MySQL containerizado
  .env.example                # Plantilla variables de entorno
  .gitignore
  README.md                   # Este archivo
```

---

## Testing

### Backend - Tests de Integración

El backend incluye **55+ tests de integración** que cubren:

- **AuthController** (9 tests) - Registro, login, refresh, verificación
- **UnidadFamiliarController** (17 tests) - CRUD, membresía, códigos
- **SuscripcionController** (18 tests) - CRUD, plazas, estados
- **PagoController** (11 tests) - Procesar, liberar, reembolsos

**Ejecutar tests:**

```bash
cd backend
./mvnw test
```

O usar la tarea configurada:

```bash
./mvnw test -Dtest=AuthControllerIntegrationTest
```

**Características de los tests:**
- Uso de `@SpringBootTest` + `@AutoConfigureMockMvc`
- Base de datos H2 en memoria (aislamiento total)
- Autenticación JWT real
- Rollback automático con `@Transactional`
- Cobertura de casos éxito y error

### Frontend - Tests Unitarios

```bash
cd frontend
npm test
```

---

## Contribución

Este es un proyecto académico para el módulo **Desarrollo Web en Entorno Servidor (DWES)** del ciclo **DAW (Desarrollo de Aplicaciones Web)**.

### Guía de Contribución

1. Fork el repositorio
2. Crea una rama para tu feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit tus cambios: `git commit -m 'Add: nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Abre un Pull Request

### Convenciones de Código

- **Backend:** Seguir guía de estilo Java de Google
- **Frontend:** Seguir guía de estilo Angular oficial
- **CSS:** Metodología BEM + Arquitectura ITCSS
- **Commits:** Formato semántico (Add, Fix, Update, Remove, Refactor)

---

## Licencia

Este proyecto es parte de un trabajo académico para el ciclo de **Desarrollo de Aplicaciones Web (DAW)** en el módulo **Desarrollo Web en Entorno Servidor**.

**Autor:** Juan
**Institución:** IES Alberti
**Año Académico:** 2024-2025
**Repositorio:** [https://github.com/Juanfu224/Joinly](https://github.com/Juanfu224/Joinly)

---

## Contacto y Soporte

- **GitHub:** [@Juanfu224](https://github.com/Juanfu224)
- **Issues:** [Reportar problema](https://github.com/Juanfu224/Joinly/issues)
- **Pull Requests:** [Contribuir](https://github.com/Juanfu224/Joinly/pulls)

---

## Sobre el Proyecto

Joinly fue desarrollado como proyecto final para demostrar competencias en:

  Desarrollo de APIs REST con Spring Boot  
  Autenticación y autorización con JWT  
  Arquitectura MVC y capas bien definidas  
  Persistencia de datos con JPA/Hibernate  
  Migraciones de BD con Flyway  
  Testing de integración completo  
  Documentación profesional con Swagger  
  Seguridad: encriptación, CORS, CSRF  
  Frontend moderno con Angular 19  
  Containerización con Docker  
  Buenas prácticas y código limpio  

**Puntuación estimada:** 92/100  

---

<div align="center">
  <b>Desarrollado con   por Juan para el módulo DWES - DAW 2024/2025</b>
</div>
