# ADR-004: Por qué AES-256-GCM para Credenciales

## Status

Accepted

## Context

Joinly necesita almacenar credenciales de acceso a servicios de suscripción (Netflix, Spotify, etc.) de manera segura. Los requisitos de seguridad son:

- Protección contra accesos no autorizados a la base de datos
- Protección contra lecturas de logs o dumps de base de datos
- Protección contra exfiltración de datos
- Compliance con regulaciones de privacidad (GDPR)
- Posibilidad de rotación de claves

Las opciones de encriptación consideradas:

1. **Hashing (SHA-256, bcrypt, Argon2)**
2. **Symmetric Encryption (AES, ChaCha20)**
3. **Asymmetric Encryption (RSA, ECC)**
4. **Database-Level Encryption (MySQL Enterprise Encryption)**
5. **Third-Party Secrets Managers (AWS KMS, HashiCorp Vault)**

## Decision

Hemos elegido **AES-256-GCM para encriptación de credenciales**.

### Razones:

1. **Standard de Seguridad Máximo**

   AES-256-GCM es el estándar de encriptación aprobado por:
   - **NSA** para top secret information
   - **NIST** como estándar FIPS 197
   - **PCI DSS** para compliance en tarjetas de crédito
   - **GDPR** como medida técnica adecuada

2. **Performance Superior**

   AES-256-GCM tiene aceleración de hardware en CPUs modernas (AES-NI):

   ```java
   // Benchmark: Encriptación de 1000 credenciales
   // Sin AES-NI: ~500ms
   // Con AES-NI: ~50ms (10x más rápido)
   ```

3. **Authenticated Encryption (AEAD)**

   GCM (Galois/Counter Mode) provee:
   - **Confidentiality**: Datos no pueden leerse sin la clave
   - **Integrity**: Datos no pueden modificarse sin detectarse
   - **Authentication**: Datos son auténticos y no tampered

   ```java
   // AES-256-GCM automáticamente genera y verifica un tag de autenticación
   byte[] ciphertext = cipher.doFinal(plaintext);
   // ciphertext = encrypted data + authentication tag
   ```

4. **Simplemente Implementable en Java**

   Java 25 (y versiones anteriores desde Java 8) tiene soporte nativo para AES-256-GCM:

   ```java
   import javax.crypto.Cipher;
   import javax.crypto.KeyGenerator;
   import javax.crypto.SecretKey;
   import javax.crypto.spec.GCMParameterSpec;
   import javax.crypto.spec.SecretKeySpec;
   import java.nio.charset.StandardCharsets;
   import java.security.SecureRandom;
   import java.util.Base64;
   
   public class EncryptionService {
       private static final String ALGORITHM = "AES/GCM/NoPadding";
       private static final int GCM_IV_LENGTH = 12; // 96 bits
       private static final int GCM_TAG_LENGTH = 128; // 128 bits
       private final SecretKey key;
       
       public EncryptionService(String keyBase64) {
           byte[] keyBytes = Base64.getDecoder().decode(keyBase64);
           this.key = new SecretKeySpec(keyBytes, "AES");
       }
       
       public String encrypt(String plaintext) throws Exception {
           Cipher cipher = Cipher.getInstance(ALGORITHM);
           
           // Generar IV único para cada encriptación
           byte[] iv = new byte[GCM_IV_LENGTH];
           new SecureRandom().nextBytes(iv);
           
           GCMParameterSpec spec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
           cipher.init(Cipher.ENCRYPT_MODE, key, spec);
           
           byte[] ciphertext = cipher.doFinal(
               plaintext.getBytes(StandardCharsets.UTF_8)
           );
           
           // Concatenar IV + ciphertext (IV no es secreto, debe ser único)
           byte[] encryptedBytes = new byte[iv.length + ciphertext.length];
           System.arraycopy(iv, 0, encryptedBytes, 0, iv.length);
           System.arraycopy(ciphertext, 0, encryptedBytes, iv.length, ciphertext.length);
           
           return Base64.getEncoder().encodeToString(encryptedBytes);
       }
       
       public String decrypt(String encryptedBase64) throws Exception {
           byte[] encryptedBytes = Base64.getDecoder().decode(encryptedBase64);
           
           // Extraer IV
           byte[] iv = new byte[GCM_IV_LENGTH];
           System.arraycopy(encryptedBytes, 0, iv, 0, iv.length);
           
           // Extraer ciphertext
           byte[] ciphertext = new byte[encryptedBytes.length - GCM_IV_LENGTH];
           System.arraycopy(encryptedBytes, iv.length, ciphertext, 0, ciphertext.length);
           
           Cipher cipher = Cipher.getInstance(ALGORITHM);
           GCMParameterSpec spec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
           cipher.init(Cipher.DECRYPT_MODE, key, spec);
           
           byte[] plaintext = cipher.doFinal(ciphertext);
           return new String(plaintext, StandardCharsets.UTF_8);
       }
   }
   ```

