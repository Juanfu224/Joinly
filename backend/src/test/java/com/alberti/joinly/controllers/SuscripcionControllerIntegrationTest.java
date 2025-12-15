package com.alberti.joinly.controllers;

import com.alberti.joinly.dto.auth.LoginRequest;
import com.alberti.joinly.dto.suscripcion.CreateSuscripcionRequest;
import com.alberti.joinly.entities.enums.*;
import com.alberti.joinly.entities.grupo.MiembroUnidad;
import com.alberti.joinly.entities.grupo.UnidadFamiliar;
import com.alberti.joinly.entities.suscripcion.Plaza;
import com.alberti.joinly.entities.suscripcion.Servicio;
import com.alberti.joinly.entities.suscripcion.Suscripcion;
import com.alberti.joinly.entities.usuario.Usuario;
import com.alberti.joinly.repositories.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Tests de integración para SuscripcionController.
 * <p>
 * Prueba la gestión completa de suscripciones compartidas:
 * - Creación de suscripciones
 * - Ocupar y liberar plazas
 * - Estados de suscripción (pausar, reactivar, cancelar)
 * <p>
 * Utiliza H2 en memoria para tests aislados.
 *
 * @author Joinly Team
 * @version 1.0
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@DisplayName("SuscripcionController - Tests de Integración")
class SuscripcionControllerIntegrationTest {

    private static final String API_SUSCRIPCIONES = "/api/v1/suscripciones";
    private static final String API_AUTH = "/api/v1/auth";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private UnidadFamiliarRepository unidadFamiliarRepository;

    @Autowired
    private MiembroUnidadRepository miembroUnidadRepository;

    @Autowired
    private ServicioRepository servicioRepository;

    @Autowired
    private SuscripcionRepository suscripcionRepository;

    @Autowired
    private PlazaRepository plazaRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Usuario anfitrion;
    private Usuario miembro;
    @SuppressWarnings("unused") // Usado para crear el usuario, pero no referenciado directamente
    private Usuario noMiembro;
    private UnidadFamiliar unidadFamiliar;
    private Servicio servicioNetflix;
    private Suscripcion suscripcionActiva;
    private Plaza plazaAnfitrion;
    private Plaza plazaDisponible;
    private String anfitrionToken;
    private String miembroToken;
    private String noMiembroToken;

