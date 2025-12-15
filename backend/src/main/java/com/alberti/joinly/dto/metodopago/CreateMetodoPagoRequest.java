package com.alberti.joinly.dto.metodopago;

import com.alberti.joinly.entities.enums.TipoMetodoPago;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/**
 * DTO para registrar un nuevo método de pago.
 * <p>
 * El token de pasarela debe obtenerse previamente desde el frontend
 * mediante la integración con Stripe/PayPal (PCI-DSS compliant).
 * <p>
 * NUNCA enviar datos completos de tarjeta al backend.
 *
 * @param tipo Tipo de método de pago (TARJETA, PAYPAL, CUENTA_BANCARIA)
 * @param ultimosDigitos Últimos 4 dígitos de la tarjeta (opcional, solo para tarjetas)
 * @param marca Marca de la tarjeta como Visa, Mastercard (opcional)
 * @param tokenPasarela Token generado por la pasarela de pago (requerido, PCI-DSS compliant)
 * @param fechaExpiracion Fecha de expiración en formato MM/AA (opcional, solo para tarjetas)
 * @param esPredeterminado Si debe marcarse como método predeterminado
 */
@Schema(description = "Datos para registrar un nuevo método de pago tokenizado (PCI-DSS compliant)")
public record CreateMetodoPagoRequest(
        @NotNull(message = "El tipo de método de pago es obligatorio")
        @Schema(description = "Tipo de método de pago", example = "TARJETA")
        TipoMetodoPago tipo,

        @Pattern(regexp = "^\\d{4}$", message = "Los últimos dígitos deben ser exactamente 4 números")
        @Schema(description = "Últimos 4 dígitos de la tarjeta", example = "4242")
        String ultimosDigitos,

        @Size(max = 20, message = "La marca no puede exceder 20 caracteres")
        @Schema(description = "Marca de la tarjeta", example = "Visa")
        String marca,

        @NotNull(message = "El token de la pasarela de pago es obligatorio")
        @Size(min = 10, max = 255, message = "El token debe tener entre 10 y 255 caracteres")
        @Schema(description = "Token generado por Stripe/PayPal (NO enviar datos reales de tarjeta)", 
                example = "tok_1Hq2eL2eZvKYlo2C6D9S3zKL")
        String tokenPasarela,

        @Schema(description = "Fecha de expiración de la tarjeta", example = "2027-12-31")
        LocalDate fechaExpiracion,

        @Schema(description = "Marcar como método predeterminado", example = "false")
        Boolean esPredeterminado
) {
    /**
     * Constructor que establece valores por defecto para campos opcionales.
     */
    public CreateMetodoPagoRequest {
        esPredeterminado = esPredeterminado != null ? esPredeterminado : false;
    }
}
