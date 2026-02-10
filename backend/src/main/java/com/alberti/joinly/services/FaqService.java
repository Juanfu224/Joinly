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
        PreguntaFrecuente nuevaPregunta = new PreguntaFrecuente();
        nuevaPregunta.setPregunta(pregunta.pregunta());
        nuevaPregunta.setRespuesta(pregunta.respuesta());
        nuevaPregunta.setCategoria(CategoriaFaq.valueOf(pregunta.categoria()));
        nuevaPregunta.setOrden(pregunta.orden());
        nuevaPregunta.setActivo(true);
        return preguntaFrecuenteRepository.save(nuevaPregunta);
    }

}