    @BeforeEach
    void setUp() throws Exception {
        // Limpiar datos en orden correcto para evitar FK violations
        plazaRepository.deleteAll();
        suscripcionRepository.deleteAll();
        miembroUnidadRepository.deleteAll();
        unidadFamiliarRepository.deleteAll();
        servicioRepository.deleteAll();
        usuarioRepository.deleteAll();

        // Crear usuarios
        anfitrion = crearUsuario("Anfitrión", "anfitrion@joinly.com", "Anfitrion123!");
        miembro = crearUsuario("Miembro", "miembro@joinly.com", "Miembro123!");
        noMiembro = crearUsuario("No Miembro", "nomiembro@joinly.com", "NoMiembro123!");

        // Crear unidad familiar
        unidadFamiliar = UnidadFamiliar.builder()
                .nombre("Familia Suscripciones")
                .codigoInvitacion("SUSCR1234567")
                .administrador(anfitrion)
                .maxMiembros((short) 10)
                .estado(EstadoUnidadFamiliar.ACTIVO)
                .fechaCreacion(LocalDateTime.now())
                .build();
        unidadFamiliar = unidadFamiliarRepository.save(unidadFamiliar);

        // Añadir miembros
        crearMiembro(anfitrion, unidadFamiliar, RolMiembro.ADMINISTRADOR);
        crearMiembro(miembro, unidadFamiliar, RolMiembro.MIEMBRO);

        // Crear servicio de catálogo
        servicioNetflix = Servicio.builder()
                .nombre("Netflix Premium")
                .categoria(CategoriaServicio.STREAMING)
                .maxUsuarios((short) 5)
                .precioReferencia(new BigDecimal("17.99"))
                .activo(true)
                .build();
        servicioNetflix = servicioRepository.save(servicioNetflix);

        // Crear suscripción con plazas
        suscripcionActiva = Suscripcion.builder()
                .servicio(servicioNetflix)
                .unidad(unidadFamiliar)
                .anfitrion(anfitrion)
                .precioTotal(new BigDecimal("17.99"))
                .precioPorPlaza(new BigDecimal("4.50"))
                .numPlazasTotal((short) 4)
                .anfitrionOcupaPlaza(true)
                .estado(EstadoSuscripcion.ACTIVA)
                .fechaInicio(LocalDate.now())
                .fechaRenovacion(LocalDate.now().plusMonths(1))
                .periodicidad(Periodicidad.MENSUAL)
                .build();
        suscripcionActiva = suscripcionRepository.save(suscripcionActiva);

        // Crear plazas
        plazaAnfitrion = Plaza.builder()
                .suscripcion(suscripcionActiva)
                .usuario(anfitrion)
                .numeroPlaza((short) 1)
                .esPlazaAnfitrion(true)
                .estado(EstadoPlaza.OCUPADA)
                .fechaOcupacion(LocalDateTime.now())
                .build();
        plazaAnfitrion = plazaRepository.save(plazaAnfitrion);

        plazaDisponible = Plaza.builder()
                .suscripcion(suscripcionActiva)
                .numeroPlaza((short) 2)
                .esPlazaAnfitrion(false)
                .estado(EstadoPlaza.DISPONIBLE)
                .build();
        plazaDisponible = plazaRepository.save(plazaDisponible);

        // Plaza 3 disponible
        plazaRepository.save(Plaza.builder()
                .suscripcion(suscripcionActiva)
                .numeroPlaza((short) 3)
                .esPlazaAnfitrion(false)
                .estado(EstadoPlaza.DISPONIBLE)
                .build());

        // Plaza 4 disponible
        plazaRepository.save(Plaza.builder()
                .suscripcion(suscripcionActiva)
                .numeroPlaza((short) 4)
                .esPlazaAnfitrion(false)
                .estado(EstadoPlaza.DISPONIBLE)
                .build());

        // Obtener tokens
        anfitrionToken = obtenerToken("anfitrion@joinly.com", "Anfitrion123!");
        miembroToken = obtenerToken("miembro@joinly.com", "Miembro123!");
        noMiembroToken = obtenerToken("nomiembro@joinly.com", "NoMiembro123!");
    }

    private Usuario crearUsuario(String nombre, String email, String password) {
        Usuario usuario = Usuario.builder()
                .nombre(nombre)
                .email(email)
                .password(passwordEncoder.encode(password))
                .fechaRegistro(LocalDateTime.now())
                .estado(EstadoUsuario.ACTIVO)
                .emailVerificado(true)
                .esAgenteSoporte(false)
                .build();
        return usuarioRepository.save(usuario);
    }

    private void crearMiembro(Usuario usuario, UnidadFamiliar unidad, RolMiembro rol) {
        MiembroUnidad miembroUnidad = MiembroUnidad.builder()
                .usuario(usuario)
                .unidad(unidad)
                .rol(rol)
                .estado(EstadoMiembro.ACTIVO)
                .fechaUnion(LocalDateTime.now())
                .build();
        miembroUnidadRepository.save(miembroUnidad);
    }

