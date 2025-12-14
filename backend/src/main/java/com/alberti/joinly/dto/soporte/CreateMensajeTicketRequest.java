package com.alberti.joinly.dto.soporte;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTO para crear un mensaje en un ticket.
 */
public record CreateMensajeTicketRequest(
        @NotBlank(message = "El contenido es obligatorio")
        @Size(max = 10000, message = "El contenido no puede exceder 10000 caracteres")
        String contenido,

        boolean esInterno,

        String adjuntos
) {}
