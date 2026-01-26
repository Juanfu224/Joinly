# ADR-005: Por qué JWT con Refresh Tokens

## Status

Accepted

## Context

Joinly necesita autenticación de usuarios para proteger recursos y APIs. Los requisitos son:

1. Autenticación segura de usuarios
2. Soporte para sesiones largas sin re-login constante
3. Protección contra tokens comprometidos
4. Soporte para múltiples dispositivos
5. Revocación de tokens (logout)
6. Performance (no consultar BD en cada request)

Las opciones de autenticación consideradas:

1. **Session-Based (Cookies de sesión)**
2. **JWT (Access Token Only)**
3. **JWT (Access + Refresh Tokens)**
4. **API Keys**
5. **OAuth 2.0**

## Decision

Hemos elegido **JWT con Access Token de corto plazo y Refresh Token de largo plazo**.

### Arquitectura:

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│  Browser    │         │   Server    │         │   Database  │
└──────┬──────┘         └──────┬──────┘         └──────┬──────┘
       │                       │                       │
       │ 1. Login             │                       │
       ├──────────────────────>│                       │
       │ (email/password)      │                       │
       │                       │                       │
       │                       │ 2. Verify credentials │
       │                       ├──────────────────────>│
       │                       │                       │
       │                       │ 3. Return user       │
       │                       │<──────────────────────┤
       │                       │                       │
       │                       │ 4. Generate tokens    │
       │                       │                       │
       │ 5. Response {         │                       │
       │    accessToken,       │                       │
       │    refreshToken       │                       │
       │  }                    │                       │
       │<──────────────────────┤                       │
       │                       │                       │
       │ 6. Save accessToken  │                       │
       │  in sessionStorage    │                       │
       │<──────────────────────┤                       │
       │                       │                       │
       │ 7. Set refreshToken  │                       │
       │  in httpOnly cookie   │                       │
       │<──────────────────────┤                       │
```

### Tokens:

**Access Token**:
- **Duración**: 15 minutos (900000 ms)
- **Almacenamiento**: sessionStorage (frontend)
- **Contenido**: UserID, roles, claims, exp
- **Uso**: Cada request autenticado

```json
{
  "sub": "1234567890",
  "nombre": "Juan Fuentes",
  "email": "juan@joinly.com",
  "roles": ["USER", "ADMIN"],
  "iat": 1516239022,
  "exp": 1516239922
}
```

**Refresh Token**:
- **Duración**: 7 días (604800000 ms)
- **Almacenamiento**: httpOnly cookie (seguro contra XSS)
- **Contenido**: UserID, unique ID, exp
- **Uso**: Obtener nuevo access token sin re-login

```json
{
  "sub": "1234567890",
  "jti": "unique-token-id",
  "exp": 1516843822
}
```

### Razones:

1. **Statelessness y Scalability**

   JWT es stateless - el servidor no necesita almacenar sesión:

   ```java
   // No necesitamos guardar sesión en BD/Redis
   // Solo validamos el token en cada request
   String userId = jwtTokenProvider.getUserIdFromToken(token);
   ```

   Esto permite:
   - Horizontal scaling sin Session Sync
   - Sin necesidad de Redis/Memcached para sesiones
   - Menos requests a BD por sesión

2. **Performance Superior**

   Validar JWT es O(1) - solo requiere verificación de firma:

   ```java
   // O(1) - Validación de JWT
   boolean isValid = jwtTokenProvider.validateToken(token);
   
   // vs Session-Based: O(1) pero requiere lookup en BD/Redis
   // String sessionId = extractSessionId(request);
   // Session session = sessionRepository.findById(sessionId);
   ```

3. **Mobile-Friendly**

   JWT funciona bien en apps móviles:

   - No depende de cookies (puede almacenarse en AsyncStorage)
   - Sin problemas de CORS
   - Funciona en webviews

4. **Refresh Tokens Mitigan Compromisos**

   Si un access token es comprometido:
   - Expira en 15 minutos
   - Damage limitado a ese tiempo

   Si un refresh token es comprometido:
   - Puede ser revocado en BD
   - Se requiere autenticación completa para nuevo refresh

5. **Cross-Domain Support**

   JWT funciona en múltiples dominios:

   ```typescript
   // Frontend en joinly.studio puede autenticar a API en api.joinly.studio
   // Solo necesita enviar JWT en Authorization header
   const headers = {
     'Authorization': `Bearer ${accessToken}`
   };
   ```

6. **Built-in Claims and Metadata**

   JWT puede incluir información útil:

   ```json
   {
     "sub": "1234567890",
     "nombre": "Juan Fuentes",
     "email": "juan@joinly.com",
     "roles": ["USER", "ADMIN"],
     "unidadId": 456,
     "iat": 1516239022,
     "exp": 1516239922
   }
   ```

## Configuración en el Proyecto

### JwtTokenProvider

```java
@Component
public class JwtTokenProvider {
    
