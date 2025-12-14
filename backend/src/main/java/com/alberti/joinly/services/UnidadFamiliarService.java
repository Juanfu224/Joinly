package com.alberti.joinly.services;

import com.alberti.joinly.entities.enums.EstadoMiembro;
import com.alberti.joinly.entities.enums.EstadoUnidadFamiliar;
import com.alberti.joinly.entities.enums.RolMiembro;
import com.alberti.joinly.entities.grupo.MiembroUnidad;
import com.alberti.joinly.entities.grupo.UnidadFamiliar;
import com.alberti.joinly.entities.usuario.Usuario;
import com.alberti.joinly.repositories.MiembroUnidadRepository;
import com.alberti.joinly.repositories.SuscripcionRepository;
import com.alberti.joinly.repositories.UnidadFamiliarRepository;
import com.alberti.joinly.repositories.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UnidadFamiliarService {

    private static final String CARACTERES_CODIGO = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final int LONGITUD_CODIGO = 12;
    private static final int MAX_GRUPOS_POR_USUARIO = 10;

    private final UnidadFamiliarRepository unidadFamiliarRepository;
    private final MiembroUnidadRepository miembroUnidadRepository;
    private final UsuarioRepository usuarioRepository;
    private final SuscripcionRepository suscripcionRepository;
    private final SecureRandom random = new SecureRandom();

    public Optional<UnidadFamiliar> buscarPorId(Long id) {
        return unidadFamiliarRepository.findById(id);
    }

    public Optional<UnidadFamiliar> buscarPorCodigo(String codigoInvitacion) {
        return unidadFamiliarRepository.findByCodigoInvitacion(codigoInvitacion.toUpperCase());
    }

    public List<UnidadFamiliar> listarGruposAdministrados(Long idUsuario) {
        return unidadFamiliarRepository.findUnidadesAdministradasActivas(idUsuario);
    }

    public List<UnidadFamiliar> listarGruposDondeEsMiembro(Long idUsuario) {
        return unidadFamiliarRepository.findUnidadesDondeEsMiembroActivo(idUsuario);
    }

    public List<MiembroUnidad> listarMiembrosActivos(Long idUnidad) {
        return miembroUnidadRepository.findByUnidadIdAndEstadoConUsuario(idUnidad, EstadoMiembro.ACTIVO);
    }

    /**
     * Crea un nuevo grupo familiar y registra al creador como administrador.
     * <p>
     * Este método realiza las siguientes operaciones atómicamente:
     * <ol>
     *   <li>Verifica que el usuario no haya alcanzado el límite de grupos (máx. {@value #MAX_GRUPOS_POR_USUARIO})</li>
     *   <li>Genera un código de invitación único de {@value #LONGITUD_CODIGO} caracteres alfanuméricos</li>
     *   <li>Crea la unidad familiar con estado ACTIVO y límite de 10 miembros por defecto</li>
     *   <li>Añade al administrador como primer miembro con rol ADMINISTRADOR</li>
     * </ol>
     *
     * @param idAdministrador ID del usuario que será administrador del grupo
     * @param nombre          Nombre del grupo familiar (obligatorio)
     * @param descripcion     Descripción opcional del grupo
     * @return La unidad familiar creada con su código de invitación
     * @throws IllegalArgumentException si el usuario no existe o alcanzó límite de grupos
     */
    @Transactional
    public UnidadFamiliar crearUnidadFamiliar(Long idAdministrador, String nombre, String descripcion) {
        var administrador = usuarioRepository.findById(idAdministrador)
                .orElseThrow(() -> new IllegalArgumentException("Usuario administrador no encontrado"));

        // Validar límite de grupos por usuario
        var gruposActuales = miembroUnidadRepository.contarGruposActivosDelUsuario(idAdministrador);
        if (gruposActuales >= MAX_GRUPOS_POR_USUARIO) {
            throw new IllegalArgumentException("Has alcanzado el límite máximo de grupos (" + MAX_GRUPOS_POR_USUARIO + ")");
        }

        var codigoUnico = generarCodigoUnico();

        var unidadFamiliar = UnidadFamiliar.builder()
                .nombre(nombre)
                .descripcion(descripcion)
                .codigoInvitacion(codigoUnico)
                .administrador(administrador)
                .fechaCreacion(LocalDateTime.now())
                .estado(EstadoUnidadFamiliar.ACTIVO)
                .maxMiembros((short) 10)
                .build();

        var unidadGuardada = unidadFamiliarRepository.save(unidadFamiliar);

        // El administrador se añade automáticamente como miembro
        agregarMiembroInterno(unidadGuardada, administrador, RolMiembro.ADMINISTRADOR);

        return unidadGuardada;
    }

    @Transactional
    public MiembroUnidad agregarMiembro(Long idUnidad, Long idUsuario) {
        var unidad = unidadFamiliarRepository.findById(idUnidad)
                .orElseThrow(() -> new IllegalArgumentException("Unidad familiar no encontrada"));
        
        var usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        validarPuedeUnirse(unidad, usuario);

        return agregarMiembroInterno(unidad, usuario, RolMiembro.MIEMBRO);
    }

    /**
     * Valida si un usuario puede unirse a un grupo familiar.
     * <p>
     * Validaciones realizadas:
     * <ul>
     *   <li>El grupo debe estar en estado ACTIVO</li>
     *   <li>El usuario no puede ser ya miembro activo</li>
     *   <li>El grupo no puede haber alcanzado su límite de miembros</li>
     *   <li>El usuario no puede pertenecer a más de {@value #MAX_GRUPOS_POR_USUARIO} grupos</li>
     * </ul>
     *
     * @param unidad  El grupo familiar al que se desea unir
     * @param usuario El usuario que solicita unirse
     * @throws IllegalArgumentException si alguna validación falla
     */
    private void validarPuedeUnirse(UnidadFamiliar unidad, Usuario usuario) {
        // Verificar que la unidad esté activa
        if (unidad.getEstado() != EstadoUnidadFamiliar.ACTIVO) {
            throw new IllegalArgumentException("La unidad familiar no está activa");
        }

        // Verificar que el usuario no sea ya miembro activo
        var yaMiembro = miembroUnidadRepository.existsByUsuarioIdAndUnidadIdAndEstado(
                usuario.getId(), unidad.getId(), EstadoMiembro.ACTIVO);
        if (yaMiembro) {
            throw new IllegalArgumentException("El usuario ya es miembro activo de este grupo");
        }

        // Verificar límite de miembros del grupo
        var miembrosActuales = unidadFamiliarRepository.contarMiembrosActivos(unidad.getId());
        if (miembrosActuales >= unidad.getMaxMiembros()) {
            throw new IllegalArgumentException("El grupo ha alcanzado el número máximo de miembros");
        }

        // Verificar límite de grupos del usuario
        var gruposDelUsuario = miembroUnidadRepository.contarGruposActivosDelUsuario(usuario.getId());
        if (gruposDelUsuario >= MAX_GRUPOS_POR_USUARIO) {
            throw new IllegalArgumentException("El usuario ha alcanzado el límite máximo de grupos");
        }
    }

    private MiembroUnidad agregarMiembroInterno(UnidadFamiliar unidad, Usuario usuario, RolMiembro rol) {
        var miembro = MiembroUnidad.builder()
                .unidad(unidad)
                .usuario(usuario)
                .rol(rol)
                .fechaUnion(LocalDateTime.now())
                .estado(EstadoMiembro.ACTIVO)
                .build();

        return miembroUnidadRepository.save(miembro);
    }

    @Transactional
    public void expulsarMiembro(Long idUnidad, Long idUsuario, Long idSolicitante) {
        var unidad = unidadFamiliarRepository.findById(idUnidad)
                .orElseThrow(() -> new IllegalArgumentException("Unidad familiar no encontrada"));

        // Solo el administrador puede expulsar
        if (!unidad.getAdministrador().getId().equals(idSolicitante)) {
            throw new IllegalArgumentException("Solo el administrador puede expulsar miembros");
        }

        // No puede expulsarse a sí mismo
        if (idUsuario.equals(idSolicitante)) {
            throw new IllegalArgumentException("El administrador no puede expulsarse a sí mismo");
        }

        var miembro = miembroUnidadRepository.findByUsuarioIdAndUnidadId(idUsuario, idUnidad)
                .orElseThrow(() -> new IllegalArgumentException("El usuario no es miembro de este grupo"));

        miembro.setEstado(EstadoMiembro.EXPULSADO);
        miembro.setFechaBaja(LocalDateTime.now());
        miembroUnidadRepository.save(miembro);
    }

    @Transactional
    public void abandonarGrupo(Long idUnidad, Long idUsuario) {
        var unidad = unidadFamiliarRepository.findById(idUnidad)
                .orElseThrow(() -> new IllegalArgumentException("Unidad familiar no encontrada"));

        // El administrador no puede abandonar (debe transferir o eliminar el grupo)
        if (unidad.getAdministrador().getId().equals(idUsuario)) {
            throw new IllegalArgumentException("El administrador no puede abandonar el grupo. Debe transferir la administración o eliminar el grupo.");
        }

        var miembro = miembroUnidadRepository.findByUsuarioIdAndUnidadId(idUsuario, idUnidad)
                .orElseThrow(() -> new IllegalArgumentException("No eres miembro de este grupo"));

        miembro.setEstado(EstadoMiembro.ABANDONO);
        miembro.setFechaBaja(LocalDateTime.now());
        miembroUnidadRepository.save(miembro);
    }

    /**
     * Elimina (soft delete) una unidad familiar cambiando su estado a ELIMINADO.
     * <p>
     * <b>Precondiciones:</b>
     * <ul>
     *   <li>Solo el administrador del grupo puede eliminarlo</li>
     *   <li>El grupo no puede tener suscripciones activas asociadas</li>
     * </ul>
     * <p>
     * Nota: Este es un soft delete, los datos permanecen para auditoría.
     * Las membresías no se modifican ya que el estado de la unidad impide nuevas operaciones.
     *
     * @param idUnidad      ID del grupo a eliminar
     * @param idSolicitante ID del usuario que solicita (debe ser administrador)
     * @throws IllegalArgumentException si el grupo no existe, no es admin, o tiene suscripciones activas
     */
    @Transactional
    public void eliminarUnidadFamiliar(Long idUnidad, Long idSolicitante) {
        var unidad = unidadFamiliarRepository.findById(idUnidad)
                .orElseThrow(() -> new IllegalArgumentException("Unidad familiar no encontrada"));

        if (!unidad.getAdministrador().getId().equals(idSolicitante)) {
            throw new IllegalArgumentException("Solo el administrador puede eliminar el grupo");
        }

        // Verificar que no tenga suscripciones activas antes de eliminar
        var suscripcionesActivas = suscripcionRepository.contarSuscripcionesActivasEnUnidad(idUnidad);
        if (suscripcionesActivas > 0) {
            throw new IllegalArgumentException("No se puede eliminar el grupo mientras tenga suscripciones activas (" + suscripcionesActivas + ")");
        }

        unidad.setEstado(EstadoUnidadFamiliar.ELIMINADO);
        unidadFamiliarRepository.save(unidad);
    }

    public boolean esMiembroActivo(Long idUnidad, Long idUsuario) {
        return miembroUnidadRepository.existsByUsuarioIdAndUnidadIdAndEstado(
                idUsuario, idUnidad, EstadoMiembro.ACTIVO);
    }

    public boolean esAdministrador(Long idUnidad, Long idUsuario) {
        return unidadFamiliarRepository.findById(idUnidad)
                .map(u -> u.getAdministrador().getId().equals(idUsuario))
                .orElse(false);
    }

    private String generarCodigoUnico() {
        String codigo;
        do {
            codigo = generarCodigoAleatorio();
        } while (unidadFamiliarRepository.existsByCodigoInvitacion(codigo));
        return codigo;
    }

    private String generarCodigoAleatorio() {
        var sb = new StringBuilder(LONGITUD_CODIGO);
        for (int i = 0; i < LONGITUD_CODIGO; i++) {
            int index = random.nextInt(CARACTERES_CODIGO.length());
            sb.append(CARACTERES_CODIGO.charAt(index));
        }
        return sb.toString();
    }
}
