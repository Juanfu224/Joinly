package com.alberti.joinly.dto.disputa;

import com.alberti.joinly.entities.enums.EstadoDisputa;
import com.alberti.joinly.entities.enums.MotivoDisputa;
import com.alberti.joinly.entities.enums.ResolucionDisputa;
import com.alberti.joinly.entities.pago.Disputa;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO de respuesta para información de disputas.
 */
public record DisputaResponse(
        Long id,
        Long idPago,
        Long idReclamante,
        String nombreReclamante,
        MotivoDisputa motivo,
        String descripcion,
        String evidenciaUrls,
        LocalDateTime fechaApertura,
        LocalDateTime fechaResolucion,
        ResolucionDisputa resolucion,
        BigDecimal montoResuelto,
        String notasResolucion,
        Long idAgenteResolutor,
        String nombreAgente,
        EstadoDisputa estado
) {
    public static DisputaResponse fromEntity(Disputa disputa) {
        return new DisputaResponse(
                disputa.getId(),
                disputa.getPago().getId(),
                disputa.getReclamante().getId(),
                disputa.getReclamante().getNombre(),
                disputa.getMotivo(),
                disputa.getDescripcion(),
                disputa.getEvidenciaUrls(),
                disputa.getFechaApertura(),
                disputa.getFechaResolucion(),
                disputa.getResolucion(),
                disputa.getMontoResuelto(),
                disputa.getNotasResolucion(),
                disputa.getAgenteResolutor() != null ? disputa.getAgenteResolutor().getId() : null,
                disputa.getAgenteResolutor() != null ? disputa.getAgenteResolutor().getNombre() : null,
                disputa.getEstado()
        );
    }
}
