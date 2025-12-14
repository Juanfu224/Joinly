package com.alberti.joinly.exceptions;

/**
 * Excepción lanzada cuando se intenta unirse a una suscripción sin plazas disponibles.
 * Representa un error 422 (Unprocessable Entity) ya que es una violación de reglas de negocio.
 */
public class NoPlazasDisponiblesException extends BusinessException {

    public NoPlazasDisponiblesException() {
        super("No hay plazas disponibles en esta suscripción");
    }

    public NoPlazasDisponiblesException(String message) {
        super(message);
    }

    public NoPlazasDisponiblesException(Long idSuscripcion) {
        super("No hay plazas disponibles en la suscripción con ID: " + idSuscripcion);
    }
}