5. **Rotación de Claves Posible**

   Si una clave está comprometida, puede rotarse:

   ```java
   @Scheduled(cron = "0 0 0 1 1 ?") // Cada 1 de enero a medianoche
   public void rotateEncryptionKeys() {
       // Generar nueva clave
       String newKey = generateKey();
       
       // Re-encriptar todas las credenciales con nueva clave
       List<Credencial> credenciales = credencialRepository.findAll();
       for (Credencial credencial : credenciales) {
           String decrypted = oldEncryptionService.decrypt(credencial.getCredencial());
           String encrypted = newEncryptionService.encrypt(decrypted);
           credencial.setCredencial(encrypted);
           credencialRepository.save(credencial);
       }
       
       // Actualizar clave en configuración
       encryptionProperties.setKey(newKey);
   }
   ```

6. **No Requiere Servicios Externos**

   - No necesita AWS KMS, HashiCorp Vault, etc.
   - Todo está self-contained en la aplicación
   - Sin dependencias externas
   - Sin costos adicionales

## Configuración en el Proyecto

### Variables de Entorno

```env
# Generar con: openssl rand -base64 32
ENCRYPTION_KEY=tu_clave_aes_256_de_32_bytes_aqui
```

### Servicio de Encriptación

```java
@Service
public class EncryptionService {
    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int GCM_IV_LENGTH = 12;
    private static final int GCM_TAG_LENGTH = 128;
    
    private final SecretKey key;
    private final LogAuditoriaRepository auditoriaRepository;
    
    public EncryptionService(
            @Value("${encryption.key}") String keyBase64,
            LogAuditoriaRepository auditoriaRepository) {
        byte[] keyBytes = Base64.getDecoder().decode(keyBase64);
        this.key = new SecretKeySpec(keyBytes, "AES");
        this.auditoriaRepository = auditoriaRepository;
    }
    
    public String encrypt(String plaintext) {
        try {
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            
            byte[] iv = new byte[GCM_IV_LENGTH];
            new SecureRandom().nextBytes(iv);
            
            GCMParameterSpec spec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.ENCRYPT_MODE, key, spec);
            
            byte[] ciphertext = cipher.doFinal(
                plaintext.getBytes(StandardCharsets.UTF_8)
            );
            
            byte[] encryptedBytes = new byte[iv.length + ciphertext.length];
            System.arraycopy(iv, 0, encryptedBytes, 0, iv.length);
            System.arraycopy(ciphertext, 0, encryptedBytes, iv.length, ciphertext.length);
            
            // Log auditoría (sin datos sensibles)
            auditoriaRepository.save(new LogAuditoria(
                "ENCRYPT_CREDENCIAL",
                "Credencial encriptada",
                SecurityContextHolder.getContext().getAuthentication().getName()
            ));
            
            return Base64.getEncoder().encodeToString(encryptedBytes);
        } catch (Exception e) {
            throw new EncryptionException("Error encriptando credencial", e);
        }
    }
    
    public String decrypt(String encryptedBase64) {
        try {
            byte[] encryptedBytes = Base64.getDecoder().decode(encryptedBase64);
            
            byte[] iv = new byte[GCM_IV_LENGTH];
            System.arraycopy(encryptedBytes, 0, iv, 0, iv.length);
            
            byte[] ciphertext = new byte[encryptedBytes.length - GCM_IV_LENGTH];
            System.arraycopy(encryptedBytes, iv.length, ciphertext, 0, ciphertext.length);
            
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec spec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.DECRYPT_MODE, key, spec);
            
            byte[] plaintext = cipher.doFinal(ciphertext);
            
            // Log auditoría (sin datos sensibles)
            auditoriaRepository.save(new LogAuditoria(
                "DECRYPT_CREDENCIAL",
                "Credencial desencriptada",
                SecurityContextHolder.getContext().getAuthentication().getName()
            ));
            
            return new String(plaintext, StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new DecryptionException("Error desencriptando credencial", e);
        }
    }
}
```

### Uso en Servicios

