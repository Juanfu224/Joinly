package com.alberti.joinly.controllers;

import com.alberti.joinly.dto.auth.LoginRequest;
import com.alberti.joinly.dto.pago.CreatePagoRequest;
import com.alberti.joinly.dto.pago.ReembolsoRequest;
import com.alberti.joinly.entities.enums.*;
import com.alberti.joinly.entities.grupo.MiembroUnidad;
import com.alberti.joinly.entities.grupo.UnidadFamiliar;
import com.alberti.joinly.entities.pago.Pago;
import com.alberti.joinly.entities.suscripcion.Plaza;
import com.alberti.joinly.entities.suscripcion.Servicio;
import com.alberti.joinly.entities.suscripcion.Suscripcion;
import com.alberti.joinly.entities.usuario.MetodoPagoUsuario;
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
 * Tests de integración para PagoController.
 * <p>
 * Prueba la gestión completa de pagos:
 * - Procesar pagos de suscripciones
 * - Listar pagos del usuario
 * - Liberar pagos retenidos (admin/agente)
 * - Procesar reembolsos
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
@DisplayName("PagoController - Tests de Integración")
class PagoControllerIntegrationTest {

    private static final String API_PAGOS = "/api/v1/pagos";
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
    private MetodoPagoRepository metodoPagoRepository;

    @Autowired
    private PagoRepository pagoRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Usuario usuario;
    @SuppressWarnings("unused") // Usado para crear el agente, pero no referenciado directamente
    private Usuario agente;
    private UnidadFamiliar unidadFamiliar;
    private Suscripcion suscripcion;
    private Plaza plazaUsuario;
    private MetodoPagoUsuario metodoPago;
    private Pago pagoRetenido;
    private String userToken;
    private String agenteToken;

    @BeforeEach
    void setUp() throws Exception {
        // Limpiar datos en orden correcto
        pagoRepository.deleteAll();
        metodoPagoRepository.deleteAll();
        plazaRepository.deleteAll();
        suscripcionRepository.deleteAll();
        miembroUnidadRepository.deleteAll();
        unidadFamiliarRepository.deleteAll();
        servicioRepository.deleteAll();
        usuarioRepository.deleteAll();

        // Crear usuario normal
        usuario = crearUsuario("Usuario Pago", "usuario@joinly.com", "Usuario123!", false);
        
        // Crear agente de soporte
        agente = crearUsuario("Agente Soporte", "agente@joinly.com", "Agente123!", true);

        // Crear unidad familiar
        unidadFamiliar = UnidadFamiliar.builder()
                .nombre("Familia Pagos")
                .codigoInvitacion("PAGO12345678")
                .administrador(usuario)
                .maxMiembros((short) 10)
                .estado(EstadoUnidadFamiliar.ACTIVO)
                .fechaCreacion(LocalDateTime.now())
                .build();
        unidadFamiliar = unidadFamiliarRepository.save(unidadFamiliar);

        // Añadir usuario como miembro
        crearMiembro(usuario, unidadFamiliar, RolMiembro.ADMINISTRADOR);

        // Crear servicio
        Servicio servicio = Servicio.builder()
                .nombre("Netflix Premium")
                .categoria(CategoriaServicio.STREAMING)
                .maxUsuarios((short) 5)
                .precioReferencia(new BigDecimal("17.99"))
                .activo(true)
                .build();
        servicio = servicioRepository.save(servicio);

        // Crear suscripción
        suscripcion = Suscripcion.builder()
                .servicio(servicio)
                .unidad(unidadFamiliar)
                .anfitrion(usuario)
                .precioTotal(new BigDecimal("17.99"))
                .precioPorPlaza(new BigDecimal("4.50"))
                .numPlazasTotal((short) 4)
                .anfitrionOcupaPlaza(true)
                .estado(EstadoSuscripcion.ACTIVA)
                .fechaInicio(LocalDate.now())
                .fechaRenovacion(LocalDate.now().plusMonths(1))
                .periodicidad(Periodicidad.MENSUAL)
                .build();
        suscripcion = suscripcionRepository.save(suscripcion);

        // Crear plaza para el usuario
        plazaUsuario = Plaza.builder()
                .suscripcion(suscripcion)
                .usuario(usuario)
                .numeroPlaza((short) 1)
                .esPlazaAnfitrion(true)
                .estado(EstadoPlaza.OCUPADA)
                .fechaOcupacion(LocalDateTime.now())
                .build();
        plazaUsuario = plazaRepository.save(plazaUsuario);

        // Crear método de pago
        metodoPago = MetodoPagoUsuario.builder()
                .usuario(usuario)
                .tipo(TipoMetodoPago.TARJETA)
                .ultimosDigitos("4242")
                .marca("Visa")
                .tokenPasarela("tok_test_visa_4242")
                .fechaExpiracion(LocalDate.now().plusYears(3))
                .esPredeterminado(true)
                .estado(EstadoMetodoPago.ACTIVO)
                .fechaRegistro(LocalDateTime.now())
                .build();
        metodoPago = metodoPagoRepository.save(metodoPago);

        // Crear pago retenido para tests de liberación
        pagoRetenido = Pago.builder()
                .usuario(usuario)
                .plaza(plazaUsuario)
                .suscripcion(suscripcion)
                .metodoPago(metodoPago)
                .monto(new BigDecimal("4.50"))
                .moneda("EUR")
                .fechaPago(LocalDateTime.now().minusDays(7))
                .fechaRetencionHasta(LocalDate.now().plusDays(23))
                .estado(EstadoPago.RETENIDO)
                .cicloInicio(LocalDate.now().minusDays(7))
                .cicloFin(LocalDate.now().plusDays(23))
                .build();
        pagoRetenido = pagoRepository.save(pagoRetenido);

        // Obtener tokens
        userToken = obtenerToken("usuario@joinly.com", "Usuario123!");
        agenteToken = obtenerToken("agente@joinly.com", "Agente123!");
    }

