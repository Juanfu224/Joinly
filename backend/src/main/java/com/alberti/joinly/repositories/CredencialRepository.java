package com.alberti.joinly.repositories;

import com.alberti.joinly.entities.suscripcion.Credencial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CredencialRepository extends JpaRepository<Credencial, Long> {

    @Query("""
            SELECT c FROM Credencial c
            WHERE c.suscripcion.id = :idSuscripcion
            AND c.visibleParaMiembros = true
            ORDER BY c.tipo, c.etiqueta
            """)
    List<Credencial> findCredencialesVisiblesPorSuscripcion(@Param("idSuscripcion") Long idSuscripcion);

    @Query("""
            SELECT c FROM Credencial c
            WHERE c.suscripcion.id = :idSuscripcion
            ORDER BY c.tipo, c.etiqueta
            """)
    List<Credencial> findAllBySuscripcionId(@Param("idSuscripcion") Long idSuscripcion);

    @Query("""
            SELECT c FROM Credencial c
            JOIN FETCH c.suscripcion s
            JOIN FETCH s.anfitrion
            WHERE c.id = :id
            """)
    Optional<Credencial> findByIdConSuscripcion(@Param("id") Long id);

    boolean existsBySuscripcionIdAndEtiqueta(Long idSuscripcion, String etiqueta);
}
