package com.alberti.joinly.repositories;

import com.alberti.joinly.entities.enums.EstadoUnidadFamiliar;
import com.alberti.joinly.entities.grupo.UnidadFamiliar;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UnidadFamiliarRepository extends JpaRepository<UnidadFamiliar, Long> {

    Optional<UnidadFamiliar> findByCodigoInvitacion(String codigoInvitacion);

    boolean existsByCodigoInvitacion(String codigoInvitacion);

    List<UnidadFamiliar> findByAdministradorIdAndEstado(Long idAdministrador, EstadoUnidadFamiliar estado);

    @Query("SELECT uf FROM UnidadFamiliar uf WHERE uf.administrador.id = :idUsuario AND uf.estado = 'ACTIVO'")
    List<UnidadFamiliar> findUnidadesAdministradasActivas(@Param("idUsuario") Long idUsuario);

    @Query("""
        SELECT DISTINCT uf FROM UnidadFamiliar uf
        JOIN uf.miembros m
        WHERE m.usuario.id = :idUsuario AND m.estado = 'ACTIVO' AND uf.estado = 'ACTIVO'
        """)
    List<UnidadFamiliar> findUnidadesDondeEsMiembroActivo(@Param("idUsuario") Long idUsuario);

    @Query("""
        SELECT DISTINCT uf FROM UnidadFamiliar uf
        JOIN uf.miembros m
        WHERE m.usuario.id = :idUsuario AND m.estado = 'ACTIVO' AND uf.estado = 'ACTIVO'
        """)
    Page<UnidadFamiliar> findUnidadesDondeEsMiembroActivoPaginado(@Param("idUsuario") Long idUsuario, Pageable pageable);

    @Query("SELECT COUNT(m) FROM MiembroUnidad m WHERE m.unidad.id = :idUnidad AND m.estado = 'ACTIVO'")
    long contarMiembrosActivos(@Param("idUnidad") Long idUnidad);
}