    private Usuario crearUsuario(String nombre, String email, String password, boolean esAgente) {
        Usuario user = Usuario.builder()
                .nombre(nombre)
                .email(email)
                .password(passwordEncoder.encode(password))
                .fechaRegistro(LocalDateTime.now())
                .estado(EstadoUsuario.ACTIVO)
                .emailVerificado(true)
                .esAgenteSoporte(esAgente)
                .build();
        return usuarioRepository.save(user);
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

    // ==================== TESTS DE PROCESAR PAGO ====================

    @Nested
    @DisplayName("POST /api/v1/pagos - Procesar pago")
    class ProcesarPagoTests {

        @Test
        @DisplayName("✅ Debe procesar pago exitosamente")
        void procesarPagoExitoso() throws Exception {
            // Usar la plaza ya existente del setUp (plazaUsuario) que aún no tiene pago procesado
            // Eliminar el pago retenido creado en setUp para simular nueva plaza sin pago
            pagoRepository.delete(pagoRetenido);

            var request = new CreatePagoRequest(
                    plazaUsuario.getId(),
                    metodoPago.getId(),
                    new BigDecimal("4.50")
            );

            mockMvc.perform(post(API_PAGOS)
                            .header("Authorization", "Bearer " + userToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.id").isNumber())
                    .andExpect(jsonPath("$.monto").value(4.50))
                    .andExpect(jsonPath("$.estado").value("RETENIDO"));
        }

        @Test
        @DisplayName("❌ Debe retornar 401 sin autenticación")
        void procesarPagoSinAuth() throws Exception {
            var request = new CreatePagoRequest(
                    plazaUsuario.getId(),
                    metodoPago.getId(),
                    new BigDecimal("4.50")
            );

            mockMvc.perform(post(API_PAGOS)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("❌ Debe rechazar monto negativo")
        void montoNegativo() throws Exception {
            String jsonMontoNegativo = """
                    {
                        "idPlaza": %d,
                        "idMetodoPago": %d,
                        "monto": -10.00
                    }
                    """.formatted(plazaUsuario.getId(), metodoPago.getId());

            mockMvc.perform(post(API_PAGOS)
                            .header("Authorization", "Bearer " + userToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(jsonMontoNegativo))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("❌ Debe rechazar si falta el método de pago")
        void sinMetodoPago() throws Exception {
            String jsonSinMetodo = """
                    {
                        "idPlaza": %d,
                        "monto": 4.50
                    }
                    """.formatted(plazaUsuario.getId());

            mockMvc.perform(post(API_PAGOS)
                            .header("Authorization", "Bearer " + userToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(jsonSinMetodo))
                    .andExpect(status().isBadRequest());
        }
    }

    // ==================== TESTS DE OBTENER PAGO ====================

    @Nested
    @DisplayName("GET /api/v1/pagos/{id} - Obtener pago por ID")
    class ObtenerPagoTests {

        @Test
        @DisplayName("✅ Debe obtener pago por ID")
        void obtenerPagoExitoso() throws Exception {
            mockMvc.perform(get(API_PAGOS + "/" + pagoRetenido.getId())
                            .header("Authorization", "Bearer " + userToken))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(pagoRetenido.getId()))
                    .andExpect(jsonPath("$.monto").value(4.50))
                    .andExpect(jsonPath("$.estado").value("RETENIDO"));
        }

        @Test
        @DisplayName("❌ Debe retornar 404 si el pago no existe")
        void pagoNoExiste() throws Exception {
            mockMvc.perform(get(API_PAGOS + "/999999")
                            .header("Authorization", "Bearer " + userToken))
                    .andExpect(status().isNotFound());
        }
    }

    // ==================== TESTS DE LISTAR MIS PAGOS ====================

    @Nested
    @DisplayName("GET /api/v1/pagos/mis-pagos - Listar mis pagos")
    class ListarMisPagosTests {

        @Test
        @DisplayName("✅ Debe listar pagos del usuario con paginación")
        void listarMisPagos() throws Exception {
            mockMvc.perform(get(API_PAGOS + "/mis-pagos")
                            .header("Authorization", "Bearer " + userToken)
                            .param("page", "0")
                            .param("size", "10"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(greaterThanOrEqualTo(1))))
                    .andExpect(jsonPath("$.content[0].monto").value(4.50));
        }

        @Test
        @DisplayName("✅ Debe retornar lista vacía para usuario sin pagos")
        void usuarioSinPagos() throws Exception {
            // Crear usuario sin pagos (no necesitamos guardarlo en variable)
            crearUsuario("Sin Pagos", "sinpagos@joinly.com", "SinPagos123!", false);
            String nuevoToken = obtenerToken("sinpagos@joinly.com", "SinPagos123!");

            mockMvc.perform(get(API_PAGOS + "/mis-pagos")
                            .header("Authorization", "Bearer " + nuevoToken))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(0)));
        }
    }

    // ==================== TESTS DE LISTAR PAGOS POR SUSCRIPCIÓN ====================

    @Nested
    @DisplayName("GET /api/v1/pagos/suscripcion/{id} - Pagos de suscripción")
    class ListarPagosSuscripcionTests {

        @Test
        @DisplayName("✅ Debe listar pagos de una suscripción")
        void listarPagosSuscripcion() throws Exception {
            mockMvc.perform(get(API_PAGOS + "/suscripcion/" + suscripcion.getId())
                            .header("Authorization", "Bearer " + userToken))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))));
        }
    }

    // ==================== TESTS DE LIBERAR PAGO (ADMIN/AGENTE) ====================

    @Nested
    @DisplayName("POST /api/v1/pagos/{id}/liberar - Liberar pago retenido")
    class LiberarPagoTests {

        @Test
        @Disabled("Requiere implementación completa de Stripe API - ver PagoService TODO línea 246")
        @DisplayName("✅ Agente puede liberar pago retenido")
        void agenteLiberaPago() throws Exception {
            mockMvc.perform(post(API_PAGOS + "/" + pagoRetenido.getId() + "/liberar")
                            .header("Authorization", "Bearer " + agenteToken))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.estado").value("LIBERADO"));

            // Verificar en BD
            Pago updated = pagoRepository.findById(pagoRetenido.getId()).orElseThrow();
            assertThat(updated.getEstado()).isEqualTo(EstadoPago.LIBERADO);
            assertThat(updated.getFechaLiberacion()).isNotNull();
        }

        @Test
        @Disabled("Requiere implementación completa de Stripe API")
        @DisplayName("❌ Usuario normal no puede liberar pago")
        void usuarioNoPuedeLiberarPago() throws Exception {
            mockMvc.perform(post(API_PAGOS + "/" + pagoRetenido.getId() + "/liberar")
                            .header("Authorization", "Bearer " + userToken))
                    .andExpect(status().isForbidden());
        }
    }

    // ==================== TESTS DE REEMBOLSO (ADMIN/AGENTE) ====================

    @Nested
    @DisplayName("POST /api/v1/pagos/reembolso - Procesar reembolso")
    class ReembolsoTests {

        @Test
        @Disabled("Requiere implementación completa de Stripe Refunds API - ver PagoService TODO línea 252")
        @DisplayName("✅ Agente puede procesar reembolso")
        void agenteProcesaReembolso() throws Exception {
            var request = new ReembolsoRequest(
                    pagoRetenido.getId(),
                    new BigDecimal("2.00"),
                    "Reembolso parcial por problemas de acceso"
            );

            mockMvc.perform(post(API_PAGOS + "/reembolso")
                            .header("Authorization", "Bearer " + agenteToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.montoReembolsado").value(2.00));
        }

        @Test
        @Disabled("Requiere implementación completa de Stripe Refunds API")
        @DisplayName("❌ Usuario normal no puede procesar reembolso")
        void usuarioNoPuedeReembolsar() throws Exception {
            var request = new ReembolsoRequest(
                    pagoRetenido.getId(),
                    new BigDecimal("2.00"),
                    "Intento de reembolso no autorizado"
            );

            mockMvc.perform(post(API_PAGOS + "/reembolso")
                            .header("Authorization", "Bearer " + userToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isForbidden());
        }

        @Test
        @Disabled("Requiere implementación completa de Stripe Refunds API - ver PagoService TODO línea 252")
        @DisplayName("❌ No puede reembolsar más del monto original")
        void reembolsoExcedeMonto() throws Exception {
            var request = new ReembolsoRequest(
                    pagoRetenido.getId(),
                    new BigDecimal("100.00"), // Excede el monto de 4.50
                    "Reembolso excesivo"
            );

            mockMvc.perform(post(API_PAGOS + "/reembolso")
                            .header("Authorization", "Bearer " + agenteToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().is(422)); // UNPROCESSABLE_ENTITY
        }
    }
}
