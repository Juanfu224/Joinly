package com.alberti.joinly.dto.solicitud;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateSolicitudSuscripcionRequest(
        @NotNull(message = "El ID de la suscripción es obligatorio")
        Long idSuscripcion,
        
        @Size(max = 500, message = "El mensaje no puede exceder 500 caracteres")
        String mensaje
) {}
