package com.alberti.joinly.services;

import com.alberti.joinly.dto.usuario.PreferenciasNotificacionDTO;
import com.alberti.joinly.entities.enums.EstadoUsuario;
import com.alberti.joinly.entities.usuario.Usuario;
import com.alberti.joinly.exceptions.ResourceNotFoundException;
import com.alberti.joinly.repositories.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;

    public Optional<Usuario> buscarPorId(Long id) {
        return usuarioRepository.findById(id);
    }

    public Optional<Usuario> buscarPorEmail(String email) {
        return usuarioRepository.findByEmail(email);
    }

    public List<Usuario> buscarPorNombre(String nombre) {
        return usuarioRepository.buscarPorNombreYEstado(nombre, EstadoUsuario.ACTIVO);
    }

    public Page<Usuario> buscarPorNombrePaginado(String nombre, Pageable pageable) {
        return usuarioRepository.buscarPorNombreYEstadoPaginado(nombre, EstadoUsuario.ACTIVO, pageable);
    }

    public List<Usuario> listarAgentesSoporte() {
        return usuarioRepository.findAgentesSoporteActivos();
    }

    @Transactional
    public Usuario registrar(String nombre, String email, String passwordEncriptado) {
        if (usuarioRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Ya existe un usuario con el email: " + email);
        }

        var usuario = Usuario.builder()
                .nombre(nombre)
                .email(email)
                .password(passwordEncriptado)
                .fechaRegistro(LocalDateTime.now())
                .estado(EstadoUsuario.ACTIVO)
                .emailVerificado(false)
                .rol(com.alberti.joinly.entities.enums.RolUsuario.USER)
                .build();

        return usuarioRepository.save(usuario);
    }

    @Transactional
    public Usuario actualizarPerfil(Long idUsuario, String nombre, String telefono, String avatar, String temaPreferido) {
        var usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado con ID: " + idUsuario));

        if (nombre != null && !nombre.isBlank()) {
            usuario.setNombre(nombre);
        }
        if (telefono != null) {
            usuario.setTelefono(telefono);
        }
        if (avatar != null) {
            usuario.setAvatar(avatar);
        }
        if (temaPreferido != null) {
            if (!temaPreferido.matches("^(light|dark)$")) {
                throw new IllegalArgumentException(
                        "Tema inválido. Valores permitidos: 'light', 'dark'"
                );
            }
            usuario.setTemaPreferido(temaPreferido);
        }

        return usuarioRepository.save(usuario);
    }

    @Transactional
    public void registrarAcceso(Long idUsuario) {
        usuarioRepository.findById(idUsuario).ifPresent(usuario -> {
            usuario.setFechaUltimoAcceso(LocalDateTime.now());
            usuarioRepository.save(usuario);
        });
    }

    @Transactional
    public void verificarEmail(Long idUsuario) {
        var usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        
        usuario.setEmailVerificado(true);
        usuarioRepository.save(usuario);
    }

    @Transactional
    public void desactivarUsuario(Long idUsuario) {
        var usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        
        usuario.setEstado(EstadoUsuario.ELIMINADO);
        usuarioRepository.save(usuario);
    }

    public boolean existeEmail(String email) {
        return usuarioRepository.existsByEmail(email);
    }

    /**
     * Obtiene las preferencias de notificación del usuario.
     *
     * @param idUsuario ID del usuario
     * @return DTO con las preferencias de notificación
     * @throws ResourceNotFoundException Si el usuario no existe
     */
    public PreferenciasNotificacionDTO obtenerPreferenciasNotificacion(Long idUsuario) {
        var usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + idUsuario));

        return PreferenciasNotificacionDTO.builder()
                .notifSolicitudes(usuario.getNotifSolicitudes())
                .notifPagos(usuario.getNotifPagos())
                .notifRecordatorios(usuario.getNotifRecordatorios())
                .notifNovedades(usuario.getNotifNovedades())
                .build();
    }

    /**
     * Actualiza las preferencias de notificación del usuario.
     *
     * @param idUsuario ID del usuario
     * @param preferencias DTO con las nuevas preferencias
     * @return DTO con las preferencias actualizadas
     * @throws ResourceNotFoundException Si el usuario no existe
     */
    @Transactional
    public PreferenciasNotificacionDTO actualizarPreferenciasNotificacion(Long idUsuario, PreferenciasNotificacionDTO preferencias) {
        var usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + idUsuario));

        usuario.setNotifSolicitudes(preferencias.getNotifSolicitudes());
        usuario.setNotifPagos(preferencias.getNotifPagos());
        usuario.setNotifRecordatorios(preferencias.getNotifRecordatorios());
        usuario.setNotifNovedades(preferencias.getNotifNovedades());

        usuarioRepository.save(usuario);

        return PreferenciasNotificacionDTO.builder()
                .notifSolicitudes(usuario.getNotifSolicitudes())
                .notifPagos(usuario.getNotifPagos())
                .notifRecordatorios(usuario.getNotifRecordatorios())
                .notifNovedades(usuario.getNotifNovedades())
                .build();
    }
}
