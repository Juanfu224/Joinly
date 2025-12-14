package com.alberti.joinly.dto.suscripcion;

import com.alberti.joinly.dto.usuario.UsuarioSummary;
import com.alberti.joinly.entities.enums.EstadoSuscripcion;
import com.alberti.joinly.entities.enums.Periodicidad;
import com.alberti.joinly.entities.suscripcion.Suscripcion;

import java.math.BigDecimal;
import java.time.LocalDate;

public record SuscripcionResponse(
        Long id,
        ServicioSummary servicio,
        Long idUnidad,
        UsuarioSummary anfitrion,
        BigDecimal precioTotal,
        String moneda,
        BigDecimal precioPorPlaza,
        Short numPlazasTotal,
        Boolean anfitrionOcupaPlaza,
        LocalDate fechaInicio,
        LocalDate fechaRenovacion,
        Periodicidad periodicidad,
        Boolean renovacionAutomatica,
        EstadoSuscripcion estado,
        long plazasDisponibles,
        long plazasOcupadas) {
    public static SuscripcionResponse fromEntity(Suscripcion suscripcion, long plazasDisponibles, long plazasOcupadas) {
        return new SuscripcionResponse(
                suscripcion.getId(),
                ServicioSummary.fromEntity(suscripcion.getServicio()),
                suscripcion.getUnidad().getId(),
                UsuarioSummary.fromEntity(suscripcion.getAnfitrion()),
                suscripcion.getPrecioTotal(),
                suscripcion.getMoneda(),
                suscripcion.getPrecioPorPlaza(),
                suscripcion.getNumPlazasTotal(),
                suscripcion.getAnfitrionOcupaPlaza(),
                suscripcion.getFechaInicio(),
                suscripcion.getFechaRenovacion(),
                suscripcion.getPeriodicidad(),
                suscripcion.getRenovacionAutomatica(),
                suscripcion.getEstado(),
                plazasDisponibles,
                plazasOcupadas);
    }

    public static SuscripcionResponse fromEntity(Suscripcion suscripcion) {
        return fromEntity(suscripcion, 0, 0);
    }
}
