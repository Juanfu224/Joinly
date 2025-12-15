package com.alberti.joinly.controllers;

import com.alberti.joinly.dto.auth.LoginRequest;
import com.alberti.joinly.dto.unidad.CreateUnidadRequest;
import com.alberti.joinly.entities.enums.EstadoMiembro;
import com.alberti.joinly.entities.enums.EstadoUnidadFamiliar;
import com.alberti.joinly.entities.enums.EstadoUsuario;
import com.alberti.joinly.entities.enums.RolMiembro;
import com.alberti.joinly.entities.grupo.MiembroUnidad;
import com.alberti.joinly.entities.grupo.UnidadFamiliar;
import com.alberti.joinly.entities.usuario.Usuario;
import com.alberti.joinly.repositories.MiembroUnidadRepository;
import com.alberti.joinly.repositories.UnidadFamiliarRepository;
import com.alberti.joinly.repositories.UsuarioRepository;
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

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Tests de integración para UnidadFamiliarController.
 * <p>
 * Prueba la gestión completa de grupos familiares:
 * - Creación de unidades
 * - Búsqueda por código de invitación
 * - Listado de miembros
 * - Expulsión y abandono de grupos
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
@DisplayName("UnidadFamiliarController - Tests de Integración")
class UnidadFamiliarControllerIntegrationTest {

    private static final String API_UNIDADES = "/api/v1/unidades";
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
    private PasswordEncoder passwordEncoder;

    private Usuario administrador;
    private Usuario miembro;
    private UnidadFamiliar unidadFamiliar;
    private String adminToken;
    private String miembroToken;

