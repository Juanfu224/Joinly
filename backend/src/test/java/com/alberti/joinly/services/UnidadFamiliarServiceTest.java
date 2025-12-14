package com.alberti.joinly.services;

import com.alberti.joinly.dto.UnidadFamiliarResponse;
import com.alberti.joinly.entities.enums.*;
import com.alberti.joinly.entities.grupo.MiembroUnidad;
import com.alberti.joinly.entities.grupo.UnidadFamiliar;
import com.alberti.joinly.entities.usuario.Usuario;
import com.alberti.joinly.exceptions.*;
import com.alberti.joinly.repositories.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.*;

/**
 * Tests unitarios para UnidadFamiliarService.
 * Valida la lógica de negocio de creación y gestión de grupos familiares.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("UnidadFamiliarService Unit Tests")
class UnidadFamiliarServiceTest {

    @Mock
    private UnidadFamiliarRepository unidadFamiliarRepository;

    @Mock
    private MiembroUnidadRepository miembroUnidadRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private SuscripcionRepository suscripcionRepository;

    @InjectMocks
    private UnidadFamiliarService unidadFamiliarService;

    // Test fixtures
    private Usuario administrador;
    private Usuario nuevoMiembro;
    private UnidadFamiliar unidadFamiliar;

    @BeforeEach
    void setUp() {
        administrador = Usuario.builder()
                .id(1L)
                .nombre("Admin")
                .email("admin@test.com")
                .password("hash")
                .estado(EstadoUsuario.ACTIVO)
                .fechaRegistro(LocalDateTime.now())
                .build();

        nuevoMiembro = Usuario.builder()
                .id(2L)
                .nombre("Nuevo Miembro")
                .email("nuevo@test.com")
                .password("hash")
                .estado(EstadoUsuario.ACTIVO)
                .fechaRegistro(LocalDateTime.now())
                .build();

        unidadFamiliar = UnidadFamiliar.builder()
                .id(10L)
                .nombre("Familia Test")
                .codigoInvitacion("TEST12345678")
                .administrador(administrador)
                .estado(EstadoUnidadFamiliar.ACTIVO)
                .maxMiembros((short) 10)
                .fechaCreacion(LocalDateTime.now())
                .build();
    }

    // ======================== TESTS: CREAR UNIDAD FAMILIAR ========================

    @Nested
    @DisplayName("crearUnidadFamiliar()")
    class CrearUnidadFamiliarTests {

        @Test
        @DisplayName("Debe crear unidad familiar exitosamente")
        void debeCrearUnidadFamiliarExitosamente() {
            // Given
            given(usuarioRepository.findById(1L)).willReturn(Optional.of(administrador));
            given(unidadFamiliarRepository.contarGruposActivosPorUsuario(1L)).willReturn(0L);
            given(unidadFamiliarRepository.save(any(UnidadFamiliar.class))).willAnswer(inv -> {
                UnidadFamiliar uf = inv.getArgument(0);
                uf.setId(10L);
                return uf;
            });
            given(miembroUnidadRepository.save(any(MiembroUnidad.class))).willAnswer(inv -> inv.getArgument(0));

            // When
            UnidadFamiliar resultado = unidadFamiliarService.crearUnidadFamiliar(
                    1L, "Mi Familia", (short) 8);

            // Then
            assertThat(resultado).isNotNull();
            assertThat(resultado.getNombre()).isEqualTo("Mi Familia");
            assertThat(resultado.getAdministrador()).isEqualTo(administrador);
            assertThat(resultado.getEstado()).isEqualTo(EstadoUnidadFamiliar.ACTIVO);
            assertThat(resultado.getMaxMiembros()).isEqualTo((short) 8);
            assertThat(resultado.getCodigoInvitacion()).isNotNull().hasSize(12);

            // Verify que el administrador se agregó como miembro
            ArgumentCaptor<MiembroUnidad> miembroCaptor = ArgumentCaptor.forClass(MiembroUnidad.class);
            then(miembroUnidadRepository).should().save(miembroCaptor.capture());

            MiembroUnidad miembro = miembroCaptor.getValue();
            assertThat(miembro.getUsuario()).isEqualTo(administrador);
            assertThat(miembro.getRol()).isEqualTo(RolMiembro.ADMIN);
            assertThat(miembro.getEstado()).isEqualTo(EstadoMiembro.ACTIVO);
        }

        @Test
        @DisplayName("Debe generar código de invitación único")
        void debeGenerarCodigoInvitacionUnico() {
            // Given
            given(usuarioRepository.findById(1L)).willReturn(Optional.of(administrador));
            given(unidadFamiliarRepository.contarGruposActivosPorUsuario(1L)).willReturn(0L);
            
            // Primera vez: código existe, segunda vez: no existe
            given(unidadFamiliarRepository.existsByCodigoInvitacion(anyString()))
                    .willReturn(true)
                    .willReturn(false);
            
            given(unidadFamiliarRepository.save(any(UnidadFamiliar.class))).willAnswer(inv -> {
                UnidadFamiliar uf = inv.getArgument(0);
                uf.setId(10L);
                return uf;
            });
            given(miembroUnidadRepository.save(any(MiembroUnidad.class))).willAnswer(inv -> inv.getArgument(0));

            // When
            UnidadFamiliar resultado = unidadFamiliarService.crearUnidadFamiliar(1L, "Mi Familia", (short) 8);

            // Then
            assertThat(resultado.getCodigoInvitacion()).hasSize(12);
            then(unidadFamiliarRepository).should(times(2)).existsByCodigoInvitacion(anyString());
        }

        @Test
        @DisplayName("Debe lanzar excepción cuando usuario no existe")
        void debeLanzarExcepcionCuandoUsuarioNoExiste() {
            // Given
            given(usuarioRepository.findById(99L)).willReturn(Optional.empty());

            // When/Then
            assertThatThrownBy(() -> unidadFamiliarService.crearUnidadFamiliar(99L, "Mi Familia", (short) 8))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("Usuario");
        }

        @Test
        @DisplayName("Debe lanzar excepción cuando usuario tiene máximo de grupos")
        void debeLanzarExcepcionCuandoLimiteGruposAlcanzado() {
            // Given
            given(usuarioRepository.findById(1L)).willReturn(Optional.of(administrador));
            given(unidadFamiliarRepository.contarGruposActivosPorUsuario(1L)).willReturn(5L); // Máximo típico

            // When/Then
            assertThatThrownBy(() -> unidadFamiliarService.crearUnidadFamiliar(1L, "Mi Familia", (short) 8))
                    .isInstanceOf(LimiteAlcanzadoException.class)
                    .hasMessageContaining("máximo");
        }

        @ParameterizedTest
        @ValueSource(strings = {"", "  ", "Ab"})
        @DisplayName("Debe lanzar excepción con nombre inválido")
        void debeLanzarExcepcionConNombreInvalido(String nombreInvalido) {
            // Given
            given(usuarioRepository.findById(1L)).willReturn(Optional.of(administrador));
            given(unidadFamiliarRepository.contarGruposActivosPorUsuario(1L)).willReturn(0L);

            // When/Then
            assertThatThrownBy(() -> unidadFamiliarService.crearUnidadFamiliar(1L, nombreInvalido, (short) 8))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("nombre");
        }

        @ParameterizedTest
        @ValueSource(shorts = {0, 1, 51})
        @DisplayName("Debe lanzar excepción con número de miembros inválido")
        void debeLanzarExcepcionConMaxMiembrosInvalido(short maxMiembros) {
            // Given
            given(usuarioRepository.findById(1L)).willReturn(Optional.of(administrador));
            given(unidadFamiliarRepository.contarGruposActivosPorUsuario(1L)).willReturn(0L);

            // When/Then
            assertThatThrownBy(() -> unidadFamiliarService.crearUnidadFamiliar(1L, "Mi Familia", maxMiembros))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("miembros");
        }
    }

    // ======================== TESTS: AGREGAR MIEMBRO ========================

    @Nested
    @DisplayName("agregarMiembro()")
    class AgregarMiembroTests {

        @Test
        @DisplayName("Administrador puede agregar miembro exitosamente")
        void adminPuedeAgregarMiembro() {
            // Given
            given(unidadFamiliarRepository.findById(10L)).willReturn(Optional.of(unidadFamiliar));
            given(usuarioRepository.findById(2L)).willReturn(Optional.of(nuevoMiembro));
            given(miembroUnidadRepository.existsByUsuarioIdAndUnidadIdAndEstado(2L, 10L, EstadoMiembro.ACTIVO))
                    .willReturn(false);
            given(miembroUnidadRepository.countByUnidadIdAndEstado(10L, EstadoMiembro.ACTIVO))
                    .willReturn(5L); // < maxMiembros
            given(miembroUnidadRepository.save(any(MiembroUnidad.class))).willAnswer(inv -> {
                MiembroUnidad mu = inv.getArgument(0);
                mu.setId(100L);
                return mu;
            });

            // When
            MiembroUnidad resultado = unidadFamiliarService.agregarMiembro(10L, 2L, 1L, RolMiembro.MIEMBRO);

            // Then
            assertThat(resultado.getUsuario()).isEqualTo(nuevoMiembro);
            assertThat(resultado.getUnidad()).isEqualTo(unidadFamiliar);
            assertThat(resultado.getRol()).isEqualTo(RolMiembro.MIEMBRO);
            assertThat(resultado.getEstado()).isEqualTo(EstadoMiembro.ACTIVO);
        }

        @Test
        @DisplayName("Debe lanzar excepción cuando quien agrega no es admin")
        void debeLanzarExcepcionCuandoNoEsAdmin() {
            // Given
            given(unidadFamiliarRepository.findById(10L)).willReturn(Optional.of(unidadFamiliar));
            given(usuarioRepository.findById(2L)).willReturn(Optional.of(nuevoMiembro));

            // When/Then - Usuario 99 intenta agregar pero no es admin
            assertThatThrownBy(() -> unidadFamiliarService.agregarMiembro(10L, 2L, 99L, RolMiembro.MIEMBRO))
                    .isInstanceOf(UnauthorizedException.class)
                    .hasMessageContaining("administrador");
        }

        @Test
        @DisplayName("Debe lanzar excepción cuando usuario ya es miembro")
        void debeLanzarExcepcionCuandoYaEsMiembro() {
            // Given
            given(unidadFamiliarRepository.findById(10L)).willReturn(Optional.of(unidadFamiliar));
            given(usuarioRepository.findById(2L)).willReturn(Optional.of(nuevoMiembro));
            given(miembroUnidadRepository.existsByUsuarioIdAndUnidadIdAndEstado(2L, 10L, EstadoMiembro.ACTIVO))
                    .willReturn(true);

            // When/Then
            assertThatThrownBy(() -> unidadFamiliarService.agregarMiembro(10L, 2L, 1L, RolMiembro.MIEMBRO))
                    .isInstanceOf(DuplicateResourceException.class)
                    .hasMessageContaining("ya es miembro");
        }

        @Test
        @DisplayName("Debe lanzar excepción cuando grupo está lleno")
        void debeLanzarExcepcionCuandoGrupoLleno() {
            // Given
            given(unidadFamiliarRepository.findById(10L)).willReturn(Optional.of(unidadFamiliar));
            given(usuarioRepository.findById(2L)).willReturn(Optional.of(nuevoMiembro));
            given(miembroUnidadRepository.existsByUsuarioIdAndUnidadIdAndEstado(2L, 10L, EstadoMiembro.ACTIVO))
                    .willReturn(false);
            given(miembroUnidadRepository.countByUnidadIdAndEstado(10L, EstadoMiembro.ACTIVO))
                    .willReturn(10L); // = maxMiembros

            // When/Then
            assertThatThrownBy(() -> unidadFamiliarService.agregarMiembro(10L, 2L, 1L, RolMiembro.MIEMBRO))
                    .isInstanceOf(LimiteAlcanzadoException.class)
                    .hasMessageContaining("máximo");
        }

        @Test
        @DisplayName("Debe lanzar excepción cuando grupo está inactivo")
        void debeLanzarExcepcionCuandoGrupoInactivo() {
            // Given
            unidadFamiliar.setEstado(EstadoUnidadFamiliar.DISUELTO);
            given(unidadFamiliarRepository.findById(10L)).willReturn(Optional.of(unidadFamiliar));

            // When/Then
            assertThatThrownBy(() -> unidadFamiliarService.agregarMiembro(10L, 2L, 1L, RolMiembro.MIEMBRO))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("no está activo");
        }
    }

    // ======================== TESTS: UNIRSE CON CÓDIGO ========================

    @Nested
    @DisplayName("unirseConCodigo()")
    class UnirseConCodigoTests {

        @Test
        @DisplayName("Usuario puede unirse con código válido")
        void usuarioPuedeUnirseConCodigoValido() {
            // Given
            given(unidadFamiliarRepository.findByCodigoInvitacion("TEST12345678"))
                    .willReturn(Optional.of(unidadFamiliar));
            given(usuarioRepository.findById(2L)).willReturn(Optional.of(nuevoMiembro));
            given(miembroUnidadRepository.existsByUsuarioIdAndUnidadIdAndEstado(2L, 10L, EstadoMiembro.ACTIVO))
                    .willReturn(false);
            given(miembroUnidadRepository.countByUnidadIdAndEstado(10L, EstadoMiembro.ACTIVO))
                    .willReturn(5L);
            given(miembroUnidadRepository.save(any(MiembroUnidad.class))).willAnswer(inv -> {
                MiembroUnidad mu = inv.getArgument(0);
                mu.setId(100L);
                return mu;
            });

            // When
            MiembroUnidad resultado = unidadFamiliarService.unirseConCodigo("TEST12345678", 2L);

            // Then
            assertThat(resultado.getUsuario()).isEqualTo(nuevoMiembro);
            assertThat(resultado.getRol()).isEqualTo(RolMiembro.MIEMBRO);
        }

        @Test
        @DisplayName("Debe lanzar excepción con código inválido")
        void debeLanzarExcepcionConCodigoInvalido() {
            // Given
            given(unidadFamiliarRepository.findByCodigoInvitacion("INVALID12345"))
                    .willReturn(Optional.empty());

            // When/Then
            assertThatThrownBy(() -> unidadFamiliarService.unirseConCodigo("INVALID12345", 2L))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("código");
        }

        @Test
        @DisplayName("Administrador no puede unirse a su propio grupo")
        void adminNoPuedeUnirseASuGrupo() {
            // Given
            given(unidadFamiliarRepository.findByCodigoInvitacion("TEST12345678"))
                    .willReturn(Optional.of(unidadFamiliar));
            given(usuarioRepository.findById(1L)).willReturn(Optional.of(administrador));
            given(miembroUnidadRepository.existsByUsuarioIdAndUnidadIdAndEstado(1L, 10L, EstadoMiembro.ACTIVO))
                    .willReturn(true);

            // When/Then
            assertThatThrownBy(() -> unidadFamiliarService.unirseConCodigo("TEST12345678", 1L))
                    .isInstanceOf(DuplicateResourceException.class)
                    .hasMessageContaining("ya es miembro");
        }
    }

    // ======================== TESTS: ELIMINAR MIEMBRO ========================

    @Nested
    @DisplayName("eliminarMiembro()")
    class EliminarMiembroTests {

        private MiembroUnidad miembroExistente;

        @BeforeEach
        void setUp() {
            miembroExistente = MiembroUnidad.builder()
                    .id(100L)
                    .unidad(unidadFamiliar)
                    .usuario(nuevoMiembro)
                    .rol(RolMiembro.MIEMBRO)
                    .estado(EstadoMiembro.ACTIVO)
                    .build();
        }

        @Test
        @DisplayName("Administrador puede eliminar miembro")
        void adminPuedeEliminarMiembro() {
            // Given
            given(miembroUnidadRepository.findByUsuarioIdAndUnidadIdAndEstado(2L, 10L, EstadoMiembro.ACTIVO))
                    .willReturn(Optional.of(miembroExistente));
            given(unidadFamiliarRepository.findById(10L)).willReturn(Optional.of(unidadFamiliar));
            given(miembroUnidadRepository.save(any(MiembroUnidad.class))).willAnswer(inv -> inv.getArgument(0));

            // When
            unidadFamiliarService.eliminarMiembro(10L, 2L, 1L);

            // Then
            assertThat(miembroExistente.getEstado()).isEqualTo(EstadoMiembro.ELIMINADO);
            assertThat(miembroExistente.getFechaBaja()).isNotNull();
        }

        @Test
        @DisplayName("Miembro puede abandonar grupo")
        void miembroPuedeAbandonarGrupo() {
            // Given
            given(miembroUnidadRepository.findByUsuarioIdAndUnidadIdAndEstado(2L, 10L, EstadoMiembro.ACTIVO))
                    .willReturn(Optional.of(miembroExistente));
            given(unidadFamiliarRepository.findById(10L)).willReturn(Optional.of(unidadFamiliar));
            given(miembroUnidadRepository.save(any(MiembroUnidad.class))).willAnswer(inv -> inv.getArgument(0));

            // When - miembro se elimina a sí mismo
            unidadFamiliarService.eliminarMiembro(10L, 2L, 2L);

            // Then
            assertThat(miembroExistente.getEstado()).isEqualTo(EstadoMiembro.ELIMINADO);
        }

        @Test
        @DisplayName("Administrador no puede eliminarse a sí mismo")
        void adminNoPuedeEliminarseASiMismo() {
            // Given
            MiembroUnidad miembroAdmin = MiembroUnidad.builder()
                    .id(99L)
                    .unidad(unidadFamiliar)
                    .usuario(administrador)
                    .rol(RolMiembro.ADMIN)
                    .estado(EstadoMiembro.ACTIVO)
                    .build();
            given(miembroUnidadRepository.findByUsuarioIdAndUnidadIdAndEstado(1L, 10L, EstadoMiembro.ACTIVO))
                    .willReturn(Optional.of(miembroAdmin));
            given(unidadFamiliarRepository.findById(10L)).willReturn(Optional.of(unidadFamiliar));

            // When/Then
            assertThatThrownBy(() -> unidadFamiliarService.eliminarMiembro(10L, 1L, 1L))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("administrador");
        }

        @Test
        @DisplayName("Usuario sin permiso no puede eliminar miembro")
        void usuarioSinPermisoNoPuedeEliminarMiembro() {
            // Given
            given(miembroUnidadRepository.findByUsuarioIdAndUnidadIdAndEstado(2L, 10L, EstadoMiembro.ACTIVO))
                    .willReturn(Optional.of(miembroExistente));
            given(unidadFamiliarRepository.findById(10L)).willReturn(Optional.of(unidadFamiliar));

            // When/Then - Usuario 99 intenta eliminar a usuario 2
            assertThatThrownBy(() -> unidadFamiliarService.eliminarMiembro(10L, 2L, 99L))
                    .isInstanceOf(UnauthorizedException.class)
                    .hasMessageContaining("permiso");
        }
    }

    // ======================== TESTS: TRANSFERIR ADMINISTRACIÓN ========================

    @Nested
    @DisplayName("transferirAdministracion()")
    class TransferirAdministracionTests {

        private MiembroUnidad miembroNuevoAdmin;

        @BeforeEach
        void setUp() {
            miembroNuevoAdmin = MiembroUnidad.builder()
                    .id(100L)
                    .unidad(unidadFamiliar)
                    .usuario(nuevoMiembro)
                    .rol(RolMiembro.MIEMBRO)
                    .estado(EstadoMiembro.ACTIVO)
                    .build();
        }

        @Test
        @DisplayName("Administrador puede transferir administración")
        void adminPuedeTransferirAdministracion() {
            // Given
            MiembroUnidad miembroAdminActual = MiembroUnidad.builder()
                    .id(99L)
                    .unidad(unidadFamiliar)
                    .usuario(administrador)
                    .rol(RolMiembro.ADMIN)
                    .estado(EstadoMiembro.ACTIVO)
                    .build();

            given(unidadFamiliarRepository.findById(10L)).willReturn(Optional.of(unidadFamiliar));
            given(usuarioRepository.findById(2L)).willReturn(Optional.of(nuevoMiembro));
            given(miembroUnidadRepository.findByUsuarioIdAndUnidadIdAndEstado(2L, 10L, EstadoMiembro.ACTIVO))
                    .willReturn(Optional.of(miembroNuevoAdmin));
            given(miembroUnidadRepository.findByUsuarioIdAndUnidadIdAndEstado(1L, 10L, EstadoMiembro.ACTIVO))
                    .willReturn(Optional.of(miembroAdminActual));
            given(unidadFamiliarRepository.save(any(UnidadFamiliar.class))).willAnswer(inv -> inv.getArgument(0));
            given(miembroUnidadRepository.save(any(MiembroUnidad.class))).willAnswer(inv -> inv.getArgument(0));

            // When
            unidadFamiliarService.transferirAdministracion(10L, 2L, 1L);

            // Then
            assertThat(unidadFamiliar.getAdministrador()).isEqualTo(nuevoMiembro);
            assertThat(miembroNuevoAdmin.getRol()).isEqualTo(RolMiembro.ADMIN);
            assertThat(miembroAdminActual.getRol()).isEqualTo(RolMiembro.MIEMBRO);
        }

        @Test
        @DisplayName("No administrador no puede transferir administración")
        void noAdminNoPuedeTransferirAdministracion() {
            // Given
            given(unidadFamiliarRepository.findById(10L)).willReturn(Optional.of(unidadFamiliar));

            // When/Then - Usuario 99 no es admin
            assertThatThrownBy(() -> unidadFamiliarService.transferirAdministracion(10L, 2L, 99L))
                    .isInstanceOf(UnauthorizedException.class)
                    .hasMessageContaining("administrador");
        }
    }

    // ======================== TESTS: DISOLVER GRUPO ========================

    @Nested
    @DisplayName("disolverGrupo()")
    class DisolverGrupoTests {

        @Test
        @DisplayName("Administrador puede disolver grupo sin suscripciones activas")
        void adminPuedeDisolverGrupoSinSuscripciones() {
            // Given
            given(unidadFamiliarRepository.findById(10L)).willReturn(Optional.of(unidadFamiliar));
            given(suscripcionRepository.contarSuscripcionesActivasEnUnidad(10L)).willReturn(0L);
            given(miembroUnidadRepository.findByUnidadIdAndEstado(10L, EstadoMiembro.ACTIVO))
                    .willReturn(List.of());
            given(unidadFamiliarRepository.save(any(UnidadFamiliar.class))).willAnswer(inv -> inv.getArgument(0));

            // When
            unidadFamiliarService.disolverGrupo(10L, 1L);

            // Then
            assertThat(unidadFamiliar.getEstado()).isEqualTo(EstadoUnidadFamiliar.DISUELTO);
        }

        @Test
        @DisplayName("No puede disolver grupo con suscripciones activas")
        void noPuedeDisolverGrupoConSuscripciones() {
            // Given
            given(unidadFamiliarRepository.findById(10L)).willReturn(Optional.of(unidadFamiliar));
            given(suscripcionRepository.contarSuscripcionesActivasEnUnidad(10L)).willReturn(2L);

            // When/Then
            assertThatThrownBy(() -> unidadFamiliarService.disolverGrupo(10L, 1L))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("suscripciones activas");
        }

        @Test
        @DisplayName("No administrador no puede disolver grupo")
        void noAdminNoPuedeDisolverGrupo() {
            // Given
            given(unidadFamiliarRepository.findById(10L)).willReturn(Optional.of(unidadFamiliar));

            // When/Then
            assertThatThrownBy(() -> unidadFamiliarService.disolverGrupo(10L, 99L))
                    .isInstanceOf(UnauthorizedException.class)
                    .hasMessageContaining("administrador");
        }
    }

    // ======================== TESTS: CONSULTAS ========================

    @Nested
    @DisplayName("Consultas")
    class ConsultasTests {

        @Test
        @DisplayName("Debe obtener grupos donde usuario es miembro activo")
        void debeObtenerGruposDeUsuario() {
            // Given
            given(unidadFamiliarRepository.findByUsuarioMiembroActivo(2L))
                    .willReturn(List.of(unidadFamiliar));

            // When
            List<UnidadFamiliarResponse> resultado = unidadFamiliarService.obtenerGruposDeUsuario(2L);

            // Then
            assertThat(resultado).hasSize(1);
            assertThat(resultado.getFirst().nombre()).isEqualTo("Familia Test");
        }

        @Test
        @DisplayName("Debe obtener miembros activos de un grupo")
        void debeObtenerMiembrosDeGrupo() {
            // Given
            MiembroUnidad miembro1 = MiembroUnidad.builder()
                    .id(100L)
                    .unidad(unidadFamiliar)
                    .usuario(administrador)
                    .rol(RolMiembro.ADMIN)
                    .estado(EstadoMiembro.ACTIVO)
                    .build();
            MiembroUnidad miembro2 = MiembroUnidad.builder()
                    .id(101L)
                    .unidad(unidadFamiliar)
                    .usuario(nuevoMiembro)
                    .rol(RolMiembro.MIEMBRO)
                    .estado(EstadoMiembro.ACTIVO)
                    .build();

            given(unidadFamiliarRepository.findById(10L)).willReturn(Optional.of(unidadFamiliar));
            given(miembroUnidadRepository.findByUnidadIdAndEstado(10L, EstadoMiembro.ACTIVO))
                    .willReturn(List.of(miembro1, miembro2));

            // When
            var resultado = unidadFamiliarService.obtenerMiembros(10L);

            // Then
            assertThat(resultado).hasSize(2);
        }

        @Test
        @DisplayName("Debe regenerar código de invitación")
        void debeRegenerarCodigoInvitacion() {
            // Given
            String codigoAnterior = unidadFamiliar.getCodigoInvitacion();
            given(unidadFamiliarRepository.findById(10L)).willReturn(Optional.of(unidadFamiliar));
            given(unidadFamiliarRepository.existsByCodigoInvitacion(anyString())).willReturn(false);
            given(unidadFamiliarRepository.save(any(UnidadFamiliar.class))).willAnswer(inv -> inv.getArgument(0));

            // When
            String nuevoCodigo = unidadFamiliarService.regenerarCodigoInvitacion(10L, 1L);

            // Then
            assertThat(nuevoCodigo).isNotEqualTo(codigoAnterior);
            assertThat(nuevoCodigo).hasSize(12);
        }

        @Test
        @DisplayName("Solo admin puede regenerar código de invitación")
        void soloAdminPuedeRegenerarCodigo() {
            // Given
            given(unidadFamiliarRepository.findById(10L)).willReturn(Optional.of(unidadFamiliar));

            // When/Then
            assertThatThrownBy(() -> unidadFamiliarService.regenerarCodigoInvitacion(10L, 99L))
                    .isInstanceOf(UnauthorizedException.class);
        }
    }
}
