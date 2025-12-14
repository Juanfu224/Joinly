package com.alberti.joinly.dto.credencial;

import com.alberti.joinly.entities.enums.TipoCredencial;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * DTO para crear o actualizar una credencial.
 */
public record CredencialRequest(
        @NotNull(message = "El tipo de credencial es obligatorio")
        TipoCredencial tipo,

        @NotBlank(message = "La etiqueta es obligatoria")
        @Size(max = 50, message = "La etiqueta no puede exceder 50 caracteres")
        String etiqueta,

        @NotBlank(message = "El valor es obligatorio")
        String valor,

        String instrucciones,

        boolean visibleParaMiembros
) {}
