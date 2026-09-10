-- Migration: Create usuarios table
-- Requirements: 1.1, 1.2, 1.3, 1.4

CREATE TABLE IF NOT EXISTS usuarios (
    id             SERIAL PRIMARY KEY,
    customer_id    VARCHAR(50) REFERENCES public.clientes(customer_id) ON DELETE CASCADE,
    email          VARCHAR(254)   UNIQUE NOT NULL,
    password_hash  VARCHAR(72)    NOT NULL,
    created_at     TIMESTAMP      NOT NULL DEFAULT NOW()

);

CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);

-- Migration: Chat en tiempo real (Fase 2) + Garbage Collector de sesiones zombie (Fase 4)
-- Requirements: ver .cursor/specs/backend-chat-tiempo-real/requirements.md

-- sesiones_chat necesita estado + timestamp de actividad para que el cron
-- (Fase 4) pueda encontrar sesiones abandonadas sin escanear toda la tabla.
ALTER TABLE sesiones_chat
  ADD COLUMN IF NOT EXISTS estado VARCHAR(30) NOT NULL DEFAULT 'abierta',
  ADD COLUMN IF NOT EXISTS ultima_actividad TIMESTAMP NOT NULL DEFAULT NOW();

-- estado esperado: 'abierta' | 'cerrada' | 'cerrada_por_inactividad'

CREATE INDEX IF NOT EXISTS idx_sesiones_chat_gc ON sesiones_chat(estado, ultima_actividad);
CREATE INDEX IF NOT EXISTS idx_sesiones_chat_contacto ON sesiones_chat(contacto_id);

CREATE INDEX IF NOT EXISTS idx_historial_mensajes_sesion_fecha ON historial_mensajes(sesion_id, fecha_hora);

CREATE INDEX IF NOT EXISTS idx_cuentas_contrataciones_customer ON cuentas_contrataciones(customer_id);
CREATE INDEX IF NOT EXISTS idx_tickets_soporte_sesion ON tickets_soporte(sesion_id);
CREATE INDEX IF NOT EXISTS idx_crm_contactos_customer ON crm_contactos(customer_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_customer ON usuarios(customer_id);

-- cliente_servicios_pivot: si (customer_id, servicio_id) ya es PK compuesta,
-- este índice es redundante pero inofensivo (IF NOT EXISTS). Verificar con
-- \d cliente_servicios_pivot antes de asumir que hace falta.
CREATE INDEX IF NOT EXISTS idx_cliente_servicios_pivot_customer ON cliente_servicios_pivot(customer_id);

-- Cleanup: índices redundantes detectados al auditar pg_indexes post-migración (2026-08-29)
-- cliente_servicios_pivot ya tiene PK compuesta (customer_id, servicio_id) —
-- cubre búsquedas por customer_id solo, por la regla de prefijo izquierdo.
DROP INDEX IF EXISTS idx_cliente_servicios_pivot_customer;

-- crm_contactos y cuentas_contrataciones ya tenían UNIQUE constraint sobre
-- customer_id (crm_contactos_customer_id_key / cuentas_contrataciones_customer_id_key)
-- desde antes de esta feature — los índices que agregué eran duplicados exactos.
DROP INDEX IF EXISTS idx_crm_contactos_customer;
DROP INDEX IF EXISTS idx_cuentas_contrataciones_customer;


