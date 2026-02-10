CREATE TABLE preguntas_recientes (
    id_pregunta BIGINT NOT NULL,
    pregunta VARCHAR (255) NOT NULL,
    respuesta TEXT NOT NULL,
    categoria VARCHAR (100) NOT NULL,
    orden INT NOT NULL DEFAULT 0,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
)

insert into preguntas_recientes (id_pregunta, pregunta, respuesta, categoria, orden, activo) VALUES
(1, '¿Cómo puedo crear una cuenta en Joinly?', 'Para crear una cuenta en Joinly, haz clic en el botón "Registrarse" en la página de inicio y completa el formulario con tu información personal.', 'Cuenta', 1, true),
(2, '¿Puedo cambiar mi dirección de correo electrónico después de registrarme?', 'Sí, puedes cambiar tu dirección de correo electrónico en la sección de configuración de tu perfil.', 'Cuenta', 2, true),
(3, '¿Cómo puedo restablecer mi contraseña si la olvido?', 'Haz clic en "¿Olvidaste tu contraseña?" en la página de inicio de sesión y sigue las instrucciones para restablecerla.', 'Cuenta', 3, true),
(4, '¿Qué métodos de pago aceptan para las suscripciones premium?', 'Aceptamos tarjetas de crédito y débito, así como PayPal para las suscripciones premium.', 'Suscripciones', 1, true),
(5, '¿Puedo cancelar mi suscripción premium en cualquier momento?', 'Sí, puedes cancelar tu suscripción premium en cualquier momento desde la sección de configuración de tu cuenta.', 'Suscripciones', 2, true);
