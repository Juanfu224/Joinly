package com.alberti.joinly.dto.pago;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

/**
 * DTO para solicitar un reembolso.
 */
public record ReembolsoRequest(
        @NotNull(message = "El ID del pago es obligatorio")
        Long idPago,

        @NotNull(message = "El monto a reembolsar es obligatorio")
        @Positive(message = "El monto debe ser positivo")
        BigDecimal monto,

        String motivo
) {}
