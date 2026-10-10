-- =========================================================
-- Seed data de prueba (10 registros por tabla, contexto AR)
-- Orden respeta FKs: tablas padre primero.
-- =========================================================

-- public.clientes
INSERT INTO public.clientes (customer_id, gender, senior_citizen, partner, dependents, tenure_meses, churn_historico) VALUES
('7823-QPXRL', 'Female', false, true,  false, 24, false),
('4410-BNTOS', 'Male',   false, false, false, 3,  true),
('9987-LKMWA', 'Female', true,  true,  true,  58, false),
('3356-VFDCT', 'Male',   false, true,  true,  12, false),
('6621-HYUIK', 'Female', false, false, false, 1,  true),
('1189-ZXPLM', 'Male',   true,  false, false, 45, false),
('8845-RTNBV', 'Female', false, true,  true,  67, false),
('2290-WQASD', 'Male',   false, false, false, 6,  true),
('5567-JKLPO', 'Female', true,  true,  false, 30, false),
('6034-MNBVC', 'Male',   false, false, true,  15, false);

-- public.metodos_pago
INSERT INTO public.metodos_pago (id, descripcion) VALUES
(1, 'Débito automático (CBU)'),
(2, 'Tarjeta de crédito (automático)'),
(3, 'Tarjeta de débito'),
(4, 'Transferencia bancaria'),
(5, 'Pago Fácil'),
(6, 'Rapipago'),
(7, 'Mercado Pago'),
(8, 'Cheque'),
(9, 'Efectivo en sucursal'),
(10, 'Billetera virtual (Ualá)');

-- public.servicios_catalogo
INSERT INTO public.servicios_catalogo (id, nombre_servicio, categoria) VALUES
(1, 'Internet Fibra Óptica 300MB', 'Internet'),
(2, 'Internet ADSL 20MB', 'Internet'),
(3, 'Línea telefónica fija', 'Telefonía'),
(4, 'Telefonía móvil prepaga', 'Telefonía'),
(5, 'TV por cable HD', 'Televisión'),
(6, 'Streaming Premium', 'Televisión'),
(7, 'Seguridad online', 'Seguridad'),
(8, 'Backup en la nube', 'Seguridad'),
(9, 'Soporte técnico premium', 'Soporte'),
(10, 'Línea adicional', 'Telefonía');

-- public.tipos_contrato
INSERT INTO public.tipos_contrato (id, descripcion) VALUES
(1, 'Mensual sin permanencia'),
(2, 'Anual'),
(3, 'Bianual'),
(4, 'Prepago'),
(5, 'Postpago'),
(6, 'Empresarial mensual'),
(7, 'Empresarial anual'),
(8, 'Promocional 6 meses'),
(9, 'Plan estudiantil'),
(10, 'Plan familiar');

-- public.cliente_servicios_pivot
INSERT INTO public.cliente_servicios_pivot (customer_id, servicio_id, estado_servicio) VALUES
('7823-QPXRL', 1,  'Activo'),
('4410-BNTOS', 4,  'Activo'),
('9987-LKMWA', 5,  'Suspendido'),
('3356-VFDCT', 2,  'Activo'),
('6621-HYUIK', 3,  'Dado de baja'),
('1189-ZXPLM', 6,  'Activo'),
('8845-RTNBV', 1,  'Activo'),
('2290-WQASD', 9,  'Pendiente'),
('5567-JKLPO', 7,  'Activo'),
('6034-MNBVC', 10, 'Activo');

-- public.crm_contactos
INSERT INTO public.crm_contactos (id, customer_id, estado_emocional) VALUES
(1, '7823-QPXRL', 'Satisfecho'),
(2, '4410-BNTOS', 'Crítico'),
(3, '9987-LKMWA', 'Neutral'),
(4, '3356-VFDCT', 'Frustrado'),
(5, '6621-HYUIK', 'Crítico'),
(6, '1189-ZXPLM', 'Neutral'),
(7, '8845-RTNBV', 'Satisfecho'),
(8, '2290-WQASD', 'Frustrado'),
(9, '5567-JKLPO', 'Neutral'),
(10, '6034-MNBVC', 'Satisfecho');

-- public.cuentas_contrataciones
INSERT INTO public.cuentas_contrataciones (id, customer_id, tipo_contrato_id, metodo_pago_id, paperless_billing, monthly_charges, total_charges) VALUES
(1, '7823-QPXRL', 2, 1, true,  8500.50,  204012.00),
(2, '4410-BNTOS', 1, 5, false, 4200.00,  12600.00),
(3, '9987-LKMWA', 3, 2, true,  12300.75, 713443.50),
(4, '3356-VFDCT', 1, 7, true,  6800.00,  81600.00),
(5, '6621-HYUIK', 4, 6, false, 3100.25,  3100.25),
(6, '1189-ZXPLM', 2, 3, true,  9750.00,  438750.00),
(7, '8845-RTNBV', 3, 4, true,  15200.00, 1018400.00),
(8, '2290-WQASD', 1, 5, false, 5400.50,  32403.00),
(9, '5567-JKLPO', 6, 2, true,  22000.00, 660000.00),
(10, '6034-MNBVC', 8, 9, false, 7300.00, 109500.00);

