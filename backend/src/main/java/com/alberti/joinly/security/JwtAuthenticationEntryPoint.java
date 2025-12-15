package com.alberti.joinly.security;

import com.alberti.joinly.dto.common.ApiErrorResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Punto de entrada de autenticación personalizado que maneja los errores 401.
 * <p>
 * Se invoca cuando un usuario no autenticado intenta acceder a un recurso protegido.
 * Retorna una respuesta JSON consistente con el formato de errores de la API.
 *
 * @author Joinly Team
 * @version 1.0
 * @since 2025
 */
@Component
@Slf4j
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper()
            .registerModule(new JavaTimeModule());

    /**
     * Maneja las peticiones no autenticadas retornando un error 401.
     *
     * @param request       Petición HTTP
     * @param response      Respuesta HTTP
     * @param authException Excepción de autenticación
     * @throws IOException Si ocurre un error al escribir la respuesta
     */
    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException) throws IOException {
        
        log.warn("Acceso no autenticado a: {} - {}", request.getMethod(), request.getRequestURI());

        var errorResponse = new ApiErrorResponse(
                HttpStatus.UNAUTHORIZED.value(),
                "Unauthorized",
                "Se requiere autenticación para acceder a este recurso",
                request.getRequestURI()
        );

        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");

        OBJECT_MAPPER.writeValue(response.getOutputStream(), errorResponse);
    }
}
