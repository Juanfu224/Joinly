package com.alberti.joinly.services;

import com.alberti.joinly.entities.enums.*;
import com.alberti.joinly.entities.grupo.UnidadFamiliar;
import com.alberti.joinly.entities.suscripcion.Plaza;
import com.alberti.joinly.entities.suscripcion.Servicio;
import com.alberti.joinly.entities.suscripcion.Suscripcion;
import com.alberti.joinly.entities.usuario.Usuario;
import com.alberti.joinly.repositories.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
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
 * Tests unitarios para SuscripcionService.
 * Valida la lógica de negocio de creación y gestión de suscripciones compartidas.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("SuscripcionService Unit Tests")
class SuscripcionServiceTest {

    @Mock
    private SuscripcionRepository suscripcionRepository;

    @Mock
    private PlazaRepository plazaRepository;

    @Mock
    private ServicioRepository servicioRepository;

    @Mock
    private UnidadFamiliarRepository unidadFamiliarRepository;

    @Mock
    private MiembroUnidadRepository miembroUnidadRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private SuscripcionService suscripcionService;

    // Test fixtures
    private Usuario anfitrion;
    private Usuario miembro;
    private UnidadFamiliar unidadFamiliar;
    private Servicio servicio;
    private Suscripcion suscripcion;

    @BeforeEach
    void setUp() {
        anfitrion = Usuario.builder()
                .id(1L)
                .nombre("Anfitrión")
                .email("anfitrion@test.com")
                .password("hash")
                .estado(EstadoUsuario.ACTIVO)
                .fechaRegistro(LocalDateTime.now())
                .build();

        miembro = Usuario.builder()
                .id(2L)
                .nombre("Miembro")
                .email("miembro@test.com")
                .password("hash")
                .estado(EstadoUsuario.ACTIVO)
                .fechaRegistro(LocalDateTime.now())
                .build();

        unidadFamiliar = UnidadFamiliar.builder()
                .id(10L)
                .nombre("Familia Test")
                .codigoInvitacion("TEST12345678")
                .administrador(anfitrion)
                .estado(EstadoUnidadFamiliar.ACTIVO)
                .maxMiembros((short) 10)
                .build();

        servicio = Servicio.builder()
                .id(100L)
                .nombre("Netflix Premium")
                .categoria(CategoriaServicio.STREAMING)
                .maxUsuarios((short) 5)
                .precioReferencia(new BigDecimal("17.99"))
                .activo(true)
                .build();

        suscripcion = Suscripcion.builder()
                .id(20L)
                .servicio(servicio)
                .unidad(unidadFamiliar)
                .anfitrion(anfitrion)
                .precioTotal(new BigDecimal("17.99"))
                .precioPorPlaza(new BigDecimal("4.50"))
                .numPlazasTotal((short) 5)
                .anfitrionOcupaPlaza(true)
                .estado(EstadoSuscripcion.ACTIVA)
                .fechaInicio(LocalDate.now())
                .fechaRenovacion(LocalDate.now().plusMonths(1))
                .periodicidad(Periodicidad.MENSUAL)
                .build();
    }

    // ======================== TESTS: CREAR SUSCRIPCIÓN ========================

    @Nested
    @DisplayName("crearSuscripcion()")
    class CrearSuscripcionTests {

