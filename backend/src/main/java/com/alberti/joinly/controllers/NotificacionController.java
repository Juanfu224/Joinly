package com.alberti.joinly.controllers;

import com.alberti.joinly.dto.notificacion.NotificacionResponse;
import com.alberti.joinly.services.NotificacionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/notificaciones")
@RequiredArgsConstructor
@Tag(name = "Notificaciones", description = "API para gestión de notificaciones del usuario")
public class NotificacionController {

    private final NotificacionService notificacionService;

    @GetMapping
    @Operation(summary = "Listar notificaciones con paginación")
    public ResponseEntity<Page<NotificacionResponse>> listarNotificaciones(
            @Parameter(description = "ID del usuario") @RequestHeader("X-User-Id") Long idUsuario,
            @PageableDefault(size = 20, sort = "fechaCreacion") Pageable pageable) {

        var notificaciones = notificacionService.obtenerNotificacionesPaginadas(idUsuario, pageable)
                .map(NotificacionResponse::fromEntity);

        return ResponseEntity.ok(notificaciones);
    }

    @GetMapping("/no-leidas")
    @Operation(summary = "Listar notificaciones no leídas")
    public ResponseEntity<List<NotificacionResponse>> listarNoLeidas(
            @Parameter(description = "ID del usuario") @RequestHeader("X-User-Id") Long idUsuario) {

        var notificaciones = notificacionService.obtenerNoLeidas(idUsuario)
                .stream()
                .map(NotificacionResponse::fromEntity)
                .toList();

        return ResponseEntity.ok(notificaciones);
    }

    @GetMapping("/contador")
    @Operation(summary = "Obtener contador de notificaciones no leídas")
    public ResponseEntity<Map<String, Long>> contarNoLeidas(
            @Parameter(description = "ID del usuario") @RequestHeader("X-User-Id") Long idUsuario) {

        var count = notificacionService.contarNoLeidas(idUsuario);
        return ResponseEntity.ok(Map.of("noLeidas", count));
    }

    @PostMapping("/{id}/leer")
    @Operation(summary = "Marcar notificación como leída")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Notificación marcada como leída"),
            @ApiResponse(responseCode = "404", description = "Notificación no encontrada")
    })
    public ResponseEntity<Void> marcarComoLeida(
            @PathVariable Long id,
            @Parameter(description = "ID del usuario") @RequestHeader("X-User-Id") Long idUsuario) {

        notificacionService.marcarComoLeida(id, idUsuario);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/leer-todas")
    @Operation(summary = "Marcar todas las notificaciones como leídas")
    public ResponseEntity<Map<String, Integer>> marcarTodasComoLeidas(
            @Parameter(description = "ID del usuario") @RequestHeader("X-User-Id") Long idUsuario) {

        var actualizadas = notificacionService.marcarTodasComoLeidas(idUsuario);
        return ResponseEntity.ok(Map.of("marcadas", actualizadas));
    }
}
