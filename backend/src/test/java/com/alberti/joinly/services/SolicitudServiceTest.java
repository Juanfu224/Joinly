package com.alberti.joinly.services;

import com.alberti.joinly.entities.enums.*;
import com.alberti.joinly.entities.grupo.MiembroUnidad;
import com.alberti.joinly.entities.grupo.Solicitud;
import com.alberti.joinly.entities.grupo.UnidadFamiliar;
import com.alberti.joinly.entities.suscripcion.Plaza;
import com.alberti.joinly.entities.suscripcion.Servicio;
import com.alberti.joinly.entities.suscripcion.Suscripcion;
import com.alberti.joinly.entities.usuario.Usuario;
import com.alberti.joinly.exceptions.*;
import com.alberti.joinly.repositories.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.*;

/**
 * Tests unitarios para SolicitudService.
 * Cubre flujos de éxito y error para solicitudes de unión a grupos y suscripciones.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("SolicitudService Unit Tests")
class SolicitudServiceTest {

    @Mock
    private SolicitudRepository solicitudRepository;
    
    @Mock
    private UnidadFamiliarRepository unidadFamiliarRepository;
    
    @Mock
    private SuscripcionRepository suscripcionRepository;
    
    @Mock
    private MiembroUnidadRepository miembroUnidadRepository;
    
    @Mock
    private PlazaRepository plazaRepository;
    
    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private SolicitudService solicitudService;

    // Test fixtures
    private Usuario usuarioSolicitante;
    private Usuario usuarioAdministrador;
    private Usuario usuarioAnfitrion;
    private UnidadFamiliar unidadFamiliar;
    private Suscripcion suscripcion;
    private Servicio servicio;
    private Plaza plazaDisponible;

    @BeforeEach
    void setUp() {
        usuarioSolicitante = Usuario.builder()
                .id(1L)
                .nombre("Juan Solicitante")
                .email("juan@test.com")
                .password("hashedPassword")
                .estado(EstadoUsuario.ACTIVO)
                .fechaRegistro(LocalDateTime.now())
                .build();

        usuarioAdministrador = Usuario.builder()
                .id(2L)
                .nombre("Admin Grupo")
                .email("admin@test.com")
                .password("hashedPassword")
                .estado(EstadoUsuario.ACTIVO)
                .fechaRegistro(LocalDateTime.now())
                .build();

        usuarioAnfitrion = Usuario.builder()
                .id(3L)
                .nombre("Anfitrión Suscripción")
                .email("anfitrion@test.com")
                .password("hashedPassword")
                .estado(EstadoUsuario.ACTIVO)
                .fechaRegistro(LocalDateTime.now())
                .build();

        unidadFamiliar = UnidadFamiliar.builder()
                .id(10L)
                .nombre("Familia Test")
                .codigoInvitacion("ABC123DEF456")
                .administrador(usuarioAdministrador)
                .estado(EstadoUnidadFamiliar.ACTIVO)
                .maxMiembros((short) 10)
                .fechaCreacion(LocalDateTime.now())
                .build();

        servicio = Servicio.builder()
                .id(100L)
                .nombre("Netflix")
                .categoria(CategoriaServicio.STREAMING)
                .maxUsuarios((short) 5)
                .activo(true)
                .build();

        suscripcion = Suscripcion.builder()
                .id(20L)
                .servicio(servicio)
                .unidad(unidadFamiliar)
                .anfitrion(usuarioAnfitrion)
                .precioTotal(new BigDecimal("17.99"))
                .precioPorPlaza(new BigDecimal("4.50"))
                .numPlazasTotal((short) 5)
                .estado(EstadoSuscripcion.ACTIVA)
                .fechaInicio(LocalDate.now())
                .fechaRenovacion(LocalDate.now().plusMonths(1))
                .periodicidad(Periodicidad.MENSUAL)
                .build();

        plazaDisponible = Plaza.builder()
                .id(30L)
                .suscripcion(suscripcion)
                .numeroPlaza((short) 2)
                .estado(EstadoPlaza.DISPONIBLE)
                .build();
    }

    // ======================== TESTS: SOLICITUD UNIÓN GRUPO ========================

    @Nested
    @DisplayName("crearSolicitudUnionGrupo()")
    class CrearSolicitudUnionGrupoTests {

        @Test
        @DisplayName("Debe crear solicitud exitosamente cuando todos los requisitos se cumplen")
        void debeCrearSolicitudExitosamente() {
            // Given
            String codigoInvitacion = "ABC123DEF456";
            String mensaje = "Quiero unirme a este grupo";

            given(usuarioRepository.findById(1L)).willReturn(Optional.of(usuarioSolicitante));
            given(unidadFamiliarRepository.findByCodigoInvitacion(codigoInvitacion))
                    .willReturn(Optional.of(unidadFamiliar));
            given(miembroUnidadRepository.existsByUsuarioIdAndUnidadIdAndEstado(1L, 10L, EstadoMiembro.ACTIVO))
                    .willReturn(false);
            given(solicitudRepository.existsBySolicitanteIdAndUnidadIdAndEstado(1L, 10L, EstadoSolicitud.PENDIENTE))
                    .willReturn(false);
            given(unidadFamiliarRepository.contarMiembrosActivos(10L)).willReturn(3L);
            given(solicitudRepository.save(any(Solicitud.class))).willAnswer(inv -> {
                Solicitud s = inv.getArgument(0);
                s.setId(100L);
                return s;
            });

            // When
            Solicitud resultado = solicitudService.crearSolicitudUnionGrupo(1L, codigoInvitacion, mensaje);

            // Then
            assertThat(resultado).isNotNull();
            assertThat(resultado.getTipoSolicitud()).isEqualTo(TipoSolicitud.UNION_GRUPO);
            assertThat(resultado.getEstado()).isEqualTo(EstadoSolicitud.PENDIENTE);
            assertThat(resultado.getSolicitante()).isEqualTo(usuarioSolicitante);
            assertThat(resultado.getUnidad()).isEqualTo(unidadFamiliar);
            assertThat(resultado.getMensaje()).isEqualTo(mensaje);

            // Verify interactions
            then(solicitudRepository).should().save(any(Solicitud.class));
        }

        @Test
        @DisplayName("Debe lanzar ResourceNotFoundException cuando usuario no existe")
        void debeLanzarExcepcionCuandoUsuarioNoExiste() {
            // Given
            given(usuarioRepository.findById(999L)).willReturn(Optional.empty());

            // When/Then
            assertThatThrownBy(() -> 
                    solicitudService.crearSolicitudUnionGrupo(999L, "ABC123DEF456", "mensaje"))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("Usuario");
        }

        @Test
        @DisplayName("Debe lanzar ResourceNotFoundException cuando código de invitación es inválido")
        void debeLanzarExcepcionCuandoCodigoInvalido() {
            // Given
            given(usuarioRepository.findById(1L)).willReturn(Optional.of(usuarioSolicitante));
            given(unidadFamiliarRepository.findByCodigoInvitacion("INVALIDO1234"))
                    .willReturn(Optional.empty());

            // When/Then
            assertThatThrownBy(() -> 
                    solicitudService.crearSolicitudUnionGrupo(1L, "INVALIDO1234", "mensaje"))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("Unidad familiar");
        }

        @Test
        @DisplayName("Debe lanzar BusinessException cuando el grupo no está activo")
        void debeLanzarExcepcionCuandoGrupoInactivo() {
            // Given
            unidadFamiliar.setEstado(EstadoUnidadFamiliar.INACTIVO);
            given(usuarioRepository.findById(1L)).willReturn(Optional.of(usuarioSolicitante));
            given(unidadFamiliarRepository.findByCodigoInvitacion("ABC123DEF456"))
                    .willReturn(Optional.of(unidadFamiliar));

            // When/Then
            assertThatThrownBy(() -> 
                    solicitudService.crearSolicitudUnionGrupo(1L, "ABC123DEF456", "mensaje"))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("no está activo");
        }

        @Test
        @DisplayName("Debe lanzar DuplicateResourceException cuando ya es miembro del grupo")
        void debeLanzarExcepcionCuandoYaEsMiembro() {
            // Given
            given(usuarioRepository.findById(1L)).willReturn(Optional.of(usuarioSolicitante));
            given(unidadFamiliarRepository.findByCodigoInvitacion("ABC123DEF456"))
                    .willReturn(Optional.of(unidadFamiliar));
            given(miembroUnidadRepository.existsByUsuarioIdAndUnidadIdAndEstado(1L, 10L, EstadoMiembro.ACTIVO))
                    .willReturn(true);

            // When/Then
            assertThatThrownBy(() -> 
                    solicitudService.crearSolicitudUnionGrupo(1L, "ABC123DEF456", "mensaje"))
                    .isInstanceOf(DuplicateResourceException.class)
                    .hasMessageContaining("Ya eres miembro");
        }

        @Test
        @DisplayName("Debe lanzar DuplicateResourceException cuando ya tiene solicitud pendiente")
        void debeLanzarExcepcionCuandoYaTieneSolicitudPendiente() {
            // Given
            given(usuarioRepository.findById(1L)).willReturn(Optional.of(usuarioSolicitante));
            given(unidadFamiliarRepository.findByCodigoInvitacion("ABC123DEF456"))
                    .willReturn(Optional.of(unidadFamiliar));
            given(miembroUnidadRepository.existsByUsuarioIdAndUnidadIdAndEstado(1L, 10L, EstadoMiembro.ACTIVO))
                    .willReturn(false);
            given(solicitudRepository.existsBySolicitanteIdAndUnidadIdAndEstado(1L, 10L, EstadoSolicitud.PENDIENTE))
                    .willReturn(true);

            // When/Then
            assertThatThrownBy(() -> 
                    solicitudService.crearSolicitudUnionGrupo(1L, "ABC123DEF456", "mensaje"))
                    .isInstanceOf(DuplicateResourceException.class)
                    .hasMessageContaining("solicitud pendiente");
        }

        @Test
        @DisplayName("Debe lanzar LimiteAlcanzadoException cuando grupo está lleno")
        void debeLanzarExcepcionCuandoGrupoLleno() {
            // Given
            given(usuarioRepository.findById(1L)).willReturn(Optional.of(usuarioSolicitante));
            given(unidadFamiliarRepository.findByCodigoInvitacion("ABC123DEF456"))
                    .willReturn(Optional.of(unidadFamiliar));
            given(miembroUnidadRepository.existsByUsuarioIdAndUnidadIdAndEstado(1L, 10L, EstadoMiembro.ACTIVO))
                    .willReturn(false);
            given(solicitudRepository.existsBySolicitanteIdAndUnidadIdAndEstado(1L, 10L, EstadoSolicitud.PENDIENTE))
                    .willReturn(false);
            given(unidadFamiliarRepository.contarMiembrosActivos(10L)).willReturn(10L); // Máximo alcanzado

            // When/Then
            assertThatThrownBy(() -> 
                    solicitudService.crearSolicitudUnionGrupo(1L, "ABC123DEF456", "mensaje"))
                    .isInstanceOf(LimiteAlcanzadoException.class);
        }

        @Test
        @DisplayName("Debe convertir código de invitación a mayúsculas")
        void debeConvertirCodigoAMayusculas() {
            // Given
            String codigoMinusculas = "abc123def456";
            given(usuarioRepository.findById(1L)).willReturn(Optional.of(usuarioSolicitante));
            given(unidadFamiliarRepository.findByCodigoInvitacion("ABC123DEF456"))
                    .willReturn(Optional.of(unidadFamiliar));
            given(miembroUnidadRepository.existsByUsuarioIdAndUnidadIdAndEstado(anyLong(), anyLong(), any()))
                    .willReturn(false);
            given(solicitudRepository.existsBySolicitanteIdAndUnidadIdAndEstado(anyLong(), anyLong(), any()))
                    .willReturn(false);
            given(unidadFamiliarRepository.contarMiembrosActivos(anyLong())).willReturn(1L);
            given(solicitudRepository.save(any(Solicitud.class))).willAnswer(inv -> inv.getArgument(0));

            // When
            solicitudService.crearSolicitudUnionGrupo(1L, codigoMinusculas, "mensaje");

            // Then - verify que se llamó con mayúsculas
            then(unidadFamiliarRepository).should().findByCodigoInvitacion("ABC123DEF456");
        }
    }

    // ======================== TESTS: SOLICITUD UNIÓN SUSCRIPCIÓN ========================

    @Nested
    @DisplayName("crearSolicitudUnionSuscripcion()")
    class CrearSolicitudUnionSuscripcionTests {

        @Test
        @DisplayName("Debe crear solicitud exitosamente cuando todos los requisitos se cumplen")
        void debeCrearSolicitudExitosamente() {
            // Given
            given(usuarioRepository.findById(1L)).willReturn(Optional.of(usuarioSolicitante));
            given(suscripcionRepository.findById(20L)).willReturn(Optional.of(suscripcion));
            given(miembroUnidadRepository.existsByUsuarioIdAndUnidadIdAndEstado(1L, 10L, EstadoMiembro.ACTIVO))
                    .willReturn(true);
            given(plazaRepository.existsBySuscripcionIdAndUsuarioId(20L, 1L)).willReturn(false);
            given(solicitudRepository.existsBySolicitanteIdAndSuscripcionIdAndEstado(1L, 20L, EstadoSolicitud.PENDIENTE))
                    .willReturn(false);
            given(plazaRepository.contarPlazasDisponibles(20L)).willReturn(3L);
            given(solicitudRepository.save(any(Solicitud.class))).willAnswer(inv -> {
                Solicitud s = inv.getArgument(0);
                s.setId(200L);
                return s;
            });

            // When
            Solicitud resultado = solicitudService.crearSolicitudUnionSuscripcion(1L, 20L, "Quiero Netflix");

            // Then
            assertThat(resultado).isNotNull();
            assertThat(resultado.getTipoSolicitud()).isEqualTo(TipoSolicitud.UNION_SUSCRIPCION);
            assertThat(resultado.getSuscripcion()).isEqualTo(suscripcion);
            assertThat(resultado.getEstado()).isEqualTo(EstadoSolicitud.PENDIENTE);
        }

        @Test
        @DisplayName("Debe lanzar BusinessException cuando la suscripción no está activa")
        void debeLanzarExcepcionCuandoSuscripcionInactiva() {
            // Given
            suscripcion.setEstado(EstadoSuscripcion.CANCELADA);
            given(usuarioRepository.findById(1L)).willReturn(Optional.of(usuarioSolicitante));
            given(suscripcionRepository.findById(20L)).willReturn(Optional.of(suscripcion));

            // When/Then
            assertThatThrownBy(() -> 
                    solicitudService.crearSolicitudUnionSuscripcion(1L, 20L, "mensaje"))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("no está activa");
        }

        @Test
        @DisplayName("Debe lanzar UnauthorizedException cuando no es miembro del grupo")
        void debeLanzarExcepcionCuandoNoEsMiembro() {
            // Given
            given(usuarioRepository.findById(1L)).willReturn(Optional.of(usuarioSolicitante));
            given(suscripcionRepository.findById(20L)).willReturn(Optional.of(suscripcion));
            given(miembroUnidadRepository.existsByUsuarioIdAndUnidadIdAndEstado(1L, 10L, EstadoMiembro.ACTIVO))
                    .willReturn(false);

            // When/Then
            assertThatThrownBy(() -> 
                    solicitudService.crearSolicitudUnionSuscripcion(1L, 20L, "mensaje"))
                    .isInstanceOf(UnauthorizedException.class)
                    .hasMessageContaining("miembro del grupo");
        }

        @Test
        @DisplayName("Debe lanzar DuplicateResourceException cuando ya tiene plaza en la suscripción")
        void debeLanzarExcepcionCuandoYaTienePlaza() {
            // Given
            given(usuarioRepository.findById(1L)).willReturn(Optional.of(usuarioSolicitante));
            given(suscripcionRepository.findById(20L)).willReturn(Optional.of(suscripcion));
            given(miembroUnidadRepository.existsByUsuarioIdAndUnidadIdAndEstado(1L, 10L, EstadoMiembro.ACTIVO))
                    .willReturn(true);
            given(plazaRepository.existsBySuscripcionIdAndUsuarioId(20L, 1L)).willReturn(true);

            // When/Then
            assertThatThrownBy(() -> 
                    solicitudService.crearSolicitudUnionSuscripcion(1L, 20L, "mensaje"))
                    .isInstanceOf(DuplicateResourceException.class)
                    .hasMessageContaining("Ya tienes una plaza");
        }

        @Test
        @DisplayName("Debe lanzar NoPlazasDisponiblesException cuando no hay plazas")
        void debeLanzarExcepcionCuandoNoHayPlazas() {
            // Given
            given(usuarioRepository.findById(1L)).willReturn(Optional.of(usuarioSolicitante));
            given(suscripcionRepository.findById(20L)).willReturn(Optional.of(suscripcion));
            given(miembroUnidadRepository.existsByUsuarioIdAndUnidadIdAndEstado(1L, 10L, EstadoMiembro.ACTIVO))
                    .willReturn(true);
            given(plazaRepository.existsBySuscripcionIdAndUsuarioId(20L, 1L)).willReturn(false);
            given(solicitudRepository.existsBySolicitanteIdAndSuscripcionIdAndEstado(1L, 20L, EstadoSolicitud.PENDIENTE))
                    .willReturn(false);
            given(plazaRepository.contarPlazasDisponibles(20L)).willReturn(0L);

            // When/Then
            assertThatThrownBy(() -> 
                    solicitudService.crearSolicitudUnionSuscripcion(1L, 20L, "mensaje"))
                    .isInstanceOf(NoPlazasDisponiblesException.class);
        }
    }

    // ======================== TESTS: APROBAR SOLICITUD ========================

    @Nested
    @DisplayName("aprobarSolicitud()")
    class AprobarSolicitudTests {

        private Solicitud solicitudGrupoPendiente;
        private Solicitud solicitudSuscripcionPendiente;

        @BeforeEach
        void setUpSolicitudes() {
            solicitudGrupoPendiente = Solicitud.builder()
                    .id(100L)
                    .tipoSolicitud(TipoSolicitud.UNION_GRUPO)
                    .solicitante(usuarioSolicitante)
                    .unidad(unidadFamiliar)
                    .estado(EstadoSolicitud.PENDIENTE)
                    .fechaSolicitud(LocalDateTime.now())
                    .build();

            solicitudSuscripcionPendiente = Solicitud.builder()
                    .id(101L)
                    .tipoSolicitud(TipoSolicitud.UNION_SUSCRIPCION)
                    .solicitante(usuarioSolicitante)
                    .suscripcion(suscripcion)
                    .estado(EstadoSolicitud.PENDIENTE)
                    .fechaSolicitud(LocalDateTime.now())
                    .build();
        }

        @Test
        @DisplayName("Debe aprobar solicitud de grupo exitosamente")
        void debeAprobarSolicitudGrupoExitosamente() {
            // Given
            given(solicitudRepository.findByIdCompleto(100L))
                    .willReturn(Optional.of(solicitudGrupoPendiente));
            given(usuarioRepository.findById(2L)).willReturn(Optional.of(usuarioAdministrador));
            given(unidadFamiliarRepository.contarMiembrosActivos(10L)).willReturn(3L);
            given(miembroUnidadRepository.save(any(MiembroUnidad.class))).willAnswer(inv -> inv.getArgument(0));
            given(solicitudRepository.save(any(Solicitud.class))).willAnswer(inv -> inv.getArgument(0));

            // When
            Solicitud resultado = solicitudService.aprobarSolicitud(100L, 2L);

            // Then
            assertThat(resultado.getEstado()).isEqualTo(EstadoSolicitud.APROBADA);
            assertThat(resultado.getFechaRespuesta()).isNotNull();
            assertThat(resultado.getAprobador()).isEqualTo(usuarioAdministrador);

            // Verify que se creó el miembro
            ArgumentCaptor<MiembroUnidad> miembroCaptor = ArgumentCaptor.forClass(MiembroUnidad.class);
            then(miembroUnidadRepository).should().save(miembroCaptor.capture());
            
            MiembroUnidad miembroCreado = miembroCaptor.getValue();
            assertThat(miembroCreado.getUsuario()).isEqualTo(usuarioSolicitante);
            assertThat(miembroCreado.getUnidad()).isEqualTo(unidadFamiliar);
            assertThat(miembroCreado.getRol()).isEqualTo(RolMiembro.MIEMBRO);
            assertThat(miembroCreado.getEstado()).isEqualTo(EstadoMiembro.ACTIVO);
        }

        @Test
        @DisplayName("Debe aprobar solicitud de suscripción y asignar plaza")
        void debeAprobarSolicitudSuscripcionYAsignarPlaza() {
            // Given
            given(solicitudRepository.findByIdCompleto(101L))
                    .willReturn(Optional.of(solicitudSuscripcionPendiente));
            given(usuarioRepository.findById(3L)).willReturn(Optional.of(usuarioAnfitrion));
            given(plazaRepository.findPlazasDisponiblesOrdenadas(20L))
                    .willReturn(List.of(plazaDisponible));
            given(plazaRepository.save(any(Plaza.class))).willAnswer(inv -> inv.getArgument(0));
            given(solicitudRepository.save(any(Solicitud.class))).willAnswer(inv -> inv.getArgument(0));

            // When
            Solicitud resultado = solicitudService.aprobarSolicitud(101L, 3L);

            // Then
            assertThat(resultado.getEstado()).isEqualTo(EstadoSolicitud.APROBADA);

            // Verify que se asignó la plaza
            ArgumentCaptor<Plaza> plazaCaptor = ArgumentCaptor.forClass(Plaza.class);
            then(plazaRepository).should().save(plazaCaptor.capture());
            
            Plaza plazaActualizada = plazaCaptor.getValue();
            assertThat(plazaActualizada.getUsuario()).isEqualTo(usuarioSolicitante);
            assertThat(plazaActualizada.getEstado()).isEqualTo(EstadoPlaza.OCUPADA);
            assertThat(plazaActualizada.getFechaOcupacion()).isNotNull();
        }

        @Test
        @DisplayName("Debe lanzar UnauthorizedException cuando no es administrador del grupo")
        void debeLanzarExcepcionCuandoNoEsAdministrador() {
            // Given
            given(solicitudRepository.findByIdCompleto(100L))
                    .willReturn(Optional.of(solicitudGrupoPendiente));

            // When/Then - Usuario 999 intenta aprobar pero no es el administrador (ID 2)
            assertThatThrownBy(() -> solicitudService.aprobarSolicitud(100L, 999L))
                    .isInstanceOf(UnauthorizedException.class)
                    .hasMessageContaining("administrador");
        }

        @Test
        @DisplayName("Debe lanzar UnauthorizedException cuando no es anfitrión de la suscripción")
        void debeLanzarExcepcionCuandoNoEsAnfitrion() {
            // Given
            given(solicitudRepository.findByIdCompleto(101L))
                    .willReturn(Optional.of(solicitudSuscripcionPendiente));

            // When/Then - Usuario 999 intenta aprobar pero no es el anfitrión (ID 3)
            assertThatThrownBy(() -> solicitudService.aprobarSolicitud(101L, 999L))
                    .isInstanceOf(UnauthorizedException.class)
                    .hasMessageContaining("anfitrión");
        }

        @Test
        @DisplayName("Debe lanzar BusinessException cuando solicitud no está pendiente")
        void debeLanzarExcepcionCuandoSolicitudNoEstaPendiente() {
            // Given
            solicitudGrupoPendiente.setEstado(EstadoSolicitud.APROBADA);
            given(solicitudRepository.findByIdCompleto(100L))
                    .willReturn(Optional.of(solicitudGrupoPendiente));

            // When/Then
            assertThatThrownBy(() -> solicitudService.aprobarSolicitud(100L, 2L))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("pendientes");
        }

        @Test
        @DisplayName("Debe lanzar LimiteAlcanzadoException si grupo se llenó durante la aprobación")
        void debeLanzarExcepcionSiGrupoSeLenoEnAprobacion() {
            // Given
            given(solicitudRepository.findByIdCompleto(100L))
                    .willReturn(Optional.of(solicitudGrupoPendiente));
            given(usuarioRepository.findById(2L)).willReturn(Optional.of(usuarioAdministrador));
            given(unidadFamiliarRepository.contarMiembrosActivos(10L)).willReturn(10L); // Lleno

            // When/Then
            assertThatThrownBy(() -> solicitudService.aprobarSolicitud(100L, 2L))
                    .isInstanceOf(LimiteAlcanzadoException.class);
        }

        @Test
        @DisplayName("Debe lanzar NoPlazasDisponiblesException si no hay plazas al aprobar")
        void debeLanzarExcepcionSiNoHayPlazasAlAprobar() {
            // Given
            given(solicitudRepository.findByIdCompleto(101L))
                    .willReturn(Optional.of(solicitudSuscripcionPendiente));
            given(usuarioRepository.findById(3L)).willReturn(Optional.of(usuarioAnfitrion));
            given(plazaRepository.findPlazasDisponiblesOrdenadas(20L)).willReturn(List.of());

            // When/Then
            assertThatThrownBy(() -> solicitudService.aprobarSolicitud(101L, 3L))
                    .isInstanceOf(NoPlazasDisponiblesException.class);
        }
    }

    // ======================== TESTS: RECHAZAR Y CANCELAR ========================

    @Nested
    @DisplayName("rechazarSolicitud() y cancelarSolicitud()")
    class RechazarYCancelarTests {

        private Solicitud solicitudPendiente;

        @BeforeEach
        void setUp() {
            solicitudPendiente = Solicitud.builder()
                    .id(100L)
                    .tipoSolicitud(TipoSolicitud.UNION_GRUPO)
                    .solicitante(usuarioSolicitante)
                    .unidad(unidadFamiliar)
                    .estado(EstadoSolicitud.PENDIENTE)
                    .fechaSolicitud(LocalDateTime.now())
                    .build();
        }

        @Test
        @DisplayName("Debe rechazar solicitud exitosamente con motivo")
        void debeRechazarSolicitudExitosamente() {
            // Given
            given(solicitudRepository.findByIdCompleto(100L)).willReturn(Optional.of(solicitudPendiente));
            given(usuarioRepository.findById(2L)).willReturn(Optional.of(usuarioAdministrador));
            given(solicitudRepository.save(any(Solicitud.class))).willAnswer(inv -> inv.getArgument(0));

            // When
            Solicitud resultado = solicitudService.rechazarSolicitud(100L, 2L, "No cumple requisitos");

            // Then
            assertThat(resultado.getEstado()).isEqualTo(EstadoSolicitud.RECHAZADA);
            assertThat(resultado.getMotivoRechazo()).isEqualTo("No cumple requisitos");
            assertThat(resultado.getFechaRespuesta()).isNotNull();
        }

        @Test
        @DisplayName("Debe cancelar solicitud propia exitosamente")
        void debeCancelarSolicitudPropiaExitosamente() {
            // Given
            given(solicitudRepository.findById(100L)).willReturn(Optional.of(solicitudPendiente));
            given(solicitudRepository.save(any(Solicitud.class))).willAnswer(inv -> inv.getArgument(0));

            // When
            Solicitud resultado = solicitudService.cancelarSolicitud(100L, 1L); // Usuario 1 es el solicitante

            // Then
            assertThat(resultado.getEstado()).isEqualTo(EstadoSolicitud.CANCELADA);
            assertThat(resultado.getFechaRespuesta()).isNotNull();
        }

        @Test
        @DisplayName("Debe lanzar UnauthorizedException al cancelar solicitud ajena")
        void debeLanzarExcepcionAlCancelarSolicitudAjena() {
            // Given
            given(solicitudRepository.findById(100L)).willReturn(Optional.of(solicitudPendiente));

            // When/Then - Usuario 999 intenta cancelar solicitud de usuario 1
            assertThatThrownBy(() -> solicitudService.cancelarSolicitud(100L, 999L))
                    .isInstanceOf(UnauthorizedException.class)
                    .hasMessageContaining("propias solicitudes");
        }
    }

    // ======================== TESTS: CONSULTAS ========================

    @Nested
    @DisplayName("Métodos de consulta")
    class MetodosConsultaTests {

        @Test
        @DisplayName("Debe verificar si tiene solicitud pendiente en grupo")
        void debeVerificarSolicitudPendienteGrupo() {
            // Given
            given(solicitudRepository.existsBySolicitanteIdAndUnidadIdAndEstado(1L, 10L, EstadoSolicitud.PENDIENTE))
                    .willReturn(true);

            // When
            boolean resultado = solicitudService.tieneSolicitudPendienteGrupo(1L, 10L);

            // Then
            assertThat(resultado).isTrue();
        }

        @Test
        @DisplayName("Debe verificar si tiene solicitud pendiente en suscripción")
        void debeVerificarSolicitudPendienteSuscripcion() {
            // Given
            given(solicitudRepository.existsBySolicitanteIdAndSuscripcionIdAndEstado(1L, 20L, EstadoSolicitud.PENDIENTE))
                    .willReturn(false);

            // When
            boolean resultado = solicitudService.tieneSolicitudPendienteSuscripcion(1L, 20L);

            // Then
            assertThat(resultado).isFalse();
        }
    }
}
