import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { PerfilService } from '../../../core/services/perfil.service';
import { RevealDirective } from '../../directives/reveal.directive';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, RevealDirective],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  protected readonly auth = inject(AuthService);
  protected readonly perfil = inject(PerfilService);
  protected readonly anio = new Date().getFullYear();
}
