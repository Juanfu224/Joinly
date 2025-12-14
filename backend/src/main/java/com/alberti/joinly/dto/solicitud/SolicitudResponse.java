package com.alberti.joinly.dto.solicitud;

import com.alberti.joinly.dto.suscripcion.SuscripcionSummary;
import com.alberti.joinly.dto.unidad.UnidadFamiliarSummary;
import com.alberti.joinly.dto.usuario.UsuarioSummary;
import com.alberti.joinly.entities.enums.EstadoSolicitud;
import com.alberti.joinly.entities.enums.TipoSolicitud;
import com.alberti.joinly.entities.grupo.Solicitud;

import java.time.LocalDateTime;

public record SolicitudResponse(
        Long id,
        TipoSolicitud tipoSolicitud,
        UsuarioSummary solicitante,
        UnidadFamiliarSummary unidad,
        SuscripcionSummary suscripcion,
        String mensaje,
        LocalDateTime fechaSolicitud,
        LocalDateTime fechaRespuesta,
        EstadoSolicitud estado,
        String motivoRechazo,
        UsuarioSummary aprobador
) {
    public static SolicitudResponse fromEntity(Solicitud solicitud) {
        return new SolicitudResponse(
                solicitud.getId(),
                solicitud.getTipoSolicitud(),
                UsuarioSummary.fromEntity(solicitud.getSolicitante()),
                solicitud.getUnidad() != null ? UnidadFamiliarSummary.fromEntity(solicitud.getUnidad()) : null,
                solicitud.getSuscripcion() != null ? SuscripcionSummary.fromEntity(solicitud.getSuscripcion()) : null,
                solicitud.getMensaje(),
                solicitud.getFechaSolicitud(),
                solicitud.getFechaRespuesta(),
                solicitud.getEstado(),
                solicitud.getMotivoRechazo(),
                solicitud.getAprobador() != null ? UsuarioSummary.fromEntity(solicitud.getAprobador()) : null
        );
    }
}
