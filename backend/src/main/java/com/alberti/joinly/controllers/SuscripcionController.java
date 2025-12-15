package com.alberti.joinly.controllers;

import com.alberti.joinly.dto.suscripcion.CreateSuscripcionRequest;
import com.alberti.joinly.dto.suscripcion.PlazaResponse;
import com.alberti.joinly.dto.suscripcion.SuscripcionResponse;
import com.alberti.joinly.dto.suscripcion.SuscripcionSummary;
import com.alberti.joinly.security.CurrentUser;
import com.alberti.joinly.security.UserPrincipal;
import com.alberti.joinly.services.SuscripcionService;
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
@RequestMapping("/api/v1/suscripciones")
@RequiredArgsConstructor
@Tag(name = "Suscripciones", description = "API para gestionar suscripciones compartidas (Netflix, Spotify, etc.) " +
        "dentro de grupos familiares. Incluye gestión de plazas y estados.")
@SecurityRequirement(name = "bearerAuth")
public class SuscripcionController {

    private final SuscripcionService suscripcionService;

    @PostMapping
    @Operation(
            summary = "Crear suscripción compartida",
            description = "Crea una nueva suscripción dentro de un grupo familiar. El anfitrión debe ser miembro activo del grupo. " +
                    "Se crean automáticamente todas las plazas, asignando la primera al anfitrión si se indica.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Suscripción creada con todas sus plazas",
                    content = @Content(schema = @Schema(implementation = SuscripcionResponse.class))),
            @ApiResponse(responseCode = "400", description = "Datos de entrada inválidos o número de plazas excede máximo del servicio",
                    content = @Content),
            @ApiResponse(responseCode = "404", description = "Unidad, servicio o usuario no encontrado",
                    content = @Content),
            @ApiResponse(responseCode = "422", description = "El anfitrión no es miembro del grupo o se alcanzó límite de suscripciones (20)",
                    content = @Content)
    })
    public ResponseEntity<SuscripcionResponse> crearSuscripcion(
            @CurrentUser UserPrincipal currentUser,
            @Valid @RequestBody CreateSuscripcionRequest request) {

        var suscripcion = suscripcionService.crearSuscripcion(
                request.idUnidad(),
                currentUser.getId(),
                request.idServicio(),
                request.precioTotal(),
                request.numPlazasTotal(),
                request.fechaInicio(),
                request.periodicidad(),
                request.anfitrionOcupaPlaza());

        var plazasDisponibles = suscripcionService.contarPlazasDisponibles(suscripcion.getId());
        var plazasOcupadas = suscripcionService.contarPlazasOcupadas(suscripcion.getId());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(SuscripcionResponse.fromEntity(suscripcion, plazasDisponibles, plazasOcupadas));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener suscripción por ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Suscripción encontrada"),
            @ApiResponse(responseCode = "404", description = "Suscripción no encontrada")
    })
    public ResponseEntity<SuscripcionResponse> getSuscripcion(
            @Parameter(description = "ID de la suscripción") @PathVariable Long id) {

        var suscripcion = suscripcionService.buscarPorIdConPlazas(id)
                .orElseThrow(() -> new IllegalArgumentException("Suscripción no encontrada con ID: " + id));

        var plazasDisponibles = suscripcionService.contarPlazasDisponibles(id);
        var plazasOcupadas = suscripcionService.contarPlazasOcupadas(id);

        return ResponseEntity.ok(SuscripcionResponse.fromEntity(suscripcion, plazasDisponibles, plazasOcupadas));
    }

    @GetMapping("/unidad/{idUnidad}")
    @Operation(
            summary = "Listar suscripciones de unidad",
            description = "Lista las suscripciones activas de una unidad familiar con paginación. " +
                    "Parámetros: page (número de página, base 0), size (elementos por página), " +
                    "sort (campo,dirección ej: fechaInicio,desc)"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Página de suscripciones")
    })
    public ResponseEntity<Page<SuscripcionSummary>> listarSuscripcionesDeUnidad(
            @Parameter(description = "ID de la unidad familiar") @PathVariable Long idUnidad,
            @PageableDefault(size = 10, sort = "fechaInicio") Pageable pageable) {

        var suscripciones = suscripcionService.listarSuscripcionesActivasDeUnidadPaginado(idUnidad, pageable)
                .map(SuscripcionSummary::fromEntity);

        return ResponseEntity.ok(suscripciones);
    }

    @GetMapping("/anfitrion")
    @Operation(summary = "Listar mis suscripciones como anfitrión")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista de suscripciones")
    })
    public ResponseEntity<List<SuscripcionSummary>> listarMisSuscripcionesComoAnfitrion(
            @CurrentUser UserPrincipal currentUser) {

        var suscripciones = suscripcionService.listarSuscripcionesDeAnfitrion(currentUser.getId())
                .stream()
                .map(SuscripcionSummary::fromEntity)
                .toList();

        return ResponseEntity.ok(suscripciones);
    }

    @GetMapping("/{idSuscripcion}/plazas/disponibles")
    @Operation(summary = "Listar plazas disponibles")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista de plazas disponibles")
    })
    public ResponseEntity<List<PlazaResponse>> listarPlazasDisponibles(
            @Parameter(description = "ID de la suscripción") @PathVariable Long idSuscripcion) {

        var plazas = suscripcionService.listarPlazasDisponibles(idSuscripcion)
                .stream()
                .map(PlazaResponse::fromEntity)
                .toList();

        return ResponseEntity.ok(plazas);
    }

    @GetMapping("/mis-plazas")
    @Operation(summary = "Listar mis plazas ocupadas")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista de plazas ocupadas")
    })
    public ResponseEntity<List<PlazaResponse>> listarMisPlazas(
            @CurrentUser UserPrincipal currentUser) {

        var plazas = suscripcionService.listarPlazasOcupadasPorUsuario(currentUser.getId())
                .stream()
                .map(PlazaResponse::fromEntity)
                .toList();

        return ResponseEntity.ok(plazas);
    }

    @PostMapping("/{idSuscripcion}/ocupar-plaza")
    @Operation(summary = "Ocupar plaza")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Plaza ocupada exitosamente"),
            @ApiResponse(responseCode = "400", description = "No hay plazas disponibles o usuario ya tiene plaza"),
            @ApiResponse(responseCode = "404", description = "Suscripción o usuario no encontrado"),
            @ApiResponse(responseCode = "422", description = "Usuario no es miembro del grupo")
    })
    public ResponseEntity<PlazaResponse> ocuparPlaza(
            @Parameter(description = "ID de la suscripción") @PathVariable Long idSuscripcion,
            @CurrentUser UserPrincipal currentUser) {

        var plaza = suscripcionService.ocuparPlaza(idSuscripcion, currentUser.getId());
        return ResponseEntity.ok(PlazaResponse.fromEntity(plaza));
    }

    @DeleteMapping("/plazas/{idPlaza}")
    @Operation(
            summary = "Liberar plaza",
            description = "Libera una plaza ocupada, dejándola disponible para otros usuarios. " +
                    "El propietario puede liberar su plaza, y el anfitrión puede liberar cualquier plaza excepto la suya propia si es plaza de anfitrión.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Plaza liberada exitosamente"),
            @ApiResponse(responseCode = "400", description = "El anfitrión no puede liberar su plaza reservada (esPlazaAnfitrion=true)",
                    content = @Content),
            @ApiResponse(responseCode = "403", description = "No tienes permiso para liberar esta plaza",
                    content = @Content),
            @ApiResponse(responseCode = "404", description = "Plaza no encontrada",
                    content = @Content)
    })
    public ResponseEntity<Void> liberarPlaza(
            @Parameter(description = "ID de la plaza") @PathVariable Long idPlaza,
            @CurrentUser UserPrincipal currentUser) {

        suscripcionService.liberarPlaza(idPlaza, currentUser.getId());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/pausar")
    @Operation(summary = "Pausar suscripción")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Suscripción pausada exitosamente"),
            @ApiResponse(responseCode = "403", description = "Solo el anfitrión puede pausar"),
            @ApiResponse(responseCode = "404", description = "Suscripción no encontrada")
    })
    public ResponseEntity<Void> pausarSuscripcion(
            @Parameter(description = "ID de la suscripción") @PathVariable Long id,
            @CurrentUser UserPrincipal currentUser) {

        suscripcionService.pausarSuscripcion(id, currentUser.getId());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/reactivar")
    @Operation(summary = "Reactivar suscripción")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Suscripción reactivada exitosamente"),
            @ApiResponse(responseCode = "400", description = "Solo se pueden reactivar suscripciones pausadas"),
            @ApiResponse(responseCode = "403", description = "Solo el anfitrión puede reactivar"),
            @ApiResponse(responseCode = "404", description = "Suscripción no encontrada")
    })
    public ResponseEntity<Void> reactivarSuscripcion(
            @Parameter(description = "ID de la suscripción") @PathVariable Long id,
            @CurrentUser UserPrincipal currentUser) {

        suscripcionService.reactivarSuscripcion(id, currentUser.getId());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/cancelar")
    @Operation(summary = "Cancelar suscripción")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Suscripción cancelada exitosamente"),
            @ApiResponse(responseCode = "403", description = "Solo el anfitrión puede cancelar"),
            @ApiResponse(responseCode = "404", description = "Suscripción no encontrada")
    })
    public ResponseEntity<Void> cancelarSuscripcion(
            @Parameter(description = "ID de la suscripción") @PathVariable Long id,
            @CurrentUser UserPrincipal currentUser) {

        suscripcionService.cancelarSuscripcion(id, currentUser.getId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{idSuscripcion}/tiene-plaza")
    @Operation(summary = "Verificar si tiene plaza")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Resultado de la verificación")
    })
    public ResponseEntity<Boolean> tienePlaza(
            @Parameter(description = "ID de la suscripción") @PathVariable Long idSuscripcion,
            @CurrentUser UserPrincipal currentUser) {

        var tienePlaza = suscripcionService.usuarioTienePlazaEnSuscripcion(idSuscripcion, currentUser.getId());
        return ResponseEntity.ok(tienePlaza);
    }
}
