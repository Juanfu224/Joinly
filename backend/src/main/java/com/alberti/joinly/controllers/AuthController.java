package com.alberti.joinly.controllers;

import com.alberti.joinly.dto.auth.AuthResponse;
import com.alberti.joinly.dto.auth.CambiarContrasenaRequest;
import com.alberti.joinly.dto.auth.EmailAvailabilityResponse;
import com.alberti.joinly.dto.auth.LoginRequest;
import com.alberti.joinly.dto.auth.RefreshTokenRequest;
import com.alberti.joinly.dto.auth.RegisterRequest;
import com.alberti.joinly.security.UserPrincipal;
import com.alberti.joinly.services.AuthService;
import com.alberti.joinly.services.UsuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * Controlador REST para operaciones de autenticación.
 * <p>
 * Expone endpoints públicos para:
 * <ul>
 *   <li>Registro de nuevos usuarios</li>
 *   <li>Inicio de sesión (login)</li>
 *   <li>Renovación de tokens JWT</li>
 *   <li>Verificación de email</li>
 * </ul>
 * <p>
 * Todos los endpoints de este controlador son públicos y no requieren autenticación.
 *
 * @author Joinly Team
 * @version 1.0
 * @since 2025
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Autenticación", description = "Endpoints de registro, login y gestión de tokens JWT")
public class AuthController {

    private final AuthService authService;
    private final UsuarioService usuarioService;

