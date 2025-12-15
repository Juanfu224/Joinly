package com.alberti.joinly.dto.pago;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

/**
 * DTO para crear un nuevo pago.
 */
@Schema(description = "Datos para procesar un pago por una plaza en una suscripción")
public record CreatePagoRequest(
        @NotNull(message = "El ID de la plaza es obligatorio")
        @Schema(description = "ID de la plaza de suscripción a pagar", example = "1")
        Long idPlaza,

        @NotNull(message = "El ID del método de pago es obligatorio")
        @Schema(description = "ID del método de pago registrado a utilizar", example = "1")
        Long idMetodoPago,

        @NotNull(message = "El monto es obligatorio")
        @Positive(message = "El monto debe ser positivo")
        @Schema(description = "Monto a pagar (precio de la plaza)", example = "3.99")
        BigDecimal monto
) {}
