package com.alberti.joinly.dto.suscripcion;

import com.alberti.joinly.dto.usuario.UsuarioSummary;
import com.alberti.joinly.entities.enums.EstadoPlaza;
import com.alberti.joinly.entities.suscripcion.Plaza;

import java.time.LocalDateTime;

public record PlazaResponse(
        Long id,
        Long idSuscripcion,
        UsuarioSummary usuario,
        Short numeroPlaza,
        Boolean esPlazaAnfitrion,
        LocalDateTime fechaOcupacion,
        EstadoPlaza estado) {
    public static PlazaResponse fromEntity(Plaza plaza) {
        return new PlazaResponse(
                plaza.getId(),
                plaza.getSuscripcion().getId(),
                plaza.getUsuario() != null ? UsuarioSummary.fromEntity(plaza.getUsuario()) : null,
                plaza.getNumeroPlaza(),
                plaza.getEsPlazaAnfitrion(),
                plaza.getFechaOcupacion(),
                plaza.getEstado());
    }
}
