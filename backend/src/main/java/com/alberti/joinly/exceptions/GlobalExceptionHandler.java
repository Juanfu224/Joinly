package com.alberti.joinly.exceptions;

import com.alberti.joinly.dto.common.ApiErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Manejador global de excepciones para la API REST de Joinly.
 * <p>
 * Intercepta excepciones lanzadas por los controladores y las convierte
 * en respuestas HTTP estructuradas con formato JSON uniforme.
 * <p>
 * <b>Mapeo de excepciones a códigos HTTP:</b>
 * <table border="1">
 *   <tr><th>Excepción</th><th>HTTP Status</th><th>Descripción</th></tr>
 *   <tr><td>ResourceNotFoundException</td><td>404</td><td>Recurso no encontrado</td></tr>
 *   <tr><td>DuplicateResourceException</td><td>409</td><td>Conflicto por duplicado</td></tr>
 *   <tr><td>UnauthorizedException</td><td>403</td><td>Sin permisos</td></tr>
 *   <tr><td>BusinessException</td><td>422</td><td>Regla de negocio violada</td></tr>
 *   <tr><td>LimiteAlcanzadoException</td><td>422</td><td>Límite del sistema alcanzado</td></tr>
 *   <tr><td>NoPlazasDisponiblesException</td><td>422</td><td>No hay plazas disponibles</td></tr>
 *   <tr><td>ValidationException</td><td>400</td><td>Datos de entrada inválidos</td></tr>
 * </table>
 *
 * @author Joinly Team
 * @version 1.0
 * @since 2025
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /** Código HTTP 422 - Entidad no procesable (reglas de negocio). */
    private static final int UNPROCESSABLE_ENTITY = 422;

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleResourceNotFound(
            ResourceNotFoundException ex, 
            HttpServletRequest request) {
        
        log.warn("Recurso no encontrado: {}", ex.getMessage());
        var response = new ApiErrorResponse(
                HttpStatus.NOT_FOUND.value(),
                "Not Found",
                ex.getMessage(),
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiErrorResponse> handleBusinessException(
            BusinessException ex, 
            HttpServletRequest request) {
        
        log.warn("Violación de regla de negocio: {}", ex.getMessage());
        var response = new ApiErrorResponse(
                UNPROCESSABLE_ENTITY,
                "Business Rule Violation",
                ex.getMessage(),
                request.getRequestURI()
        );
        return ResponseEntity.status(UNPROCESSABLE_ENTITY).body(response);
    }

    @ExceptionHandler(LimiteAlcanzadoException.class)
    public ResponseEntity<ApiErrorResponse> handleLimiteAlcanzado(
            LimiteAlcanzadoException ex, 
            HttpServletRequest request) {
        
        log.warn("Límite alcanzado: {}", ex.getMessage());
        var response = new ApiErrorResponse(
                UNPROCESSABLE_ENTITY,
                "Limit Reached",
                ex.getMessage(),
                request.getRequestURI()
        );
        return ResponseEntity.status(UNPROCESSABLE_ENTITY).body(response);
    }

    @ExceptionHandler(NoPlazasDisponiblesException.class)
    public ResponseEntity<ApiErrorResponse> handleNoPlazasDisponibles(
            NoPlazasDisponiblesException ex, 
            HttpServletRequest request) {
        
        log.warn("No hay plazas disponibles: {}", ex.getMessage());
        var response = new ApiErrorResponse(
                UNPROCESSABLE_ENTITY,
                "No Available Slots",
                ex.getMessage(),
                request.getRequestURI()
        );
        return ResponseEntity.status(UNPROCESSABLE_ENTITY).body(response);
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ApiErrorResponse> handleUnauthorized(
            UnauthorizedException ex, 
            HttpServletRequest request) {
        
        log.warn("Acceso no autorizado: {}", ex.getMessage());
        var response = new ApiErrorResponse(
                HttpStatus.UNAUTHORIZED.value(),
                "Unauthorized",
                ex.getMessage(),
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ApiErrorResponse> handleDuplicateResource(
            DuplicateResourceException ex, 
            HttpServletRequest request) {
        
        log.warn("Recurso duplicado: {}", ex.getMessage());
        var response = new ApiErrorResponse(
                HttpStatus.CONFLICT.value(),
                "Conflict",
                ex.getMessage(),
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiErrorResponse> handleDataIntegrityViolation(
            DataIntegrityViolationException ex, 
            HttpServletRequest request) {
        
        log.error("Violación de integridad de datos: {}", ex.getMostSpecificCause().getMessage());
        var response = new ApiErrorResponse(
                HttpStatus.CONFLICT.value(),
                "Data Integrity Violation",
                "El recurso ya existe o viola restricciones de la base de datos",
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiErrorResponse> handleIllegalArgument(
            IllegalArgumentException ex, 
            HttpServletRequest request) {
        
        log.warn("Argumento inválido: {}", ex.getMessage());
        var response = new ApiErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "Bad Request",
                ex.getMessage(),
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidationErrors(
            MethodArgumentNotValidException ex, 
            HttpServletRequest request) {
        
        var fieldErrors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> new ApiErrorResponse.FieldError(error.getField(), error.getDefaultMessage()))
                .toList();

        log.warn("Error de validación: {} campos inválidos", fieldErrors.size());
        var response = new ApiErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "Validation Failed",
                "Error de validación en los campos enviados",
                request.getRequestURI(),
                fieldErrors
        );
        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleGenericException(
            Exception ex, 
            HttpServletRequest request) {
        
        log.error("Error interno no controlado: ", ex);
        var response = new ApiErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Internal Server Error",
                "Ha ocurrido un error interno. Por favor, contacte con soporte.",
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
