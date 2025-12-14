package com.alberti.joinly.dto.notificacion;

import com.alberti.joinly.entities.enums.TipoNotificacion;
import com.alberti.joinly.entities.notificacion.Notificacion;

import java.time.LocalDateTime;

/**
 * DTO de respuesta para notificaciones.
 */
public record NotificacionResponse(
        Long id,
        TipoNotificacion tipo,
        String titulo,
        String mensaje,
        String urlAccion,
        String datosExtra,
        LocalDateTime fechaCreacion,
        LocalDateTime fechaLectura,
        boolean leida
) {
    public static NotificacionResponse fromEntity(Notificacion notificacion) {
        return new NotificacionResponse(
                notificacion.getId(),
                notificacion.getTipo(),
                notificacion.getTitulo(),
                notificacion.getMensaje(),
                notificacion.getUrlAccion(),
                notificacion.getDatosExtra(),
                notificacion.getFechaCreacion(),
                notificacion.getFechaLectura(),
                notificacion.getFechaLectura() != null
        );
    }
}
