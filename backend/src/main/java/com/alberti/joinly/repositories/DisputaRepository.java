package com.alberti.joinly.repositories;

import com.alberti.joinly.entities.enums.EstadoDisputa;
import com.alberti.joinly.entities.pago.Disputa;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DisputaRepository extends JpaRepository<Disputa, Long> {

    @Query("""
            SELECT d FROM Disputa d
            JOIN FETCH d.pago p
            JOIN FETCH d.reclamante
            JOIN FETCH p.suscripcion s
            JOIN FETCH s.servicio
            WHERE d.id = :id
            """)
    Optional<Disputa> findByIdConDetalles(@Param("id") Long id);

    @Query("""
            SELECT d FROM Disputa d
            JOIN FETCH d.pago
            JOIN FETCH d.reclamante
            WHERE d.reclamante.id = :idUsuario
            ORDER BY d.fechaApertura DESC
            """)
    Page<Disputa> findDisputasPorReclamante(@Param("idUsuario") Long idUsuario, Pageable pageable);

    @Query("""
            SELECT d FROM Disputa d
            JOIN FETCH d.pago p
            JOIN FETCH d.reclamante
            JOIN FETCH p.suscripcion s
            WHERE d.estado IN :estados
            ORDER BY d.fechaApertura ASC
            """)
    List<Disputa> findDisputasPorEstados(@Param("estados") List<EstadoDisputa> estados);

    @Query("""
            SELECT d FROM Disputa d
            WHERE d.agenteResolutor.id = :idAgente
            AND d.estado IN ('ABIERTA', 'EN_REVISION')
            ORDER BY d.fechaApertura ASC
            """)
    List<Disputa> findDisputasAsignadasAgente(@Param("idAgente") Long idAgente);

    boolean existsByPagoIdAndEstadoIn(Long idPago, List<EstadoDisputa> estados);

    @Query("SELECT COUNT(d) FROM Disputa d WHERE d.pago.id = :idPago AND d.estado IN ('ABIERTA', 'EN_REVISION')")
    long contarDisputasActivasPorPago(@Param("idPago") Long idPago);

    List<Disputa> findByPagoIdOrderByFechaAperturaDesc(Long idPago);
}
