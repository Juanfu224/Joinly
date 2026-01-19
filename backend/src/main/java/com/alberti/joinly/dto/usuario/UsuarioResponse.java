package com.alberti.joinly.dto.usuario;

import com.alberti.joinly.entities.enums.EstadoUsuario;
import com.alberti.joinly.entities.usuario.Usuario;

import java.time.LocalDateTime;

public record UsuarioResponse(
        Long id,
        String nombre,
        String email,
        LocalDateTime fechaRegistro,
        Boolean emailVerificado,
        String avatar,
        String telefono,
        String temaPreferido,
        EstadoUsuario estado,
        LocalDateTime fechaUltimoAcceso
) {
    public static UsuarioResponse fromEntity(Usuario usuario) {
        return new UsuarioResponse(
                usuario.getId(),
                usuario.getNombre(),
                usuario.getEmail(),
                usuario.getFechaRegistro(),
                usuario.getEmailVerificado(),
                usuario.getAvatar(),
                usuario.getTelefono(),
                usuario.getTemaPreferido(),
                usuario.getEstado(),
                usuario.getFechaUltimoAcceso()
        );
    }
}
