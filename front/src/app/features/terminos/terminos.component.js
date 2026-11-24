import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import * as i0 from "@angular/core";
function TerminosComponent_Conditional_8_Conditional_27_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p");
    i0.ɵɵtext(1, "La comisi\u00F3n vigente de DEPA es del ");
    i0.ɵɵelementStart(2, "strong");
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵtext(4, ". Se calcula sobre el importe total pagado por el inquilino y se descuenta del importe a transferirte cuando la liquidaci\u00F3n finaliza con el pago total al anunciante.");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1("", ctx_r0.comision(), " %");
} }
function TerminosComponent_Conditional_8_Conditional_28_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 9);
    i0.ɵɵtext(1, "No pudimos consultar la comisi\u00F3n vigente. Consultala antes de realizar una operaci\u00F3n.");
    i0.ɵɵelementEnd();
} }
function TerminosComponent_Conditional_8_Conditional_29_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 10);
    i0.ɵɵtext(1, "Consultando la comisi\u00F3n vigente\u2026");
    i0.ɵɵelementEnd();
} }
function TerminosComponent_Conditional_8_Conditional_40_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "ul")(1, "li");
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "li");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "li");
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(7, "p");
    i0.ɵɵtext(8, "Las condiciones de cada reserva se muestran al solicitar la cancelaci\u00F3n.");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const p_r2 = ctx;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate2("", p_r2.diasDevolucionTotal, " d\u00EDas o m\u00E1s antes del ingreso: ", p_r2.porcentajeTotal, " %.");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate3("Desde ", p_r2.diasDevolucionParcial, " hasta menos de ", p_r2.diasDevolucionTotal, " d\u00EDas antes: ", p_r2.porcentajeParcial, " %.");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate2("Menos de ", p_r2.diasDevolucionParcial, " d\u00EDas antes: ", p_r2.porcentajeFueraDePlazo, " %.");
} }
function TerminosComponent_Conditional_8_Conditional_41_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 9);
    i0.ɵɵtext(1, "No pudimos consultar la pol\u00EDtica vigente. Revis\u00E1 las condiciones de la reserva antes de realizar una operaci\u00F3n.");
    i0.ɵɵelementEnd();
} }
function TerminosComponent_Conditional_8_Conditional_42_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 10);
    i0.ɵɵtext(1, "Consultando la pol\u00EDtica de cancelaci\u00F3n vigente\u2026");
    i0.ɵɵelementEnd();
} }
function TerminosComponent_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "h1");
    i0.ɵɵtext(1, "T\u00E9rminos y condiciones para anunciantes");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "p", 7);
    i0.ɵɵtext(3, "Estas condiciones complementan los ");
    i0.ɵɵelementStart(4, "a", 8);
    i0.ɵɵtext(5, "t\u00E9rminos de uso para usuarios");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(6, " y explican c\u00F3mo funciona DEPA para quienes ofrecen propiedades.");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "h2");
    i0.ɵɵtext(8, "1. Solicitud y verificaci\u00F3n");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "p");
    i0.ɵɵtext(10, "Para publicar, deb\u00E9s solicitar la habilitaci\u00F3n como propietario particular o inmobiliaria y proporcionar datos verdaderos, tu CUIT o CUIL, un n\u00FAmero de contacto y un CBU de una cuenta a tu nombre. El CBU se encuentra sujeto a revisi\u00F3n. Tambi\u00E9n deb\u00E9s presentar frente y dorso del DNI y realizar una prueba de vida. La habilitaci\u00F3n requiere una revisi\u00F3n y aprobaci\u00F3n por parte de la administraci\u00F3n; completar la prueba de vida no habilita autom\u00E1ticamente la cuenta.");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "p");
    i0.ɵɵtext(12, "Si actu\u00E1s como inmobiliaria, el corredor responsable debe acreditar su identidad e informar los datos de la organizaci\u00F3n, la matr\u00EDcula, el colegio profesional y el domicilio comercial, adem\u00E1s de presentar la constancia de CUIT y la documentaci\u00F3n de la matr\u00EDcula.");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(13, "h2");
    i0.ɵɵtext(14, "2. Publicaciones y disponibilidad");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(15, "p");
    i0.ɵɵtext(16, "Sos responsable de que las propiedades que ofrec\u00E9s, sus im\u00E1genes, precios, condiciones, ubicaci\u00F3n y disponibilidad sean correctos y est\u00E9n actualizados. Deb\u00E9s estar habilitado para ofrecerlas y atender las consultas y reservas recibidas. Una publicaci\u00F3n activa debe contar con al menos una imagen.");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(17, "p");
    i0.ɵɵtext(18, "En alquileres de largo plazo DEPA facilita la consulta y el contacto; la celebraci\u00F3n de contratos y otros tr\u00E1mites legales se realizan fuera de la plataforma. En alquileres temporarios administr\u00E1s la disponibilidad y las reservas a trav\u00E9s del calendario.");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(19, "h2");
    i0.ɵɵtext(20, "3. Reservas e ingreso");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(21, "p");
    i0.ɵɵtext(22, "Las fechas de una reserva pendiente quedan bloqueadas hasta 15 minutos mientras se procesa el pago. La reserva se confirma cuando el pago se aprueba dentro del plazo. El inquilino puede solicitar una reprogramaci\u00F3n antes del inicio si las nuevas fechas est\u00E1n disponibles; se mantienen la duraci\u00F3n y las condiciones econ\u00F3micas originales.");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(23, "p");
    i0.ɵɵtext(24, "Al ingresar, el inquilino te entrega su c\u00F3digo de alojamiento y deb\u00E9s cargarlo en DEPA para validar el ingreso. Un c\u00F3digo incorrecto reiterado o un reclamo puede dejar la liquidaci\u00F3n en revisi\u00F3n. No solicites el c\u00F3digo antes de que se produzca el ingreso.");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(25, "h2");
    i0.ɵɵtext(26, "4. Comisi\u00F3n y liquidaci\u00F3n");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(27, TerminosComponent_Conditional_8_Conditional_27_Template, 5, 1, "p")(28, TerminosComponent_Conditional_8_Conditional_28_Template, 2, 0, "p", 9)(29, TerminosComponent_Conditional_8_Conditional_29_Template, 2, 0, "p", 10);
    i0.ɵɵelementStart(30, "p");
    i0.ɵɵtext(31, "El porcentaje puede modificarse para futuras reservas. Cada reserva conserva el porcentaje correspondiente al registrar sus condiciones econ\u00F3micas. Si se realiza una devoluci\u00F3n total o parcial al inquilino, no se aplica comisi\u00F3n de DEPA a esa reserva. Los costos de Mercado Pago son independientes.");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(32, "p");
    i0.ɵɵtext(33, "La liquidaci\u00F3n queda retenida tras aprobarse el pago. La validaci\u00F3n del c\u00F3digo permite que pase a pendiente de pago. El registro del pago se habilita a partir del quinto d\u00EDa calendario posterior al fin de la estad\u00EDa, siempre que el CBU est\u00E9 validado y la liquidaci\u00F3n habilitada. El pago al anunciante se realiza fuera de DEPA y la administraci\u00F3n lo registra; no es una transferencia autom\u00E1tica. Una revisi\u00F3n o un reclamo puede demorar su resoluci\u00F3n.");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(34, "h2");
    i0.ɵɵtext(35, "5. Cancelaciones y reclamos");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(36, "p");
    i0.ɵɵtext(37, "Una reserva pendiente de pago puede cancelarse y libera las fechas. Para cancelar una reserva pagada, deb\u00E9s solicitarlo antes del d\u00EDa de ingreso y la administraci\u00F3n debe resolver la solicitud. Si se aprueba una cancelaci\u00F3n solicitada por el anunciante, corresponde la devoluci\u00F3n del 100 % al inquilino. Cuando hay devoluci\u00F3n, la reserva se cancela y las fechas se liberan al confirmarse el reembolso.");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(38, "p");
    i0.ɵɵtext(39, "Si la cancelaci\u00F3n la solicita el inquilino, se aplica la pol\u00EDtica correspondiente a la fecha de pago. La pol\u00EDtica vigente para nuevas operaciones es:");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(40, TerminosComponent_Conditional_8_Conditional_40_Template, 9, 7)(41, TerminosComponent_Conditional_8_Conditional_41_Template, 2, 0, "p", 9)(42, TerminosComponent_Conditional_8_Conditional_42_Template, 2, 0, "p", 10);
    i0.ɵɵelementStart(43, "p");
    i0.ɵɵtext(44, "El porcentaje de devoluci\u00F3n se calcula con la fecha de env\u00EDo de la solicitud y sobre el importe efectivamente pagado por la reserva. La aprobaci\u00F3n debe ocurrir antes de la fecha de ingreso.");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(45, "p");
    i0.ɵɵtext(46, "Si tu solicitud de cancelaci\u00F3n no recibe respuesta antes de la fecha de ingreso, se considera rechazada y la reserva sigue en curso. El solicitante puede presentar un reclamo por demora administrativa desde el ingreso y hasta siete d\u00EDas corridos despu\u00E9s de finalizar la estad\u00EDa. Este reclamo no cancela la reserva, no bloquea por s\u00ED solo la liquidaci\u00F3n ni genera autom\u00E1ticamente devoluciones o compensaciones.");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(47, "p");
    i0.ɵɵtext(48, "El inquilino puede iniciar un reclamo desde el inicio de la estad\u00EDa hasta el final del cuarto d\u00EDa calendario posterior a su finalizaci\u00F3n. La administraci\u00F3n lo revisa y puede resolver una devoluci\u00F3n total o parcial. Un reclamo no cancela autom\u00E1ticamente la reserva ni libera las fechas.");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(49, "h2");
    i0.ɵɵtext(50, "6. Pausa, bloqueo y baja");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(51, "p");
    i0.ɵɵtext(52, "Pod\u00E9s pausar tus actividades para dejar de recibir nuevas reservas mientras gestion\u00E1s las existentes. La administraci\u00F3n puede bloquear la cuenta o dar de baja publicaciones por incumplimientos. Las reservas y liquidaciones existentes se tratar\u00E1n seg\u00FAn su estado. Pod\u00E9s solicitar la baja de la cuenta cuando no existan operaciones pendientes en ninguno de tus roles; la baja no cancela ni reembolsa autom\u00E1ticamente las reservas.");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    let tmp_2_0;
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(27);
    i0.ɵɵconditional(ctx_r0.comision() !== null ? 27 : ctx_r0.errorComision() ? 28 : 29);
    i0.ɵɵadvance(13);
    i0.ɵɵconditional((tmp_2_0 = ctx_r0.politica()) ? 40 : ctx_r0.errorPolitica() ? 41 : 42, tmp_2_0);
} }
function TerminosComponent_Conditional_9_Conditional_28_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "ul")(1, "li");
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "li");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "li");
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(7, "p");
    i0.ɵɵtext(8, "Si el anunciante solicita la cancelaci\u00F3n, corresponde el 100 % de devoluci\u00F3n. El medio de pago puede determinar c\u00F3mo se realiza el reintegro.");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const p_r3 = ctx;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate2("", p_r3.diasDevolucionTotal, " d\u00EDas o m\u00E1s antes del ingreso: ", p_r3.porcentajeTotal, " %.");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate3("Desde ", p_r3.diasDevolucionParcial, " hasta menos de ", p_r3.diasDevolucionTotal, " d\u00EDas antes: ", p_r3.porcentajeParcial, " %.");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate2("Menos de ", p_r3.diasDevolucionParcial, " d\u00EDas antes: ", p_r3.porcentajeFueraDePlazo, " %.");
} }
function TerminosComponent_Conditional_9_Conditional_29_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 9);
    i0.ɵɵtext(1, "No pudimos consultar la pol\u00EDtica vigente. Revis\u00E1 las condiciones de tu reserva antes de realizar una operaci\u00F3n.");
    i0.ɵɵelementEnd();
} }
function TerminosComponent_Conditional_9_Conditional_30_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 10);
    i0.ɵɵtext(1, "Consultando la pol\u00EDtica de cancelaci\u00F3n vigente\u2026");
    i0.ɵɵelementEnd();
} }
function TerminosComponent_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "h1");
    i0.ɵɵtext(1, "T\u00E9rminos y condiciones de uso");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "p", 7);
    i0.ɵɵtext(3, "Estas condiciones explican c\u00F3mo usar DEPA, buscar propiedades y gestionar reservas como usuario o inquilino.");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "h2");
    i0.ɵɵtext(5, "1. La plataforma");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "p");
    i0.ɵɵtext(7, "DEPA re\u00FAne publicaciones de propiedades en alquiler y facilita el contacto entre inquilinos, propietarios e inmobiliarias. En alquileres temporarios permite gestionar disponibilidad, reservas y pagos. En alquileres de largo plazo facilita la b\u00FAsqueda y el contacto; los contratos y tr\u00E1mites legales se realizan fuera de la plataforma.");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "h2");
    i0.ɵɵtext(9, "2. Cuenta y uso responsable");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "p");
    i0.ɵɵtext(11, "Pod\u00E9s consultar publicaciones y contactar por WhatsApp sin iniciar sesi\u00F3n. Para usar favoritos, mensajer\u00EDa interna o reservas necesit\u00E1s una cuenta y verificar tu correo. Deb\u00E9s brindar datos correctos, mantenerlos actualizados y proteger tu contrase\u00F1a. La cuenta no debe utilizarse para suplantar a otra persona, publicar contenido enga\u00F1oso o perjudicar a otros usuarios.");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "p");
    i0.ɵɵtext(13, "WhatsApp es un servicio externo y DEPA no almacena los mensajes intercambiados all\u00ED. La mensajer\u00EDa interna requiere autenticaci\u00F3n y conserva el historial en la plataforma.");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(14, "h2");
    i0.ɵɵtext(15, "3. Reservas y pagos");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(16, "p");
    i0.ɵɵtext(17, "En una propiedad que admita reservas, seleccion\u00E1s fechas disponibles y revis\u00E1s las condiciones econ\u00F3micas antes de pagar. Se cuentan d\u00EDas calendario, incluidos el inicio y el fin. El pago se procesa mediante Mercado Pago; DEPA no almacena los datos de tu tarjeta.");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(18, "p");
    i0.ɵɵtext(19, "Al crear una reserva pendiente, las fechas se bloquean durante un m\u00E1ximo de 15 minutos. Si un pago se rechaza o cancela, pod\u00E9s reintentarlo dentro del plazo original. Si no se aprueba a tiempo, la reserva se cancela y se liberan las fechas. La confirmaci\u00F3n depende de la aprobaci\u00F3n del pago.");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(20, "p");
    i0.ɵɵtext(21, "Una vez confirmada, recibir\u00E1s un c\u00F3digo de alojamiento. Entregalo al anunciante al ingresar a la propiedad para que valide tu llegada. Antes del inicio pod\u00E9s reprogramar la reserva si las nuevas fechas est\u00E1n disponibles, conservando la duraci\u00F3n y el importe.");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(22, "h2");
    i0.ɵɵtext(23, "4. Cancelaciones y devoluciones");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(24, "p");
    i0.ɵɵtext(25, "Una reserva pendiente de pago puede cancelarse sin devoluci\u00F3n. Para una reserva pagada deb\u00E9s solicitar la cancelaci\u00F3n antes del ingreso y aceptar las condiciones espec\u00EDficas que se muestran en ese momento. La administraci\u00F3n debe resolverla. Si corresponde un reembolso, la reserva se cancela y las fechas se liberan al confirmarse la devoluci\u00F3n; si no corresponde devoluci\u00F3n, al aprobarse la solicitud.");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(26, "p");
    i0.ɵɵtext(27, "Para solicitudes del inquilino se aplica la pol\u00EDtica vigente a la fecha de pago y el porcentaje depende de la anticipaci\u00F3n. La pol\u00EDtica vigente para nuevas operaciones es:");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(28, TerminosComponent_Conditional_9_Conditional_28_Template, 9, 7)(29, TerminosComponent_Conditional_9_Conditional_29_Template, 2, 0, "p", 9)(30, TerminosComponent_Conditional_9_Conditional_30_Template, 2, 0, "p", 10);
    i0.ɵɵelementStart(31, "p");
    i0.ɵɵtext(32, "Las condiciones aplicables a una reserva concreta se muestran al solicitar su cancelaci\u00F3n. Las comisiones de Mercado Pago se tratan como costo de la operaci\u00F3n y no se reintegran al inquilino.");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(33, "p");
    i0.ɵɵtext(34, "El porcentaje de devoluci\u00F3n se calcula con la fecha de env\u00EDo de la solicitud y sobre el importe efectivamente pagado por la reserva. La aprobaci\u00F3n debe ocurrir antes de la fecha de ingreso.");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(35, "p");
    i0.ɵɵtext(36, "Si tu solicitud de cancelaci\u00F3n no recibe respuesta antes de la fecha de ingreso, se considera rechazada y la reserva sigue en curso. El solicitante puede presentar un reclamo por demora administrativa desde el ingreso y hasta siete d\u00EDas corridos despu\u00E9s de finalizar la estad\u00EDa. Este reclamo no cancela la reserva, no bloquea por s\u00ED solo la liquidaci\u00F3n ni genera autom\u00E1ticamente devoluciones o compensaciones.");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(37, "h2");
    i0.ɵɵtext(38, "5. Reclamos");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(39, "p");
    i0.ɵɵtext(40, "Pod\u00E9s abrir un reclamo desde el inicio de la estad\u00EDa hasta el final del cuarto d\u00EDa calendario posterior a su finalizaci\u00F3n. Pod\u00E9s aportar im\u00E1genes y comunicarte con el anunciante y la administraci\u00F3n. La administraci\u00F3n revisa el caso y puede disponer una devoluci\u00F3n total o parcial. El reclamo no cancela autom\u00E1ticamente la reserva ni libera las fechas.");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(41, "h2");
    i0.ɵɵtext(42, "6. Datos personales, bloqueo y baja");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(43, "p");
    i0.ɵɵtext(44, "DEPA utiliza los datos proporcionados para gestionar la cuenta, las publicaciones, la comunicaci\u00F3n, las reservas, los pagos, las verificaciones y las notificaciones. Los servicios externos intervienen cuando us\u00E1s sus funciones, por ejemplo Mercado Pago para pagos y WhatsApp para contacto externo.");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(45, "p");
    i0.ɵɵtext(46, "La administraci\u00F3n puede bloquear una cuenta ante incumplimientos. Seg\u00FAn las operaciones pendientes, puede habilitarse un acceso limitado para gestionarlas y comunicarse. Pod\u00E9s solicitar la baja cuando no existan operaciones pendientes en tus roles; se conserva el historial de operaciones y la baja no produce cancelaciones ni devoluciones autom\u00E1ticas.");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(47, "h2");
    i0.ɵɵtext(48, "7. Convertirse en anunciante");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(49, "p");
    i0.ɵɵtext(50, "Para ofrecer propiedades ten\u00E9s que solicitar la habilitaci\u00F3n y aceptar las ");
    i0.ɵɵelementStart(51, "a", 11);
    i0.ɵɵtext(52, "condiciones para anunciantes");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(53, ", que complementan estas condiciones de uso.");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    let tmp_1_0;
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(28);
    i0.ɵɵconditional((tmp_1_0 = ctx_r0.politica()) ? 28 : ctx_r0.errorPolitica() ? 29 : 30, tmp_1_0);
} }
export class TerminosComponent {
    http = inject(HttpClient);
    parametros = toSignal(inject(ActivatedRoute).paramMap);
    anunciante = computed(() => this.parametros()?.get('tipo') === 'anunciantes', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "anunciante" }] : /* istanbul ignore next */ []));
    politica = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "politica" }] : /* istanbul ignore next */ []));
    comision = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "comision" }] : /* istanbul ignore next */ []));
    errorPolitica = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "errorPolitica" }] : /* istanbul ignore next */ []));
    errorComision = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "errorComision" }] : /* istanbul ignore next */ []));
    constructor() {
        this.http.get(`${environment.apiUrl}/reservas/politica-cancelacion/vigente`).subscribe({
            next: (politica) => this.politica.set(politica),
            error: () => this.errorPolitica.set(true),
        });
        this.http.get(`${environment.apiUrl}/catalogos/comision-vigente`).subscribe({
            next: ({ porcentaje }) => this.comision.set(porcentaje),
            error: () => this.errorComision.set(true),
        });
    }
    static ɵfac = function TerminosComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || TerminosComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: TerminosComponent, selectors: [["app-terminos"]], decls: 12, vars: 1, consts: [[1, "terminos"], ["routerLink", "/", 1, "terminos__back"], [1, "terminos__card"], ["routerLink", "/", "aria-label", "Ir al inicio"], ["src", "/images/Logo.png", "alt", "DEPA", 1, "terminos__logo"], [1, "terminos__eyebrow"], [1, "terminos__foot"], [1, "terminos__intro"], ["routerLink", "/terminos/usuarios"], ["role", "status", 1, "terminos__notice"], ["role", "status"], ["routerLink", "/terminos/anunciantes"]], template: function TerminosComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "main", 0)(1, "a", 1);
            i0.ɵɵtext(2, "\u2190 Volver al inicio");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(3, "article", 2)(4, "a", 3);
            i0.ɵɵelement(5, "img", 4);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(6, "p", 5);
            i0.ɵɵtext(7, "DEPA ALQUILERES");
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(8, TerminosComponent_Conditional_8_Template, 53, 2)(9, TerminosComponent_Conditional_9_Template, 54, 1);
            i0.ɵɵelementStart(10, "p", 6);
            i0.ɵɵtext(11, "Los importes, plazos y condiciones de cada operaci\u00F3n se informan durante el proceso correspondiente.");
            i0.ɵɵelementEnd()()();
        } if (rf & 2) {
            i0.ɵɵadvance(8);
            i0.ɵɵconditional(ctx.anunciante() ? 8 : 9);
        } }, dependencies: [RouterLink], styles: [".terminos[_ngcontent-%COMP%] { max-width: 920px; margin: 0 auto; padding: 2rem 1.25rem 5rem; color: #28323a; }\r\n.terminos__back[_ngcontent-%COMP%] { display: inline-block; margin-bottom: 1.5rem; color: #9d4b30; text-decoration: none; font-weight: 600; }\r\n.terminos__card[_ngcontent-%COMP%] { background: #fff; border: 1px solid #eee6e0; border-radius: 20px; padding: clamp(1.5rem, 5vw, 3.5rem); box-shadow: 0 12px 40px #3328200d; }\r\n.terminos__logo[_ngcontent-%COMP%] { width: 115px; height: auto; margin-bottom: 2rem; }\r\n.terminos__eyebrow[_ngcontent-%COMP%] { color: #b45b3b; font-size: .75rem; font-weight: 700; letter-spacing: .12em; }\r\nh1[_ngcontent-%COMP%] { font-size: clamp(1.8rem, 5vw, 2.7rem); line-height: 1.15; margin: .5rem 0 1rem; color: #202a30; }\r\nh2[_ngcontent-%COMP%] { font-size: 1.2rem; margin: 2rem 0 .5rem; color: #202a30; }\r\np[_ngcontent-%COMP%], li[_ngcontent-%COMP%] { line-height: 1.75; }\r\np[_ngcontent-%COMP%] { margin: .7rem 0; }\r\nul[_ngcontent-%COMP%] { padding-left: 1.5rem; }\r\na[_ngcontent-%COMP%] { color: #a64f31; }\r\n.terminos__intro[_ngcontent-%COMP%] { font-size: 1.08rem; color: #68737a; }\r\n.terminos__notice[_ngcontent-%COMP%] { background: #fff6ed; border-radius: 8px; padding: .75rem 1rem; }\r\n.terminos__foot[_ngcontent-%COMP%] { border-top: 1px solid #eee6e0; margin-top: 2rem; padding-top: 1rem; color: #68737a; font-size: .9rem; }"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(TerminosComponent, [{
        type: Component,
        args: [{ selector: 'app-terminos', standalone: true, imports: [RouterLink], template: "<main class=\"terminos\">\r\n  <a class=\"terminos__back\" routerLink=\"/\">\u2190 Volver al inicio</a>\r\n  <article class=\"terminos__card\">\r\n    <a routerLink=\"/\" aria-label=\"Ir al inicio\"><img src=\"/images/Logo.png\" alt=\"DEPA\" class=\"terminos__logo\" /></a>\r\n    <p class=\"terminos__eyebrow\">DEPA ALQUILERES</p>\r\n    @if (anunciante()) {\r\n      <h1>T\u00E9rminos y condiciones para anunciantes</h1>\r\n      <p class=\"terminos__intro\">Estas condiciones complementan los <a routerLink=\"/terminos/usuarios\">t\u00E9rminos de uso para usuarios</a> y explican c\u00F3mo funciona DEPA para quienes ofrecen propiedades.</p>\r\n      <h2>1. Solicitud y verificaci\u00F3n</h2>\r\n      <p>Para publicar, deb\u00E9s solicitar la habilitaci\u00F3n como propietario particular o inmobiliaria y proporcionar datos verdaderos, tu CUIT o CUIL, un n\u00FAmero de contacto y un CBU de una cuenta a tu nombre. El CBU se encuentra sujeto a revisi\u00F3n. Tambi\u00E9n deb\u00E9s presentar frente y dorso del DNI y realizar una prueba de vida. La habilitaci\u00F3n requiere una revisi\u00F3n y aprobaci\u00F3n por parte de la administraci\u00F3n; completar la prueba de vida no habilita autom\u00E1ticamente la cuenta.</p>\r\n      <p>Si actu\u00E1s como inmobiliaria, el corredor responsable debe acreditar su identidad e informar los datos de la organizaci\u00F3n, la matr\u00EDcula, el colegio profesional y el domicilio comercial, adem\u00E1s de presentar la constancia de CUIT y la documentaci\u00F3n de la matr\u00EDcula.</p>\r\n      <h2>2. Publicaciones y disponibilidad</h2>\r\n      <p>Sos responsable de que las propiedades que ofrec\u00E9s, sus im\u00E1genes, precios, condiciones, ubicaci\u00F3n y disponibilidad sean correctos y est\u00E9n actualizados. Deb\u00E9s estar habilitado para ofrecerlas y atender las consultas y reservas recibidas. Una publicaci\u00F3n activa debe contar con al menos una imagen.</p>\r\n      <p>En alquileres de largo plazo DEPA facilita la consulta y el contacto; la celebraci\u00F3n de contratos y otros tr\u00E1mites legales se realizan fuera de la plataforma. En alquileres temporarios administr\u00E1s la disponibilidad y las reservas a trav\u00E9s del calendario.</p>\r\n      <h2>3. Reservas e ingreso</h2>\r\n      <p>Las fechas de una reserva pendiente quedan bloqueadas hasta 15 minutos mientras se procesa el pago. La reserva se confirma cuando el pago se aprueba dentro del plazo. El inquilino puede solicitar una reprogramaci\u00F3n antes del inicio si las nuevas fechas est\u00E1n disponibles; se mantienen la duraci\u00F3n y las condiciones econ\u00F3micas originales.</p>\r\n      <p>Al ingresar, el inquilino te entrega su c\u00F3digo de alojamiento y deb\u00E9s cargarlo en DEPA para validar el ingreso. Un c\u00F3digo incorrecto reiterado o un reclamo puede dejar la liquidaci\u00F3n en revisi\u00F3n. No solicites el c\u00F3digo antes de que se produzca el ingreso.</p>\r\n      <h2>4. Comisi\u00F3n y liquidaci\u00F3n</h2>\r\n      @if (comision() !== null) {\r\n        <p>La comisi\u00F3n vigente de DEPA es del <strong>{{ comision() }} %</strong>. Se calcula sobre el importe total pagado por el inquilino y se descuenta del importe a transferirte cuando la liquidaci\u00F3n finaliza con el pago total al anunciante.</p>\r\n      } @else if (errorComision()) {\r\n        <p class=\"terminos__notice\" role=\"status\">No pudimos consultar la comisi\u00F3n vigente. Consultala antes de realizar una operaci\u00F3n.</p>\r\n      } @else { <p role=\"status\">Consultando la comisi\u00F3n vigente\u2026</p> }\r\n      <p>El porcentaje puede modificarse para futuras reservas. Cada reserva conserva el porcentaje correspondiente al registrar sus condiciones econ\u00F3micas. Si se realiza una devoluci\u00F3n total o parcial al inquilino, no se aplica comisi\u00F3n de DEPA a esa reserva. Los costos de Mercado Pago son independientes.</p>\r\n      <p>La liquidaci\u00F3n queda retenida tras aprobarse el pago. La validaci\u00F3n del c\u00F3digo permite que pase a pendiente de pago. El registro del pago se habilita a partir del quinto d\u00EDa calendario posterior al fin de la estad\u00EDa, siempre que el CBU est\u00E9 validado y la liquidaci\u00F3n habilitada. El pago al anunciante se realiza fuera de DEPA y la administraci\u00F3n lo registra; no es una transferencia autom\u00E1tica. Una revisi\u00F3n o un reclamo puede demorar su resoluci\u00F3n.</p>\r\n      <h2>5. Cancelaciones y reclamos</h2>\r\n      <p>Una reserva pendiente de pago puede cancelarse y libera las fechas. Para cancelar una reserva pagada, deb\u00E9s solicitarlo antes del d\u00EDa de ingreso y la administraci\u00F3n debe resolver la solicitud. Si se aprueba una cancelaci\u00F3n solicitada por el anunciante, corresponde la devoluci\u00F3n del 100 % al inquilino. Cuando hay devoluci\u00F3n, la reserva se cancela y las fechas se liberan al confirmarse el reembolso.</p>\r\n      <p>Si la cancelaci\u00F3n la solicita el inquilino, se aplica la pol\u00EDtica correspondiente a la fecha de pago. La pol\u00EDtica vigente para nuevas operaciones es:</p>\r\n      @if (politica(); as p) {\r\n        <ul>\r\n          <li>{{ p.diasDevolucionTotal }} d\u00EDas o m\u00E1s antes del ingreso: {{ p.porcentajeTotal }} %.</li>\r\n          <li>Desde {{ p.diasDevolucionParcial }} hasta menos de {{ p.diasDevolucionTotal }} d\u00EDas antes: {{ p.porcentajeParcial }} %.</li>\r\n          <li>Menos de {{ p.diasDevolucionParcial }} d\u00EDas antes: {{ p.porcentajeFueraDePlazo }} %.</li>\r\n        </ul>\r\n        <p>Las condiciones de cada reserva se muestran al solicitar la cancelaci\u00F3n.</p>\r\n      } @else if (errorPolitica()) {\r\n        <p class=\"terminos__notice\" role=\"status\">No pudimos consultar la pol\u00EDtica vigente. Revis\u00E1 las condiciones de la reserva antes de realizar una operaci\u00F3n.</p>\r\n      } @else { <p role=\"status\">Consultando la pol\u00EDtica de cancelaci\u00F3n vigente\u2026</p> }\r\n      <p>El porcentaje de devoluci\u00F3n se calcula con la fecha de env\u00EDo de la solicitud y sobre el importe efectivamente pagado por la reserva. La aprobaci\u00F3n debe ocurrir antes de la fecha de ingreso.</p>\r\n      <p>Si tu solicitud de cancelaci\u00F3n no recibe respuesta antes de la fecha de ingreso, se considera rechazada y la reserva sigue en curso. El solicitante puede presentar un reclamo por demora administrativa desde el ingreso y hasta siete d\u00EDas corridos despu\u00E9s de finalizar la estad\u00EDa. Este reclamo no cancela la reserva, no bloquea por s\u00ED solo la liquidaci\u00F3n ni genera autom\u00E1ticamente devoluciones o compensaciones.</p>\r\n      <p>El inquilino puede iniciar un reclamo desde el inicio de la estad\u00EDa hasta el final del cuarto d\u00EDa calendario posterior a su finalizaci\u00F3n. La administraci\u00F3n lo revisa y puede resolver una devoluci\u00F3n total o parcial. Un reclamo no cancela autom\u00E1ticamente la reserva ni libera las fechas.</p>\r\n      <h2>6. Pausa, bloqueo y baja</h2>\r\n      <p>Pod\u00E9s pausar tus actividades para dejar de recibir nuevas reservas mientras gestion\u00E1s las existentes. La administraci\u00F3n puede bloquear la cuenta o dar de baja publicaciones por incumplimientos. Las reservas y liquidaciones existentes se tratar\u00E1n seg\u00FAn su estado. Pod\u00E9s solicitar la baja de la cuenta cuando no existan operaciones pendientes en ninguno de tus roles; la baja no cancela ni reembolsa autom\u00E1ticamente las reservas.</p>\r\n    } @else {\r\n      <h1>T\u00E9rminos y condiciones de uso</h1>\r\n      <p class=\"terminos__intro\">Estas condiciones explican c\u00F3mo usar DEPA, buscar propiedades y gestionar reservas como usuario o inquilino.</p>\r\n      <h2>1. La plataforma</h2>\r\n      <p>DEPA re\u00FAne publicaciones de propiedades en alquiler y facilita el contacto entre inquilinos, propietarios e inmobiliarias. En alquileres temporarios permite gestionar disponibilidad, reservas y pagos. En alquileres de largo plazo facilita la b\u00FAsqueda y el contacto; los contratos y tr\u00E1mites legales se realizan fuera de la plataforma.</p>\r\n      <h2>2. Cuenta y uso responsable</h2>\r\n      <p>Pod\u00E9s consultar publicaciones y contactar por WhatsApp sin iniciar sesi\u00F3n. Para usar favoritos, mensajer\u00EDa interna o reservas necesit\u00E1s una cuenta y verificar tu correo. Deb\u00E9s brindar datos correctos, mantenerlos actualizados y proteger tu contrase\u00F1a. La cuenta no debe utilizarse para suplantar a otra persona, publicar contenido enga\u00F1oso o perjudicar a otros usuarios.</p>\r\n      <p>WhatsApp es un servicio externo y DEPA no almacena los mensajes intercambiados all\u00ED. La mensajer\u00EDa interna requiere autenticaci\u00F3n y conserva el historial en la plataforma.</p>\r\n      <h2>3. Reservas y pagos</h2>\r\n      <p>En una propiedad que admita reservas, seleccion\u00E1s fechas disponibles y revis\u00E1s las condiciones econ\u00F3micas antes de pagar. Se cuentan d\u00EDas calendario, incluidos el inicio y el fin. El pago se procesa mediante Mercado Pago; DEPA no almacena los datos de tu tarjeta.</p>\r\n      <p>Al crear una reserva pendiente, las fechas se bloquean durante un m\u00E1ximo de 15 minutos. Si un pago se rechaza o cancela, pod\u00E9s reintentarlo dentro del plazo original. Si no se aprueba a tiempo, la reserva se cancela y se liberan las fechas. La confirmaci\u00F3n depende de la aprobaci\u00F3n del pago.</p>\r\n      <p>Una vez confirmada, recibir\u00E1s un c\u00F3digo de alojamiento. Entregalo al anunciante al ingresar a la propiedad para que valide tu llegada. Antes del inicio pod\u00E9s reprogramar la reserva si las nuevas fechas est\u00E1n disponibles, conservando la duraci\u00F3n y el importe.</p>\r\n      <h2>4. Cancelaciones y devoluciones</h2>\r\n      <p>Una reserva pendiente de pago puede cancelarse sin devoluci\u00F3n. Para una reserva pagada deb\u00E9s solicitar la cancelaci\u00F3n antes del ingreso y aceptar las condiciones espec\u00EDficas que se muestran en ese momento. La administraci\u00F3n debe resolverla. Si corresponde un reembolso, la reserva se cancela y las fechas se liberan al confirmarse la devoluci\u00F3n; si no corresponde devoluci\u00F3n, al aprobarse la solicitud.</p>\r\n      <p>Para solicitudes del inquilino se aplica la pol\u00EDtica vigente a la fecha de pago y el porcentaje depende de la anticipaci\u00F3n. La pol\u00EDtica vigente para nuevas operaciones es:</p>\r\n      @if (politica(); as p) {\r\n        <ul>\r\n          <li>{{ p.diasDevolucionTotal }} d\u00EDas o m\u00E1s antes del ingreso: {{ p.porcentajeTotal }} %.</li>\r\n          <li>Desde {{ p.diasDevolucionParcial }} hasta menos de {{ p.diasDevolucionTotal }} d\u00EDas antes: {{ p.porcentajeParcial }} %.</li>\r\n          <li>Menos de {{ p.diasDevolucionParcial }} d\u00EDas antes: {{ p.porcentajeFueraDePlazo }} %.</li>\r\n        </ul>\r\n        <p>Si el anunciante solicita la cancelaci\u00F3n, corresponde el 100 % de devoluci\u00F3n. El medio de pago puede determinar c\u00F3mo se realiza el reintegro.</p>\r\n      } @else if (errorPolitica()) {\r\n        <p class=\"terminos__notice\" role=\"status\">No pudimos consultar la pol\u00EDtica vigente. Revis\u00E1 las condiciones de tu reserva antes de realizar una operaci\u00F3n.</p>\r\n      } @else { <p role=\"status\">Consultando la pol\u00EDtica de cancelaci\u00F3n vigente\u2026</p> }\r\n      <p>Las condiciones aplicables a una reserva concreta se muestran al solicitar su cancelaci\u00F3n. Las comisiones de Mercado Pago se tratan como costo de la operaci\u00F3n y no se reintegran al inquilino.</p>\r\n      <p>El porcentaje de devoluci\u00F3n se calcula con la fecha de env\u00EDo de la solicitud y sobre el importe efectivamente pagado por la reserva. La aprobaci\u00F3n debe ocurrir antes de la fecha de ingreso.</p>\r\n      <p>Si tu solicitud de cancelaci\u00F3n no recibe respuesta antes de la fecha de ingreso, se considera rechazada y la reserva sigue en curso. El solicitante puede presentar un reclamo por demora administrativa desde el ingreso y hasta siete d\u00EDas corridos despu\u00E9s de finalizar la estad\u00EDa. Este reclamo no cancela la reserva, no bloquea por s\u00ED solo la liquidaci\u00F3n ni genera autom\u00E1ticamente devoluciones o compensaciones.</p>\r\n      <h2>5. Reclamos</h2>\r\n      <p>Pod\u00E9s abrir un reclamo desde el inicio de la estad\u00EDa hasta el final del cuarto d\u00EDa calendario posterior a su finalizaci\u00F3n. Pod\u00E9s aportar im\u00E1genes y comunicarte con el anunciante y la administraci\u00F3n. La administraci\u00F3n revisa el caso y puede disponer una devoluci\u00F3n total o parcial. El reclamo no cancela autom\u00E1ticamente la reserva ni libera las fechas.</p>\r\n      <h2>6. Datos personales, bloqueo y baja</h2>\r\n      <p>DEPA utiliza los datos proporcionados para gestionar la cuenta, las publicaciones, la comunicaci\u00F3n, las reservas, los pagos, las verificaciones y las notificaciones. Los servicios externos intervienen cuando us\u00E1s sus funciones, por ejemplo Mercado Pago para pagos y WhatsApp para contacto externo.</p>\r\n      <p>La administraci\u00F3n puede bloquear una cuenta ante incumplimientos. Seg\u00FAn las operaciones pendientes, puede habilitarse un acceso limitado para gestionarlas y comunicarse. Pod\u00E9s solicitar la baja cuando no existan operaciones pendientes en tus roles; se conserva el historial de operaciones y la baja no produce cancelaciones ni devoluciones autom\u00E1ticas.</p>\r\n      <h2>7. Convertirse en anunciante</h2>\r\n      <p>Para ofrecer propiedades ten\u00E9s que solicitar la habilitaci\u00F3n y aceptar las <a routerLink=\"/terminos/anunciantes\">condiciones para anunciantes</a>, que complementan estas condiciones de uso.</p>\r\n    }\r\n    <p class=\"terminos__foot\">Los importes, plazos y condiciones de cada operaci\u00F3n se informan durante el proceso correspondiente.</p>\r\n  </article>\r\n</main>\r\n", styles: [".terminos { max-width: 920px; margin: 0 auto; padding: 2rem 1.25rem 5rem; color: #28323a; }\r\n.terminos__back { display: inline-block; margin-bottom: 1.5rem; color: #9d4b30; text-decoration: none; font-weight: 600; }\r\n.terminos__card { background: #fff; border: 1px solid #eee6e0; border-radius: 20px; padding: clamp(1.5rem, 5vw, 3.5rem); box-shadow: 0 12px 40px #3328200d; }\r\n.terminos__logo { width: 115px; height: auto; margin-bottom: 2rem; }\r\n.terminos__eyebrow { color: #b45b3b; font-size: .75rem; font-weight: 700; letter-spacing: .12em; }\r\nh1 { font-size: clamp(1.8rem, 5vw, 2.7rem); line-height: 1.15; margin: .5rem 0 1rem; color: #202a30; }\r\nh2 { font-size: 1.2rem; margin: 2rem 0 .5rem; color: #202a30; }\r\np, li { line-height: 1.75; }\r\np { margin: .7rem 0; }\r\nul { padding-left: 1.5rem; }\r\na { color: #a64f31; }\r\n.terminos__intro { font-size: 1.08rem; color: #68737a; }\r\n.terminos__notice { background: #fff6ed; border-radius: 8px; padding: .75rem 1rem; }\r\n.terminos__foot { border-top: 1px solid #eee6e0; margin-top: 2rem; padding-top: 1rem; color: #68737a; font-size: .9rem; }\r\n"] }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(TerminosComponent, { className: "TerminosComponent", filePath: "src/app/features/terminos/terminos.component.ts", lineNumber: 23 }); })();
