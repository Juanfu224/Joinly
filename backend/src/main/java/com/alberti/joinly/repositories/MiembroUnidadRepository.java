package com.alberti.joinly.repositories;

import com.alberti.joinly.entities.enums.EstadoMiembro;
import com.alberti.joinly.entities.grupo.MiembroUnidad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MiembroUnidadRepository extends JpaRepository<MiembroUnidad, Long> {

    Optional<MiembroUnidad> findByUsuarioIdAndUnidadId(Long idUsuario, Long idUnidad);

    boolean existsByUsuarioIdAndUnidadIdAndEstado(Long idUsuario, Long idUnidad, EstadoMiembro estado);

    @Query("""
        SELECT m FROM MiembroUnidad m
        JOIN FETCH m.usuario
        WHERE m.unidad.id = :idUnidad AND m.estado = :estado
        """)
    List<MiembroUnidad> findByUnidadIdAndEstadoConUsuario(@Param("idUnidad") Long idUnidad, @Param("estado") EstadoMiembro estado);

    @Query("""
        SELECT m FROM MiembroUnidad m
        JOIN FETCH m.unidad
        WHERE m.usuario.id = :idUsuario AND m.estado = :estado
        """)
    List<MiembroUnidad> findByUsuarioIdAndEstadoConUnidad(@Param("idUsuario") Long idUsuario, @Param("estado") EstadoMiembro estado);

    @Query("SELECT COUNT(m) FROM MiembroUnidad m WHERE m.usuario.id = :idUsuario AND m.estado = 'ACTIVO'")
    long contarGruposActivosDelUsuario(@Param("idUsuario") Long idUsuario);
}
