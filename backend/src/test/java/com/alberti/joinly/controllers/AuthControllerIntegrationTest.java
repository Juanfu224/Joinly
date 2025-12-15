package com.alberti.joinly.controllers;

import com.alberti.joinly.dto.auth.LoginRequest;
import com.alberti.joinly.dto.auth.RefreshTokenRequest;
import com.alberti.joinly.dto.auth.RegisterRequest;
import com.alberti.joinly.entities.usuario.Usuario;
import com.alberti.joinly.entities.enums.EstadoUsuario;
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

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Tests de integración para AuthController.
 * <p>
 * Prueba el flujo completo de autenticación:
 * - Registro de usuarios
 * - Login con credenciales
 * - Renovación de tokens JWT
 * <p>
 * Utiliza H2 en memoria para tests aislados y reproducibles.
 *
 * @author Joinly Team
 * @version 1.0
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@DisplayName("AuthController - Tests de Integración")
class AuthControllerIntegrationTest {

    private static final String API_AUTH = "/api/v1/auth";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Usuario usuarioExistente;

    @BeforeEach
    void setUp() {
        // Limpiar usuarios de tests anteriores
        usuarioRepository.deleteAll();
        
        // Crear un usuario existente para tests de login
        usuarioExistente = Usuario.builder()
                .nombre("Usuario Test")
                .email("test@joinly.com")
                .password(passwordEncoder.encode("Password123!"))
                .fechaRegistro(LocalDateTime.now())
                .estado(EstadoUsuario.ACTIVO)
                .emailVerificado(false)
                .rol(com.alberti.joinly.entities.enums.RolUsuario.USER)
                .build();
        usuarioExistente = usuarioRepository.save(usuarioExistente);
    }

    // ==================== TESTS DE REGISTRO ====================

    @Nested
    @DisplayName("POST /api/v1/auth/register - Registro de usuarios")
    class RegistroTests {

        @Test
        @DisplayName("✅ Debe registrar usuario exitosamente y retornar tokens JWT")
        void registroExitoso() throws Exception {
            var request = new RegisterRequest(
                    "Nuevo Usuario",
                    "nuevo@joinly.com",
                    "SecurePass123!"
            );

            mockMvc.perform(post(API_AUTH + "/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.id").isNumber())
                    .andExpect(jsonPath("$.nombre").value("Nuevo Usuario"))
                    .andExpect(jsonPath("$.email").value("nuevo@joinly.com"))
                    .andExpect(jsonPath("$.accessToken").isNotEmpty())
                    .andExpect(jsonPath("$.refreshToken").isNotEmpty())
                    .andExpect(jsonPath("$.tokenType").value("Bearer"))
                    .andExpect(jsonPath("$.expiresIn").isNumber());
        }

