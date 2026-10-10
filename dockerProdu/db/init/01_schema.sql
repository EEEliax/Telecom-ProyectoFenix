-- DROP SCHEMA public;

-- CREATE SCHEMA public AUTHORIZATION pg_database_owner;  -- comentado: Postgres 16 ya crea 'public' por defecto en cada base nueva

-- DROP SEQUENCE public.crm_contactos_id_seq;

CREATE SEQUENCE public.crm_contactos_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.cuentas_contrataciones_id_seq;

CREATE SEQUENCE public.cuentas_contrataciones_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.historial_mensajes_id_seq;

CREATE SEQUENCE public.historial_mensajes_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.metodos_pago_id_seq;

CREATE SEQUENCE public.metodos_pago_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.servicios_catalogo_id_seq;

CREATE SEQUENCE public.servicios_catalogo_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.sesiones_chat_id_seq;

CREATE SEQUENCE public.sesiones_chat_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.tickets_soporte_id_seq;

CREATE SEQUENCE public.tickets_soporte_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.tipos_contrato_id_seq;

CREATE SEQUENCE public.tipos_contrato_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.usuarios_id_seq;

CREATE SEQUENCE public.usuarios_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;-- public.clientes definition

-- Drop table

-- DROP TABLE public.clientes;

CREATE TABLE public.clientes (
	customer_id varchar(50) NOT NULL,
	gender varchar(10) NOT NULL,
	senior_citizen bool NOT NULL,
	partner bool NOT NULL,
	dependents bool NOT NULL,
	tenure_meses int4 DEFAULT 0 NOT NULL,
	churn_historico bool DEFAULT false NULL,
	CONSTRAINT clientes_pkey PRIMARY KEY (customer_id)
);


-- public.metodos_pago definition

-- Drop table

-- DROP TABLE public.metodos_pago;

CREATE TABLE public.metodos_pago (
	id serial4 NOT NULL,
	descripcion varchar(40) NOT NULL,
	CONSTRAINT metodos_pago_descripcion_key UNIQUE (descripcion),
	CONSTRAINT metodos_pago_pkey PRIMARY KEY (id)
);


-- public.servicios_catalogo definition

-- Drop table

-- DROP TABLE public.servicios_catalogo;

CREATE TABLE public.servicios_catalogo (
	id serial4 NOT NULL,
	nombre_servicio varchar(50) NOT NULL,
	categoria varchar(20) NOT NULL,
	CONSTRAINT servicios_catalogo_nombre_servicio_key UNIQUE (nombre_servicio),
	CONSTRAINT servicios_catalogo_pkey PRIMARY KEY (id)
);


-- public.tipos_contrato definition

-- Drop table

-- DROP TABLE public.tipos_contrato;

CREATE TABLE public.tipos_contrato (
	id serial4 NOT NULL,
	descripcion varchar(30) NOT NULL,
	CONSTRAINT tipos_contrato_descripcion_key UNIQUE (descripcion),
	CONSTRAINT tipos_contrato_pkey PRIMARY KEY (id)
);


-- public.cliente_servicios_pivot definition

-- Drop table

-- DROP TABLE public.cliente_servicios_pivot;

CREATE TABLE public.cliente_servicios_pivot (
	customer_id varchar(50) NOT NULL,
	servicio_id int4 NOT NULL,
	estado_servicio varchar(30) NOT NULL,
	CONSTRAINT cliente_servicios_pivot_pkey PRIMARY KEY (customer_id, servicio_id),
	CONSTRAINT cliente_servicios_pivot_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.clientes(customer_id) ON DELETE CASCADE,
	CONSTRAINT cliente_servicios_pivot_servicio_id_fkey FOREIGN KEY (servicio_id) REFERENCES public.servicios_catalogo(id)
);


-- public.crm_contactos definition

-- Drop table

-- DROP TABLE public.crm_contactos;

CREATE TABLE public.crm_contactos (
	id serial4 NOT NULL,
	customer_id varchar(50) NULL,
	estado_emocional varchar(20) DEFAULT 'Neutral'::character varying NULL,
	CONSTRAINT crm_contactos_customer_id_key UNIQUE (customer_id),
	CONSTRAINT crm_contactos_pkey PRIMARY KEY (id),
	CONSTRAINT crm_contactos_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.clientes(customer_id) ON DELETE SET NULL
);


-- public.cuentas_contrataciones definition

-- Drop table

-- DROP TABLE public.cuentas_contrataciones;