    @Value("${jwt.secret-key}")
    private String secretKey;
    
    @Value("${jwt.access-token-expiration}")
    private long accessTokenExpiration;
    
    @Value("${jwt.refresh-token-expiration}")
    private long refreshTokenExpiration;
    
    public String generateAccessToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        Usuario usuario = (Usuario) userDetails;
        claims.put("nombre", usuario.getNombre());
        claims.put("email", usuario.getEmail());
        claims.put("roles", usuario.getRoles().stream()
            .map(Rol::getNombre)
            .collect(Collectors.toList()));
        
        return Jwts.builder()
            .setClaims(claims)
            .setSubject(usuario.getId().toString())
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + accessTokenExpiration))
            .signWith(SignatureAlgorithm.HS512, secretKey)
            .compact();
    }
    
    public String generateRefreshToken(UserDetails userDetails) {
        String jti = UUID.randomUUID().toString();
        
        return Jwts.builder()
            .setSubject(userDetails.getUsername())
            .setId(jti) // Unique ID for revocation
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + refreshTokenExpiration))
            .signWith(SignatureAlgorithm.HS512, secretKey)
            .compact();
    }
    
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
    
    public Long getUserIdFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
            .setSigningKey(secretKey)
            .build()
            .parseClaimsJws(token)
            .getBody();
        
        return Long.parseLong(claims.getSubject());
    }
    
    public List<String> getRolesFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
            .setSigningKey(secretKey)
            .build()
            .parseClaimsJws(token)
            .getBody();
        
        return (List<String>) claims.get("roles");
    }
}
```

### Refresh Token Storage en BD

```java
@Entity
@Table(name = "tokens")
public class Token {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String jti; // JWT ID
    
    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;
    
    @Column(nullable = false)
    private LocalDateTime expiryDate;
    
    @Column(nullable = false)
    private boolean revocado = false;
    
    // Getters, setters...
}

@Service
public class TokenService {
    private final TokenRepository tokenRepository;
    
    public Token saveRefreshToken(String jti, Usuario usuario, long expirationMs) {
        Token token = new Token();
        token.setJti(jti);
        token.setUsuario(usuario);
        token.setExpiryDate(LocalDateTime.now().plus(expirationMs, ChronoUnit.MILLIS));
        return tokenRepository.save(token);
    }
    
    public boolean isRefreshTokenValid(String jti) {
        Optional<Token> token = tokenRepository.findByJti(jti);
        
        if (token.isEmpty()) {
            return false;
        }
        
        Token t = token.get();
        
        if (t.isRevocado()) {
            return false;
        }
        
        if (t.getExpiryDate().isBefore(LocalDateTime.now())) {
            return false;
        }
        
        return true;
    }
    
