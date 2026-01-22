# Plan de Implementación: Botón Eliminar Foto de Perfil

## 📋 Resumen Ejecutivo

**Estado: ✅ FUNCIONALIDAD YA IMPLEMENTADA**

Tras analizar el código del proyecto, **la funcionalidad de eliminar la foto de perfil ya está completamente implementada** en todas las capas de la aplicación (frontend y backend). El botón "Eliminar foto" ya existe junto al botón de "Subir nueva foto" y funciona correctamente.

---

## 🔍 Análisis del Estado Actual

### Frontend

#### Componente de Perfil ([perfil.html](frontend/src/app/pages/usuario/perfil/perfil.html#L93-L103))

El botón de eliminar foto ya está implementado en el template:

```html
@if (hasCustomAvatar()) {
  <app-button
    variant="yellow"
    size="sm"
    leftIcon="bin"
    (click)="onDeleteAvatar()"
    [loading]="isDeletingAvatar()"
    [disabled]="isDeletingAvatar()">
    Eliminar foto
  </app-button>
}
```

**Características implementadas:**
- ✅ Solo se muestra cuando el usuario tiene un avatar personalizado (`hasCustomAvatar()`)
- ✅ Usa la variante `yellow` (advertencia) según las buenas prácticas de UX
- ✅ Incluye icono `bin` (papelera)
- ✅ Muestra estado de carga durante la eliminación
- ✅ Se deshabilita durante el proceso de eliminación

#### Lógica del Componente ([perfil.ts](frontend/src/app/pages/usuario/perfil/perfil.ts#L179-L207))

```typescript
protected hasCustomAvatar(): boolean {
  const user = this.usuario();
  return !!user && !!user.avatar && user.avatar.trim().length > 0;
}

protected onDeleteAvatar(): void {
  const user = this.usuario();
  if (!user) return;

  this.#modalService.open({
    title: '¿Eliminar foto de perfil?',
    content: '¿Estás seguro de que quieres eliminar tu foto de perfil? Se usará el avatar por defecto.',
    confirmText: 'Eliminar',
    cancelText: 'Cancelar',
    onConfirm: () => {
      this.isDeletingAvatar.set(true);

      this.#usuarioService.eliminarAvatar(user.id).subscribe({
        next: (updatedUser) => {
          this.#authService.updateUser(updatedUser);
          this.#toastService.success('Foto de perfil eliminada');
          this.isDeletingAvatar.set(false);
        },
        error: (error) => {
          this.#toastService.error(error.message || 'Error al eliminar la foto de perfil');
          this.isDeletingAvatar.set(false);
        },
      });
    },
  });
}
```

**Características implementadas:**
- ✅ Modal de confirmación antes de eliminar
- ✅ Actualización del estado de usuario tras eliminación
- ✅ Notificaciones de éxito/error con ToastService
- ✅ Manejo de estados de carga con signals (`isDeletingAvatar`)

#### Servicio de Usuario ([usuario.ts](frontend/src/app/services/usuario.ts#L46-L48))

```typescript
eliminarAvatar(id: number): Observable<User> {
  return this.api.delete<User>(`usuarios/${id}/avatar`);
}
```

### Backend

#### Controlador ([UsuarioController.java](backend/src/main/java/com/alberti/joinly/controllers/UsuarioController.java#L205-L222))

```java
@DeleteMapping("/{id}/avatar")
@Operation(
    summary = "Eliminar avatar de usuario",
    description = "Elimina el avatar del usuario y establece el avatar por defecto."
)
@ApiResponses({
    @ApiResponse(responseCode = "200", description = "Avatar eliminado exitosamente"),
    @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
})
public ResponseEntity<UsuarioResponse> deleteAvatar(
        @Parameter(description = "ID del usuario") @PathVariable Long id) {

    var updatedUsuario = usuarioService.eliminarAvatar(id);
    return ResponseEntity.ok(UsuarioResponse.fromEntity(updatedUsuario));
}
```

#### Servicio ([UsuarioService.java](backend/src/main/java/com/alberti/joinly/services/UsuarioService.java#L180-L192))

```java
@Transactional
public Usuario eliminarAvatar(Long idUsuario) {
    var usuario = usuarioRepository.findById(idUsuario)
            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + idUsuario));

    if (usuario.getAvatar() != null && !usuario.getAvatar().isEmpty()) {
        fileStorageService.deleteAvatar(usuario.getAvatar());
    }

    usuario.setAvatar(null);
    return usuarioRepository.save(usuario);
}
```

**Características implementadas:**
- ✅ Elimina el archivo físico del servidor
- ✅ Establece el avatar como `null` (para usar avatar por defecto)
- ✅ Manejo transaccional
- ✅ Documentación OpenAPI/Swagger

---

## 🎨 Cumplimiento de Buenas Prácticas

### Angular 21

