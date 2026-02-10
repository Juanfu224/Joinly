package com.alberti.joinly.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.alberti.joinly.dto.faq.CrearPregunta;
import com.alberti.joinly.entities.enums.CategoriaFaq;
import com.alberti.joinly.entities.faq.PreguntaFrecuente;
import com.alberti.joinly.exceptions.ResourceNotFoundException;
import com.alberti.joinly.repositories.PreguntaFrecuenteRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class PreguntaService {
    private final PreguntaFrecuenteRepository preguntaFrecuenteRepository;

    public List<PreguntaFrecuente> obtenerTodas() {
        return preguntaFrecuenteRepository.findByActivoTrueOrderByOrdenAsc();
    }

    public List<PreguntaFrecuente> obtenerPorCategoria(CategoriaFaq categoria) {
        return preguntaFrecuenteRepository.findByCategoriaAndActivoTrueOrderByOrdenAsc(categoria);
    }

    public PreguntaFrecuente obtenerPorId(Long id) {
        return preguntaFrecuenteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FAQ", "id", id));
    }

    public List<PreguntaFrecuente> buscar(String termino) {
        return preguntaFrecuenteRepository.buscarPorTermino(termino);
    }

    public PreguntaFrecuente crear(CrearPregunta pregunta) {
        var nuevaPregunta = PreguntaFrecuente.builder()
                .pregunta(pregunta.pregunta())
                .respuesta(pregunta.respuesta())
                .categoria(pregunta.categoria())
                .orden(pregunta.orden())
                .activo(true)
                .build();
        return preguntaFrecuenteRepository.save(nuevaPregunta);
    }

    public void eliminar(Long id) {
        var pregunta = obtenerPorId(id);
        pregunta.setActivo(false);
        log.info("Pregunta con id {} desactivada", id);
    }

}
