import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { ChatDockComponent } from './shared/components/chat-dock/chat-dock.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, ChatDockComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
