package com.alberti.joinly.security;

import com.alberti.joinly.entities.enums.EstadoUsuario;
import com.alberti.joinly.repositories.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Implementación de {@link UserDetailsService} que carga los detalles del usuario
 * desde la base de datos de Joinly.
 * <p>
 * Este servicio es utilizado por Spring Security para autenticar usuarios
 * durante el proceso de login y validación de tokens JWT.
 *
 * @author Joinly Team
 * @version 1.0
 * @since 2025
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CustomUserDetailsService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    /**
     * Carga un usuario por su email (usado como username en Joinly).
     * <p>
     * Este método es invocado por Spring Security durante:
     * <ul>
     *   <li>El proceso de autenticación (login)</li>
     *   <li>La validación de tokens JWT</li>
     * </ul>
     *
     * @param username Email del usuario a cargar
     * @return {@link UserDetails} con la información del usuario
     * @throws UsernameNotFoundException si el usuario no existe o no está activo
     */
    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        log.debug("Intentando cargar usuario por email: {}", username);
        
        var usuario = usuarioRepository.findByEmail(username)
                .orElseThrow(() -> {
                    log.warn("Usuario no encontrado con email: {}", username);
                    return new UsernameNotFoundException("Usuario no encontrado con email: " + username);
                });

        // Verificar que el usuario esté activo
        if (usuario.getEstado() != EstadoUsuario.ACTIVO) {
            log.warn("Intento de acceso de usuario no activo: {} (estado: {})", 
                    username, usuario.getEstado());
            throw new UsernameNotFoundException("La cuenta del usuario no está activa");
        }

        log.debug("Usuario cargado exitosamente: {} (ID: {})", username, usuario.getId());
        return UserPrincipal.fromUsuario(usuario);
    }

    /**
     * Carga un usuario por su ID.
     * <p>
     * Método de conveniencia para cargar usuarios cuando se conoce el ID
     * en lugar del email.
     *
     * @param userId ID del usuario a cargar
     * @return {@link UserPrincipal} con la información del usuario
     * @throws UsernameNotFoundException si el usuario no existe
     */
    @Transactional(readOnly = true)
    public UserPrincipal loadUserById(Long userId) {
        log.debug("Intentando cargar usuario por ID: {}", userId);
        
        var usuario = usuarioRepository.findById(userId)
                .orElseThrow(() -> {
                    log.warn("Usuario no encontrado con ID: {}", userId);
                    return new UsernameNotFoundException("Usuario no encontrado con ID: " + userId);
                });

        return UserPrincipal.fromUsuario(usuario);
    }
}