-- public.sesiones_chat
INSERT INTO public.sesiones_chat (id, contacto_id, fecha_inicio, canal, estado, ultima_actividad) VALUES
(1, 1, '2026-09-10 09:15:00', 'WebChat',  'cerrada', '2026-09-10 09:42:00'),
(2, 2, '2026-09-12 14:30:00', 'WebChat',  'cerrada', '2026-09-12 15:05:00'),
(3, 3, '2026-09-15 11:00:00', 'WhatsApp', 'abierta', '2026-09-15 11:20:00'),
(4, 4, '2026-09-16 16:45:00', 'WebChat',  'cerrada', '2026-09-16 17:10:00'),
(5, 5, '2026-09-18 08:20:00', 'WebChat',  'cerrada', '2026-09-18 08:55:00'),
(6, 6, '2026-09-19 19:00:00', 'WhatsApp', 'abierta', '2026-09-19 19:30:00'),
(7, 7, '2026-09-20 10:10:00', 'WebChat',  'cerrada', '2026-09-20 10:40:00'),
(8, 8, '2026-09-21 13:25:00', 'WebChat',  'cerrada', '2026-09-21 14:00:00'),
(9, 9, '2026-09-22 09:50:00', 'WhatsApp', 'cerrada', '2026-09-22 10:15:00'),
(10, 10, '2026-09-22 17:05:00', 'WebChat', 'abierta', '2026-09-22 17:22:00');

-- public.tickets_soporte
INSERT INTO public.tickets_soporte (id, sesion_id, tipo_ticket, descripcion_problema, nivel_enojo_detectado, probabilidad_churn_ml, estado_ticket, fecha_creacion, prioridad, intencion_cancelacion) VALUES
(1, 1, 'Facturación',    'La clienta de Palermo, Buenos Aires, reclama que la factura de septiembre le llegó duplicada por un total de $17.001. Pidió que la contacten al +54 9 11 4522-3390.', 6, 0.42, 'Cerrado', '2026-09-10 09:40:00', 'NORMAL',  false),
(2, 2, 'Técnico',        'Cliente de Rosario reporta cortes intermitentes de internet fibra durante la noche desde hace 4 días. Ya reinició el router dos veces sin resultado.', 8, 0.71, 'Cerrado', '2026-09-12 15:00:00', 'CRITICO', true),
(3, 3, 'Administrativo', 'Cliente de Córdoba Capital solicita cambio de titularidad de la línea porque se mudó de domicilio la semana pasada.', 2, 0.15, 'Abierto', '2026-09-15 11:18:00', 'NORMAL',  false),
(4, 4, 'Retención',      'Cliente de Mendoza amenaza con darse de baja si no le bajan el monto mensual, dice que la competencia ofrece un plan más barato en su barrio.', 9, 0.83, 'Abierto', '2026-09-16 17:08:00', 'CRITICO', true),
(5, 5, 'Facturación',    'Clienta de La Plata pregunta por qué le cobraron un servicio adicional de streaming que asegura no haber contratado.', 5, 0.38, 'Cerrado', '2026-09-18 08:50:00', 'NORMAL',  false),
(6, 6, 'Técnico',        'Cliente de Mar del Plata sin línea telefónica fija desde la tormenta del fin de semana. Pide visita técnica urgente, contacto +54 9 223 455-1290.', 7, 0.55, 'Abierto', '2026-09-19 19:25:00', 'CRITICO', false),
(7, 7, 'Retención',      'Cliente jubilado de Salta plantea directamente que quiere dar de baja todos los servicios por el aumento de tarifas del último trimestre.', 8, 0.91, 'Abierto', '2026-09-20 10:35:00', 'CRITICO', true),
(8, 8, 'Administrativo', 'Cliente de San Miguel de Tucumán pide factura electrónica en vez de la factura en papel que sigue recibiendo.', 1, 0.20, 'Cerrado', '2026-09-21 13:55:00', 'NORMAL',  false),
(9, 9, 'Técnico',        'Clienta de Neuquén reporta velocidad de internet muy por debajo de lo contratado (300MB) durante todo el fin de semana.', 6, 0.48, 'Cerrado', '2026-09-22 10:12:00', 'NORMAL',  false),
(10, 10, 'Facturación',  'Cliente de Bahía Blanca no entiende un cargo de $2.300 en concepto de "línea adicional" en su última factura.', 4, 0.33, 'Abierto', '2026-09-22 17:20:00', 'NORMAL', false);

