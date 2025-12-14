package com.alberti.joinly.dto.unidad;

import com.alberti.joinly.dto.usuario.UsuarioSummary;
import com.alberti.joinly.entities.enums.EstadoMiembro;
import com.alberti.joinly.entities.enums.RolMiembro;
import com.alberti.joinly.entities.grupo.MiembroUnidad;

import java.time.LocalDateTime;

public record MiembroUnidadResponse(
        Long id,
        UsuarioSummary usuario,
        RolMiembro rol,
        LocalDateTime fechaUnion,
        EstadoMiembro estado
) {
    public static MiembroUnidadResponse fromEntity(MiembroUnidad miembro) {
        return new MiembroUnidadResponse(
                miembro.getId(),
                UsuarioSummary.fromEntity(miembro.getUsuario()),
                miembro.getRol(),
                miembro.getFechaUnion(),
                miembro.getEstado()
        );
    }
}
