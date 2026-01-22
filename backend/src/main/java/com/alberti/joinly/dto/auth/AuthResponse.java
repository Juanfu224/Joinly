package com.alberti.joinly.dto.auth;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

import java.time.LocalDateTime;

/**
 * DTO de respuesta para operaciones de autenticación.
 * <p>
 * Contiene los tokens JWT y la información básica del usuario autenticado.
 * Los campos nulos se excluyen de la serialización JSON.
 *
 * @param id               ID único del usuario
 * @param nombre           Nombre del usuario
 * @param email            Email del usuario
 * @param temaPreferido    Tema preferido del usuario ('light' o 'dark')
 * @param emailVerificado  Indica si el email ha sido verificado
 * @param telefono         Teléfono del usuario
 * @param avatar           URL del avatar del usuario
 * @param fechaRegistro    Fecha de registro del usuario
 * @param fechaUltimoAcceso Fecha del último acceso
 * @param accessToken      Token JWT de acceso (corta duración)
 * @param refreshToken     Token JWT de refresco (larga duración)
 * @param tokenType        Tipo de token (siempre "Bearer")
 * @param expiresIn        Segundos hasta la expiración del access token
 * @param mensaje          Mensaje descriptivo de la operación
 */
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Respuesta de autenticación con tokens JWT")
public record AuthResponse(
        @Schema(description = "ID único del usuario", example = "1")
        Long id,

        @Schema(description = "Nombre del usuario", example = "Juan García")
        String nombre,

        @Schema(description = "Email del usuario", example = "juan@example.com")
        String email,

        @Schema(description = "Tema preferido del usuario", example = "light")
        String temaPreferido,

        @Schema(description = "Indica si el email ha sido verificado", example = "false")
        Boolean emailVerificado,

        @Schema(description = "Teléfono del usuario", example = "+34 612 345 678")
        String telefono,

        @Schema(description = "Fecha de registro del usuario")
        LocalDateTime fechaRegistro,

        @Schema(description = "Fecha del último acceso del usuario")
        LocalDateTime fechaUltimoAcceso,

        @Schema(description = "URL del avatar del usuario", example = "/uploads/avatars/abc123.jpg")
        String avatar,

        @Schema(description = "Token JWT de acceso", example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
        String accessToken,

        @Schema(description = "Token JWT de refresco para renovar el access token")
        String refreshToken,

        @Schema(description = "Tipo de token", example = "Bearer")
        String tokenType,

        @Schema(description = "Segundos hasta la expiración del access token", example = "3600")
        Long expiresIn,

        @Schema(description = "Mensaje descriptivo del resultado", example = "Inicio de sesión exitoso")
        String mensaje
) {
}
