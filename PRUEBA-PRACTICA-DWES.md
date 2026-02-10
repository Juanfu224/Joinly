Qué endpoint has creado y por qué??
He creado un endpoint de búsqueda para las preguntas frecuentes, ya que es una funcionalidad común en aplicaciones que manejan FAQs. Permite a los usuarios buscar preguntas específicas utilizando términos clave, mejorando la experiencia del usuario al facilitar el acceso a la información relevante.

Los endpoints creados son:

- `GET /api/v1/preguntas/`:
  Este endpoint permite a los usuarios obtener una lista de todas las preguntas frecuentes disponibles. Es útil para que los usuarios puedan navegar por todas las FAQs y encontrar respuestas a sus preguntas.
- `POST /api/v1/preguntas/`:
  Este endpoint permite a los administradores crear nuevas preguntas frecuentes. Es esencial para mantener la base de datos de FAQs actualizada y relevante para los usuarios.

- `GET /api/v1/preguntas/categoria/{categoria}`:
  Este endpoint permite a los usuarios obtener una lista de preguntas frecuentes filtradas por categoría. Es útil para que los usuarios puedan encontrar rápidamente información relacionada con un tema específico.

- `GET /api/v1/preguntas/{id}`:
  Este endpoint permite a los usuarios buscar preguntas frecuentes utilizando un término de búsqueda. Es útil para que los usuarios puedan encontrar respuestas específicas sin tener que navegar por todas las FAQs.

Cómo has implementado la seguridad.

Capturas o comandos para probarlo.
