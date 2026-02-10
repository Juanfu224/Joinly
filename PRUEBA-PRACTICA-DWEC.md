He creado la seccion de Preguntas frecuentes en el frontend. Es una pagina nueva que consume los datos del backend y los muestra al usuario.

## Componentes

He hecho dos componentes:

- PreguntasComponent (padre): esta en src/app/pages/preguntas/preguntas.ts. Es el que se encarga de llamar al servicio, pedir los datos al backend y manejar si esta cargando o si hay un error. Usa signals para el estado y OnPush para el change detection.

- PreguntaCardComponent (hijo): esta en src/app/pages/preguntas/pregunta-card/pregunta-card.ts. Recibe una pregunta por @Input y la muestra como un acordeon que se abre y se cierra. Es un componente presentacional, solo pinta datos.

Los dos son standalone.

## Routing

La ruta /preguntas esta en app.routes.ts con lazy loading usando loadComponent. Tambien añadi el enlace en el header y en el footer para que se pueda navegar a la seccion.

## Servicio y modelo

Cree el modelo en src/app/models/pregunta.model.ts con la interfaz PreguntaFrecuente que tiene id, pregunta, respuesta, categoria y orden. Todo tipado, sin usar any.

El servicio esta en src/app/services/pregunta.ts y consume estos endpoints:
- GET /api/v1/preguntas (todas las preguntas)
- GET /api/v1/preguntas/categoria/{cat} (filtrar por categoria)
- GET /api/v1/preguntas/buscar?q={term} (buscar)

## Archivos creados

- src/app/models/pregunta.model.ts
- src/app/services/pregunta.ts
- src/app/pages/preguntas/preguntas.ts, preguntas.html, preguntas.scss, index.ts
- src/app/pages/preguntas/pregunta-card/pregunta-card.ts, pregunta-card.html, pregunta-card.scss, index.ts

## Archivos modificados

- app.routes.ts (nueva ruta con lazy loading)
- models/index.ts y services/index.ts (exports)
- header.html y footer.html (enlaces a /preguntas)

## Como ejecutarlo

Primero arrancas el backend desde /backend con ./mvnw spring-boot:run y luego el frontend desde /frontend con npm install y npm start. Se abre en http://localhost:4200 y la seccion nueva esta en http://localhost:4200/preguntas.
