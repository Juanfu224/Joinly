package com.alberti.joinly.dto.soporte;

import com.alberti.joinly.entities.enums.CategoriaTicket;
import com.alberti.joinly.entities.enums.EstadoTicket;
import com.alberti.joinly.entities.enums.PrioridadTicket;
import com.alberti.joinly.entities.soporte.TicketSoporte;

import java.time.LocalDateTime;

/**
 * DTO de respuesta para información de tickets de soporte.
 */
public record TicketSoporteResponse(
        Long id,
        Long idUsuario,
        String nombreUsuario,
        Long idSuscripcion,
        String nombreServicio,
        Long idPago,
        Long idDisputa,
        String asunto,
        String descripcion,
        CategoriaTicket categoria,
        PrioridadTicket prioridad,
        EstadoTicket estado,
        LocalDateTime fechaApertura,
        LocalDateTime fechaPrimeraRespuesta,
        LocalDateTime fechaCierre,
        Long idAgente,
        String nombreAgente,
        Short satisfaccion,
        long totalMensajes
) {
    public static TicketSoporteResponse fromEntity(TicketSoporte ticket, long totalMensajes) {
        var nombreServicio = ticket.getSuscripcion() != null && ticket.getSuscripcion().getServicio() != null
                ? ticket.getSuscripcion().getServicio().getNombre()
                : null;

        return new TicketSoporteResponse(
                ticket.getId(),
                ticket.getUsuario().getId(),
                ticket.getUsuario().getNombre(),
                ticket.getSuscripcion() != null ? ticket.getSuscripcion().getId() : null,
                nombreServicio,
                ticket.getPago() != null ? ticket.getPago().getId() : null,
                ticket.getDisputa() != null ? ticket.getDisputa().getId() : null,
                ticket.getAsunto(),
                ticket.getDescripcion(),
                ticket.getCategoria(),
                ticket.getPrioridad(),
                ticket.getEstado(),
                ticket.getFechaApertura(),
                ticket.getFechaPrimeraRespuesta(),
                ticket.getFechaCierre(),
                ticket.getAgente() != null ? ticket.getAgente().getId() : null,
                ticket.getAgente() != null ? ticket.getAgente().getNombre() : null,
                ticket.getSatisfaccion(),
                totalMensajes
        );
    }
}