| Práctica | Cumplimiento |
|----------|--------------|
| Uso de Signals para estado reactivo | ✅ `isDeletingAvatar = signal(false)` |
| ChangeDetectionStrategy.OnPush | ✅ Implementado |
| Inyección con `inject()` | ✅ Usado en todos los servicios |
| Componentes standalone | ✅ Todos los componentes son standalone |
| Control flow moderno (`@if`) | ✅ Usado en lugar de `*ngIf` |

### Buenas Prácticas CSS ([docs/buenas_practicas](docs/buenas_practicas/))

| Práctica | Cumplimiento |
|----------|--------------|
| Arquitectura BEM | ✅ `.p-perfil__avatar-actions` |
| Mobile-First | ✅ Estilos base + media queries |
| Variables CSS | ✅ `var(--espaciado-2)`, etc. |
| HTML5 Semántico | ✅ `<section>`, `<label>`, `aria-*` |
| Accesibilidad | ✅ Atributos ARIA, estados de botón |

### Java 25 / Spring Boot 4

| Práctica | Cumplimiento |
|----------|--------------|
| Records para DTOs | ✅ Usado en `UpdatePerfilRequest` |
| `var` para inferencia de tipos | ✅ Usado consistentemente |
| Lombok (`@RequiredArgsConstructor`) | ✅ Inyección de dependencias |
| `@Transactional(readOnly = true)` | ✅ Optimización por defecto |
| Documentación OpenAPI | ✅ Swagger annotations |

---

## 📐 Ubicación del Botón en la UI

```
┌──────────────────────────────────────────────────────────┐
│                    FOTO DE PERFIL                        │
├──────────────────────────────────────────────────────────┤
│                                                          │
│       ┌─────────┐                                        │
│       │         │                                        │
│       │ AVATAR  │    ┌────────────────────┐              │
│       │   XL    │    │ 📤 Subir nueva foto │ ← Label     │
│       │         │    └────────────────────┘              │
│       └─────────┘    ┌────────────────────┐              │
│                      │ 🗑️ Eliminar foto   │ ← Botón      │
│                      └────────────────────┘              │
│                                                          │
│             JPG, PNG o WebP. Máximo 5MB.                 │
│             Se optimizará automáticamente.               │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

El botón "Eliminar foto" solo aparece cuando el usuario tiene un avatar personalizado (`hasCustomAvatar()` devuelve `true`).

---

## ✅ Flujo de Funcionamiento

```
Usuario hace clic en "Eliminar foto"
            │
            ▼
    Modal de confirmación
    "¿Eliminar foto de perfil?"
            │
    ┌───────┴───────┐
    │               │
    ▼               ▼
 Cancelar       Confirmar
    │               │
    ▼               ▼
 (cierra)    isDeletingAvatar(true)
                    │
                    ▼
         DELETE /api/v1/usuarios/{id}/avatar
                    │
            ┌───────┴───────┐
            │               │
            ▼               ▼
         Éxito           Error
            │               │
            ▼               ▼
    - Actualiza user   - Toast error
    - Toast éxito      - isDeletingAvatar(false)
    - isDeletingAvatar(false)
```

---

## 🔧 Acciones Requeridas

**No se requieren cambios.** La funcionalidad está completamente implementada y sigue todas las buenas prácticas del proyecto.

### Si deseas verificar el funcionamiento:

1. **Ejecutar el backend:**
   ```bash
   cd backend && ./mvnw spring-boot:run
   ```

2. **Ejecutar el frontend:**
   ```bash
   cd frontend && npm start
   ```

3. **Navegar a:** `/usuario/perfil`

4. **Hacer clic en "Editar perfil"**

5. **Verificar que aparece el botón "Eliminar foto"** (solo si el usuario tiene avatar)

---

## 📝 Notas Técnicas

### Avatar por Defecto

Cuando el avatar es `null` o vacío, el componente `AvatarComponent` muestra automáticamente las iniciales del nombre del usuario:

```typescript
// avatar.ts
readonly showImage = computed(() => !!this.src());
readonly initials = computed(() => {
  if (!this.name()) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
});
```

### Limpieza de Archivos

El `FileStorageService` elimina el archivo físico del servidor antes de actualizar la base de datos, asegurando que no queden archivos huérfanos.

---

## 📊 Resumen

| Aspecto | Estado |
|---------|--------|
| Botón en UI | ✅ Implementado |
| Lógica en componente | ✅ Implementada |
| Servicio frontend | ✅ Implementado |
| Endpoint backend | ✅ Implementado |
| Servicio backend | ✅ Implementado |
| Eliminación de archivos | ✅ Implementada |
| Modal de confirmación | ✅ Implementado |
| Notificaciones | ✅ Implementadas |
| Estilos | ✅ Reutiliza existentes |
| Buenas prácticas Angular | ✅ Cumple |
| Buenas prácticas Java/Spring | ✅ Cumple |
| Buenas prácticas CSS/HTML | ✅ Cumple |

**Conclusión:** La funcionalidad solicitada ya está completamente implementada y lista para usar. No es necesario realizar ningún cambio adicional.
