# Pruebas de Navegación por Teclado — Joinly

> Documentación de pruebas manuales de navegación por teclado

**Fecha de pruebas:** 15 de febrero de 2026

---

## Metodología

1. Desconectar el ratón
2. Navegar exclusivamente con teclado (Tab, Shift+Tab, Enter, Espacio, Flechas, Escape)
3. Verificar que TODO elemento interactivo es accesible
4. Verificar que el indicador de foco es visible en todo momento
5. Documentar cualquier problema encontrado

---

## Resumen de resultados

| Flujo | Estado | Problemas |
|-------|--------|-----------|
| Público (home, como-funciona, FAQ) | Pass | Ninguno |
| Autenticación (login, register) | Pass | Ninguno |
| Dashboard | Pass | Ninguno |
| Gestión de grupos | Pass | Ninguno |
| Gestión de suscripciones | Pass | Ninguno |
| Perfil de usuario | Pass | Ninguno |
| Configuración | Pass | Ninguno |
| Notificaciones | Pass | Ninguno |

---

## Detalle por flujo

### Flujo público

#### Home (`/`)

| Elemento | Acción | Resultado |
|----------|--------|-----------|
| Skip link | Tab | Aparece como primer foco |
| Skip link | Enter | Salta al contenido principal |
| Navegación | Tab | Navega por todos los enlaces |
| Botones CTA | Tab + Enter | Focus visible, acción ejecuta |
| Footer | Tab | Enlaces accesibles |

#### Como funciona (`/como-funciona`)

| Elemento | Acción | Resultado |
|----------|--------|-----------|
| Secciones | Tab | Navegación correcta |
| Tarjetas de características | Tab | Focus visible |

#### FAQ (`/faq`)

| Elemento | Acción | Resultado |
|----------|--------|-----------|
| Acordeones | Tab | Focus en cada acordeón |
| Acordeones | Enter / Espacio | Abre/cierra correctamente |
| Acordeones | Tab | Navega al siguiente |

---

### Flujo de autenticación

#### Login (`/login`)

| Elemento | Acción | Resultado |
|----------|--------|-----------|
| Campo email | Tab | Focus visible |
| Campo password | Tab | Focus visible |
| Toggle password | Tab + Enter | Muestra/oculta contraseña |
| Botón submit | Tab + Enter | Envía formulario |
| Link "Olvidé contraseña" | Tab + Enter | Navega correctamente |
| Mensajes de error | Automático | Se anuncian con role="alert" |

#### Register (`/register`)

| Elemento | Acción | Resultado |
|----------|--------|-----------|
| Campos formulario | Tab | Focus visible en cada campo |
| Checkbox términos | Tab + Espacio | Activa/desactiva |
| Botón submit | Tab + Enter | Envía formulario |
| Errores de validación | Automático | Se anuncian |

---

### Flujo autenticado

#### Dashboard (`/dashboard`)

| Elemento | Acción | Resultado |
|----------|--------|-----------|
| Menú usuario | Tab + Enter | Abre dropdown |
| Opciones dropdown | Flechas | Navega entre opciones |
| Cerrar dropdown | Escape | Cierra dropdown |
| Tarjetas de grupo | Tab | Focus visible |
| Tarjetas de grupo | Enter | Navega al detalle |
| Botón crear grupo | Tab + Enter | Navega al formulario |

#### Crear grupo (`/crear-grupo`)

| Elemento | Acción | Resultado |
|----------|--------|-----------|
| Campos formulario | Tab | Focus visible |
| Validación en vivo | Automático | Errores se anuncian |
| Botón crear | Tab + Enter | Envía formulario |

#### Detalle de grupo (`/grupos/:id`)

| Elemento | Acción | Resultado |
|----------|--------|-----------|
| Tabs | Tab + Flechas ←→ | Cambia entre tabs |
| Tabs | Home / End | Primero/último tab |
| Filtros | Tab | Focus en cada filtro |
| Tarjetas suscripción | Tab + Enter | Navega al detalle |
| Botón invitar | Tab + Enter | Abre modal |
| Modal | Escape | Cierra modal |
| Modal | Tab | Focus trap funciona |

