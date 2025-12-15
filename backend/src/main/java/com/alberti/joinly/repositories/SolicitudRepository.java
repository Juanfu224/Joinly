package com.alberti.joinly.repositories;

import com.alberti.joinly.entities.enums.EstadoSolicitud;
import com.alberti.joinly.entities.grupo.Solicitud;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SolicitudRepository extends JpaRepository<Solicitud, Long> {

    List<Solicitud> findBySolicitanteIdAndEstado(Long idSolicitante, EstadoSolicitud estado);

    Page<Solicitud> findBySolicitanteIdAndEstado(Long idSolicitante, EstadoSolicitud estado, Pageable pageable);

    List<Solicitud> findByUnidadIdAndEstado(Long idUnidad, EstadoSolicitud estado);

    List<Solicitud> findBySuscripcionIdAndEstado(Long idSuscripcion, EstadoSolicitud estado);

    // Verifica si ya existe una solicitud pendiente del usuario para el grupo
    boolean existsBySolicitanteIdAndUnidadIdAndEstado(Long idSolicitante, Long idUnidad, EstadoSolicitud estado);

    // Verifica si ya existe una solicitud pendiente del usuario para la suscripción
    boolean existsBySolicitanteIdAndSuscripcionIdAndEstado(Long idSolicitante, Long idSuscripcion, EstadoSolicitud estado);

    @Query("""
        SELECT s FROM Solicitud s
        JOIN FETCH s.solicitante
        WHERE s.unidad.id = :idUnidad AND s.estado = 'PENDIENTE'
        ORDER BY s.fechaSolicitud ASC
        """)
    List<Solicitud> findSolicitudesPendientesGrupo(@Param("idUnidad") Long idUnidad);

    @Query("""
        SELECT s FROM Solicitud s
        JOIN FETCH s.solicitante
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
}
