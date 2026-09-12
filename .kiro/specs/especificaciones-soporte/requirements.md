# Requirements Document

> **⚠️ DOCUMENTO HISTÓRICO — V1.** Este documento especifica los requisitos ya implementados de Telecom FyB V1. El Proyecto Fénix V2 revirtió el Requirement 8 (chat efímero) y el AC 4.4, y amplió sustancialmente el alcance (tickets, persistencia, más tablas). Fuente de verdad actual: vault de Obsidian, `Elias/01 - Proyectos/Telecom/Proyecto Fénix V2 - Arquitectura.md` y `Proyecto Fénix V2 - Chat y Tickets.md`. Los puntos contradichos están anotados inline con `> V2:`.

## Introduction

Sistema web modular corporativo para una empresa de telecomunicaciones (Telecom FyB) compuesto por tres módulos principales: una Landing Page informativa, un sistema de Login corporativo con validación de estado de cliente, y un Dashboard privado con un Chat de Soporte interactivo conectado a n8n y Amazon Bedrock. El sistema implementa autenticación JWT, se conecta a una base de datos PostgreSQL existente con tabla `clientes` y `usuarios`, y aplica una validación crítica de churn para bloquear el acceso a clientes dados de baja.

## Glossary

- **Sistema**: La aplicación web completa (Landing + Login + Dashboard + Chat).
- **Backend**: Servidor Node.js/Express que gestiona la lógica de negocio, autenticación y comunicación con n8n.
- **Frontend**: SPA React/Vite que renderiza la interfaz de usuario.
- **Auth_Service**: Módulo del Backend responsable de autenticar usuarios mediante JWT y bcrypt.
- **Chat_Service**: Módulo del Backend que reenvía mensajes al webhook de n8n y retorna la respuesta al Frontend.
- **DB**: Base de datos PostgreSQL con las tablas `clientes` y `usuarios`.
- **JWT**: JSON Web Token utilizado para autorizar rutas privadas.
- **n8n**: Plataforma de automatización externa accesible mediante webhook que procesa los tickets de soporte con Amazon Bedrock.
- **Cliente_Activo**: Usuario cuyo campo `churn` en la tabla `clientes` es distinto de 1.
- **Cliente_Churn**: Usuario cuyo campo `churn` en la tabla `clientes` es igual a 1 (dado de baja).
- **ProtectedRoute**: Componente React que impide el acceso al Dashboard a usuarios no autenticados.
- **ChatWindow**: Componente React que gestiona la interfaz y el estado local del chat de soporte.
- **Dashboard**: Página privada accesible únicamente tras autenticación exitosa, que aloja el ChatWindow.
- **Landing**: Página pública informativa y comercial de la empresa.
- **Churn_Filter**: Validación en el Auth_Service que rechaza autenticaciones de clientes dados de baja.

---

## Requirements

### Requirement 1: Migración y estructura de base de datos

**User Story:** Como administrador del sistema, quiero que exista una tabla `usuarios` en PostgreSQL correctamente relacionada con `clientes`, para que los usuarios corporativos puedan registrarse y autenticarse.

#### Acceptance Criteria

1. THE DB SHALL disponer de una tabla `usuarios` con los campos: un identificador primario autoincremental único, un campo de referencia al cliente asociado, un campo de email único y obligatorio, un campo de contraseña hasheada obligatorio, y un campo de marca temporal de registro con valor por defecto a la fecha y hora actuales.
2. WHEN se elimina un registro de la tabla `clientes`, THE DB SHALL eliminar en cascada todos los registros de `usuarios` que referencien ese cliente, sin dejar registros huérfanos.
3. IF se intenta insertar un registro en `usuarios` con un email que ya existe en la tabla, THEN THE DB SHALL rechazar la operación con un error de violación de unicidad sin modificar ningún registro existente.
4. IF se intenta insertar un registro en `usuarios` con un `customer_id` que no existe en la tabla `clientes`, THEN THE DB SHALL rechazar la operación con un error de violación de integridad referencial sin insertar el registro.

---

### Requirement 2: Autenticación corporativa con validación de Churn

