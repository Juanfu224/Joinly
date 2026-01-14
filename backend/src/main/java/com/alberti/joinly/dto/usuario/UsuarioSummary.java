package com.alberti.joinly.dto.usuario;

import com.alberti.joinly.entities.usuario.Usuario;

/**
 * DTO con información básica del usuario.
 * Usado en respuestas que requieren datos resumidos del usuario.
 */
public record UsuarioSummary(
        Long id,
        String nombreCompleto,
        String email,
        String nombreUsuario,
        String avatar
) {
    public static UsuarioSummary fromEntity(Usuario usuario) {
        return new UsuarioSummary(
                usuario.getId(),
                usuario.getNombre(),
                usuario.getEmail(),
                generarNombreUsuario(usuario),
                usuario.getAvatar()
        );
    }

    /**
     * Genera un nombre de usuario a partir del email.
     * Toma la parte antes del @ como nombre de usuario.
     */
    private static String generarNombreUsuario(Usuario usuario) {
        String email = usuario.getEmail();
        if (email != null && email.contains("@")) {
            return email.substring(0, email.indexOf("@"));
        }
        return usuario.getNombre();
    }
}
