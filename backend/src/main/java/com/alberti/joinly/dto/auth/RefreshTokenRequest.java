package com.alberti.joinly.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

/**
 * DTO de petición para renovar tokens JWT.
 *
 * @param refreshToken Token de refresco válido obtenido durante login o registro
 */
@Schema(description = "Petición para renovar tokens JWT")
public record RefreshTokenRequest(
        @NotBlank(message = "El refresh token es obligatorio")
        @Schema(description = "Token JWT de refresco", requiredMode = Schema.RequiredMode.REQUIRED)
        String refreshToken
) {}
