package com.alberti.joinly.dto.servicio;

import com.alberti.joinly.entities.enums.CategoriaServicio;
import com.alberti.joinly.entities.suscripcion.Servicio;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ServicioResponse(
        Long id,
        String nombre,
        CategoriaServicio categoria,
        String logo,
        String descripcion,
        String urlOficial,
        Short maxUsuarios,
        BigDecimal precioReferencia,
        String monedaReferencia,
        Boolean activo,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {

    public static ServicioResponse fromEntity(Servicio servicio) {
        return new ServicioResponse(
                servicio.getId(),
                servicio.getNombre(),
                servicio.getCategoria(),
                servicio.getLogo(),
                servicio.getDescripcion(),
                servicio.getUrlOficial(),
                servicio.getMaxUsuarios(),
                servicio.getPrecioReferencia(),
                servicio.getMonedaReferencia(),
                servicio.getActivo(),
                servicio.getCreatedAt(),
                servicio.getUpdatedAt());
    }
}
