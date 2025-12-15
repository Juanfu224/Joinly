package com.alberti.joinly.repositories;

import com.alberti.joinly.entities.enums.EstadoSuscripcion;
import com.alberti.joinly.entities.suscripcion.Suscripcion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
        JOIN FETCH s.servicio
        WHERE s.unidad.id = :idUnidad AND s.estado = 'ACTIVA'
        """)
    Page<Suscripcion> findSuscripcionesActivasConServicioPaginado(@Param("idUnidad") Long idUnidad, Pageable pageable);

    /**
     * Busca suscripciones de una unidad con filtros opcionales de estado y rango de fechas.
     * Soporta paginación y ordenación dinámica.
     * 
     * @param idUnidad ID de la unidad familiar
     * @param estado Estado de la suscripción (puede ser null para todos los estados)
     * @param fechaDesde Fecha inicio del rango (puede ser null)
     * @param fechaHasta Fecha fin del rango (puede ser null)
     * @param pageable Configuración de paginación y ordenación
     * @return Página de suscripciones que cumplen los criterios
     */
    @Query("""
        SELECT s FROM Suscripcion s
        JOIN FETCH s.servicio
        WHERE s.unidad.id = :idUnidad
        AND (:estado IS NULL OR s.estado = :estado)
        AND (:fechaDesde IS NULL OR s.fechaInicio >= :fechaDesde)
        AND (:fechaHasta IS NULL OR s.fechaInicio <= :fechaHasta)
        """)
    Page<Suscripcion> findByUnidadIdWithFilters(
            @Param("idUnidad") Long idUnidad,
            @Param("estado") EstadoSuscripcion estado,
            @Param("fechaDesde") LocalDate fechaDesde,
            @Param("fechaHasta") LocalDate fechaHasta,
            Pageable pageable);

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