        @Test
        @DisplayName("❌ Debe retornar 409 si el email ya está registrado")
        void registroEmailDuplicado() throws Exception {
            var request = new RegisterRequest(
                    "Otro Usuario",
                    "test@joinly.com", // Email ya existente
                    "OtraPassword123!"
            );

            mockMvc.perform(post(API_AUTH + "/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isConflict())
                    .andExpect(jsonPath("$.message", containsString("Ya existe")));
        }

        @Test
        @DisplayName("❌ Debe retornar 400 si el email tiene formato inválido")
        void registroEmailInvalido() throws Exception {
            var request = new RegisterRequest(
                    "Usuario Malo",
                    "email-sin-arroba",
                    "Password123!"
            );

            mockMvc.perform(post(API_AUTH + "/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("❌ Debe retornar 400 si la contraseña es muy corta")
        void registroPasswordCorta() throws Exception {
            var request = new RegisterRequest(
                    "Usuario Malo",
                    "malo@test.com",
                    "123" // Menos de 8 caracteres
            );

            mockMvc.perform(post(API_AUTH + "/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("❌ Debe retornar 400 si falta el nombre")
        void registroSinNombre() throws Exception {
            String jsonSinNombre = """
                    {
                        "email": "nuevo@test.com",
                        "password": "Password123!"
                    }
                    """;

            mockMvc.perform(post(API_AUTH + "/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(jsonSinNombre))
                    .andExpect(status().isBadRequest());
        }
    }

    // ==================== TESTS DE LOGIN ====================

    @Nested
    @DisplayName("POST /api/v1/auth/login - Inicio de sesión")
    class LoginTests {

        @Test
        @DisplayName("✅ Debe iniciar sesión exitosamente con credenciales válidas")
        void loginExitoso() throws Exception {
            var request = new LoginRequest(
                    "test@joinly.com",
                    "Password123!"
            );

            mockMvc.perform(post(API_AUTH + "/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(usuarioExistente.getId()))
                    .andExpect(jsonPath("$.email").value("test@joinly.com"))
                    .andExpect(jsonPath("$.accessToken").isNotEmpty())
                    .andExpect(jsonPath("$.refreshToken").isNotEmpty())
                    .andExpect(jsonPath("$.tokenType").value("Bearer"));
        }

        @Test
        @DisplayName("❌ Debe retornar 403 con contraseña incorrecta")
        void loginPasswordIncorrecta() throws Exception {
            var request = new LoginRequest(
                    "test@joinly.com",
                    "PasswordIncorrecta!"
            );

            mockMvc.perform(post(API_AUTH + "/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isForbidden()); // 403 - Spring Security responde con Forbidden
        }

        @Test
        @DisplayName("❌ Debe retornar 403 si el usuario no existe")
        void loginUsuarioNoExiste() throws Exception {
            var request = new LoginRequest(
                    "noexiste@joinly.com",
                    "Password123!"
            );

            mockMvc.perform(post(API_AUTH + "/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isForbidden()); // 403 - Spring Security responde con Forbidden
        }

        @Test
        @DisplayName("❌ Debe retornar 400 si el email está vacío")
        void loginEmailVacio() throws Exception {
            String jsonSinEmail = """
                    {
                        "email": "",
                        "password": "Password123!"
                    }
                    """;

            mockMvc.perform(post(API_AUTH + "/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(jsonSinEmail))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("❌ Debe retornar error si el usuario está suspendido")
        void loginUsuarioSuspendido() throws Exception {
            // Suspender al usuario
            usuarioExistente.setEstado(EstadoUsuario.SUSPENDIDO);
            usuarioRepository.save(usuarioExistente);

            var request = new LoginRequest(
                    "test@joinly.com",
                    "Password123!"
            );

            mockMvc.perform(post(API_AUTH + "/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().is4xxClientError()); // 401 o 422
        }
    }

    // ==================== TESTS DE REFRESH TOKEN ====================

    @Nested
    @DisplayName("POST /api/v1/auth/refresh - Renovación de tokens")
    class RefreshTokenTests {

        @Test
        @DisplayName("✅ Debe renovar tokens con refresh token válido")
        void refreshExitoso() throws Exception {
            // Primero hacer login para obtener tokens
            var loginRequest = new LoginRequest("test@joinly.com", "Password123!");
            
            MvcResult loginResult = mockMvc.perform(post(API_AUTH + "/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(loginRequest)))
                    .andExpect(status().isOk())
                    .andReturn();

            // Extraer el refresh token de la respuesta
            String responseJson = loginResult.getResponse().getContentAsString();
            String refreshToken = objectMapper.readTree(responseJson).get("refreshToken").asText();

            // Usar el refresh token para obtener nuevos tokens
            var refreshRequest = new RefreshTokenRequest(refreshToken);

            mockMvc.perform(post(API_AUTH + "/refresh")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(refreshRequest)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.accessToken").isNotEmpty())
                    .andExpect(jsonPath("$.refreshToken").isNotEmpty())
                    .andExpect(jsonPath("$.tokenType").value("Bearer"));
        }

        @Test
        @DisplayName("❌ Debe retornar 403 con refresh token inválido")
        void refreshTokenInvalido() throws Exception {
            var request = new RefreshTokenRequest("token-invalido-inventado");

            mockMvc.perform(post(API_AUTH + "/refresh")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isForbidden()); // 403 - Spring Security responde con Forbidden para tokens inválidos
        }

        @Test
        @DisplayName("❌ Debe retornar 400 si no se envía refresh token")
        void refreshSinToken() throws Exception {
            String jsonVacio = """
                    {
                        "refreshToken": ""
                    }
                    """;

            mockMvc.perform(post(API_AUTH + "/refresh")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(jsonVacio))
                    .andExpect(status().isBadRequest());
        }
    }

    // ==================== TESTS DE VERIFICACIÓN DE EMAIL ====================

    @Nested
    @DisplayName("POST /api/v1/auth/verify-email/{id} - Verificación de email")
    class VerifyEmailTests {

        @Test
        @DisplayName("✅ Debe verificar email exitosamente")
        void verificarEmailExitoso() throws Exception {
            mockMvc.perform(post(API_AUTH + "/verify-email/" + usuarioExistente.getId()))
                    .andExpect(status().isOk());
            
            // Verificar que el email fue marcado como verificado
            Usuario updated = usuarioRepository.findById(usuarioExistente.getId()).orElseThrow();
            Assertions.assertTrue(updated.getEmailVerificado());
        }

        @Test
        @DisplayName("❌ Debe retornar 400 si el usuario no existe")
        void verificarEmailUsuarioNoExiste() throws Exception {
            mockMvc.perform(post(API_AUTH + "/verify-email/999999"))
                    .andExpect(status().isBadRequest()); // 400 - Usuario no encontrado
        }
    }
}
