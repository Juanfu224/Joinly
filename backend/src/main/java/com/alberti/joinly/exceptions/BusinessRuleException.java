package com.alberti.joinly.exceptions;

/**
 * Excepción para violaciones de reglas de negocio.
 * Se traduce automáticamente a HTTP 422 Unprocessable Entity.
 */
public class BusinessRuleException extends RuntimeException {

    public BusinessRuleException(String message) {
        super(message);
    }

    public BusinessRuleException(String message, Throwable cause) {
        super(message, cause);
    }
}
