package com.alberti.joinly.dto.suscripcion;

import com.alberti.joinly.dto.usuario.UsuarioSummary;
import com.alberti.joinly.entities.enums.EstadoSuscripcion;
import com.alberti.joinly.entities.enums.Periodicidad;
import com.alberti.joinly.entities.suscripcion.Suscripcion;
import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDate;

@Schema(description = "Información completa de una suscripción compartida")
public record SuscripcionResponse(
        @Schema(description = "ID único de la suscripción", example = "1")
        Long id,
        
        @Schema(description = "Información resumida del servicio (Netflix, Spotify, etc.)")
        ServicioSummary servicio,
        
        @Schema(description = "ID de la unidad familiar", example = "1")
        Long idUnidad,
        
        @Schema(description = "Información resumida del usuario anfitrión")
        UsuarioSummary anfitrion,
        
        @Schema(description = "Precio total de la suscripción", example = "15.99")
        BigDecimal precioTotal,
        
        @Schema(description = "Moneda del precio", example = "EUR")
        String moneda,
        
        @Schema(description = "Precio calculado por plaza", example = "3.99")
        BigDecimal precioPorPlaza,
        
        @Schema(description = "Número total de plazas", example = "4")
        Short numPlazasTotal,
        
        @Schema(description = "Indica si el anfitrión ocupa una plaza", example = "true")
        Boolean anfitrionOcupaPlaza,
        
        @Schema(description = "Fecha de inicio de la suscripción", example = "2025-01-01")
        LocalDate fechaInicio,
        
        @Schema(description = "Próxima fecha de renovación", example = "2025-02-01")
        LocalDate fechaRenovacion,
        
        @Schema(description = "Periodicidad del pago", example = "MENSUAL")
        Periodicidad periodicidad,
        
        @Schema(description = "Si se renueva automáticamente", example = "true")
        Boolean renovacionAutomatica,
        
        @Schema(description = "Estado actual de la suscripción", example = "ACTIVA")
        EstadoSuscripcion estado,
        
        @Schema(description = "Plazas disponibles para ocupar", example = "2")
        long plazasDisponibles,
        
        @Schema(description = "Plazas actualmente ocupadas", example = "2")
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
