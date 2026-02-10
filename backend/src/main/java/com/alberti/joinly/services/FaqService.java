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
public class FaqService {
    private final PreguntaFrecuenteRepository preguntaFrecuenteRepository;

    public List<PreguntaFrecuente> obtenerTodas() {
        return preguntaFrecuenteRepository.findAll();
    }

    public List<PreguntaFrecuente> obtenerPorCategoria(CategoriaFaq categoria) {
        return preguntaFrecuenteRepository.findByCategoria(categoria);
    }

    public List<PreguntaFrecuente> obtenerActivos() {
        return preguntaFrecuenteRepository.findByActivoTrueOrderByOrdenAsc();
    }

    public PreguntaFrecuente obtenerPorId(Long id) {
        return preguntaFrecuenteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FAQ", "id", id));
    }

    @Transactional
    public PreguntaFrecuente crear(CrearPregunta pregunta) {
        var nuevaPregunta = PreguntaFrecuente.builder()
                .pregunta(pregunta.pregunta())
                .respuesta(pregunta.respuesta())
                .categoria(CategoriaFaq.valueOf(pregunta.categoria()))
                .orden(pregunta.orden())
                .activo(true)
                .build();
        return preguntaFrecuenteRepository.save(nuevaPregunta);
    }

    @Transactional
    public void eliminar(Long id) {
        var pregunta = obtenerPorId(id);
        pregunta.setActivo(false);
        preguntaFrecuenteRepository.save(pregunta);
        log.info("Pregunta con id {} desactivada", id);
    }

}
