package com.alberti.joinly.config;

import com.alberti.joinly.security.CustomUserDetailsService;
import com.alberti.joinly.security.JwtAccessDeniedHandler;
import com.alberti.joinly.security.JwtAuthenticationEntryPoint;
import com.alberti.joinly.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

/**
 * Configuración central de Spring Security para Joinly.
 * <p>
 * Esta clase configura:
 * <ul>
 *   <li>Autenticación JWT stateless</li>
 *   <li>Configuración CORS para el frontend Angular</li>
 *   <li>Definición de endpoints públicos vs privados</li>
 *   <li>Codificación de contraseñas con BCrypt</li>
 *   <li>Manejo de errores de autenticación y autorización</li>
 * </ul>
 *
 * @author Joinly Team
 * @version 1.0
 * @since 2025
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true, securedEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final JwtAccessDeniedHandler jwtAccessDeniedHandler;
    private final CustomUserDetailsService userDetailsService;
    private final CorsProperties corsProperties;

    /**
     * Rutas públicas que no requieren autenticación.
     */
    private static final String[] PUBLIC_ENDPOINTS = {
            "/api/v1/auth/**",
            "/swagger-ui/**",
            "/swagger-ui.html",
            "/v3/api-docs/**",
            "/swagger-resources/**",
            "/webjars/**",
            "/actuator/health",
            "/actuator/info",
            "/error"
    };

    /**
     * Configura la cadena de filtros de seguridad HTTP.
     * <p>
     * Configuraciones aplicadas:
     * <ul>
     *   <li>CSRF deshabilitado (API stateless con JWT)</li>
     *   <li>Autenticación stateless sin sesiones</li>
     *   <li>CORS habilitado con configuración personalizada</li>
     *   <li>Filtro JWT antes del filtro de autenticación por usuario/password</li>
     * </ul>
     *
     * @param http Builder de configuración HTTP
     * @return Cadena de filtros configurada
     * @throws Exception Si ocurre un error durante la configuración
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                // Deshabilitar CSRF ya que usamos JWT (stateless)
                .csrf(AbstractHttpConfigurer::disable)
                
                // Configurar CORS
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                
                // Configurar autorización de peticiones
                .authorizeHttpRequests(auth -> auth
                        // Endpoints públicos
                        .requestMatchers(PUBLIC_ENDPOINTS).permitAll()
                        
                        // Endpoints de solo lectura públicos (GET)
                        .requestMatchers(HttpMethod.GET, "/api/v1/servicios/**").permitAll()
                        
                        // Endpoints que requieren rol de administrador
                        .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                        
                        // Endpoints que requieren rol de agente o superior
                        .requestMatchers("/api/v1/soporte/**").hasAnyRole("AGENTE", "ADMIN")
                        
                        // Todos los demás endpoints requieren autenticación
                        .anyRequest().authenticated()
                )
                
                // Configurar política de sesiones (stateless)
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                
                // Configurar proveedor de autenticación
                .authenticationProvider(authenticationProvider())
                
                // Añadir filtro JWT antes del filtro de autenticación por defecto
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                
                // Configurar manejo de excepciones
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                        .accessDeniedHandler(jwtAccessDeniedHandler)
                )
                
                // Deshabilitar headers de frame para H2 console (solo desarrollo)
                .headers(headers -> headers
                        .frameOptions(frame -> frame.sameOrigin())
                )
                
                .build();
    }

    /**
     * Configura CORS para permitir peticiones desde el frontend Angular.
     * <p>
     * La configuración se lee desde application.properties para facilitar
     * cambios entre entornos (desarrollo, staging, producción).
     *
     * @return Fuente de configuración CORS
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        var configuration = new CorsConfiguration();
        
        // Orígenes permitidos (frontend Angular) - desde CorsProperties
        configuration.setAllowedOrigins(corsProperties.allowedOrigins());
        
        // Métodos HTTP permitidos
        configuration.setAllowedMethods(corsProperties.allowedMethods());
        
        // Headers permitidos
        configuration.setAllowedHeaders(corsProperties.allowedHeaders());
        
        // Headers expuestos al frontend
        configuration.setExposedHeaders(corsProperties.exposedHeaders());
        
        // Permitir credenciales (cookies, Authorization header)
        configuration.setAllowCredentials(true);
        
        // Tiempo de caché para preflight requests
        configuration.setMaxAge(corsProperties.maxAge());

        var source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        
        return source;
    }

    /**
     * Configura el proveedor de autenticación con BCrypt para contraseñas.
     *
     * @return Proveedor de autenticación configurado
     */
    @Bean
    public AuthenticationProvider authenticationProvider() {
        var authProvider = new DaoAuthenticationProvider(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    /**
     * Proporciona el AuthenticationManager para uso en el AuthService.
     *
     * @param config Configuración de autenticación
     * @return AuthenticationManager configurado
     * @throws Exception Si ocurre un error al obtener el manager
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    /**
     * Configura el codificador de contraseñas BCrypt.
     * <p>
     * BCrypt es un algoritmo de hashing diseñado específicamente para contraseñas,
     * con factor de trabajo configurable para resistir ataques de fuerza bruta.
     * El strength por defecto es 10 (2^10 = 1024 iteraciones).
     *
     * @return PasswordEncoder BCrypt
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