**User Story:** Como usuario corporativo activo, quiero iniciar sesión con mi email y contraseña, para que el sistema me permita acceder al Dashboard solo si mi cuenta está activa.

#### Acceptance Criteria

1. WHEN el Auth_Service recibe una petición POST a `/api/auth/login` con `email` y `password`, THE Auth_Service SHALL verificar primero el estado de churn del cliente asociado antes de comparar la contraseña, retornando HTTP 403 si el churn es 1, o continuando con la validación de contraseña si el cliente está activo.
2. IF el email proporcionado no existe en la tabla `usuarios`, THEN THE Auth_Service SHALL retornar un código de estado HTTP 401 con el mensaje "Credenciales inválidas".
3. IF el campo `churn` del cliente asociado es igual a 1, THEN THE Auth_Service SHALL rechazar la autenticación con un código de estado HTTP 403 y el mensaje "Cuenta inactiva o cliente dado de baja".
4. IF la contraseña proporcionada no coincide con el `password_hash` almacenado, THEN THE Auth_Service SHALL retornar un código de estado HTTP 401 con el mensaje "Credenciales inválidas".
5. WHEN el usuario existe, es un Cliente_Activo y la contraseña es correcta, THE Auth_Service SHALL retornar HTTP 200 con un JWT firmado que contenga como mínimo el identificador único del usuario, su email, y una expiración máxima de 24 horas.
6. IF la petición llega con campos `email` o `password` ausentes, vacíos o de longitud excesiva, THEN THE Auth_Service SHALL retornar HTTP 400 con un mensaje indicando qué campo es inválido, sin intentar consultar la DB.

---

### Requirement 3: Protección de rutas mediante JWT

**User Story:** Como usuario autenticado, quiero que las rutas privadas del backend estén protegidas, para que solo yo pueda acceder al Dashboard y al Chat de Soporte.

#### Acceptance Criteria

1. WHEN una petición llega a `/api/chat` o a cualquier endpoint privado del Backend, THE Backend SHALL verificar que el encabezado `Authorization` contiene un token JWT en formato Bearer con firma válida y no expirado antes de procesar la petición.
2. IF el token JWT está ausente, mal formado, con firma inválida o expirado, THEN THE Backend SHALL retornar un código de estado HTTP 401 con un mensaje que identifique la causa del rechazo (ausente, inválido o expirado).
3. IF el token JWT es válido y no ha expirado, THEN THE Backend SHALL permitir el acceso al endpoint solicitado y continuar con el procesamiento de la petición.

---

### Requirement 4: Reenvío de mensajes al webhook de n8n

**User Story:** Como usuario del Dashboard, quiero enviar mensajes al Chat de Soporte y recibir respuestas procesadas por la IA, para que mis consultas sean atendidas de forma automática e inteligente.

#### Acceptance Criteria

1. WHEN el Chat_Service recibe una petición POST autenticada a `/api/chat` con el mensaje del usuario, THE Chat_Service SHALL reenviar el mensaje mediante una petición HTTP POST a la URL de webhook de n8n configurada, con un timeout máximo de 30 segundos.
2. WHEN n8n retorna HTTP 200 con un cuerpo no vacío, THE Chat_Service SHALL retornar ese cuerpo de respuesta al Frontend con un código de estado HTTP 200.
3. IF el webhook de n8n supera el timeout de 30 segundos, retorna un código HTTP distinto de 200, o retorna un cuerpo vacío o no parseable, THEN THE Chat_Service SHALL retornar al Frontend un código de estado HTTP 502 con un mensaje que identifique la causa específica del fallo.
4. ~~THE Chat_Service SHALL no persistir los mensajes del usuario ni las respuestas de n8n en la DB local en ningún caso.~~ **❌ V2: ANULADO.** El Chat_Service (V2) SHALL persistir cada mensaje del usuario y cada respuesta en la tabla `historial_mensajes` en tiempo real, y subir la conversación cruda a S3 al cierre de la sesión. Ver `Proyecto Fénix V2 - Chat y Tickets.md`.

---

### Requirement 5: Interfaz de la Landing Page

