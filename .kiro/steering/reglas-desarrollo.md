---
inclusion: always
---
<!------------------------------------------------------------------------------------
   Add rules to this file or a short description and have Kiro refine them for you.
   
   Learn about inclusion modes: https://kiro.dev/docs/steering/#inclusion-modes
-------------------------------------------------------------------------------------> 
# Reglas de Desarrollo y Estilo de Código — Telecom FyB

## Contexto y Misión
Vas a actuar como un Desarrollador Full-Stack Senior implementando el sistema web modular detallado en los documentos de Specs (Requirements y Design Document).

> **⚠️ ESTADO: Proyecto Fénix V2 en curso (actualizado 2026-08-24).** Los documentos en `.kiro/specs/especificaciones-soporte/` (`design.md`, `requirements.md`, `tasks.md`) describen la arquitectura **V1 ya implementada** (chat efímero, solo tablas `clientes`/`usuarios`). Esa arquitectura fue **revertida**: ahora el chat persiste en tiempo real, hay sistema de tickets, y el esquema de DB se amplió significativamente. La fuente de verdad actual es el vault de Obsidian, notas `Proyecto Fénix V2 - Arquitectura.md` y `Proyecto Fénix V2 - Chat y Tickets.md` (carpeta `Elias/01 - Proyectos/Telecom/`). Los tres documentos de specs quedan como registro histórico de V1 y fueron anotados en los puntos donde V2 los contradice — no los sigas literalmente en esos puntos sin confirmar primero.

## Directrices de Desarrollo (Backend)
- Implementa estrictamente el patrón modular: separa la inicialización en `index.js`, las rutas en la carpeta `routes/` y la lógica de negocio con las consultas SQL nativas en `controllers/`.
- Antes de iniciar el servidor HTTP, valida de forma obligatoria que todas las variables de entorno definidas en el Tech Design estén presentes; si falta alguna, utiliza `process.exit(1)`.
- El endpoint de login debe ejecutar el JOIN con la tabla 'clientes' y evaluar el 'churn' ANTES de verificar la contraseña con bcrypt.
- Envuelve todos los controladores de Express en bloques `try/catch` para manejar excepciones de base de datos o caídas de red de n8n.

## Directrices de Desarrollo (Frontend)
- Utiliza la estructura nativa de React con Vite y configura Tailwind CSS inyectando las directivas necesarias en `index.css`.
- Todo formulario de login debe incluir validación client-side (no enviar si hay campos vacíos) y manejar un timeout de 10 segundos mediante AbortController.
- **[V2 — reemplaza la regla anterior de chat efímero]** El componente `ChatWidget` debe persistir cada mensaje en tiempo real contra el backend (`POST /api/chat/message`), que escribe en la tabla `historial_mensajes` — ya NO es efímero ni vive solo en `useState`. Al desmontar el componente, seguí ejecutando la función de limpieza para abortar peticiones HTTP en curso. El cierre explícito de la conversación (botón "Finalizar Chat" + modal de confirmación) dispara `POST /api/chat/close`, que activa el webhook de n8n de resumen/sentimiento y escribe en `tickets_soporte`.
- Diseña la animación del indicador "Escribiendo..." usando las clases utilitarias de animación nativas de Tailwind (`animate-pulse` o `animate-bounce`).