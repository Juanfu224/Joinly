package com.alberti.joinly.controllers;

import com.alberti.joinly.dto.usuario.PreferenciasNotificacionDTO;
import com.alberti.joinly.dto.usuario.UpdatePerfilRequest;
import com.alberti.joinly.dto.usuario.UsuarioResponse;
import com.alberti.joinly.security.UserPrincipal;
import com.alberti.joinly.services.UsuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/usuarios")
@RequiredArgsConstructor
@Tag(name = "Usuarios", description = "Gestión de perfiles de usuario")
public class UsuarioController {

    private final UsuarioService usuarioService;

    @GetMapping("/{id}")
    @Operation(summary = "Obtener perfil de usuario")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Perfil encontrado"),
            @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
    })
    public ResponseEntity<UsuarioResponse> getPerfil(
            @Parameter(description = "ID del usuario") @PathVariable Long id) {

        var usuario = usuarioService.buscarPorId(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado con ID: " + id));

        return ResponseEntity.ok(UsuarioResponse.fromEntity(usuario));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar perfil completo")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Perfil actualizado exitosamente"),
            @ApiResponse(responseCode = "400", description = "Datos de entrada inválidos"),
            @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
    })
    public ResponseEntity<UsuarioResponse> updatePerfil(
            @Parameter(description = "ID del usuario") @PathVariable Long id,
            @Valid @RequestBody UpdatePerfilRequest request) {

        var usuario = usuarioService.actualizarPerfil(
                id,
                request.nombre(),
                request.telefono(),
                request.avatar(),
                request.temaPreferido());

        return ResponseEntity.ok(UsuarioResponse.fromEntity(usuario));
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Actualizar perfil parcialmente",
            description = "Actualiza solo los campos proporcionados. Útil para cambiar preferencias como el tema.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Perfil actualizado exitosamente"),
            @ApiResponse(responseCode = "400", description = "Datos de entrada inválidos"),
            @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
    })
    public ResponseEntity<UsuarioResponse> patchPerfil(
            @Parameter(description = "ID del usuario") @PathVariable Long id,
            @Valid @RequestBody UpdatePerfilRequest request) {

        var usuario = usuarioService.actualizarPerfil(
                id,
                request.nombre(),
                request.telefono(),
                request.avatar(),
                request.temaPreferido());

        return ResponseEntity.ok(UsuarioResponse.fromEntity(usuario));
    }

    @GetMapping("/buscar")
    @Operation(
            summary = "Buscar usuarios por nombre",
            description = "Busca usuarios por nombre con paginación. " +
                    "Parámetros: page (número de página, base 0), size (elementos por página), " +
                    "sort (campo,dirección ej: nombre,asc)"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Página de usuarios encontrados")
    })
    public ResponseEntity<Page<UsuarioResponse>> buscarPorNombre(
            @Parameter(description = "Nombre a buscar") @RequestParam String nombre,
            @PageableDefault(size = 10, sort = "nombre") Pageable pageable) {

        var usuarios = usuarioService.buscarPorNombrePaginado(nombre, pageable)
                .map(UsuarioResponse::fromEntity);

        return ResponseEntity.ok(usuarios);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Desactivar cuenta (soft delete)")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Cuenta desactivada exitosamente"),
            @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
    })
    public ResponseEntity<Void> desactivarCuenta(
            @Parameter(description = "ID del usuario") @PathVariable Long id) {

        usuarioService.desactivarUsuario(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/preferencias-notificaciones")
    @Operation(
            summary = "Obtener preferencias de notificaciones",
            description = "Obtiene las preferencias de notificaciones del usuario",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Preferencias obtenidas exitosamente"),
            @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
    })
    public ResponseEntity<PreferenciasNotificacionDTO> getPreferenciasNotificacion(
            @Parameter(description = "ID del usuario") @PathVariable Long id) {

        var preferencias = usuarioService.obtenerPreferenciasNotificacion(id);
        return ResponseEntity.ok(preferencias);
    }

    @PutMapping("/{id}/preferencias-notificaciones")
    @Operation(
            summary = "Actualizar preferencias de notificaciones",
            description = "Actualiza las preferencias de notificaciones del usuario",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Preferencias actualizadas exitosamente"),
            @ApiResponse(responseCode = "400", description = "Datos de entrada inválidos"),
            @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
    })
    public ResponseEntity<PreferenciasNotificacionDTO> updatePreferenciasNotificacion(
            @Parameter(description = "ID del usuario") @PathVariable Long id,
            @Valid @RequestBody PreferenciasNotificacionDTO preferencias) {

        var preferenciasActualizadas = usuarioService.actualizarPreferenciasNotificacion(id, preferencias);
        return ResponseEntity.ok(preferenciasActualizadas);
    }
}
