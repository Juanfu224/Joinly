package com.alberti.joinly.dto.unidad;

import com.alberti.joinly.dto.usuario.UsuarioSummary;
import com.alberti.joinly.entities.enums.EstadoUnidadFamiliar;
import com.alberti.joinly.entities.grupo.UnidadFamiliar;

import java.time.LocalDateTime;

public record UnidadFamiliarResponse(
        Long id,
        String nombre,
        String codigoInvitacion,
        UsuarioSummary administrador,
        LocalDateTime fechaCreacion,
        String descripcion,
        Short maxMiembros,
        EstadoUnidadFamiliar estado
) {
    public static UnidadFamiliarResponse fromEntity(UnidadFamiliar unidad) {
        return new UnidadFamiliarResponse(
                unidad.getId(),
                unidad.getNombre(),
                unidad.getCodigoInvitacion(),
                UsuarioSummary.fromEntity(unidad.getAdministrador()),
                unidad.getFechaCreacion(),
                unidad.getDescripcion(),
                unidad.getMaxMiembros(),
                unidad.getEstado()
        );
    }
}
