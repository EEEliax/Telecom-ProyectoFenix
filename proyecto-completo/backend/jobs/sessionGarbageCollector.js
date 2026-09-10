'use strict';

const cron = require('node-cron');
const axios = require('axios');

/**
 * Inicializa el Garbage Collector de sesiones zombie.
 *
 * Requirements:
 *   - 4.1: Ejecutarse cada 30 minutos
 *   - 4.2: Buscar sesiones con estado='abierta' y ultima_actividad < NOW() - INTERVAL '2 hours'
 *   - 4.3: Por cada sesión, actualizar estado='cerrada_por_inactividad' y disparar webhook fire-and-forget
 *   - 4.4: Loggear cuántas sesiones procesó por corrida
 */
function initializeGarbageCollector(pool) {
  // ── Cron schedule: cada 30 minutos ───────────────────────────────────────
  cron.schedule('*/30 * * * *', async () => {
    try {
      console.log('[GC] Iniciando recolección de sesiones zombie...');

      // ── Paso 1: Buscar y actualizar sesiones inactivas ───────────────────────
      const result = await pool.query(
        `UPDATE sesiones_chat 
         SET estado = 'cerrada_por_inactividad' 
         WHERE estado = 'abierta' 
         AND ultima_actividad < NOW() - INTERVAL '2 hours'
         RETURNING id`
      );

      const closedSessions = result.rows;
      const closedCount = closedSessions.length;

      if (closedCount === 0) {
        console.log('[GC] No se encontraron sesiones zombie para cerrar.');
        return;
      }

      console.log(`[GC] ${closedCount} sesiones cerradas por inactividad.`);

      // ── Paso 2: Disparar webhook fire-and-forget para cada sesión ────────────
      for (const session of closedSessions) {
        axios.post(process.env.N8N_CLOSE_WEBHOOK_URL, { sesion_id: session.id })
          .catch(err => console.error(`[GC] Error disparando webhook para sesión ${session.id}:`, err.message));
      }

      console.log(`[GC] Webhooks disparados para ${closedCount} sesiones.`);

    } catch (error) {
      console.error('[GC] Error en recolección de sesiones zombie:', error);
    }
  });

  console.log('[GC] Garbage Collector inicializado (ejecución cada 30 minutos).');
}

module.exports = initializeGarbageCollector;