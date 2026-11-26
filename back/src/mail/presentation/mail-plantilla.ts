import { Injectable } from '@nestjs/common';
import type {
  ConversionEmailDetalle,
  ReservaEmailDetalle,
} from '../mail.interface';

@Injectable()
export class MailPlantilla {
  fecha(valor: Date): string {
    return new Intl.DateTimeFormat('es-AR', { dateStyle: 'long' }).format(
      new Date(valor),
    );
  }

  escapar(valor: string): string {
    return valor
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  importe(valor: number, moneda: string, decimales = 2): string {
    const codigo = moneda === 'USD' || moneda.includes('USD') ? 'USD' : 'ARS';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: codigo,
      maximumFractionDigits: decimales,
    }).format(valor);
  }

  conversion(detalle?: ConversionEmailDetalle): string {
    if (!detalle) return '';
    return `<p><strong>Precio publicado:</strong> ${this.importe(detalle.importeOrigen, detalle.monedaOrigen)}.
      Conversión aceptada a dólar blue venta: ${this.importe(detalle.cotizacionVenta, 'ARS', 6)} por USD.
      Fuente: ${this.escapar(detalle.proveedor)}, publicada ${this.escapar(detalle.fechaFuente)}.
      El importe pagado en pesos conserva la cotización aceptada al reservar.</p>`;
  }

  detalleReserva(detalle: ReservaEmailDetalle): string {
    return `<table role="presentation" style="width:100%;border-collapse:collapse;margin:20px 0;border:1px solid #e5e7eb;border-radius:10px">
      <tr><td colspan="2" style="padding:14px 16px;background:#f8fafc;font-weight:700">Reserva #${detalle.idReserva} · ${this.escapar(detalle.titulo)}</td></tr>
      <tr><td style="padding:10px 16px;color:#667085">Ubicación</td><td style="padding:10px 16px;text-align:right;font-weight:600">${this.escapar(detalle.direccion)}</td></tr>
      <tr><td style="padding:10px 16px;color:#667085">Ingreso</td><td style="padding:10px 16px;text-align:right;font-weight:600">${this.fecha(detalle.fechaInicio)}</td></tr>
      <tr><td style="padding:10px 16px;color:#667085">Salida</td><td style="padding:10px 16px;text-align:right;font-weight:600">${this.fecha(detalle.fechaFin)}</td></tr>
      <tr><td style="padding:10px 16px;color:#667085">Duración</td><td style="padding:10px 16px;text-align:right;font-weight:600">${detalle.cantidadDias} ${detalle.cantidadDias === 1 ? 'día' : 'días'}</td></tr>
      <tr><td style="padding:12px 16px;border-top:1px solid #e5e7eb;font-weight:700">Total pagado</td><td style="padding:12px 16px;border-top:1px solid #e5e7eb;text-align:right;font-size:18px;font-weight:800;color:#d94217">${this.importe(detalle.monto, detalle.moneda)}</td></tr>
    </table>${this.conversion(detalle.conversion)}`;
  }

  avisoContacto(): string {
    return '<p style="margin:20px 0 0;padding-top:16px;border-top:1px solid #e5e7eb;color:#667085;font-size:12px;line-height:1.5"><strong>Consejo de seguridad:</strong> la mensajería interna mantiene la conversación dentro de DEPA. Si elegís continuar por WhatsApp, DEPA no podrá revisar esa conversación ni ayudarte a verificar acuerdos realizados fuera de la plataforma.</p>';
  }

  /** Encabeza los correos que reciben los administradores, para no confundirlos con los de las partes. */
  paraAdministracion(): string {
    return '<p style="margin:0 0 20px;padding:12px 16px;border-radius:10px;background:#fff4e5;border:1px solid #fdba74;color:#7c2d12"><strong>Para administración</strong><br>Recibís este correo porque sos administrador de DEPA. Gestionalo desde el panel de administración.</p>';
  }

  boton(texto: string, enlace: string): string {
    return `<a href="${this.escapar(enlace)}" style="display:inline-block;margin:4px 0;padding:14px 24px;border-radius:11px;background:#d93508;color:#ffffff;text-decoration:none;font-size:17px;font-weight:700;line-height:1.35">${this.escapar(texto)}</a>`;
  }

  plantilla(preheader: string, html: string, titulo: string, inicioUrl: string, icono: string): string {
    return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${this.escapar(titulo)}</title></head><body style="margin:0;background:#ccddf3;font-family:Arial,Helvetica,sans-serif;color:#101828">
      <span style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all">${this.escapar(preheader)}</span>
      <table role="presentation" cellpadding="0" cellspacing="0" bgcolor="#ccddf3" style="width:100%;border-collapse:collapse;background:#ccddf3"><tr><td align="center" style="padding:26px 12px">
        <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;max-width:742px;border-collapse:separate;border-spacing:0;border-radius:16px;box-shadow:0 10px 24px rgba(15,38,79,.2);text-align:left">
          <tr><td bgcolor="#f6f9fd" style="padding:24px 36px;background-color:#f6f9fd;background-image:linear-gradient(153deg,transparent 38%,#c6dcf6 38%,#c6dcf6 53%,transparent 53%,transparent 68%,#d7e7f9 68%,#d7e7f9 80%,#bcd6f3 80%);background-repeat:no-repeat;background-position:right bottom;background-size:32% 100%;border-bottom:1px solid #bed5f5;border-radius:16px 16px 0 0">
            <a href="${this.escapar(inicioUrl)}" style="display:inline-block;text-decoration:none"><img src="cid:logo-depa" alt="DEPA" width="208" style="display:block;width:208px;max-width:100%;height:auto;border:0;color:#0b3672;font-size:26px;font-weight:800"></a>
          </td></tr>
          <tr><td bgcolor="#ffffff" style="padding:30px 32px 36px;background:#ffffff;font-size:17px;line-height:1.55;overflow-wrap:anywhere">
            <span aria-hidden="true" style="display:inline-block;width:60px;border-radius:12px;background:#dbe8fb;color:#092b70;font-family:Arial,Helvetica,sans-serif;font-size:30px;line-height:56px;text-align:center">${this.escapar(icono)}</span>
            <h1 style="margin:12px 0 16px;color:#101828;font-size:32px;line-height:1.18">${this.escapar(titulo)}</h1>
            ${html}
          </td></tr>
          <tr><td bgcolor="#e3edfb" style="padding:24px 32px 28px;background:#e3edfb;border-top:1px solid #c3d6f3;border-radius:0 0 16px 16px;color:#0a2968;font-size:15px;line-height:1.5"><strong style="font-size:20px">DEPA</strong><br>Nunca te pediremos contraseñas ni datos completos de tarjeta por correo.</td></tr>
        </table>
      </td></tr></table>
    </body></html>`;
  }
}
