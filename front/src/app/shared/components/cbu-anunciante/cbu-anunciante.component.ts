import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { PerfilService } from '../../../core/services/perfil.service';

@Component({
  selector: 'app-cbu-anunciante',
  imports: [ReactiveFormsModule],
  templateUrl: './cbu-anunciante.component.html',
  styles: [':host { display: block; } form { display: grid; gap: .75rem; }'],
})
export class CbuAnuncianteComponent {
  private readonly perfil = inject(PerfilService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly solicitud = this.perfil.solicitud;
  protected readonly editando = signal(false);
  protected readonly enviando = signal(false);
  protected readonly error = signal('');
  protected readonly cbu = new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^\d{22}$/)] });
  protected readonly titularidad = new FormControl(false, { nonNullable: true, validators: Validators.requiredTrue });

  protected guardar(evento: Event): void {
    evento.preventDefault();
    if (this.enviando() || this.cbu.invalid || this.titularidad.invalid) {
      this.cbu.markAsTouched();
      this.titularidad.markAsTouched();
      return;
    }
    this.error.set('');
    this.enviando.set(true);
    this.perfil.solicitarCambioCbu(this.cbu.value).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.enviando.set(false)),
    ).subscribe({
      next: () => {
        this.cbu.reset();
        this.titularidad.reset();
        this.editando.set(false);
      },
      error: (error: Error) => this.error.set(error.message),
    });
  }
}
