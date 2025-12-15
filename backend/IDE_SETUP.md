# Configuración del IDE para Joinly

## VS Code

### Opción 1: Usar Launch Configuration (Recomendado)
1. Abre el workspace en VS Code desde la carpeta `backend/`
2. Ve a Run → Open Configurations
3. Usa la configuración "Run Joinly Application"
4. Presiona F5

### Opción 2: Configurar Variables de Entorno
1. Abre VS Code desde `backend/` directorio
2. Instala la extensión "Extension Pack for Java" si no la tienes
3. El archivo `.vscode/launch.json` ya está configurado para cargar el `.env`

### Opción 3: Ejecutar desde Terminal Integrada
```bash
cd backend
./mvnw spring-boot:run
```

## IntelliJ IDEA

### Configuración de Run/Debug
1. Run → Edit Configurations
2. Clic en `+` → Spring Boot
3. Configurar:
   - **Name**: Joinly Application
   - **Main class**: `com.alberti.joinly.JoinlyApplication`
   - **Working directory**: `$PROJECT_DIR$/backend` (o la ruta absoluta al backend)
   - **Environment variables**: Clic en "..." y carga el archivo `.env`
     - O manualmente: Copia todas las variables del `.env` aquí

### Plugin EnvFile (Alternativa)
1. Instala el plugin "EnvFile"
2. En Run Configuration:
   - EnvFile tab → Habilitar
   - Add → .env file
   - Seleccionar `backend/.env`

## Eclipse

### Configuración de Launch
1. Run → Run Configurations
2. Java Application → New Configuration
3. En "Environment" tab:
   - Clic "Import" o "Add" para cada variable del `.env`
   - O configura Working Directory como `${workspace_loc}/backend`

## Verificación

Después de configurar, verifica que veas este mensaje al iniciar:
```
INFO: Successfully loaded XX variables from .env file (location: ...)
```

## Troubleshooting

### Error "Illegal base64 character"
- **Causa**: El IDE no está cargando el `.env`
- **Solución**: 
  1. Verifica que el Working Directory sea `backend/`
  2. Asegúrate que el `.env` existe y tiene las claves correctas
  3. Reinicia el IDE después de cambiar configuraciones

### El .env no se carga
- **Causa**: Working directory incorrecto
- **Solución**: 
  1. En la configuración de ejecución, establece Working Directory a la carpeta `backend/`
  2. O ejecuta desde terminal: `cd backend && ./mvnw spring-boot:run`

### Variables no actualizadas
- **Causa**: Caché del IDE
- **Solución**:
  1. Build → Rebuild Project
  2. Invalidate Caches / Restart (IntelliJ)
  3. O ejecuta: `./mvnw clean compile`
