-- Esquema inicial para una base vacia. Ejecutar con scripts/inicializar-base.cjs.
-- Copia de estructura sin datos; incluye el retiro del catalogo obsoleto de pagos.
--
-- PostgreSQL database dump
--


-- Dumped from database version 18.6 (4e5fd08)
-- Dumped by pg_dump version 18.6

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
-- Name: reserva_estado_liquidacion_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.reserva_estado_liquidacion_enum AS ENUM (
    'NO_APLICA',
    'RETENIDO',
    'PENDIENTE_PAGO_PROPIETARIO',
    'EN_REVISION',
    'PAGADO_PROPIETARIO',
    'DEVUELTO_INQUILINO'
);


--
-- Name: reserva_estado_pago_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.reserva_estado_pago_enum AS ENUM (
    'PENDIENTE',
    'APROBADO',
    'RECHAZADO',
    'CANCELADO',
    'REEMBOLSADO'
);


--
-- Name: revision_verificacion_estado_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.revision_verificacion_estado_enum AS ENUM (
    'pendiente',
    'aprobada',
    'rechazada',
    'reenviada',
    'borrador'
);


--
-- Name: solicitud_verificacion_estado_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.solicitud_verificacion_estado_enum AS ENUM (
    'pendiente',
    'aprobada',
    'rechazada',
    'reenviada',
    'borrador'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: anunciante; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.anunciante (
    id_usuario integer NOT NULL,
    verificado boolean DEFAULT false NOT NULL,
    cuit_cuil character varying(15),
    numero_contacto character varying(20) NOT NULL,
    id_tipo_anunciante integer
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
    id_publicacion integer
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
-- Name: metodo_pago; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.metodo_pago (
    id_metodo_pago integer NOT NULL,
    nombre character varying(100) NOT NULL,
    descripcion character varying(100)
);


--
-- Name: metodo_pago_id_metodo_pago_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.metodo_pago_id_metodo_pago_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: metodo_pago_id_metodo_pago_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.metodo_pago_id_metodo_pago_seq OWNED BY public.metodo_pago.id_metodo_pago;


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
    id_reserva integer
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
    estado_pago public.reserva_estado_pago_enum DEFAULT 'APROBADO'::public.reserva_estado_pago_enum NOT NULL,
    pago_vencimiento timestamp without time zone,
    fecha_pago timestamp without time zone,
    email_confirmacion_inquilino_enviado boolean DEFAULT false NOT NULL,
    email_nueva_reserva_anunciante_enviado boolean DEFAULT false NOT NULL,
    codigo_alojamiento character varying(8),
    codigo_generado_en timestamp without time zone,
    codigo_validado_en timestamp without time zone,
    intentos_codigo integer DEFAULT 0 NOT NULL,
    estado_liquidacion public.reserva_estado_liquidacion_enum DEFAULT 'NO_APLICA'::public.reserva_estado_liquidacion_enum NOT NULL,
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
    presupuesto_vence_en timestamp with time zone
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
    estado public.revision_verificacion_estado_enum NOT NULL,
    motivo character varying(500),
    creada_en timestamp without time zone DEFAULT now() NOT NULL,
    id_anunciante integer,
    id_administrador integer
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
-- Name: solicitud_verificacion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.solicitud_verificacion (
    id_solicitud_verificacion integer NOT NULL,
    estado public.solicitud_verificacion_estado_enum DEFAULT 'borrador'::public.solicitud_verificacion_estado_enum NOT NULL,
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
    constancia_cuit_url character varying(500)
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
    email character varying(150) NOT NULL,
    telefono character varying(20) NOT NULL,
    bloqueado boolean DEFAULT false NOT NULL,
    id_rol integer,
    contrasenia character varying NOT NULL,
    email_verificado boolean DEFAULT false NOT NULL,
    token_verificacion character varying,
    token_recuperacion character varying,
    token_recuperacion_expira timestamp without time zone,
    foto_url character varying(500)
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
-- Name: metodo_pago id_metodo_pago; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.metodo_pago ALTER COLUMN id_metodo_pago SET DEFAULT nextval('public.metodo_pago_id_metodo_pago_seq'::regclass);


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
-- Name: metodo_pago PK_3016974ebc8f8d7225d2f327fc8; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.metodo_pago
    ADD CONSTRAINT "PK_3016974ebc8f8d7225d2f327fc8" PRIMARY KEY (id_metodo_pago);


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
-- Name: reprogramacion_reserva reprogramacion_reserva_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reprogramacion_reserva
    ADD CONSTRAINT reprogramacion_reserva_pkey PRIMARY KEY (id_reprogramacion);


--
-- Name: IDX_c02d1a06a1f766a6f14f7bfcdb; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_c02d1a06a1f766a6f14f7bfcdb" ON public.favorito USING btree (id_usuario, id_publicacion);


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
-- PostgreSQL database dump complete
--



SET LOCAL search_path TO public;
-- Ejecutar con scripts/retirar-metodo-pago.cjs antes de iniciar el nuevo back.
-- El runner respalda el catálogo y las relaciones y ejecuta ambas operaciones
-- dentro de una transacción. Sin CASCADE: dependencias inesperadas abortan.
ALTER TABLE public.reserva DROP COLUMN IF EXISTS id_metodo_pago;
DROP TABLE IF EXISTS public.metodo_pago;
