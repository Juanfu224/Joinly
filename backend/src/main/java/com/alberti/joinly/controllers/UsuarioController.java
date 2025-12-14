package com.alberti.joinly.controllers;

import com.alberti.joinly.dto.usuario.UpdatePerfilRequest;
import com.alberti.joinly.dto.usuario.UsuarioResponse;
import com.alberti.joinly.services.UsuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    @Operation(summary = "Actualizar perfil")
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
                request.avatar());

        return ResponseEntity.ok(UsuarioResponse.fromEntity(usuario));
    }

    @GetMapping("/buscar")
    @Operation(summary = "Buscar usuarios por nombre")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista de usuarios encontrados")
    })
    public ResponseEntity<List<UsuarioResponse>> buscarPorNombre(
            @Parameter(description = "Nombre a buscar") @RequestParam String nombre) {

        var usuarios = usuarioService.buscarPorNombre(nombre)
                .stream()
                .map(UsuarioResponse::fromEntity)
                .toList();

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
}
