# Joinly
Sistema de gestión de suscripciones compartidas

## Requisitos
- Java 25
- Docker & Docker Compose
- Node.js 18+
- Maven (incluido con mvnw)

## Configuración

1. **Variables de entorno:**
   ```bash
   cp .env.example .env
   ```
   Editar `.env` con valores reales:
   - Contraseñas de MySQL
   - JWT secret: `openssl rand -base64 64`
   - Encryption key: `openssl rand -base64 32`

## Ejecución

1. **Base de datos:**
   ```bash
   docker-compose up -d
   ```

2. **Backend:**
   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```

3. **Frontend:**
   ```bash
   cd frontend
   npm install
   npm start
   ```

## Stack
- **Backend**: Spring Boot 4.0 + Java 25
- **Frontend**: Angular 19
- **Base de datos**: MySQL 8
- **Seguridad**: JWT + AES-256
