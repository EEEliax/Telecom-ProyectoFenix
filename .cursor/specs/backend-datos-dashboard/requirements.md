# Requirements — Backend: Datos Reales del Dashboard

## Introduction
El frontend del Portal B2C (migrado en `migracion-frontend-v0`) hoy corre 100% con mocks. Esta feature conecta los 4 endpoints de lectura necesarios para que Inicio, Facturación, Mis Servicios y Soporte muestren datos reales del cliente logueado. NO incluye persistencia de chat (`historial_mensajes`/`sesiones_chat`/webhooks n8n) — eso es una feature aparte, posterior.

## Contexto técnico ya verificado
- El JWT (emitido en `POST /api/auth/login`) ya incluye `customer_id` en el payload — `req.user.customer_id` está disponible en cualquier ruta protegida por `middleware/auth.js`, sin queries adicionales para resolverlo.
- Conexión a DB vía `db/pool.js` (pg Pool, SSL con CA de RDS) — ya configurada y en uso por `auth.controller.js`.
- `tickets_soporte` NO tiene `customer_id` directo — se llega vía `sesion_id → sesiones_chat.contacto_id → crm_contactos.customer_id`.

## Requirements

### Requirement 1 — GET /api/dashboard/inicio
1.1 El endpoint SHALL devolver `internetService` (`DSL`/`Fiber optic`/`No`, real, desde el servicio de categoría "Internet" en `cliente_servicios_pivot`/`servicios_catalogo` para ese `customer_id`) y `monthlyCharges` (real, desde `cuentas_contrataciones.monthly_charges`).
1.2 Los Mbps mostrados en la card de plan SHALL seguir siendo un valor inventado en el frontend (no hay dato real de velocidad) — el backend NO inventa este valor, solo entrega `internetService`.
1.3 El resto de la vista (método de pago con número de tarjeta, consumo del ciclo) SHALL seguir 100% mockeado en frontend — este endpoint no los provee.

### Requirement 2 — GET /api/facturacion
2.1 El endpoint SHALL devolver la lista de servicios activos del cliente (desde `cliente_servicios_pivot` + `servicios_catalogo`, filtrando `estado_servicio = 'Activo'`).
2.2 El endpoint SHALL devolver `monthlyCharges` real (`cuentas_contrataciones.monthly_charges`) — el frontend sigue generando el desglose por ítem (montos inventados) que suma exacto a este total.
2.3 El endpoint SHALL devolver `contractType` real (`cuentas_contrataciones.tipo_contrato_id` → `tipos_contrato.descripcion`).
2.4 El endpoint SHALL devolver `paymentMethod` real (`cuentas_contrataciones.metodo_pago_id` → `metodos_pago.descripcion`).
2.5 El historial de facturas pasadas y el botón "Pagar Ahora" SHALL seguir 100% mockeados en frontend.

### Requirement 3 — GET /api/servicios
3.1 El endpoint SHALL devolver el estado real (activo/inactivo) de cada servicio del cliente, agrupado igual que en el frontend: Internet (con sub-servicios Seguridad, Backup, Protección, Soporte, Streaming TV, Streaming Películas) y Teléfono (con sub-servicio Líneas Múltiples).
3.2 Si la categoría padre no está contratada (`internetService === "No"` o `phoneService === "No"`), el endpoint SHALL indicarlo explícitamente (ej. `internetActive: false`) para que el frontend cambie la viñeta de "Activo" a "Desactivado" en la card completa, no solo en los sub-ítems.

### Requirement 4 — GET /api/tickets/history
4.1 El endpoint SHALL devolver todos los tickets del cliente logueado, resolviendo la cadena `customer_id → crm_contactos → sesiones_chat → tickets_soporte`.
4.2 El endpoint SHALL devolver, por ticket: `fecha_creacion`, `tipo_ticket`, `descripcion_problema` (el resumen sintético, no transcripción cruda), `estado_ticket`. `prioridad` y `nivel_enojo_detectado`/`probabilidad_churn_ml` NO se exponen al cliente (uso interno).
4.3 El endpoint SHALL ordenar los resultados por `fecha_creacion` descendente.
4.4 Fuera de alcance en esta feature: "adjuntar" un ticket anterior a una conversación nueva de chat — candidata a fase futura, no se implementa ahora.

## Seguridad
- Los 4 endpoints SHALL estar protegidos por `middleware/auth.js` (ya existente), usando `req.user.customer_id` del JWT verificado — nunca un `customer_id` recibido del cliente en query params o body.
- Ninguna query SHALL construirse por concatenación de strings — usar parámetros (`$1`, etc.) de `pg`, igual que en `auth.controller.js`.

## Fuera de alcance (explícito)
- `POST /api/chat/message`, `POST /api/chat/close`, y toda la persistencia de chat — spec aparte, posterior.
- Botón "Pagar Ahora" real, historial de facturas real, consumo real — siguen mockeados por decisión ya tomada (checklist del vault).
