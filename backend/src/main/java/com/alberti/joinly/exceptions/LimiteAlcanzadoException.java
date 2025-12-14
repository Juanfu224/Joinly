package com.alberti.joinly.exceptions;

/**
 * Excepción lanzada cuando se alcanza un límite configurable del sistema.
 * Ejemplos: máximo de miembros, máximo de grupos por usuario, máximo de suscripciones.
 */
public class LimiteAlcanzadoException extends BusinessException {

    private final String tipoLimite;
    private final int limiteActual;

    public LimiteAlcanzadoException(String message) {
        super(message);
        this.tipoLimite = "desconocido";
        this.limiteActual = 0;
    }

    public LimiteAlcanzadoException(String tipoLimite, int limite) {
        super("Se ha alcanzado el límite máximo de " + tipoLimite + " (" + limite + ")");
        this.tipoLimite = tipoLimite;
        this.limiteActual = limite;
    }

    public String getTipoLimite() {
        return tipoLimite;
    }

    public int getLimiteActual() {
        return limiteActual;
    }
}
