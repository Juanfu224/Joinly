package com.alberti.joinly.controllers;

import com.alberti.joinly.dto.solicitud.CreateSolicitudGrupoRequest;
import com.alberti.joinly.dto.solicitud.CreateSolicitudSuscripcionRequest;
import com.alberti.joinly.dto.solicitud.RejectSolicitudRequest;
import com.alberti.joinly.dto.solicitud.SolicitudResponse;
import com.alberti.joinly.entities.enums.EstadoSolicitud;
import com.alberti.joinly.security.CurrentUser;
import com.alberti.joinly.security.UserPrincipal;
import com.alberti.joinly.services.SolicitudService;
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
@RequestMapping("/api/v1/solicitudes")
@RequiredArgsConstructor
@Tag(name = "Solicitudes", description = "API para gestionar solicitudes de unión a grupos familiares y suscripciones compartidas. " +
        "Las solicitudes siguen el flujo: PENDIENTE → APROBADA/RECHAZADA/CANCELADA")
@SecurityRequirement(name = "bearerAuth")
public class SolicitudController {

    private final SolicitudService solicitudService;

    @PostMapping("/grupo")
    @Operation(
            summary = "Solicitar unión a grupo familiar",
            description = "Crea una solicitud para unirse a un grupo familiar usando su código de invitación. " +
                    "El administrador del grupo deberá aprobar o rechazar la solicitud.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Solicitud creada exitosamente",
                    content = @Content(schema = @Schema(implementation = SolicitudResponse.class))),
            @ApiResponse(responseCode = "400", description = "El grupo no está activo",
                    content = @Content),
            @ApiResponse(responseCode = "404", description = "Código de invitación no válido",
                    content = @Content),
            @ApiResponse(responseCode = "409", description = "Ya eres miembro o ya tienes una solicitud pendiente",
                    content = @Content),
            @ApiResponse(responseCode = "422", description = "El grupo ha alcanzado el límite de miembros",
                    content = @Content)
    })
    public ResponseEntity<SolicitudResponse> solicitarUnionGrupo(
            @CurrentUser UserPrincipal currentUser,
            @Valid @RequestBody CreateSolicitudGrupoRequest request) {

        var solicitud = solicitudService.crearSolicitudUnionGrupo(
                currentUser.getId(),
                request.codigoInvitacion(),
                request.mensaje());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(SolicitudResponse.fromEntity(solicitud));
    }

    @PostMapping("/suscripcion")
    @Operation(
            summary = "Solicitar plaza en suscripción",
            description = "Crea una solicitud para ocupar una plaza en una suscripción compartida. " +
                    "Requisito: debes ser miembro activo del grupo propietario de la suscripción.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Solicitud creada exitosamente",
                    content = @Content(schema = @Schema(implementation = SolicitudResponse.class))),
            @ApiResponse(responseCode = "400", description = "La suscripción no está activa",
                    content = @Content),
            @ApiResponse(responseCode = "403", description = "No eres miembro del grupo propietario",
                    content = @Content),
            @ApiResponse(responseCode = "404", description = "Suscripción no encontrada",
                    content = @Content),
            @ApiResponse(responseCode = "409", description = "Ya tienes plaza o solicitud pendiente",
                    content = @Content),
            @ApiResponse(responseCode = "422", description = "No hay plazas disponibles",
                    content = @Content)
    })
    public ResponseEntity<SolicitudResponse> solicitarUnionSuscripcion(
            @CurrentUser UserPrincipal currentUser,
            @Valid @RequestBody CreateSolicitudSuscripcionRequest request) {

        var solicitud = solicitudService.crearSolicitudUnionSuscripcion(
                currentUser.getId(),
                request.idSuscripcion(),
                request.mensaje());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(SolicitudResponse.fromEntity(solicitud));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener solicitud por ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Solicitud encontrada"),
            @ApiResponse(responseCode = "404", description = "Solicitud no encontrada")
    })
    public ResponseEntity<SolicitudResponse> getSolicitud(
            @Parameter(description = "ID de la solicitud") @PathVariable Long id) {

        var solicitud = solicitudService.buscarPorId(id)
                .orElseThrow(() -> new IllegalArgumentException("Solicitud no encontrada con ID: " + id));

        return ResponseEntity.ok(SolicitudResponse.fromEntity(solicitud));
    }

    @GetMapping("/mis-solicitudes")
    @Operation(
            summary = "Listar mis solicitudes",
            description = "Lista las solicitudes del usuario con paginación. " +
                    "Parámetros: page (número de página, base 0), size (elementos por página), " +
                    "sort (campo,dirección ej: fechaSolicitud,desc), estado (PENDIENTE, APROBADA, RECHAZADA)"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Página de solicitudes")
    })
    public ResponseEntity<Page<SolicitudResponse>> listarMisSolicitudes(
            @CurrentUser UserPrincipal currentUser,
            @Parameter(description = "Estado de las solicitudes") @RequestParam(defaultValue = "PENDIENTE") EstadoSolicitud estado,
            @PageableDefault(size = 10, sort = "fechaSolicitud") Pageable pageable) {

        var solicitudes = solicitudService.listarSolicitudesUsuarioPaginado(currentUser.getId(), estado, pageable)
                .map(SolicitudResponse::fromEntity);

        return ResponseEntity.ok(solicitudes);
    }

    @GetMapping("/grupo/{idUnidad}/pendientes")
    @Operation(summary = "Listar solicitudes pendientes de grupo")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista de solicitudes pendientes")
    })
    public ResponseEntity<List<SolicitudResponse>> listarSolicitudesPendientesGrupo(
            @Parameter(description = "ID de la unidad familiar") @PathVariable Long idUnidad) {

        var solicitudes = solicitudService.listarSolicitudesPendientesGrupo(idUnidad)
                .stream()
                .map(SolicitudResponse::fromEntity)
                .toList();

        return ResponseEntity.ok(solicitudes);
    }

    @GetMapping("/suscripcion/{idSuscripcion}/pendientes")
    @Operation(summary = "Listar solicitudes pendientes de suscripción")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista de solicitudes pendientes")
    })
    public ResponseEntity<List<SolicitudResponse>> listarSolicitudesPendientesSuscripcion(
            @Parameter(description = "ID de la suscripción") @PathVariable Long idSuscripcion) {

        var solicitudes = solicitudService.listarSolicitudesPendientesSuscripcion(idSuscripcion)
                .stream()
                .map(SolicitudResponse::fromEntity)
                .toList();

        return ResponseEntity.ok(solicitudes);
    }

    @PostMapping("/{id}/aprobar")
    @Operation(
            summary = "Aprobar solicitud",
            description = "Aprueba una solicitud pendiente. Para solicitudes de grupo, crea una nueva membresía. " +
                    "Para solicitudes de suscripción, asigna la primera plaza disponible al solicitante.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Solicitud aprobada y acción ejecutada",
                    content = @Content(schema = @Schema(implementation = SolicitudResponse.class))),
            @ApiResponse(responseCode = "400", description = "La solicitud no está en estado PENDIENTE",
                    content = @Content),
            @ApiResponse(responseCode = "403", description = "Solo el admin del grupo o anfitrión de la suscripción puede aprobar",
                    content = @Content),
            @ApiResponse(responseCode = "404", description = "Solicitud no encontrada",
                    content = @Content),
            @ApiResponse(responseCode = "422", description = "Límite de miembros o plazas alcanzado",
                    content = @Content)
    })
    public ResponseEntity<SolicitudResponse> aprobarSolicitud(
            @Parameter(description = "ID de la solicitud") @PathVariable Long id,
            @CurrentUser UserPrincipal currentUser) {

        var solicitud = solicitudService.aprobarSolicitud(id, currentUser.getId());
        return ResponseEntity.ok(SolicitudResponse.fromEntity(solicitud));
    }

    @PostMapping("/{id}/rechazar")
    @Operation(
            summary = "Rechazar solicitud",
            description = "Rechaza una solicitud pendiente con un motivo opcional. " +
                    "Solo el admin del grupo (para solicitudes de grupo) o el anfitrión (para suscripciones) puede rechazar.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Solicitud rechazada",
                    content = @Content(schema = @Schema(implementation = SolicitudResponse.class))),
            @ApiResponse(responseCode = "400", description = "La solicitud no está en estado PENDIENTE",
                    content = @Content),
            @ApiResponse(responseCode = "403", description = "Sin permiso para rechazar esta solicitud",
                    content = @Content),
            @ApiResponse(responseCode = "404", description = "Solicitud no encontrada",
                    content = @Content)
    })
    public ResponseEntity<SolicitudResponse> rechazarSolicitud(
            @Parameter(description = "ID de la solicitud") @PathVariable Long id,
            @CurrentUser UserPrincipal currentUser,
            @Valid @RequestBody(required = false) RejectSolicitudRequest request) {

        var motivoRechazo = request != null ? request.motivoRechazo() : null;
        var solicitud = solicitudService.rechazarSolicitud(id, currentUser.getId(), motivoRechazo);
        return ResponseEntity.ok(SolicitudResponse.fromEntity(solicitud));
    }

    @PostMapping("/{id}/cancelar")
    @Operation(
            summary = "Cancelar mi solicitud",
            description = "Cancela una solicitud propia que aún esté en estado PENDIENTE. " +
                    "Solo el solicitante original puede cancelar su propia solicitud.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Solicitud cancelada",
                    content = @Content(schema = @Schema(implementation = SolicitudResponse.class))),
            @ApiResponse(responseCode = "400", description = "La solicitud no está en estado PENDIENTE",
                    content = @Content),
            @ApiResponse(responseCode = "403", description = "Solo puedes cancelar tus propias solicitudes",
                    content = @Content),
            @ApiResponse(responseCode = "404", description = "Solicitud no encontrada",
                    content = @Content)
    })
    public ResponseEntity<SolicitudResponse> cancelarSolicitud(
            @Parameter(description = "ID de la solicitud") @PathVariable Long id,
            @CurrentUser UserPrincipal currentUser) {

        var solicitud = solicitudService.cancelarSolicitud(id, currentUser.getId());
        return ResponseEntity.ok(SolicitudResponse.fromEntity(solicitud));
    }

    @GetMapping("/tiene-pendiente/grupo/{idUnidad}")
    @Operation(summary = "Verificar solicitud pendiente en grupo")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Resultado de la verificación")
    })
    public ResponseEntity<Boolean> tieneSolicitudPendienteGrupo(
            @CurrentUser UserPrincipal currentUser,
            @Parameter(description = "ID de la unidad familiar") @PathVariable Long idUnidad) {

        var tienePendiente = solicitudService.tieneSolicitudPendienteGrupo(currentUser.getId(), idUnidad);
        return ResponseEntity.ok(tienePendiente);
    }

    @GetMapping("/tiene-pendiente/suscripcion/{idSuscripcion}")
    @Operation(summary = "Verificar solicitud pendiente en suscripción")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Resultado de la verificación")
    })
    public ResponseEntity<Boolean> tieneSolicitudPendienteSuscripcion(
            @CurrentUser UserPrincipal currentUser,
            @Parameter(description = "ID de la suscripción") @PathVariable Long idSuscripcion) {

        var tienePendiente = solicitudService.tieneSolicitudPendienteSuscripcion(currentUser.getId(), idSuscripcion);
        return ResponseEntity.ok(tienePendiente);
    }
}
