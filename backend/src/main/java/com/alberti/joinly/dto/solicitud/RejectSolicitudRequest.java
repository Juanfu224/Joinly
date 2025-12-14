package com.alberti.joinly.dto.solicitud;

import jakarta.validation.constraints.Size;

public record RejectSolicitudRequest(
        @Size(max = 255, message = "El motivo no puede exceder 255 caracteres")
        String motivoRechazo
) {}
