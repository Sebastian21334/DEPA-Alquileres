import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
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
} from '@lucide/angular';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-ser-anunciante',
  standalone: true,
  imports: [
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
  ],
  templateUrl: './ser-anunciante.component.html',
  styleUrl: './ser-anunciante.component.scss',
})
export class SerAnuncianteComponent {
  protected readonly auth = inject(AuthService);
}
