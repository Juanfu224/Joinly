package com.alberti.joinly.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controlador de utilidades para desarrollo.
 * Solo disponible con perfil "dev" activo.
 *
 * @author Joinly Team
 */
@RestController
@Profile("dev")
@RequestMapping("/api/dev")
@Tag(name = "Desarrollo", description = "Utilidades de desarrollo (solo perfil dev)")
public class DevController {

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @GetMapping("/hash-password")
    @Operation(summary = "Generar hash BCrypt", description = "Útil para crear usuarios de prueba")
    public String hashPassword(
            @Parameter(description = "Contraseña a hashear", example = "Password123!")
            @RequestParam String password
    ) {
        return passwordEncoder.encode(password);
    }

    @GetMapping("/status")
    @Operation(summary = "Estado del perfil dev")
    public String devStatus() {
        return "✅ Perfil dev activo";
    }
}
