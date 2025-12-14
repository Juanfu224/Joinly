package com.alberti.joinly.services;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * Servicio de encriptación/desencriptación usando AES-256-GCM.
 * <p>
 * Utilizado para proteger información sensible como credenciales de suscripciones.
 * GCM proporciona autenticación además de encriptación, detectando cualquier
 * manipulación de los datos cifrados.
 * <p>
 * <b>Características de seguridad:</b>
 * <ul>
 *   <li>AES-256 con modo GCM (Galois/Counter Mode)</li>
 *   <li>IV (Initialization Vector) único por cada encriptación</li>
 *   <li>Tag de autenticación de 128 bits</li>
 *   <li>Clave configurable vía propiedades de aplicación</li>
 * </ul>
 */
@Service
@Slf4j
public class EncryptionService {

    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int GCM_IV_LENGTH = 12;
    private static final int GCM_TAG_LENGTH = 128;

    @Value("${joinly.encryption.key}")
    private String encryptionKeyBase64;

    private SecretKey secretKey;
    private final SecureRandom secureRandom = new SecureRandom();

    @PostConstruct
    void init() {
        byte[] decodedKey = Base64.getDecoder().decode(encryptionKeyBase64);
        if (decodedKey.length != 32) {
            throw new IllegalStateException("La clave de encriptación debe ser de 256 bits (32 bytes)");
        }
        this.secretKey = new SecretKeySpec(decodedKey, "AES");
        log.info("Servicio de encriptación AES-256-GCM inicializado correctamente");
    }

    /**
     * Encripta un texto plano usando AES-256-GCM.
     * El resultado incluye el IV prepuesto al texto cifrado, todo codificado en Base64.
     *
     * @param plainText Texto a encriptar
     * @return Texto encriptado en Base64 (IV + ciphertext)
     * @throws EncryptionException si ocurre un error durante la encriptación
     */
    public String encrypt(String plainText) {
        if (plainText == null || plainText.isEmpty()) {
            return plainText;
        }

        try {
            byte[] iv = new byte[GCM_IV_LENGTH];
            secureRandom.nextBytes(iv);

            var cipher = Cipher.getInstance(ALGORITHM);
            var gcmSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey, gcmSpec);

            byte[] cipherText = cipher.doFinal(plainText.getBytes());

            // Concatenar IV + cipherText
            var byteBuffer = ByteBuffer.allocate(iv.length + cipherText.length);
            byteBuffer.put(iv);
            byteBuffer.put(cipherText);

            return Base64.getEncoder().encodeToString(byteBuffer.array());

        } catch (Exception e) {
            log.error("Error al encriptar datos", e);
            throw new EncryptionException("Error al encriptar datos", e);
        }
    }

    /**
     * Desencripta un texto cifrado con AES-256-GCM.
     *
     * @param encryptedText Texto encriptado en Base64 (IV + ciphertext)
     * @return Texto plano original
     * @throws EncryptionException si ocurre un error durante la desencriptación
     */
    public String decrypt(String encryptedText) {
        if (encryptedText == null || encryptedText.isEmpty()) {
            return encryptedText;
        }

        try {
            byte[] decoded = Base64.getDecoder().decode(encryptedText);
            var byteBuffer = ByteBuffer.wrap(decoded);

            byte[] iv = new byte[GCM_IV_LENGTH];
            byteBuffer.get(iv);

            byte[] cipherText = new byte[byteBuffer.remaining()];
            byteBuffer.get(cipherText);

            var cipher = Cipher.getInstance(ALGORITHM);
            var gcmSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.DECRYPT_MODE, secretKey, gcmSpec);

            byte[] plainText = cipher.doFinal(cipherText);
            return new String(plainText);

        } catch (Exception e) {
            log.error("Error al desencriptar datos", e);
            throw new EncryptionException("Error al desencriptar datos", e);
        }
    }

    /**
     * Excepción para errores de encriptación/desencriptación.
     */
    public static class EncryptionException extends RuntimeException {
        public EncryptionException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}
