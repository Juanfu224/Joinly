package com.alberti.joinly.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Respuesta que indica la disponibilidad de un email.
 * <p>
 * Utilizada por el endpoint de validación asíncrona de formularios.
 */
@Schema(description = "Respuesta de verificación de disponibilidad de email")
public record EmailAvailabilityResponse(
        @Schema(
                description = "Indica si el email está disponible para uso",
                example = "true"
        )
        boolean available
) {}
