# Design — Backend: Datos Reales del Dashboard

## Overview
4 endpoints GET, cada uno detrás de `authMiddleware`, todos filtrando por `req.user.customer_id` (ya presente en el JWT). Sin lógica de escritura en esta feature.

## Estructura de archivos propuesta
```
backend/
├── controllers/
│   └── dashboard.controller.js   ← nuevo: getInicio, getFacturacion, getServicios, getTicketsHistory
└── routes/
    └── dashboard.routes.js       ← nuevo: registra los 4 GET, todos con authMiddleware
```
Registrar `dashboard.routes.js` en `index.js` bajo `/api/dashboard`, consistente con el patrón ya usado para `auth.routes.js`.

## Endpoint 1 — GET /api/dashboard/inicio

**⚠️ CORREGIDO 2026-08-30:** `servicios_catalogo.nombre_servicio` guarda el nombre EN INGLÉS de la columna original del dataset (`'InternetService'`, `'PhoneService'`, etc.), no una etiqueta ni una categoría — y `cliente_servicios_pivot.estado_servicio` guarda el VALOR crudo (`'DSL'`/`'Fiber optic'`/`'No'` para InternetService; `'Yes'`/`'No'`/`'No internet service'` para los servicios booleanos). No existe el valor `'Activo'` en ningún lado — confirmado contra la query real ya usada en el n8n original. Filtrar por `categoria = 'Internet'` tampoco es necesario ni correcto.

```sql
SELECT csp.estado_servicio
FROM cliente_servicios_pivot csp
JOIN servicios_catalogo sc ON csp.servicio_id = sc.id
JOIN cuentas_contrataciones cc ON cc.customer_id = csp.customer_id
WHERE csp.customer_id = $1 AND sc.nombre_servicio = 'InternetService';
```
Respuesta: `{ "internetService": csp.estado_servicio tal cual ("Fiber optic"|"DSL"|"No"), "monthlyCharges": cc.monthly_charges }`. Sin fila → `internetService: "No"`.

## Endpoint 2 — GET /api/facturacion

**⚠️ CORREGIDO 2026-08-30** — misma corrección que Endpoint 1: sin `categoria`, sin `'Activo'`.

```sql
-- Todos los servicios del cliente (se filtra "activo" en JS, ver abajo)
SELECT sc.nombre_servicio, csp.estado_servicio
FROM cliente_servicios_pivot csp
JOIN servicios_catalogo sc ON csp.servicio_id = sc.id
WHERE csp.customer_id = $1;

-- Totales + contrato + pago
SELECT cc.monthly_charges, tc.descripcion AS contract_type, mp.descripcion AS payment_method
FROM cuentas_contrataciones cc
JOIN tipos_contrato tc ON cc.tipo_contrato_id = tc.id
JOIN metodos_pago mp ON cc.metodo_pago_id = mp.id
WHERE cc.customer_id = $1;
```
En el controller: `InternetService` está "activo" si `estado_servicio !== 'No'`; `PhoneService` y el resto de los booleanos (`OnlineSecurity`, `OnlineBackup`, `DeviceProtection`, `TechSupport`, `StreamingTV`, `StreamingMovies`, `MultipleLines`) están "activos" si `estado_servicio === 'Yes'`. Armar `activeServices` (nombres en español para mostrar) a partir de esa lógica, no de un valor `'Activo'` que no existe.
Respuesta:
```json
{
  "activeServices": ["Internet Fibra Óptica", "Streaming TV"],
  "monthlyCharges": 74.90,
  "contractType": "Mes a mes",
  "paymentMethod": "Cheque electrónico"
}
```
El frontend sigue generando el desglose de montos por ítem (mock proporcional, sumando exacto a `monthlyCharges`) — el backend solo entrega qué servicios son reales y el total real.

## Endpoint 3 — GET /api/servicios

**⚠️ CORREGIDO 2026-08-30** — mismo hallazgo: no hay `categoria`, no hay `'Activo'`. `nombre_servicio` es literalmente el nombre de columna del dataset original.

```sql
SELECT sc.nombre_servicio, csp.estado_servicio
FROM cliente_servicios_pivot csp
JOIN servicios_catalogo sc ON csp.servicio_id = sc.id
WHERE csp.customer_id = $1;
```
El backend arma la agrupación en el controller, mapeando cada `nombre_servicio` a su lugar en la jerarquía:
- `internet.active` = (`InternetService` !== `'No'`); `internet.type` = el valor de `InternetService` tal cual.
- `internet.subservices.*` = cada uno de `OnlineSecurity`/`OnlineBackup`/`DeviceProtection`/`TechSupport`/`StreamingTV`/`StreamingMovies` === `'Yes'`.
- `phone.active` = (`PhoneService` === `'Yes'`); `phone.subservices.multipleLines` = (`MultipleLines` === `'Yes'`).

Respuesta:
```json
{
  "internet": { "active": true, "subservices": { "onlineSecurity": false, "onlineBackup": true } },
  "phone": { "active": false, "subservices": { "multipleLines": false } }
}
```
`active: false` en el nivel padre es lo que el frontend usa para cambiar la viñeta completa de la card a "Desactivado" (Requirement 3.2).

## Endpoint 4 — GET /api/tickets/history
```sql
SELECT t.fecha_creacion, t.tipo_ticket, t.descripcion_problema, t.estado_ticket
FROM tickets_soporte t
JOIN sesiones_chat s ON t.sesion_id = s.id
JOIN crm_contactos c ON s.contacto_id = c.id
WHERE c.customer_id = $1
ORDER BY t.fecha_creacion DESC;
```
**Nota de diseño clave:** `tickets_soporte` no tiene `customer_id` directo — se llega solo a través de `sesion_id → sesiones_chat.contacto_id → crm_contactos.customer_id`. Cualquier intento de filtrar tickets sin este join fallaría en encontrar los datos correctos (o los expondría mal).

## Criterios de verificación (por requirement)
| Requirement | Verificación |
|---|---|
| 1.1–1.3 | Un customer_id con Internet activo muestra el tipo y monto reales; uno sin Internet muestra "No" |
| 2.1–2.4 | Los 4 campos reales llegan al frontend; el desglose de montos sigue siendo mock proporcional |
| 3.1–3.2 | Un cliente sin Teléfono ve la card "Teléfono" completa en estado desactivado, no solo "Líneas Múltiples" en gris |
| 4.1–4.3 | La tabla de Soporte muestra únicamente los tickets del customer_id logueado, ordenados por fecha desc |
| Seguridad | Ningún endpoint acepta `customer_id` fuera del JWT; todas las queries parametrizadas |
