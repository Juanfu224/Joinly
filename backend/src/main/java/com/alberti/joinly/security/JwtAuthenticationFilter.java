package com.alberti.joinly.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Filtro de autenticación JWT que intercepta todas las peticiones HTTP
 * para validar el token de autorización.
 * <p>
 * Este filtro se ejecuta una vez por cada petición y realiza:
 * <ol>
 *   <li>Extracción del token JWT del header Authorization</li>
 *   <li>Validación del token (firma, expiración, etc.)</li>
 *   <li>Carga del usuario desde la base de datos</li>
 *   <li>Establecimiento del contexto de seguridad de Spring</li>
 * </ol>
 * <p>
 * El token debe enviarse en el header {@code Authorization} con el formato:
 * {@code Bearer <token>}
 *
 * @author Joinly Team
 * @version 1.0
 * @since 2025
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    /**
     * Procesa cada petición HTTP para validar el token JWT.
     * <p>
     * Si el token es válido, establece la autenticación en el contexto de seguridad.
     * Si el token es inválido o no está presente, la petición continúa sin autenticación.
     *
     * @param request     Petición HTTP entrante
     * @param response    Respuesta HTTP
     * @param filterChain Cadena de filtros para continuar el procesamiento
     * @throws ServletException Si ocurre un error de servlet
     * @throws IOException      Si ocurre un error de I/O
     */
    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        // Extraer el token del header Authorization
        var token = extractTokenFromRequest(request);

        if (token == null) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            // Extraer el email del token
            var userEmail = jwtService.extractUsername(token);

            // Solo procesar si hay un email y no hay autenticación previa
            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                
                // Verificar que no sea un refresh token usado como access token
                if (jwtService.isRefreshToken(token)) {
                    log.warn("Intento de uso de refresh token como access token para: {}", userEmail);
                    filterChain.doFilter(request, response);
                    return;
                }

                // Cargar el usuario desde la base de datos
                var userDetails = userDetailsService.loadUserByUsername(userEmail);

                // Validar el token contra los detalles del usuario
                if (jwtService.isTokenValid(token, userDetails)) {
                    // Crear el objeto de autenticación
                    var authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );

                    // Añadir detalles de la petición (IP, session ID, etc.)
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    // Establecer la autenticación en el contexto de seguridad
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    
                    log.debug("Usuario autenticado exitosamente: {}", userEmail);
                } else {
                    log.debug("Token inválido para usuario: {}", userEmail);
                }
            }
        } catch (Exception e) {
            log.error("Error al procesar token JWT: {}", e.getMessage());
            // No lanzamos excepción, dejamos que continue sin autenticación
            // El SecurityContext estará vacío y Spring Security manejará el acceso denegado
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Extrae el token JWT del header Authorization de la petición.
     *
     * @param request Petición HTTP
     * @return Token JWT sin el prefijo "Bearer ", o null si no está presente
     */
    private String extractTokenFromRequest(HttpServletRequest request) {
        var authHeader = request.getHeader(AUTHORIZATION_HEADER);
        
        if (StringUtils.hasText(authHeader) && authHeader.startsWith(BEARER_PREFIX)) {
            return authHeader.substring(BEARER_PREFIX.length());
        }
        
        return null;
    }

    /**
     * Determina si este filtro no debe aplicarse a la petición actual.
     * <p>
     * Se excluyen las rutas públicas de autenticación para evitar
     * procesamiento innecesario.
     *
     * @param request Petición HTTP
     * @return {@code true} si el filtro no debe aplicarse
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        var path = request.getServletPath();
        // No filtrar rutas de autenticación pública ni Swagger/OpenAPI
        return path.startsWith("/api/v1/auth/login") 
                || path.startsWith("/api/v1/auth/register")
                || path.startsWith("/api/v1/auth/refresh")
                || path.startsWith("/swagger-ui")
                || path.startsWith("/v3/api-docs")
                || path.startsWith("/actuator");
    }
}
