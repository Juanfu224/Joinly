package com.alberti.joinly.repositories;

import com.alberti.joinly.entities.enums.EstadoMetodoPago;
import com.alberti.joinly.entities.usuario.MetodoPagoUsuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MetodoPagoRepository extends JpaRepository<MetodoPagoUsuario, Long> {

    @Query("SELECT m FROM MetodoPagoUsuario m WHERE m.usuario.id = :idUsuario AND m.estado = 'ACTIVO' ORDER BY m.esPredeterminado DESC")
    List<MetodoPagoUsuario> findMetodosActivosPorUsuario(@Param("idUsuario") Long idUsuario);

    @Query("SELECT m FROM MetodoPagoUsuario m WHERE m.usuario.id = :idUsuario AND m.esPredeterminado = true AND m.estado = 'ACTIVO'")
    Optional<MetodoPagoUsuario> findMetodoPredeterminado(@Param("idUsuario") Long idUsuario);

    @Modifying
    @Query("UPDATE MetodoPagoUsuario m SET m.esPredeterminado = false WHERE m.usuario.id = :idUsuario")
    int quitarPredeterminadoUsuario(@Param("idUsuario") Long idUsuario);

    boolean existsByUsuarioIdAndEstado(Long idUsuario, EstadoMetodoPago estado);

    @Query("SELECT COUNT(m) FROM MetodoPagoUsuario m WHERE m.usuario.id = :idUsuario AND m.estado = 'ACTIVO'")
    long contarMetodosActivosPorUsuario(@Param("idUsuario") Long idUsuario);
}
