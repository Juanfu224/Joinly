package com.alberti.joinly.repositories;

import com.alberti.joinly.entities.enums.EstadoSolicitud;
import com.alberti.joinly.entities.grupo.Solicitud;
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
public interface SolicitudRepository extends JpaRepository<Solicitud, Long> {

    List<Solicitud> findBySolicitanteIdAndEstado(Long idSolicitante, EstadoSolicitud estado);

    Page<Solicitud> findBySolicitanteIdAndEstado(Long idSolicitante, EstadoSolicitud estado, Pageable pageable);

    /**
     * Busca solicitudes de un usuario con filtros opcionales de estado y rango de fechas.
     * Soporta paginación y ordenación dinámica.
     * 
     * @param idSolicitante ID del usuario solicitante
     * @param estado Estado de la solicitud (puede ser null para todos los estados)
     * @param fechaDesde Fecha inicio del rango (puede ser null)
     * @param fechaHasta Fecha fin del rango (puede ser null)
     * @param pageable Configuración de paginación y ordenación
     * @return Página de solicitudes que cumplen los criterios
     */
    @Query("""
        SELECT s FROM Solicitud s
        WHERE s.solicitante.id = :idSolicitante
        AND (:estado IS NULL OR s.estado = :estado)
        AND (:fechaDesde IS NULL OR CAST(s.fechaSolicitud AS LocalDate) >= :fechaDesde)
        AND (:fechaHasta IS NULL OR CAST(s.fechaSolicitud AS LocalDate) <= :fechaHasta)
        """)
    Page<Solicitud> findBySolicitanteIdWithFilters(
            @Param("idSolicitante") Long idSolicitante,
            @Param("estado") EstadoSolicitud estado,
            @Param("fechaDesde") LocalDate fechaDesde,
            @Param("fechaHasta") LocalDate fechaHasta,
            Pageable pageable);

    List<Solicitud> findByUnidadIdAndEstado(Long idUnidad, EstadoSolicitud estado);

    List<Solicitud> findBySuscripcionIdAndEstado(Long idSuscripcion, EstadoSolicitud estado);

    // Verifica si ya existe una solicitud pendiente del usuario para el grupo
    boolean existsBySolicitanteIdAndUnidadIdAndEstado(Long idSolicitante, Long idUnidad, EstadoSolicitud estado);

    // Verifica si ya existe una solicitud pendiente del usuario para la suscripción
    boolean existsBySolicitanteIdAndSuscripcionIdAndEstado(Long idSolicitante, Long idSuscripcion, EstadoSolicitud estado);

    @Query("""
        SELECT s FROM Solicitud s
        JOIN FETCH s.solicitante
        LEFT JOIN FETCH s.unidad
        LEFT JOIN FETCH s.suscripcion su
        LEFT JOIN FETCH su.servicio
        WHERE s.unidad.id = :idUnidad AND s.estado = 'PENDIENTE'
        ORDER BY s.fechaSolicitud ASC
        """)
    List<Solicitud> findSolicitudesPendientesGrupo(@Param("idUnidad") Long idUnidad);

    @Query("""
        SELECT s FROM Solicitud s
        JOIN FETCH s.solicitante
        LEFT JOIN FETCH s.unidad
        LEFT JOIN FETCH s.suscripcion su
        LEFT JOIN FETCH su.servicio
        WHERE s.suscripcion.id = :idSuscripcion AND s.estado = 'PENDIENTE'
        ORDER BY s.fechaSolicitud ASC
        """)
    List<Solicitud> findSolicitudesPendientesSuscripcion(@Param("idSuscripcion") Long idSuscripcion);

    @Query("""
        SELECT s FROM Solicitud s
        JOIN FETCH s.solicitante
        WHERE s.id = :id
        """)
    Optional<Solicitud> findByIdConSolicitante(@Param("id") Long id);

    /**
     * Busca una solicitud por ID cargando todas sus relaciones (solicitante, unidad, suscripcion, aprobador)
     * Para evitar LazyInitializationException al serializar y en operaciones de aprobación/rechazo
     */
    @Query("""
        SELECT s FROM Solicitud s
        JOIN FETCH s.solicitante
        LEFT JOIN FETCH s.unidad u
        LEFT JOIN FETCH u.administrador
        LEFT JOIN FETCH s.suscripcion su
        LEFT JOIN FETCH su.servicio
        LEFT JOIN FETCH su.anfitrion
        LEFT JOIN FETCH s.aprobador
        WHERE s.id = :id
        """)
    Optional<Solicitud> findByIdCompleto(@Param("id") Long id);
}
