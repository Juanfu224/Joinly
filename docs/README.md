# Documentación de Joinly

Este directorio contiene toda la documentación técnica del proyecto Joinly.

## Índice de Documentación

### Guías de Operaciones

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Guía completa de despliegue en producción
  - Configuración del servidor
  - Instalación de Docker y dependencias
  - Despliegue de la aplicación
  - Configuración de SSL con Let's Encrypt
  - Verificación y troubleshooting
  - Mantenimiento y actualizaciones

- **[SECURITY.md](SECURITY.md)** - Guía de seguridad y mejores prácticas
  - Políticas de seguridad
  - Reporte de vulnerabilidades
  - Mejores prácticas

- **[ENV_CONFIG.md](ENV_CONFIG.md)** - Configuración de variables de entorno
  - Variables requeridas
  - Generación de claves seguras
  - Perfiles de entorno

### Documentación de Diseño

- **[design/DOCUMENTACION.md](design/DOCUMENTACION.md)** - Sistema de diseño completo
  - Arquitectura CSS (BEM + ITCSS)
  - Tokens de diseño
  - Componentes y patrones
  - Guía de estilos

- **[design/event-architecture.md](design/event-architecture.md)** - Arquitectura de eventos
  - Sistema de eventos del frontend
  - Patrones de comunicación
  - Diagramas de flujo

### Buenas Prácticas

- **[buenas_practicas/HTML5-semantico-la-base-de-todo.md](buenas_practicas/HTML5-semantico-la-base-de-todo.md)**
  - HTML5 semántico
  - Accesibilidad
  - SEO

- **[buenas_practicas/css-moderno-arquitectura-y-organizacion.md](buenas_practicas/css-moderno-arquitectura-y-organizacion.md)**
  - Arquitectura CSS moderna
  - Metodologías y organización
  - Optimización de rendimiento

### Planificación y Desarrollo

- **[TODO.md](TODO.md)** - Lista de tareas y roadmap
  - Estado del proyecto
  - Tareas completadas
  - Tareas pendientes

## Documentación Adicional

### Backend

Consulta la documentación específica del backend en:
- [backend/README.md](../backend/README.md)
- [backend/docs/](../backend/docs/)

### Frontend

Consulta la documentación específica del frontend en:
- [frontend/README.md](../frontend/README.md)

## Scripts Disponibles

Los scripts de automatización se encuentran en el directorio `scripts/`:

- `deploy.sh` - Despliegue de la aplicación en producción
- `init-ssl.sh` - Configuración de certificados SSL
- `backup.sh` - Backup de base de datos
- `restore.sh` - Restauración de base de datos
- `setup-server.sh` - Configuración automática del servidor

Consulta [DEPLOYMENT.md](DEPLOYMENT.md) para información detallada sobre el uso de estos scripts.

## Soporte

Para reportar problemas o solicitar ayuda:

1. Revisar la documentación existente
2. Consultar los logs de la aplicación
3. Crear un issue en el repositorio de GitHub

## Contribución

Para contribuir a la documentación:

1. Mantener el formato Markdown consistente
2. Actualizar el índice cuando se agreguen nuevos documentos
3. Seguir las guías de estilo del proyecto
4. Incluir ejemplos y comandos cuando sea relevante
