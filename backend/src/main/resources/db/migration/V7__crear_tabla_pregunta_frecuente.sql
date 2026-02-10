CREATE TABLE pregunta_frecuente (
    id_pregunta BIGINT NOT NULL AUTO_INCREMENT,
    pregunta VARCHAR(300) NOT NULL,
    respuesta TEXT NOT NULL,
    categoria VARCHAR(30) NOT NULL,
    orden INT NOT NULL DEFAULT 0,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_pregunta),
    INDEX idx_faq_categoria (categoria),
    INDEX idx_faq_orden (orden)
);

INSERT INTO pregunta_frecuente (id_pregunta, pregunta, respuesta, categoria, orden, activo) VALUES
(1, '¿Cómo puedo crear una cuenta en Joinly?', 'Para crear una cuenta en Joinly, haz clic en el botón "Registrarse" en la página de inicio y completa el formulario con tu información personal.', 'CUENTA', 1, true),
(2, '¿Puedo cambiar mi dirección de correo electrónico después de registrarme?', 'Sí, puedes cambiar tu dirección de correo electrónico en la sección de configuración de tu perfil.', 'CUENTA', 2, true),
(3, '¿Cómo puedo restablecer mi contraseña si la olvido?', 'Haz clic en "¿Olvidaste tu contraseña?" en la página de inicio de sesión y sigue las instrucciones para restablecerla.', 'CUENTA', 3, true),
(4, '¿Qué métodos de pago aceptan para las suscripciones premium?', 'Aceptamos tarjetas de crédito y débito, así como PayPal para las suscripciones premium.', 'SUSCRIPCIONES', 1, true),
(5, '¿Puedo cancelar mi suscripción premium en cualquier momento?', 'Sí, puedes cancelar tu suscripción premium en cualquier momento desde la sección de configuración de tu cuenta.', 'SUSCRIPCIONES', 2, true);
