package com.alberti.joinly.dto.servicio;

import com.alberti.joinly.entities.enums.CategoriaServicio;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record UpdateServicioRequest(
        @Size(max = 100, message = "El nombre no puede exceder los 100 caracteres")
        String nombre,

        CategoriaServicio categoria,

        @Size(max = 500, message = "La URL del logo no puede exceder los 500 caracteres")
        String logo,

        @Size(max = 5000, message = "La descripción no puede exceder los 5000 caracteres")
        String descripcion,

        @Size(max = 500, message = "La URL oficial no puede exceder los 500 caracteres")
        String urlOficial,

        @Min(value = 1, message = "El máximo de usuarios debe ser al menos 1")
        @Max(value = 255, message = "El máximo de usuarios no puede exceder 255")
        Short maxUsuarios,

        @DecimalMin(value = "0.00", message = "El precio de referencia no puede ser negativo")
        @Digits(integer = 8, fraction = 2, message = "El precio debe tener máximo 8 dígitos enteros y 2 decimales")
        BigDecimal precioReferencia,

        @Size(min = 3, max = 3, message = "La moneda debe tener exactamente 3 caracteres (ISO 4217)")
        String monedaReferencia,

        Boolean activo
) {}
