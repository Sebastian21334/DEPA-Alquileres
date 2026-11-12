--
-- PostgreSQL database dump
--

\restrict 7peKf1Rt8kVZd2EGsFuvaqaqoQelcs7HqcsvA3oHvjTxcYLRVGIyCSoWpoHZx6w

-- Dumped from database version 18.6 (Debian 18.6-1.pgdg13+2)
-- Dumped by pg_dump version 18.6 (Debian 18.6-1.pgdg13+2)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: disputa_origen_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.disputa_origen_enum AS ENUM (
    'CONTRACARGO'
);


--
-- Name: reclamo_categoria_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.reclamo_categoria_enum AS ENUM (
    'LIMPIEZA',
    'MANTENIMIENTO',
    'INGRESO',
    'DESCRIPCION',
    'OTRO'
);


--
-- Name: reclamo_mensaje_visibilidad_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.reclamo_mensaje_visibilidad_enum AS ENUM (
    'TODOS',
    'ADMIN'
);


--
-- Name: reclamo_resolucion_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.reclamo_resolucion_enum AS ENUM (
    'SIN_DEVOLUCION',
    'DEVOLUCION_TOTAL',
    'DEVOLUCION_PARCIAL'
);


--
-- Name: reembolso_origen_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.reembolso_origen_enum AS ENUM (
    'CANCELACION',
    'RECLAMO',
    'CONTRACARGO',
    'PAGO_TARDIO',
    'AJUSTE_ADMIN'
);


