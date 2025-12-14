package com.alberti.joinly.dto.usuario;

import com.alberti.joinly.entities.usuario.Usuario;

public record UsuarioSummary(
        Long id,
        String nombre,
        String avatar
) {
    public static UsuarioSummary fromEntity(Usuario usuario) {
        return new UsuarioSummary(
                usuario.getId(),
                usuario.getNombre(),
                usuario.getAvatar()
        );
    }
}