        @Test
        @DisplayName("Debe crear suscripción exitosamente con anfitrión ocupando plaza")
        void debeCrearSuscripcionConAnfitrionOcupaPlaza() {
            // Given
            given(unidadFamiliarRepository.findById(10L)).willReturn(Optional.of(unidadFamiliar));
            given(usuarioRepository.findById(1L)).willReturn(Optional.of(anfitrion));
            given(servicioRepository.findById(100L)).willReturn(Optional.of(servicio));
            given(miembroUnidadRepository.existsByUsuarioIdAndUnidadIdAndEstado(1L, 10L, EstadoMiembro.ACTIVO))
                    .willReturn(true);
            given(suscripcionRepository.contarSuscripcionesActivasEnUnidad(10L)).willReturn(0L);
            given(suscripcionRepository.save(any(Suscripcion.class))).willAnswer(inv -> {
                Suscripcion s = inv.getArgument(0);
                s.setId(20L);
                return s;
            });
            given(plazaRepository.saveAll(anyList())).willAnswer(inv -> inv.getArgument(0));

            // When
            Suscripcion resultado = suscripcionService.crearSuscripcion(
                    10L, 1L, 100L,
                    new BigDecimal("17.99"),
                    (short) 5,
                    LocalDate.now(),
                    Periodicidad.MENSUAL,
                    true
            );

            // Then
            assertThat(resultado).isNotNull();
            assertThat(resultado.getServicio()).isEqualTo(servicio);
            assertThat(resultado.getAnfitrion()).isEqualTo(anfitrion);
            assertThat(resultado.getEstado()).isEqualTo(EstadoSuscripcion.ACTIVA);

            // Verify que se crearon 5 plazas
            ArgumentCaptor<List<Plaza>> plazasCaptor = ArgumentCaptor.forClass(List.class);
            then(plazaRepository).should().saveAll(plazasCaptor.capture());
            
            List<Plaza> plazasCreadas = plazasCaptor.getValue();
            assertThat(plazasCreadas).hasSize(5);
            
            // La primera plaza debe ser del anfitrión
            Plaza primeraPlaza = plazasCreadas.getFirst();
            assertThat(primeraPlaza.getEsPlazaAnfitrion()).isTrue();
            assertThat(primeraPlaza.getUsuario()).isEqualTo(anfitrion);
            assertThat(primeraPlaza.getEstado()).isEqualTo(EstadoPlaza.OCUPADA);
            
            // Las demás plazas deben estar disponibles
            plazasCreadas.stream().skip(1).forEach(plaza -> {
                assertThat(plaza.getEstado()).isEqualTo(EstadoPlaza.DISPONIBLE);
                assertThat(plaza.getUsuario()).isNull();
            });
        }

        @Test
        @DisplayName("Debe crear suscripción sin anfitrión ocupando plaza")
        void debeCrearSuscripcionSinAnfitrionOcupaPlaza() {
            // Given
            given(unidadFamiliarRepository.findById(10L)).willReturn(Optional.of(unidadFamiliar));
            given(usuarioRepository.findById(1L)).willReturn(Optional.of(anfitrion));
            given(servicioRepository.findById(100L)).willReturn(Optional.of(servicio));
            given(miembroUnidadRepository.existsByUsuarioIdAndUnidadIdAndEstado(1L, 10L, EstadoMiembro.ACTIVO))
                    .willReturn(true);
            given(suscripcionRepository.contarSuscripcionesActivasEnUnidad(10L)).willReturn(0L);
            given(suscripcionRepository.save(any(Suscripcion.class))).willAnswer(inv -> {
                Suscripcion s = inv.getArgument(0);
                s.setId(20L);
                return s;
            });
            given(plazaRepository.saveAll(anyList())).willAnswer(inv -> inv.getArgument(0));

            // When
            Suscripcion resultado = suscripcionService.crearSuscripcion(
                    10L, 1L, 100L,
                    new BigDecimal("17.99"),
                    (short) 5,
                    LocalDate.now(),
                    Periodicidad.MENSUAL,
                    false // anfitrión NO ocupa plaza
            );

            // Then
            assertThat(resultado).isNotNull();

            // Verify que todas las plazas están disponibles
            ArgumentCaptor<List<Plaza>> plazasCaptor = ArgumentCaptor.forClass(List.class);
            then(plazaRepository).should().saveAll(plazasCaptor.capture());
            
            List<Plaza> plazasCreadas = plazasCaptor.getValue();
            assertThat(plazasCreadas).allSatisfy(plaza -> {
                assertThat(plaza.getEstado()).isEqualTo(EstadoPlaza.DISPONIBLE);
                assertThat(plaza.getUsuario()).isNull();
            });
        }