    /**
     * Registra un nuevo usuario en la plataforma.
     * <p>
     * Al registrarse exitosamente, el usuario recibe tokens JWT para acceso inmediato.
     * No se requiere verificación de email para acceder, pero algunas funcionalidades
     * pueden estar limitadas hasta verificar el email.
     *
     * @param request Datos de registro (nombre, email, password)
     * @return AuthResponse con datos del usuario y tokens JWT
     */
    @PostMapping("/register")
    @Operation(
            summary = "Registrar nuevo usuario",
            description = "Crea una nueva cuenta de usuario y retorna tokens JWT para acceso inmediato"
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "Usuario registrado exitosamente",
                    content = @Content(schema = @Schema(implementation = AuthResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Datos de entrada inválidos (validación fallida)"
            ),
            @ApiResponse(
                    responseCode = "409",
                    description = "El email ya está registrado"
            )
    })
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        log.info("Solicitud de registro recibida para email: {}", request.email());
        var response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Autentica un usuario y genera tokens JWT.
     * <p>
     * Valida las credenciales del usuario y, si son correctas, genera:
     * <ul>
     *   <li><b>Access Token</b>: Token de corta duración (1 hora) para autorización</li>
     *   <li><b>Refresh Token</b>: Token de larga duración (30 días) para renovar el access token</li>
     * </ul>
     *
     * @param request Credenciales de acceso (email, password)
     * @return AuthResponse con datos del usuario y tokens JWT
     */
    @PostMapping("/login")
    @Operation(
            summary = "Iniciar sesión",
            description = "Autentica al usuario con email y contraseña, retorna tokens JWT"
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Autenticación exitosa",
                    content = @Content(schema = @Schema(implementation = AuthResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Datos de entrada inválidos"
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Credenciales inválidas"
            ),
            @ApiResponse(
                    responseCode = "422",
                    description = "Cuenta deshabilitada o bloqueada"
            )
    })
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        log.info("Solicitud de login recibida para email: {}", request.email());
        var response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Renueva los tokens JWT usando un refresh token válido.
     * <p>
     * Permite obtener nuevos tokens sin necesidad de re-autenticarse con credenciales.
     * El refresh token debe ser válido y no haber expirado.
     *
     * @param request DTO con el refresh token
     * @return AuthResponse con los nuevos tokens JWT
     */
    @PostMapping("/refresh")
    @Operation(
            summary = "Renovar tokens",
            description = "Genera nuevos tokens JWT usando un refresh token válido"
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Tokens renovados exitosamente",
                    content = @Content(schema = @Schema(implementation = AuthResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Refresh token no proporcionado"
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Refresh token inválido o expirado"
            )
    })
    public ResponseEntity<AuthResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        log.debug("Solicitud de renovación de token recibida");
        var response = authService.refreshToken(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Verifica el email de un usuario.
     * <p>
     * Este endpoint se utiliza cuando el usuario hace clic en el enlace
     * de verificación enviado a su correo electrónico.
     *
     * @param idUsuario ID del usuario a verificar
     * @return 200 OK si la verificación fue exitosa
     */
    @PostMapping("/verify-email/{idUsuario}")
    @Operation(
            summary = "Verificar email",
            description = "Marca el email del usuario como verificado"
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Email verificado exitosamente"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Usuario no encontrado"
            )
    })
    public ResponseEntity<Void> verifyEmail(@PathVariable Long idUsuario) {
        log.info("Solicitud de verificación de email para usuario ID: {}", idUsuario);
        usuarioService.verificarEmail(idUsuario);
        return ResponseEntity.ok().build();
    }

    /**
     * Verifica la disponibilidad de un email.
     * <p>
     * Endpoint público para validación asíncrona de formularios.
     * Permite verificar si un email está disponible antes del registro,
     * o si puede ser utilizado durante la edición de perfil.
     *
     * @param email Email a verificar
     * @param excludeUserId ID de usuario a excluir (opcional, para edición)
     * @return Respuesta indicando si el email está disponible
     */
    @GetMapping("/check-email")
    @Operation(
            summary = "Verificar disponibilidad de email",
            description = "Comprueba si un email está disponible para registro o edición de perfil"
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Verificación exitosa",
                    content = @Content(schema = @Schema(implementation = EmailAvailabilityResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Email no proporcionado o inválido"
            )
    })
    public ResponseEntity<EmailAvailabilityResponse> checkEmailAvailability(
            @Parameter(description = "Email a verificar", required = true)
            @RequestParam String email,
            @Parameter(description = "ID de usuario a excluir de la verificación")
            @RequestParam(required = false) Long excludeUserId) {
        
        log.debug("Verificando disponibilidad de email: {}", email);
        
        boolean exists = usuarioService.existeEmail(email);
        boolean available = !exists;
        
        // Si se proporciona un ID de usuario, verificar si el email pertenece a ese usuario
        if (exists && excludeUserId != null) {
            available = usuarioService.buscarPorEmail(email)
                    .map(usuario -> usuario.getId().equals(excludeUserId))
                    .orElse(false);
        }
        
        return ResponseEntity.ok(new EmailAvailabilityResponse(available));
    }

    /**
     * Valida si un token de acceso es válido.
     * <p>
     * Endpoint útil para que el frontend verifique si el token actual
     * sigue siendo válido sin necesidad de hacer otra petición.
     *
     * @param token Token JWT a validar (sin prefijo "Bearer ")
     * @return 200 OK si el token es válido, 401 si no lo es
     */
    @GetMapping("/validate")
    @Operation(
            summary = "Validar token",
            description = "Verifica si un token JWT es válido"
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Token válido"
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Token inválido o expirado"
            )
    })
    public ResponseEntity<Void> validateToken(@RequestParam String token) {
        if (authService.validateToken(token)) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    /**
     * Cambia la contraseña del usuario autenticado.
     * <p>
     * Requiere autenticación y validación de la contraseña actual antes de
     * permitir el cambio. La nueva contraseña debe cumplir los requisitos
     * de seguridad (mínimo 8 caracteres).
     *
     * @param currentUser Usuario autenticado (inyectado automáticamente)
     * @param request DTO con la contraseña actual y la nueva
     * @return 204 No Content si el cambio fue exitoso
     */
    @PostMapping("/cambiar-contrasena")
    @Operation(
            summary = "Cambiar contraseña",
            description = "Permite al usuario autenticado cambiar su contraseña",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "204",
                    description = "Contraseña cambiada exitosamente"
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Datos de entrada inválidos"
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Usuario no autenticado o contraseña actual incorrecta"
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Cuenta deshabilitada"
            )
    })
    public ResponseEntity<Void> cambiarContrasena(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody CambiarContrasenaRequest request
    ) {
        log.info("Solicitud de cambio de contraseña para usuario ID: {}", currentUser.getId());
        authService.cambiarContrasena(currentUser.getId(), request);
        return ResponseEntity.noContent().build();
    }
}