**User Story:** Como visitante del sitio, quiero ver una página principal informativa y visualmente atractiva, para que pueda conocer los servicios de la empresa antes de iniciar sesión.

#### Acceptance Criteria

1. THE Frontend SHALL renderizar la Landing Page en la ruta raíz `/` sin requerir autenticación, accesible para cualquier visitante.
2. THE Landing SHALL mostrar al menos las siguientes secciones observables: nombre y descripción de la empresa, servicios o productos ofrecidos, y una sección de contacto o información adicional, estilizadas con Tailwind CSS.
3. THE Landing SHALL incluir un enlace o botón de navegación que redirija al usuario a la ruta `/login`.
4. IF un usuario autenticado con JWT válido visita la ruta `/`, THEN THE Frontend SHALL redirigirlo automáticamente al Dashboard.

---

### Requirement 6: Formulario de Login con manejo de errores

**User Story:** Como usuario corporativo, quiero un formulario de login claro con mensajes de error descriptivos, para que entienda por qué mi acceso fue rechazado en caso de fallo.

#### Acceptance Criteria

1. THE Frontend SHALL renderizar el formulario de Login en la ruta `/login` sin requerir autenticación.
2. WHEN el Auth_Service retorna HTTP 200 con un JWT de un Cliente_Activo, THE Login SHALL almacenar el JWT en el almacenamiento de sesión del navegador y redirigir al usuario a `/dashboard`.
3. WHEN el Auth_Service retorna un código 403, THE Login SHALL mostrar un mensaje de error indicando cuenta inactiva o cliente dado de baja, sin redirigir al usuario.
4. WHEN el Auth_Service retorna un código 401, THE Login SHALL mostrar un mensaje de error indicando credenciales inválidas, sin redirigir al usuario.
5. IF el usuario ya posee un JWT válido en el almacenamiento de sesión del navegador, THEN THE Frontend SHALL redirigir automáticamente al Dashboard sin mostrar el formulario de Login.
6. IF el usuario intenta enviar el formulario con el campo `email` o `password` vacío, THEN THE Login SHALL bloquear el envío y mostrar un mensaje indicando qué campo es requerido, sin realizar ninguna petición al Auth_Service.
7. IF la petición al Auth_Service no recibe respuesta en 10 segundos, THEN THE Login SHALL mostrar un mensaje de error indicando fallo de conexión y habilitar nuevamente el botón de envío.

---

### Requirement 7: Dashboard privado con protección de ruta

**User Story:** Como usuario autenticado, quiero acceder a un Dashboard privado con el Chat de Soporte, para que mis interacciones con la IA estén protegidas y sean exclusivas de mi sesión.

#### Acceptance Criteria

1. THE Frontend SHALL renderizar el Dashboard en la ruta `/dashboard` únicamente cuando el usuario posea un JWT válido y no expirado en el almacenamiento de sesión, mediante el componente ProtectedRoute.
2. IF un usuario no autenticado intenta acceder a `/dashboard`, THEN THE ProtectedRoute SHALL redirigir al usuario a `/login` sin renderizar ningún contenido del Dashboard.
3. IF el JWT almacenado ha expirado cuando el usuario intenta acceder a `/dashboard`, THEN THE ProtectedRoute SHALL eliminar el JWT del almacenamiento de sesión y redirigir al usuario a `/login`.
4. THE Dashboard SHALL renderizar el componente ChatWindow como su contenido principal, habilitando la interacción con el Chat de Soporte.
5. WHEN el usuario activa el mecanismo de cierre de sesión, THE Dashboard SHALL eliminar el JWT del almacenamiento de sesión y redirigir al usuario a `/login` sin requerir confirmación adicional.

---

### Requirement 8: Componente ChatWindow con historial en memoria — **❌ V2: ANULADO parcialmente, ver nota**