        @Test
        @DisplayName("Debe lanzar excepción cuando anfitrión no es miembro del grupo")
        void debeLanzarExcepcionCuandoAnfitrionNoEsMiembro() {
            // Given
            given(unidadFamiliarRepository.findById(10L)).willReturn(Optional.of(unidadFamiliar));
            given(usuarioRepository.findById(1L)).willReturn(Optional.of(anfitrion));
            given(servicioRepository.findById(100L)).willReturn(Optional.of(servicio));
            given(miembroUnidadRepository.existsByUsuarioIdAndUnidadIdAndEstado(1L, 10L, EstadoMiembro.ACTIVO))
                    .willReturn(false);

            // When/Then
            assertThatThrownBy(() -> suscripcionService.crearSuscripcion(
                    10L, 1L, 100L, new BigDecimal("17.99"), (short) 5,
                    LocalDate.now(), Periodicidad.MENSUAL, true))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("miembro activo");
        }

        @Test
        @DisplayName("Debe lanzar excepción cuando número de plazas excede máximo del servicio")
        void debeLanzarExcepcionCuandoExcedeMaximoPlazas() {
            // Given
            given(unidadFamiliarRepository.findById(10L)).willReturn(Optional.of(unidadFamiliar));
            given(usuarioRepository.findById(1L)).willReturn(Optional.of(anfitrion));
            given(servicioRepository.findById(100L)).willReturn(Optional.of(servicio));
            given(miembroUnidadRepository.existsByUsuarioIdAndUnidadIdAndEstado(1L, 10L, EstadoMiembro.ACTIVO))
                    .willReturn(true);

            // When/Then - servicio permite máximo 5, intentamos crear 10
            assertThatThrownBy(() -> suscripcionService.crearSuscripcion(
                    10L, 1L, 100L, new BigDecimal("17.99"), (short) 10,
                    LocalDate.now(), Periodicidad.MENSUAL, true))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("excede el máximo");
        }

        @Test
        @DisplayName("Debe lanzar excepción cuando se alcanza límite de suscripciones del grupo")
        void debeLanzarExcepcionCuandoLimiteSuscripcionesAlcanzado() {
            // Given
            given(unidadFamiliarRepository.findById(10L)).willReturn(Optional.of(unidadFamiliar));
            given(usuarioRepository.findById(1L)).willReturn(Optional.of(anfitrion));
            given(servicioRepository.findById(100L)).willReturn(Optional.of(servicio));
            given(miembroUnidadRepository.existsByUsuarioIdAndUnidadIdAndEstado(1L, 10L, EstadoMiembro.ACTIVO))
                    .willReturn(true);
            given(suscripcionRepository.contarSuscripcionesActivasEnUnidad(10L)).willReturn(20L);

            // When/Then
            assertThatThrownBy(() -> suscripcionService.crearSuscripcion(
                    10L, 1L, 100L, new BigDecimal("17.99"), (short) 5,
                    LocalDate.now(), Periodicidad.MENSUAL, true))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("límite máximo");
        }
    }

    // ======================== TESTS: CÁLCULO PRECIO POR PLAZA ========================

    @Nested
    @DisplayName("calcularPrecioPorPlaza()")
    class CalcularPrecioPorPlazaTests {

        @ParameterizedTest
        @CsvSource({
                "17.99, 5, true, 4.50",   // 17.99 / 4 plazas pagantes = 4.4975 ≈ 4.50
                "17.99, 5, false, 3.60",  // 17.99 / 5 plazas pagantes = 3.598 ≈ 3.60
                "12.00, 4, true, 4.00",   // 12.00 / 3 plazas pagantes = 4.00
                "10.00, 2, false, 5.00",  // 10.00 / 2 plazas pagantes = 5.00
        })
        @DisplayName("Debe calcular precio por plaza correctamente")
        void debeCalcularPrecioPorPlazaCorrectamente(
                String precioTotal, 
                short numPlazas, 
                boolean anfitrionOcupa, 
                String precioEsperado) {
            
            // When
            BigDecimal resultado = suscripcionService.calcularPrecioPorPlaza(
                    new BigDecimal(precioTotal), numPlazas, anfitrionOcupa);

            // Then
            assertThat(resultado).isEqualByComparingTo(new BigDecimal(precioEsperado));
        }

