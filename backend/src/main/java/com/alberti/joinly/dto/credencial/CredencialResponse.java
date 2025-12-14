package com.alberti.joinly.dto.credencial;

import com.alberti.joinly.entities.enums.TipoCredencial;
import com.alberti.joinly.entities.suscripcion.Credencial;

import java.time.LocalDateTime;

/**
 * DTO de respuesta para credenciales (valor desencriptado).
 */
public record CredencialResponse(
        Long id,
        Long idSuscripcion,
        TipoCredencial tipo,
        String etiqueta,
        String valor,
        String instrucciones,
        boolean visibleParaMiembros,
        LocalDateTime fechaActualizacion
) {
    public static CredencialResponse fromEntity(Credencial credencial, String valorDesencriptado) {
        return new CredencialResponse(
                credencial.getId(),
                credencial.getSuscripcion().getId(),
                credencial.getTipo(),
                credencial.getEtiqueta(),
                valorDesencriptado,
                credencial.getInstrucciones(),
                credencial.getVisibleParaMiembros(),
                credencial.getFechaActualizacion()
        );
    }
}
