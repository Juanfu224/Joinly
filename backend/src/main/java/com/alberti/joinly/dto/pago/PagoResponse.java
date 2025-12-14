package com.alberti.joinly.dto.pago;

import com.alberti.joinly.entities.enums.EstadoPago;
import com.alberti.joinly.entities.pago.Pago;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO de respuesta para información de pagos.
 */
public record PagoResponse(
        Long id,
        Long idUsuario,
        Long idPlaza,
        Long idSuscripcion,
        String nombreServicio,
        BigDecimal monto,
        String moneda,
        BigDecimal montoReembolsado,
        LocalDateTime fechaPago,
        LocalDate fechaRetencionHasta,
        LocalDateTime fechaLiberacion,
        String referenciaExterna,
        EstadoPago estado,
        LocalDate cicloInicio,
        LocalDate cicloFin
) {
    public static PagoResponse fromEntity(Pago pago) {
        var nombreServicio = pago.getSuscripcion() != null && pago.getSuscripcion().getServicio() != null
                ? pago.getSuscripcion().getServicio().getNombre()
                : null;

        return new PagoResponse(
                pago.getId(),
                pago.getUsuario().getId(),
                pago.getPlaza().getId(),
                pago.getSuscripcion().getId(),
                nombreServicio,
                pago.getMonto(),
                pago.getMoneda(),
                pago.getMontoReembolsado(),
                pago.getFechaPago(),
                pago.getFechaRetencionHasta(),
                pago.getFechaLiberacion(),
                pago.getReferenciaExterna(),
                pago.getEstado(),
                pago.getCicloInicio(),
                pago.getCicloFin()
        );
    }
}