        @Test
        @DisplayName("Debe retornar cero cuando solo hay una plaza y anfitrión la ocupa")
        void debeRetornarCeroCuandoSoloAnfitrion() {
            // When
            BigDecimal resultado = suscripcionService.calcularPrecioPorPlaza(
                    new BigDecimal("17.99"), (short) 1, true);

            // Then
            assertThat(resultado).isEqualByComparingTo(BigDecimal.ZERO);
        }
    }

    // ======================== TESTS: OCUPAR PLAZA ========================

    @Nested
    @DisplayName("ocuparPlaza()")
    class OcuparPlazaTests {

        private Plaza plazaDisponible;

        @BeforeEach
        void setUp() {
            plazaDisponible = Plaza.builder()
                    .id(30L)
                    .suscripcion(suscripcion)
                    .numeroPlaza((short) 2)
                    .estado(EstadoPlaza.DISPONIBLE)
                    .build();
        }

        @Test
        @DisplayName("Debe ocupar plaza exitosamente")
        void debeOcuparPlazaExitosamente() {
            // Given
            given(suscripcionRepository.findById(20L)).willReturn(Optional.of(suscripcion));
            given(usuarioRepository.findById(2L)).willReturn(Optional.of(miembro));
            given(miembroUnidadRepository.existsByUsuarioIdAndUnidadIdAndEstado(2L, 10L, EstadoMiembro.ACTIVO))
                    .willReturn(true);
            given(plazaRepository.existsBySuscripcionIdAndUsuarioId(20L, 2L)).willReturn(false);
            given(plazaRepository.findPlazasDisponiblesOrdenadas(20L)).willReturn(List.of(plazaDisponible));
            given(plazaRepository.save(any(Plaza.class))).willAnswer(inv -> inv.getArgument(0));

            // When
            Plaza resultado = suscripcionService.ocuparPlaza(20L, 2L);

            // Then
            assertThat(resultado.getUsuario()).isEqualTo(miembro);
            assertThat(resultado.getEstado()).isEqualTo(EstadoPlaza.OCUPADA);
            assertThat(resultado.getFechaOcupacion()).isNotNull();
        }

        @Test
        @DisplayName("Debe lanzar excepción cuando suscripción no está activa")
        void debeLanzarExcepcionCuandoSuscripcionInactiva() {
            // Given
            suscripcion.setEstado(EstadoSuscripcion.PAUSADA);
            given(suscripcionRepository.findById(20L)).willReturn(Optional.of(suscripcion));
            given(usuarioRepository.findById(2L)).willReturn(Optional.of(miembro));

            // When/Then
            assertThatThrownBy(() -> suscripcionService.ocuparPlaza(20L, 2L))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("no está activa");
        }

        @Test
        @DisplayName("Debe lanzar excepción cuando usuario ya tiene plaza")
        void debeLanzarExcepcionCuandoYaTienePlaza() {
            // Given
            given(suscripcionRepository.findById(20L)).willReturn(Optional.of(suscripcion));
            given(usuarioRepository.findById(2L)).willReturn(Optional.of(miembro));
            given(miembroUnidadRepository.existsByUsuarioIdAndUnidadIdAndEstado(2L, 10L, EstadoMiembro.ACTIVO))
                    .willReturn(true);
            given(plazaRepository.existsBySuscripcionIdAndUsuarioId(20L, 2L)).willReturn(true);

            // When/Then
            assertThatThrownBy(() -> suscripcionService.ocuparPlaza(20L, 2L))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("ya ocupa una plaza");
        }

