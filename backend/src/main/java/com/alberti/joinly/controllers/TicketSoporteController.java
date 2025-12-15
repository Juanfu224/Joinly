package com.alberti.joinly.controllers;

import com.alberti.joinly.dto.soporte.CreateMensajeTicketRequest;
import com.alberti.joinly.dto.soporte.CreateTicketRequest;
import com.alberti.joinly.dto.soporte.MensajeTicketResponse;
import com.alberti.joinly.dto.soporte.TicketSoporteResponse;
import com.alberti.joinly.security.CurrentUser;
import com.alberti.joinly.security.UserPrincipal;
import com.alberti.joinly.services.TicketSoporteService;
import io.swagger.v3.oas.annotations.Operation;
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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/soporte/tickets")
@RequiredArgsConstructor
@Tag(name = "Soporte", description = "API para sistema de tickets de soporte al cliente")
@SecurityRequirement(name = "bearerAuth")
public class TicketSoporteController {

    private final TicketSoporteService ticketService;

    @PostMapping
    @Operation(summary = "Crear ticket de soporte", description = "Crea un nuevo ticket de incidencia")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Ticket creado"),
            @ApiResponse(responseCode = "400", description = "Datos de entrada inválidos"),
            @ApiResponse(responseCode = "422", description = "Límite de tickets activos alcanzado")
    })
    public ResponseEntity<TicketSoporteResponse> crearTicket(
            @CurrentUser UserPrincipal currentUser,
            @Valid @RequestBody CreateTicketRequest request) {

        var ticket = ticketService.crearTicket(currentUser.getId(), request);
        var totalMensajes = ticketService.contarMensajesTicket(ticket.getId());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(TicketSoporteResponse.fromEntity(ticket, totalMensajes));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener ticket por ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Ticket encontrado"),
            @ApiResponse(responseCode = "404", description = "Ticket no encontrado")
    })
    public ResponseEntity<TicketSoporteResponse> obtenerTicket(@PathVariable Long id) {
        return ticketService.buscarPorIdConDetalles(id)
                .map(ticket -> {
                    var totalMensajes = ticketService.contarMensajesTicket(id);
                    return ResponseEntity.ok(TicketSoporteResponse.fromEntity(ticket, totalMensajes));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/mis-tickets")
    @Operation(summary = "Listar mis tickets")
    public ResponseEntity<Page<TicketSoporteResponse>> listarMisTickets(
            @CurrentUser UserPrincipal currentUser,
            @PageableDefault(size = 20, sort = "fechaApertura") Pageable pageable) {

        var tickets = ticketService.listarTicketsUsuario(currentUser.getId(), pageable)
                .map(ticket -> {
                    var totalMensajes = ticketService.contarMensajesTicket(ticket.getId());
                    return TicketSoporteResponse.fromEntity(ticket, totalMensajes);
                });

        return ResponseEntity.ok(tickets);
    }

    @GetMapping("/sin-asignar")
    @PreAuthorize("hasRole('ADMIN') or hasRole('AGENTE')")
    @Operation(summary = "Listar tickets sin asignar", description = "Solo para agentes")
    public ResponseEntity<List<TicketSoporteResponse>> listarTicketsSinAsignar() {
        var tickets = ticketService.listarTicketsSinAsignar()
                .stream()
                .map(ticket -> {
                    var totalMensajes = ticketService.contarMensajesTicket(ticket.getId());
                    return TicketSoporteResponse.fromEntity(ticket, totalMensajes);
                })
                .toList();

        return ResponseEntity.ok(tickets);
    }

    @GetMapping("/asignados")
    @PreAuthorize("hasRole('AGENTE')")
    @Operation(summary = "Listar mis tickets asignados", description = "Solo para agentes")
    public ResponseEntity<List<TicketSoporteResponse>> listarMisTicketsAsignados(
            @CurrentUser UserPrincipal currentUser) {

        var tickets = ticketService.listarTicketsAgente(currentUser.getId())
                .stream()
                .map(ticket -> {
                    var totalMensajes = ticketService.contarMensajesTicket(ticket.getId());
                    return TicketSoporteResponse.fromEntity(ticket, totalMensajes);
                })
                .toList();

        return ResponseEntity.ok(tickets);
    }

    @PostMapping("/{id}/asignar")
    @PreAuthorize("hasRole('ADMIN') or hasRole('AGENTE')")
    @Operation(summary = "Asignar agente a ticket")
    public ResponseEntity<TicketSoporteResponse> asignarAgente(
            @PathVariable Long id,
            @CurrentUser UserPrincipal currentUser) {

        var ticket = ticketService.asignarAgente(id, currentUser.getId());
        var totalMensajes = ticketService.contarMensajesTicket(id);

        return ResponseEntity.ok(TicketSoporteResponse.fromEntity(ticket, totalMensajes));
    }

    @GetMapping("/{id}/mensajes")
    @Operation(summary = "Obtener mensajes de un ticket")
    public ResponseEntity<List<MensajeTicketResponse>> obtenerMensajes(
            @PathVariable Long id,
            @CurrentUser UserPrincipal currentUser) {

        var mensajes = ticketService.obtenerMensajes(id, currentUser.getId())
                .stream()
                .map(MensajeTicketResponse::fromEntity)
                .toList();

        return ResponseEntity.ok(mensajes);
    }

    @PostMapping("/{id}/mensajes")
    @Operation(summary = "Añadir mensaje a ticket")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Mensaje creado"),
            @ApiResponse(responseCode = "403", description = "Sin acceso al ticket"),
            @ApiResponse(responseCode = "404", description = "Ticket no encontrado")
    })
    public ResponseEntity<MensajeTicketResponse> agregarMensaje(
            @PathVariable Long id,
            @CurrentUser UserPrincipal currentUser,
            @Valid @RequestBody CreateMensajeTicketRequest request) {

        var mensaje = ticketService.agregarMensaje(id, currentUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(MensajeTicketResponse.fromEntity(mensaje));
    }

    @PostMapping("/{id}/resolver")
    @PreAuthorize("hasRole('ADMIN') or hasRole('AGENTE')")
    @Operation(summary = "Marcar ticket como resuelto")
    public ResponseEntity<TicketSoporteResponse> resolverTicket(
            @PathVariable Long id,
            @CurrentUser UserPrincipal currentUser) {

        var ticket = ticketService.resolverTicket(id, currentUser.getId());
        var totalMensajes = ticketService.contarMensajesTicket(id);

        return ResponseEntity.ok(TicketSoporteResponse.fromEntity(ticket, totalMensajes));
    }

    @PostMapping("/{id}/cerrar")
    @Operation(summary = "Cerrar ticket con valoración opcional")
    public ResponseEntity<TicketSoporteResponse> cerrarTicket(
            @PathVariable Long id,
            @CurrentUser UserPrincipal currentUser,
            @RequestParam(required = false) Short satisfaccion) {

        var ticket = ticketService.cerrarTicket(id, currentUser.getId(), satisfaccion);
        var totalMensajes = ticketService.contarMensajesTicket(id);

        return ResponseEntity.ok(TicketSoporteResponse.fromEntity(ticket, totalMensajes));
    }
}
