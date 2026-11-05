# Documentación del backend

## Propósito

El backend expone una API REST para el Sistema de Evaluación Diagnóstica. Está construido con Node.js y Express, y consulta PostgreSQL para generar exámenes con preguntas de distintos componentes.

## Estructura del proyecto

```text
backend/
├── .env
└── src/
    ├── config/
    │   └── db.js
    ├── controllers/
    │   └── examen-controller.js
    ├── routes/
    │   └── examen-routes.js
    └── index.js
```

### `src/config/`

Contiene la configuración y los recursos que pueden ser compartidos por distintas partes de la aplicación.

- **`db.js`** crea un `Pool` de conexiones con el paquete `pg`, usando la variable `DATABASE_URL` del entorno. Si la variable no está definida, detiene la inicialización con un error explícito. La conexión está configurada para usar SSL.
- Este módulo exporta el pool para que los controladores puedan ejecutar consultas sin crear una conexión independiente en cada solicitud.

### `src/controllers/`

Contiene la lógica que atiende las solicitudes y prepara las respuestas HTTP.

- **`examen-controller.js`** exporta la función `generarExamen`.
- La función consulta la tabla `Preguntas` tres veces, una por cada componente (`id_componente` 1, 2 y 3), solicita hasta 10 preguntas aleatorias por componente y selecciona los campos que necesita el cliente.
- Después combina los resultados, mezcla el orden de las preguntas y responde con el total y la lista en formato JSON.
- Si una consulta falla, registra el error en la consola y responde con el estado HTTP 500 y un mensaje genérico, sin exponer detalles internos.

### `src/routes/`

Define las rutas de la API y las conecta con sus controladores.

- **`examen-routes.js`** crea un router de Express y registra `GET /` para ejecutar `generarExamen`.
- En `index.js`, este router se monta bajo `/api/examenes`. Por lo tanto, la ruta completa para generar un examen es **`GET /api/examenes`**.

### `src/index.js`

Es el punto de entrada y configuración principal del servidor.

1. Carga las variables de entorno desde `backend/.env`.
2. Importa Express, CORS y las rutas de exámenes.
3. Crea la aplicación y determina el puerto con `PORT`; si no se define, utiliza `3000`.
4. Habilita CORS y el análisis de cuerpos JSON mediante middlewares.
5. Registra las rutas de exámenes bajo `/api/examenes`.
6. Expone `GET /api/status` como endpoint de prueba para comprobar que la API está activa.
7. Inicia el servidor y muestra en consola la dirección local.

## Recorrido de una solicitud

Al solicitar `GET /api/examenes`, Express recibe la petición en `index.js` y la envía al router de `examen-routes.js`. El router invoca `generarExamen` en el controlador. El controlador utiliza el pool configurado en `db.js` para consultar PostgreSQL, procesa y mezcla las preguntas, y finalmente devuelve la respuesta JSON al cliente.

## Configuración y ejecución

El archivo `backend/.env` debe definir las variables de entorno necesarias, incluyendo `DATABASE_URL` para la conexión con PostgreSQL. No se deben incluir valores secretos en esta documentación ni en el control de versiones.

Desde la carpeta `backend`, el servidor puede iniciarse con:

```bash
node src/index.js
```

Con la configuración predeterminada, el endpoint de estado queda disponible en `http://localhost:3000/api/status` y el de exámenes en `http://localhost:3000/api/examenes`.
