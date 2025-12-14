package com.alberti.joinly.controllers;

import com.alberti.joinly.dto.auth.AuthResponse;
import com.alberti.joinly.dto.auth.LoginRequest;
import com.alberti.joinly.dto.auth.RegisterRequest;
import com.alberti.joinly.services.UsuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Autenticación", description = "Endpoints de registro y autenticación de usuarios")
public class AuthController {

    private final UsuarioService usuarioService;

    @PostMapping("/register")
    @Operation(summary = "Registrar nuevo usuario")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Usuario registrado exitosamente"),
            @ApiResponse(responseCode = "400", description = "Datos de entrada inválidos"),
            @ApiResponse(responseCode = "409", description = "El email ya está registrado")
    })
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        var passwordEncriptado = encriptarPassword(request.password());

        var usuario = usuarioService.registrar(
                request.nombre(),
                request.email(),
                passwordEncriptado);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(AuthResponse.registered(usuario.getId(), usuario.getNombre(), usuario.getEmail()));
    }

    @PostMapping("/login")
    @Operation(summary = "Iniciar sesión")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Autenticación exitosa"),
            @ApiResponse(responseCode = "401", description = "Credenciales inválidas")
    })
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        var usuario = usuarioService.buscarPorEmail(request.email())
                .orElseThrow(() -> new IllegalArgumentException("Credenciales inválidas"));

        if (!verificarPassword(request.password(), usuario.getPassword())) {
            throw new IllegalArgumentException("Credenciales inválidas");
        }

        usuarioService.registrarAcceso(usuario.getId());

        var tokenFicticio = "jwt-token-placeholder-" + usuario.getId();

        return ResponseEntity.ok(AuthResponse.loggedIn(
                usuario.getId(),
                usuario.getNombre(),
                usuario.getEmail(),
                tokenFicticio));
    }

    @PostMapping("/verify-email/{idUsuario}")
    @Operation(summary = "Verificar email")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Email verificado exitosamente"),
            @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
    })
    public ResponseEntity<Void> verifyEmail(@PathVariable Long idUsuario) {
        usuarioService.verificarEmail(idUsuario);
        return ResponseEntity.ok().build();
    }

    private String encriptarPassword(String password) {
        // Placeholder: usar BCryptPasswordEncoder en producción
        return password;
    }

    private boolean verificarPassword(String rawPassword, String encodedPassword) {
        // Placeholder: usar BCryptPasswordEncoder.matches() en producción
        return rawPassword.equals(encodedPassword);
    }
}