CREATE TABLE public.cuentas_contrataciones (
	id serial4 NOT NULL,
	customer_id varchar(50) NULL,
	tipo_contrato_id int4 NULL,
	metodo_pago_id int4 NULL,
	paperless_billing bool NOT NULL,
	monthly_charges numeric(10, 2) NOT NULL,
	total_charges numeric(10, 2) NOT NULL,
	CONSTRAINT cuentas_contrataciones_customer_id_key UNIQUE (customer_id),
	CONSTRAINT cuentas_contrataciones_pkey PRIMARY KEY (id),
	CONSTRAINT cuentas_contrataciones_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.clientes(customer_id) ON DELETE CASCADE,
	CONSTRAINT cuentas_contrataciones_metodo_pago_id_fkey FOREIGN KEY (metodo_pago_id) REFERENCES public.metodos_pago(id),
	CONSTRAINT cuentas_contrataciones_tipo_contrato_id_fkey FOREIGN KEY (tipo_contrato_id) REFERENCES public.tipos_contrato(id)
);


-- public.sesiones_chat definition

-- Drop table

-- DROP TABLE public.sesiones_chat;

CREATE TABLE public.sesiones_chat (
	id serial4 NOT NULL,
	contacto_id int4 NULL,
	fecha_inicio timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	canal varchar(20) DEFAULT 'WebChat'::character varying NULL,
	estado varchar(30) DEFAULT 'abierta'::character varying NOT NULL,
	ultima_actividad timestamp DEFAULT now() NOT NULL,
	CONSTRAINT sesiones_chat_pkey PRIMARY KEY (id),
	CONSTRAINT sesiones_chat_contacto_id_fkey FOREIGN KEY (contacto_id) REFERENCES public.crm_contactos(id) ON DELETE CASCADE
);
CREATE INDEX idx_sesiones_chat_contacto ON public.sesiones_chat USING btree (contacto_id);
CREATE INDEX idx_sesiones_chat_gc ON public.sesiones_chat USING btree (estado, ultima_actividad);


-- public.tickets_soporte definition

-- Drop table

-- DROP TABLE public.tickets_soporte;

CREATE TABLE public.tickets_soporte (
	id serial4 NOT NULL,
	sesion_id int4 NULL,
	tipo_ticket varchar(20) NOT NULL,
	descripcion_problema text NOT NULL,
	nivel_enojo_detectado int4 NOT NULL,
	probabilidad_churn_ml numeric(5, 2) NULL,
	estado_ticket varchar(20) DEFAULT 'Abierto'::character varying NULL,
	fecha_creacion timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	prioridad varchar(20) DEFAULT 'NORMAL'::character varying NULL,
	intencion_cancelacion bool DEFAULT false NULL,
	CONSTRAINT tickets_soporte_pkey PRIMARY KEY (id),
	CONSTRAINT tickets_soporte_sesion_id_fkey FOREIGN KEY (sesion_id) REFERENCES public.sesiones_chat(id)
);
CREATE INDEX idx_tickets_soporte_sesion ON public.tickets_soporte USING btree (sesion_id);


-- public.usuarios definition

-- Drop table

-- DROP TABLE public.usuarios;

CREATE TABLE public.usuarios (
	id serial4 NOT NULL,
	customer_id varchar(50) NULL,
	email varchar(254) NOT NULL,
	password_hash varchar(72) NOT NULL,
	created_at timestamp DEFAULT now() NOT NULL,
	CONSTRAINT usuarios_email_key UNIQUE (email),
	CONSTRAINT usuarios_pkey PRIMARY KEY (id),
	CONSTRAINT usuarios_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.clientes(customer_id) ON DELETE CASCADE
);
CREATE INDEX idx_usuarios_customer ON public.usuarios USING btree (customer_id);


-- public.historial_mensajes definition

-- Drop table

-- DROP TABLE public.historial_mensajes;

CREATE TABLE public.historial_mensajes (
	id serial4 NOT NULL,
	sesion_id int4 NULL,
	remitente varchar(10) NOT NULL,
	contenido_texto text NOT NULL,
	fecha_hora timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT historial_mensajes_pkey PRIMARY KEY (id),
	CONSTRAINT historial_mensajes_sesion_id_fkey FOREIGN KEY (sesion_id) REFERENCES public.sesiones_chat(id) ON DELETE CASCADE
);
CREATE INDEX idx_historial_mensajes_sesion_fecha ON public.historial_mensajes USING btree (sesion_id, fecha_hora);