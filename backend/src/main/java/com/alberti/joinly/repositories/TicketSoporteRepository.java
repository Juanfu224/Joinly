package com.alberti.joinly.repositories;

import com.alberti.joinly.entities.enums.EstadoTicket;
import com.alberti.joinly.entities.enums.PrioridadTicket;
import com.alberti.joinly.entities.soporte.TicketSoporte;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TicketSoporteRepository extends JpaRepository<TicketSoporte, Long> {

    @Query("""
            SELECT t FROM TicketSoporte t
            LEFT JOIN FETCH t.suscripcion s
            LEFT JOIN FETCH s.servicio
            LEFT JOIN FETCH t.agente
            WHERE t.id = :id
            """)
    Optional<TicketSoporte> findByIdConDetalles(@Param("id") Long id);

    @Query("""
            SELECT t FROM TicketSoporte t
            LEFT JOIN FETCH t.agente
            WHERE t.usuario.id = :idUsuario
            ORDER BY t.fechaApertura DESC
            """)
    Page<TicketSoporte> findTicketsPorUsuario(@Param("idUsuario") Long idUsuario, Pageable pageable);

    @Query("""
            SELECT t FROM TicketSoporte t
            JOIN FETCH t.usuario
            WHERE t.agente.id = :idAgente
            AND t.estado IN :estados
            ORDER BY 
                CASE t.prioridad 
                    WHEN 'URGENTE' THEN 1 
                    WHEN 'ALTA' THEN 2 
                    WHEN 'MEDIA' THEN 3 
                    ELSE 4 
                END,
                t.fechaApertura ASC
            """)
    List<TicketSoporte> findTicketsAsignadosAgente(
            @Param("idAgente") Long idAgente,
            @Param("estados") List<EstadoTicket> estados);

    @Query("""
            SELECT t FROM TicketSoporte t
            JOIN FETCH t.usuario
            WHERE t.agente IS NULL
            AND t.estado = 'ABIERTO'
            ORDER BY 
                CASE t.prioridad 
                    WHEN 'URGENTE' THEN 1 
                    WHEN 'ALTA' THEN 2 
                    WHEN 'MEDIA' THEN 3 
                    ELSE 4 
                END,
                t.fechaApertura ASC
            """)
    List<TicketSoporte> findTicketsSinAsignar();

    @Query("""
            SELECT t FROM TicketSoporte t
            JOIN FETCH t.usuario
            WHERE t.estado IN :estados
            AND (:prioridad IS NULL OR t.prioridad = :prioridad)
            ORDER BY t.fechaApertura DESC
            """)
    Page<TicketSoporte> findTicketsPorEstadosYPrioridad(
            @Param("estados") List<EstadoTicket> estados,
            @Param("prioridad") PrioridadTicket prioridad,
            Pageable pageable);

    @Query("SELECT COUNT(t) FROM TicketSoporte t WHERE t.usuario.id = :idUsuario AND t.estado IN ('ABIERTO', 'EN_PROCESO')")
    long contarTicketsActivosPorUsuario(@Param("idUsuario") Long idUsuario);

    @Query("SELECT COUNT(t) FROM TicketSoporte t WHERE t.agente.id = :idAgente AND t.estado IN ('ABIERTO', 'EN_PROCESO')")
    long contarTicketsActivosPorAgente(@Param("idAgente") Long idAgente);
}
