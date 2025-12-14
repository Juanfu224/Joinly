package com.alberti.joinly.repositories;

import com.alberti.joinly.entities.sistema.LogAuditoria;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface LogAuditoriaRepository extends JpaRepository<LogAuditoria, Long> {

    @Query("""
            SELECT l FROM LogAuditoria l
            LEFT JOIN FETCH l.usuario
            WHERE l.usuario.id = :idUsuario
            ORDER BY l.fecha DESC
            """)
    Page<LogAuditoria> findLogsPorUsuario(@Param("idUsuario") Long idUsuario, Pageable pageable);

    @Query("""
            SELECT l FROM LogAuditoria l
            WHERE l.entidad = :entidad AND l.idEntidad = :idEntidad
            ORDER BY l.fecha DESC
            """)
    List<LogAuditoria> findLogsPorEntidad(
            @Param("entidad") String entidad,
            @Param("idEntidad") Long idEntidad);

    @Query("SELECT l FROM LogAuditoria l WHERE l.accion = :accion ORDER BY l.fecha DESC")
    Page<LogAuditoria> findLogsPorAccion(@Param("accion") String accion, Pageable pageable);

    @Modifying
    @Query("DELETE FROM LogAuditoria l WHERE l.fecha < :fecha")
    int eliminarLogsAnterioresA(@Param("fecha") LocalDateTime fecha);
}