    @BeforeEach
    void setUp() throws Exception {
        // Limpiar datos
        miembroUnidadRepository.deleteAll();
        unidadFamiliarRepository.deleteAll();
        usuarioRepository.deleteAll();

        // Crear usuario administrador
        administrador = Usuario.builder()
                .nombre("Admin Test")
                .email("admin@joinly.com")
                .password(passwordEncoder.encode("Admin123!"))
                .fechaRegistro(LocalDateTime.now())
                .estado(EstadoUsuario.ACTIVO)
                .emailVerificado(true)
                .rol(com.alberti.joinly.entities.enums.RolUsuario.USER)
                .build();
        administrador = usuarioRepository.save(administrador);

        // Crear usuario miembro
        miembro = Usuario.builder()
                .nombre("Miembro Test")
                .email("miembro@joinly.com")
                .password(passwordEncoder.encode("Miembro123!"))
                .fechaRegistro(LocalDateTime.now())
                .estado(EstadoUsuario.ACTIVO)
                .emailVerificado(true)
                .rol(com.alberti.joinly.entities.enums.RolUsuario.USER)
                .build();
        miembro = usuarioRepository.save(miembro);

        // Crear unidad familiar de prueba
        unidadFamiliar = UnidadFamiliar.builder()
                .nombre("Familia Test")
                .codigoInvitacion("ABC123XYZ789")
                .administrador(administrador)
                .descripcion("Grupo de prueba")
                .maxMiembros((short) 10)
                .estado(EstadoUnidadFamiliar.ACTIVO)
                .fechaCreacion(LocalDateTime.now())
                .build();
        unidadFamiliar = unidadFamiliarRepository.save(unidadFamiliar);

        // Añadir admin como miembro
        MiembroUnidad adminMiembro = MiembroUnidad.builder()
                .usuario(administrador)
                .unidad(unidadFamiliar)
                .rol(RolMiembro.ADMINISTRADOR)
                .estado(EstadoMiembro.ACTIVO)
                .fechaUnion(LocalDateTime.now())
                .build();
        miembroUnidadRepository.save(adminMiembro);

        // Añadir miembro al grupo
        MiembroUnidad miembroUnidad = MiembroUnidad.builder()
                .usuario(miembro)
                .unidad(unidadFamiliar)
                .rol(RolMiembro.MIEMBRO)
                .estado(EstadoMiembro.ACTIVO)
                .fechaUnion(LocalDateTime.now())
                .build();
        miembroUnidadRepository.save(miembroUnidad);

        // Obtener tokens JWT
        adminToken = obtenerToken("admin@joinly.com", "Admin123!");
        miembroToken = obtenerToken("miembro@joinly.com", "Miembro123!");
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
    @DisplayName("POST /api/v1/unidades - Crear unidad familiar")
    class CrearUnidadTests {

        @Test
        @DisplayName("✅ Debe crear unidad familiar exitosamente")
        void crearUnidadExitoso() throws Exception {
            var request = new CreateUnidadRequest(
                    "Nueva Familia García",
                    "Grupo familiar para compartir suscripciones"
            );

            mockMvc.perform(post(API_UNIDADES)
                            .header("Authorization", "Bearer " + adminToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.id").isNumber())
                    .andExpect(jsonPath("$.nombre").value("Nueva Familia García"))
                    .andExpect(jsonPath("$.descripcion").value("Grupo familiar para compartir suscripciones"))
                    .andExpect(jsonPath("$.codigoInvitacion").isNotEmpty())
                    .andExpect(jsonPath("$.codigoInvitacion", hasLength(12)));
        }

        @Test
        @DisplayName("❌ Debe retornar 401 sin autenticación")
        void crearUnidadSinAuth() throws Exception {
            var request = new CreateUnidadRequest("Familia Sin Auth", null);

            mockMvc.perform(post(API_UNIDADES)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("❌ Debe retornar 400 si el nombre está vacío")
        void crearUnidadNombreVacio() throws Exception {
            String jsonSinNombre = """
                    {
                        "nombre": "",
                        "descripcion": "Sin nombre"
                    }
                    """;

            mockMvc.perform(post(API_UNIDADES)
                            .header("Authorization", "Bearer " + adminToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(jsonSinNombre))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("✅ Debe crear unidad sin descripción (campo opcional)")
        void crearUnidadSinDescripcion() throws Exception {
            var request = new CreateUnidadRequest("Familia Minimal", null);

            mockMvc.perform(post(API_UNIDADES)
                            .header("Authorization", "Bearer " + adminToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.nombre").value("Familia Minimal"));
        }
    }

    // ==================== TESTS DE BÚSQUEDA ====================

    @Nested
    @DisplayName("GET /api/v1/unidades - Búsqueda de unidades")
    class BusquedaUnidadTests {

        @Test
        @DisplayName("✅ Debe obtener unidad por ID")
        void obtenerUnidadPorId() throws Exception {
            mockMvc.perform(get(API_UNIDADES + "/" + unidadFamiliar.getId())
                            .header("Authorization", "Bearer " + adminToken))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(unidadFamiliar.getId()))
                    .andExpect(jsonPath("$.nombre").value("Familia Test"))
                    .andExpect(jsonPath("$.codigoInvitacion").value("ABC123XYZ789"));
        }

        @Test
        @DisplayName("❌ Debe retornar 404 si la unidad no existe")
        void obtenerUnidadNoExiste() throws Exception {
            mockMvc.perform(get(API_UNIDADES + "/999999")
                            .header("Authorization", "Bearer " + adminToken))
                    .andExpect(status().is4xxClientError());
        }

        @Test
        @DisplayName("✅ Debe buscar unidad por código de invitación")
        void buscarPorCodigo() throws Exception {
            mockMvc.perform(get(API_UNIDADES + "/codigo/ABC123XYZ789")
                            .header("Authorization", "Bearer " + adminToken))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.nombre").value("Familia Test"))
                    .andExpect(jsonPath("$.codigoInvitacion").value("ABC123XYZ789"));
        }

        @Test
        @DisplayName("❌ Debe retornar error con código inválido")
        void buscarPorCodigoInvalido() throws Exception {
            mockMvc.perform(get(API_UNIDADES + "/codigo/CODIGO_FALSO")
                            .header("Authorization", "Bearer " + adminToken))
                    .andExpect(status().is4xxClientError());
        }
    }

    // ==================== TESTS DE LISTADOS ====================

    @Nested
    @DisplayName("GET /api/v1/unidades/administradas|miembro - Listados")
    class ListadosTests {

        @Test
        @DisplayName("✅ Debe listar grupos administrados por el usuario")
        void listarGruposAdministrados() throws Exception {
            mockMvc.perform(get(API_UNIDADES + "/administradas")
                            .header("Authorization", "Bearer " + adminToken))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                    .andExpect(jsonPath("$[0].nombre").value("Familia Test"));
        }

        @Test
        @DisplayName("✅ Debe retornar lista vacía si no administra grupos")
        void listarGruposAdministradosVacio() throws Exception {
            // Miembro no administra ningún grupo
            mockMvc.perform(get(API_UNIDADES + "/administradas")
                            .header("Authorization", "Bearer " + miembroToken))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(0)));
        }

        @Test
        @DisplayName("✅ Debe listar grupos donde es miembro (paginado)")
        void listarGruposDondeSoyMiembro() throws Exception {
            mockMvc.perform(get(API_UNIDADES + "/miembro")
                            .header("Authorization", "Bearer " + miembroToken))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(greaterThanOrEqualTo(1))))
                    .andExpect(jsonPath("$.totalElements").value(greaterThanOrEqualTo(1)));
        }
    }

    // ==================== TESTS DE MIEMBROS ====================

    @Nested
    @DisplayName("GET/DELETE /api/v1/unidades/{id}/miembros - Gestión de miembros")
    class MiembrosTests {

        @Test
        @DisplayName("✅ Debe listar miembros activos de la unidad")
        void listarMiembrosActivos() throws Exception {
            mockMvc.perform(get(API_UNIDADES + "/" + unidadFamiliar.getId() + "/miembros")
                            .header("Authorization", "Bearer " + adminToken))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(2))) // Admin + Miembro
                    .andExpect(jsonPath("$[*].usuario.nombre", hasItem("Admin Test")))
                    .andExpect(jsonPath("$[*].usuario.nombre", hasItem("Miembro Test")));
        }

        @Test
        @DisplayName("✅ Debe expulsar miembro correctamente (solo admin)")
        void expulsarMiembro() throws Exception {
            mockMvc.perform(delete(API_UNIDADES + "/" + unidadFamiliar.getId() + "/miembros/" + miembro.getId())
                            .header("Authorization", "Bearer " + adminToken))
                    .andExpect(status().isNoContent());

            // Verificar que el miembro fue expulsado
            boolean esMiembroActivo = miembroUnidadRepository
                    .existsByUsuarioIdAndUnidadIdAndEstado(miembro.getId(), unidadFamiliar.getId(), EstadoMiembro.ACTIVO);
            assertThat(esMiembroActivo).isFalse();
        }

        @Test
        @DisplayName("❌ Miembro no puede expulsar a otros")
        void miembroNoPuedeExpulsar() throws Exception {
            mockMvc.perform(delete(API_UNIDADES + "/" + unidadFamiliar.getId() + "/miembros/" + administrador.getId())
                            .header("Authorization", "Bearer " + miembroToken))
                    .andExpect(status().isForbidden());
        }
    }

    // ==================== TESTS DE ABANDONO ====================

    @Nested
    @DisplayName("POST /api/v1/unidades/{id}/abandonar - Abandonar grupo")
    class AbandonarTests {

        @Test
        @DisplayName("✅ Miembro puede abandonar el grupo")
        void miembroPuedeAbandonar() throws Exception {
            mockMvc.perform(post(API_UNIDADES + "/" + unidadFamiliar.getId() + "/abandonar")
                            .header("Authorization", "Bearer " + miembroToken))
                    .andExpect(status().isNoContent());
        }

        @Test
        @DisplayName("❌ Administrador no puede abandonar su propio grupo")
        void adminNoPuedeAbandonar() throws Exception {
            mockMvc.perform(post(API_UNIDADES + "/" + unidadFamiliar.getId() + "/abandonar")
                            .header("Authorization", "Bearer " + adminToken))
                    .andExpect(status().is(422)); // 422 - Unprocessable Entity
        }
    }

    // ==================== TESTS DE VERIFICACIÓN ====================

    @Nested
    @DisplayName("GET /api/v1/unidades/{id}/es-miembro|es-administrador - Verificaciones")
    class VerificacionTests {

        @Test
        @DisplayName("✅ Debe verificar que es miembro activo")
        void verificarEsMiembro() throws Exception {
            mockMvc.perform(get(API_UNIDADES + "/" + unidadFamiliar.getId() + "/es-miembro")
                            .header("Authorization", "Bearer " + miembroToken))
                    .andExpect(status().isOk())
                    .andExpect(content().string("true"));
        }

        @Test
        @DisplayName("✅ Debe verificar que es administrador")
        void verificarEsAdministrador() throws Exception {
            mockMvc.perform(get(API_UNIDADES + "/" + unidadFamiliar.getId() + "/es-administrador")
                            .header("Authorization", "Bearer " + adminToken))
                    .andExpect(status().isOk())
                    .andExpect(content().string("true"));
        }

        @Test
        @DisplayName("✅ Miembro no es administrador")
        void miembroNoEsAdministrador() throws Exception {
            mockMvc.perform(get(API_UNIDADES + "/" + unidadFamiliar.getId() + "/es-administrador")
                            .header("Authorization", "Bearer " + miembroToken))
                    .andExpect(status().isOk())
                    .andExpect(content().string("false"));
        }
    }

    // ==================== TESTS DE ELIMINACIÓN ====================

    @Nested
    @DisplayName("DELETE /api/v1/unidades/{id} - Eliminar grupo")
    class EliminarTests {

        @Test
        @DisplayName("✅ Admin puede eliminar su grupo (sin suscripciones activas)")
        void eliminarGrupoExitoso() throws Exception {
            // Primero crear un grupo nuevo sin suscripciones
            var request = new CreateUnidadRequest("Grupo Para Eliminar", null);
            
            MvcResult result = mockMvc.perform(post(API_UNIDADES)
                            .header("Authorization", "Bearer " + adminToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andReturn();

            Long nuevoGrupoId = objectMapper.readTree(result.getResponse().getContentAsString())
                    .get("id").asLong();

            // Ahora eliminarlo
            mockMvc.perform(delete(API_UNIDADES + "/" + nuevoGrupoId)
                            .header("Authorization", "Bearer " + adminToken))
                    .andExpect(status().isNoContent());
        }

        @Test
        @DisplayName("❌ Miembro no puede eliminar el grupo")
        void miembroNoPuedeEliminar() throws Exception {
            mockMvc.perform(delete(API_UNIDADES + "/" + unidadFamiliar.getId())
                            .header("Authorization", "Bearer " + miembroToken))
                    .andExpect(status().isForbidden());
        }
    }
}
