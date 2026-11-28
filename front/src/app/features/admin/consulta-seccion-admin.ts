import { DestroyRef, inject, signal, type WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, type Observable, type Subscription } from 'rxjs';

export class ConsultaSeccionAdmin<T> {
  private readonly destroyRef = inject(DestroyRef);
  private consulta?: Subscription;
  readonly datos: WritableSignal<T>;
  readonly cargando = signal(true);
  readonly error = signal('');

  constructor(inicial: T) {
    this.datos = signal(inicial);
  }

  cargar(peticion: Observable<T>): void {
    this.consulta?.unsubscribe();
    this.cargando.set(true);
    this.error.set('');
    this.consulta = peticion.pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.cargando.set(false)),
    ).subscribe({
      next: (datos) => this.datos.set(datos),
      error: (error: Error) => this.error.set(error.message),
    });
  }
}
