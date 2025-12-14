package com.alberti.joinly.repositories;

import com.alberti.joinly.entities.enums.TipoNotificacion;
import com.alberti.joinly.entities.notificacion.Notificacion;
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
public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {

    @Query("""
            SELECT n FROM Notificacion n
            WHERE n.usuario.id = :idUsuario
            ORDER BY n.fechaCreacion DESC
            """)
    Page<Notificacion> findNotificacionesPorUsuario(@Param("idUsuario") Long idUsuario, Pageable pageable);

    @Query("""
            SELECT n FROM Notificacion n
            WHERE n.usuario.id = :idUsuario
            AND n.fechaLectura IS NULL
            ORDER BY n.fechaCreacion DESC
            """)
    List<Notificacion> findNotificacionesNoLeidasPorUsuario(@Param("idUsuario") Long idUsuario);

    @Query("SELECT COUNT(n) FROM Notificacion n WHERE n.usuario.id = :idUsuario AND n.fechaLectura IS NULL")
    long contarNoLeidasPorUsuario(@Param("idUsuario") Long idUsuario);

    @Modifying
    @Query("UPDATE Notificacion n SET n.fechaLectura = :fechaLectura WHERE n.id = :id AND n.fechaLectura IS NULL")
    int marcarComoLeida(@Param("id") Long id, @Param("fechaLectura") LocalDateTime fechaLectura);

    @Modifying
    @Query("UPDATE Notificacion n SET n.fechaLectura = :fechaLectura WHERE n.usuario.id = :idUsuario AND n.fechaLectura IS NULL")
    int marcarTodasComoLeidas(@Param("idUsuario") Long idUsuario, @Param("fechaLectura") LocalDateTime fechaLectura);

    List<Notificacion> findByUsuarioIdAndTipoOrderByFechaCreacionDesc(Long idUsuario, TipoNotificacion tipo);

    @Modifying
    @Query("DELETE FROM Notificacion n WHERE n.fechaCreacion < :fecha AND n.fechaLectura IS NOT NULL")
    int eliminarNotificacionesAntiguasLeidas(@Param("fecha") LocalDateTime fecha);
}
