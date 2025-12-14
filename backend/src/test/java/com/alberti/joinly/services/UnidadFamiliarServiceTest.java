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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("UnidadFamiliarService Tests")
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
    private UnidadFamiliarService service;

    private Usuario usuarioAdmin;
    private Usuario usuarioMiembro;
    private UnidadFamiliar unidadFamiliar;
    private MiembroUnidad miembroUnidad;

    @BeforeEach
    void setUp() {
        usuarioAdmin = Usuario.builder()
                .id(1L)
                .nombre("Admin")
                .email("admin@test.com")
                .build();

        usuarioMiembro = Usuario.builder()
                .id(2L)
                .nombre("Miembro")
                .email("miembro@test.com")
                .build();

        unidadFamiliar = UnidadFamiliar.builder()
                .id(100L)
                .nombre("Grupo Test")
                .descripcion("Descripción del grupo")
                .codigoInvitacion("ABC123DEF456")
                .administrador(usuarioAdmin)
                .fechaCreacion(LocalDateTime.now())
                .estado(EstadoUnidadFamiliar.ACTIVO)
                .maxMiembros((short) 10)
                .build();

        miembroUnidad = MiembroUnidad.builder()
                .id(1L)
                .unidad(unidadFamiliar)
                .usuario(usuarioMiembro)
                .rol(RolMiembro.MIEMBRO)
                .estado(EstadoMiembro.ACTIVO)
                .fechaUnion(LocalDateTime.now())
                .build();
    }

    // ==================== TESTS DE BÚSQUEDA ====================

    @Nested
    @DisplayName("Búsqueda de unidades familiares")
    class BusquedaTests {

        @Test
        @DisplayName("Debe encontrar unidad familiar por ID")
        void debeBuscarPorId() {
            when(unidadFamiliarRepository.findById(100L)).thenReturn(Optional.of(unidadFamiliar));

            var resultado = service.buscarPorId(100L);

            assertThat(resultado).isPresent();
            assertThat(resultado.get().getNombre()).isEqualTo("Grupo Test");
            verify(unidadFamiliarRepository).findById(100L);
        }

        @Test
        @DisplayName("Debe retornar vacío cuando no existe la unidad")
        void debeRetornarVacioCuandoNoExiste() {
            when(unidadFamiliarRepository.findById(999L)).thenReturn(Optional.empty());

            var resultado = service.buscarPorId(999L);

            assertThat(resultado).isEmpty();
        }

        @Test
        @DisplayName("Debe encontrar unidad por código de invitación")
        void debeBuscarPorCodigo() {
            when(unidadFamiliarRepository.findByCodigoInvitacion("ABC123DEF456"))
                    .thenReturn(Optional.of(unidadFamiliar));

            var resultado = service.buscarPorCodigo("abc123def456"); // Minúsculas

            assertThat(resultado).isPresent();
            assertThat(resultado.get().getCodigoInvitacion()).isEqualTo("ABC123DEF456");
        }
    }

    // ==================== TESTS DE LISTADOS ====================

    @Nested
    @DisplayName("Listado de grupos y miembros")
    class ListadoTests {

        @Test
        @DisplayName("Debe listar grupos administrados por un usuario")
        void debeListarGruposAdministrados() {
            when(unidadFamiliarRepository.findUnidadesAdministradasActivas(1L))
                    .thenReturn(List.of(unidadFamiliar));

            var resultado = service.listarGruposAdministrados(1L);

            assertThat(resultado).hasSize(1);
            assertThat(resultado.get(0).getNombre()).isEqualTo("Grupo Test");
        }

        @Test
        @DisplayName("Debe listar grupos donde el usuario es miembro")
        void debeListarGruposDondeEsMiembro() {
            when(unidadFamiliarRepository.findUnidadesDondeEsMiembroActivo(2L))
                    .thenReturn(List.of(unidadFamiliar));

            var resultado = service.listarGruposDondeEsMiembro(2L);

            assertThat(resultado).hasSize(1);
        }

        @Test
        @DisplayName("Debe listar miembros activos de una unidad")
        void debeListarMiembrosActivos() {
            when(miembroUnidadRepository.findByUnidadIdAndEstadoConUsuario(100L, EstadoMiembro.ACTIVO))
                    .thenReturn(List.of(miembroUnidad));

            var resultado = service.listarMiembrosActivos(100L);

            assertThat(resultado).hasSize(1);
            assertThat(resultado.get(0).getUsuario().getNombre()).isEqualTo("Miembro");
        }
    }

    // ==================== TESTS DE CREACIÓN ====================

    @Nested
    @DisplayName("Creación de unidades familiares")
    class CreacionTests {

        @Test
        @DisplayName("Debe crear unidad familiar exitosamente")
        void debeCrearUnidadFamiliar() {
            when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuarioAdmin));
            when(miembroUnidadRepository.contarGruposActivosDelUsuario(1L)).thenReturn(0L);
            when(unidadFamiliarRepository.existsByCodigoInvitacion(anyString())).thenReturn(false);
            when(unidadFamiliarRepository.save(any(UnidadFamiliar.class)))
                    .thenAnswer(inv -> {
                        UnidadFamiliar uf = inv.getArgument(0);
                        uf.setId(100L);
                        return uf;
                    });
            when(miembroUnidadRepository.save(any(MiembroUnidad.class)))
                    .thenAnswer(inv -> inv.getArgument(0));

            var resultado = service.crearUnidadFamiliar(1L, "Mi Familia", "Grupo familiar");

            assertThat(resultado).isNotNull();
            assertThat(resultado.getNombre()).isEqualTo("Mi Familia");
            assertThat(resultado.getDescripcion()).isEqualTo("Grupo familiar");
            assertThat(resultado.getAdministrador().getId()).isEqualTo(1L);
            assertThat(resultado.getEstado()).isEqualTo(EstadoUnidadFamiliar.ACTIVO);
            assertThat(resultado.getCodigoInvitacion()).isNotNull().hasSize(12);

            // Verificar que se añadió al administrador como miembro
            ArgumentCaptor<MiembroUnidad> miembroCaptor = ArgumentCaptor.forClass(MiembroUnidad.class);
            verify(miembroUnidadRepository).save(miembroCaptor.capture());
            assertThat(miembroCaptor.getValue().getRol()).isEqualTo(RolMiembro.ADMINISTRADOR);
        }

        @Test
        @DisplayName("Debe fallar si usuario no existe")
        void debeFallarSiUsuarioNoExiste() {
            when(usuarioRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> service.crearUnidadFamiliar(999L, "Grupo", null))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Usuario administrador no encontrado");
        }

        @Test
        @DisplayName("Debe fallar si usuario alcanzó límite de grupos")
        void debeFallarSiAlcanzoLimiteGrupos() {
            when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuarioAdmin));
            when(miembroUnidadRepository.contarGruposActivosDelUsuario(1L)).thenReturn(10L);

            assertThatThrownBy(() -> service.crearUnidadFamiliar(1L, "Grupo", null))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("límite máximo de grupos");
        }
    }

    // ==================== TESTS DE GESTIÓN DE MIEMBROS ====================

    @Nested
    @DisplayName("Gestión de miembros")
    class GestionMiembrosTests {

        @Test
        @DisplayName("Debe agregar miembro correctamente")
        void debeAgregarMiembro() {
            when(unidadFamiliarRepository.findById(100L)).thenReturn(Optional.of(unidadFamiliar));
            when(usuarioRepository.findById(2L)).thenReturn(Optional.of(usuarioMiembro));
            when(miembroUnidadRepository.existsByUsuarioIdAndUnidadIdAndEstado(2L, 100L, EstadoMiembro.ACTIVO))
                    .thenReturn(false);
            when(unidadFamiliarRepository.contarMiembrosActivos(100L)).thenReturn(1L);
            when(miembroUnidadRepository.contarGruposActivosDelUsuario(2L)).thenReturn(0L);
            when(miembroUnidadRepository.save(any(MiembroUnidad.class)))
                    .thenAnswer(inv -> inv.getArgument(0));

            var resultado = service.agregarMiembro(100L, 2L);

            assertThat(resultado).isNotNull();
            assertThat(resultado.getRol()).isEqualTo(RolMiembro.MIEMBRO);
            assertThat(resultado.getEstado()).isEqualTo(EstadoMiembro.ACTIVO);
        }

        @Test
        @DisplayName("Debe fallar si unidad no existe")
        void debeFallarSiUnidadNoExiste() {
            when(unidadFamiliarRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> service.agregarMiembro(999L, 2L))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Unidad familiar no encontrada");
        }

        @Test
        @DisplayName("Debe fallar si usuario ya es miembro")
        void debeFallarSiYaEsMiembro() {
            when(unidadFamiliarRepository.findById(100L)).thenReturn(Optional.of(unidadFamiliar));
            when(usuarioRepository.findById(2L)).thenReturn(Optional.of(usuarioMiembro));
            when(miembroUnidadRepository.existsByUsuarioIdAndUnidadIdAndEstado(2L, 100L, EstadoMiembro.ACTIVO))
                    .thenReturn(true);

            assertThatThrownBy(() -> service.agregarMiembro(100L, 2L))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("ya es miembro activo");
        }

        @Test
        @DisplayName("Debe fallar si grupo está lleno")
        void debeFallarSiGrupoLleno() {
            when(unidadFamiliarRepository.findById(100L)).thenReturn(Optional.of(unidadFamiliar));
            when(usuarioRepository.findById(2L)).thenReturn(Optional.of(usuarioMiembro));
            when(miembroUnidadRepository.existsByUsuarioIdAndUnidadIdAndEstado(2L, 100L, EstadoMiembro.ACTIVO))
                    .thenReturn(false);
            when(unidadFamiliarRepository.contarMiembrosActivos(100L)).thenReturn(10L); // Lleno

            assertThatThrownBy(() -> service.agregarMiembro(100L, 2L))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("máximo de miembros");
        }

        @Test
        @DisplayName("Debe fallar si unidad no está activa")
        void debeFallarSiUnidadNoActiva() {
            unidadFamiliar.setEstado(EstadoUnidadFamiliar.ELIMINADO);
            when(unidadFamiliarRepository.findById(100L)).thenReturn(Optional.of(unidadFamiliar));
            when(usuarioRepository.findById(2L)).thenReturn(Optional.of(usuarioMiembro));

            assertThatThrownBy(() -> service.agregarMiembro(100L, 2L))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("no está activa");
        }
    }

    // ==================== TESTS DE EXPULSIÓN ====================

    @Nested
    @DisplayName("Expulsión de miembros")
    class ExpulsionTests {

        @Test
        @DisplayName("Admin puede expulsar miembro")
        void adminPuedeExpulsarMiembro() {
            when(unidadFamiliarRepository.findById(100L)).thenReturn(Optional.of(unidadFamiliar));
            when(miembroUnidadRepository.findByUsuarioIdAndUnidadId(2L, 100L))
                    .thenReturn(Optional.of(miembroUnidad));
            when(miembroUnidadRepository.save(any(MiembroUnidad.class)))
                    .thenAnswer(inv -> inv.getArgument(0));

            service.expulsarMiembro(100L, 2L, 1L); // Admin (1L) expulsa a miembro (2L)

            assertThat(miembroUnidad.getEstado()).isEqualTo(EstadoMiembro.EXPULSADO);
            assertThat(miembroUnidad.getFechaBaja()).isNotNull();
        }

        @Test
        @DisplayName("No admin no puede expulsar")
        void noAdminNoPuedeExpulsar() {
            when(unidadFamiliarRepository.findById(100L)).thenReturn(Optional.of(unidadFamiliar));

            assertThatThrownBy(() -> service.expulsarMiembro(100L, 2L, 3L)) // Usuario 3 no es admin
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Solo el administrador");
        }

        @Test
        @DisplayName("Admin no puede expulsarse a sí mismo")
        void adminNoPuedeAutoexpulsarse() {
            when(unidadFamiliarRepository.findById(100L)).thenReturn(Optional.of(unidadFamiliar));

            assertThatThrownBy(() -> service.expulsarMiembro(100L, 1L, 1L))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("no puede expulsarse a sí mismo");
        }
    }

    // ==================== TESTS DE ABANDONO ====================

    @Nested
    @DisplayName("Abandono de grupo")
    class AbandonoTests {

        @Test
        @DisplayName("Miembro puede abandonar grupo")
        void miembroPuedeAbandonar() {
            when(unidadFamiliarRepository.findById(100L)).thenReturn(Optional.of(unidadFamiliar));
            when(miembroUnidadRepository.findByUsuarioIdAndUnidadId(2L, 100L))
                    .thenReturn(Optional.of(miembroUnidad));
            when(miembroUnidadRepository.save(any(MiembroUnidad.class)))
                    .thenAnswer(inv -> inv.getArgument(0));

            service.abandonarGrupo(100L, 2L);

            assertThat(miembroUnidad.getEstado()).isEqualTo(EstadoMiembro.ABANDONO);
            assertThat(miembroUnidad.getFechaBaja()).isNotNull();
        }

        @Test
        @DisplayName("Admin no puede abandonar grupo")
        void adminNoPuedeAbandonar() {
            when(unidadFamiliarRepository.findById(100L)).thenReturn(Optional.of(unidadFamiliar));

            assertThatThrownBy(() -> service.abandonarGrupo(100L, 1L)) // 1L es el admin
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("administrador no puede abandonar");
        }
    }

    // ==================== TESTS DE ELIMINACIÓN ====================

    @Nested
    @DisplayName("Eliminación de unidad familiar")
    class EliminacionTests {

        @Test
        @DisplayName("Admin puede eliminar grupo sin suscripciones")
        void adminPuedeEliminarGrupo() {
            when(unidadFamiliarRepository.findById(100L)).thenReturn(Optional.of(unidadFamiliar));
            when(suscripcionRepository.contarSuscripcionesActivasEnUnidad(100L)).thenReturn(0L);
            when(unidadFamiliarRepository.save(any(UnidadFamiliar.class)))
                    .thenAnswer(inv -> inv.getArgument(0));

            service.eliminarUnidadFamiliar(100L, 1L);

            assertThat(unidadFamiliar.getEstado()).isEqualTo(EstadoUnidadFamiliar.ELIMINADO);
        }

        @Test
        @DisplayName("No puede eliminar grupo con suscripciones activas")
        void noPuedeEliminarConSuscripciones() {
            when(unidadFamiliarRepository.findById(100L)).thenReturn(Optional.of(unidadFamiliar));
            when(suscripcionRepository.contarSuscripcionesActivasEnUnidad(100L)).thenReturn(3L);

            assertThatThrownBy(() -> service.eliminarUnidadFamiliar(100L, 1L))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("suscripciones activas");
        }

        @Test
        @DisplayName("No admin no puede eliminar grupo")
        void noAdminNoPuedeEliminar() {
            when(unidadFamiliarRepository.findById(100L)).thenReturn(Optional.of(unidadFamiliar));

            assertThatThrownBy(() -> service.eliminarUnidadFamiliar(100L, 2L))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Solo el administrador");
        }
    }

    // ==================== TESTS DE VERIFICACIÓN ====================

    @Nested
    @DisplayName("Verificación de roles y membresías")
    class VerificacionTests {

        @Test
        @DisplayName("Debe verificar si es miembro activo")
        void debeVerificarMiembroActivo() {
            when(miembroUnidadRepository.existsByUsuarioIdAndUnidadIdAndEstado(2L, 100L, EstadoMiembro.ACTIVO))
                    .thenReturn(true);

            boolean resultado = service.esMiembroActivo(100L, 2L);

            assertThat(resultado).isTrue();
        }

        @Test
        @DisplayName("Debe verificar si es administrador")
        void debeVerificarAdministrador() {
            when(unidadFamiliarRepository.findById(100L)).thenReturn(Optional.of(unidadFamiliar));

            boolean resultado = service.esAdministrador(100L, 1L);

            assertThat(resultado).isTrue();
        }

        @Test
        @DisplayName("Debe retornar false si no es administrador")
        void debeRetornarFalseSiNoEsAdmin() {
            when(unidadFamiliarRepository.findById(100L)).thenReturn(Optional.of(unidadFamiliar));

            boolean resultado = service.esAdministrador(100L, 999L);

            assertThat(resultado).isFalse();
        }

        @Test
        @DisplayName("Debe retornar false si unidad no existe")
        void debeRetornarFalseSiUnidadNoExiste() {
            when(unidadFamiliarRepository.findById(999L)).thenReturn(Optional.empty());

            boolean resultado = service.esAdministrador(999L, 1L);

            assertThat(resultado).isFalse();
        }
    }
}
