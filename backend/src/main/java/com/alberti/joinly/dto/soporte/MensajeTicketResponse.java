package com.alberti.joinly.dto.soporte;

import com.alberti.joinly.entities.soporte.MensajeTicket;

import java.time.LocalDateTime;

/**
 * DTO de respuesta para mensajes de ticket.
 */
public record MensajeTicketResponse(
        Long id,
        Long idTicket,
        Long idAutor,
        String nombreAutor,
        String contenido,
        LocalDateTime fechaMensaje,
        boolean esInterno,
        String adjuntos,
        boolean editado,
        LocalDateTime fechaEdicion
) {
    public static MensajeTicketResponse fromEntity(MensajeTicket mensaje) {
        return new MensajeTicketResponse(
                mensaje.getId(),
                mensaje.getTicket().getId(),
                mensaje.getAutor().getId(),
                mensaje.getAutor().getNombre(),
                mensaje.getContenido(),
                mensaje.getFechaMensaje(),
                mensaje.getEsInterno(),
                mensaje.getAdjuntos(),
                mensaje.getEditado(),
                mensaje.getFechaEdicion()
        );
    }
}
