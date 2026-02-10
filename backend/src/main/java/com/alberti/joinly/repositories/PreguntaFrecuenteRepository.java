package com.alberti.joinly.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.alberti.joinly.entities.faq.PreguntaFrecuente;
import com.alberti.joinly.entities.enums.CategoriaFaq;

@Repository
public interface PreguntaFrecuenteRepository extends JpaRepository<PreguntaFrecuente, Long> {
    List<PreguntaFrecuente> findByCategoria(CategoriaFaq categoria);

    List<PreguntaFrecuente> findByActivoTrueOrderByOrdenAsc();

    List<PreguntaFrecuente> buscarPorTermino(@Param("termino") String termino);
}
