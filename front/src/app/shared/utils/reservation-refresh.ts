import { isPlatformBrowser } from '@angular/common';
import { DestroyRef, inject, PLATFORM_ID } from '@angular/core';

/** Consulta al servidor; la fecha del dispositivo no decide el estado. */
export function activarActualizacionReservas(actualizar: () => void, frecuencia = 60_000): void {
  const destroyRef = inject(DestroyRef);
  if (!isPlatformBrowser(inject(PLATFORM_ID))) return;
  const alVolver = () => {
    if (document.visibilityState === 'visible') actualizar();
  };
  const intervalo = window.setInterval(alVolver, frecuencia);
  window.addEventListener('focus', alVolver);
  document.addEventListener('visibilitychange', alVolver);
  destroyRef.onDestroy(() => {
    window.clearInterval(intervalo);
    window.removeEventListener('focus', alVolver);
    document.removeEventListener('visibilitychange', alVolver);
  });
}
