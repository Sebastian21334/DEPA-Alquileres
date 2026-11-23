import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { LucideSearch } from '@lucide/angular';

@Component({
  selector: 'app-search-field',
  standalone: true,
  imports: [LucideSearch],
  templateUrl: './search-field.component.html',
  styleUrl: './search-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchFieldComponent {
  readonly value = input('');
  readonly placeholder = input('');
  readonly ariaLabel = input('Buscar');
  readonly maxlength = input(200);
  readonly deshabilitado = input(false);
  readonly valueChange = output<string>();
}
