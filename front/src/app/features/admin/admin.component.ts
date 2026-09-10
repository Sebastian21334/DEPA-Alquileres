import { isPlatformBrowser } from '@angular/common';
import { Component, computed, inject, PLATFORM_ID, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import {
  LucideUsers,
  LucideShieldCheck,
  LucideRefreshCw,
  LucideSearch,
  LucideCheck,
  LucideX,
} from '@lucide/angular';
import {
  AdminCatalogItem,
  AdminCity,
  AdminProvince,
  AdminService,
  AdminUser,
  CatalogKey,
  VerificationRequest,
} from './admin.service';

interface CatalogSection {
  key: CatalogKey;
  label: string;
  items: AdminCatalogItem[];
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    FormsModule,
    LucideUsers,
    LucideShieldCheck,
    LucideRefreshCw,
    LucideSearch,
    LucideCheck,
    LucideX,
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
})
export class AdminComponent {
  private readonly api = inject(AdminService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  protected readonly users = signal<AdminUser[]>([]);
  protected readonly requests = signal<VerificationRequest[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly notice = signal<string | null>(null);
  protected readonly query = signal('');
  protected readonly busy = signal<string | null>(null);
  protected readonly rejectId = signal<number | null>(null);
  protected readonly catalogs = signal<CatalogSection[]>([
    { key: 'roles', label: 'Roles', items: [] },
    { key: 'tipos-anunciante', label: 'Tipos de anunciante', items: [] },
    { key: 'tipos-propiedad', label: 'Tipos de propiedad', items: [] },
    { key: 'modalidades', label: 'Modalidades', items: [] },
    { key: 'metodos-pago', label: 'Métodos de pago', items: [] },
    { key: 'tipos-moneda', label: 'Monedas', items: [] },
  ]);
  protected readonly provinces = signal<AdminProvince[]>([]);
  protected readonly cities = signal<AdminCity[]>([]);
  protected readonly selectedProvince = signal<number | null>(null);
  protected editing = '';
  protected draft = '';
  protected newValues: Record<string, string> = {};
  protected rejectReason = '';
  protected readonly filteredUsers = computed(() => {
    const q = this.query().trim().toLowerCase();
    return q
      ? this.users().filter((u) => `${u.nombre} ${u.apellido} ${u.email}`.toLowerCase().includes(q))
      : this.users();
  });

  constructor() {
    if (this.isBrowser) {
      this.reload();
      this.loadCatalogs();
      this.loadProvinces();
    }
  }
  protected reload(): void {
    this.loading.set(true);
    this.error.set(null);
    let pending = 2;
    const done = () => {
      if (--pending === 0) this.loading.set(false);
    };
    this.api.listarUsuarios().subscribe({
      next: (v) => {
        this.users.set(v);
        done();
      },
      error: (e: Error) => {
        this.error.set(e.message);
        done();
      },
    });
    this.api.listarPendientes().subscribe({
      next: (v) => {
        this.requests.set(v);
        done();
      },
      error: (e: Error) => {
        this.error.set(e.message);
        done();
      },
    });
  }
  protected toggleUser(user: AdminUser): void {
    this.run(
      `user-${user.id}`,
      () => this.api.cambiarBloqueo(user.id, !user.bloqueado),
      () =>
        this.users.update((v) =>
          v.map((u) => (u.id === user.id ? { ...u, bloqueado: !u.bloqueado } : u)),
        ),
      'Estado del usuario actualizado.',
    );
  }
  protected changeRole(user: AdminUser, role: string): void {
    if (role === user.rol?.nombre) return;
    this.run(
      `user-${user.id}`,
      () => this.api.cambiarRol(user.id, role),
      (updated) =>
        this.users.update((v) => v.map((u) => (u.id === user.id ? (updated as AdminUser) : u))),
      'Rol actualizado.',
    );
  }
  protected approve(request: VerificationRequest): void {
    const id = request.anunciante.idUsuario;
    this.run(
      `request-${id}`,
      () => this.api.aprobar(id),
      () => this.requests.update((v) => v.filter((r) => r.id !== request.id)),
      'Solicitud aprobada.',
    );
  }
  protected openReject(request: VerificationRequest): void {
    this.rejectReason = '';
    this.rejectId.set(request.id);
  }
  protected cancelReject(): void {
    this.rejectId.set(null);
    this.rejectReason = '';
  }
  protected confirmReject(request: VerificationRequest): void {
    const motivo = this.rejectReason.trim();
    if (!motivo) return;
    const id = request.anunciante.idUsuario;
    this.run(
      `request-${id}`,
      () => this.api.rechazar(id, motivo),
      () => {
        this.requests.update((v) => v.filter((r) => r.id !== request.id));
        this.cancelReject();
      },
      'Solicitud rechazada.',
    );
  }
  private run(
    key: string,
    request: () => any,
    success: (value: unknown) => void,
    message: string,
  ): void {
    this.busy.set(key);
    this.error.set(null);
    this.notice.set(null);
    request().subscribe({
      next: (v: unknown) => {
        success(v);
        this.notice.set(message);
        this.busy.set(null);
      },
      error: (e: Error) => {
        this.error.set(e.message);
        this.busy.set(null);
      },
    });
  }

  protected loadCatalogs(): void {
    const sections = this.catalogs();
    forkJoin(sections.map((s) => this.api.listarCatalogo(s.key))).subscribe({
      next: (values) => this.catalogs.set(sections.map((s, i) => ({ ...s, items: values[i] }))),
      error: (e: Error) => this.error.set(e.message),
    });
  }
  protected addCatalog(s: CatalogSection): void {
    const n = (this.newValues[s.key] || '').trim();
    if (!n) return;
    this.run(
      `catalog-${s.key}`,
      () => this.api.crearCatalogo(s.key, n),
      (v) => {
        this.setCatalog(s.key, [...s.items, v as AdminCatalogItem]);
        this.newValues[s.key] = '';
      },
      `${s.label}: elemento creado.`,
    );
  }
  protected edit(key: string, item: AdminCatalogItem): void {
    this.editing = `${key}-${item.id}`;
    this.draft = item.nombre;
  }
  protected cancelEdit(): void {
    this.editing = '';
    this.draft = '';
  }
  protected saveCatalog(s: CatalogSection, item: AdminCatalogItem): void {
    const n = this.draft.trim();
    if (!n) return;
    this.run(
      `catalog-${s.key}`,
      () => this.api.actualizarCatalogo(s.key, item.id, n),
      (v) => {
        this.setCatalog(
          s.key,
          s.items.map((x) => (x.id === item.id ? (v as AdminCatalogItem) : x)),
        );
        this.cancelEdit();
      },
      `${s.label}: elemento actualizado.`,
    );
  }
  protected deleteCatalog(s: CatalogSection, item: AdminCatalogItem): void {
    if (!confirm(`¿Eliminar “${item.nombre}”?`)) return;
    this.run(
      `catalog-${s.key}`,
      () => this.api.eliminarCatalogo(s.key, item.id),
      () =>
        this.setCatalog(
          s.key,
          s.items.filter((x) => x.id !== item.id),
        ),
      `${s.label}: elemento eliminado.`,
    );
  }
  private setCatalog(key: CatalogKey, items: AdminCatalogItem[]): void {
    this.catalogs.update((v) => v.map((s) => (s.key === key ? { ...s, items } : s)));
  }
  protected loadProvinces(): void {
    this.api.listarProvincias().subscribe({
      next: (v) => {
        this.provinces.set(v);
        if (v.length && !this.selectedProvince()) this.selectProvince(v[0].id);
      },
      error: (e: Error) => this.error.set(e.message),
    });
  }
  protected selectProvince(id: number): void {
    this.selectedProvince.set(id);
    this.api
      .listarCiudades(id)
      .subscribe({
        next: (v) => this.cities.set(v),
        error: (e: Error) => this.error.set(e.message),
      });
  }
  protected addProvince(): void {
    const n = (this.newValues['province'] || '').trim();
    if (!n) return;
    this.run(
      'province',
      () => this.api.crearProvincia(n),
      (v) => {
        this.provinces.update((x) => [...x, v as AdminProvince]);
        this.newValues['province'] = '';
      },
      'Provincia creada.',
    );
  }
  protected saveProvince(item: AdminProvince): void {
    const n = this.draft.trim();
    if (!n) return;
    this.run(
      'province',
      () => this.api.actualizarProvincia(item.id, n),
      (v) => {
        this.provinces.update((x) => x.map((p) => (p.id === item.id ? (v as AdminProvince) : p)));
        this.cancelEdit();
      },
      'Provincia actualizada.',
    );
  }
  protected deleteProvince(item: AdminProvince): void {
    if (!confirm(`¿Eliminar “${item.nombre}”?`)) return;
    this.run(
      'province',
      () => this.api.eliminarProvincia(item.id),
      () => {
        this.provinces.update((x) => x.filter((p) => p.id !== item.id));
        if (this.selectedProvince() === item.id) {
          this.selectedProvince.set(null);
          this.cities.set([]);
        }
      },
      'Provincia eliminada.',
    );
  }
  protected addCity(): void {
    const id = this.selectedProvince(),
      n = (this.newValues['city'] || '').trim();
    if (!id || !n) return;
    this.run(
      'city',
      () => this.api.crearCiudad(n, id),
      (v) => {
        this.cities.update((x) => [...x, v as AdminCity]);
        this.newValues['city'] = '';
      },
      'Ciudad creada.',
    );
  }
  protected saveCity(item: AdminCity): void {
    const id = this.selectedProvince(),
      n = this.draft.trim();
    if (!id || !n) return;
    this.run(
      'city',
      () => this.api.actualizarCiudad(item.id, n, id),
      (v) => {
        this.cities.update((x) => x.map((c) => (c.id === item.id ? (v as AdminCity) : c)));
        this.cancelEdit();
      },
      'Ciudad actualizada.',
    );
  }
  protected deleteCity(item: AdminCity): void {
    if (!confirm(`¿Eliminar “${item.nombre}”?`)) return;
    this.run(
      'city',
      () => this.api.eliminarCiudad(item.id),
      () => this.cities.update((x) => x.filter((c) => c.id !== item.id)),
      'Ciudad eliminada.',
    );
  }
}
