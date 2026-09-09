import { Component, input } from '@angular/core';

// Spinner reutilizable, sin identidad visual definida (RNF4): usa currentColor
// para heredar el color de texto del contenedor que lo use.
@Component({
  selector: 'app-spinner',
  standalone: true,
  templateUrl: './spinner.component.html',
  styleUrl: './spinner.component.scss',
})
export class SpinnerComponent {
  readonly label = input('Cargando…');
}
