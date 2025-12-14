package com.alberti.joinly.dto.unidad;

import com.alberti.joinly.entities.grupo.UnidadFamiliar;

import java.time.LocalDateTime;

public record UnidadFamiliarSummary(
        Long id,
        String nombre,
        String descripcion,
        LocalDateTime fechaCreacion
) {
    public static UnidadFamiliarSummary fromEntity(UnidadFamiliar unidad) {
        return new UnidadFamiliarSummary(
                unidad.getId(),
                unidad.getNombre(),
                unidad.getDescripcion(),
                unidad.getFechaCreacion()
        );
    }
}