        @Test
        @DisplayName("Debe lanzar excepción cuando no hay plazas disponibles")
        void debeLanzarExcepcionCuandoNoHayPlazas() {
            // Given
            given(suscripcionRepository.findById(20L)).willReturn(Optional.of(suscripcion));
            given(usuarioRepository.findById(2L)).willReturn(Optional.of(miembro));
            given(miembroUnidadRepository.existsByUsuarioIdAndUnidadIdAndEstado(2L, 10L, EstadoMiembro.ACTIVO))
                    .willReturn(true);
            given(plazaRepository.existsBySuscripcionIdAndUsuarioId(20L, 2L)).willReturn(false);
            given(plazaRepository.findPlazasDisponiblesOrdenadas(20L)).willReturn(List.of());

            // When/Then
            assertThatThrownBy(() -> suscripcionService.ocuparPlaza(20L, 2L))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("No hay plazas disponibles");
        }
    }

    // ======================== TESTS: LIBERAR PLAZA ========================

    @Nested
    @DisplayName("liberarPlaza()")
    class LiberarPlazaTests {

        private Plaza plazaOcupada;
        private Plaza plazaAnfitrion;

        @BeforeEach
        void setUp() {
            plazaOcupada = Plaza.builder()
                    .id(30L)
                    .suscripcion(suscripcion)
                    .usuario(miembro)
                    .numeroPlaza((short) 2)
                    .estado(EstadoPlaza.OCUPADA)
                    .esPlazaAnfitrion(false)
                    .build();

            plazaAnfitrion = Plaza.builder()
                    .id(31L)
                    .suscripcion(suscripcion)
                    .usuario(anfitrion)
                    .numeroPlaza((short) 1)
                    .estado(EstadoPlaza.OCUPADA)
                    .esPlazaAnfitrion(true)
                    .build();
        }

        @Test
        @DisplayName("Usuario puede liberar su propia plaza")
        void usuarioPuedeLiberarSuPlaza() {
            // Given
            given(plazaRepository.findById(30L)).willReturn(Optional.of(plazaOcupada));
            given(plazaRepository.save(any(Plaza.class))).willAnswer(inv -> inv.getArgument(0));

            // When
            suscripcionService.liberarPlaza(30L, 2L); // Usuario 2 es el propietario

            // Then
            assertThat(plazaOcupada.getUsuario()).isNull();
            assertThat(plazaOcupada.getEstado()).isEqualTo(EstadoPlaza.DISPONIBLE);
            assertThat(plazaOcupada.getFechaBaja()).isNotNull();
        }

        @Test
        @DisplayName("Anfitrión puede liberar plaza de otro usuario")
        void anfitrionPuedeLiberarPlazaDeOtro() {
            // Given
            given(plazaRepository.findById(30L)).willReturn(Optional.of(plazaOcupada));
            given(plazaRepository.save(any(Plaza.class))).willAnswer(inv -> inv.getArgument(0));

            // When
            suscripcionService.liberarPlaza(30L, 1L); // Usuario 1 es el anfitrión

            // Then
            assertThat(plazaOcupada.getEstado()).isEqualTo(EstadoPlaza.DISPONIBLE);
        }

        @Test
        @DisplayName("Anfitrión no puede liberar su plaza reservada")
        void anfitrionNoPuedeLiberarSuPlazaReservada() {
            // Given
            given(plazaRepository.findById(31L)).willReturn(Optional.of(plazaAnfitrion));

            // When/Then
            assertThatThrownBy(() -> suscripcionService.liberarPlaza(31L, 1L))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("no puede liberar su plaza reservada");
        }

        @Test
        @DisplayName("Usuario sin permiso no puede liberar plaza")
        void usuarioSinPermisoNoPuedeLiberarPlaza() {
            // Given
            given(plazaRepository.findById(30L)).willReturn(Optional.of(plazaOcupada));

            // When/Then - Usuario 99 intenta liberar plaza de usuario 2
            assertThatThrownBy(() -> suscripcionService.liberarPlaza(30L, 99L))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("permiso");
        }
    }

