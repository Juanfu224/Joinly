package com.alberti.joinly.security;

import com.alberti.joinly.dto.common.ApiErrorResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Manejador personalizado para errores de acceso denegado (403 Forbidden).
 * <p>
 * Se invoca cuando un usuario autenticado intenta acceder a un recurso
 * para el cual no tiene permisos suficientes.
 *
 * @author Joinly Team
 * @version 1.0
 * @since 2025
 */
@Component
@Slf4j
public class JwtAccessDeniedHandler implements AccessDeniedHandler {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    /**
     * Maneja las peticiones con acceso denegado retornando un error 403.
     *
     * @param request               Petición HTTP
     * @param response              Respuesta HTTP
     * @param accessDeniedException Excepción de acceso denegado
     * @throws IOException Si ocurre un error al escribir la respuesta
     */
    @Override
    public void handle(HttpServletRequest request,
                       HttpServletResponse response,
                       AccessDeniedException accessDeniedException) throws IOException {
        
        log.warn("Acceso denegado a: {} {} - {}", 
                request.getMethod(), 
                request.getRequestURI(), 
                accessDeniedException.getMessage());

        var errorResponse = new ApiErrorResponse(
                HttpStatus.FORBIDDEN.value(),
                "Forbidden",
                "No tienes permisos suficientes para acceder a este recurso",
                request.getRequestURI()
        );

        response.setStatus(HttpStatus.FORBIDDEN.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");

        OBJECT_MAPPER.writeValue(response.getOutputStream(), errorResponse);
    }
}
