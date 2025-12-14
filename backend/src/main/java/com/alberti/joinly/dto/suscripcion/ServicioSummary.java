package com.alberti.joinly.dto.suscripcion;

import com.alberti.joinly.entities.enums.CategoriaServicio;
import com.alberti.joinly.entities.suscripcion.Servicio;

import java.math.BigDecimal;

public record ServicioSummary(
        Long id,
        String nombre,
        CategoriaServicio categoria,
        String logo,
        String descripcion,
        Short maxUsuarios,
        BigDecimal precioReferencia) {
    public static ServicioSummary fromEntity(Servicio servicio) {
        return new ServicioSummary(
                servicio.getId(),
                servicio.getNombre(),
                servicio.getCategoria(),
                servicio.getLogo(),
                servicio.getDescripcion(),
                servicio.getMaxUsuarios(),
                servicio.getPrecioReferencia());
    }
}
