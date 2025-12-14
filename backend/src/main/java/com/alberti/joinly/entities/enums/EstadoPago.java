package com.alberti.joinly.entities.enums;

/**
 * Estado de un pago en el sistema.
 * - RETENIDO: pago capturado pero no liberado al anfitrión
 * - LIBERADO: pago entregado al anfitrión
 * - DISPUTADO: existe una disputa activa sobre este pago
 */
public enum EstadoPago {
    PENDIENTE,
    FALLIDO,
    RETENIDO,
    LIBERADO,
    REEMBOLSADO,
    REEMBOLSO_PARCIAL,
    DISPUTADO
}
