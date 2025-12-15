package com.alberti.joinly.security;

import com.alberti.joinly.entities.enums.RolUsuario;
import com.alberti.joinly.entities.usuario.Usuario;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

/**
 * Implementación de {@link UserDetails} que adapta la entidad {@link Usuario}
 * al sistema de autenticación de Spring Security.
 * <p>
 * Esta clase actúa como un wrapper que permite que Spring Security
 * trabaje con la entidad Usuario de Joinly sin modificarla directamente.
 *
 * @author Joinly Team
 * @version 1.0
 * @since 2025
 */
@Getter
public class UserPrincipal implements UserDetails {

    private final Long id;
    private final String email;
    private final String password;
    private final String nombre;
    private final boolean emailVerificado;
    private final RolUsuario rol;
    private final boolean activo;
    private final Collection<? extends GrantedAuthority> authorities;

    /**
     * Constructor privado que inicializa todos los campos.
     * Usar el método factory {@link #fromUsuario(Usuario)} para crear instancias.
     */
    private UserPrincipal(Long id, String email, String password, String nombre,
                          boolean emailVerificado, RolUsuario rol, boolean activo,
                          Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.nombre = nombre;
        this.emailVerificado = emailVerificado;
        this.rol = rol;
        this.activo = activo;
        this.authorities = authorities;
    }

    /**
     * Crea una instancia de UserPrincipal a partir de una entidad Usuario.
     * <p>
     * Los roles/authorities se asignan según el rol del usuario:
     * <ul>
     *   <li>{@code ROLE_USER} - Todos los usuarios</li>
     *   <li>{@code ROLE_AGENTE} - Usuarios con rol AGENTE o ADMIN</li>
     *   <li>{@code ROLE_ADMIN} - Solo usuarios con rol ADMIN</li>
     * </ul>
     * <p>
     * Los roles son jerárquicos: ADMIN hereda permisos de AGENTE, y AGENTE hereda de USER.
     *
     * @param usuario Entidad Usuario de la base de datos
     * @return Nueva instancia de UserPrincipal
     */
    public static UserPrincipal fromUsuario(Usuario usuario) {
        var rol = usuario.getRol() != null ? usuario.getRol() : RolUsuario.USER;
        
        // Asignación jerárquica de authorities usando switch expression (Java 25)
        var authorities = switch (rol) {
            case USER -> List.of(
                new SimpleGrantedAuthority("ROLE_USER")
            );
            case AGENTE -> List.of(
                new SimpleGrantedAuthority("ROLE_USER"),
                new SimpleGrantedAuthority("ROLE_AGENTE")
            );
            case ADMIN -> List.of(
                new SimpleGrantedAuthority("ROLE_USER"),
                new SimpleGrantedAuthority("ROLE_AGENTE"),
                new SimpleGrantedAuthority("ROLE_ADMIN")
            );
        };

        return new UserPrincipal(
                usuario.getId(),
                usuario.getEmail(),
                usuario.getPassword(),
                usuario.getNombre(),
                Boolean.TRUE.equals(usuario.getEmailVerificado()),
                rol,
                usuario.getEstado() == com.alberti.joinly.entities.enums.EstadoUsuario.ACTIVO,
                authorities
        );
    }

    /**
     * Retorna el email como nombre de usuario para Spring Security.
     *
     * @return Email del usuario
     */
    @Override
    public String getUsername() {
        return email;
    }

    /**
     * Retorna la contraseña hasheada del usuario.
     *
     * @return Password encriptada
     */
    @Override
    public String getPassword() {
        return password;
    }

    /**
     * Retorna los roles/authorities del usuario.
     *
     * @return Colección de authorities
     */
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    /**
     * Indica si la cuenta no ha expirado.
     * En Joinly, las cuentas no expiran por tiempo.
     *
     * @return {@code true} siempre
     */
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    /**
     * Indica si la cuenta no está bloqueada.
     * La cuenta está bloqueada si el estado es SUSPENDIDO o ELIMINADO.
     *
     * @return {@code true} si el usuario está activo
     */
    @Override
    public boolean isAccountNonLocked() {
        return activo;
    }

    /**
     * Indica si las credenciales no han expirado.
     * En Joinly, las credenciales no expiran por tiempo.
     *
     * @return {@code true} siempre
     */
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    /**
     * Indica si la cuenta está habilitada.
     * La cuenta está habilitada si el usuario está activo.
     *
     * @return {@code true} si el usuario está activo
     */
    @Override
    public boolean isEnabled() {
        return activo;
    }

    /**
     * Verifica si el usuario tiene un rol específico.
     *
     * @param role Nombre del rol (sin prefijo ROLE_)
     * @return {@code true} si el usuario tiene el rol
     */
    public boolean hasRole(String role) {
        var roleWithPrefix = role.startsWith("ROLE_") ? role : "ROLE_" + role;
        return authorities.stream()
                .anyMatch(auth -> auth.getAuthority().equals(roleWithPrefix));
    }
}
