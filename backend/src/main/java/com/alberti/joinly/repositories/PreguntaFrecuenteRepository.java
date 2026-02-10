package com.alberti.joinly.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.alberti.joinly.entities.faq.PreguntaFrecuente;
import com.alberti.joinly.entities.enums.CategoriaFaq;

public interface PreguntaFrecuenteRepository extends JpaRepository<PreguntaFrecuente, Long> {
    List<PreguntaFrecuente> findByCategoriaAndActivoTrueOrderByOrdenAsc(CategoriaFaq categoria);

    List<PreguntaFrecuente> findByActivoTrueOrderByOrdenAsc();

    @Query("SELECT p FROM PreguntaFrecuente p WHERE p.activo = true AND (LOWER(p.pregunta) LIKE LOWER(CONCAT('%', :termino, '%')) OR LOWER(p.respuesta) LIKE LOWER(CONCAT('%', :termino, '%')))")
    List<PreguntaFrecuente> buscarPorTermino(@Param("termino") String termino);
}
