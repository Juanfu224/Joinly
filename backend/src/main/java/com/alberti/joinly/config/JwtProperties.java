package com.alberti.joinly.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Propiedades de configuración para JWT (JSON Web Tokens).
 * <p>
 * Estas propiedades se cargan desde {@code application.properties} con el prefijo {@code jwt.*}.
 * <p>
 * <b>Propiedades disponibles:</b>
 * <ul>
 *   <li>{@code jwt.secret-key}: Clave secreta para firmar tokens (min. 256 bits para HS256)</li>
 *   <li>{@code jwt.access-token-expiration}: Duración del access token en milisegundos</li>
 *   <li>{@code jwt.refresh-token-expiration}: Duración del refresh token en milisegundos</li>
 * </ul>
 *
 * @author Joinly Team
 * @version 1.0
 * @since 2025
 */
@ConfigurationProperties(prefix = "jwt")
public record JwtProperties(
        /**
         * Clave secreta para firmar los tokens JWT.
         * <p>
         * <b>IMPORTANTE:</b> Debe tener al menos 256 bits (32 caracteres) para HS256.
         * En producción, usar variables de entorno o vault de secretos.
         */
        String secretKey,
        
        /**
         * Duración del access token en milisegundos.
         * <p>
         * Valor recomendado: 15 minutos a 24 horas dependiendo del caso de uso.
         */
        long accessTokenExpiration,
        
        /**
         * Duración del refresh token en milisegundos.
         * <p>
         * Valor recomendado: 7 a 30 días.
         */
        long refreshTokenExpiration
) {
    /**
     * Constructor con valores por defecto si no se especifican.
     */
    public JwtProperties {
        if (secretKey == null || secretKey.isBlank()) {
            throw new IllegalArgumentException("jwt.secret-key es obligatorio y no puede estar vacío");
        }
        if (accessTokenExpiration <= 0) {
            accessTokenExpiration = 86400000L; // 24 horas por defecto
        }
        if (refreshTokenExpiration <= 0) {
            refreshTokenExpiration = 604800000L; // 7 días por defecto
        }
    }
}