    // ======================== TESTS: GESTIÓN DE ESTADO ========================

    @Nested
    @DisplayName("Gestión de estado de suscripción")
    class GestionEstadoTests {

        @Test
        @DisplayName("Anfitrión puede pausar suscripción activa")
        void anfitrionPuedePausarSuscripcion() {
            // Given
            given(suscripcionRepository.findById(20L)).willReturn(Optional.of(suscripcion));
            given(suscripcionRepository.save(any(Suscripcion.class))).willAnswer(inv -> inv.getArgument(0));

            // When
            suscripcionService.pausarSuscripcion(20L, 1L);

            // Then
            assertThat(suscripcion.getEstado()).isEqualTo(EstadoSuscripcion.PAUSADA);
        }

        @Test
        @DisplayName("No anfitrión no puede pausar suscripción")
        void noAnfitrionNoPuedePausarSuscripcion() {
            // Given
            given(suscripcionRepository.findById(20L)).willReturn(Optional.of(suscripcion));

            // When/Then
            assertThatThrownBy(() -> suscripcionService.pausarSuscripcion(20L, 99L))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("anfitrión");
        }

        @Test
        @DisplayName("Anfitrión puede reactivar suscripción pausada")
        void anfitrionPuedeReactivarSuscripcion() {
            // Given
            suscripcion.setEstado(EstadoSuscripcion.PAUSADA);
            given(suscripcionRepository.findById(20L)).willReturn(Optional.of(suscripcion));
            given(suscripcionRepository.save(any(Suscripcion.class))).willAnswer(inv -> inv.getArgument(0));

            // When
            suscripcionService.reactivarSuscripcion(20L, 1L);

            // Then
            assertThat(suscripcion.getEstado()).isEqualTo(EstadoSuscripcion.ACTIVA);
        }

        @Test
        @DisplayName("No puede reactivar suscripción que no está pausada")
        void noPuedeReactivarSuscripcionNoAausada() {
            // Given - suscripción está ACTIVA, no PAUSADA
            given(suscripcionRepository.findById(20L)).willReturn(Optional.of(suscripcion));

            // When/Then
            assertThatThrownBy(() -> suscripcionService.reactivarSuscripcion(20L, 1L))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("pausadas");
        }

        @Test
        @DisplayName("Cancelar suscripción libera plazas ocupadas")
        void cancelarSuscripcionLiberaPlazas() {
            // Given
            Plaza plazaOcupada = Plaza.builder()
                    .id(30L)
                    .suscripcion(suscripcion)
                    .usuario(miembro)
                    .estado(EstadoPlaza.OCUPADA)
                    .esPlazaAnfitrion(false)
                    .build();

            Plaza plazaAnfitrion = Plaza.builder()
                    .id(31L)
                    .suscripcion(suscripcion)
                    .usuario(anfitrion)
                    .estado(EstadoPlaza.OCUPADA)
                    .esPlazaAnfitrion(true)
                    .build();

            given(suscripcionRepository.findById(20L)).willReturn(Optional.of(suscripcion));
            given(suscripcionRepository.save(any(Suscripcion.class))).willAnswer(inv -> inv.getArgument(0));
            given(plazaRepository.findBySuscripcionIdAndEstado(20L, EstadoPlaza.OCUPADA))
                    .willReturn(List.of(plazaOcupada, plazaAnfitrion));
            given(plazaRepository.save(any(Plaza.class))).willAnswer(inv -> inv.getArgument(0));

            // When
            suscripcionService.cancelarSuscripcion(20L, 1L);

            // Then
            assertThat(suscripcion.getEstado()).isEqualTo(EstadoSuscripcion.CANCELADA);
            
            // Solo la plaza no-anfitrión debe ser bloqueada
            assertThat(plazaOcupada.getEstado()).isEqualTo(EstadoPlaza.BLOQUEADA);
            assertThat(plazaAnfitrion.getEstado()).isEqualTo(EstadoPlaza.OCUPADA); // No cambió
        }
    }
}
