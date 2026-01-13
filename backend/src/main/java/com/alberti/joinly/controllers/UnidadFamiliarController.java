package com.alberti.joinly.controllers;

import com.alberti.joinly.dto.unidad.CreateUnidadRequest;
import com.alberti.joinly.dto.unidad.MiembroUnidadResponse;
import com.alberti.joinly.dto.unidad.UnidadFamiliarCardDTO;
import com.alberti.joinly.dto.unidad.UnidadFamiliarResponse;
import com.alberti.joinly.security.CurrentUser;
import com.alberti.joinly.security.UserPrincipal;
import com.alberti.joinly.services.UnidadFamiliarService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/unidades")
@RequiredArgsConstructor
@Tag(name = "Unidades Familiares", description = "API para gestionar grupos familiares. Un grupo puede tener múltiples miembros " +
        "y suscripciones compartidas. Cada grupo tiene un administrador y un código de invitación único.")
@SecurityRequirement(name = "bearerAuth")
public class UnidadFamiliarController {

    private final UnidadFamiliarService unidadFamiliarService;

    @PostMapping
    @Operation(
            summary = "Crear grupo familiar",
            description = "Crea un nuevo grupo familiar con el usuario como administrador. " +
                    "Se genera automáticamente un código de invitación de 12 caracteres. " +
                    "Límite: un usuario puede administrar máximo 10 grupos.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Grupo creado exitosamente",
                    content = @Content(schema = @Schema(implementation = UnidadFamiliarResponse.class))),
            @ApiResponse(responseCode = "400", description = "Nombre vacío o inválido",
                    content = @Content),
            @ApiResponse(responseCode = "404", description = "Usuario no encontrado",
                    content = @Content),
            @ApiResponse(responseCode = "422", description = "Has alcanzado el límite de 10 grupos",
                    content = @Content)
    })
    public ResponseEntity<UnidadFamiliarResponse> crearUnidad(
            @CurrentUser UserPrincipal currentUser,
            @Valid @RequestBody CreateUnidadRequest request) {

        var unidad = unidadFamiliarService.crearUnidadFamiliar(
                currentUser.getId(),
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
            @CurrentUser UserPrincipal currentUser) {

        var unidades = unidadFamiliarService.listarGruposAdministrados(currentUser.getId())
                .stream()
                .map(UnidadFamiliarResponse::fromEntity)
                .toList();

        return ResponseEntity.ok(unidades);
    }

    @GetMapping("/miembro")
    @Operation(
            summary = "Listar grupos como miembro",
            description = "Lista los grupos donde el usuario es miembro activo con paginación. " +
                    "Parámetros: page (número de página, base 0), size (elementos por página), " +
                    "sort (campo,dirección ej: fechaCreacion,desc)"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Página de grupos")
    })
    public ResponseEntity<Page<UnidadFamiliarResponse>> listarGruposDondeSoyMiembro(
            @CurrentUser UserPrincipal currentUser,
            @PageableDefault(size = 10, sort = "fechaCreacion") Pageable pageable) {

        var unidades = unidadFamiliarService.listarGruposDondeEsMiembroPaginado(currentUser.getId(), pageable)
                .map(UnidadFamiliarResponse::fromEntity);

        return ResponseEntity.ok(unidades);
    }

    @GetMapping("/miembro/cards")
    @Operation(
            summary = "Obtener tarjetas de grupos",
            description = "Obtiene los datos resumidos de grupos para mostrar en tarjetas del dashboard. " +
                    "Incluye nombre, total de miembros y suscripciones activas. " +
                    "Query optimizada para evitar N+1."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Página de tarjetas de grupos",
                    content = @Content(schema = @Schema(implementation = UnidadFamiliarCardDTO.class)))
    })
    public ResponseEntity<Page<UnidadFamiliarCardDTO>> obtenerTarjetasGrupos(
            @CurrentUser UserPrincipal currentUser,
            @PageableDefault(size = 50) Pageable pageable) {

        var tarjetas = unidadFamiliarService.obtenerGruposCardDelUsuario(currentUser.getId(), pageable);
        return ResponseEntity.ok(tarjetas);
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
            @CurrentUser UserPrincipal currentUser) {

        unidadFamiliarService.expulsarMiembro(idUnidad, idUsuario, currentUser.getId());
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
            @CurrentUser UserPrincipal currentUser) {

        unidadFamiliarService.abandonarGrupo(idUnidad, currentUser.getId());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    @Operation(
            summary = "Eliminar grupo familiar",
            description = "Elimina (soft delete) un grupo familiar. El grupo no puede tener suscripciones activas. " +
                    "Solo el administrador puede realizar esta acción.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Grupo eliminado exitosamente"),
            @ApiResponse(responseCode = "400", description = "El grupo tiene suscripciones activas que deben cancelarse primero",
                    content = @Content),
            @ApiResponse(responseCode = "403", description = "Solo el administrador puede eliminar el grupo",
                    content = @Content),
            @ApiResponse(responseCode = "404", description = "Grupo no encontrado",
                    content = @Content)
    })
    public ResponseEntity<Void> eliminarUnidad(
            @Parameter(description = "ID de la unidad") @PathVariable Long id,
            @CurrentUser UserPrincipal currentUser) {

        unidadFamiliarService.eliminarUnidadFamiliar(id, currentUser.getId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{idUnidad}/es-miembro")
    @Operation(summary = "Verificar membresía")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Resultado de la verificación")
    })
    public ResponseEntity<Boolean> esMiembro(
            @Parameter(description = "ID de la unidad") @PathVariable Long idUnidad,
            @CurrentUser UserPrincipal currentUser) {

        var esMiembro = unidadFamiliarService.esMiembroActivo(idUnidad, currentUser.getId());
        return ResponseEntity.ok(esMiembro);
    }

    @GetMapping("/{idUnidad}/es-administrador")
    @Operation(summary = "Verificar si es administrador")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Resultado de la verificación")
    })
    public ResponseEntity<Boolean> esAdministrador(
            @Parameter(description = "ID de la unidad") @PathVariable Long idUnidad,
            @CurrentUser UserPrincipal currentUser) {

        var esAdmin = unidadFamiliarService.esAdministrador(idUnidad, currentUser.getId());
        return ResponseEntity.ok(esAdmin);
    }
}
