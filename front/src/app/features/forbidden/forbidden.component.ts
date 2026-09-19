import { Location } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideArrowLeft, LucideHouse, LucideShieldX } from '@lucide/angular';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  imports: [RouterLink, LucideArrowLeft, LucideHouse, LucideShieldX],
  templateUrl: './forbidden.component.html',
  styleUrl: './forbidden.component.scss',
})
export class ForbiddenComponent {
  private readonly location = inject(Location);

  protected volver(): void {
    this.location.back();
  }
}
