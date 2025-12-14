package com.alberti.joinly.dto.auth;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

/**
 * DTO de respuesta para operaciones de autenticación.
 * <p>
 * Contiene los tokens JWT y la información básica del usuario autenticado.
 * Los campos nulos se excluyen de la serialización JSON.
 *
 * @param id           ID único del usuario
 * @param nombre       Nombre del usuario
 * @param email        Email del usuario
 * @param accessToken  Token JWT de acceso (corta duración)
 * @param refreshToken Token JWT de refresco (larga duración)
 * @param tokenType    Tipo de token (siempre "Bearer")
 * @param expiresIn    Segundos hasta la expiración del access token
 * @param mensaje      Mensaje descriptivo de la operación
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
    /**
     * Crea una respuesta para un registro exitoso sin tokens (backward compatibility).
     *
     * @param id     ID del usuario registrado
     * @param nombre Nombre del usuario
     * @param email  Email del usuario
     * @return AuthResponse sin tokens
     * @deprecated Usar el builder completo con tokens
     */
    @Deprecated(since = "1.0", forRemoval = true)
    public static AuthResponse registered(Long id, String nombre, String email) {
        return AuthResponse.builder()
                .id(id)
                .nombre(nombre)
                .email(email)
                .mensaje("Usuario registrado exitosamente")
                .build();
    }

    /**
     * Crea una respuesta para un login exitoso (backward compatibility).
     *
     * @param id     ID del usuario
     * @param nombre Nombre del usuario
     * @param email  Email del usuario
     * @param token  Token JWT de acceso
     * @return AuthResponse con token
     * @deprecated Usar el builder completo con ambos tokens
     */
    @Deprecated(since = "1.0", forRemoval = true)
    public static AuthResponse loggedIn(Long id, String nombre, String email, String token) {
        return AuthResponse.builder()
                .id(id)
                .nombre(nombre)
                .email(email)
                .accessToken(token)
                .tokenType("Bearer")
                .mensaje("Inicio de sesión exitoso")
                .build();
    }
}
