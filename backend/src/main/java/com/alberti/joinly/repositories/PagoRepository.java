package com.alberti.joinly.repositories;

import com.alberti.joinly.entities.enums.EstadoPago;
import com.alberti.joinly.entities.pago.Pago;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PagoRepository extends JpaRepository<Pago, Long> {

    @Query("""
            SELECT p FROM Pago p
            JOIN FETCH p.plaza pl
            JOIN FETCH pl.suscripcion s
            JOIN FETCH s.servicio
            WHERE p.usuario.id = :idUsuario
            ORDER BY p.fechaPago DESC
            """)
    Page<Pago> findPagosConDetallesPorUsuario(@Param("idUsuario") Long idUsuario, Pageable pageable);

    /**
     * Busca pagos de un usuario con filtros opcionales de estado y rango de fechas.
     * Soporta paginación y ordenación dinámica.
     * 
     * @param idUsuario ID del usuario
     * @param estado Estado del pago (puede ser null para todos los estados)
     * @param fechaDesde Fecha inicio del rango (puede ser null)
     * @param fechaHasta Fecha fin del rango (puede ser null)
     * @param pageable Configuración de paginación y ordenación
     * @return Página de pagos que cumplen los criterios
     */
    @Query("""
            SELECT p FROM Pago p
            JOIN FETCH p.plaza pl
            JOIN FETCH pl.suscripcion s
            JOIN FETCH s.servicio
            WHERE p.usuario.id = :idUsuario
            AND (:estado IS NULL OR p.estado = :estado)
            AND (:fechaDesde IS NULL OR CAST(p.fechaPago AS LocalDate) >= :fechaDesde)
            AND (:fechaHasta IS NULL OR CAST(p.fechaPago AS LocalDate) <= :fechaHasta)
            """)
    Page<Pago> findPagosConDetallesPorUsuarioWithFilters(
            @Param("idUsuario") Long idUsuario,
            @Param("estado") EstadoPago estado,
            @Param("fechaDesde") LocalDate fechaDesde,
            @Param("fechaHasta") LocalDate fechaHasta,
            Pageable pageable);

    @Query("""
            SELECT p FROM Pago p
            JOIN FETCH p.usuario
            JOIN FETCH p.plaza
            WHERE p.suscripcion.id = :idSuscripcion
            ORDER BY p.fechaPago DESC
            """)
    List<Pago> findPagosPorSuscripcion(@Param("idSuscripcion") Long idSuscripcion);

    @Query("""
            SELECT p FROM Pago p
            WHERE p.estado = :estado
            AND p.fechaRetencionHasta <= :fecha
            AND NOT EXISTS (
                SELECT d FROM Disputa d 
                WHERE d.pago = p AND d.estado IN ('ABIERTA', 'EN_REVISION')
            )
            """)
    List<Pago> findPagosListosParaLiberar(
            @Param("estado") EstadoPago estado,
            @Param("fecha") LocalDate fecha);

    @Query("""
            SELECT p FROM Pago p
            JOIN FETCH p.plaza pl
            JOIN FETCH pl.suscripcion s
            JOIN FETCH p.metodoPago
            WHERE p.id = :id
            """)
    Optional<Pago> findByIdConDetalles(@Param("id") Long id);

    @Query("""
            SELECT SUM(p.monto) FROM Pago p
            WHERE p.suscripcion.id = :idSuscripcion
            AND p.estado = 'LIBERADO'
            AND p.cicloInicio >= :inicioMes AND p.cicloFin <= :finMes
            """)
    Optional<java.math.BigDecimal> calcularIngresosMensualesSuscripcion(
            @Param("idSuscripcion") Long idSuscripcion,
            @Param("inicioMes") LocalDate inicioMes,
            @Param("finMes") LocalDate finMes);

    List<Pago> findByEstadoAndFechaPagoBefore(EstadoPago estado, LocalDateTime fecha);

    @Modifying
    @Query("""
            UPDATE Pago p SET p.estado = :nuevoEstado, p.fechaLiberacion = :fechaLiberacion
            WHERE p.id = :id AND p.estado = :estadoActual
            """)
    int actualizarEstado(
            @Param("id") Long id,
            @Param("estadoActual") EstadoPago estadoActual,
            @Param("nuevoEstado") EstadoPago nuevoEstado,
            @Param("fechaLiberacion") LocalDateTime fechaLiberacion);

    @Query("SELECT COUNT(p) FROM Pago p WHERE p.plaza.id = :idPlaza AND p.estado = 'PENDIENTE'")
    long contarPagosPendientesPorPlaza(@Param("idPlaza") Long idPlaza);

    boolean existsByPlazaIdAndCicloInicioAndCicloFin(Long idPlaza, LocalDate cicloInicio, LocalDate cicloFin);
}
