package com.alberti.joinly.dto.suscripcion;

import com.alberti.joinly.entities.enums.EstadoSuscripcion;
import com.alberti.joinly.entities.enums.Periodicidad;
import com.alberti.joinly.entities.suscripcion.Suscripcion;

import java.math.BigDecimal;
import java.time.LocalDate;

public record SuscripcionSummary(
        Long id,
        String nombreServicio,
        String logoServicio,
        BigDecimal precioPorPlaza,
        LocalDate fechaRenovacion,
        Periodicidad periodicidad,
        EstadoSuscripcion estado,
        Short numPlazasTotal) {
    public static SuscripcionSummary fromEntity(Suscripcion suscripcion) {
        return new SuscripcionSummary(
                suscripcion.getId(),
                suscripcion.getServicio().getNombre(),
                suscripcion.getServicio().getLogo(),
                suscripcion.getPrecioPorPlaza(),
                suscripcion.getFechaRenovacion(),
                suscripcion.getPeriodicidad(),
                suscripcion.getEstado(),
                suscripcion.getNumPlazasTotal());
    }
}
