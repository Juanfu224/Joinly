package com.alberti.joinly.dto.pago;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

/**
 * DTO para crear un nuevo pago.
 */
public record CreatePagoRequest(
        @NotNull(message = "El ID de la plaza es obligatorio")
        Long idPlaza,

        @NotNull(message = "El ID del método de pago es obligatorio")
        Long idMetodoPago,

        @NotNull(message = "El monto es obligatorio")
        @Positive(message = "El monto debe ser positivo")
        BigDecimal monto
) {}
