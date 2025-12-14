package com.alberti.joinly.controllers;

import com.alberti.joinly.dto.solicitud.CreateSolicitudGrupoRequest;
import com.alberti.joinly.dto.solicitud.CreateSolicitudSuscripcionRequest;
import com.alberti.joinly.dto.solicitud.RejectSolicitudRequest;
import com.alberti.joinly.dto.solicitud.SolicitudResponse;
import com.alberti.joinly.entities.enums.EstadoSolicitud;
import com.alberti.joinly.services.SolicitudService;
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
@RequestMapping("/api/v1/solicitudes")
@RequiredArgsConstructor
@Tag(name = "Solicitudes", description = "Gestión de solicitudes de unión a grupos y suscripciones")
public class SolicitudController {

    private final SolicitudService solicitudService;

    @PostMapping("/grupo")
    @Operation(summary = "Solicitar unión a grupo")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Solicitud creada exitosamente"),
            @ApiResponse(responseCode = "400", description = "Código inválido o ya eres miembro"),
            @ApiResponse(responseCode = "409", description = "Ya tienes una solicitud pendiente para este grupo")
    })
    public ResponseEntity<SolicitudResponse> solicitarUnionGrupo(
            @Parameter(description = "ID del solicitante") @RequestHeader("X-User-Id") Long idSolicitante,
            @Valid @RequestBody CreateSolicitudGrupoRequest request) {

        var solicitud = solicitudService.crearSolicitudUnionGrupo(
                idSolicitante,
                request.codigoInvitacion(),
                request.mensaje());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(SolicitudResponse.fromEntity(solicitud));
    }

    @PostMapping("/suscripcion")
    @Operation(summary = "Solicitar unión a suscripción")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Solicitud creada exitosamente"),
            @ApiResponse(responseCode = "400", description = "No eres miembro del grupo o ya tienes plaza"),
            @ApiResponse(responseCode = "409", description = "Ya tienes una solicitud pendiente para esta suscripción"),
            @ApiResponse(responseCode = "422", description = "No hay plazas disponibles")
    })
    public ResponseEntity<SolicitudResponse> solicitarUnionSuscripcion(
            @Parameter(description = "ID del solicitante") @RequestHeader("X-User-Id") Long idSolicitante,
            @Valid @RequestBody CreateSolicitudSuscripcionRequest request) {

        var solicitud = solicitudService.crearSolicitudUnionSuscripcion(
                idSolicitante,
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
    @Operation(summary = "Listar mis solicitudes")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista de solicitudes")
    })
    public ResponseEntity<List<SolicitudResponse>> listarMisSolicitudes(
            @Parameter(description = "ID del usuario") @RequestHeader("X-User-Id") Long idUsuario,
            @Parameter(description = "Estado de las solicitudes") @RequestParam(defaultValue = "PENDIENTE") EstadoSolicitud estado) {

        var solicitudes = solicitudService.listarSolicitudesUsuario(idUsuario, estado)
                .stream()
                .map(SolicitudResponse::fromEntity)
                .toList();

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
    @Operation(summary = "Aprobar solicitud")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Solicitud aprobada exitosamente"),
            @ApiResponse(responseCode = "400", description = "Solo se pueden aprobar solicitudes pendientes"),
            @ApiResponse(responseCode = "403", description = "No tienes permiso para aprobar esta solicitud"),
            @ApiResponse(responseCode = "404", description = "Solicitud no encontrada"),
            @ApiResponse(responseCode = "422", description = "Límite de miembros/plazas alcanzado")
    })
    public ResponseEntity<SolicitudResponse> aprobarSolicitud(
            @Parameter(description = "ID de la solicitud") @PathVariable Long id,
            @Parameter(description = "ID del aprobador") @RequestHeader("X-User-Id") Long idAprobador) {

        var solicitud = solicitudService.aprobarSolicitud(id, idAprobador);
        return ResponseEntity.ok(SolicitudResponse.fromEntity(solicitud));
    }

    @PostMapping("/{id}/rechazar")
    @Operation(summary = "Rechazar solicitud")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Solicitud rechazada exitosamente"),
            @ApiResponse(responseCode = "400", description = "Solo se pueden rechazar solicitudes pendientes"),
            @ApiResponse(responseCode = "403", description = "No tienes permiso para rechazar esta solicitud"),
            @ApiResponse(responseCode = "404", description = "Solicitud no encontrada")
    })
    public ResponseEntity<SolicitudResponse> rechazarSolicitud(
            @Parameter(description = "ID de la solicitud") @PathVariable Long id,
            @Parameter(description = "ID del aprobador") @RequestHeader("X-User-Id") Long idAprobador,
            @Valid @RequestBody(required = false) RejectSolicitudRequest request) {

        var motivoRechazo = request != null ? request.motivoRechazo() : null;
        var solicitud = solicitudService.rechazarSolicitud(id, idAprobador, motivoRechazo);
        return ResponseEntity.ok(SolicitudResponse.fromEntity(solicitud));
    }

    @PostMapping("/{id}/cancelar")
    @Operation(summary = "Cancelar solicitud")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Solicitud cancelada exitosamente"),
            @ApiResponse(responseCode = "400", description = "Solo se pueden cancelar solicitudes pendientes"),
            @ApiResponse(responseCode = "403", description = "Solo puedes cancelar tus propias solicitudes"),
            @ApiResponse(responseCode = "404", description = "Solicitud no encontrada")
    })
    public ResponseEntity<SolicitudResponse> cancelarSolicitud(
            @Parameter(description = "ID de la solicitud") @PathVariable Long id,
            @Parameter(description = "ID del solicitante") @RequestHeader("X-User-Id") Long idSolicitante) {

        var solicitud = solicitudService.cancelarSolicitud(id, idSolicitante);
        return ResponseEntity.ok(SolicitudResponse.fromEntity(solicitud));
    }

    @GetMapping("/tiene-pendiente/grupo/{idUnidad}")
    @Operation(summary = "Verificar solicitud pendiente en grupo")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Resultado de la verificación")
    })
    public ResponseEntity<Boolean> tieneSolicitudPendienteGrupo(
            @Parameter(description = "ID del usuario") @RequestHeader("X-User-Id") Long idUsuario,
            @Parameter(description = "ID de la unidad familiar") @PathVariable Long idUnidad) {

        var tienePendiente = solicitudService.tieneSolicitudPendienteGrupo(idUsuario, idUnidad);
        return ResponseEntity.ok(tienePendiente);
    }

    @GetMapping("/tiene-pendiente/suscripcion/{idSuscripcion}")
    @Operation(summary = "Verificar solicitud pendiente en suscripción")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Resultado de la verificación")
    })
    public ResponseEntity<Boolean> tieneSolicitudPendienteSuscripcion(
            @Parameter(description = "ID del usuario") @RequestHeader("X-User-Id") Long idUsuario,
            @Parameter(description = "ID de la suscripción") @PathVariable Long idSuscripcion) {

        var tienePendiente = solicitudService.tieneSolicitudPendienteSuscripcion(idUsuario, idSuscripcion);
        return ResponseEntity.ok(tienePendiente);
    }
}
