package com.alberti.joinly.entities.enums;

/**
 * Tipos de token para autenticación y verificación.
 * - RECUPERACION: expira en 1 hora
 * - VERIFICACION: para verificación de email
 * - REFRESH_TOKEN: expira en 30 días
 */
public enum TipoToken {
    RECUPERACION,
    VERIFICACION,
    REFRESH_TOKEN
}
