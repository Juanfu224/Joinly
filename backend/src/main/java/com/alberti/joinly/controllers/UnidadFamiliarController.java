package com.alberti.joinly.controllers;

import com.alberti.joinly.dto.unidad.CreateUnidadRequest;
import com.alberti.joinly.dto.unidad.MiembroUnidadResponse;
import com.alberti.joinly.dto.unidad.UnidadFamiliarResponse;
import com.alberti.joinly.services.UnidadFamiliarService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/unidades")
@RequiredArgsConstructor
@Tag(name = "Unidades Familiares", description = "Gestión de grupos/unidades familiares")
public class UnidadFamiliarController {

    private final UnidadFamiliarService unidadFamiliarService;

    @PostMapping
    @Operation(summary = "Crear unidad familiar")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Unidad familiar creada exitosamente"),
            @ApiResponse(responseCode = "400", description = "Datos de entrada inválidos"),
            @ApiResponse(responseCode = "422", description = "Límite de grupos alcanzado")
    })
    public ResponseEntity<UnidadFamiliarResponse> crearUnidad(
            @Parameter(description = "ID del usuario administrador", required = true) @RequestHeader("X-User-Id") Long idUsuario,
            @Valid @RequestBody CreateUnidadRequest request) {

        var unidad = unidadFamiliarService.crearUnidadFamiliar(
                idUsuario,
                request.nombre(),
                request.descripcion());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(UnidadFamiliarResponse.fromEntity(unidad));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener unidad familiar por ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Unidad encontrada"),
            @ApiResponse(responseCode = "404", description = "Unidad no encontrada")
    })
    public ResponseEntity<UnidadFamiliarResponse> getUnidad(
            @Parameter(description = "ID de la unidad") @PathVariable Long id) {

        var unidad = unidadFamiliarService.buscarPorId(id)
                .orElseThrow(() -> new IllegalArgumentException("Unidad familiar no encontrada con ID: " + id));

        return ResponseEntity.ok(UnidadFamiliarResponse.fromEntity(unidad));
    }

    @GetMapping("/codigo/{codigoInvitacion}")
    @Operation(summary = "Buscar por código de invitación")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Unidad encontrada"),
            @ApiResponse(responseCode = "404", description = "Código de invitación inválido")
    })
    public ResponseEntity<UnidadFamiliarResponse> getUnidadPorCodigo(
            @Parameter(description = "Código de invitación de 12 caracteres") @PathVariable String codigoInvitacion) {

        var unidad = unidadFamiliarService.buscarPorCodigo(codigoInvitacion)
                .orElseThrow(() -> new IllegalArgumentException("Código de invitación inválido"));

        return ResponseEntity.ok(UnidadFamiliarResponse.fromEntity(unidad));
    }

    @GetMapping("/administradas")
    @Operation(summary = "Listar grupos administrados")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista de grupos")
    })
    public ResponseEntity<List<UnidadFamiliarResponse>> listarGruposAdministrados(
            @Parameter(description = "ID del usuario") @RequestHeader("X-User-Id") Long idUsuario) {

        var unidades = unidadFamiliarService.listarGruposAdministrados(idUsuario)
                .stream()
                .map(UnidadFamiliarResponse::fromEntity)
                .toList();

        return ResponseEntity.ok(unidades);
    }

    @GetMapping("/miembro")
    @Operation(summary = "Listar grupos como miembro")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista de grupos")
    })
    public ResponseEntity<List<UnidadFamiliarResponse>> listarGruposDondeSoyMiembro(
            @Parameter(description = "ID del usuario") @RequestHeader("X-User-Id") Long idUsuario) {

        var unidades = unidadFamiliarService.listarGruposDondeEsMiembro(idUsuario)
                .stream()
                .map(UnidadFamiliarResponse::fromEntity)
                .toList();

        return ResponseEntity.ok(unidades);
    }

    @GetMapping("/{id}/miembros")
    @Operation(summary = "Listar miembros activos")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista de miembros"),
            @ApiResponse(responseCode = "404", description = "Unidad no encontrada")
    })
    public ResponseEntity<List<MiembroUnidadResponse>> listarMiembros(
            @Parameter(description = "ID de la unidad") @PathVariable Long id) {

        var miembros = unidadFamiliarService.listarMiembrosActivos(id)
                .stream()
                .map(MiembroUnidadResponse::fromEntity)
                .toList();

        return ResponseEntity.ok(miembros);
    }

    @DeleteMapping("/{idUnidad}/miembros/{idUsuario}")
    @Operation(summary = "Expulsar miembro")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Miembro expulsado exitosamente"),
            @ApiResponse(responseCode = "403", description = "Solo el administrador puede expulsar miembros"),
            @ApiResponse(responseCode = "404", description = "Unidad o miembro no encontrado")
    })
    public ResponseEntity<Void> expulsarMiembro(
            @Parameter(description = "ID de la unidad") @PathVariable Long idUnidad,
            @Parameter(description = "ID del usuario a expulsar") @PathVariable Long idUsuario,
            @Parameter(description = "ID del administrador") @RequestHeader("X-User-Id") Long idSolicitante) {

        unidadFamiliarService.expulsarMiembro(idUnidad, idUsuario, idSolicitante);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{idUnidad}/abandonar")
    @Operation(summary = "Abandonar grupo")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Grupo abandonado exitosamente"),
            @ApiResponse(responseCode = "400", description = "El administrador no puede abandonar el grupo"),
            @ApiResponse(responseCode = "404", description = "Unidad o miembro no encontrado")
    })
    public ResponseEntity<Void> abandonarGrupo(
            @Parameter(description = "ID de la unidad") @PathVariable Long idUnidad,
            @Parameter(description = "ID del usuario") @RequestHeader("X-User-Id") Long idUsuario) {

        unidadFamiliarService.abandonarGrupo(idUnidad, idUsuario);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar unidad familiar")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Unidad eliminada exitosamente"),
            @ApiResponse(responseCode = "400", description = "No se puede eliminar con suscripciones activas"),
            @ApiResponse(responseCode = "403", description = "Solo el administrador puede eliminar el grupo"),
            @ApiResponse(responseCode = "404", description = "Unidad no encontrada")
    })
    public ResponseEntity<Void> eliminarUnidad(
            @Parameter(description = "ID de la unidad") @PathVariable Long id,
            @Parameter(description = "ID del administrador") @RequestHeader("X-User-Id") Long idSolicitante) {

        unidadFamiliarService.eliminarUnidadFamiliar(id, idSolicitante);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{idUnidad}/es-miembro")
    @Operation(summary = "Verificar membresía")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Resultado de la verificación")
    })
    public ResponseEntity<Boolean> esMiembro(
            @Parameter(description = "ID de la unidad") @PathVariable Long idUnidad,
            @Parameter(description = "ID del usuario") @RequestHeader("X-User-Id") Long idUsuario) {

        var esMiembro = unidadFamiliarService.esMiembroActivo(idUnidad, idUsuario);
        return ResponseEntity.ok(esMiembro);
    }

    @GetMapping("/{idUnidad}/es-administrador")
    @Operation(summary = "Verificar si es administrador")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Resultado de la verificación")
    })
    public ResponseEntity<Boolean> esAdministrador(
            @Parameter(description = "ID de la unidad") @PathVariable Long idUnidad,
            @Parameter(description = "ID del usuario") @RequestHeader("X-User-Id") Long idUsuario) {

        var esAdmin = unidadFamiliarService.esAdministrador(idUnidad, idUsuario);
        return ResponseEntity.ok(esAdmin);
    }
}
