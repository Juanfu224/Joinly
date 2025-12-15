package com.alberti.joinly.services;

import com.alberti.joinly.dto.metodopago.CreateMetodoPagoRequest;
import com.alberti.joinly.entities.enums.EstadoMetodoPago;
import com.alberti.joinly.entities.usuario.MetodoPagoUsuario;
import com.alberti.joinly.entities.usuario.Usuario;
import com.alberti.joinly.exceptions.BusinessException;
import com.alberti.joinly.exceptions.ResourceNotFoundException;
import com.alberti.joinly.repositories.MetodoPagoRepository;
import com.alberti.joinly.repositories.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Servicio de gestión de métodos de pago de usuarios.
 * <p>
 * Este servicio implementa operaciones para gestionar los métodos de pago tokenizados
 * de los usuarios, cumpliendo con PCI-DSS al no almacenar datos completos de tarjetas.
 * <p>
 * <b>Funcionalidades:</b>
 * <ul>
 *   <li>Registrar nuevos métodos de pago tokenizados</li>
 *   <li>Listar métodos de pago activos del usuario</li>
 *   <li>Marcar un método como predeterminado</li>
 *   <li>Eliminar métodos de pago (soft delete)</li>
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
public class MetodoPagoService {

    private final MetodoPagoRepository metodoPagoRepository;
    private final UsuarioRepository usuarioRepository;

    /**
     * Lista todos los métodos de pago activos de un usuario.
     * <p>
     * Los métodos se ordenan con el predeterminado primero.
     *
     * @param idUsuario ID del usuario
     * @return Lista de métodos de pago activos
     */
    public List<MetodoPagoUsuario> listarMetodosPorUsuario(Long idUsuario) {
        log.debug("Listando métodos de pago activos del usuario: {}", idUsuario);
        return metodoPagoRepository.findMetodosActivosPorUsuario(idUsuario);
    }

    /**
     * Busca un método de pago por ID.
     *
     * @param idMetodo ID del método de pago
     * @return El método de pago encontrado
     * @throws ResourceNotFoundException si el método no existe
     */
    public MetodoPagoUsuario buscarPorId(Long idMetodo) {
        log.debug("Buscando método de pago con id: {}", idMetodo);
        return metodoPagoRepository.findById(idMetodo)
                .orElseThrow(() -> new ResourceNotFoundException("Método de pago no encontrado con ID: " + idMetodo));
    }

    /**
     * Registra un nuevo método de pago para un usuario.
     * <p>
     * Si se marca como predeterminado, se quita esa marca de los demás métodos del usuario.
     * El token de pasarela debe haber sido generado previamente por el frontend (PCI-DSS).
     *
     * @param idUsuario ID del usuario propietario
     * @param request Datos del método de pago a registrar
     * @return El método de pago registrado
     * @throws ResourceNotFoundException si el usuario no existe
     */
    @Transactional
    public MetodoPagoUsuario registrarMetodoPago(Long idUsuario, CreateMetodoPagoRequest request) {
        log.info("Registrando nuevo método de pago tipo {} para usuario: {}", request.tipo(), idUsuario);

        var usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + idUsuario));

        // Si se marca como predeterminado, quitar esa marca de los demás métodos
        if (Boolean.TRUE.equals(request.esPredeterminado())) {
            log.debug("Quitando marca de predeterminado de otros métodos del usuario: {}", idUsuario);
            metodoPagoRepository.quitarPredeterminadoUsuario(idUsuario);
        }

        var metodoPago = construirMetodoPago(usuario, request);
        var metodoPagoGuardado = metodoPagoRepository.save(metodoPago);

        log.info("Método de pago registrado exitosamente con ID: {}", metodoPagoGuardado.getId());
        return metodoPagoGuardado;
    }

    /**
     * Marca un método de pago como predeterminado.
     * <p>
     * Se quita la marca de predeterminado de los demás métodos del usuario.
     * Solo el propietario puede marcar sus métodos como predeterminados.
     *
     * @param idUsuario ID del usuario propietario
     * @param idMetodo ID del método de pago a marcar como predeterminado
     * @return El método de pago actualizado
     * @throws ResourceNotFoundException si el método no existe
     * @throws BusinessException si el usuario no es propietario del método
     */
    @Transactional
    public MetodoPagoUsuario marcarComoPredeterminado(Long idUsuario, Long idMetodo) {
        log.info("Marcando método de pago {} como predeterminado para usuario: {}", idMetodo, idUsuario);

        var metodoPago = buscarPorId(idMetodo);

        // Verificar que el método pertenece al usuario
        if (!metodoPago.getUsuario().getId().equals(idUsuario)) {
            throw new BusinessException("No tienes permiso para modificar este método de pago");
        }

        // Verificar que el método está activo
        if (metodoPago.getEstado() != EstadoMetodoPago.ACTIVO) {
            throw new BusinessException("El método de pago debe estar activo para marcarse como predeterminado");
        }

        // Quitar marca de predeterminado de los demás métodos
        metodoPagoRepository.quitarPredeterminadoUsuario(idUsuario);

        // Marcar este como predeterminado
        metodoPago.setEsPredeterminado(true);
        var metodoPagoActualizado = metodoPagoRepository.save(metodoPago);

        log.info("Método de pago {} marcado como predeterminado exitosamente", idMetodo);
        return metodoPagoActualizado;
    }

    /**
     * Elimina un método de pago (soft delete).
     * <p>
     * Solo el propietario puede eliminar sus métodos de pago.
     * Si es el método predeterminado, se debe marcar otro como predeterminado antes.
     *
     * @param idUsuario ID del usuario propietario
     * @param idMetodo ID del método de pago a eliminar
     * @throws ResourceNotFoundException si el método no existe
     * @throws BusinessException si el usuario no es propietario o es el último método activo y predeterminado
     */
    @Transactional
    public void eliminarMetodoPago(Long idUsuario, Long idMetodo) {
        log.info("Eliminando método de pago {} del usuario: {}", idMetodo, idUsuario);

        var metodoPago = buscarPorId(idMetodo);

        // Verificar que el método pertenece al usuario
        if (!metodoPago.getUsuario().getId().equals(idUsuario)) {
            throw new BusinessException("No tienes permiso para eliminar este método de pago");
        }

        // Verificar que el método no está siendo usado en pagos pendientes
        // (Esto se podría implementar si hay una relación inversa con Pago)

        // Soft delete
        metodoPago.setEstado(EstadoMetodoPago.ELIMINADO);
        metodoPago.setEsPredeterminado(false);
        metodoPagoRepository.save(metodoPago);

        log.info("Método de pago {} eliminado exitosamente", idMetodo);
    }

    /**
     * Construye una entidad MetodoPagoUsuario desde el DTO de creación.
     *
     * @param usuario Usuario propietario del método
     * @param request DTO con datos del método de pago
     * @return Entidad MetodoPagoUsuario construida
     */
    private MetodoPagoUsuario construirMetodoPago(Usuario usuario, CreateMetodoPagoRequest request) {
        return MetodoPagoUsuario.builder()
                .usuario(usuario)
                .tipo(request.tipo())
                .ultimosDigitos(request.ultimosDigitos())
                .marca(request.marca())
                .tokenPasarela(request.tokenPasarela())
                .fechaExpiracion(request.fechaExpiracion())
                .esPredeterminado(request.esPredeterminado())
                .estado(EstadoMetodoPago.ACTIVO)
                .build();
    }
}
