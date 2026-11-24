import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { catchError, map, of, startWith, switchMap } from 'rxjs';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { VolverDirective } from '../../shared/directives/volver.directive';
import { AdminService } from './admin.service';
import * as i0 from "@angular/core";
function AdminUserProfileComponent_Conditional_4_Conditional_0_Conditional_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 12);
    i0.ɵɵtext(1, "Dada de baja");
    i0.ɵɵelementEnd();
} }
function AdminUserProfileComponent_Conditional_4_Conditional_0_Conditional_14_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 13);
    i0.ɵɵtext(1, "Cuenta bloqueada");
    i0.ɵɵelementEnd();
} }
function AdminUserProfileComponent_Conditional_4_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "h1", 4);
    i0.ɵɵtext(1, "Perfil de usuario");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "article", 5)(3, "header", 6);
    i0.ɵɵelement(4, "app-avatar", 7);
    i0.ɵɵelementStart(5, "div", 8)(6, "p", 9);
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "h2");
    i0.ɵɵtext(9);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "div", 10)(11, "span", 11);
    i0.ɵɵtext(12);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(13, AdminUserProfileComponent_Conditional_4_Conditional_0_Conditional_13_Template, 2, 0, "span", 12)(14, AdminUserProfileComponent_Conditional_4_Conditional_0_Conditional_14_Template, 2, 0, "span", 13);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(15, "section", 14)(16, "div", 15)(17, "h2", 16);
    i0.ɵɵtext(18, "Datos personales");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(19, "dl", 17)(20, "div")(21, "dt");
    i0.ɵɵtext(22, "Nombre");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(23, "dd");
    i0.ɵɵtext(24);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(25, "div")(26, "dt");
    i0.ɵɵtext(27, "Apellido");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(28, "dd");
    i0.ɵɵtext(29);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(30, "div")(31, "dt");
    i0.ɵɵtext(32, "Correo");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(33, "dd");
    i0.ɵɵtext(34);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(35, "div")(36, "dt");
    i0.ɵɵtext(37, "Tel\u00E9fono");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(38, "dd");
    i0.ɵɵtext(39);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(40, "div")(41, "dt");
    i0.ɵɵtext(42, "Estado de la cuenta");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(43, "dd");
    i0.ɵɵtext(44);
    i0.ɵɵelementEnd()()()()();
} if (rf & 2) {
    const perfil_r1 = ctx;
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("foto", perfil_r1.foto_url)("nombre", perfil_r1.nombre + " " + perfil_r1.apellido)("usarDosIniciales", true);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1("Usuario #", perfil_r1.id);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate2("", perfil_r1.nombre, " ", perfil_r1.apellido);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(perfil_r1.rol?.nombre || "Sin rol");
    i0.ɵɵadvance();
    i0.ɵɵconditional(!perfil_r1.activa ? 13 : perfil_r1.bloqueado ? 14 : -1);
    i0.ɵɵadvance(11);
    i0.ɵɵtextInterpolate(perfil_r1.nombre);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(perfil_r1.apellido);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(perfil_r1.email || "Sin correo registrado");
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(perfil_r1.telefono || "Sin tel\u00E9fono registrado");
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(!perfil_r1.activa ? "Dada de baja" : perfil_r1.bloqueado ? "Bloqueada" : "Activa");
} }
function AdminUserProfileComponent_Conditional_4_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 3)(1, "p", 18);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const vista_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(vista_r2.mensaje);
} }
function AdminUserProfileComponent_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, AdminUserProfileComponent_Conditional_4_Conditional_0_Template, 45, 13)(1, AdminUserProfileComponent_Conditional_4_Conditional_1_Template, 3, 1, "div", 3);
} if (rf & 2) {
    let tmp_2_0;
    i0.ɵɵconditional((tmp_2_0 = ctx.perfil) ? 0 : 1, tmp_2_0);
} }
export class AdminUserProfileComponent {
    api = inject(AdminService);
    estado = toSignal(inject(ActivatedRoute).paramMap.pipe(switchMap((params) => {
        const id = Number(params.get('id'));
        if (!Number.isSafeInteger(id) || id < 1) {
            return of({ perfil: null, mensaje: 'El perfil solicitado no es válido.' });
        }
        return this.api.obtenerPerfilUsuario(id).pipe(map((perfil) => ({ perfil, mensaje: '' })), startWith({ perfil: null, mensaje: 'Cargando perfil…' }), catchError(() => of({ perfil: null, mensaje: 'No pudimos cargar el perfil.' })));
    })));
    static ɵfac = function AdminUserProfileComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || AdminUserProfileComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: AdminUserProfileComponent, selectors: [["app-admin-user-profile"]], decls: 5, vars: 1, consts: [[1, "acct-page"], [1, "acct-wrap", "acct-wrap--narrow"], ["appVolver", "/admin", "fragmentoVolver", "reclamos", 1, "volver"], [1, "acct-state"], [1, "profile-title"], [1, "acct-card", "profile-card"], [1, "profile-hero"], [1, "profile-hero__avatar", 3, "foto", "nombre", "usarDosIniciales"], [1, "profile-hero__info"], [1, "profile-hero__id"], [1, "profile-hero__badges"], [1, "acct-badge", "acct-badge--info"], [1, "acct-badge", "acct-badge--warn"], [1, "acct-badge", "acct-badge--error"], ["aria-labelledby", "datos-usuario", 1, "profile-section"], [1, "card-head"], ["id", "datos-usuario"], [1, "data-list"], ["role", "status"]], template: function AdminUserProfileComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "main", 0)(1, "div", 1)(2, "a", 2);
            i0.ɵɵtext(3, "\u2190 Volver");
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(4, AdminUserProfileComponent_Conditional_4_Template, 2, 1);
            i0.ɵɵelementEnd()();
        } if (rf & 2) {
            let tmp_0_0;
            i0.ɵɵadvance(4);
            i0.ɵɵconditional((tmp_0_0 = ctx.estado()) ? 4 : -1, tmp_0_0);
        } }, dependencies: [AvatarComponent, VolverDirective], styles: ["@use '../mi-perfil/perfil-base';\r\n\r\n.volver[_ngcontent-%COMP%] { align-self: flex-start; color: var(--%NS%color-text-muted); font-weight: 650; text-decoration: none; }\r\n.volver[_ngcontent-%COMP%]:hover, .volver[_ngcontent-%COMP%]:focus-visible { color: var(--%NS%color-primary); }\r\n.profile-hero__id[_ngcontent-%COMP%] { margin: 0 0 0.2rem; color: var(--%NS%color-text-muted); font-size: 0.85rem; font-weight: 650; }\r\n.profile-section[_ngcontent-%COMP%] { padding: 1.4rem 0.2rem 0.4rem; }"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(AdminUserProfileComponent, [{
        type: Component,
        args: [{ selector: 'app-admin-user-profile', imports: [AvatarComponent, VolverDirective], template: `
    <main class="acct-page">
      <div class="acct-wrap acct-wrap--narrow">
        <a class="volver" appVolver="/admin" fragmentoVolver="reclamos">← Volver</a>
        @if (estado(); as vista) {
          @if (vista.perfil; as perfil) {
            <h1 class="profile-title">Perfil de usuario</h1>
            <article class="acct-card profile-card">
              <header class="profile-hero">
                <app-avatar class="profile-hero__avatar" [foto]="perfil.foto_url" [nombre]="perfil.nombre + ' ' + perfil.apellido" [usarDosIniciales]="true" />
                <div class="profile-hero__info">
                  <p class="profile-hero__id">Usuario #{{ perfil.id }}</p>
                  <h2>{{ perfil.nombre }} {{ perfil.apellido }}</h2>
                  <div class="profile-hero__badges">
                    <span class="acct-badge acct-badge--info">{{ perfil.rol?.nombre || 'Sin rol' }}</span>
                    @if (!perfil.activa) {
                      <span class="acct-badge acct-badge--warn">Dada de baja</span>
                    } @else if (perfil.bloqueado) {
                      <span class="acct-badge acct-badge--error">Cuenta bloqueada</span>
                    }
                  </div>
                </div>
              </header>
              <section class="profile-section" aria-labelledby="datos-usuario">
                <div class="card-head"><h2 id="datos-usuario">Datos personales</h2></div>
                <dl class="data-list">
                  <div><dt>Nombre</dt><dd>{{ perfil.nombre }}</dd></div>
                  <div><dt>Apellido</dt><dd>{{ perfil.apellido }}</dd></div>
                  <div><dt>Correo</dt><dd>{{ perfil.email || 'Sin correo registrado' }}</dd></div>
                  <div><dt>Teléfono</dt><dd>{{ perfil.telefono || 'Sin teléfono registrado' }}</dd></div>
                  <div><dt>Estado de la cuenta</dt><dd>{{ !perfil.activa ? 'Dada de baja' : perfil.bloqueado ? 'Bloqueada' : 'Activa' }}</dd></div>
                </dl>
              </section>
            </article>
          } @else {
            <div class="acct-state"><p role="status">{{ vista.mensaje }}</p></div>
          }
        }
      </div>
    </main>
  `, styles: ["@use '../mi-perfil/perfil-base';\r\n\r\n.volver { align-self: flex-start; color: var(--color-text-muted); font-weight: 650; text-decoration: none; }\r\n.volver:hover, .volver:focus-visible { color: var(--color-primary); }\r\n.profile-hero__id { margin: 0 0 0.2rem; color: var(--color-text-muted); font-size: 0.85rem; font-weight: 650; }\r\n.profile-section { padding: 1.4rem 0.2rem 0.4rem; }\r\n"] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(AdminUserProfileComponent, { className: "AdminUserProfileComponent", filePath: "src/app/features/admin/admin-user-profile.component.ts", lineNumber: 56 }); })();