    public void revokeRefreshToken(String jti) {
        tokenRepository.findByJti(jti).ifPresent(token -> {
            token.setRevocado(true);
            tokenRepository.save(token);
        });
    }
}
```

### Refresh Endpoint

```java
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken(
            @CookieValue(name = "refreshToken", required = false) String refreshToken,
            HttpServletResponse response) {
        
        if (refreshToken == null) {
            throw new UnauthorizedException("Refresh token not found");
        }
        
        // Validar refresh token
        Claims claims = jwtTokenProvider.parseClaims(refreshToken);
        String jti = claims.getId();
        
        if (!tokenService.isRefreshTokenValid(jti)) {
            throw new UnauthorizedException("Invalid or expired refresh token");
        }
        
        // Obtener usuario
        Long usuarioId = Long.parseLong(claims.getSubject());
        Usuario usuario = usuarioRepository.findById(usuarioId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        UserDetails userDetails = new UserDetailsImpl(usuario);
        
        // Generar nuevo access token
        String newAccessToken = jwtTokenProvider.generateAccessToken(userDetails);
        
        // Generar nuevo refresh token y rotar
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(userDetails);
        String newJti = jwtTokenProvider.parseClaims(newRefreshToken).getId();
        
        tokenService.revokeRefreshToken(jti); // Revocar viejo
        tokenService.saveRefreshToken(newJti, usuario, refreshTokenExpiration);
        
        // Set new refresh token en httpOnly cookie
        Cookie cookie = new Cookie("refreshToken", newRefreshToken);
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setPath("/");
        cookie.setMaxAge((int) (refreshTokenExpiration / 1000));
        response.addCookie(cookie);
        
        return ResponseEntity.ok(new AuthResponse(newAccessToken, usuario));
    }
}
```

### Revocación (Logout)

```java
@PostMapping("/logout")
public ResponseEntity<Void> logout(
        @CookieValue(name = "refreshToken", required = false) String refreshToken,
        HttpServletResponse response) {
    
    if (refreshToken != null) {
        Claims claims = jwtTokenProvider.parseClaims(refreshToken);
        String jti = claims.getId();
        tokenService.revokeRefreshToken(jti);
    }
    
    // Clear refresh token cookie
    Cookie cookie = new Cookie("refreshToken", "");
    cookie.setHttpOnly(true);
    cookie.setSecure(true);
    cookie.setPath("/");
    cookie.setMaxAge(0);
    response.addCookie(cookie);
    
    return ResponseEntity.noContent().build();
}
```

## Consecuencias

### Positivas:

1. **Statelessness**
   - Server no necesita mantener sesión
   - Horizontal scaling sin problemas
   - Menos load en BD

2. **Performance**
   - Validación O(1) de tokens
   - Sin requests adicionales de sesión
   - Cache-friendly

3. **Mobile-Friendly**
   - Funciona bien en apps móviles
   - No depende de cookies
   - Sin problemas de CORS

4. **Seguridad**
   - Access tokens de corta duración (15 min)
   - Refresh tokens revocables
   - Rotación de refresh tokens

5. **Cross-Domain**
   - Funciona en múltiples dominios
   - Ideal para microservicios
   - Flexible arquitectónicamente

### Negativas:

1. **Token Size**
   - JWT es más grande que session ID (~2-3KB vs ~100 bytes)
   - Más bandwidth usado en cada request
   - Más storage en cookies

2. **Revocation Compleja**
   - Access tokens no pueden revocarse inmediatamente
   - Solo pueden revocarse cuando expiran
   - Requiere blacklisting para revocación inmediata

3. **Refresh Token Storage**
   - Requiere BD para refresh tokens
   - Añade complejidad
   - Requiere cleanup de tokens expirados

## Alternativas Consideradas

### Session-Based (Cookies de sesión)

**Ventajas:**
- Revocación inmediata
- Cookies httpOnly protegen contra XSS
- Más simple conceptualmente

**Desventajas:**
- Server needs to store sessions
- Scaling requiere session sync
- Menor mobile-friendly
- Cross-domain problemático

**No elegido porque:**
- JWT es más stateless y escalable
- Joinly planea mobile app
- JWT tiene mejor performance

### JWT (Access Token Only, sin Refresh)

**Ventajas:**
- Más simple
- Sin refresh token storage

**Desventajas:**
- Tokens de larga duración son más peligrosos
- Tokens comprometidos tienen mayor ventana de tiempo
- Logout no puede revocar tokens

**No elegido porque:**
- Access tokens de corta duración + refresh es más seguro
- Refresh tokens mitigan compromisos

### API Keys

**Ventajas:**
- Simple de implementar
- Permite rotación

**Desventajas:**
- No lleva información de usuario
- No permite roles/claims
- No expira automáticamente
- Revocación compleja

**No elegido porque:**
- JWT es más feature-rich
- JWT permite carries de metadata (roles, claims)

### OAuth 2.0

**Ventajas:**
- Standard industrial
- Permite third-party apps
- Gran ecosistema

**Desventajas:**
- Overkill para single-app authentication
- Más complejo
- Requiere OAuth server (o usar terceros)

**No elegido porque:**
- JWT es suficiente para autenticación
- OAuth 2.0 es para authorization, no authentication

## Referencias

- [JWT.io - Introduction to JWT](https://jwt.io/introduction)
- [RFC 7519 - JSON Web Token (JWT)](https://tools.ietf.org/html/rfc7519)
- [OWASP JSON Web Token Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)
- [The Ultimate Guide to JWT Authentication](https://blog.logrocket.com/the-ultimate-guide-to-jwt-authentication/)

---

**Fecha de Decisión:** 2024-09-01
**Decidido por:** Juan Alberto Fuentes
**Estado:** Accepted
