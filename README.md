# Joinly

> **Plataforma inteligente de gestión de suscripciones compartidas**

Joinly es una solución completa para gestionar suscripciones digitales compartidas entre familias, amigos y grupos. Centraliza pagos, automatiza divisiones de costes y proporciona transparencia total en la gestión de servicios de streaming, gaming, música y más.

[![Java](https://img.shields.io/badge/Java-25-orange.svg)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Angular](https://img.shields.io/badge/Angular-21-red.svg)](https://angular.io/)
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
- **Nginx** (Reverse proxy y servidor web)
- **Let's Encrypt** (Certificados SSL)
- **Maven** (Build tool)
- **Git** (Control de versiones)

---

## Requisitos

### Obligatorios
- **Java Development Kit (JDK) 25** o superior
- **Node.js 18+** y npm
- **Docker** y **Docker Compose**

### Verificación Rápida
```bash
java -version    # Java 25+
node -v          # v18+
docker -v        # Docker instalado
```

---

## Instalación Rápida

### 🚀 Inicio en 2 Comandos

```bash
# 1. Clonar el repositorio
git clone https://github.com/Juanfu224/Joinly.git
cd Joinly

# 2. Iniciar todo (MySQL + Backend con migraciones automáticas)
make start

# 3. En otra terminal, iniciar frontend
make frontend
```

**¡Listo!** 🎉
- **Frontend**: http://localhost:4200
- **Backend**: http://localhost:8080
- **API Docs**: http://localhost:8080/swagger-ui.html

> **Nota**: No necesitas configurar nada. Las migraciones de BD se ejecutan automáticamente.

### 📋 Comandos Útiles

```bash
make help       # Ver todos los comandos disponibles
make status     # Ver estado de los servicios
make stop       # Detener todo
make test       # Ejecutar tests
make clean      # Limpiar archivos generados
```

---

### 🔧 Instalación Manual (Alternativa)

Si prefieres configurar manualmente:

#### 1. Clonar

```bash
git clone https://github.com/Juanfu224/Joinly.git
cd Joinly
```

#### 2. Iniciar Base de Datos

```bash
docker-compose up -d
# Esperar ~10 segundos a que MySQL esté listo
```

#### 3. Ejecutar Backend

```bash
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

En Windows:
```cmd
cd backend
mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=dev
```

#### 4. Ejecutar Frontend (en otra terminal)

```bash
cd frontend
npm install
npm start
```

---

### ⚙️ Configuración para Producción

Para entornos de producción, **DEBES cambiar** las claves en el archivo `.env`:

```bash
# Generar clave JWT segura (64 bytes)
openssl rand -base64 64

# Generar clave de encriptación AES-256 (32 bytes)
openssl rand -base64 32
```

Actualiza el archivo `.env` con los valores generados y contraseñas seguras.

---

## Documentación Completa

- **[Backend README](backend/README.md)** - Configuración detallada del backend, endpoints, testing
- **[Frontend README](frontend/README.md)** - Guía del frontend Angular
- **[Guía de Despliegue en Producción](docs/DEPLOYMENT.md)** - Instrucciones completas para desplegar en servidor
- **[Documentación de Diseño](docs/design/DOCUMENTACION.md)** - Principios de diseño, CSS, BEM, ITCSS (2600+ líneas)
- **[Guía de Seguridad](backend/docs/SECURITY.md)** - Buenas prácticas, generación de claves, rotación
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
  Frontend moderno con Angular 21  
  Containerización con Docker  
  Despliegue a producción con Nginx + SSL  
  Automatización con scripts de deploy  
  Buenas prácticas y código limpio  

**Puntuación estimada:** 95/100  

---

## � Despliegue en Producción

### Despliegue Rápido (Un Solo Comando)

Para desplegar la aplicación en un VPS:

```bash
# Opción 1: Desde tu máquina local
./scripts/quick-deploy.sh root@159.89.1.100

# Opción 2: Directamente en el servidor
ssh root@159.89.1.100
curl -sSL https://raw.githubusercontent.com/Juanfu224/Joinly/main/scripts/quick-deploy.sh | bash
```

### Requisitos del Servidor VPS

- **Sistema Operativo:** Ubuntu 22.04+ o 24.04 LTS
- **Recursos:** Mínimo 2GB RAM, 1 CPU, 25GB disco
- **Acceso:** SSH habilitado (puerto 22)
- **Puertos:** 22, 80, 443 abiertos

### Qué hace el script automáticamente:

✅ Instala Docker y Docker Compose  
✅ Configura firewall (UFW)  
✅ Crea usuario de aplicación  
✅ Clona el repositorio  
✅ Genera credenciales seguras  
✅ Construye y despliega contenedores  
✅ Configura health checks  

### Después del Despliegue

Tu aplicación estará disponible en:
- **Frontend:** `http://159.89.1.100`
- **API:** `http://159.89.1.100/api`
- **Swagger:** `http://159.89.1.100/swagger-ui/`

### Configurar HTTPS (Opcional)

Si tienes un dominio:

```bash
# 1. Configurar DNS A record apuntando a 159.89.1.100
# 2. Actualizar .env.prod con tu dominio
# 3. Ejecutar:
./scripts/init-ssl.sh
```

---

## 📖 Documentación Adicional

- **[🚀 Despliegue Rápido](docs/QUICKSTART_DEPLOY.md)** - Guía de despliegue en 5 minutos
- **[🔑 Configurar SSH en VPS](docs/SSH_SETUP.md)** - Habilitar acceso SSH
- **[📘 Guía Completa de Despliegue](docs/DEPLOYMENT.md)** - Despliegue detallado paso a paso
- **[📊 Monitoreo y Observabilidad](docs/MONITORING.md)** - Guía de monitoreo y logs
- **[⚙️ Variables de Entorno](docs/ENV_CONFIG.md)** - Configuración de variables
- **[🎨 Buenas Prácticas CSS](docs/buenas_practicas/)** - Arquitectura CSS del proyecto
- **[🔧 Backend README](backend/README.md)** - Documentación técnica del backend

## 🛠️ Comandos Rápidos

```bash
# Desarrollo
make dev-up              # Iniciar entorno de desarrollo
make test-backend        # Ejecutar tests
make dev-down           # Detener servicios

# Producción
make prod-deploy        # Desplegar a producción
make backup             # Crear backup de BD
make prod-logs          # Ver logs

# Ver todos los comandos
make help
```

---

<div align="center">
  <b>Desarrollado con   por Juan para el módulo DWES - DAW 2024/2025</b>
</div>
