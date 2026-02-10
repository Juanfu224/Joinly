Qué endpoint has creado y por qué??
He creado un endpoint de búsqueda para las preguntas frecuentes, ya que es una funcionalidad común en aplicaciones que manejan FAQs. Permite a los usuarios buscar preguntas específicas utilizando términos clave, mejorando la experiencia del usuario al facilitar el acceso a la información relevante.

Los endpoints creados son:

- `GET /api/v1/preguntas/`:
  Este endpoint permite a los usuarios obtener una lista de todas las preguntas frecuentes disponibles. Es útil para que los usuarios puedan navegar por todas las FAQs y encontrar respuestas a sus preguntas.
- `POST /api/v1/preguntas/`:
  Este endpoint permite a los administradores crear nuevas preguntas frecuentes. Es esencial para mantener la base de datos de FAQs actualizada y relevante para los usuarios.

- `GET /api/v1/preguntas/categoria/{categoria}`:
  Este endpoint permite a los usuarios obtener una lista de preguntas frecuentes filtradas por categoría. Es útil para que los usuarios puedan encontrar rápidamente información relacionada con un tema específico.

- `DELETE /api/v1/preguntas/{id}`:
  Este endpoint permite a los administradores eliminar preguntas frecuentes específicas. Es importante para mantener la base de datos de FAQs limpia y eliminar información obsoleta o incorrecta.

Cómo has implementado la seguridad.
He implementado la seguridad utilizando JWT (JSON Web Tokens) para autenticar a los usuarios. Los usuarios deben iniciar sesión para obtener un token de acceso, que luego deben incluir en el encabezado de sus solicitudes para acceder a los endpoints protegidos. Esto asegura que solo los usuarios autenticados puedan acceder a ciertas funcionalidades, como crear nuevas preguntas frecuentes.

Capturas o comandos para probarlo.
Para probar los endpoints, puedes usar herramientas como Postman o cURL. Aquí hay algunos comandos de ejemplo:

1. Obtener todas las preguntas frecuentes:
    ```
    GET /api/v1/preguntas/
    ```
2. Crear una nueva pregunta frecuente (requiere autenticación):
    ```
    POST /api/v1/preguntas/
     Headers: Authorization: Bearer <token>
     Body: {
       "pregunta": "¿Cómo puedo restablecer mi contraseña?",
       "respuesta": "Puedes restablecer tu contraseña haciendo clic en 'Olvidé mi contraseña' en la página de inicio de sesión.",
       "categoria": "Cuenta"
      }
    ```
3. Obtener preguntas frecuentes por categoría:
    ```
    GET /api/v1/preguntas/categoria/Cuenta
    ```
4. Eliminar una pregunta frecuente (requiere autenticación):
    ```
    DELETE /api/v1/preguntas/{id}
      Headers: Authorization: Bearer
      Bearer <token>
    ```
Estos comandos te permitirán probar las funcionalidades de los endpoints que he creado para manejar las preguntas frecuentes en la aplicación. Asegúrate de reemplazar `<token>` con un token de acceso válido obtenido después de iniciar sesión.
