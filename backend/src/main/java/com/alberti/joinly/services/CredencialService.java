package com.alberti.joinly.services;

import com.alberti.joinly.dto.credencial.CredencialRequest;
import com.alberti.joinly.entities.enums.EstadoPlaza;
import com.alberti.joinly.entities.suscripcion.Credencial;
import com.alberti.joinly.entities.suscripcion.HistorialCredencial;
import com.alberti.joinly.exceptions.BusinessException;
import com.alberti.joinly.exceptions.ResourceNotFoundException;
import com.alberti.joinly.exceptions.UnauthorizedException;
import com.alberti.joinly.repositories.CredencialRepository;
import com.alberti.joinly.repositories.HistorialCredencialRepository;
import com.alberti.joinly.repositories.PlazaRepository;
import com.alberti.joinly.repositories.SuscripcionRepository;
import com.alberti.joinly.repositories.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Servicio para gestión de credenciales de suscripciones con encriptación AES-256.
 * <p>
 * Las credenciales son información sensible (usuarios, contraseñas, PINs) que los
 * anfitriones comparten con los miembros de sus suscripciones.
 * <p>
 * <b>Reglas de acceso:</b>
 * <ul>
 *   <li>Solo el anfitrión puede crear/modificar/eliminar credenciales</li>
 *   <li>Solo usuarios con plaza OCUPADA pueden ver credenciales visibles</li>
 *   <li>Todos los cambios se registran en historial (auditoría)</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class CredencialService {

    private final CredencialRepository credencialRepository;
    private final HistorialCredencialRepository historialRepository;
    private final SuscripcionRepository suscripcionRepository;
    private final PlazaRepository plazaRepository;
    private final UsuarioRepository usuarioRepository;
    private final EncryptionService encryptionService;

    /**
     * Obtiene las credenciales visibles de una suscripción para un usuario autorizado.
     * Solo usuarios con plaza ocupada pueden acceder.
     */
    public List<Credencial> obtenerCredencialesParaUsuario(Long idSuscripcion, Long idUsuario) {
        verificarAccesoCredenciales(idSuscripcion, idUsuario);
        return credencialRepository.findCredencialesVisiblesPorSuscripcion(idSuscripcion);
    }

    /**
     * Obtiene todas las credenciales de una suscripción (solo para anfitrión).
     */
    public List<Credencial> obtenerTodasCredenciales(Long idSuscripcion, Long idAnfitrion) {
        verificarEsAnfitrion(idSuscripcion, idAnfitrion);
        return credencialRepository.findAllBySuscripcionId(idSuscripcion);
    }

    /**
     * Desencripta el valor de una credencial.
     */
    public String desencriptarValor(Credencial credencial) {
        return encryptionService.decrypt(credencial.getValorEncriptado());
    }

    /**
     * Crea una nueva credencial para una suscripción.
     *
     * @param idSuscripcion ID de la suscripción
     * @param idAnfitrion   ID del usuario que crea (debe ser anfitrión)
     * @param request       Datos de la credencial
     * @return Credencial creada
     */
    @Transactional
    public Credencial crearCredencial(Long idSuscripcion, Long idAnfitrion, CredencialRequest request) {
        log.info("Creando credencial para suscripción {} por usuario {}", idSuscripcion, idAnfitrion);

        var suscripcion = suscripcionRepository.findById(idSuscripcion)
                .orElseThrow(() -> new ResourceNotFoundException("Suscripción", "id", idSuscripcion));

        verificarEsAnfitrion(idSuscripcion, idAnfitrion);

        if (credencialRepository.existsBySuscripcionIdAndEtiqueta(idSuscripcion, request.etiqueta())) {
            throw new BusinessException("Ya existe una credencial con la etiqueta: " + request.etiqueta());
        }

        var credencial = Credencial.builder()
                .suscripcion(suscripcion)
                .tipo(request.tipo())
                .etiqueta(request.etiqueta())
                .valorEncriptado(encryptionService.encrypt(request.valor()))
                .instrucciones(request.instrucciones())
                .visibleParaMiembros(request.visibleParaMiembros())
                .build();

        return credencialRepository.save(credencial);
    }

    /**
     * Actualiza una credencial existente, guardando el valor anterior en historial.
     */
    @Transactional
    public Credencial actualizarCredencial(Long idCredencial, Long idAnfitrion, CredencialRequest request, String ip) {
        log.info("Actualizando credencial {} por usuario {}", idCredencial, idAnfitrion);

        var credencial = credencialRepository.findByIdConSuscripcion(idCredencial)
                .orElseThrow(() -> new ResourceNotFoundException("Credencial", "id", idCredencial));

        verificarEsAnfitrion(credencial.getSuscripcion().getId(), idAnfitrion);

        var usuario = usuarioRepository.findById(idAnfitrion)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "id", idAnfitrion));

        // Guardar en historial antes de modificar
        var historial = HistorialCredencial.builder()
                .credencial(credencial)
                .valorAnteriorEncriptado(credencial.getValorEncriptado())
                .usuarioCambio(usuario)
                .fechaCambio(LocalDateTime.now())
                .ipCambio(ip)
                .build();
        historialRepository.save(historial);

        // Actualizar credencial
        credencial.setTipo(request.tipo());
        credencial.setEtiqueta(request.etiqueta());
        credencial.setValorEncriptado(encryptionService.encrypt(request.valor()));
        credencial.setInstrucciones(request.instrucciones());
        credencial.setVisibleParaMiembros(request.visibleParaMiembros());

        return credencialRepository.save(credencial);
    }

    /**
     * Elimina una credencial.
     */
    @Transactional
    public void eliminarCredencial(Long idCredencial, Long idAnfitrion) {
        log.info("Eliminando credencial {} por usuario {}", idCredencial, idAnfitrion);

        var credencial = credencialRepository.findByIdConSuscripcion(idCredencial)
                .orElseThrow(() -> new ResourceNotFoundException("Credencial", "id", idCredencial));

        verificarEsAnfitrion(credencial.getSuscripcion().getId(), idAnfitrion);

        credencialRepository.delete(credencial);
    }

    private void verificarAccesoCredenciales(Long idSuscripcion, Long idUsuario) {
        var tieneAcceso = plazaRepository.existsBySuscripcionIdAndUsuarioIdAndEstado(
                idSuscripcion, idUsuario, EstadoPlaza.OCUPADA);

        if (!tieneAcceso) {
            throw new UnauthorizedException("No tienes plaza ocupada en esta suscripción");
        }
    }

    private void verificarEsAnfitrion(Long idSuscripcion, Long idUsuario) {
        var suscripcion = suscripcionRepository.findById(idSuscripcion)
                .orElseThrow(() -> new ResourceNotFoundException("Suscripción", "id", idSuscripcion));

        if (!suscripcion.getAnfitrion().getId().equals(idUsuario)) {
            throw new UnauthorizedException("Solo el anfitrión puede gestionar las credenciales");
        }
    }
}