--
-- Name: reembolso_tipo_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.reembolso_tipo_enum AS ENUM (
    'TOTAL',
    'PARCIAL',
    'CONTRACARGO'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: ambito; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ambito (
    codigo character varying(40) NOT NULL,
    nombre character varying(100) NOT NULL
);


--
-- Name: anunciante; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.anunciante (
    id_usuario integer NOT NULL,
    verificado boolean DEFAULT false NOT NULL,
    cuit_cuil character varying(15),
    numero_contacto character varying(20) NOT NULL,
    id_tipo_anunciante integer,
    cuit_cuil_historico character varying(15)
);


--
-- Name: ciudad; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ciudad (
    id_ciudad integer NOT NULL,
    nombre character varying(100) NOT NULL,
    id_provincia integer
);


--
-- Name: ciudad_id_ciudad_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ciudad_id_ciudad_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ciudad_id_ciudad_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ciudad_id_ciudad_seq OWNED BY public.ciudad.id_ciudad;


--
-- Name: consulta_cotizacion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.consulta_cotizacion (
    id integer NOT NULL,
    realizada_en timestamp with time zone DEFAULT now() NOT NULL,
    exitosa boolean NOT NULL,
    error character varying(300)
);


--
-- Name: consulta_cotizacion_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.consulta_cotizacion_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: consulta_cotizacion_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.consulta_cotizacion_id_seq OWNED BY public.consulta_cotizacion.id;


--
-- Name: cotizacion_dolar; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cotizacion_dolar (
    id integer NOT NULL,
    compra numeric(18,6) NOT NULL,
    venta numeric(18,6) NOT NULL,
    tipo character varying(20) NOT NULL,
    proveedor character varying(60) NOT NULL,
    actualizada_fuente_en timestamp with time zone NOT NULL,
    consultada_en timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: cotizacion_dolar_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.cotizacion_dolar_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: cotizacion_dolar_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.cotizacion_dolar_id_seq OWNED BY public.cotizacion_dolar.id;


--
-- Name: disputa; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.disputa (
    id_disputa integer NOT NULL,
    id_reserva integer NOT NULL,
    id_pago integer NOT NULL,
    origen public.disputa_origen_enum NOT NULL,
    estado character varying(40) DEFAULT 'ABIERTA'::character varying NOT NULL,
    importe numeric(10,2) NOT NULL,
    moneda character varying(3) DEFAULT 'ARS'::character varying NOT NULL,
    motivo character varying(500),
    chargeback_id character varying(150),
    referencia_externa character varying(150),
    evidencia jsonb,
    fecha_limite_respuesta timestamp without time zone,
    resolucion character varying(500),
    estado_pago_previo character varying(20),
    estado_liquidacion_previo character varying(40),
    id_resuelto_por integer,
    creado_en timestamp without time zone DEFAULT now() NOT NULL,
    resuelto_en timestamp without time zone,
    ambito_estado character varying(40) DEFAULT 'DISPUTA'::character varying NOT NULL,
    CONSTRAINT ck_disputa_estado_ambito CHECK (((ambito_estado)::text = 'DISPUTA'::text)),
    CONSTRAINT ck_disputa_importe CHECK ((importe > (0)::numeric))
);


--
-- Name: disputa_id_disputa_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.disputa ALTER COLUMN id_disputa ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.disputa_id_disputa_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: eliminacion_documento; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.eliminacion_documento (
    id integer NOT NULL,
    url character varying(500) NOT NULL,
    intentos integer DEFAULT 0 NOT NULL,
    proximo_intento timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: eliminacion_documento_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.eliminacion_documento_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: eliminacion_documento_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.eliminacion_documento_id_seq OWNED BY public.eliminacion_documento.id;


--
-- Name: estado; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.estado (
    id_estado integer NOT NULL,
    codigo_ambito character varying(40) NOT NULL,
    codigo character varying(40) NOT NULL,
    nombre character varying(100) NOT NULL
);


--
-- Name: estado_id_estado_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.estado ALTER COLUMN id_estado ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.estado_id_estado_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: favorito; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.favorito (
    id_favorito integer NOT NULL,
    creado_en timestamp without time zone DEFAULT now() NOT NULL,
    id_usuario integer,
    id_publicacion integer
);


--
-- Name: favorito_id_favorito_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.favorito_id_favorito_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: favorito_id_favorito_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.favorito_id_favorito_seq OWNED BY public.favorito.id_favorito;


--
-- Name: fecha; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fecha (
    id_fecha integer NOT NULL,
    fecha date NOT NULL,
    disponible boolean DEFAULT true NOT NULL,
    id_publicacion integer NOT NULL,
    id_reserva integer
);


--
-- Name: fecha_id_fecha_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.fecha_id_fecha_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: fecha_id_fecha_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.fecha_id_fecha_seq OWNED BY public.fecha.id_fecha;


--
-- Name: imagen; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.imagen (
    id_imagen integer NOT NULL,
    url character varying(250) NOT NULL,
    id_publicacion integer,
    orden integer DEFAULT 0 NOT NULL
);


--
-- Name: imagen_id_imagen_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.imagen_id_imagen_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: imagen_id_imagen_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.imagen_id_imagen_seq OWNED BY public.imagen.id_imagen;


--
-- Name: liquidacion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.liquidacion (
    id_liquidacion integer NOT NULL,
    id_reserva integer NOT NULL,
    estado character varying(40) DEFAULT 'NO_APLICA'::character varying NOT NULL,
    ambito_estado character varying(40) DEFAULT 'LIQUIDACION_RESERVA'::character varying NOT NULL,
    importe numeric(10,2),
    moneda character varying(3),
    referencia character varying(150),
    observacion character varying(500),
    id_admin_resolucion integer,
    fecha_resolucion timestamp without time zone,
    fecha_pago_propietario timestamp without time zone,
    creado_en timestamp without time zone DEFAULT now() NOT NULL,
    actualizado_en timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT ck_liquidacion_estado_ambito CHECK (((ambito_estado)::text = 'LIQUIDACION_RESERVA'::text))
);


--
-- Name: liquidacion_id_liquidacion_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.liquidacion ALTER COLUMN id_liquidacion ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.liquidacion_id_liquidacion_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: mensaje; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mensaje (
    id_mensaje integer NOT NULL,
    texto character varying(250) NOT NULL,
    fecha timestamp without time zone NOT NULL,
    id_origen_usuario integer,
    id_destino_usuario integer,
    id_publicacion integer,
    leido boolean DEFAULT false NOT NULL,
    fecha_lectura timestamp without time zone
);


--
-- Name: mensaje_id_mensaje_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.mensaje_id_mensaje_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: mensaje_id_mensaje_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.mensaje_id_mensaje_seq OWNED BY public.mensaje.id_mensaje;


--
-- Name: modalidad; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.modalidad (
    id_modalidad integer NOT NULL,
    nombre character varying(100) NOT NULL,
    descripcion character varying(255),
    permite_reservas_por_fecha boolean
);


--
-- Name: modalidad_id_modalidad_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.modalidad_id_modalidad_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: modalidad_id_modalidad_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.modalidad_id_modalidad_seq OWNED BY public.modalidad.id_modalidad;


--
-- Name: pago; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pago (
    id_pago integer NOT NULL,
    external_reference character varying(100) NOT NULL,
    preference_id character varying(255),
    payment_id character varying(100),
    status character varying(50) DEFAULT 'pending'::character varying NOT NULL,
    status_detail character varying(100),
    amount numeric(10,2) NOT NULL,
    currency character varying(3) DEFAULT 'ARS'::character varying NOT NULL,
    payment_method_id character varying(100),
    idempotency_key character varying(36) NOT NULL,
    approved_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    id_reserva integer,
    amount_refunded numeric(10,2) DEFAULT 0 NOT NULL,
    refunded_at timestamp without time zone,
    chargeback_id character varying(100)
);


--
-- Name: pago_id_pago_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.pago_id_pago_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pago_id_pago_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.pago_id_pago_seq OWNED BY public.pago.id_pago;


--
-- Name: provincia; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.provincia (
    id_provincia integer NOT NULL,
    nombre character varying(100) NOT NULL
);


--
-- Name: provincia_id_provincia_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.provincia_id_provincia_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: provincia_id_provincia_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.provincia_id_provincia_seq OWNED BY public.provincia.id_provincia;


--
-- Name: publicacion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.publicacion (
    id_publicacion integer NOT NULL,
    titulo character varying(255) NOT NULL,
    descripcion character varying(255) NOT NULL,
    fecha_publicacion date NOT NULL,
    precio numeric(10,2) NOT NULL,
    activa boolean DEFAULT false NOT NULL,
    direccion character varying(255) NOT NULL,
    cantidad_ambientes integer NOT NULL,
    superficie numeric(10,2) NOT NULL,
    id_tipo_moneda integer,
    id_modalidad integer,
    id_anunciante integer,
    id_provincia integer,
    id_ciudad integer,
    id_tipo_propiedad integer,
    latitud numeric(10,7),
    longitud numeric(10,7),
    visualizaciones integer DEFAULT 0 NOT NULL,
    motivo_baja_admin character varying(500)
);


--
-- Name: publicacion_id_publicacion_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.publicacion_id_publicacion_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: publicacion_id_publicacion_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.publicacion_id_publicacion_seq OWNED BY public.publicacion.id_publicacion;


--
-- Name: reclamo_evidencia; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reclamo_evidencia (
    id_evidencia integer NOT NULL,
    id_reclamo integer NOT NULL,
    id_usuario integer,
    url character varying(500) NOT NULL,
    nombre_archivo character varying(255) NOT NULL,
    tipo character varying(100) DEFAULT 'image/jpeg'::character varying NOT NULL,
    creado_en timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: reclamo_evidencia_id_evidencia_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.reclamo_evidencia ALTER COLUMN id_evidencia ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.reclamo_evidencia_id_evidencia_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: reclamo_mensaje; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reclamo_mensaje (
    id_mensaje_reclamo integer NOT NULL,
    id_reclamo integer NOT NULL,
    id_autor integer NOT NULL,
    texto character varying(1000) NOT NULL,
    visible_para public.reclamo_mensaje_visibilidad_enum DEFAULT 'TODOS'::public.reclamo_mensaje_visibilidad_enum NOT NULL,
    creado_en timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: reclamo_mensaje_id_mensaje_reclamo_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.reclamo_mensaje ALTER COLUMN id_mensaje_reclamo ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.reclamo_mensaje_id_mensaje_reclamo_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: reclamo_reserva; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reclamo_reserva (
    id_reclamo integer NOT NULL,
    id_reserva integer NOT NULL,
    id_inquilino integer NOT NULL,
    id_anunciante integer,
    categoria public.reclamo_categoria_enum NOT NULL,
    descripcion character varying(1000) NOT NULL,
    estado character varying(40) DEFAULT 'ABIERTO'::character varying NOT NULL,
    resolucion public.reclamo_resolucion_enum,
    importe_reembolso numeric(10,2),
    id_administrador_resolucion integer,
    creado_en timestamp without time zone DEFAULT now() NOT NULL,
    resuelto_en timestamp without time zone,
    ambito_estado character varying(40) DEFAULT 'RECLAMO'::character varying NOT NULL,
    CONSTRAINT ck_reclamo_reserva_estado_ambito CHECK (((ambito_estado)::text = 'RECLAMO'::text))
);


--
-- Name: reclamo_reserva_id_reclamo_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.reclamo_reserva ALTER COLUMN id_reclamo ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.reclamo_reserva_id_reclamo_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: reembolso; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reembolso (
    id_reembolso integer NOT NULL,
    id_reserva integer NOT NULL,
    id_pago integer NOT NULL,
    tipo public.reembolso_tipo_enum NOT NULL,
    origen public.reembolso_origen_enum NOT NULL,
    importe numeric(10,2) NOT NULL,
    moneda character varying(3) DEFAULT 'ARS'::character varying NOT NULL,
    estado character varying(40) DEFAULT 'PENDIENTE'::character varying NOT NULL,
    motivo character varying(500) NOT NULL,
    referencia_interna character varying(150),
    referencia_externa character varying(150),
    id_externo character varying(100),
    idempotency_key character varying(36) NOT NULL,
    id_solicitado_por integer,
    id_resuelto_por integer,
    creado_en timestamp without time zone DEFAULT now() NOT NULL,
    resuelto_en timestamp without time zone,
    error_detalle character varying(500),
    ambito_estado character varying(40) DEFAULT 'REEMBOLSO'::character varying NOT NULL,
    CONSTRAINT ck_reembolso_estado_ambito CHECK (((ambito_estado)::text = 'REEMBOLSO'::text)),
    CONSTRAINT ck_reembolso_importe CHECK ((importe > (0)::numeric))
);


--
-- Name: reembolso_id_reembolso_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.reembolso ALTER COLUMN id_reembolso ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.reembolso_id_reembolso_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: reprogramacion_reserva; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reprogramacion_reserva (
    id_reprogramacion integer NOT NULL,
    id_reserva integer NOT NULL,
    fecha_inicio_anterior date NOT NULL,
    fecha_fin_anterior date NOT NULL,
    fecha_inicio_nueva date NOT NULL,
    fecha_fin_nueva date NOT NULL,
    creada_en timestamp without time zone DEFAULT now() NOT NULL,
    notificada_en timestamp without time zone,
    destinatario character varying(150),
    detalle jsonb NOT NULL
);


--
-- Name: reprogramacion_reserva_id_reprogramacion_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.reprogramacion_reserva_id_reprogramacion_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: reprogramacion_reserva_id_reprogramacion_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.reprogramacion_reserva_id_reprogramacion_seq OWNED BY public.reprogramacion_reserva.id_reprogramacion;


--
-- Name: reserva; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reserva (
    id_reserva integer NOT NULL,
    finalizada boolean DEFAULT false NOT NULL,
    monto_pago numeric(10,2) NOT NULL,
    id_usuario integer,
    id_publicacion integer,
    fecha_inicio date,
    fecha_fin date,
    usuario_nombre character varying(100),
    usuario_apellido character varying(100),
    usuario_email character varying(150),
    usuario_telefono character varying(20),
    cancelada boolean DEFAULT false NOT NULL,
    fecha_cancelacion timestamp without time zone,
    estado_pago character varying(40) DEFAULT 'APROBADO'::character varying NOT NULL,
    pago_vencimiento timestamp without time zone,
    fecha_pago timestamp without time zone,
    email_confirmacion_inquilino_enviado boolean DEFAULT false NOT NULL,
    email_nueva_reserva_anunciante_enviado boolean DEFAULT false NOT NULL,
    codigo_alojamiento character varying(8),
    codigo_generado_en timestamp without time zone,
    codigo_validado_en timestamp without time zone,
    intentos_codigo integer DEFAULT 0 NOT NULL,
    estado_liquidacion character varying(40) DEFAULT 'NO_APLICA'::character varying NOT NULL,
    fecha_resolucion_liquidacion timestamp without time zone,
    referencia_liquidacion character varying(150),
    observacion_liquidacion character varying(500),
    precio_unitario_contratado numeric(10,2),
    importe_contratado numeric(10,2),
    moneda_contratada character varying(3),
    moneda_origen character varying(3),
    importe_origen numeric(10,2),
    id_cotizacion_dolar integer,
    cotizacion_aceptada_en timestamp with time zone,
    presupuesto_emitido_en timestamp with time zone,
    presupuesto_vence_en timestamp with time zone,
    motivo_cancelacion character varying(500),
    cancelada_por character varying(20),
    ambito_estado_pago character varying(40) DEFAULT 'PAGO_RESERVA'::character varying NOT NULL,
    ambito_estado_liquidacion character varying(40) DEFAULT 'LIQUIDACION_RESERVA'::character varying NOT NULL,
    CONSTRAINT ck_reserva_estado_liquidacion_ambito CHECK (((ambito_estado_liquidacion)::text = 'LIQUIDACION_RESERVA'::text)),
    CONSTRAINT ck_reserva_estado_pago_ambito CHECK (((ambito_estado_pago)::text = 'PAGO_RESERVA'::text))
);


--
-- Name: reserva_id_reserva_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.reserva_id_reserva_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: reserva_id_reserva_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.reserva_id_reserva_seq OWNED BY public.reserva.id_reserva;


--
-- Name: revision_verificacion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.revision_verificacion (
    id_revision_verificacion integer NOT NULL,
    numero_revision integer NOT NULL,
    estado character varying(40) NOT NULL,
    motivo character varying(500),
    creada_en timestamp without time zone DEFAULT now() NOT NULL,
    id_anunciante integer,
    id_administrador integer,
    ambito_estado character varying(40) DEFAULT 'VERIFICACION_ANUNCIANTE'::character varying NOT NULL,
    CONSTRAINT ck_revision_verificacion_estado_ambito CHECK (((ambito_estado)::text = 'VERIFICACION_ANUNCIANTE'::text))
);


--
-- Name: revision_verificacion_id_revision_verificacion_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.revision_verificacion_id_revision_verificacion_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: revision_verificacion_id_revision_verificacion_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.revision_verificacion_id_revision_verificacion_seq OWNED BY public.revision_verificacion.id_revision_verificacion;


--
-- Name: rol; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rol (
    id_rol integer NOT NULL,
    nombre character varying(100) NOT NULL,
    descripcion character varying(250)
);


--
-- Name: rol_id_rol_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.rol_id_rol_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: rol_id_rol_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.rol_id_rol_seq OWNED BY public.rol.id_rol;


--
-- Name: solicitud_cancelacion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.solicitud_cancelacion (
    id_solicitud_cancelacion integer NOT NULL,
    id_reserva integer NOT NULL,
    id_solicitante integer NOT NULL,
    motivo character varying(500) NOT NULL,
    estado character varying(40) DEFAULT 'PENDIENTE'::character varying NOT NULL,
    id_decidida_por integer,
    decidida_en timestamp without time zone,
    observacion character varying(500),
    creada_en timestamp without time zone DEFAULT now() NOT NULL,
    ambito_estado character varying(40) DEFAULT 'SOLICITUD_CANCELACION'::character varying NOT NULL,
    CONSTRAINT ck_solicitud_cancelacion_estado_ambito CHECK (((ambito_estado)::text = 'SOLICITUD_CANCELACION'::text))
);


--
-- Name: solicitud_cancelacion_id_solicitud_cancelacion_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.solicitud_cancelacion ALTER COLUMN id_solicitud_cancelacion ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.solicitud_cancelacion_id_solicitud_cancelacion_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: solicitud_verificacion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.solicitud_verificacion (
    id_solicitud_verificacion integer NOT NULL,
    estado character varying(40) DEFAULT 'borrador'::character varying NOT NULL,
    dni_frente_url character varying(500),
    dni_dorso_url character varying(500),
    rostro_url character varying(500),
    motivo_rechazo character varying(500),
    numero_revision integer DEFAULT 1 NOT NULL,
    creada_en timestamp without time zone DEFAULT now() NOT NULL,
    actualizada_en timestamp without time zone DEFAULT now() NOT NULL,
    id_anunciante integer,
    prueba_vida_desafio uuid,
    prueba_vida_revision integer,
    prueba_vida_rostro_hash character varying(64),
    prueba_vida_validada_en timestamp with time zone,
    prueba_vida_vence_en timestamp with time zone,
    prueba_vida_consumida_en timestamp with time zone,
    razon_social character varying(150),
    matricula_profesional character varying(50),
    colegio_profesional character varying(150),
    domicilio_comercial character varying(255),
    dni_corredor character varying(15),
    matricula_url character varying(500),
    constancia_cuit_url character varying(500),
    ambito_estado character varying(40) DEFAULT 'VERIFICACION_ANUNCIANTE'::character varying NOT NULL,
    CONSTRAINT ck_solicitud_verificacion_estado_ambito CHECK (((ambito_estado)::text = 'VERIFICACION_ANUNCIANTE'::text))
);


--
-- Name: solicitud_verificacion_id_solicitud_verificacion_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.solicitud_verificacion_id_solicitud_verificacion_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: solicitud_verificacion_id_solicitud_verificacion_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.solicitud_verificacion_id_solicitud_verificacion_seq OWNED BY public.solicitud_verificacion.id_solicitud_verificacion;


--
-- Name: tipo_anunciante; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tipo_anunciante (
    id_tipo_anunciante integer NOT NULL,
    nombre character varying(100) NOT NULL,
    descripcion character varying(250)
);


--
-- Name: tipo_anunciante_id_tipo_anunciante_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tipo_anunciante_id_tipo_anunciante_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tipo_anunciante_id_tipo_anunciante_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tipo_anunciante_id_tipo_anunciante_seq OWNED BY public.tipo_anunciante.id_tipo_anunciante;


--
-- Name: tipo_moneda; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tipo_moneda (
    id_tipo_moneda integer NOT NULL,
    nombre character varying(100) NOT NULL,
    descripcion character varying(255)
);


--
-- Name: tipo_moneda_id_tipo_moneda_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tipo_moneda_id_tipo_moneda_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tipo_moneda_id_tipo_moneda_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tipo_moneda_id_tipo_moneda_seq OWNED BY public.tipo_moneda.id_tipo_moneda;


--
-- Name: tipo_propiedad; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tipo_propiedad (
    id_tipo_propiedad integer NOT NULL,
    nombre character varying(100) NOT NULL,
    descripcion character varying(255)
);


--
-- Name: tipo_propiedad_id_tipo_propiedad_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tipo_propiedad_id_tipo_propiedad_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tipo_propiedad_id_tipo_propiedad_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tipo_propiedad_id_tipo_propiedad_seq OWNED BY public.tipo_propiedad.id_tipo_propiedad;


--
-- Name: usuario; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usuario (
    id_usuario integer NOT NULL,
    nombre character varying(100) NOT NULL,
    apellido character varying(100) NOT NULL,
    email character varying(150),
    telefono character varying(20) NOT NULL,
    bloqueado boolean DEFAULT false NOT NULL,
    id_rol integer,
    contrasenia character varying NOT NULL,
    email_verificado boolean DEFAULT false NOT NULL,
    token_verificacion character varying,
    token_recuperacion character varying,
    token_recuperacion_expira timestamp without time zone,
    foto_url character varying(500),
    activa boolean DEFAULT true NOT NULL,
    fecha_baja timestamp with time zone,
    email_historico character varying(150)
);


--
-- Name: usuario_id_usuario_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.usuario_id_usuario_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: usuario_id_usuario_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.usuario_id_usuario_seq OWNED BY public.usuario.id_usuario;


--
-- Name: ciudad id_ciudad; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ciudad ALTER COLUMN id_ciudad SET DEFAULT nextval('public.ciudad_id_ciudad_seq'::regclass);


--
-- Name: consulta_cotizacion id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.consulta_cotizacion ALTER COLUMN id SET DEFAULT nextval('public.consulta_cotizacion_id_seq'::regclass);


--
-- Name: cotizacion_dolar id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cotizacion_dolar ALTER COLUMN id SET DEFAULT nextval('public.cotizacion_dolar_id_seq'::regclass);


--
-- Name: eliminacion_documento id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.eliminacion_documento ALTER COLUMN id SET DEFAULT nextval('public.eliminacion_documento_id_seq'::regclass);


--
-- Name: favorito id_favorito; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorito ALTER COLUMN id_favorito SET DEFAULT nextval('public.favorito_id_favorito_seq'::regclass);


--
-- Name: fecha id_fecha; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fecha ALTER COLUMN id_fecha SET DEFAULT nextval('public.fecha_id_fecha_seq'::regclass);


--
-- Name: imagen id_imagen; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.imagen ALTER COLUMN id_imagen SET DEFAULT nextval('public.imagen_id_imagen_seq'::regclass);


--
-- Name: mensaje id_mensaje; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mensaje ALTER COLUMN id_mensaje SET DEFAULT nextval('public.mensaje_id_mensaje_seq'::regclass);


--
-- Name: modalidad id_modalidad; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.modalidad ALTER COLUMN id_modalidad SET DEFAULT nextval('public.modalidad_id_modalidad_seq'::regclass);


--
-- Name: pago id_pago; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pago ALTER COLUMN id_pago SET DEFAULT nextval('public.pago_id_pago_seq'::regclass);


--
-- Name: provincia id_provincia; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provincia ALTER COLUMN id_provincia SET DEFAULT nextval('public.provincia_id_provincia_seq'::regclass);


--
-- Name: publicacion id_publicacion; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.publicacion ALTER COLUMN id_publicacion SET DEFAULT nextval('public.publicacion_id_publicacion_seq'::regclass);


--
-- Name: reprogramacion_reserva id_reprogramacion; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reprogramacion_reserva ALTER COLUMN id_reprogramacion SET DEFAULT nextval('public.reprogramacion_reserva_id_reprogramacion_seq'::regclass);


--
-- Name: reserva id_reserva; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reserva ALTER COLUMN id_reserva SET DEFAULT nextval('public.reserva_id_reserva_seq'::regclass);


--
-- Name: revision_verificacion id_revision_verificacion; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.revision_verificacion ALTER COLUMN id_revision_verificacion SET DEFAULT nextval('public.revision_verificacion_id_revision_verificacion_seq'::regclass);


--
-- Name: rol id_rol; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rol ALTER COLUMN id_rol SET DEFAULT nextval('public.rol_id_rol_seq'::regclass);


--
-- Name: solicitud_verificacion id_solicitud_verificacion; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitud_verificacion ALTER COLUMN id_solicitud_verificacion SET DEFAULT nextval('public.solicitud_verificacion_id_solicitud_verificacion_seq'::regclass);


--
-- Name: tipo_anunciante id_tipo_anunciante; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tipo_anunciante ALTER COLUMN id_tipo_anunciante SET DEFAULT nextval('public.tipo_anunciante_id_tipo_anunciante_seq'::regclass);


--
-- Name: tipo_moneda id_tipo_moneda; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tipo_moneda ALTER COLUMN id_tipo_moneda SET DEFAULT nextval('public.tipo_moneda_id_tipo_moneda_seq'::regclass);


--
-- Name: tipo_propiedad id_tipo_propiedad; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tipo_propiedad ALTER COLUMN id_tipo_propiedad SET DEFAULT nextval('public.tipo_propiedad_id_tipo_propiedad_seq'::regclass);


--
-- Name: usuario id_usuario; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuario ALTER COLUMN id_usuario SET DEFAULT nextval('public.usuario_id_usuario_seq'::regclass);


--
-- Name: rol PK_0b42a30072d57ccfad9949218da; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rol
    ADD CONSTRAINT "PK_0b42a30072d57ccfad9949218da" PRIMARY KEY (id_rol);


--
-- Name: ciudad PK_2722ea94dc64d8c08c1dfd84dcb; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ciudad
    ADD CONSTRAINT "PK_2722ea94dc64d8c08c1dfd84dcb" PRIMARY KEY (id_ciudad);


--
-- Name: revision_verificacion PK_278ae21a65303ffcdd6b391a066; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.revision_verificacion
    ADD CONSTRAINT "PK_278ae21a65303ffcdd6b391a066" PRIMARY KEY (id_revision_verificacion);


--
-- Name: imagen PK_28ed81618e908687634e6b0bf0e; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.imagen
    ADD CONSTRAINT "PK_28ed81618e908687634e6b0bf0e" PRIMARY KEY (id_imagen);


--
-- Name: provincia PK_39d548b0662ae470fd4c7a2c9b5; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provincia
    ADD CONSTRAINT "PK_39d548b0662ae470fd4c7a2c9b5" PRIMARY KEY (id_provincia);


--
-- Name: reserva PK_41e06a1a3087b8c5eb782c48774; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reserva
    ADD CONSTRAINT "PK_41e06a1a3087b8c5eb782c48774" PRIMARY KEY (id_reserva);


--
-- Name: anunciante PK_42fea012f15fc094a98e57eb070; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.anunciante
    ADD CONSTRAINT "PK_42fea012f15fc094a98e57eb070" PRIMARY KEY (id_usuario);


--
-- Name: tipo_propiedad PK_5230cd83010cb43bcb01f075785; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tipo_propiedad
    ADD CONSTRAINT "PK_5230cd83010cb43bcb01f075785" PRIMARY KEY (id_tipo_propiedad);


--
-- Name: solicitud_verificacion PK_6aa9d7e29cb80343ee4a534bf0f; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitud_verificacion
    ADD CONSTRAINT "PK_6aa9d7e29cb80343ee4a534bf0f" PRIMARY KEY (id_solicitud_verificacion);


--
-- Name: fecha PK_8f0c05e3f283fa32e9c307ddbb4; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fecha
    ADD CONSTRAINT "PK_8f0c05e3f283fa32e9c307ddbb4" PRIMARY KEY (id_fecha);


--
-- Name: tipo_moneda PK_90aab857fcb4d59976f2d6e1406; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tipo_moneda
    ADD CONSTRAINT "PK_90aab857fcb4d59976f2d6e1406" PRIMARY KEY (id_tipo_moneda);


--
-- Name: pago PK_95163780f4a9d4fefd01e40dd56; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pago
    ADD CONSTRAINT "PK_95163780f4a9d4fefd01e40dd56" PRIMARY KEY (id_pago);


--
-- Name: modalidad PK_972ef30b4cfcca67f10354f2470; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.modalidad
    ADD CONSTRAINT "PK_972ef30b4cfcca67f10354f2470" PRIMARY KEY (id_modalidad);


--
-- Name: favorito PK_b220347d1f3e7c3876753ecd1a4; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorito
    ADD CONSTRAINT "PK_b220347d1f3e7c3876753ecd1a4" PRIMARY KEY (id_favorito);


--
-- Name: publicacion PK_b7b137d8017927dee91f1be535e; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.publicacion
    ADD CONSTRAINT "PK_b7b137d8017927dee91f1be535e" PRIMARY KEY (id_publicacion);


--
-- Name: mensaje PK_be5c3d9874864203d3b788c167b; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mensaje
    ADD CONSTRAINT "PK_be5c3d9874864203d3b788c167b" PRIMARY KEY (id_mensaje);


--
-- Name: usuario PK_dd52716c2652e0e23c15530c695; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT "PK_dd52716c2652e0e23c15530c695" PRIMARY KEY (id_usuario);


--
-- Name: tipo_anunciante PK_e33989ea7d98b8630f8570e7093; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tipo_anunciante
    ADD CONSTRAINT "PK_e33989ea7d98b8630f8570e7093" PRIMARY KEY (id_tipo_anunciante);


--
-- Name: pago REL_40f09c6eece26f0f3c4aecf657; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pago
    ADD CONSTRAINT "REL_40f09c6eece26f0f3c4aecf657" UNIQUE (id_reserva);


--
-- Name: usuario UQ_2863682842e688ca198eb25c124; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT "UQ_2863682842e688ca198eb25c124" UNIQUE (email);


--
-- Name: pago UQ_472f617d924c4b83acec060ae3a; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pago
    ADD CONSTRAINT "UQ_472f617d924c4b83acec060ae3a" UNIQUE (idempotency_key);


--
-- Name: pago UQ_97b1c19d23d7b46be1828837bf9; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pago
    ADD CONSTRAINT "UQ_97b1c19d23d7b46be1828837bf9" UNIQUE (payment_id);


--
-- Name: pago UQ_99db22d1da4a5944ad2cce77e55; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pago
    ADD CONSTRAINT "UQ_99db22d1da4a5944ad2cce77e55" UNIQUE (external_reference);


--
-- Name: fecha UQ_fecha_publicacion_dia; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fecha
    ADD CONSTRAINT "UQ_fecha_publicacion_dia" UNIQUE (id_publicacion, fecha);


--
-- Name: ambito ambito_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ambito
    ADD CONSTRAINT ambito_pkey PRIMARY KEY (codigo);


--
-- Name: consulta_cotizacion consulta_cotizacion_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.consulta_cotizacion
    ADD CONSTRAINT consulta_cotizacion_pkey PRIMARY KEY (id);


--
-- Name: cotizacion_dolar cotizacion_dolar_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cotizacion_dolar
    ADD CONSTRAINT cotizacion_dolar_pkey PRIMARY KEY (id);


--
-- Name: disputa disputa_chargeback_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.disputa
    ADD CONSTRAINT disputa_chargeback_id_key UNIQUE (chargeback_id);


--
-- Name: disputa disputa_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.disputa
    ADD CONSTRAINT disputa_pkey PRIMARY KEY (id_disputa);


--
-- Name: eliminacion_documento eliminacion_documento_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.eliminacion_documento
    ADD CONSTRAINT eliminacion_documento_pkey PRIMARY KEY (id);


--
-- Name: eliminacion_documento eliminacion_documento_url_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.eliminacion_documento
    ADD CONSTRAINT eliminacion_documento_url_key UNIQUE (url);


--
-- Name: estado estado_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.estado
    ADD CONSTRAINT estado_pkey PRIMARY KEY (id_estado);


--
-- Name: liquidacion liquidacion_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.liquidacion
    ADD CONSTRAINT liquidacion_pkey PRIMARY KEY (id_liquidacion);


--
-- Name: reclamo_evidencia reclamo_evidencia_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reclamo_evidencia
    ADD CONSTRAINT reclamo_evidencia_pkey PRIMARY KEY (id_evidencia);


--
-- Name: reclamo_mensaje reclamo_mensaje_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reclamo_mensaje
    ADD CONSTRAINT reclamo_mensaje_pkey PRIMARY KEY (id_mensaje_reclamo);


--
-- Name: reclamo_reserva reclamo_reserva_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reclamo_reserva
    ADD CONSTRAINT reclamo_reserva_pkey PRIMARY KEY (id_reclamo);


--
-- Name: reembolso reembolso_id_externo_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reembolso
    ADD CONSTRAINT reembolso_id_externo_key UNIQUE (id_externo);


--
-- Name: reembolso reembolso_idempotency_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reembolso
    ADD CONSTRAINT reembolso_idempotency_key_key UNIQUE (idempotency_key);


--
-- Name: reembolso reembolso_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reembolso
    ADD CONSTRAINT reembolso_pkey PRIMARY KEY (id_reembolso);


--
-- Name: reembolso reembolso_referencia_externa_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reembolso
    ADD CONSTRAINT reembolso_referencia_externa_key UNIQUE (referencia_externa);


--
-- Name: reprogramacion_reserva reprogramacion_reserva_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reprogramacion_reserva
    ADD CONSTRAINT reprogramacion_reserva_pkey PRIMARY KEY (id_reprogramacion);


--
-- Name: solicitud_cancelacion solicitud_cancelacion_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitud_cancelacion
    ADD CONSTRAINT solicitud_cancelacion_pkey PRIMARY KEY (id_solicitud_cancelacion);


--
-- Name: estado uq_estado_ambito_codigo; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.estado
    ADD CONSTRAINT uq_estado_ambito_codigo UNIQUE (codigo_ambito, codigo);


--
-- Name: liquidacion uq_liquidacion_reserva; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.liquidacion
    ADD CONSTRAINT uq_liquidacion_reserva UNIQUE (id_reserva);


--
-- Name: IDX_c02d1a06a1f766a6f14f7bfcdb; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_c02d1a06a1f766a6f14f7bfcdb" ON public.favorito USING btree (id_usuario, id_publicacion);


--
-- Name: IDX_eliminacion_documento_proximo_intento; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_eliminacion_documento_proximo_intento" ON public.eliminacion_documento USING btree (proximo_intento);


--
-- Name: idx_imagen_publicacion_orden; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_imagen_publicacion_orden ON public.imagen USING btree (id_publicacion, orden, id_imagen);


--
-- Name: ix_disputa_pago; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_disputa_pago ON public.disputa USING btree (id_pago);


--
-- Name: ix_disputa_reserva; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_disputa_reserva ON public.disputa USING btree (id_reserva);


--
-- Name: ix_liquidacion_estado; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_liquidacion_estado ON public.liquidacion USING btree (estado);


--
-- Name: ix_reclamo_reserva; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_reclamo_reserva ON public.reclamo_reserva USING btree (id_reserva);


--
-- Name: ix_reembolso_pago; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_reembolso_pago ON public.reembolso USING btree (id_pago);


--
-- Name: ix_reembolso_reserva; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_reembolso_reserva ON public.reembolso USING btree (id_reserva);


--
-- Name: ix_solicitud_cancelacion_reserva; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_solicitud_cancelacion_reserva ON public.solicitud_cancelacion USING btree (id_reserva);


--
-- Name: uq_anunciante_cuit_cuil_digitos; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uq_anunciante_cuit_cuil_digitos ON public.anunciante USING btree (regexp_replace((cuit_cuil)::text, '[^0-9]'::text, ''::text, 'g'::text)) WHERE (cuit_cuil IS NOT NULL);


--
-- Name: ux_solicitud_cancelacion_pendiente; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ux_solicitud_cancelacion_pendiente ON public.solicitud_cancelacion USING btree (id_reserva) WHERE ((estado)::text = 'PENDIENTE'::text);


--
-- Name: fecha FK_1c1a87a20d378506a6f90b60f84; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fecha
    ADD CONSTRAINT "FK_1c1a87a20d378506a6f90b60f84" FOREIGN KEY (id_reserva) REFERENCES public.reserva(id_reserva);


--
-- Name: publicacion FK_33e9333dcfd74668b60e403af8a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.publicacion
    ADD CONSTRAINT "FK_33e9333dcfd74668b60e403af8a" FOREIGN KEY (id_modalidad) REFERENCES public.modalidad(id_modalidad);


--
-- Name: usuario FK_3628e9894c4b014d61a01cb21dd; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT "FK_3628e9894c4b014d61a01cb21dd" FOREIGN KEY (id_rol) REFERENCES public.rol(id_rol);


--
-- Name: solicitud_verificacion FK_3aab5d01052de236adf9c3b9eb2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitud_verificacion
    ADD CONSTRAINT "FK_3aab5d01052de236adf9c3b9eb2" FOREIGN KEY (id_anunciante) REFERENCES public.anunciante(id_usuario) ON DELETE CASCADE;


--
-- Name: reserva FK_3fed2030aa5d1f4212c8f16f9ad; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reserva
    ADD CONSTRAINT "FK_3fed2030aa5d1f4212c8f16f9ad" FOREIGN KEY (id_publicacion) REFERENCES public.publicacion(id_publicacion) ON DELETE SET NULL;


--
-- Name: pago FK_40f09c6eece26f0f3c4aecf657e; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pago
    ADD CONSTRAINT "FK_40f09c6eece26f0f3c4aecf657e" FOREIGN KEY (id_reserva) REFERENCES public.reserva(id_reserva) ON DELETE CASCADE;


--
-- Name: ciudad FK_413fabf6e4f7be525622d4e200c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ciudad
    ADD CONSTRAINT "FK_413fabf6e4f7be525622d4e200c" FOREIGN KEY (id_provincia) REFERENCES public.provincia(id_provincia);


--
-- Name: anunciante FK_42fea012f15fc094a98e57eb070; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.anunciante
    ADD CONSTRAINT "FK_42fea012f15fc094a98e57eb070" FOREIGN KEY (id_usuario) REFERENCES public.usuario(id_usuario) ON DELETE CASCADE;


--
-- Name: mensaje FK_554ebf2d2b16cd83f8b86b02ad7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mensaje
    ADD CONSTRAINT "FK_554ebf2d2b16cd83f8b86b02ad7" FOREIGN KEY (id_publicacion) REFERENCES public.publicacion(id_publicacion) ON DELETE CASCADE;


--
-- Name: publicacion FK_5b43b4a58b0247c22da41a01c9c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.publicacion
    ADD CONSTRAINT "FK_5b43b4a58b0247c22da41a01c9c" FOREIGN KEY (id_tipo_propiedad) REFERENCES public.tipo_propiedad(id_tipo_propiedad);


--
-- Name: publicacion FK_79e5a53192f9be1ecb9237610f0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.publicacion
    ADD CONSTRAINT "FK_79e5a53192f9be1ecb9237610f0" FOREIGN KEY (id_ciudad) REFERENCES public.ciudad(id_ciudad);


--
-- Name: favorito FK_82c2996f81c5d8c09aa5df2e082; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorito
    ADD CONSTRAINT "FK_82c2996f81c5d8c09aa5df2e082" FOREIGN KEY (id_publicacion) REFERENCES public.publicacion(id_publicacion) ON DELETE CASCADE;


--
-- Name: publicacion FK_870c6eb44ee4af119f562d7b2fe; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.publicacion
    ADD CONSTRAINT "FK_870c6eb44ee4af119f562d7b2fe" FOREIGN KEY (id_provincia) REFERENCES public.provincia(id_provincia);


--
-- Name: publicacion FK_95815510864f78e6f5baa4527e7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.publicacion
    ADD CONSTRAINT "FK_95815510864f78e6f5baa4527e7" FOREIGN KEY (id_tipo_moneda) REFERENCES public.tipo_moneda(id_tipo_moneda);


--
-- Name: imagen FK_9d644513aec5b508d3ce7d23406; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.imagen
    ADD CONSTRAINT "FK_9d644513aec5b508d3ce7d23406" FOREIGN KEY (id_publicacion) REFERENCES public.publicacion(id_publicacion) ON DELETE CASCADE;


--
-- Name: revision_verificacion FK_a3fa8e56b5928ceaaff2a361eca; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.revision_verificacion
    ADD CONSTRAINT "FK_a3fa8e56b5928ceaaff2a361eca" FOREIGN KEY (id_anunciante) REFERENCES public.anunciante(id_usuario) ON DELETE CASCADE;


--
-- Name: fecha FK_ab805da9f454b4f4811e94d2059; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fecha
    ADD CONSTRAINT "FK_ab805da9f454b4f4811e94d2059" FOREIGN KEY (id_publicacion) REFERENCES public.publicacion(id_publicacion) ON DELETE CASCADE;


--
-- Name: favorito FK_b3aee3da2143ec261a3c77b750c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorito
    ADD CONSTRAINT "FK_b3aee3da2143ec261a3c77b750c" FOREIGN KEY (id_usuario) REFERENCES public.usuario(id_usuario) ON DELETE CASCADE;


--
-- Name: mensaje FK_b8d4bc4581ecb150d028666d2b2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mensaje
    ADD CONSTRAINT "FK_b8d4bc4581ecb150d028666d2b2" FOREIGN KEY (id_destino_usuario) REFERENCES public.usuario(id_usuario) ON DELETE CASCADE;


--
-- Name: reserva FK_c31a9dc2feb50285790213e2e10; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reserva
    ADD CONSTRAINT "FK_c31a9dc2feb50285790213e2e10" FOREIGN KEY (id_usuario) REFERENCES public.usuario(id_usuario) ON DELETE SET NULL;


--
-- Name: anunciante FK_d6442c5d6dbe18fbb7ef7c54ea2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.anunciante
    ADD CONSTRAINT "FK_d6442c5d6dbe18fbb7ef7c54ea2" FOREIGN KEY (id_tipo_anunciante) REFERENCES public.tipo_anunciante(id_tipo_anunciante);


--
-- Name: publicacion FK_d7ef0dcb63bdaee61d444da51ad; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.publicacion
    ADD CONSTRAINT "FK_d7ef0dcb63bdaee61d444da51ad" FOREIGN KEY (id_anunciante) REFERENCES public.anunciante(id_usuario) ON DELETE CASCADE;


--
-- Name: mensaje FK_d9c2a2d7b121664fbbd886127c7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mensaje
    ADD CONSTRAINT "FK_d9c2a2d7b121664fbbd886127c7" FOREIGN KEY (id_origen_usuario) REFERENCES public.usuario(id_usuario) ON DELETE CASCADE;


--
-- Name: reprogramacion_reserva FK_reprogramacion_reserva; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reprogramacion_reserva
    ADD CONSTRAINT "FK_reprogramacion_reserva" FOREIGN KEY (id_reserva) REFERENCES public.reserva(id_reserva) ON DELETE CASCADE;


--
-- Name: reserva FK_reserva_cotizacion_dolar; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reserva
    ADD CONSTRAINT "FK_reserva_cotizacion_dolar" FOREIGN KEY (id_cotizacion_dolar) REFERENCES public.cotizacion_dolar(id) ON DELETE RESTRICT;


--
-- Name: revision_verificacion FK_revision_administrador; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.revision_verificacion
    ADD CONSTRAINT "FK_revision_administrador" FOREIGN KEY (id_administrador) REFERENCES public.usuario(id_usuario) ON DELETE SET NULL;


--
-- Name: disputa fk_disputa_estado; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.disputa
    ADD CONSTRAINT fk_disputa_estado FOREIGN KEY (ambito_estado, estado) REFERENCES public.estado(codigo_ambito, codigo) ON DELETE RESTRICT;


--
-- Name: disputa fk_disputa_pago; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.disputa
    ADD CONSTRAINT fk_disputa_pago FOREIGN KEY (id_pago) REFERENCES public.pago(id_pago) ON DELETE CASCADE;


--
-- Name: disputa fk_disputa_reserva; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.disputa
    ADD CONSTRAINT fk_disputa_reserva FOREIGN KEY (id_reserva) REFERENCES public.reserva(id_reserva) ON DELETE CASCADE;


--
-- Name: disputa fk_disputa_resuelto; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.disputa
    ADD CONSTRAINT fk_disputa_resuelto FOREIGN KEY (id_resuelto_por) REFERENCES public.usuario(id_usuario) ON DELETE SET NULL;


--
-- Name: estado fk_estado_ambito; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.estado
    ADD CONSTRAINT fk_estado_ambito FOREIGN KEY (codigo_ambito) REFERENCES public.ambito(codigo) ON DELETE RESTRICT;


--
-- Name: liquidacion fk_liquidacion_admin; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.liquidacion
    ADD CONSTRAINT fk_liquidacion_admin FOREIGN KEY (id_admin_resolucion) REFERENCES public.usuario(id_usuario) ON DELETE SET NULL;


--
-- Name: liquidacion fk_liquidacion_estado; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.liquidacion
    ADD CONSTRAINT fk_liquidacion_estado FOREIGN KEY (ambito_estado, estado) REFERENCES public.estado(codigo_ambito, codigo) ON DELETE RESTRICT;


--
-- Name: liquidacion fk_liquidacion_reserva; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.liquidacion
    ADD CONSTRAINT fk_liquidacion_reserva FOREIGN KEY (id_reserva) REFERENCES public.reserva(id_reserva) ON DELETE CASCADE;


--
-- Name: reclamo_reserva fk_reclamo_admin; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reclamo_reserva
    ADD CONSTRAINT fk_reclamo_admin FOREIGN KEY (id_administrador_resolucion) REFERENCES public.usuario(id_usuario) ON DELETE SET NULL;


--
-- Name: reclamo_reserva fk_reclamo_anunciante; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reclamo_reserva
    ADD CONSTRAINT fk_reclamo_anunciante FOREIGN KEY (id_anunciante) REFERENCES public.usuario(id_usuario) ON DELETE SET NULL;


--
-- Name: reclamo_evidencia fk_reclamo_evidencia; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reclamo_evidencia
    ADD CONSTRAINT fk_reclamo_evidencia FOREIGN KEY (id_reclamo) REFERENCES public.reclamo_reserva(id_reclamo) ON DELETE CASCADE;


--
-- Name: reclamo_evidencia fk_reclamo_evidencia_usuario; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reclamo_evidencia
    ADD CONSTRAINT fk_reclamo_evidencia_usuario FOREIGN KEY (id_usuario) REFERENCES public.usuario(id_usuario) ON DELETE SET NULL;


--
-- Name: reclamo_reserva fk_reclamo_inquilino; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reclamo_reserva
    ADD CONSTRAINT fk_reclamo_inquilino FOREIGN KEY (id_inquilino) REFERENCES public.usuario(id_usuario) ON DELETE CASCADE;


--
-- Name: reclamo_mensaje fk_reclamo_mensaje; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reclamo_mensaje
    ADD CONSTRAINT fk_reclamo_mensaje FOREIGN KEY (id_reclamo) REFERENCES public.reclamo_reserva(id_reclamo) ON DELETE CASCADE;


--
-- Name: reclamo_mensaje fk_reclamo_mensaje_autor; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reclamo_mensaje
    ADD CONSTRAINT fk_reclamo_mensaje_autor FOREIGN KEY (id_autor) REFERENCES public.usuario(id_usuario) ON DELETE CASCADE;


--
-- Name: reclamo_reserva fk_reclamo_reserva; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reclamo_reserva
    ADD CONSTRAINT fk_reclamo_reserva FOREIGN KEY (id_reserva) REFERENCES public.reserva(id_reserva) ON DELETE CASCADE;


--
-- Name: reclamo_reserva fk_reclamo_reserva_estado; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reclamo_reserva
    ADD CONSTRAINT fk_reclamo_reserva_estado FOREIGN KEY (ambito_estado, estado) REFERENCES public.estado(codigo_ambito, codigo) ON DELETE RESTRICT;


--
-- Name: reembolso fk_reembolso_estado; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reembolso
    ADD CONSTRAINT fk_reembolso_estado FOREIGN KEY (ambito_estado, estado) REFERENCES public.estado(codigo_ambito, codigo) ON DELETE RESTRICT;


--
-- Name: reembolso fk_reembolso_pago; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reembolso
    ADD CONSTRAINT fk_reembolso_pago FOREIGN KEY (id_pago) REFERENCES public.pago(id_pago) ON DELETE CASCADE;


--
-- Name: reembolso fk_reembolso_reserva; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reembolso
    ADD CONSTRAINT fk_reembolso_reserva FOREIGN KEY (id_reserva) REFERENCES public.reserva(id_reserva) ON DELETE CASCADE;


--
-- Name: reembolso fk_reembolso_resuelto; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reembolso
    ADD CONSTRAINT fk_reembolso_resuelto FOREIGN KEY (id_resuelto_por) REFERENCES public.usuario(id_usuario) ON DELETE SET NULL;


--
-- Name: reembolso fk_reembolso_solicitado; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reembolso
    ADD CONSTRAINT fk_reembolso_solicitado FOREIGN KEY (id_solicitado_por) REFERENCES public.usuario(id_usuario) ON DELETE SET NULL;


--
-- Name: reserva fk_reserva_estado_liquidacion; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reserva
    ADD CONSTRAINT fk_reserva_estado_liquidacion FOREIGN KEY (ambito_estado_liquidacion, estado_liquidacion) REFERENCES public.estado(codigo_ambito, codigo) ON DELETE RESTRICT;


--
-- Name: reserva fk_reserva_estado_pago; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reserva
    ADD CONSTRAINT fk_reserva_estado_pago FOREIGN KEY (ambito_estado_pago, estado_pago) REFERENCES public.estado(codigo_ambito, codigo) ON DELETE RESTRICT;


--
-- Name: revision_verificacion fk_revision_verificacion_estado; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.revision_verificacion
    ADD CONSTRAINT fk_revision_verificacion_estado FOREIGN KEY (ambito_estado, estado) REFERENCES public.estado(codigo_ambito, codigo) ON DELETE RESTRICT;


--
-- Name: solicitud_cancelacion fk_solicitud_cancelacion_decidida; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitud_cancelacion
    ADD CONSTRAINT fk_solicitud_cancelacion_decidida FOREIGN KEY (id_decidida_por) REFERENCES public.usuario(id_usuario) ON DELETE SET NULL;


--
-- Name: solicitud_cancelacion fk_solicitud_cancelacion_estado; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitud_cancelacion
    ADD CONSTRAINT fk_solicitud_cancelacion_estado FOREIGN KEY (ambito_estado, estado) REFERENCES public.estado(codigo_ambito, codigo) ON DELETE RESTRICT;


--
-- Name: solicitud_cancelacion fk_solicitud_cancelacion_reserva; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitud_cancelacion
    ADD CONSTRAINT fk_solicitud_cancelacion_reserva FOREIGN KEY (id_reserva) REFERENCES public.reserva(id_reserva) ON DELETE CASCADE;


--
-- Name: solicitud_cancelacion fk_solicitud_cancelacion_solicitante; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitud_cancelacion
    ADD CONSTRAINT fk_solicitud_cancelacion_solicitante FOREIGN KEY (id_solicitante) REFERENCES public.usuario(id_usuario) ON DELETE CASCADE;


--
-- Name: solicitud_verificacion fk_solicitud_verificacion_estado; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitud_verificacion
    ADD CONSTRAINT fk_solicitud_verificacion_estado FOREIGN KEY (ambito_estado, estado) REFERENCES public.estado(codigo_ambito, codigo) ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict 7peKf1Rt8kVZd2EGsFuvaqaqoQelcs7HqcsvA3oHvjTxcYLRVGIyCSoWpoHZx6w

