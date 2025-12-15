package com.alberti.joinly.dto.metodopago;

import com.alberti.joinly.entities.enums.EstadoMetodoPago;
import com.alberti.joinly.entities.enums.TipoMetodoPago;
import com.alberti.joinly.entities.usuario.MetodoPagoUsuario;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO de respuesta para información de métodos de pago del usuario.
 * <p>
 * Expone solo información segura del método de pago (nunca datos completos de tarjeta).
 * Cumple con PCI-DSS al mostrar únicamente los últimos 4 dígitos de tarjetas.
 *
 * @param id ID del método de pago
 * @param tipo Tipo de método (TARJETA, PAYPAL, CUENTA_BANCARIA)
 * @param ultimosDigitos Últimos 4 dígitos (solo para tarjetas)
 * @param marca Marca de la tarjeta (Visa, Mastercard, etc.)
 * @param fechaExpiracion Fecha de expiración (solo para tarjetas)
 * @param esPredeterminado Si es el método de pago predeterminado del usuario
 * @param estado Estado del método (ACTIVO, EXPIRADO, ELIMINADO)
 * @param fechaRegistro Fecha de registro del método
 */
public record MetodoPagoResponse(
        Long id,
        TipoMetodoPago tipo,
        String ultimosDigitos,
        String marca,
        LocalDate fechaExpiracion,
        Boolean esPredeterminado,
        EstadoMetodoPago estado,
        LocalDateTime fechaRegistro
) {
    /**
     * Convierte una entidad MetodoPagoUsuario a DTO de respuesta.
     *
     * @param metodoPago Entidad a convertir
     * @return DTO con información segura del método de pago
     */
    public static MetodoPagoResponse fromEntity(MetodoPagoUsuario metodoPago) {
        return new MetodoPagoResponse(
                metodoPago.getId(),
                metodoPago.getTipo(),
                metodoPago.getUltimosDigitos(),
                metodoPago.getMarca(),
                metodoPago.getFechaExpiracion(),
                metodoPago.getEsPredeterminado(),
                metodoPago.getEstado(),
                metodoPago.getFechaRegistro()
        );
    }
}