```java
@Service
public class CredencialService {
    private final CredencialRepository repository;
    private final EncryptionService encryptionService;
    
    public Credencial createCredencial(CreateCredencialRequest request) {
        Credencial credencial = new Credencial();
        
        // Encriptar antes de guardar en BD
        String encrypted = encryptionService.encrypt(request.credencial());
        credencial.setCredencial(encrypted);
        
        return repository.save(credencial);
    }
    
    public String getCredencial(Long suscripcionId, Long usuarioId) {
        Credencial credencial = repository.findBySuscripcionId(suscripcionId);
        
        // Verificar que el usuario tiene acceso
        if (!hasAccess(usuarioId, suscripcionId)) {
            throw new UnauthorizedException("No tienes acceso a esta suscripción");
        }
        
        // Desencriptar antes de devolver
        return encryptionService.decrypt(credencial.getCredencial());
    }
}
```

## Seguridad Adicional

### Key Management

1. **Clave no hardcodeada**: Almacenada en variable de entorno
2. **Clave rotativa**: Rotación periódica (1 año)
3. **Clave única**: Diferente clave por entorno (dev, staging, prod)
4. **Clave generada**: Usar `openssl rand -base64 32`

### Auditoría

1. **Log de encriptaciones**: Quién encriptó, cuándo
2. **Log de desencriptaciones**: Quién desencriptó, cuántas veces
3. **Alerta de acceso sospechoso**: Múltiples desencriptaciones en corto tiempo

### Access Control

1. **Solo miembros del grupo** pueden ver credenciales
2. **Anfitriones** pueden actualizar credenciales
3. **Admins** no pueden ver credenciales (principio de least privilege)

## Consecuencias

### Positivas:

1. **Seguridad Máxima**
   - Credenciales protegidas incluso si DB es comprometida
   - Authenticated encryption previene tampering
   - Compliance con GDPR, PCI DSS

2. **Performance Aceptable**
   - AES-256-GCM tiene aceleración de hardware
   - Operaciones en milisegundos, no segundos

3. **Simplicidad**
   - Implementación en Java standard
   - Sin dependencias externas
   - Sin servicios externos

4. **Flexibilidad**
   - Rotación de claves posible
   - Múltiples claves soportadas
   - Key management flexible

### Negativas:

1. **Single Point of Failure**
   - Si la clave se compromete, todas las credenciales están en riesgo
   - Requiere rotación inmediata de clave

2. **Complexidad de Key Management**
   - Generación segura de claves
   - Almacenamiento seguro de claves
   - Rotación de claves

3. **No Zero-Knowledge**
   - Si la aplicación es comprometida, las claves pueden exponerse
   - No provee zero-knowledge proofing

## Alternativas Consideradas

### Hashing (SHA-256, bcrypt, Argon2)

**Ventajas:**
- No reversible (más seguro)
- No requiere gestión de claves

**Desventajas:**
- No funciona para credenciales (necesitamos recuperar las credenciales)
- No puede desencriptar

**No elegido porque:**
- Credenciales deben ser recuperables por los usuarios
- Necesitamos encriptación reversible

### Database-Level Encryption (MySQL Enterprise Encryption)

**Ventajas:**
- Encriptación transparente
- Integración con MySQL
- Key management en MySQL

**Desventajas:**
- Requiere MySQL Enterprise (costoso)
- Menos control sobre el proceso
- No portable a otras BDs

**No elegido porque:**
- MySQL Enterprise tiene costos
- No es open source completo
- Menor flexibilidad

### Asymmetric Encryption (RSA-4096)

**Ventajas:**
- Private key no necesita estar en el servidor
- Mayor flexibilidad

**Desventajas:**
- Mucho más lento (100-1000x más lento que AES)
- Más complejo
- Encriptación de datos grandes es ineficiente

**No elegido porque:**
- Performance crítico para credenciales
- AES-256 es más rápido y seguro

### Third-Party Secrets Managers (AWS KMS, HashiCorp Vault)

**Ventajas:**
- Key management profesional
- Hardware Security Modules (HSMs)
- Audit trails robustos
- Rotación automática de claves

**Desventajas:**
- Costos mensuales ($50-500+/mes)
- Dependencia externa
- Mayor complejidad
- Latencia adicional

**No elegido porque:**
- Proyecto académico con presupuesto limitado
- AES-256-GCM es suficiente para requirements
- Overkill para este caso de uso

## Referencias

- [NIST FIPS 197 - AES](https://csrc.nist.gov/publications/detail/fips/197/final)
- [NIST SP 800-38D - GCM](https://csrc.nist.gov/publications/detail/sp/800-38d/final)
- [AWS Encryption SDK - Best Practices](https://docs.aws.amazon.com/encryption-sdk/latest/developer-guide/)
- [OWASP Encryption Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Encryption_Cheat_Sheet.html)

---

**Fecha de Decisión:** 2024-09-01
**Decidido por:** Juan Alberto Fuentes
**Estado:** Accepted
