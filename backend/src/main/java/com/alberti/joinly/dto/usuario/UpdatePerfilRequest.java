package com.alberti.joinly.dto.usuario;

import jakarta.validation.constraints.Size;

public record UpdatePerfilRequest(
        @Size(min = 2, max = 100, message = "El nombre debe tener entre 2 y 100 caracteres")
        String nombre,
        
        @Size(max = 20, message = "El teléfono no puede exceder 20 caracteres")
        String telefono,
        
        @Size(max = 500, message = "La URL del avatar no puede exceder 500 caracteres")
        String avatar
) {}
