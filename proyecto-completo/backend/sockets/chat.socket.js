'use strict';

const jwt = require('jsonwebtoken');
const axios = require('axios');
const { sessionContext } = require('../controllers/chat.controller');

/**
 * Inicializa el handler de Socket.io para el chat en tiempo real.
 *
 * Requirements:
 *   - 2.1: Validar JWT en el handshake antes de aceptar conexión
 *   - 2.2: Al recibir mensaje: (a) INSERT usuario, (b) POST n8n, (c) INSERT bot, (d) emitir respuesta
 *   - 2.3: Si INSERT falla, NO llamar a n8n
 *   - 2.4: Si n8n falla, emitir error sin INSERT fantasma
 */
function initializeChatSocket(io) {
  // ── Middleware JWT en el handshake ────────────────────────────────────────
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error('unauthorized'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded; // Guardar usuario en el socket para uso posterior
      next();
    } catch (error) {
      next(new Error('unauthorized'));
    }
  });

  // ── Handler de conexión ───────────────────────────────────────────────────
  io.on('connection', (socket) => {
    console.log(`[Socket.io] Cliente conectado: ${socket.user.customer_id}`);

    // ── Handler del evento chat:message ─────────────────────────────────────
    socket.on('chat:message', async ({ sesion_id, contenido_texto }) => {
      console.log(`[chat.socket] Mensaje recibido de ${socket.user.customer_id}, sesion_id=${sesion_id}`);

      // Validación de entrada: sin esto, un mensaje vacío o de decenas de miles
      // de caracteres se inserta en la DB y se reenvía entero a n8n/LLM tal cual.
      const texto = (contenido_texto || '').trim();
      if (!texto) {
        socket.emit('chat:error', { message: 'El mensaje no puede estar vacío' });
        return;
      }
      if (texto.length > 2000) {
        socket.emit('chat:error', { message: 'El mensaje supera el límite de 2000 caracteres' });
        return;
      }
      contenido_texto = texto; // usar el texto ya validado/recortado en el resto del handler

      try {
        const customer_id = socket.user.customer_id;
        const pool = socket.app.locals.pool;

        // ── Validación: sesion_id pertenece al customer_id ───────────────────
        const sessionCheck = await pool.query(
          `SELECT sc.id, sc.contacto_id
           FROM sesiones_chat sc
           JOIN crm_contactos cc ON cc.id = sc.contacto_id
           WHERE sc.id = $1 AND cc.customer_id = $2 AND sc.estado = 'abierta'`,
          [sesion_id, customer_id]
        );

        if (sessionCheck.rows.length === 0) {
          console.warn(`[chat.socket] sesion_id=${sesion_id} no válida o no pertenece a ${customer_id}`);
          socket.emit('chat:error', { message: 'Sesión no válida o no pertenece al usuario' });
          return;
        }

        // ── Paso (a): INSERT mensaje del usuario + UPDATE ultima_actividad ─────
        const userMessageInsert = await pool.query(
          `INSERT INTO historial_mensajes (sesion_id, remitente, contenido_texto, fecha_hora)
           VALUES ($1, 'usuario', $2, NOW())
           RETURNING id, fecha_hora`,
          [sesion_id, contenido_texto]
        );

        await pool.query(
          `UPDATE sesiones_chat SET ultima_actividad = NOW() WHERE id = $1`,
          [sesion_id]
        );

        // ── Paso (b): POST síncrono al Flujo 1 de n8n ─────────────────────────
        // El prompt real de n8n lee contexto_inicial.clientProfile en CADA
        // mensaje (se re-evalúa desde el body de cada ejecución puntual, no
        // desde la memoria de LangChain) — se manda siempre, no solo el primero.
        const ctx = sessionContext.get(sesion_id) || {};

        const n8nPayload = {
          customer_id,
          sesion_id,
          message: contenido_texto,
          contexto_inicial: {
            clientProfile: ctx.clientProfile || null,
            churnProbability: ctx.churnProbability ?? null,
          },
        };

        let botResponse = null;
        try {
          const n8nResponse = await axios.post(
            process.env.N8N_WEBHOOK_URL,
            n8nPayload,
            { timeout: 120000 }
          );

          if (n8nResponse.data) {
            botResponse = n8nResponse.data.respuesta || n8nResponse.data.respuesta_bot || null;

            // Tres señales, cada una con el criterio que le corresponde — no
            // todas se resuelven igual (corregido 2026-08-31, ver vault):
            //  - nivel_enojo: el MÁXIMO de toda la charla (sirve para escalar).
            //  - intencion_cancelacion_detectada: "pegajoso" (OR) — una vez
            //    detectado, queda true aunque el cliente se calme después.
            //  - tipo_ticket/motivo/resumen_problema: se toman del mensaje con
            //    mayor "relevancia_problema" (nuevo campo del LLM), NO del de
            //    mayor enojo — un cliente puede plantear el problema real con
            //    voz tranquila y enojarse después por algo menor.
            const previo = ctx.ultimoAnalisis || {
              nivel_enojo: 0,
              intencion_cancelacion_detectada: false,
              relevancia_problema: -1,
              tipo_ticket: null,
              motivo: null,
              resumen_problema: null,
            };

            const nivelEnojoMax = Math.max(previo.nivel_enojo ?? 0, n8nResponse.data.nivel_enojo ?? 0);
            const intencionDetectada =
              previo.intencion_cancelacion_detectada || !!n8nResponse.data.intencion_cancelacion_detectada;

            const nuevaRelevancia = n8nResponse.data.relevancia_problema ?? 0;
            const esMasRelevante = nuevaRelevancia >= (previo.relevancia_problema ?? -1);

            sessionContext.set(sesion_id, {
              ...ctx,
              ultimoAnalisis: {
                nivel_enojo: nivelEnojoMax,
                intencion_cancelacion_detectada: intencionDetectada,
                relevancia_problema: esMasRelevante ? nuevaRelevancia : previo.relevancia_problema,
                tipo_ticket: esMasRelevante ? (n8nResponse.data.tipo_ticket ?? previo.tipo_ticket) : previo.tipo_ticket,
                motivo: esMasRelevante ? (n8nResponse.data.motivo ?? previo.motivo) : previo.motivo,
                resumen_problema: esMasRelevante
                  ? (n8nResponse.data.resumen_problema ?? previo.resumen_problema)
                  : previo.resumen_problema,
              },
            });
          }
        } catch (n8nError) {
          // Requirement 2.4: Si n8n falla, emitir error sin INSERT fantasma
          console.error('[chat.socket] Error llamando a n8n:', n8nError.message);
          socket.emit('chat:error', { message: 'Error al procesar el mensaje' });
          return;
        }

        // ── Paso (c): INSERT respuesta del bot ─────────────────────────────────
        if (botResponse) {
          await pool.query(
            `INSERT INTO historial_mensajes (sesion_id, remitente, contenido_texto, fecha_hora)
             VALUES ($1, 'bot', $2, NOW())`,
            [sesion_id, botResponse]
          );
        }

        // ── Paso (d): Emitir respuesta por WebSocket ───────────────────────────
        socket.emit('chat:response', {
          contenido_texto: botResponse,
          fecha_hora: new Date().toISOString(),
        });

      } catch (error) {
        // Requirement 2.3: Si INSERT falla, NO llamar a n8n (ya manejado arriba)
        console.error('[chat.socket] Error procesando mensaje:', error);
        socket.emit('chat:error', { message: 'Error interno del servidor' });
      }
    });

    // ── Handler de desconexión ───────────────────────────────────────────────
    socket.on('disconnect', () => {
      console.log(`[Socket.io] Cliente desconectado: ${socket.user.customer_id}`);
    });
  });
}

module.exports = initializeChatSocket;