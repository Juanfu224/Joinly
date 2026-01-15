# Documentación de Joinly

Este directorio contiene toda la documentación técnica del proyecto Joinly.

## 📚 Índice de Documentación

### 🚀 Guías de Operaciones

| Documento | Descripción |
|-----------|-------------|
| **[DEPLOYMENT.md](DEPLOYMENT.md)** | Guía completa de despliegue en producción |
| **[SECURITY.md](SECURITY.md)** | Guía de seguridad y mejores prácticas |

### 🎨 Documentación de Diseño

| Documento | Descripción |
|-----------|-------------|
| **[design/DOCUMENTACION.md](design/DOCUMENTACION.md)** | Sistema de diseño completo (BEM + ITCSS, tokens, componentes) |
| **[design/event-architecture.md](design/event-architecture.md)** | Arquitectura de eventos del frontend |

### 💻 Documentación Frontend (Angular 21)

| Documento | Descripción | Fase |
|-----------|-------------|------|
| **[frontend/README.md](frontend/README.md)** | Índice completo de documentación frontend | - |
| **[frontend/HTTP_API.md](frontend/HTTP_API.md)** | Integración HTTP, endpoints y API REST | Fase 5 |
| **[frontend/HTTP_IMPLEMENTATION_SUMMARY.md](frontend/HTTP_IMPLEMENTATION_SUMMARY.md)** | Resumen de implementación HTTP | Fase 5 |
| **[frontend/NAVIGATION.md](frontend/NAVIGATION.md)** | Sistema de navegación y rutas completo | Fase 4 |
| **[frontend/NAVIGATION_EXAMPLES.md](frontend/NAVIGATION_EXAMPLES.md)** | Ejemplos de navegación programática | Fase 4 |
| **[frontend/LAZY_LOADING.md](frontend/LAZY_LOADING.md)** | Estrategia de lazy loading y chunks | Fase 4 |
| **[frontend/NAVIGATION_QUICKSTART.md](frontend/NAVIGATION_QUICKSTART.md)** | Guía rápida de referencia | Fase 4 |
| **[frontend/NAVIGATION_SUMMARY.md](frontend/NAVIGATION_SUMMARY.md)** | Resumen de navegación completada | Fase 4 |

### 📖 Buenas Prácticas

| Documento | Descripción |
|-----------|-------------|
| **[buenas_practicas/HTML5-semantico-la-base-de-todo.md](buenas_practicas/HTML5-semantico-la-base-de-todo.md)** | HTML5 semántico, accesibilidad y SEO |
| **[buenas_practicas/css-moderno-arquitectura-y-organizacion.md](buenas_practicas/css-moderno-arquitectura-y-organizacion.md)** | Arquitectura CSS moderna y organización |

---

## 📂 Estructura del directorio

```
docs/
├── README.md                  # Este archivo (índice principal)
├── DEPLOYMENT.md              # Guía de despliegue
├── SECURITY.md                # Guía de seguridad
├── buenas_practicas/          # Guías de buenas prácticas
│   ├── HTML5-semantico-la-base-de-todo.md
│   └── css-moderno-arquitectura-y-organizacion.md
├── design/                    # Documentación de diseño
│   ├── DOCUMENTACION.md       # Sistema de diseño
│   ├── event-architecture.md  # Arquitectura de eventos
│   └── images/                # Imágenes y diagramas
└── frontend/                  # Documentación técnica Angular
    ├── README.md              # Índice frontend
    ├── HTTP_API.md            # API REST y HTTP (Fase 5)
    ├── HTTP_IMPLEMENTATION_SUMMARY.md
    ├── NAVIGATION.md          # Navegación (Fase 4)
    ├── NAVIGATION_EXAMPLES.md
    ├── NAVIGATION_QUICKSTART.md
    ├── NAVIGATION_SUMMARY.md
    └── LAZY_LOADING.md
```

---

## 🔗 Documentación Adicional

### Backend (Spring Boot)

| Documento | Descripción |
|-----------|-------------|
| [../backend/README.md](../backend/README.md) | Documentación principal del backend |
| [../backend/docs/SECURITY.md](../backend/docs/SECURITY.md) | Seguridad del backend |
| [../backend/docs/TODO_MEJORAS.md](../backend/docs/TODO_MEJORAS.md) | Mejoras pendientes |

### Infraestructura

| Documento | Descripción |
|-----------|-------------|
| [../scripts/README.md](../scripts/README.md) | Scripts de automatización |
| [../nginx/README.md](../nginx/README.md) | Configuración de Nginx |

---

## 📊 Resumen por Fases (DWEC)

### Fase 4: Enrutamiento y Navegación SPA ✅

- 16 rutas implementadas con lazy loading
- Guards funcionales (authGuard, pendingChangesGuard)
- Resolvers para precarga de datos
- Breadcrumbs dinámicos
- **Documentación**: `frontend/NAVIGATION*.md`, `frontend/LAZY_LOADING.md`

### Fase 5: Servicios y Comunicación HTTP ✅

- 4 interceptores HTTP funcionales
- 13 endpoints REST documentados
- 25+ interfaces TypeScript
- Manejo de errores en 3 capas
- **Documentación**: `frontend/HTTP_API.md`, `frontend/HTTP_IMPLEMENTATION_SUMMARY.md`

---

## 🛠️ Scripts Disponibles

Los scripts de automatización se encuentran en `scripts/`:

| Script | Descripción |
|--------|-------------|
| `deploy.sh` | Despliegue en producción |
| `init-ssl.sh` | Configuración de certificados SSL |
| `backup.sh` | Backup de base de datos |
| `restore.sh` | Restauración de base de datos |
| `setup-server.sh` | Configuración automática del servidor |

Consulta [DEPLOYMENT.md](DEPLOYMENT.md) para información detallada.

---

## 🤝 Contribución

Para contribuir a la documentación:

1. Mantener el formato Markdown consistente
2. Actualizar el índice cuando se agreguen nuevos documentos
3. Seguir las guías de estilo del proyecto
4. Incluir ejemplos y comandos cuando sea relevante

---

**Última actualización**: 15 de enero de 2026  
**Versión del proyecto**: 1.0.0
