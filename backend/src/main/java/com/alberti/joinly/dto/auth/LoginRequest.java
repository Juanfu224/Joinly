package com.alberti.joinly.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Datos para iniciar sesión en la plataforma")
public record LoginRequest(
        @NotBlank(message = "El email es obligatorio")
        @Email(message = "El email debe tener un formato válido")
        @Schema(description = "Email del usuario", example = "juan.perez@example.com")
        String email,
        
        @NotBlank(message = "La contraseña es obligatoria")
        @Schema(description = "Contraseña del usuario", example = "MiPassword123!")
        String password
) {}
