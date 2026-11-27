import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { LucideEllipsis, LucideFlag, LucidePencil, LucideTrash2 } from '@lucide/angular';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { RelativeTimePipe } from '../../../shared/pipes/relative-time.pipe';
import { Resena } from '../resenas.model';
import { EstrellasComponent } from '../estrellas/estrellas.component';

@Component({
  selector: 'app-resena-card',
  standalone: true,
  imports: [AvatarComponent, RelativeTimePipe, EstrellasComponent, LucidePencil, LucideTrash2, LucideEllipsis, LucideFlag],
  templateUrl: './resena-card.component.html',
  styleUrl: './resena-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResenaCardComponent {
  readonly resena = input.required<Resena>();
  readonly propia = input(false);
  readonly denunciada = input(false);

  readonly editar = output<void>();
  readonly eliminar = output<void>();
  readonly denunciar = output<void>();
  readonly verImagen = output<string>();

  protected readonly autorNombre = computed(() => {
    const autor = this.resena().autor;
    return `${autor.nombre} ${autor.apellido}`.trim() || 'Usuario';
  });
  protected readonly visible = computed(() => this.resena().visible !== false);
  protected readonly puedeEditar = computed(() => this.propia() && this.visible());
  protected readonly puedeDenunciar = computed(() =>
    !this.propia() && this.visible() && !this.denunciada(),
  );
  protected readonly menuId = computed(() => `acciones-resena-${this.resena().id}`);
}
