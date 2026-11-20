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

  boton(texto: string, enlace: string): string {
    return `<a href="${this.escapar(enlace)}" style="display:inline-block;padding:13px 22px;border-radius:10px;background:#d94217;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700">${this.escapar(texto)}</a>`;
  }

  plantilla(preheader: string, html: string, titulo: string, logoUrl: string): string {
    return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${this.escapar(titulo)}</title></head><body style="margin:0;background:#f7f7f9;font-family:Arial,Helvetica,sans-serif;color:#101828">
      <span style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all">${this.escapar(preheader)}</span>
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;background:#f7f7f9"><tr><td align="center" style="padding:32px 12px">
        <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;max-width:620px;border-collapse:collapse;background:#ffffff;border:1px solid #e5e7eb;border-radius:14px">
          <tr><td style="height:5px;background:#d94217;font-size:0;line-height:0">&nbsp;</td></tr>
          <tr><td style="padding:24px 28px 20px;border-bottom:1px solid #e5e7eb"><a href="${this.escapar(new URL('/', logoUrl).toString())}" style="text-decoration:none"><img src="${this.escapar(logoUrl)}" alt="DEPA" width="150" style="display:block;width:150px;max-width:100%;height:auto;border:0;color:#0e47a1;font-size:24px;font-weight:800"></a><span style="display:block;margin-top:9px;color:#667085;font-size:12px">Alquileres simples, decisiones seguras</span></td></tr>
          <tr><td style="padding:30px 28px 32px;font-size:15px;line-height:1.65"><h1 style="margin:0 0 20px;color:#101828;font-size:24px;line-height:1.3">${this.escapar(titulo)}</h1>${html}</td></tr>
          <tr><td style="padding:20px 28px;background:#e8eefb;border-top:1px solid #d8e3f8;color:#0b3780;font-size:12px;line-height:1.6"><strong style="font-size:14px">DEPA</strong><br>Este correo se envió por una actividad asociada a tu cuenta. Nunca te pediremos contraseñas ni datos completos de tarjeta por correo.</td></tr>
        </table>
      </td></tr></table>
    </body></html>`;
  }
}
