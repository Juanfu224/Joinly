# Joinly
Sistema de gestión de suscripciones compartidas

## Requisitos
- Java 25
- Docker & Docker Compose
- Node.js 18+
- Maven (incluido con mvnw)

## Configuración Inicial

1. **Copiar archivo de configuración:**
   ```bash
   cp .env.example .env
   ```

2. **Editar `.env` con tus valores reales:**
   - Contraseñas de MySQL
   - Claves JWT: `openssl rand -base64 64`
   - Clave de encriptación: `openssl rand -base64 32`

3. **Inicio rápido (recomendado):**
   ```bash
   ./start-dev.sh
   ```

   O manualmente:
   ```bash
   # Levantar MySQL
   docker-compose up -d
   
   # Backend
   cd backend && ./mvnw spring-boot:run
   
   # Frontend (otra terminal)
   cd frontend && npm install && npm start
   ```

## Stack Tecnológico
- **Backend**: Spring Boot 4.0 + Java 25
- **Frontend**: Angular 19
- **Base de datos**: MySQL 8
- **Seguridad**: JWT + AES-256