#### Crear suscripción (`/grupos/:id/crear-suscripcion`)

| Elemento | Acción | Resultado |
|----------|--------|-----------|
| Campos formulario | Tab | Focus visible |
| Selector de servicio | Tab + Flechas | Navega opciones |
| Botón crear | Tab + Enter | Envía formulario |

---

### Flujo de usuario

#### Perfil (`/usuario/perfil`)

| Elemento | Acción | Resultado |
|----------|--------|-----------|
| Botón editar | Tab + Enter | Entra en modo edición |
| Campo nombre | Tab | Focus visible |
| Campo teléfono | Tab | Focus visible |
| Subir avatar | Tab + Enter | Abre selector archivo |
| Botón guardar | Tab + Enter | Guarda cambios |
| Botón cancelar | Tab + Enter | Cancela edición |

#### Configuración (`/usuario/configuracion`)

| Elemento | Acción | Resultado |
|----------|--------|-----------|
| Toggle tema | Tab + Enter | Cambia tema claro/oscuro |
| Botón cambiar contraseña | Tab + Enter | Abre modal |
| Modal contraseña | Escape | Cierra modal |

#### Notificaciones (`/usuario/notificaciones`)

| Elemento | Acción | Resultado |
|----------|--------|-----------|
| Switches notificación | Tab + Espacio | Activa/desactiva |
| Todos los switches | Tab | Navegación correcta |

#### Mis solicitudes (`/usuario/solicitudes`)

| Elemento | Acción | Resultado |
|----------|--------|-----------|
| Filtros | Tab | Focus visible |
| Filtros tipo toggle | Tab + Enter | Activa/desactiva |
| Tarjetas solicitud | Tab | Focus visible |
| Botones acción | Tab + Enter | Ejecutan acción |

---

## Componentes interactivos verificados

| Componente | Tab | Enter | Espacio | Flechas | Escape | Focus visible |
|------------|-----|-------|---------|---------|--------|---------------|
| Button | Si | Si | - | - | - | Si |
| Link | Si | Si | - | - | - | Si |
| Input | Si | - | - | - | - | Si |
| Textarea | Si | - | - | - | - | Si |
| Select | Si | Si | - | Si | - | Si |
| Checkbox | Si | - | Si | - | - | Si |
| Radio | Si | - | Si | Si | - | Si |
| Tabs | Si | Si | - | Si | - | Si |
| Accordion | Si | Si | Si | - | - | Si |
| Modal | - | - | - | - | Si | Si |
| Dropdown | Si | Si | - | Si | Si | Si |
| Pagination | Si | Si | - | - | - | Si |
| Toast | Si | Si | - | - | - | Si |
| Theme toggle | Si | Si | Si | - | - | Si |

---

## Problemas encontrados y resueltos

| Problema | Estado | Solución |
|----------|--------|----------|
| Sin skip link | Resuelto | Implementado en app.html |
| Focus visible insuficiente | Resuelto | Añadido :focus-visible en todos los componentes |
| Modales sin focus trap | Ya implementado | Focus trap funcionando |
| Breadcrumbs sin aria-current | Ya implementado | aria-current="page" en página actual |

---

## Recomendaciones

1. **Mantener pruebas regulares**: Ejecutar pruebas de teclado antes de cada release
2. **Automatizar con axe-core**: Los tests de accesibilidad detectan muchos problemas
3. **Documentar cambios**: Si se añaden nuevos componentes interactivos, actualizar esta guía

---

## Próximos pasos

- [x] Añadir focus management para navegación SPA (implementado via `FocusManagementService`)
- [ ] Probar con diferentes navegadores (Firefox, Safari)
- [ ] Probar en dispositivos móviles con teclado externo
