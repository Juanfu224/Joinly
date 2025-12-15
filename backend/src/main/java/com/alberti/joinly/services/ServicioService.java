package com.alberti.joinly.services;

import com.alberti.joinly.dto.servicio.CreateServicioRequest;
import com.alberti.joinly.dto.servicio.UpdateServicioRequest;
import com.alberti.joinly.entities.enums.CategoriaServicio;
import com.alberti.joinly.entities.suscripcion.Servicio;
import com.alberti.joinly.exceptions.ResourceNotFoundException;
import com.alberti.joinly.exceptions.BusinessException;
import com.alberti.joinly.repositories.ServicioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Servicio de gestión del catálogo de servicios de suscripción.
 * <p>
 * Este servicio implementa operaciones CRUD para el catálogo de servicios disponibles
 * (Netflix, Spotify, etc.) que los usuarios pueden compartir.
 * <p>
 * <b>Funcionalidades:</b>
 * <ul>
 *   <li>Listar servicios activos (público)</li>
 *   <li>Filtrar servicios por categoría</li>
 *   <li>Crear, actualizar y eliminar servicios (solo admin)</li>
 * </ul>
 *
 * @author Joinly Team
 * @version 1.0
 * @since 2025
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class ServicioService {

    private final ServicioRepository servicioRepository;

    /**
     * Lista todos los servicios activos del catálogo.
     *
     * @return Lista de servicios activos
     */
    public List<Servicio> listarServiciosActivos() {
        log.debug("Listando todos los servicios activos");
        return servicioRepository.findByActivoTrue();
    }

    /**
     * Busca un servicio por su ID.
     *
     * @param id ID del servicio
     * @return El servicio encontrado
     * @throws ResourceNotFoundException si el servicio no existe
     */
    public Servicio buscarPorId(Long id) {
        log.debug("Buscando servicio con id: {}", id);
        return servicioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Servicio no encontrado con ID: " + id));
    }

    /**
     * Lista servicios activos filtrados por categoría.
     *
     * @param categoria Categoría del servicio
     * @return Lista de servicios de la categoría especificada
     */
    public List<Servicio> listarPorCategoria(CategoriaServicio categoria) {
        log.debug("Listando servicios activos de categoría: {}", categoria);
        return servicioRepository.findByCategoriaAndActivoTrue(categoria);
    }

    /**
     * Crea un nuevo servicio en el catálogo (solo admin).
     *
     * @param request Datos del servicio a crear
     * @return El servicio creado
     * @throws BusinessException si ya existe un servicio con el mismo nombre
     */
    @Transactional
    public Servicio crearServicio(CreateServicioRequest request) {
        log.info("Creando nuevo servicio: {}", request.nombre());

        servicioRepository.findByNombreIgnoreCase(request.nombre())
                .ifPresent(s -> {
                    throw new BusinessException("Ya existe un servicio con el nombre: " + request.nombre());
                });

        var servicio = Servicio.builder()
                .nombre(request.nombre())
                .categoria(request.categoria())
                .logo(request.logo())
                .descripcion(request.descripcion())
                .urlOficial(request.urlOficial())
                .maxUsuarios(request.maxUsuarios())
                .precioReferencia(request.precioReferencia())
                .monedaReferencia(request.monedaReferencia())
                .activo(true)
                .build();

        var servicioGuardado = servicioRepository.save(servicio);
        log.info("Servicio creado exitosamente con ID: {}", servicioGuardado.getId());

        return servicioGuardado;
    }

    /**
     * Actualiza un servicio existente (solo admin).
     * <p>
     * Solo actualiza los campos proporcionados (no nulos).
     *
     * @param id      ID del servicio a actualizar
     * @param request Datos a actualizar
     * @return El servicio actualizado
     * @throws EntityNotFoundException si el servicio no existe
     */
    @Transactional
    public Servicio actualizarServicio(Long id, UpdateServicioRequest request) {
        log.info("Actualizando servicio con id: {}", id);

        var servicio = buscarPorId(id);

        if (request.nombre() != null && !request.nombre().isBlank()) {
            servicioRepository.findByNombreIgnoreCase(request.nombre())
                    .filter(s -> !s.getId().equals(id))
                    .ifPresent(s -> {
                        throw new BusinessException("Ya existe otro servicio con el nombre: " + request.nombre());
                    });
            servicio.setNombre(request.nombre());
        }

        if (request.categoria() != null) {
            servicio.setCategoria(request.categoria());
        }

        if (request.logo() != null) {
            servicio.setLogo(request.logo());
        }

        if (request.descripcion() != null) {
            servicio.setDescripcion(request.descripcion());
        }

        if (request.urlOficial() != null) {
            servicio.setUrlOficial(request.urlOficial());
        }

        if (request.maxUsuarios() != null) {
            servicio.setMaxUsuarios(request.maxUsuarios());
        }

        if (request.precioReferencia() != null) {
            servicio.setPrecioReferencia(request.precioReferencia());
        }

        if (request.monedaReferencia() != null && !request.monedaReferencia().isBlank()) {
            servicio.setMonedaReferencia(request.monedaReferencia());
        }

        if (request.activo() != null) {
            servicio.setActivo(request.activo());
        }

        var servicioActualizado = servicioRepository.save(servicio);
        log.info("Servicio actualizado exitosamente: {}", servicioActualizado.getId());

        return servicioActualizado;
    }

    /**
     * Elimina un servicio del catálogo (soft delete, marca como inactivo).
     * <p>
     * No se elimina físicamente para mantener integridad referencial con suscripciones existentes.
     *
     * @param id ID del servicio a eliminar
     * @throws EntityNotFoundException si el servicio no existe
     */
    @Transactional
    public void eliminarServicio(Long id) {
        log.info("Marcando servicio como inactivo con id: {}", id);

        var servicio = buscarPorId(id);
        servicio.setActivo(false);
        servicioRepository.save(servicio);

        log.info("Servicio marcado como inactivo: {}", id);
    }
}