    private String obtenerToken(String email, String password) throws Exception {
        var loginRequest = new LoginRequest(email, password);
        
        MvcResult result = mockMvc.perform(post(API_AUTH + "/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        return objectMapper.readTree(result.getResponse().getContentAsString())
                .get("accessToken").asText();
    }

    // ==================== TESTS DE CREACIÓN ====================

    @Nested
    @DisplayName("POST /api/v1/suscripciones - Crear suscripción")
    class CrearSuscripcionTests {

        @Test
        @DisplayName("✅ Debe crear suscripción exitosamente")
        void crearSuscripcionExitoso() throws Exception {
            // Crear otro servicio para evitar duplicados
            Servicio spotify = Servicio.builder()
                    .nombre("Spotify Family")
                    .categoria(CategoriaServicio.MUSICA)
                    .maxUsuarios((short) 6)
                    .precioReferencia(new BigDecimal("14.99"))
                    .activo(true)
                    .build();
            spotify = servicioRepository.save(spotify);

            var request = new CreateSuscripcionRequest(
                    unidadFamiliar.getId(),
                    spotify.getId(),
                    new BigDecimal("14.99"),
                    (short) 5,
                    LocalDate.now().plusDays(1),
                    Periodicidad.MENSUAL,
                    true
            );

            mockMvc.perform(post(API_SUSCRIPCIONES)
                            .header("Authorization", "Bearer " + anfitrionToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.id").isNumber())
                    .andExpect(jsonPath("$.servicio.nombre").value("Spotify Family"))
                    .andExpect(jsonPath("$.numPlazasTotal").value(5))
                    .andExpect(jsonPath("$.estado").value("ACTIVA"));
        }

        @Test
        @DisplayName("❌ Debe retornar 401 sin autenticación")
        void crearSinAuth() throws Exception {
            var request = new CreateSuscripcionRequest(
                    unidadFamiliar.getId(),
                    servicioNetflix.getId(),
                    new BigDecimal("17.99"),
                    (short) 4,
                    LocalDate.now().plusDays(1),
                    Periodicidad.MENSUAL,
                    true
            );

            mockMvc.perform(post(API_SUSCRIPCIONES)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("❌ No miembro no puede crear suscripción en grupo")
        void noMiembroNoPuedeCrear() throws Exception {
            var request = new CreateSuscripcionRequest(
                    unidadFamiliar.getId(),
                    servicioNetflix.getId(),
                    new BigDecimal("17.99"),
                    (short) 4,
                    LocalDate.now().plusDays(1),
                    Periodicidad.MENSUAL,
                    true
            );

            mockMvc.perform(post(API_SUSCRIPCIONES)
                            .header("Authorization", "Bearer " + noMiembroToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().is4xxClientError()); // 422 Business Rule
        }

        @Test
        @DisplayName("❌ Debe rechazar precio negativo")
        void precioNegativo() throws Exception {
            String jsonPrecioNegativo = """
                    {
                        "idUnidad": %d,
                        "idServicio": %d,
                        "precioTotal": -10.00,
                        "numPlazasTotal": 4,
                        "fechaInicio": "%s",
                        "periodicidad": "MENSUAL"
                    }
                    """.formatted(unidadFamiliar.getId(), servicioNetflix.getId(), LocalDate.now().plusDays(1));

            mockMvc.perform(post(API_SUSCRIPCIONES)
                            .header("Authorization", "Bearer " + anfitrionToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(jsonPrecioNegativo))
                    .andExpect(status().isBadRequest());
        }
    }

    // ==================== TESTS DE OBTENCIÓN ====================

    @Nested
    @DisplayName("GET /api/v1/suscripciones - Obtener suscripciones")
    class ObtenerSuscripcionTests {

        @Test
        @DisplayName("✅ Debe obtener suscripción por ID")
        void obtenerPorId() throws Exception {
            mockMvc.perform(get(API_SUSCRIPCIONES + "/" + suscripcionActiva.getId())
                            .header("Authorization", "Bearer " + anfitrionToken))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(suscripcionActiva.getId()))
                    .andExpect(jsonPath("$.servicio.nombre").value("Netflix Premium"))
                    .andExpect(jsonPath("$.precioTotal").value(17.99))
                    .andExpect(jsonPath("$.numPlazasTotal").value(4));
        }

        @Test
        @DisplayName("❌ Debe retornar error si no existe")
        void suscripcionNoExiste() throws Exception {
            mockMvc.perform(get(API_SUSCRIPCIONES + "/999999")
                            .header("Authorization", "Bearer " + anfitrionToken))
                    .andExpect(status().is4xxClientError());
        }

        @Test
        @DisplayName("✅ Debe listar suscripciones de unidad")
        void listarPorUnidad() throws Exception {
            mockMvc.perform(get(API_SUSCRIPCIONES + "/unidad/" + unidadFamiliar.getId())
                            .header("Authorization", "Bearer " + anfitrionToken))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                    .andExpect(jsonPath("$[0].nombreServicio").value("Netflix Premium"));
        }

        @Test
        @DisplayName("✅ Debe listar mis suscripciones como anfitrión")
        void listarComoAnfitrion() throws Exception {
            mockMvc.perform(get(API_SUSCRIPCIONES + "/anfitrion")
                            .header("Authorization", "Bearer " + anfitrionToken))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))));
        }
    }

    // ==================== TESTS DE PLAZAS ====================

    @Nested
    @DisplayName("Gestión de Plazas - Ocupar y Liberar")
    class PlazasTests {

        @Test
        @DisplayName("✅ Miembro puede ocupar plaza disponible")
        void ocuparPlazaExitoso() throws Exception {
            mockMvc.perform(post(API_SUSCRIPCIONES + "/" + suscripcionActiva.getId() + "/ocupar-plaza")
                            .header("Authorization", "Bearer " + miembroToken))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.estado").value("OCUPADA"))
                    .andExpect(jsonPath("$.usuario.nombre").value("Miembro"));
        }

        @Test
        @DisplayName("❌ No miembro del grupo no puede ocupar plaza")
        void noMiembroNoPuedeOcupar() throws Exception {
            mockMvc.perform(post(API_SUSCRIPCIONES + "/" + suscripcionActiva.getId() + "/ocupar-plaza")
                            .header("Authorization", "Bearer " + noMiembroToken))
                    .andExpect(status().is4xxClientError()); // 422 o 403
        }

        @Test
        @DisplayName("✅ Debe listar plazas disponibles")
        void listarPlazasDisponibles() throws Exception {
            mockMvc.perform(get(API_SUSCRIPCIONES + "/" + suscripcionActiva.getId() + "/plazas/disponibles")
                            .header("Authorization", "Bearer " + anfitrionToken))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(3))) // 3 disponibles de 4 (1 ocupada por anfitrión)
                    .andExpect(jsonPath("$[0].estado").value("DISPONIBLE"));
        }

        @Test
        @DisplayName("✅ Debe listar mis plazas ocupadas")
        void listarMisPlazas() throws Exception {
            mockMvc.perform(get(API_SUSCRIPCIONES + "/mis-plazas")
                            .header("Authorization", "Bearer " + anfitrionToken))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))));
        }

        @Test
        @DisplayName("✅ Usuario puede liberar su propia plaza")
        void liberarPlazaPropia() throws Exception {
            // Primero, miembro ocupa una plaza
            MvcResult result = mockMvc.perform(post(API_SUSCRIPCIONES + "/" + suscripcionActiva.getId() + "/ocupar-plaza")
                            .header("Authorization", "Bearer " + miembroToken))
                    .andExpect(status().isOk())
                    .andReturn();

            Long plazaId = objectMapper.readTree(result.getResponse().getContentAsString())
                    .get("id").asLong();

            // Ahora la libera
            mockMvc.perform(delete(API_SUSCRIPCIONES + "/plazas/" + plazaId)
                            .header("Authorization", "Bearer " + miembroToken))
                    .andExpect(status().isNoContent());
        }

        @Test
        @DisplayName("❌ No puede liberar plaza de otro usuario")
        void noPuedeLiberarPlazaOtro() throws Exception {
            mockMvc.perform(delete(API_SUSCRIPCIONES + "/plazas/" + plazaAnfitrion.getId())
                            .header("Authorization", "Bearer " + miembroToken))
                    .andExpect(status().is4xxClientError()); // 403 Forbidden
        }

        @Test
        @DisplayName("✅ Verificar si tiene plaza en suscripción")
        void verificarTienePlaza() throws Exception {
            mockMvc.perform(get(API_SUSCRIPCIONES + "/" + suscripcionActiva.getId() + "/tiene-plaza")
                            .header("Authorization", "Bearer " + anfitrionToken))
                    .andExpect(status().isOk())
                    .andExpect(content().string("true"));

            mockMvc.perform(get(API_SUSCRIPCIONES + "/" + suscripcionActiva.getId() + "/tiene-plaza")
                            .header("Authorization", "Bearer " + miembroToken))
                    .andExpect(status().isOk())
                    .andExpect(content().string("false")); // Aún no ha ocupado
        }
    }

    // ==================== TESTS DE ESTADOS ====================

    @Nested
    @DisplayName("POST /api/v1/suscripciones/{id}/pausar|reactivar|cancelar - Gestión de estados")
    class EstadosTests {

        @Test
        @DisplayName("✅ Anfitrión puede pausar suscripción")
        void pausarSuscripcion() throws Exception {
            mockMvc.perform(post(API_SUSCRIPCIONES + "/" + suscripcionActiva.getId() + "/pausar")
                            .header("Authorization", "Bearer " + anfitrionToken))
                    .andExpect(status().isNoContent());

            // Verificar que se pausó
            Suscripcion updated = suscripcionRepository.findById(suscripcionActiva.getId()).orElseThrow();
            assertThat(updated.getEstado()).isEqualTo(EstadoSuscripcion.PAUSADA);
        }

        @Test
        @DisplayName("❌ Miembro no puede pausar suscripción")
        void miembroNoPuedePausar() throws Exception {
            mockMvc.perform(post(API_SUSCRIPCIONES + "/" + suscripcionActiva.getId() + "/pausar")
                            .header("Authorization", "Bearer " + miembroToken))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("✅ Anfitrión puede reactivar suscripción pausada")
        void reactivarSuscripcion() throws Exception {
            // Primero pausar
            suscripcionActiva.setEstado(EstadoSuscripcion.PAUSADA);
            suscripcionRepository.save(suscripcionActiva);

            mockMvc.perform(post(API_SUSCRIPCIONES + "/" + suscripcionActiva.getId() + "/reactivar")
                            .header("Authorization", "Bearer " + anfitrionToken))
                    .andExpect(status().isNoContent());

            // Verificar que se reactivó
            Suscripcion updated = suscripcionRepository.findById(suscripcionActiva.getId()).orElseThrow();
            assertThat(updated.getEstado()).isEqualTo(EstadoSuscripcion.ACTIVA);
        }

        @Test
        @DisplayName("✅ Anfitrión puede cancelar suscripción")
        void cancelarSuscripcion() throws Exception {
            mockMvc.perform(post(API_SUSCRIPCIONES + "/" + suscripcionActiva.getId() + "/cancelar")
                            .header("Authorization", "Bearer " + anfitrionToken))
                    .andExpect(status().isNoContent());

            // Verificar que se canceló
            Suscripcion updated = suscripcionRepository.findById(suscripcionActiva.getId()).orElseThrow();
            assertThat(updated.getEstado()).isEqualTo(EstadoSuscripcion.CANCELADA);
        }

        @Test
        @DisplayName("❌ Miembro no puede cancelar suscripción")
        void miembroNoPuedeCancelar() throws Exception {
            mockMvc.perform(post(API_SUSCRIPCIONES + "/" + suscripcionActiva.getId() + "/cancelar")
                            .header("Authorization", "Bearer " + miembroToken))
                    .andExpect(status().isForbidden());
        }
    }
}
