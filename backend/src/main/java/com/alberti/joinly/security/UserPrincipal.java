package com.alberti.joinly.security;

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
    private final boolean esAgenteSoporte;
    private final boolean activo;
    private final Collection<? extends GrantedAuthority> authorities;

    /**
     * Constructor privado que inicializa todos los campos.
     * Usar el método factory {@link #fromUsuario(Usuario)} para crear instancias.
     */
    private UserPrincipal(Long id, String email, String password, String nombre,
                          boolean emailVerificado, boolean esAgenteSoporte, boolean activo,
                          Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.nombre = nombre;
        this.emailVerificado = emailVerificado;
        this.esAgenteSoporte = esAgenteSoporte;
        this.activo = activo;
        this.authorities = authorities;
    }

    /**
     * Crea una instancia de UserPrincipal a partir de una entidad Usuario.
     * <p>
     * Los roles/authorities se asignan de la siguiente manera:
     * <ul>
     *   <li>Todos los usuarios obtienen ROLE_USER</li>
     *   <li>Si esAgenteSoporte = true, también obtiene ROLE_AGENTE</li>
     * </ul>
     *
     * @param usuario Entidad Usuario de la base de datos
     * @return Nueva instancia de UserPrincipal
     */
    public static UserPrincipal fromUsuario(Usuario usuario) {
        var authorities = new java.util.ArrayList<GrantedAuthority>();
        authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
        
        if (Boolean.TRUE.equals(usuario.getEsAgenteSoporte())) {
            authorities.add(new SimpleGrantedAuthority("ROLE_AGENTE"));
        }

        return new UserPrincipal(
                usuario.getId(),
                usuario.getEmail(),
                usuario.getPassword(),
                usuario.getNombre(),
                Boolean.TRUE.equals(usuario.getEmailVerificado()),
                Boolean.TRUE.equals(usuario.getEsAgenteSoporte()),
                usuario.getEstado() == com.alberti.joinly.entities.enums.EstadoUsuario.ACTIVO,
                List.copyOf(authorities)
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
