package com.alberti.joinly.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

/**
 * Propiedades de configuración para CORS (Cross-Origin Resource Sharing).
 * <p>
 * Estas propiedades se cargan desde {@code application.properties} con el prefijo {@code cors.*}.
 * <p>
 * <b>Propiedades disponibles:</b>
 * <ul>
 *   <li>{@code cors.allowed-origins}: Orígenes permitidos (URLs del frontend)</li>
 *   <li>{@code cors.allowed-methods}: Métodos HTTP permitidos</li>
 *   <li>{@code cors.allowed-headers}: Headers permitidos en las peticiones</li>
 *   <li>{@code cors.exposed-headers}: Headers expuestos al frontend</li>
 *   <li>{@code cors.max-age}: Tiempo máximo de caché para preflight requests (segundos)</li>
 * </ul>
 *
 * @author Joinly Team
 * @version 1.0
 * @since 2025
 */
@ConfigurationProperties(prefix = "cors")
public record CorsProperties(
        /**
         * Lista de orígenes permitidos para peticiones CORS.
         * <p>
         * Ejemplo: {@code http://localhost:4200,http://localhost:3000}
         */
        List<String> allowedOrigins,
        
        /**
         * Lista de métodos HTTP permitidos.
         * <p>
         * Ejemplo: {@code GET,POST,PUT,DELETE,OPTIONS,PATCH}
         */
        List<String> allowedMethods,
        
        /**
         * Lista de headers permitidos en las peticiones.
         * <p>
         * Usar {@code *} para permitir todos los headers.
         */
        List<String> allowedHeaders,
        
        /**
         * Lista de headers que el frontend puede leer de la respuesta.
         * <p>
         * Ejemplo: {@code Authorization,Content-Type}
         */
        List<String> exposedHeaders,
        
        /**
         * Tiempo máximo en segundos que el navegador puede cachear
         * la respuesta de preflight.
         */
        Long maxAge
) {
    /**
     * Constructor con valores por defecto.
     */
    public CorsProperties {
        if (allowedOrigins == null || allowedOrigins.isEmpty()) {
            allowedOrigins = List.of("http://localhost:4200", "http://localhost:3000");
        }
        if (allowedMethods == null || allowedMethods.isEmpty()) {
            allowedMethods = List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH");
        }
        if (allowedHeaders == null || allowedHeaders.isEmpty()) {
            allowedHeaders = List.of("*");
        }
        if (exposedHeaders == null) {
            exposedHeaders = List.of("Authorization", "Content-Type");
        }
        if (maxAge == null || maxAge <= 0) {
            maxAge = 3600L;
        }
    }
}
