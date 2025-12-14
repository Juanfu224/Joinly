package com.alberti.joinly.dto.solicitud;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateSolicitudGrupoRequest(
        @NotBlank(message = "El código de invitación es obligatorio")
        @Size(min = 12, max = 12, message = "El código debe tener exactamente 12 caracteres")
        String codigoInvitacion,
        
        @Size(max = 500, message = "El mensaje no puede exceder 500 caracteres")
        String mensaje
) {}
