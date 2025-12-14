package com.alberti.joinly.dto.unidad;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record JoinByCodeRequest(
        @NotBlank(message = "El código de invitación es obligatorio")
        @Size(min = 12, max = 12, message = "El código debe tener exactamente 12 caracteres")
        String codigoInvitacion
) {}