> **V2:** El AC 8.1 (no-persistencia) queda anulado — el chat (`ChatWidget` en V2) SHALL persistir cada mensaje en tiempo real en `historial_mensajes`, y un cierre explícito (botón "Finalizar Chat") crea un ticket en `tickets_soporte` vía webhook de n8n. Los AC 8.2–8.7 sobre UX (indicador de carga, límite de caracteres, deshabilitar input) siguen vigentes. Ver `Proyecto Fénix V2 - Chat y Tickets.md` y `Proyecto Fénix V2 - Arquitectura.md`.

**User Story:** *(V1, ya no vigente en cuanto a privacidad por no-persistencia)* Como usuario del Dashboard, quiero interactuar con el Chat de Soporte de forma fluida, con historial visible durante mi sesión y sin que mis datos sean persistidos, para que mi privacidad esté garantizada.

#### Acceptance Criteria

1. ~~THE ChatWindow SHALL mantener el historial de la conversación en estado local en memoria durante la sesión activa, sin escribir ningún dato en la DB ni en almacenamiento persistente del navegador.~~ **❌ V2: ANULADO** — THE ChatWidget SHALL persistir cada mensaje (usuario y respuesta) en tiempo real en la tabla `historial_mensajes` mediante `POST /api/chat/message`.
2. WHEN el componente ChatWindow se desmonta (cierre de sesión o navegación fuera del Dashboard), THE ChatWindow SHALL liberar el historial de conversación de la memoria y cancelar cualquier petición en vuelo al Chat_Service.
3. WHEN el usuario envía un mensaje, THE ChatWindow SHALL mostrar el mensaje en el historial en un tiempo máximo de 100ms y deshabilitar el campo de input para prevenir envíos múltiples mientras se espera la respuesta.
4. WHILE se espera la respuesta del Chat_Service, THE ChatWindow SHALL mostrar un elemento visible en el historial que indique que la IA está procesando la respuesta, animado con Tailwind CSS.
5. WHEN la respuesta del Chat_Service es recibida, THE ChatWindow SHALL ocultar el indicador de procesamiento, añadir la respuesta al historial y habilitar nuevamente el input.
6. IF el Chat_Service retorna un error, THEN THE ChatWindow SHALL mostrar en el historial un mensaje que identifique la causa del fallo y habilitar nuevamente el input.
7. IF el usuario intenta enviar un mensaje que supera 2000 caracteres, THEN THE ChatWindow SHALL bloquear el envío y mostrar un mensaje indicando el límite máximo de caracteres, sin realizar ninguna petición al Chat_Service.

---

### Requirement 9: Configuración del servidor Backend

**User Story:** Como desarrollador, quiero un punto de entrada Express bien configurado con los middlewares necesarios, para que el servidor funcione correctamente en un entorno de producción.

#### Acceptance Criteria

1. THE Backend SHALL configurar el middleware CORS con los orígenes permitidos definidos en la variable de entorno `CORS_ALLOWED_ORIGINS`, rechazando peticiones de orígenes no listados, y el middleware `express.json` con un límite de tamaño de cuerpo de 1 MB, en el punto de entrada `index.js` antes de registrar las rutas.
2. WHEN el servidor inicia, THE Backend SHALL cargar las variables de entorno desde un archivo `.env` mediante `dotenv` como primera acción antes de cualquier otra inicialización.
3. THE Backend SHALL registrar las rutas de autenticación bajo el prefijo `/api/auth` y las rutas del chat bajo el prefijo `/api/chat`.
4. WHEN el servidor inicia, THE Backend SHALL establecer la conexión con la DB utilizando un Pool de conexiones de la librería `pg`, configurado con las variables de entorno `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER` y `DB_PASSWORD`.
5. IF alguna de las variables de entorno requeridas (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`, `N8N_WEBHOOK_URL`) no está definida al iniciar, THEN THE Backend SHALL registrar un mensaje de error indicando la variable faltante y terminar el proceso con código de salida no cero.
6. IF el Pool de conexiones de la DB no puede establecer conexión al iniciar, THEN THE Backend SHALL registrar el error de conexión y terminar el proceso con código de salida no cero.
7. THE Backend SHALL configurar CORS de modo que las peticiones de orígenes no incluidos en `CORS_ALLOWED_ORIGINS` sean rechazadas antes de alcanzar cualquier ruta registrada.
