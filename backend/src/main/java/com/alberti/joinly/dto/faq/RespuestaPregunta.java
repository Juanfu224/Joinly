package com.alberti.joinly.dto.faq;

import com.alberti.joinly.entities.faq.PreguntaFrecuente;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Datos de una pregunta frecuente")
public record RespuestaPregunta(
    Long id,
    String pregunta,
    String respuesta,
    String categoria,
    Integer orden
) {
    public static RespuestaPregunta fromEntity(PreguntaFrecuente entity) {
        return new RespuestaPregunta(
            entity.getId(),
            entity.getPregunta(),
            entity.getRespuesta(),
            entity.getCategoria().name(),
            entity.getOrden()
        );
    }
}
