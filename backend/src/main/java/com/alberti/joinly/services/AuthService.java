package com.alberti.joinly.services;

import com.alberti.joinly.dto.auth.AuthResponse;
import com.alberti.joinly.dto.auth.LoginRequest;
import com.alberti.joinly.dto.auth.RefreshTokenRequest;
import com.alberti.joinly.dto.auth.RegisterRequest;
import com.alberti.joinly.entities.enums.EstadoUsuario;
import com.alberti.joinly.entities.usuario.Usuario;
import com.alberti.joinly.exceptions.BusinessException;
import com.alberti.joinly.exceptions.DuplicateResourceException;
import com.alberti.joinly.exceptions.UnauthorizedException;
import com.alberti.joinly.repositories.UsuarioRepository;
import com.alberti.joinly.security.JwtService;
import com.alberti.joinly.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Servicio de autenticación que gestiona el registro, login y renovación de tokens.
 * <p>
 * Responsabilidades:
 * <ul>
 *   <li>Registro de nuevos usuarios con validación de email único</li>
 *   <li>Autenticación de usuarios con credenciales (email/password)</li>
 *   <li>Generación de tokens JWT (access y refresh)</li>
 *   <li>Renovación de tokens mediante refresh token</li>
 *   <li>Actualización del último acceso del usuario</li>
 * </ul>
 *
 * @author Joinly Team
 * @version 1.0
 * @since 2025
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    /**
     * Registra un nuevo usuario en el sistema.
     * <p>
     * El proceso de registro incluye:
     * <ol>
     *   <li>Validación de que el email no esté en uso</li>
     *   <li>Encriptación de la contraseña con BCrypt</li>
     *   <li>Creación del usuario con estado ACTIVO</li>
     *   <li>Generación de tokens JWT para acceso inmediato</li>
     * </ol>
     *
     * @param request DTO con los datos de registro (nombre, email, password)
     * @return {@link AuthResponse} con los datos del usuario y tokens JWT
     * @throws DuplicateResourceException Si el email ya está registrado
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        log.info("Intento de registro para email: {}", request.email());

        // Verificar que el email no esté en uso
        if (usuarioRepository.existsByEmail(request.email())) {
            log.warn("Intento de registro con email duplicado: {}", request.email());
            throw new DuplicateResourceException("Ya existe un usuario registrado con el email: " + request.email());
        }

        // Crear el nuevo usuario
        var usuario = Usuario.builder()
                .nombre(request.nombre())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .fechaRegistro(LocalDateTime.now())
                .estado(EstadoUsuario.ACTIVO)
                .emailVerificado(false)
                .esAgenteSoporte(false)
                .build();

        var usuarioGuardado = usuarioRepository.save(usuario);
        log.info("Usuario registrado exitosamente: {} (ID: {})", usuarioGuardado.getEmail(), usuarioGuardado.getId());

        // Generar tokens
        var userPrincipal = UserPrincipal.fromUsuario(usuarioGuardado);
        var accessToken = jwtService.generateAccessToken(userPrincipal);
        var refreshToken = jwtService.generateRefreshToken(userPrincipal);

        return AuthResponse.builder()
                .id(usuarioGuardado.getId())
                .nombre(usuarioGuardado.getNombre())
                .email(usuarioGuardado.getEmail())
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtService.getRemainingValidity(accessToken))
                .mensaje("Usuario registrado exitosamente")
                .build();
    }

    /**
     * Autentica un usuario con sus credenciales y genera tokens JWT.
     * <p>
     * El proceso de login incluye:
     * <ol>
     *   <li>Validación de credenciales mediante AuthenticationManager</li>
     *   <li>Verificación del estado de la cuenta (activa, no bloqueada)</li>
     *   <li>Actualización del último acceso</li>
     *   <li>Generación de tokens JWT (access y refresh)</li>
     * </ol>
     *
     * @param request DTO con las credenciales (email, password)
     * @return {@link AuthResponse} con los datos del usuario y tokens JWT
     * @throws UnauthorizedException Si las credenciales son inválidas
     * @throws BusinessException Si la cuenta está deshabilitada o bloqueada
     */
    @Transactional
    public AuthResponse login(LoginRequest request) {
        log.info("Intento de login para email: {}", request.email());

        try {
            // Autenticar usando Spring Security AuthenticationManager
            var authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.email(),
                            request.password()
                    )
            );

            // Obtener el UserPrincipal autenticado
            var userPrincipal = (UserPrincipal) authentication.getPrincipal();

            // Actualizar último acceso
            actualizarUltimoAcceso(userPrincipal.getId());

            // Generar tokens
            var accessToken = jwtService.generateAccessToken(userPrincipal);
            var refreshToken = jwtService.generateRefreshToken(userPrincipal);

            log.info("Login exitoso para usuario: {} (ID: {})", userPrincipal.getEmail(), userPrincipal.getId());

            return AuthResponse.builder()
                    .id(userPrincipal.getId())
                    .nombre(userPrincipal.getNombre())
                    .email(userPrincipal.getEmail())
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .tokenType("Bearer")
                    .expiresIn(jwtService.getRemainingValidity(accessToken))
                    .mensaje("Inicio de sesión exitoso")
                    .build();

        } catch (BadCredentialsException e) {
            log.warn("Credenciales inválidas para email: {}", request.email());
            throw new UnauthorizedException("Credenciales inválidas");
        } catch (DisabledException e) {
            log.warn("Cuenta deshabilitada: {}", request.email());
            throw new BusinessException("Tu cuenta ha sido deshabilitada. Contacta con soporte.");
        } catch (LockedException e) {
            log.warn("Cuenta bloqueada: {}", request.email());
            throw new BusinessException("Tu cuenta ha sido bloqueada. Contacta con soporte.");
        } catch (AuthenticationException e) {
            log.error("Error de autenticación para {}: {}", request.email(), e.getMessage());
            throw new UnauthorizedException("Error de autenticación");
        }
    }

    /**
     * Renueva el access token usando un refresh token válido.
     * <p>
     * Validaciones realizadas:
     * <ul>
     *   <li>El token debe ser un refresh token válido</li>
     *   <li>El token no debe haber expirado</li>
     *   <li>El usuario asociado debe existir y estar activo</li>
     * </ul>
     *
     * @param request DTO con el refresh token
     * @return {@link AuthResponse} con los nuevos tokens JWT
     * @throws UnauthorizedException Si el refresh token es inválido o expirado
     */
    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        var refreshToken = request.refreshToken();
        log.debug("Intento de renovación de token");

        // Verificar que sea un refresh token
        if (!jwtService.isRefreshToken(refreshToken)) {
            log.warn("Token proporcionado no es un refresh token");
            throw new UnauthorizedException("Token inválido");
        }

        // Verificar que no haya expirado
        if (jwtService.isTokenExpired(refreshToken)) {
            log.warn("Refresh token expirado");
            throw new UnauthorizedException("El token de refresco ha expirado. Por favor, inicia sesión nuevamente.");
        }

        // Extraer email del token
        var email = jwtService.extractUsername(refreshToken);
        
        // Buscar usuario
        var usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.warn("Usuario no encontrado para refresh token: {}", email);
                    return new UnauthorizedException("Usuario no encontrado");
                });

        // Verificar estado del usuario
        if (usuario.getEstado() != EstadoUsuario.ACTIVO) {
            log.warn("Intento de refresh para usuario no activo: {}", email);
            throw new UnauthorizedException("La cuenta del usuario no está activa");
        }

        // Generar nuevos tokens
        var userPrincipal = UserPrincipal.fromUsuario(usuario);
        var newAccessToken = jwtService.generateAccessToken(userPrincipal);
        var newRefreshToken = jwtService.generateRefreshToken(userPrincipal);

        log.info("Tokens renovados para usuario: {} (ID: {})", email, usuario.getId());

        return AuthResponse.builder()
                .id(usuario.getId())
                .nombre(usuario.getNombre())
                .email(usuario.getEmail())
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtService.getRemainingValidity(newAccessToken))
                .mensaje("Tokens renovados exitosamente")
                .build();
    }

    /**
     * Actualiza la fecha de último acceso del usuario.
     *
     * @param userId ID del usuario
     */
    private void actualizarUltimoAcceso(Long userId) {
        usuarioRepository.findById(userId).ifPresent(usuario -> {
            usuario.setFechaUltimoAcceso(LocalDateTime.now());
            usuarioRepository.save(usuario);
        });
    }

    /**
     * Valida si un token de acceso es válido.
     *
     * @param token Token JWT a validar
     * @return {@code true} si el token es válido
     */
    public boolean validateToken(String token) {
        try {
            var email = jwtService.extractUsername(token);
            return usuarioRepository.findByEmail(email)
                    .map(usuario -> {
                        var userPrincipal = UserPrincipal.fromUsuario(usuario);
                        return jwtService.isTokenValid(token, userPrincipal);
                    })
                    .orElse(false);
        } catch (Exception e) {
            log.debug("Error validando token: {}", e.getMessage());
            return false;
        }
    }
}
