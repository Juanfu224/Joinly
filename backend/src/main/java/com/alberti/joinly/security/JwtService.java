package com.alberti.joinly.security;

import com.alberti.joinly.config.JwtProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;
import java.util.Map;
import java.util.function.Function;

/**
 * Servicio para la gestión de tokens JWT (JSON Web Tokens).
 * <p>
 * Proporciona funcionalidades para:
 * <ul>
 *   <li>Generación de access tokens y refresh tokens</li>
 *   <li>Validación de tokens</li>
 *   <li>Extracción de claims del token</li>
 * </ul>
 * <p>
 * Los tokens se firman usando el algoritmo HS256 (HMAC-SHA256) con una
 * clave secreta configurada en application.properties.
 *
 * @author Joinly Team
 * @version 1.0
 * @since 2025
 */
@Service
@Slf4j
public class JwtService {

    private final SecretKey secretKey;
    private final long accessTokenExpiration;
    private final long refreshTokenExpiration;

    /**
     * Constructor que inicializa el servicio JWT con la configuración proporcionada.
     *
     * @param jwtProperties Propiedades JWT cargadas desde application.properties
     */
    public JwtService(JwtProperties jwtProperties) {
        this.secretKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtProperties.secretKey()));
        this.accessTokenExpiration = jwtProperties.accessTokenExpiration();
        this.refreshTokenExpiration = jwtProperties.refreshTokenExpiration();
    }

    /**
     * Genera un access token JWT para el usuario especificado.
     *
     * @param userDetails Detalles del usuario autenticado
     * @return Token JWT firmado como String
     */
    public String generateAccessToken(UserDetails userDetails) {
        return generateToken(Map.of("type", "access"), userDetails, accessTokenExpiration);
    }

    /**
     * Genera un access token JWT con claims adicionales.
     *
     * @param extraClaims Claims adicionales a incluir en el token
     * @param userDetails Detalles del usuario autenticado
     * @return Token JWT firmado como String
     */
    public String generateAccessToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        var claims = new java.util.HashMap<>(extraClaims);
        claims.put("type", "access");
        return generateToken(claims, userDetails, accessTokenExpiration);
    }

    /**
     * Genera un refresh token JWT para renovación de sesión.
     *
     * @param userDetails Detalles del usuario autenticado
     * @return Refresh token JWT firmado como String
     */
    public String generateRefreshToken(UserDetails userDetails) {
        return generateToken(Map.of("type", "refresh"), userDetails, refreshTokenExpiration);
    }

    /**
     * Genera un token JWT con los parámetros especificados.
     *
     * @param extraClaims Claims adicionales
     * @param userDetails Detalles del usuario
     * @param expiration  Tiempo de expiración en milisegundos
     * @return Token JWT firmado
     */
    private String generateToken(Map<String, Object> extraClaims, UserDetails userDetails, long expiration) {
        var now = Instant.now();
        return Jwts.builder()
                .claims(extraClaims)
                .subject(userDetails.getUsername())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusMillis(expiration)))
                .signWith(secretKey, Jwts.SIG.HS256)
                .compact();
    }

    /**
     * Extrae el email (subject) del token JWT.
     *
     * @param token Token JWT
     * @return Email del usuario contenido en el token
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Extrae la fecha de expiración del token.
     *
     * @param token Token JWT
     * @return Fecha de expiración
     */
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * Extrae un claim específico del token usando un resolver personalizado.
     *
     * @param token          Token JWT
     * @param claimsResolver Función para extraer el claim deseado
     * @param <T>            Tipo del claim a extraer
     * @return Valor del claim extraído
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        var claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Extrae todos los claims del token JWT.
     *
     * @param token Token JWT
     * @return Objeto Claims con toda la información del token
     * @throws JwtException si el token es inválido o ha expirado
     */
    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * Valida si un token JWT es válido para el usuario especificado.
     * <p>
     * Un token es válido si:
     * <ul>
     *   <li>El subject (email) coincide con el username del UserDetails</li>
     *   <li>El token no ha expirado</li>
     *   <li>La firma del token es correcta</li>
     * </ul>
     *
     * @param token       Token JWT a validar
     * @param userDetails Detalles del usuario contra el que validar
     * @return {@code true} si el token es válido, {@code false} en caso contrario
     */
    public boolean isTokenValid(String token, UserDetails userDetails) {
        try {
            var username = extractUsername(token);
            return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
        } catch (ExpiredJwtException e) {
            log.debug("Token expirado para usuario: {}", userDetails.getUsername());
            return false;
        } catch (JwtException e) {
            log.warn("Token JWT inválido: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Verifica si el token ha expirado.
     *
     * @param token Token JWT
     * @return {@code true} si el token ha expirado
     */
    public boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    /**
     * Verifica si un token es de tipo refresh.
     *
     * @param token Token JWT
     * @return {@code true} si es un refresh token
     */
    public boolean isRefreshToken(String token) {
        try {
            var type = extractClaim(token, claims -> claims.get("type", String.class));
            return "refresh".equals(type);
        } catch (JwtException e) {
            return false;
        }
    }

    /**
     * Obtiene el tiempo restante de validez del token en segundos.
     *
     * @param token Token JWT
     * @return Segundos restantes hasta la expiración, o 0 si ya expiró
     */
    public long getRemainingValidity(String token) {
        try {
            var expiration = extractExpiration(token);
            var now = new Date();
            return Math.max(0, (expiration.getTime() - now.getTime()) / 1000);
        } catch (JwtException e) {
            return 0;
        }
    }
}
