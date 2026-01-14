package com.alberti.joinly.dto.suscripcion;

import com.alberti.joinly.entities.enums.Periodicidad;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO para crear una nueva suscripción compartida.
 * <p>
 * Permite dos modos de identificación del servicio:
 * <ul>
 *   <li><b>idServicio</b>: Referencia a un servicio existente en el catálogo</li>
 *   <li><b>nombreServicio</b>: Nombre del servicio (se buscará o creará automáticamente)</li>
 * </ul>
 * Al menos uno de los dos campos debe estar presente.
 *
 * @author Joinly Team
 * @since 2025
 */
@Schema(description = "Datos para crear una nueva suscripción compartida")
public record CreateSuscripcionRequest(
        @NotNull(message = "El ID de la unidad familiar es obligatorio")
        @Schema(description = "ID de la unidad familiar donde se creará la suscripción", example = "1")
        Long idUnidad,
        
        @Schema(description = "ID del servicio de streaming (opcional si se proporciona nombreServicio)", example = "1")
        Long idServicio,
        
        @Size(min = 2, max = 100, message = "El nombre del servicio debe tener entre 2 y 100 caracteres")
        @Schema(description = "Nombre del servicio (opcional si se proporciona idServicio)", example = "Netflix Premium")
        String nombreServicio,
        
        @NotNull(message = "El precio total es obligatorio")
        @DecimalMin(value = "0.01", message = "El precio debe ser mayor a 0")
        @Digits(integer = 8, fraction = 2, message = "El precio debe tener máximo 8 dígitos enteros y 2 decimales")
        @Schema(description = "Precio total mensual de la suscripción", example = "15.99")
        BigDecimal precioTotal,
        
        @NotNull(message = "El número de plazas es obligatorio")
        @Min(value = 1, message = "Debe haber al menos 1 plaza")
        @Max(value = 20, message = "No puede haber más de 20 plazas")
        @Schema(description = "Número total de plazas disponibles (máximo permitido por el servicio)", example = "4")
        Short numPlazasTotal,
        
        @NotNull(message = "La fecha de inicio es obligatoria")
        @FutureOrPresent(message = "La fecha de inicio no puede ser pasada")
        @Schema(description = "Fecha de inicio de la suscripción", example = "2025-01-15")
        LocalDate fechaInicio,
        
        @NotNull(message = "La periodicidad es obligatoria")
        @Schema(description = "Periodicidad del pago (MENSUAL, TRIMESTRAL, ANUAL)", example = "MENSUAL")
        Periodicidad periodicidad,
        
        @Schema(description = "Si el anfitrión ocupará una plaza (default: true)", example = "true")
        Boolean anfitrionOcupaPlaza
) {
    /**
     * Constructor compacto con validación y valores por defecto.
     */
    public CreateSuscripcionRequest {
        if (anfitrionOcupaPlaza == null) {
            anfitrionOcupaPlaza = true;
        }
    }
    
    /**
     * Verifica si el request tiene un identificador de servicio válido.
     *
     * @return true si tiene idServicio o nombreServicio válido
     */
    public boolean tieneServicioValido() {
        return idServicio != null || (nombreServicio != null && !nombreServicio.isBlank());
    }
}