-- public.usuarios
INSERT INTO public.usuarios (id, customer_id, email, password_hash, created_at) VALUES
(1, '7823-QPXRL', 'valentina.diaz@gmail.com',    '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '2026-02-10 10:00:00'),
(2, '4410-BNTOS', 'nicolas.romero@hotmail.com',  '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '2026-08-20 11:15:00'),
(3, '9987-LKMWA', 'camila.torres@gmail.com',     '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '2021-11-05 09:30:00'),
(4, '3356-VFDCT', 'martin.acosta@yahoo.com.ar',  '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '2025-09-15 14:20:00'),
(5, '6621-HYUIK', 'sofia.benitez@gmail.com',     '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '2026-08-25 16:40:00'),
(6, '1189-ZXPLM', 'diego.molina@outlook.com',    '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '2022-12-01 08:10:00'),
(7, '8845-RTNBV', 'agustina.rios@gmail.com',     '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '2020-06-18 13:00:00'),
(8, '2290-WQASD', 'facundo.gimenez@hotmail.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '2026-03-30 17:50:00'),
(9, '5567-JKLPO', 'rocio.medina@gmail.com',      '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '2024-03-10 12:05:00'),
(10, '6034-MNBVC', 'tomas.herrera@gmail.com',    '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '2025-06-22 15:35:00');

-- public.historial_mensajes
INSERT INTO public.historial_mensajes (id, sesion_id, remitente, contenido_texto, fecha_hora) VALUES
(1, 1, 'cliente', 'Hola, buen día, les escribo porque me llegó la factura duplicada este mes y no entiendo por qué.', '2026-09-10 09:16:00'),
(2, 2, 'cliente', 'Se me corta el internet todas las noches, ya reinicié el router dos veces y sigue igual.', '2026-09-12 14:31:00'),
(3, 3, 'bot', 'Entiendo, para gestionar el cambio de titularidad voy a necesitar el nuevo domicilio y un documento que lo respalde.', '2026-09-15 11:05:00'),
(4, 4, 'cliente', 'Si no me bajan la cuota me doy de baja, en mi barrio en Mendoza hay ofertas mucho más baratas.', '2026-09-16 16:47:00'),
(5, 5, 'cliente', 'No contraté ningún streaming adicional, quiero que me saquen ese cargo de la factura.', '2026-09-18 08:22:00'),
(6, 6, 'cliente', 'Desde la tormenta del sábado no tengo línea fija, necesito que manden a alguien lo antes posible.', '2026-09-19 19:02:00'),
(7, 7, 'cliente', 'Ya está, quiero dar de baja todo, todos los meses aumentan y no dan explicaciones.', '2026-09-20 10:12:00'),
(8, 8, 'bot', 'Perfecto, te configuro la factura electrónica para que dejes de recibirla en papel a partir del próximo ciclo.', '2026-09-21 13:27:00'),
(9, 9, 'cliente', 'La velocidad de internet está muy por debajo de lo que contraté, hice el test y me da menos de la mitad.', '2026-09-22 09:52:00'),
(10, 10, 'cliente', 'Hola, tengo una duda con un cargo de línea adicional que no reconozco en mi factura.', '2026-09-22 17:06:00');

-- Reacomodar las secuencias para que los próximos INSERT (app/n8n) no choquen con estos IDs
-- pg_get_serial_sequence devuelve la secuencia REAL de cada columna serial (el schema crea
-- secuencias sueltas con el mismo nombre, y serial4 termina usando otra: *_seq1).
SELECT setval(pg_get_serial_sequence('public.metodos_pago','id'), (SELECT MAX(id) FROM public.metodos_pago));
SELECT setval(pg_get_serial_sequence('public.servicios_catalogo','id'), (SELECT MAX(id) FROM public.servicios_catalogo));
SELECT setval(pg_get_serial_sequence('public.tipos_contrato','id'), (SELECT MAX(id) FROM public.tipos_contrato));
SELECT setval(pg_get_serial_sequence('public.crm_contactos','id'), (SELECT MAX(id) FROM public.crm_contactos));
SELECT setval(pg_get_serial_sequence('public.cuentas_contrataciones','id'), (SELECT MAX(id) FROM public.cuentas_contrataciones));
SELECT setval(pg_get_serial_sequence('public.sesiones_chat','id'), (SELECT MAX(id) FROM public.sesiones_chat));
SELECT setval(pg_get_serial_sequence('public.tickets_soporte','id'), (SELECT MAX(id) FROM public.tickets_soporte));
SELECT setval(pg_get_serial_sequence('public.usuarios','id'), (SELECT MAX(id) FROM public.usuarios));
SELECT setval(pg_get_serial_sequence('public.historial_mensajes','id'), (SELECT MAX(id) FROM public.historial_mensajes));
