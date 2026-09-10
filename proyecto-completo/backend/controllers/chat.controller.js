'use strict';

const axios = require('axios');
const { InvokeCommand, LambdaClient } = require('@aws-sdk/client-lambda');

// In-memory session context (sesion_id -> { clientProfile, churnProbability })
const sessionContext = new Map();

// AWS Lambda client
const lambdaClient = new LambdaClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * POST /api/chat/start
 *
 * Inicializa o reconecta una sesión de chat.
 *
 * Requirements:
 *   - 1.1: Si no envía sesion_id, crea nueva sesión con estado='abierta'
 *   - 1.2: Si envía sesion_id propio y estado='abierta', reutiliza y trae historial
 *   - 1.3: Ejecuta query combinada de perfil del cliente
 *   - 1.4: Invoca AWS Lambda (puente a SageMaker) para probabilidad_churn_ml
 *   - 1.5: Si Lambda falla, continúa sin bloquear (probabilidad_churn_ml: null)
 *   - 1.6: Guarda perfil + probabilidad_churn_ml en memoria (Map)
 *   - 1.7: Devuelve { sesion_id, historial_previo }
 */
async function startSession(req, res) {
  try {
    const { sesion_id } = req.body;
    const customer_id = req.user.customer_id;
    const pool = req.app.locals.pool;

    // ── Paso 1: Verificar si es reconexión (sesion_id propio y abierta) ──────────
    if (sesion_id) {
      const sessionCheck = await pool.query(
        `SELECT sc.id, sc.estado, sc.contacto_id, cc.customer_id
         FROM sesiones_chat sc
         JOIN crm_contactos cc ON cc.id = sc.contacto_id
         WHERE sc.id = $1 AND cc.customer_id = $2`,
        [sesion_id, customer_id]
      );

      if (sessionCheck.rows.length > 0 && sessionCheck.rows[0].estado === 'abierta') {
        // Reconexión: traer historial
        const historial = await pool.query(
          `SELECT remitente, contenido_texto, fecha_hora
           FROM historial_mensajes
           WHERE sesion_id = $1
           ORDER BY fecha_hora ASC`,
          [sesion_id]
        );

        // CORREGIDO 2026-08-31: antes se retornaba acá sin llamar nunca a
        // sessionContext.set() — clientProfile quedaba null para toda la
        // sesión reconectada. Justo el caso que más importa (reconexión tras
        // un reinicio del backend, que vacía el Map en memoria) quedaba roto.
        const reconProfileQuery = await pool.query(
          `SELECT
             crm.estado_emocional AS "EstadoEmocional",
             tc.descripcion AS "Contract",
             c.tenure_meses AS "tenure",
             cc.monthly_charges AS "MonthlyCharges",
             cc.total_charges AS "TotalCharges",
             CASE WHEN cc.paperless_billing::text = 'true' THEN 'Yes' ELSE 'No' END AS "PaperlessBilling",
             c.senior_citizen::int AS "SeniorCitizen",
             CASE WHEN c.partner::text = 'true' THEN 'Yes' ELSE 'No' END AS "Partner",
             CASE WHEN c.dependents::text = 'true' THEN 'Yes' ELSE 'No' END AS "Dependents",
             MAX(CASE WHEN sc.nombre_servicio = 'PhoneService' THEN csp.estado_servicio END) AS "PhoneService",
             MAX(CASE WHEN sc.nombre_servicio = 'InternetService' THEN csp.estado_servicio END) AS "InternetService",
             MAX(CASE WHEN sc.nombre_servicio = 'OnlineSecurity' THEN csp.estado_servicio END) AS "OnlineSecurity",
             MAX(CASE WHEN sc.nombre_servicio = 'TechSupport' THEN csp.estado_servicio END) AS "TechSupport"
           FROM clientes c
           INNER JOIN crm_contactos crm ON c.customer_id = crm.customer_id
           INNER JOIN cuentas_contrataciones cc ON c.customer_id = cc.customer_id
           INNER JOIN tipos_contrato tc ON cc.tipo_contrato_id = tc.id
           LEFT JOIN cliente_servicios_pivot csp ON c.customer_id = csp.customer_id
           LEFT JOIN servicios_catalogo sc ON csp.servicio_id = sc.id
           WHERE c.customer_id = $1
           GROUP BY crm.estado_emocional, tc.descripcion, c.tenure_meses, cc.monthly_charges,
                    cc.total_charges, cc.paperless_billing, c.senior_citizen, c.partner, c.dependents`,
          [customer_id]
        );
        const reconProfileRow = reconProfileQuery.rows[0] || {};
        const existingCtx = sessionContext.get(sesion_id) || {};
        sessionContext.set(sesion_id, {
          ...existingCtx,
          clientProfile: reconProfileRow,
          churnProbability: existingCtx.churnProbability ?? null,
        });
        console.log(`[chat.controller] Reconexión — sessionContext.set(${sesion_id}) — clientProfile:`, JSON.stringify(reconProfileRow));

        return res.status(200).json({
          sesion_id,
          historial_previo: historial.rows,
        });
      }
    }

    // ── Paso 2: Crear nueva sesión ───────────────────────────────────────────
    // Resolver/crear contacto_id en crm_contactos
    let contacto_id;
    const contactoCheck = await pool.query(
      `SELECT id FROM crm_contactos WHERE customer_id = $1`,
      [customer_id]
    );

    if (contactoCheck.rows.length > 0) {
      contacto_id = contactoCheck.rows[0].id;
    } else {
      const newContacto = await pool.query(
        `INSERT INTO crm_contactos (customer_id) 
         VALUES ($1) 
         RETURNING id`,
        [customer_id]
      );
      contacto_id = newContacto.rows[0].id;
    }

    // Insertar nueva sesión
    const newSession = await pool.query(
      `INSERT INTO sesiones_chat (contacto_id, estado, ultima_actividad) 
       VALUES ($1, 'abierta', NOW()) 
       RETURNING id`,
      [contacto_id]
    );

    const new_sesion_id = newSession.rows[0].id;
    console.log(`[chat.controller] Nueva sesión creada: id=${new_sesion_id} (tipo: ${typeof new_sesion_id})`);

    // ── Paso 3: Query de perfil del cliente (features exactas del modelo ML) ──
    // Réplica parametrizada de la query real ya usada y probada en el flujo n8n
    // original ("Get Datos Cliente"). EstadoEmocional se pide porque lo necesita
    // el prompt del Flujo 1 (LLM) más adelante, pero se excluye del payload a
    // Lambda — no es una feature con la que se entrenó el modelo.
    const profileQuery = await pool.query(
      `SELECT
         crm.estado_emocional AS "EstadoEmocional",
         tc.descripcion AS "Contract",
         c.tenure_meses AS "tenure",
         cc.monthly_charges AS "MonthlyCharges",
         cc.total_charges AS "TotalCharges",
         CASE WHEN cc.paperless_billing::text = 'true' THEN 'Yes' ELSE 'No' END AS "PaperlessBilling",
         c.senior_citizen::int AS "SeniorCitizen",
         CASE WHEN c.partner::text = 'true' THEN 'Yes' ELSE 'No' END AS "Partner",
         CASE WHEN c.dependents::text = 'true' THEN 'Yes' ELSE 'No' END AS "Dependents",
         MAX(CASE WHEN sc.nombre_servicio = 'PhoneService' THEN csp.estado_servicio END) AS "PhoneService",
         MAX(CASE WHEN sc.nombre_servicio = 'InternetService' THEN csp.estado_servicio END) AS "InternetService",
         MAX(CASE WHEN sc.nombre_servicio = 'OnlineSecurity' THEN csp.estado_servicio END) AS "OnlineSecurity",
         MAX(CASE WHEN sc.nombre_servicio = 'TechSupport' THEN csp.estado_servicio END) AS "TechSupport"
       FROM clientes c
       INNER JOIN crm_contactos crm ON c.customer_id = crm.customer_id
       INNER JOIN cuentas_contrataciones cc ON c.customer_id = cc.customer_id
       INNER JOIN tipos_contrato tc ON cc.tipo_contrato_id = tc.id
       LEFT JOIN cliente_servicios_pivot csp ON c.customer_id = csp.customer_id
       LEFT JOIN servicios_catalogo sc ON csp.servicio_id = sc.id
       WHERE c.customer_id = $1
       GROUP BY crm.estado_emocional, tc.descripcion, c.tenure_meses, cc.monthly_charges,
                cc.total_charges, cc.paperless_billing, c.senior_citizen, c.partner, c.dependents`,
      [customer_id]
    );

    const profileRow = profileQuery.rows[0] || {};
    // Separar: EstadoEmocional es para el prompt del LLM (Flujo 1), no para el modelo ML
    const { EstadoEmocional, ...modelPayload } = profileRow;

    // ── Paso 4: Llamada a AWS Lambda (puente a SageMaker) ─────────────────────
    // Guardar contexto inicial inmediatamente (no bloquear happy path).
    // clientProfile incluye EstadoEmocional para cuando se arme el payload del Flujo 1.
    sessionContext.set(new_sesion_id, {
      clientProfile: profileRow,
      churnProbability: null, // Se actualizará cuando Lambda responda
    });
    console.log(`[chat.controller] sessionContext.set(${new_sesion_id}) — clientProfile:`, JSON.stringify(profileRow));

    // Llamada a Lambda en background (fire-and-forget) con timeout 4000ms
    (async () => {
      try {
        const lambdaResponse = await Promise.race([
          lambdaClient.send(
            new InvokeCommand({
              FunctionName: 'arn:aws:lambda:us-east-1:277778298937:function:invocar-sagemaker-churn',
              InvocationType: 'RequestResponse', // Explícito para evitar cambios accidentales a 'Event'
              // Payload plano, sin wrapper ni customer_id mezclado — mismo formato
              // exacto que ya usaba el flujo n8n original contra este Lambda.
              Payload: JSON.stringify(modelPayload),
            })
          ),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Lambda timeout')), 4000)
          ),
        ]);

        if (lambdaResponse.StatusCode === 200 && lambdaResponse.Payload) {
          const payload = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));
          // La respuesta viene anidada bajo "result" (confirmado por el prompt
          // original: {{ $json.result.churn_probability }}), no en la raíz.
          const churnValue = payload.result?.churn_probability ?? null;

          // Actualizar contexto en memoria cuando Lambda responde
          sessionContext.set(new_sesion_id, {
            clientProfile: profileRow,
            churnProbability: churnValue,
          });
        }
      } catch (lambdaError) {
        // Requirement 1.5: No bloquear la sesión si Lambda falla
        console.error('[chat.controller] Error invocando Lambda:', lambdaError.message);
        // Contexto ya está guardado con null, no se actualiza
      }
    })();

    // ── Paso 5: Retornar respuesta con historial vacío (sesión nueva) ──────────
    // NOTA: probabilidad_churn_ml quedará null inicialmente y se actualizará en background
    return res.status(200).json({
      sesion_id: new_sesion_id,
      historial_previo: [],
    });

  } catch (error) {
    console.error('[chat.controller] Error en startSession:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}

/**
 * POST /api/chat/end
 *
 * Cierra manualmente una sesión de chat.
 *
 * Requirements:
 *   - 3.1: Actualizar estado='cerrada' validando customer_id
 *   - 3.2: Disparar Flujo 2 de n8n (fire-and-forget)
 *   - 3.3: Responder 200 OK inmediatamente
 */
async function endSession(req, res) {
  try {
    const { sesion_id } = req.body;
    const customer_id = req.user.customer_id;
    const pool = req.app.locals.pool;

    // ── Paso 1: Validar y actualizar estado ────────────────────────────────────
    const result = await pool.query(
      `UPDATE sesiones_chat 
       SET estado = 'cerrada' 
       WHERE id = $1 
       AND contacto_id IN (SELECT id FROM crm_contactos WHERE customer_id = $2)
       RETURNING id`,
      [sesion_id, customer_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Sesión no encontrada o no pertenece al usuario' });
    }

    // ── Paso 2: Disparar Flujo 2 de n8n (fire-and-forget) ────────────────────
    // CORREGIDO 2026-08-31: antes se mandaba solo { sesion_id }. El Flujo 2
    // ("Insert a la nube chat") necesita el análisis acumulado del "Cerebro"
    // (nivel_enojo, tipo_ticket, motivo, resumen_problema, etc.) y la
    // probabilidad de churn para crear el ticket y loguear a S3 — no puede
    // leerlo de $('Set Respuesta') porque es un workflow separado sin acceso a
    // la ejecución del otro. sessionContext ya lo tiene guardado (se actualiza
    // en cada mensaje desde chat.socket.js).
    const ctx = sessionContext.get(sesion_id) || {};
    const closePayload = {
      sesion_id,
      customer_id,
      clientProfile: ctx.clientProfile || null,
      probabilidad_churn: ctx.churnProbability ?? null,
      ...(ctx.ultimoAnalisis || {}),
    };

    axios.post(process.env.N8N_CLOSE_WEBHOOK_URL, closePayload)
      .catch(err => console.error('[chat.controller] Error disparando webhook de cierre:', err.message));

    // Limpiar el contexto en memoria — la sesión ya está cerrada
    sessionContext.delete(sesion_id);

    // ── Paso 3: Responder inmediatamente (no esperar n8n) ───────────────────────
    return res.status(200).json({ message: 'Sesión cerrada exitosamente' });

  } catch (error) {
    console.error('[chat.controller] Error en endSession:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}

// Exportar sessionContext para uso en chat.socket.js
module.exports = { startSession, endSession, sessionContext };