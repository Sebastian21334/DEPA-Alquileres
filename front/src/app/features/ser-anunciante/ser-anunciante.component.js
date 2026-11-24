import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideArrowRight, LucideBadgeCheck, LucideBuilding2, LucideCamera, LucideCheck, LucideClock3, LucideFileText, LucideHouse, LucideIdCard, LucideShieldCheck, LucideUserRoundCheck, } from '@lucide/angular';
import { AuthService } from '../../core/services/auth.service';
import * as i0 from "@angular/core";
const _c0 = () => ({ returnUrl: "/mi-perfil/anunciante" });
function SerAnuncianteComponent_Conditional_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 7);
    i0.ɵɵtext(1, " Comenzar verificaci\u00F3n ");
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(2, "svg", 40);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("size", 18);
} }
function SerAnuncianteComponent_Conditional_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 39);
    i0.ɵɵtext(1, " Crear mi cuenta ");
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(2, "svg", 40);
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(3, "a", 41);
    i0.ɵɵtext(4, " Ya tengo cuenta ");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("size", 18);
    i0.ɵɵadvance();
    i0.ɵɵproperty("queryParams", i0.ɵɵpureFunction0(2, _c0));
} }
function SerAnuncianteComponent_Conditional_164_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 7);
    i0.ɵɵtext(1, "Iniciar solicitud ");
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(2, "svg", 40);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("size", 18);
} }
function SerAnuncianteComponent_Conditional_165_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 39);
    i0.ɵɵtext(1, "Crear mi cuenta ");
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(2, "svg", 40);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("size", 18);
} }
export class SerAnuncianteComponent {
    auth = inject(AuthService);
    static ɵfac = function SerAnuncianteComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || SerAnuncianteComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: SerAnuncianteComponent, selectors: [["app-ser-anunciante"]], decls: 166, vars: 19, consts: [[1, "owner-page"], [1, "owner-hero"], [1, "owner-wrap", "owner-hero__grid"], [1, "owner-hero__content"], [1, "eyebrow"], ["lucideHouse", "", 3, "size"], [1, "owner-actions"], ["routerLink", "/mi-perfil/anunciante", 1, "owner-btn", "owner-btn--primary"], [1, "owner-hero__note"], ["lucideShieldCheck", "", 3, "size"], ["aria-label", "Resumen del proceso", 1, "summary-card"], [1, "summary-card__icon"], ["lucideBadgeCheck", "", 3, "size"], [1, "summary-card__label"], ["lucideCheck", "", 3, "size"], ["aria-labelledby", "requisitos-title", 1, "owner-section", "owner-wrap"], [1, "section-heading"], ["id", "requisitos-title"], [1, "requirement-grid"], [1, "requirement-card"], [1, "requirement-card__icon", "requirement-card__icon--blue"], ["lucideUserRoundCheck", "", 3, "size"], [1, "requirement-card__icon", "requirement-card__icon--red"], ["lucideBuilding2", "", 3, "size"], [1, "requirement-card__icon", "requirement-card__icon--yellow"], ["lucideIdCard", "", 3, "size"], ["lucideCamera", "", 3, "size"], [1, "file-note"], ["lucideFileText", "", 3, "size"], [1, "process-section"], [1, "owner-wrap"], [1, "section-heading", "section-heading--light"], [1, "process-list"], [1, "owner-section", "owner-wrap"], [1, "benefit-panel"], [1, "eyebrow", "eyebrow--plain"], [1, "review-notice"], ["lucideClock3", "", 3, "size"], [1, "final-cta"], ["routerLink", "/registro", 1, "owner-btn", "owner-btn--primary"], ["lucideArrowRight", "", 3, "size"], ["routerLink", "/login", 1, "owner-btn", "owner-btn--secondary", 3, "queryParams"]], template: function SerAnuncianteComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "main", 0)(1, "section", 1)(2, "div", 2)(3, "div", 3)(4, "span", 4);
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelement(5, "svg", 5);
            i0.ɵɵtext(6, " Public\u00E1 en DEPA");
            i0.ɵɵelementEnd();
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelementStart(7, "h1");
            i0.ɵɵtext(8, "Todo lo que necesit\u00E1s para convertirte en anunciante");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(9, "p");
            i0.ɵɵtext(10, " Si sos propietario particular o represent\u00E1s una inmobiliaria, pod\u00E9s publicar y administrar propiedades desde un solo lugar. Para cuidar a la comunidad, verificamos tu identidad antes de habilitar la primera publicaci\u00F3n. ");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(11, "div", 6);
            i0.ɵɵconditionalCreate(12, SerAnuncianteComponent_Conditional_12_Template, 3, 1, "a", 7)(13, SerAnuncianteComponent_Conditional_13_Template, 5, 3);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(14, "p", 8);
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelement(15, "svg", 9);
            i0.ɵɵtext(16, " Tu documentaci\u00F3n solo se utiliza para revisar tu identidad.");
            i0.ɵɵelementEnd()();
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelementStart(17, "aside", 10)(18, "span", 11);
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelement(19, "svg", 12);
            i0.ɵɵelementEnd();
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelementStart(20, "p", 13);
            i0.ɵɵtext(21, "Proceso de verificaci\u00F3n");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(22, "strong");
            i0.ɵɵtext(23, "Prepar\u00E1 tus datos y documentos");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(24, "ul")(25, "li");
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelement(26, "svg", 14);
            i0.ɵɵtext(27, " CUIT o CUIL y tel\u00E9fono de contacto");
            i0.ɵɵelementEnd();
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelementStart(28, "li");
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelement(29, "svg", 14);
            i0.ɵɵtext(30, " DNI de frente y dorso");
            i0.ɵɵelementEnd();
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelementStart(31, "li");
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelement(32, "svg", 14);
            i0.ɵɵtext(33, " Foto o video de tu rostro");
            i0.ɵɵelementEnd();
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelementStart(34, "li");
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelement(35, "svg", 14);
            i0.ɵɵtext(36, " Revisi\u00F3n manual del equipo");
            i0.ɵɵelementEnd()()()()();
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelementStart(37, "section", 15)(38, "div", 16)(39, "span");
            i0.ɵɵtext(40, "Antes de empezar");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(41, "h2", 17);
            i0.ɵɵtext(42, "\u00BFQu\u00E9 necesit\u00E1s?");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(43, "p");
            i0.ɵɵtext(44, "Ten\u00E9 a mano estos datos para completar la solicitud sin interrupciones.");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(45, "div", 18)(46, "article", 19)(47, "span", 20);
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelement(48, "svg", 21);
            i0.ɵɵelementEnd();
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelementStart(49, "h3");
            i0.ɵɵtext(50, "Una cuenta verificada");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(51, "p");
            i0.ɵɵtext(52, "Nombre, apellido, email \u00FAnico, tel\u00E9fono y una contrase\u00F1a segura. Primero deber\u00E1s confirmar tu correo.");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(53, "article", 19)(54, "span", 22);
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelement(55, "svg", 23);
            i0.ɵɵelementEnd();
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelementStart(56, "h3");
            i0.ɵɵtext(57, "Datos del anunciante");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(58, "p");
            i0.ɵɵtext(59, "Eleg\u00ED si sos propietario o inmobiliaria e ingres\u00E1 tu CUIT/CUIL y un n\u00FAmero de contacto.");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(60, "article", 19)(61, "span", 24);
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelement(62, "svg", 25);
            i0.ɵɵelementEnd();
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelementStart(63, "h3");
            i0.ɵɵtext(64, "Documento de identidad");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(65, "p");
            i0.ɵɵtext(66, "Dos im\u00E1genes n\u00EDtidas de tu DNI: una del frente y otra del dorso, en formato JPG, PNG o WEBP.");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(67, "article", 19)(68, "span", 20);
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelement(69, "svg", 26);
            i0.ɵɵelementEnd();
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelementStart(70, "h3");
            i0.ɵɵtext(71, "Prueba facial");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(72, "p");
            i0.ɵɵtext(73, "Una foto de tu rostro o un video breve para validar que la documentaci\u00F3n te pertenece.");
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(74, "div", 27);
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelement(75, "svg", 28);
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelementStart(76, "p")(77, "strong");
            i0.ɵɵtext(78, "Formatos admitidos:");
            i0.ɵɵelementEnd();
            i0.ɵɵtext(79, " im\u00E1genes de hasta 5 MB; para la prueba facial tambi\u00E9n pod\u00E9s subir video MP4, WEBM o MOV de hasta 20 MB.");
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(80, "section", 29)(81, "div", 30)(82, "div", 31)(83, "span");
            i0.ɵɵtext(84, "Simple y transparente");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(85, "h2");
            i0.ɵɵtext(86, "C\u00F3mo funciona el registro");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(87, "ol", 32)(88, "li")(89, "span");
            i0.ɵɵtext(90, "1");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(91, "div")(92, "strong");
            i0.ɵɵtext(93, "Cre\u00E1 tu cuenta");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(94, "p");
            i0.ɵɵtext(95, "Complet\u00E1 tus datos personales y verific\u00E1 tu email.");
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(96, "li")(97, "span");
            i0.ɵɵtext(98, "2");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(99, "div")(100, "strong");
            i0.ɵɵtext(101, "Eleg\u00ED tu perfil");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(102, "p");
            i0.ɵɵtext(103, "Indic\u00E1 si sos propietario particular o inmobiliaria.");
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(104, "li")(105, "span");
            i0.ɵɵtext(106, "3");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(107, "div")(108, "strong");
            i0.ɵɵtext(109, "Sub\u00ED la documentaci\u00F3n");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(110, "p");
            i0.ɵɵtext(111, "Carg\u00E1 CUIT/CUIL, contacto, DNI y prueba facial.");
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(112, "li")(113, "span");
            i0.ɵɵtext(114, "4");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(115, "div")(116, "strong");
            i0.ɵɵtext(117, "Esper\u00E1 la revisi\u00F3n");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(118, "p");
            i0.ɵɵtext(119, "Un administrador revisar\u00E1 la informaci\u00F3n y te notificaremos por email.");
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(120, "li")(121, "span");
            i0.ɵɵtext(122, "5");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(123, "div")(124, "strong");
            i0.ɵɵtext(125, "Empez\u00E1 a publicar");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(126, "p");
            i0.ɵɵtext(127, "Una vez aprobado, podr\u00E1s crear y administrar tus propiedades.");
            i0.ɵɵelementEnd()()()()()();
            i0.ɵɵelementStart(128, "section", 33)(129, "div", 34)(130, "div")(131, "span", 35);
            i0.ɵɵtext(132, "Tu espacio como anunciante");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(133, "h2");
            i0.ɵɵtext(134, "Gestion\u00E1 tus alquileres desde DEPA");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(135, "p");
            i0.ɵɵtext(136, "Public\u00E1 propiedades de largo plazo o temporarias y manten\u00E9 toda la informaci\u00F3n organizada.");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(137, "ul")(138, "li");
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelement(139, "svg", 14);
            i0.ɵɵtext(140, " Crear, editar, activar o desactivar publicaciones");
            i0.ɵɵelementEnd();
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelementStart(141, "li");
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelement(142, "svg", 14);
            i0.ɵɵtext(143, " Administrar im\u00E1genes y datos de cada propiedad");
            i0.ɵɵelementEnd();
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelementStart(144, "li");
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelement(145, "svg", 14);
            i0.ɵɵtext(146, " Gestionar disponibilidad y reservas temporarias");
            i0.ɵɵelementEnd();
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelementStart(147, "li");
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelement(148, "svg", 14);
            i0.ɵɵtext(149, " Recibir consultas mediante el chat de la plataforma");
            i0.ɵɵelementEnd()()();
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelementStart(150, "div", 36)(151, "span");
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelement(152, "svg", 37);
            i0.ɵɵelementEnd();
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelementStart(153, "div")(154, "h3");
            i0.ɵɵtext(155, "La aprobaci\u00F3n es necesaria antes de publicar");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(156, "p");
            i0.ɵɵtext(157, "Pod\u00E9s registrarte y enviar la solicitud, pero la funci\u00F3n de publicar se habilita despu\u00E9s de la revisi\u00F3n manual. Si la documentaci\u00F3n es rechazada, vas a recibir el motivo y podr\u00E1s volver a cargarla.");
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(158, "div", 38)(159, "div")(160, "span");
            i0.ɵɵtext(161, "\u00BFTen\u00E9s todo listo?");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(162, "h2");
            i0.ɵɵtext(163, "Empez\u00E1 a publicar con DEPA");
            i0.ɵɵelementEnd()();
            i0.ɵɵconditionalCreate(164, SerAnuncianteComponent_Conditional_164_Template, 3, 1, "a", 7)(165, SerAnuncianteComponent_Conditional_165_Template, 3, 1, "a", 39);
            i0.ɵɵelementEnd()()();
        } if (rf & 2) {
            i0.ɵɵadvance(5);
            i0.ɵɵproperty("size", 16);
            i0.ɵɵadvance(7);
            i0.ɵɵconditional(ctx.auth.isAuthenticated ? 12 : 13);
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("size", 17);
            i0.ɵɵadvance(4);
            i0.ɵɵproperty("size", 30);
            i0.ɵɵadvance(7);
            i0.ɵɵproperty("size", 16);
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("size", 16);
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("size", 16);
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("size", 16);
            i0.ɵɵadvance(13);
            i0.ɵɵproperty("size", 25);
            i0.ɵɵadvance(7);
            i0.ɵɵproperty("size", 25);
            i0.ɵɵadvance(7);
            i0.ɵɵproperty("size", 25);
            i0.ɵɵadvance(7);
            i0.ɵɵproperty("size", 25);
            i0.ɵɵadvance(6);
            i0.ɵɵproperty("size", 22);
            i0.ɵɵadvance(64);
            i0.ɵɵproperty("size", 18);
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("size", 18);
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("size", 18);
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("size", 18);
            i0.ɵɵadvance(4);
            i0.ɵɵproperty("size", 24);
            i0.ɵɵadvance(12);
            i0.ɵɵconditional(ctx.auth.isAuthenticated ? 164 : 165);
        } }, dependencies: [RouterLink,
            LucideArrowRight,
            LucideBadgeCheck,
            LucideBuilding2,
            LucideCamera,
            LucideCheck,
            LucideClock3,
            LucideFileText,
            LucideHouse,
            LucideIdCard,
            LucideShieldCheck,
            LucideUserRoundCheck], styles: ["[_nghost-%COMP%] { display: block; }\r\n.owner-page[_ngcontent-%COMP%] { background: linear-gradient(180deg, #f5f8fc 0, #fff 440px, #f6f8fb 100%); color: var(--%NS%color-text); }\r\n.owner-wrap[_ngcontent-%COMP%] { width: min(100% - 2rem, 1160px); margin-inline: auto; }\r\n\r\n.owner-hero[_ngcontent-%COMP%] {\r\n  overflow: hidden;\r\n  border-bottom: 1px solid #dfe6ef;\r\n  background:\r\n    radial-gradient(circle at 88% 15%, color-mix(in srgb, var(--%NS%color-secondary) 12%, transparent), transparent 32%),\r\n    radial-gradient(circle at 6% 90%, color-mix(in srgb, var(--%NS%color-primary) 8%, transparent), transparent 30%);\r\n}\r\n.owner-hero__grid[_ngcontent-%COMP%] { min-height: 430px; display: grid; grid-template-columns: 1.25fr .75fr; align-items: center; gap: 3rem; padding-block: 3.5rem; }\r\n.owner-hero__content[_ngcontent-%COMP%] { max-width: 690px; }\r\n.eyebrow[_ngcontent-%COMP%] { display: inline-flex; align-items: center; gap: .45rem; color: var(--%NS%color-primary); font-size: .78rem; font-weight: 850; letter-spacing: .08em; text-transform: uppercase; }\r\n.owner-hero[_ngcontent-%COMP%]   h1[_ngcontent-%COMP%] { max-width: 720px; margin: .65rem 0 .9rem; color: #101f3d; font-size: clamp(2.1rem, 4.2vw, 3.5rem); line-height: 1.06; letter-spacing: -.05em; }\r\n.owner-hero__content[_ngcontent-%COMP%]    > p[_ngcontent-%COMP%] { max-width: 650px; margin: 0; color: var(--%NS%color-text-muted); font-size: 1rem; line-height: 1.65; }\r\n.owner-actions[_ngcontent-%COMP%] { display: flex; flex-wrap: wrap; gap: .75rem; margin-top: 1.8rem; }\r\n.owner-btn[_ngcontent-%COMP%] { display: inline-flex; align-items: center; justify-content: center; gap: .5rem; min-height: 48px; padding: 0 1.25rem; border: 1px solid transparent; border-radius: 8px; font-weight: 800; text-decoration: none; transition: transform .18s ease, background .18s ease, border-color .18s ease; }\r\n.owner-btn[_ngcontent-%COMP%]:hover { transform: translateY(-2px); }\r\n.owner-btn--primary[_ngcontent-%COMP%] { background: var(--%NS%color-primary); color: #fff; box-shadow: 0 10px 24px color-mix(in srgb, var(--%NS%color-primary) 35%, transparent); }\r\n.owner-btn--%NS%primary[_ngcontent-%COMP%]:hover { background: var(--%NS%color-primary-dark); }\r\n.owner-btn--secondary[_ngcontent-%COMP%] { border-color: #cbd5e1; background: #fff; color: var(--%NS%color-secondary); }\r\n.owner-btn--%NS%secondary[_ngcontent-%COMP%]:hover { border-color: var(--%NS%color-secondary); background: var(--%NS%color-secondary-light); }\r\n.owner-hero__note[_ngcontent-%COMP%] { display: flex; align-items: center; gap: .45rem; margin-top: 1rem !important; color: var(--%NS%color-text-muted) !important; font-size: .82rem !important; }\r\n\r\n.summary-card[_ngcontent-%COMP%] { padding: 1.65rem; border: 1px solid #dfe5ed; border-radius: 14px; background: #fff; box-shadow: 0 12px 30px rgba(23, 57, 112, .1); }\r\n.summary-card__icon[_ngcontent-%COMP%] { display: grid; place-items: center; width: 56px; height: 56px; border-radius: 14px; background: var(--%NS%color-accent); color: #392300; }\r\n.summary-card__label[_ngcontent-%COMP%] { margin: 1.15rem 0 .3rem; color: var(--%NS%color-primary); font-size: .74rem; font-weight: 850; letter-spacing: .08em; text-transform: uppercase; }\r\n.summary-card[_ngcontent-%COMP%]    > strong[_ngcontent-%COMP%] { display: block; font-size: 1.35rem; }\r\n.summary-card[_ngcontent-%COMP%]   ul[_ngcontent-%COMP%] { display: grid; gap: .85rem; margin: 1.15rem 0 0; padding: 1.1rem 0 0; border-top: 1px solid var(--%NS%color-border); list-style: none; color: #475467; }\r\n.summary-card[_ngcontent-%COMP%]   li[_ngcontent-%COMP%] { display: flex; align-items: flex-start; gap: .55rem; font-size: .9rem; }\r\n.summary-card[_ngcontent-%COMP%]   li[_ngcontent-%COMP%]   svg[_ngcontent-%COMP%] { flex: 0 0 auto; color: var(--%NS%color-primary); }\r\n\r\n.owner-section[_ngcontent-%COMP%] { padding-block: 4.5rem; }\r\n.section-heading[_ngcontent-%COMP%] { max-width: 680px; margin-bottom: 2rem; }\r\n.section-heading[_ngcontent-%COMP%]    > span[_ngcontent-%COMP%], .final-cta[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] { color: var(--%NS%color-primary); font-size: .76rem; font-weight: 850; letter-spacing: .08em; text-transform: uppercase; }\r\n.section-heading[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%], .benefit-panel[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%], .final-cta[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] { margin: .4rem 0 .65rem; font-size: clamp(1.8rem, 3vw, 2.65rem); letter-spacing: -.035em; }\r\n.section-heading[_ngcontent-%COMP%]   p[_ngcontent-%COMP%], .benefit-panel[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { margin: 0; color: var(--%NS%color-text-muted); line-height: 1.65; }\r\n.requirement-grid[_ngcontent-%COMP%] { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }\r\n.requirement-card[_ngcontent-%COMP%] { padding: 1.45rem; border: 1px solid #dfe5ed; border-radius: 14px; background: #fff; box-shadow: var(--%NS%shadow-card); }\r\n.requirement-card__icon[_ngcontent-%COMP%] { display: grid; place-items: center; width: 48px; height: 48px; margin-bottom: 1rem; border-radius: 12px; }\r\n.requirement-card__icon--blue[_ngcontent-%COMP%] { background: var(--%NS%color-secondary-light); color: var(--%NS%color-secondary); }\r\n.requirement-card__icon--red[_ngcontent-%COMP%] { background: var(--%NS%color-primary-light); color: var(--%NS%color-primary); }\r\n.requirement-card__icon--yellow[_ngcontent-%COMP%] { background: #fff3d9; color: #9a5700; }\r\n.requirement-card[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] { margin: 0 0 .55rem; font-size: 1rem; }\r\n.requirement-card[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { margin: 0; color: var(--%NS%color-text-muted); font-size: .88rem; line-height: 1.58; }\r\n.file-note[_ngcontent-%COMP%] { display: flex; align-items: flex-start; gap: .8rem; margin-top: 1rem; padding: 1rem 1.2rem; border: 1px solid #d7e2f6; border-radius: 10px; background: #f0f5ff; color: #334155; }\r\n.file-note[_ngcontent-%COMP%]   svg[_ngcontent-%COMP%] { flex: 0 0 auto; color: var(--%NS%color-secondary); }\r\n.file-note[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { margin: 0; font-size: .87rem; line-height: 1.5; }\r\n\r\n.process-section[_ngcontent-%COMP%] { padding-block: 4.5rem; border-block: 1px solid #dbe4f1; background: #edf3fb; color: var(--%NS%color-text); }\r\n.section-heading--light[_ngcontent-%COMP%]    > span[_ngcontent-%COMP%] { color: var(--%NS%color-primary); }\r\n.section-heading--light[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] { margin-bottom: 0; }\r\n.process-list[_ngcontent-%COMP%] { display: grid; grid-template-columns: repeat(5, 1fr); gap: 1rem; margin: 2rem 0 0; padding: 0; list-style: none; }\r\n.process-list[_ngcontent-%COMP%]   li[_ngcontent-%COMP%] { position: relative; padding: 1.25rem; border: 1px solid #d7e1ef; border-radius: 12px; background: #fff; box-shadow: var(--%NS%shadow-card); }\r\n.process-list[_ngcontent-%COMP%]   li[_ngcontent-%COMP%]    > span[_ngcontent-%COMP%] { display: grid; place-items: center; width: 36px; height: 36px; margin-bottom: 1rem; border-radius: 50%; background: var(--%NS%color-secondary); color: #fff; font-weight: 900; }\r\n.process-list[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] { font-size: .95rem; }\r\n.process-list[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { margin: .4rem 0 0; color: var(--%NS%color-text-muted); font-size: .82rem; line-height: 1.5; }\r\n\r\n.benefit-panel[_ngcontent-%COMP%] { display: grid; grid-template-columns: .9fr 1.1fr; gap: 3rem; padding: 2rem; border: 1px solid #dfe5ed; border-radius: 16px; background: #fff; }\r\n.eyebrow--plain[_ngcontent-%COMP%] { color: var(--%NS%color-primary); }\r\n.benefit-panel[_ngcontent-%COMP%]   ul[_ngcontent-%COMP%] { display: grid; gap: .85rem; margin: 0; padding: 0; list-style: none; }\r\n.benefit-panel[_ngcontent-%COMP%]   li[_ngcontent-%COMP%] { display: flex; align-items: flex-start; gap: .6rem; padding-bottom: .85rem; border-bottom: 1px solid var(--%NS%color-border); font-size: .9rem; font-weight: 650; }\r\n.benefit-panel[_ngcontent-%COMP%]   li[_ngcontent-%COMP%]:last-child { padding-bottom: 0; border-bottom: 0; }\r\n.benefit-panel[_ngcontent-%COMP%]   li[_ngcontent-%COMP%]   svg[_ngcontent-%COMP%] { flex: 0 0 auto; color: var(--%NS%color-primary); }\r\n.review-notice[_ngcontent-%COMP%] { display: flex; align-items: flex-start; gap: 1rem; margin-top: 1rem; padding: 1.35rem; border: 1px solid #f1d18f; border-radius: 12px; background: #fff8e9; }\r\n.review-notice[_ngcontent-%COMP%]    > span[_ngcontent-%COMP%] { display: grid; place-items: center; width: 46px; height: 46px; flex: 0 0 auto; border-radius: 10px; background: var(--%NS%color-accent); color: #3d2500; }\r\n.review-notice[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] { margin: 0 0 .35rem; font-size: 1rem; }\r\n.review-notice[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { margin: 0; color: #6b5a3c; font-size: .88rem; line-height: 1.55; }\r\n.final-cta[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: space-between;\r\n  gap: 2rem;\r\n  margin-top: 2.25rem;\r\n  padding: 2rem 0 0;\r\n  border-top: 1px solid var(--%NS%color-border);\r\n  color: var(--%NS%color-text);\r\n}\r\n.final-cta[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] { margin-bottom: 0; font-size: clamp(1.5rem, 3vw, 2.15rem); }\r\n\r\n@media (max-width: 920px) {\r\n  .owner-hero__grid[_ngcontent-%COMP%] { grid-template-columns: 1fr; gap: 2.5rem; }\r\n  .summary-card[_ngcontent-%COMP%] { max-width: 620px; }\r\n  .requirement-grid[_ngcontent-%COMP%] { grid-template-columns: repeat(2, 1fr); }\r\n  .process-list[_ngcontent-%COMP%] { grid-template-columns: repeat(2, 1fr); }\r\n  .process-list[_ngcontent-%COMP%]   li[_ngcontent-%COMP%]:last-child { grid-column: 1 / -1; }\r\n}\r\n\r\n@media (max-width: 620px) {\r\n  .owner-hero__grid[_ngcontent-%COMP%] { min-height: auto; padding-block: 3.5rem; }\r\n  .owner-hero[_ngcontent-%COMP%]   h1[_ngcontent-%COMP%] { font-size: clamp(2.1rem, 12vw, 3.2rem); }\r\n  .owner-actions[_ngcontent-%COMP%], .owner-actions[_ngcontent-%COMP%]   .owner-btn[_ngcontent-%COMP%] { width: 100%; }\r\n  .owner-section[_ngcontent-%COMP%], .process-section[_ngcontent-%COMP%] { padding-block: 3.25rem; }\r\n  .requirement-grid[_ngcontent-%COMP%], .process-list[_ngcontent-%COMP%], .benefit-panel[_ngcontent-%COMP%] { grid-template-columns: 1fr; }\r\n  .process-list[_ngcontent-%COMP%]   li[_ngcontent-%COMP%]:last-child { grid-column: auto; }\r\n  .benefit-panel[_ngcontent-%COMP%] { gap: 1.5rem; padding: 1.4rem; }\r\n  .final-cta[_ngcontent-%COMP%] { align-items: stretch; flex-direction: column; padding-top: 1.5rem; }\r\n  .final-cta[_ngcontent-%COMP%]   .owner-btn[_ngcontent-%COMP%] { width: 100%; }\r\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(SerAnuncianteComponent, [{
        type: Component,
        args: [{ selector: 'app-ser-anunciante', standalone: true, imports: [
                    RouterLink,
                    LucideArrowRight,
                    LucideBadgeCheck,
                    LucideBuilding2,
                    LucideCamera,
                    LucideCheck,
                    LucideClock3,
                    LucideFileText,
                    LucideHouse,
                    LucideIdCard,
                    LucideShieldCheck,
                    LucideUserRoundCheck,
                ], template: "<main class=\"owner-page\">\r\n  <section class=\"owner-hero\">\r\n    <div class=\"owner-wrap owner-hero__grid\">\r\n      <div class=\"owner-hero__content\">\r\n        <span class=\"eyebrow\"><svg lucideHouse [size]=\"16\"></svg> Public\u00E1 en DEPA</span>\r\n        <h1>Todo lo que necesit\u00E1s para convertirte en anunciante</h1>\r\n        <p>\r\n          Si sos propietario particular o represent\u00E1s una inmobiliaria, pod\u00E9s publicar y administrar\r\n          propiedades desde un solo lugar. Para cuidar a la comunidad, verificamos tu identidad antes\r\n          de habilitar la primera publicaci\u00F3n.\r\n        </p>\r\n        <div class=\"owner-actions\">\r\n          @if (auth.isAuthenticated) {\r\n            <a routerLink=\"/mi-perfil/anunciante\" class=\"owner-btn owner-btn--primary\">\r\n              Comenzar verificaci\u00F3n <svg lucideArrowRight [size]=\"18\"></svg>\r\n            </a>\r\n          } @else {\r\n            <a routerLink=\"/registro\" class=\"owner-btn owner-btn--primary\">\r\n              Crear mi cuenta <svg lucideArrowRight [size]=\"18\"></svg>\r\n            </a>\r\n            <a routerLink=\"/login\" [queryParams]=\"{ returnUrl: '/mi-perfil/anunciante' }\" class=\"owner-btn owner-btn--secondary\">\r\n              Ya tengo cuenta\r\n            </a>\r\n          }\r\n        </div>\r\n        <p class=\"owner-hero__note\"><svg lucideShieldCheck [size]=\"17\"></svg> Tu documentaci\u00F3n solo se utiliza para revisar tu identidad.</p>\r\n      </div>\r\n\r\n      <aside class=\"summary-card\" aria-label=\"Resumen del proceso\">\r\n        <span class=\"summary-card__icon\"><svg lucideBadgeCheck [size]=\"30\"></svg></span>\r\n        <p class=\"summary-card__label\">Proceso de verificaci\u00F3n</p>\r\n        <strong>Prepar\u00E1 tus datos y documentos</strong>\r\n        <ul>\r\n          <li><svg lucideCheck [size]=\"16\"></svg> CUIT o CUIL y tel\u00E9fono de contacto</li>\r\n          <li><svg lucideCheck [size]=\"16\"></svg> DNI de frente y dorso</li>\r\n          <li><svg lucideCheck [size]=\"16\"></svg> Foto o video de tu rostro</li>\r\n          <li><svg lucideCheck [size]=\"16\"></svg> Revisi\u00F3n manual del equipo</li>\r\n        </ul>\r\n      </aside>\r\n    </div>\r\n  </section>\r\n\r\n  <section class=\"owner-section owner-wrap\" aria-labelledby=\"requisitos-title\">\r\n    <div class=\"section-heading\">\r\n      <span>Antes de empezar</span>\r\n      <h2 id=\"requisitos-title\">\u00BFQu\u00E9 necesit\u00E1s?</h2>\r\n      <p>Ten\u00E9 a mano estos datos para completar la solicitud sin interrupciones.</p>\r\n    </div>\r\n\r\n    <div class=\"requirement-grid\">\r\n      <article class=\"requirement-card\">\r\n        <span class=\"requirement-card__icon requirement-card__icon--blue\"><svg lucideUserRoundCheck [size]=\"25\"></svg></span>\r\n        <h3>Una cuenta verificada</h3>\r\n        <p>Nombre, apellido, email \u00FAnico, tel\u00E9fono y una contrase\u00F1a segura. Primero deber\u00E1s confirmar tu correo.</p>\r\n      </article>\r\n      <article class=\"requirement-card\">\r\n        <span class=\"requirement-card__icon requirement-card__icon--red\"><svg lucideBuilding2 [size]=\"25\"></svg></span>\r\n        <h3>Datos del anunciante</h3>\r\n        <p>Eleg\u00ED si sos propietario o inmobiliaria e ingres\u00E1 tu CUIT/CUIL y un n\u00FAmero de contacto.</p>\r\n      </article>\r\n      <article class=\"requirement-card\">\r\n        <span class=\"requirement-card__icon requirement-card__icon--yellow\"><svg lucideIdCard [size]=\"25\"></svg></span>\r\n        <h3>Documento de identidad</h3>\r\n        <p>Dos im\u00E1genes n\u00EDtidas de tu DNI: una del frente y otra del dorso, en formato JPG, PNG o WEBP.</p>\r\n      </article>\r\n      <article class=\"requirement-card\">\r\n        <span class=\"requirement-card__icon requirement-card__icon--blue\"><svg lucideCamera [size]=\"25\"></svg></span>\r\n        <h3>Prueba facial</h3>\r\n        <p>Una foto de tu rostro o un video breve para validar que la documentaci\u00F3n te pertenece.</p>\r\n      </article>\r\n    </div>\r\n\r\n    <div class=\"file-note\">\r\n      <svg lucideFileText [size]=\"22\"></svg>\r\n      <p><strong>Formatos admitidos:</strong> im\u00E1genes de hasta 5 MB; para la prueba facial tambi\u00E9n pod\u00E9s subir video MP4, WEBM o MOV de hasta 20 MB.</p>\r\n    </div>\r\n  </section>\r\n\r\n  <section class=\"process-section\">\r\n    <div class=\"owner-wrap\">\r\n      <div class=\"section-heading section-heading--light\">\r\n        <span>Simple y transparente</span>\r\n        <h2>C\u00F3mo funciona el registro</h2>\r\n      </div>\r\n\r\n      <ol class=\"process-list\">\r\n        <li><span>1</span><div><strong>Cre\u00E1 tu cuenta</strong><p>Complet\u00E1 tus datos personales y verific\u00E1 tu email.</p></div></li>\r\n        <li><span>2</span><div><strong>Eleg\u00ED tu perfil</strong><p>Indic\u00E1 si sos propietario particular o inmobiliaria.</p></div></li>\r\n        <li><span>3</span><div><strong>Sub\u00ED la documentaci\u00F3n</strong><p>Carg\u00E1 CUIT/CUIL, contacto, DNI y prueba facial.</p></div></li>\r\n        <li><span>4</span><div><strong>Esper\u00E1 la revisi\u00F3n</strong><p>Un administrador revisar\u00E1 la informaci\u00F3n y te notificaremos por email.</p></div></li>\r\n        <li><span>5</span><div><strong>Empez\u00E1 a publicar</strong><p>Una vez aprobado, podr\u00E1s crear y administrar tus propiedades.</p></div></li>\r\n      </ol>\r\n    </div>\r\n  </section>\r\n\r\n  <section class=\"owner-section owner-wrap\">\r\n    <div class=\"benefit-panel\">\r\n      <div>\r\n        <span class=\"eyebrow eyebrow--plain\">Tu espacio como anunciante</span>\r\n        <h2>Gestion\u00E1 tus alquileres desde DEPA</h2>\r\n        <p>Public\u00E1 propiedades de largo plazo o temporarias y manten\u00E9 toda la informaci\u00F3n organizada.</p>\r\n      </div>\r\n      <ul>\r\n        <li><svg lucideCheck [size]=\"18\"></svg> Crear, editar, activar o desactivar publicaciones</li>\r\n        <li><svg lucideCheck [size]=\"18\"></svg> Administrar im\u00E1genes y datos de cada propiedad</li>\r\n        <li><svg lucideCheck [size]=\"18\"></svg> Gestionar disponibilidad y reservas temporarias</li>\r\n        <li><svg lucideCheck [size]=\"18\"></svg> Recibir consultas mediante el chat de la plataforma</li>\r\n      </ul>\r\n    </div>\r\n\r\n    <div class=\"review-notice\">\r\n      <span><svg lucideClock3 [size]=\"24\"></svg></span>\r\n      <div>\r\n        <h3>La aprobaci\u00F3n es necesaria antes de publicar</h3>\r\n        <p>Pod\u00E9s registrarte y enviar la solicitud, pero la funci\u00F3n de publicar se habilita despu\u00E9s de la revisi\u00F3n manual. Si la documentaci\u00F3n es rechazada, vas a recibir el motivo y podr\u00E1s volver a cargarla.</p>\r\n      </div>\r\n    </div>\r\n\r\n    <div class=\"final-cta\">\r\n      <div><span>\u00BFTen\u00E9s todo listo?</span><h2>Empez\u00E1 a publicar con DEPA</h2></div>\r\n      @if (auth.isAuthenticated) {\r\n        <a routerLink=\"/mi-perfil/anunciante\" class=\"owner-btn owner-btn--primary\">Iniciar solicitud <svg lucideArrowRight [size]=\"18\"></svg></a>\r\n      } @else {\r\n        <a routerLink=\"/registro\" class=\"owner-btn owner-btn--primary\">Crear mi cuenta <svg lucideArrowRight [size]=\"18\"></svg></a>\r\n      }\r\n    </div>\r\n  </section>\r\n</main>\r\n", styles: [":host { display: block; }\r\n.owner-page { background: linear-gradient(180deg, #f5f8fc 0, #fff 440px, #f6f8fb 100%); color: var(--color-text); }\r\n.owner-wrap { width: min(100% - 2rem, 1160px); margin-inline: auto; }\r\n\r\n.owner-hero {\r\n  overflow: hidden;\r\n  border-bottom: 1px solid #dfe6ef;\r\n  background:\r\n    radial-gradient(circle at 88% 15%, color-mix(in srgb, var(--color-secondary) 12%, transparent), transparent 32%),\r\n    radial-gradient(circle at 6% 90%, color-mix(in srgb, var(--color-primary) 8%, transparent), transparent 30%);\r\n}\r\n.owner-hero__grid { min-height: 430px; display: grid; grid-template-columns: 1.25fr .75fr; align-items: center; gap: 3rem; padding-block: 3.5rem; }\r\n.owner-hero__content { max-width: 690px; }\r\n.eyebrow { display: inline-flex; align-items: center; gap: .45rem; color: var(--color-primary); font-size: .78rem; font-weight: 850; letter-spacing: .08em; text-transform: uppercase; }\r\n.owner-hero h1 { max-width: 720px; margin: .65rem 0 .9rem; color: #101f3d; font-size: clamp(2.1rem, 4.2vw, 3.5rem); line-height: 1.06; letter-spacing: -.05em; }\r\n.owner-hero__content > p { max-width: 650px; margin: 0; color: var(--color-text-muted); font-size: 1rem; line-height: 1.65; }\r\n.owner-actions { display: flex; flex-wrap: wrap; gap: .75rem; margin-top: 1.8rem; }\r\n.owner-btn { display: inline-flex; align-items: center; justify-content: center; gap: .5rem; min-height: 48px; padding: 0 1.25rem; border: 1px solid transparent; border-radius: 8px; font-weight: 800; text-decoration: none; transition: transform .18s ease, background .18s ease, border-color .18s ease; }\r\n.owner-btn:hover { transform: translateY(-2px); }\r\n.owner-btn--primary { background: var(--color-primary); color: #fff; box-shadow: 0 10px 24px color-mix(in srgb, var(--color-primary) 35%, transparent); }\r\n.owner-btn--primary:hover { background: var(--color-primary-dark); }\r\n.owner-btn--secondary { border-color: #cbd5e1; background: #fff; color: var(--color-secondary); }\r\n.owner-btn--secondary:hover { border-color: var(--color-secondary); background: var(--color-secondary-light); }\r\n.owner-hero__note { display: flex; align-items: center; gap: .45rem; margin-top: 1rem !important; color: var(--color-text-muted) !important; font-size: .82rem !important; }\r\n\r\n.summary-card { padding: 1.65rem; border: 1px solid #dfe5ed; border-radius: 14px; background: #fff; box-shadow: 0 12px 30px rgba(23, 57, 112, .1); }\r\n.summary-card__icon { display: grid; place-items: center; width: 56px; height: 56px; border-radius: 14px; background: var(--color-accent); color: #392300; }\r\n.summary-card__label { margin: 1.15rem 0 .3rem; color: var(--color-primary); font-size: .74rem; font-weight: 850; letter-spacing: .08em; text-transform: uppercase; }\r\n.summary-card > strong { display: block; font-size: 1.35rem; }\r\n.summary-card ul { display: grid; gap: .85rem; margin: 1.15rem 0 0; padding: 1.1rem 0 0; border-top: 1px solid var(--color-border); list-style: none; color: #475467; }\r\n.summary-card li { display: flex; align-items: flex-start; gap: .55rem; font-size: .9rem; }\r\n.summary-card li svg { flex: 0 0 auto; color: var(--color-primary); }\r\n\r\n.owner-section { padding-block: 4.5rem; }\r\n.section-heading { max-width: 680px; margin-bottom: 2rem; }\r\n.section-heading > span, .final-cta span { color: var(--color-primary); font-size: .76rem; font-weight: 850; letter-spacing: .08em; text-transform: uppercase; }\r\n.section-heading h2, .benefit-panel h2, .final-cta h2 { margin: .4rem 0 .65rem; font-size: clamp(1.8rem, 3vw, 2.65rem); letter-spacing: -.035em; }\r\n.section-heading p, .benefit-panel p { margin: 0; color: var(--color-text-muted); line-height: 1.65; }\r\n.requirement-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }\r\n.requirement-card { padding: 1.45rem; border: 1px solid #dfe5ed; border-radius: 14px; background: #fff; box-shadow: var(--shadow-card); }\r\n.requirement-card__icon { display: grid; place-items: center; width: 48px; height: 48px; margin-bottom: 1rem; border-radius: 12px; }\r\n.requirement-card__icon--blue { background: var(--color-secondary-light); color: var(--color-secondary); }\r\n.requirement-card__icon--red { background: var(--color-primary-light); color: var(--color-primary); }\r\n.requirement-card__icon--yellow { background: #fff3d9; color: #9a5700; }\r\n.requirement-card h3 { margin: 0 0 .55rem; font-size: 1rem; }\r\n.requirement-card p { margin: 0; color: var(--color-text-muted); font-size: .88rem; line-height: 1.58; }\r\n.file-note { display: flex; align-items: flex-start; gap: .8rem; margin-top: 1rem; padding: 1rem 1.2rem; border: 1px solid #d7e2f6; border-radius: 10px; background: #f0f5ff; color: #334155; }\r\n.file-note svg { flex: 0 0 auto; color: var(--color-secondary); }\r\n.file-note p { margin: 0; font-size: .87rem; line-height: 1.5; }\r\n\r\n.process-section { padding-block: 4.5rem; border-block: 1px solid #dbe4f1; background: #edf3fb; color: var(--color-text); }\r\n.section-heading--light > span { color: var(--color-primary); }\r\n.section-heading--light h2 { margin-bottom: 0; }\r\n.process-list { display: grid; grid-template-columns: repeat(5, 1fr); gap: 1rem; margin: 2rem 0 0; padding: 0; list-style: none; }\r\n.process-list li { position: relative; padding: 1.25rem; border: 1px solid #d7e1ef; border-radius: 12px; background: #fff; box-shadow: var(--shadow-card); }\r\n.process-list li > span { display: grid; place-items: center; width: 36px; height: 36px; margin-bottom: 1rem; border-radius: 50%; background: var(--color-secondary); color: #fff; font-weight: 900; }\r\n.process-list strong { font-size: .95rem; }\r\n.process-list p { margin: .4rem 0 0; color: var(--color-text-muted); font-size: .82rem; line-height: 1.5; }\r\n\r\n.benefit-panel { display: grid; grid-template-columns: .9fr 1.1fr; gap: 3rem; padding: 2rem; border: 1px solid #dfe5ed; border-radius: 16px; background: #fff; }\r\n.eyebrow--plain { color: var(--color-primary); }\r\n.benefit-panel ul { display: grid; gap: .85rem; margin: 0; padding: 0; list-style: none; }\r\n.benefit-panel li { display: flex; align-items: flex-start; gap: .6rem; padding-bottom: .85rem; border-bottom: 1px solid var(--color-border); font-size: .9rem; font-weight: 650; }\r\n.benefit-panel li:last-child { padding-bottom: 0; border-bottom: 0; }\r\n.benefit-panel li svg { flex: 0 0 auto; color: var(--color-primary); }\r\n.review-notice { display: flex; align-items: flex-start; gap: 1rem; margin-top: 1rem; padding: 1.35rem; border: 1px solid #f1d18f; border-radius: 12px; background: #fff8e9; }\r\n.review-notice > span { display: grid; place-items: center; width: 46px; height: 46px; flex: 0 0 auto; border-radius: 10px; background: var(--color-accent); color: #3d2500; }\r\n.review-notice h3 { margin: 0 0 .35rem; font-size: 1rem; }\r\n.review-notice p { margin: 0; color: #6b5a3c; font-size: .88rem; line-height: 1.55; }\r\n.final-cta {\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: space-between;\r\n  gap: 2rem;\r\n  margin-top: 2.25rem;\r\n  padding: 2rem 0 0;\r\n  border-top: 1px solid var(--color-border);\r\n  color: var(--color-text);\r\n}\r\n.final-cta h2 { margin-bottom: 0; font-size: clamp(1.5rem, 3vw, 2.15rem); }\r\n\r\n@media (max-width: 920px) {\r\n  .owner-hero__grid { grid-template-columns: 1fr; gap: 2.5rem; }\r\n  .summary-card { max-width: 620px; }\r\n  .requirement-grid { grid-template-columns: repeat(2, 1fr); }\r\n  .process-list { grid-template-columns: repeat(2, 1fr); }\r\n  .process-list li:last-child { grid-column: 1 / -1; }\r\n}\r\n\r\n@media (max-width: 620px) {\r\n  .owner-hero__grid { min-height: auto; padding-block: 3.5rem; }\r\n  .owner-hero h1 { font-size: clamp(2.1rem, 12vw, 3.2rem); }\r\n  .owner-actions, .owner-actions .owner-btn { width: 100%; }\r\n  .owner-section, .process-section { padding-block: 3.25rem; }\r\n  .requirement-grid, .process-list, .benefit-panel { grid-template-columns: 1fr; }\r\n  .process-list li:last-child { grid-column: auto; }\r\n  .benefit-panel { gap: 1.5rem; padding: 1.4rem; }\r\n  .final-cta { align-items: stretch; flex-direction: column; padding-top: 1.5rem; }\r\n  .final-cta .owner-btn { width: 100%; }\r\n}\r\n"] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(SerAnuncianteComponent, { className: "SerAnuncianteComponent", filePath: "src/app/features/ser-anunciante/ser-anunciante.component.ts", lineNumber: 38 }); })();
