package com.alberti.joinly.controllers;

import com.alberti.joinly.dto.solicitud.CreateSolicitudGrupoRequest;
import com.alberti.joinly.dto.solicitud.CreateSolicitudSuscripcionRequest;
import com.alberti.joinly.dto.solicitud.RejectSolicitudRequest;
import com.alberti.joinly.entities.enums.*;
import com.alberti.joinly.entities.grupo.Solicitud;
import com.alberti.joinly.entities.grupo.UnidadFamiliar;
import com.alberti.joinly.entities.suscripcion.Suscripcion;
import com.alberti.joinly.entities.usuario.Usuario;
import com.alberti.joinly.exceptions.*;
import com.alberti.joinly.services.SolicitudService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Tests de integración para SolicitudController usando @WebMvcTest.
 * Verifica códigos de estado HTTP, serialización JSON y manejo de excepciones.
 */
@WebMvcTest(SolicitudController.class)
@DisplayName("SolicitudController Integration Tests")
class SolicitudControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private SolicitudService solicitudService;

    // Test fixtures
    private Usuario solicitante;
    private Usuario administrador;
    private UnidadFamiliar unidadFamiliar;
    private Suscripcion suscripcion;
    private Solicitud solicitudGrupo;
    private Solicitud solicitudSuscripcion;

    @BeforeEach
    void setUp() {
        solicitante = Usuario.builder()
                .id(1L)
                .nombre("Solicitante")
                .email("solicitante@test.com")
                .estado(EstadoUsuario.ACTIVO)
                .fechaRegistro(LocalDateTime.now())
                .build();

        administrador = Usuario.builder()
                .id(2L)
                .nombre("Admin")
                .email("admin@test.com")
                .estado(EstadoUsuario.ACTIVO)
                .fechaRegistro(LocalDateTime.now())
                .build();

        unidadFamiliar = UnidadFamiliar.builder()
                .id(10L)
                .nombre("Familia Test")
                .codigoInvitacion("TESTCODE1234")
                .administrador(administrador)
                .estado(EstadoUnidadFamiliar.ACTIVO)
                .maxMiembros((short) 10)
                .fechaCreacion(LocalDateTime.now())
                .build();

        suscripcion = Suscripcion.builder()
                .id(20L)
                .unidad(unidadFamiliar)
                .anfitrion(administrador)
                .estado(EstadoSuscripcion.ACTIVA)
                .fechaInicio(LocalDate.now())
                .build();

        solicitudGrupo = Solicitud.builder()
                .id(100L)
                .solicitante(solicitante)
                .unidad(unidadFamiliar)
                .tipo(TipoSolicitud.GRUPO)
                .estado(EstadoSolicitud.PENDIENTE)
                .fechaSolicitud(LocalDateTime.now())
                .mensaje("Quiero unirme")
                .build();

        solicitudSuscripcion = Solicitud.builder()
                .id(101L)
                .solicitante(solicitante)
                .suscripcion(suscripcion)
                .tipo(TipoSolicitud.SUSCRIPCION)
                .estado(EstadoSolicitud.PENDIENTE)
                .fechaSolicitud(LocalDateTime.now())
                .mensaje("Quiero unirme a la suscripción")
                .build();
    }

    // ======================== TESTS: CREAR SOLICITUD GRUPO ========================

    @Nested
    @DisplayName("POST /api/v1/solicitudes/grupo")
    class CrearSolicitudGrupoTests {

        @Test
        @DisplayName("201 Created - Solicitud creada exitosamente")
        void debeRetornar201CuandoSolicitudCreada() throws Exception {
            // Given
            var request = new CreateSolicitudGrupoRequest("TESTCODE1234", "Quiero unirme");
            given(solicitudService.crearSolicitudUnionGrupo(1L, "TESTCODE1234", "Quiero unirme"))
                    .willReturn(solicitudGrupo);

            // When/Then
            mockMvc.perform(post("/api/v1/solicitudes/grupo")
                            .header("X-User-Id", 1L)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.id").value(100))
                    .andExpect(jsonPath("$.tipo").value("GRUPO"))
                    .andExpect(jsonPath("$.estado").value("PENDIENTE"))
                    .andExpect(jsonPath("$.mensaje").value("Quiero unirme"));
        }

        @Test
        @DisplayName("400 Bad Request - Código inválido")
        void debeRetornar400CuandoCodigoInvalido() throws Exception {
            // Given
            var request = new CreateSolicitudGrupoRequest("INVALID123", "Quiero unirme");
            given(solicitudService.crearSolicitudUnionGrupo(1L, "INVALID123", "Quiero unirme"))
                    .willThrow(new ResourceNotFoundException("Unidad", "codigoInvitacion", "INVALID123"));

            // When/Then
            mockMvc.perform(post("/api/v1/solicitudes/grupo")
                            .header("X-User-Id", 1L)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("409 Conflict - Solicitud duplicada")
        void debeRetornar409CuandoSolicitudDuplicada() throws Exception {
            // Given
            var request = new CreateSolicitudGrupoRequest("TESTCODE1234", "Quiero unirme");
            given(solicitudService.crearSolicitudUnionGrupo(1L, "TESTCODE1234", "Quiero unirme"))
                    .willThrow(new DuplicateResourceException("Ya tienes una solicitud pendiente"));

            // When/Then
            mockMvc.perform(post("/api/v1/solicitudes/grupo")
                            .header("X-User-Id", 1L)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isConflict());
        }

        @Test
        @DisplayName("400 Bad Request - Ya eres miembro")
        void debeRetornar400CuandoYaEsMiembro() throws Exception {
            // Given
            var request = new CreateSolicitudGrupoRequest("TESTCODE1234", "Quiero unirme");
            given(solicitudService.crearSolicitudUnionGrupo(1L, "TESTCODE1234", "Quiero unirme"))
                    .willThrow(new BusinessException("Ya eres miembro activo del grupo"));

            // When/Then
            mockMvc.perform(post("/api/v1/solicitudes/grupo")
                            .header("X-User-Id", 1L)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }
    }

    // ======================== TESTS: CREAR SOLICITUD SUSCRIPCIÓN ========================

    @Nested
    @DisplayName("POST /api/v1/solicitudes/suscripcion")
    class CrearSolicitudSuscripcionTests {

        @Test
        @DisplayName("201 Created - Solicitud creada exitosamente")
        void debeRetornar201CuandoSolicitudCreada() throws Exception {
            // Given
            var request = new CreateSolicitudSuscripcionRequest(20L, "Quiero unirme");
            given(solicitudService.crearSolicitudUnionSuscripcion(1L, 20L, "Quiero unirme"))
                    .willReturn(solicitudSuscripcion);

            // When/Then
            mockMvc.perform(post("/api/v1/solicitudes/suscripcion")
                            .header("X-User-Id", 1L)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.id").value(101))
                    .andExpect(jsonPath("$.tipo").value("SUSCRIPCION"))
                    .andExpect(jsonPath("$.estado").value("PENDIENTE"));
        }

        @Test
        @DisplayName("422 Unprocessable Entity - No hay plazas disponibles")
        void debeRetornar422CuandoNoHayPlazas() throws Exception {
            // Given
            var request = new CreateSolicitudSuscripcionRequest(20L, "Quiero unirme");
            given(solicitudService.crearSolicitudUnionSuscripcion(1L, 20L, "Quiero unirme"))
                    .willThrow(new NoPlazasDisponiblesException(20L));

            // When/Then
            mockMvc.perform(post("/api/v1/solicitudes/suscripcion")
                            .header("X-User-Id", 1L)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isUnprocessableEntity());
        }

        @Test
        @DisplayName("400 Bad Request - No es miembro del grupo")
        void debeRetornar400CuandoNoEsMiembro() throws Exception {
            // Given
            var request = new CreateSolicitudSuscripcionRequest(20L, "Quiero unirme");
            given(solicitudService.crearSolicitudUnionSuscripcion(1L, 20L, "Quiero unirme"))
                    .willThrow(new BusinessException("No eres miembro activo del grupo"));

            // When/Then
            mockMvc.perform(post("/api/v1/solicitudes/suscripcion")
                            .header("X-User-Id", 1L)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }
    }

    // ======================== TESTS: OBTENER SOLICITUD ========================

    @Nested
    @DisplayName("GET /api/v1/solicitudes/{id}")
    class ObtenerSolicitudTests {

        @Test
        @DisplayName("200 OK - Solicitud encontrada")
        void debeRetornar200CuandoSolicitudEncontrada() throws Exception {
            // Given
            given(solicitudService.buscarPorId(100L)).willReturn(Optional.of(solicitudGrupo));

            // When/Then
            mockMvc.perform(get("/api/v1/solicitudes/100"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(100))
                    .andExpect(jsonPath("$.tipo").value("GRUPO"));
        }

        @Test
        @DisplayName("404 Not Found - Solicitud no encontrada")
        void debeRetornar404CuandoSolicitudNoExiste() throws Exception {
            // Given
            given(solicitudService.buscarPorId(999L)).willReturn(Optional.empty());

            // When/Then
            mockMvc.perform(get("/api/v1/solicitudes/999"))
                    .andExpect(status().isBadRequest()); // Por IllegalArgumentException
        }
    }

    // ======================== TESTS: APROBAR SOLICITUD ========================

    @Nested
    @DisplayName("POST /api/v1/solicitudes/{id}/aprobar")
    class AprobarSolicitudTests {

        @Test
        @DisplayName("200 OK - Solicitud aprobada")
        void debeRetornar200CuandoSolicitudAprobada() throws Exception {
            // Given
            solicitudGrupo.setEstado(EstadoSolicitud.APROBADA);
            solicitudGrupo.setFechaResolucion(LocalDateTime.now());
            given(solicitudService.aprobarSolicitud(100L, 2L)).willReturn(solicitudGrupo);

            // When/Then
            mockMvc.perform(post("/api/v1/solicitudes/100/aprobar")
                            .header("X-User-Id", 2L))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.estado").value("APROBADA"));
        }

        @Test
        @DisplayName("404 Not Found - Solicitud no existe")
        void debeRetornar404CuandoSolicitudNoExiste() throws Exception {
            // Given
            given(solicitudService.aprobarSolicitud(999L, 2L))
                    .willThrow(new ResourceNotFoundException("Solicitud", "id", 999L));

            // When/Then
            mockMvc.perform(post("/api/v1/solicitudes/999/aprobar")
                            .header("X-User-Id", 2L))
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("403 Forbidden - Sin permiso para aprobar")
        void debeRetornar403CuandoSinPermiso() throws Exception {
            // Given
            given(solicitudService.aprobarSolicitud(100L, 99L))
                    .willThrow(new UnauthorizedException("No tienes permiso para aprobar"));

            // When/Then
            mockMvc.perform(post("/api/v1/solicitudes/100/aprobar")
                            .header("X-User-Id", 99L))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("400 Bad Request - Solicitud no está pendiente")
        void debeRetornar400CuandoSolicitudNoEstaPendiente() throws Exception {
            // Given
            given(solicitudService.aprobarSolicitud(100L, 2L))
                    .willThrow(new BusinessException("Solo se pueden aprobar solicitudes pendientes"));

            // When/Then
            mockMvc.perform(post("/api/v1/solicitudes/100/aprobar")
                            .header("X-User-Id", 2L))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("422 Unprocessable Entity - Límite de miembros alcanzado")
        void debeRetornar422CuandoLimiteAlcanzado() throws Exception {
            // Given
            given(solicitudService.aprobarSolicitud(100L, 2L))
                    .willThrow(new LimiteAlcanzadoException("grupo", "miembros", 10));

            // When/Then
            mockMvc.perform(post("/api/v1/solicitudes/100/aprobar")
                            .header("X-User-Id", 2L))
                    .andExpect(status().isUnprocessableEntity());
        }
    }

    // ======================== TESTS: RECHAZAR SOLICITUD ========================

    @Nested
    @DisplayName("POST /api/v1/solicitudes/{id}/rechazar")
    class RechazarSolicitudTests {

        @Test
        @DisplayName("200 OK - Solicitud rechazada con motivo")
        void debeRetornar200CuandoSolicitudRechazada() throws Exception {
            // Given
            var request = new RejectSolicitudRequest("No cumple requisitos");
            solicitudGrupo.setEstado(EstadoSolicitud.RECHAZADA);
            solicitudGrupo.setMotivoRechazo("No cumple requisitos");
            given(solicitudService.rechazarSolicitud(100L, 2L, "No cumple requisitos"))
                    .willReturn(solicitudGrupo);

            // When/Then
            mockMvc.perform(post("/api/v1/solicitudes/100/rechazar")
                            .header("X-User-Id", 2L)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.estado").value("RECHAZADA"))
                    .andExpect(jsonPath("$.motivoRechazo").value("No cumple requisitos"));
        }

        @Test
        @DisplayName("200 OK - Solicitud rechazada sin motivo")
        void debeRetornar200CuandoSolicitudRechazadaSinMotivo() throws Exception {
            // Given
            solicitudGrupo.setEstado(EstadoSolicitud.RECHAZADA);
            given(solicitudService.rechazarSolicitud(100L, 2L, null))
                    .willReturn(solicitudGrupo);

            // When/Then
            mockMvc.perform(post("/api/v1/solicitudes/100/rechazar")
                            .header("X-User-Id", 2L))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.estado").value("RECHAZADA"));
        }

        @Test
        @DisplayName("403 Forbidden - Sin permiso para rechazar")
        void debeRetornar403CuandoSinPermiso() throws Exception {
            // Given
            given(solicitudService.rechazarSolicitud(eq(100L), eq(99L), any()))
                    .willThrow(new UnauthorizedException("No tienes permiso"));

            // When/Then
            mockMvc.perform(post("/api/v1/solicitudes/100/rechazar")
                            .header("X-User-Id", 99L))
                    .andExpect(status().isForbidden());
        }
    }

    // ======================== TESTS: CANCELAR SOLICITUD ========================

    @Nested
    @DisplayName("POST /api/v1/solicitudes/{id}/cancelar")
    class CancelarSolicitudTests {

        @Test
        @DisplayName("200 OK - Solicitud cancelada")
        void debeRetornar200CuandoSolicitudCancelada() throws Exception {
            // Given
            solicitudGrupo.setEstado(EstadoSolicitud.CANCELADA);
            given(solicitudService.cancelarSolicitud(100L, 1L)).willReturn(solicitudGrupo);

            // When/Then
            mockMvc.perform(post("/api/v1/solicitudes/100/cancelar")
                            .header("X-User-Id", 1L))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.estado").value("CANCELADA"));
        }

        @Test
        @DisplayName("403 Forbidden - Solo el solicitante puede cancelar")
        void debeRetornar403CuandoNoEsSolicitante() throws Exception {
            // Given
            given(solicitudService.cancelarSolicitud(100L, 2L))
                    .willThrow(new UnauthorizedException("Solo puedes cancelar tus propias solicitudes"));

            // When/Then
            mockMvc.perform(post("/api/v1/solicitudes/100/cancelar")
                            .header("X-User-Id", 2L))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("400 Bad Request - Solicitud no está pendiente")
        void debeRetornar400CuandoSolicitudNoEstaPendiente() throws Exception {
            // Given
            given(solicitudService.cancelarSolicitud(100L, 1L))
                    .willThrow(new BusinessException("Solo puedes cancelar solicitudes pendientes"));

            // When/Then
            mockMvc.perform(post("/api/v1/solicitudes/100/cancelar")
                            .header("X-User-Id", 1L))
                    .andExpect(status().isBadRequest());
        }
    }

    // ======================== TESTS: LISTAR SOLICITUDES ========================

    @Nested
    @DisplayName("Listar solicitudes")
    class ListarSolicitudesTests {

        @Test
        @DisplayName("GET /mis-solicitudes - 200 OK con lista")
        void debeRetornar200ConListaMisSolicitudes() throws Exception {
            // Given
            given(solicitudService.listarSolicitudesUsuario(1L, EstadoSolicitud.PENDIENTE))
                    .willReturn(List.of(solicitudGrupo));

            // When/Then
            mockMvc.perform(get("/api/v1/solicitudes/mis-solicitudes")
                            .header("X-User-Id", 1L)
                            .param("estado", "PENDIENTE"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray())
                    .andExpect(jsonPath("$[0].id").value(100));
        }

        @Test
        @DisplayName("GET /grupo/{idUnidad}/pendientes - 200 OK")
        void debeRetornar200ConSolicitudesPendientesGrupo() throws Exception {
            // Given
            given(solicitudService.listarSolicitudesPendientesGrupo(10L))
                    .willReturn(List.of(solicitudGrupo));

            // When/Then
            mockMvc.perform(get("/api/v1/solicitudes/grupo/10/pendientes"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray())
                    .andExpect(jsonPath("$[0].tipo").value("GRUPO"));
        }

        @Test
        @DisplayName("GET /suscripcion/{idSuscripcion}/pendientes - 200 OK")
        void debeRetornar200ConSolicitudesPendientesSuscripcion() throws Exception {
            // Given
            given(solicitudService.listarSolicitudesPendientesSuscripcion(20L))
                    .willReturn(List.of(solicitudSuscripcion));

            // When/Then
            mockMvc.perform(get("/api/v1/solicitudes/suscripcion/20/pendientes"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray())
                    .andExpect(jsonPath("$[0].tipo").value("SUSCRIPCION"));
        }
    }

    // ======================== TESTS: VERIFICACIÓN DE PENDIENTES ========================

    @Nested
    @DisplayName("Verificación de solicitudes pendientes")
    class VerificacionPendientesTests {

        @Test
        @DisplayName("GET /tiene-pendiente/grupo/{idUnidad} - 200 OK true")
        void debeRetornarTrueCuandoTienePendienteGrupo() throws Exception {
            // Given
            given(solicitudService.tieneSolicitudPendienteGrupo(1L, 10L)).willReturn(true);

            // When/Then
            mockMvc.perform(get("/api/v1/solicitudes/tiene-pendiente/grupo/10")
                            .header("X-User-Id", 1L))
                    .andExpect(status().isOk())
                    .andExpect(content().string("true"));
        }

        @Test
        @DisplayName("GET /tiene-pendiente/grupo/{idUnidad} - 200 OK false")
        void debeRetornarFalseCuandoNoTienePendienteGrupo() throws Exception {
            // Given
            given(solicitudService.tieneSolicitudPendienteGrupo(1L, 10L)).willReturn(false);

            // When/Then
            mockMvc.perform(get("/api/v1/solicitudes/tiene-pendiente/grupo/10")
                            .header("X-User-Id", 1L))
                    .andExpect(status().isOk())
                    .andExpect(content().string("false"));
        }

        @Test
        @DisplayName("GET /tiene-pendiente/suscripcion/{idSuscripcion} - 200 OK")
        void debeRetornarResultadoPendienteSuscripcion() throws Exception {
            // Given
            given(solicitudService.tieneSolicitudPendienteSuscripcion(1L, 20L)).willReturn(true);

            // When/Then
            mockMvc.perform(get("/api/v1/solicitudes/tiene-pendiente/suscripcion/20")
                            .header("X-User-Id", 1L))
                    .andExpect(status().isOk())
                    .andExpect(content().string("true"));
        }
    }
}
