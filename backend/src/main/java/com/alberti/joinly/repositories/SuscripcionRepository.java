package com.alberti.joinly.repositories;

import com.alberti.joinly.entities.enums.EstadoSuscripcion;
import com.alberti.joinly.entities.suscripcion.Suscripcion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface SuscripcionRepository extends JpaRepository<Suscripcion, Long> {

    List<Suscripcion> findByUnidadIdAndEstado(Long idUnidad, EstadoSuscripcion estado);

    @Query("""
        SELECT s FROM Suscripcion s
        JOIN FETCH s.servicio
        WHERE s.anfitrion.id = :idAnfitrion AND s.estado = :estado
        """)
    List<Suscripcion> findByAnfitrionIdAndEstadoConServicio(@Param("idAnfitrion") Long idAnfitrion, @Param("estado") EstadoSuscripcion estado);

    @Query("""
        SELECT s FROM Suscripcion s
        JOIN FETCH s.servicio
        WHERE s.unidad.id = :idUnidad AND s.estado = 'ACTIVA'
        """)
    List<Suscripcion> findSuscripcionesActivasConServicio(@Param("idUnidad") Long idUnidad);

    @Query("""
        SELECT s FROM Suscripcion s
        WHERE s.fechaRenovacion <= :fecha AND s.estado = 'ACTIVA' AND s.renovacionAutomatica = true
        """)
    List<Suscripcion> findSuscripcionesParaRenovar(@Param("fecha") LocalDate fecha);

    @Query("""
        SELECT s FROM Suscripcion s
        JOIN FETCH s.plazas
        WHERE s.id = :id
        """)
    Optional<Suscripcion> findByIdConPlazas(@Param("id") Long id);

    @Query("SELECT COUNT(s) FROM Suscripcion s WHERE s.unidad.id = :idUnidad AND s.estado = 'ACTIVA'")
    long contarSuscripcionesActivasEnUnidad(@Param("idUnidad") Long idUnidad);

    /**
     * Busca suscripciones con renovación próxima (entre hoy y fecha límite).
     * Usada por ScheduledJobs para notificar renovaciones cercanas.
     */
    @Query("""
        SELECT s FROM Suscripcion s
        JOIN FETCH s.servicio
        JOIN FETCH s.anfitrion
        WHERE s.fechaRenovacion BETWEEN :hoy AND :fechaLimite
        AND s.estado = 'ACTIVA'
        AND s.renovacionAutomatica = true
        """)
    List<Suscripcion> findSuscripcionesProximasARenovar(
            @Param("hoy") LocalDate hoy,
            @Param("fechaLimite") LocalDate fechaLimite);
}
