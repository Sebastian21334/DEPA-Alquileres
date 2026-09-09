import { Component, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

type Estado = 'verificando' | 'exito' | 'error';

// Consume el link que el backend envía por mail al registrarse (ver
// back/src/mail/mail.service.ts#enviarVerificacion, que arma
// "${frontendUrl}/verificar-cuenta?token=...") y completa RN-2/el caso de
// uso "Crear Usuario": sin esta pantalla, el link del mail no tendría a
// dónde apuntar y ninguna cuenta nueva podría iniciar sesión (RF2 exige
// email_verificado = true).
//
// OJO con SSR: la app tiene hidratación habilitada
// (app.config.ts#provideClientHydration) y explícitamente excluye los POST
// del transfer-cache (withHttpTransferCacheOptions({ includePostRequests:
// false })). Si este POST se disparara en ngOnInit sin más, se ejecutaría
// dos veces: una en el servidor durante el render SSR (consumiendo el
// token, éxito invisible para el usuario) y otra en el navegador al
// hidratar — la segunda siempre falla porque el token es de un solo uso
// (back/src/usuarios/service/usuarios.service.ts#verificarCuenta), así que
// todo usuario real vería "Token inválido" aunque su cuenta sí haya
// quedado verificada. Por eso se guarda con isPlatformBrowser: la
// verificación real solo se dispara una vez, del lado del cliente.
@Component({
  selector: 'app-verificar-cuenta',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './verificar-cuenta.component.html',
  styleUrl: './verificar-cuenta.component.scss',
})
export class VerificarCuentaComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly platformId = inject(PLATFORM_ID);

  protected readonly estado = signal<Estado>('verificando');
  protected readonly mensaje = signal<string>('Verificando tu cuenta…');

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return; // evita duplicar el POST durante el render SSR

    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.estado.set('error');
      this.mensaje.set('El link de verificación no es válido: falta el token.');
      return;
    }

    this.authService.verificarCuenta(token).subscribe({
      next: (res) => {
        this.estado.set('exito');
        this.mensaje.set(res.mensaje);
      },
      error: (err: Error) => {
        this.estado.set('error');
        this.mensaje.set(err.message);
      },
    });
  }
}
