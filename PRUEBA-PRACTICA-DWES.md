# Prueba Practica DWES

## Que endpoints he creado

He creado los endpoints para manejar las preguntas frecuentes de la aplicacion:

- GET /api/v1/preguntas/ : devuelve todas las preguntas frecuentes. Es publico, cualquiera puede acceder.

- POST /api/v1/preguntas/ : crea una nueva pregunta frecuente. Solo pueden usarlo los administradores, necesita token JWT.

- GET /api/v1/preguntas/categoria/{categoria} : devuelve las preguntas filtradas por categoria. Tambien es publico.

- DELETE /api/v1/preguntas/{id} : borra una pregunta frecuente. Solo administradores con token JWT.

## Seguridad

Uso JWT para la autenticacion. El usuario inicia sesion y recibe un token que tiene que mandar en el header Authorization de las peticiones. Los GET son publicos para que cualquiera pueda ver las preguntas, pero el POST y el DELETE estan protegidos y solo los puede usar un usuario autenticado.

## Como probarlo

1. Obtener todas las preguntas:
   GET /api/v1/preguntas/

2. Crear una pregunta (con token):
   POST /api/v1/preguntas/
   Header: Authorization: Bearer <token>
   Body: { "pregunta": "Como restablezco mi contrasena?", "respuesta": "Haz clic en Olvide mi contrasena en el login.", "categoria": "Cuenta" }

3. Filtrar por categoria:
   GET /api/v1/preguntas/categoria/Cuenta

4. Borrar una pregunta (con token):
   DELETE /api/v1/preguntas/{id}
   Header: Authorization: Bearer <token>
