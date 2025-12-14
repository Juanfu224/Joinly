package com.alberti.joinly.repositories;

import com.alberti.joinly.entities.enums.EstadoPlaza;
import com.alberti.joinly.entities.suscripcion.Plaza;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlazaRepository extends JpaRepository<Plaza, Long> {

    List<Plaza> findBySuscripcionIdAndEstado(Long idSuscripcion, EstadoPlaza estado);

    Optional<Plaza> findBySuscripcionIdAndUsuarioId(Long idSuscripcion, Long idUsuario);

    boolean existsBySuscripcionIdAndUsuarioId(Long idSuscripcion, Long idUsuario);

    @Query("SELECT COUNT(p) FROM Plaza p WHERE p.suscripcion.id = :idSuscripcion AND p.estado = 'OCUPADA'")
    long contarPlazasOcupadas(@Param("idSuscripcion") Long idSuscripcion);

    @Query("SELECT COUNT(p) FROM Plaza p WHERE p.suscripcion.id = :idSuscripcion AND p.estado = 'DISPONIBLE'")
    long contarPlazasDisponibles(@Param("idSuscripcion") Long idSuscripcion);

    @Query("""
        SELECT p FROM Plaza p
        WHERE p.suscripcion.id = :idSuscripcion AND p.estado = 'DISPONIBLE'
        ORDER BY p.numeroPlaza ASC
        """)
    List<Plaza> findPlazasDisponiblesOrdenadas(@Param("idSuscripcion") Long idSuscripcion);

    @Query("""
        SELECT p FROM Plaza p
        JOIN FETCH p.suscripcion s
        JOIN FETCH s.servicio
        WHERE p.usuario.id = :idUsuario AND p.estado = 'OCUPADA'
        """)
    List<Plaza> findPlazasOcupadasPorUsuario(@Param("idUsuario") Long idUsuario);

    /**
     * Verifica si un usuario tiene una plaza con estado específico en una suscripción.
     * Usada por CredencialService para validar acceso a credenciales.
     */
    boolean existsBySuscripcionIdAndUsuarioIdAndEstado(
            Long idSuscripcion, Long idUsuario, EstadoPlaza estado);
}
