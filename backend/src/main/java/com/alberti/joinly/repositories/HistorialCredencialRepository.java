package com.alberti.joinly.repositories;

import com.alberti.joinly.entities.suscripcion.HistorialCredencial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HistorialCredencialRepository extends JpaRepository<HistorialCredencial, Long> {

    @Query("""
            SELECT h FROM HistorialCredencial h
            JOIN FETCH h.usuarioCambio
            WHERE h.credencial.id = :idCredencial
            ORDER BY h.fechaCambio DESC
            """)
    List<HistorialCredencial> findHistorialPorCredencial(@Param("idCredencial") Long idCredencial);
}
