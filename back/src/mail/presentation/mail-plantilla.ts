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
    return `<a href="${enlace}" style="display:inline-block;padding:12px 20px;border-radius:8px;background:#d94217;color:#ffffff;text-decoration:none;font-weight:700">${this.escapar(texto)}</a>`;
  }

  plantilla(preheader: string, html: string): string {
    return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>DEPA</title></head><body style="margin:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;color:#101828">
      <span style="display:none;max-height:0;overflow:hidden;opacity:0">${this.escapar(preheader)}</span>
      <table role="presentation" style="width:100%;border-collapse:collapse;background:#f3f4f6"><tr><td style="padding:28px 12px">
        <table role="presentation" style="width:100%;max-width:620px;margin:0 auto;border-collapse:collapse;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 8px 28px rgba(16,24,40,.08)">
          <tr><td style="padding:22px 28px;background:#101828;color:#ffffff"><strong style="font-size:25px;letter-spacing:.5px">DEPA</strong><span style="display:block;margin-top:4px;color:#cbd5e1;font-size:12px">Alquileres simples, decisiones seguras</span></td></tr>
          <tr><td style="padding:28px;line-height:1.6">${html}</td></tr>
          <tr><td style="padding:18px 28px;background:#f8fafc;color:#667085;font-size:12px;line-height:1.5">Este correo fue enviado por DEPA porque existe una actividad asociada a tu cuenta. Nunca te pediremos contraseñas ni datos completos de tarjeta por correo.</td></tr>
        </table>
      </td></tr></table>
    </body></html>`;
  }
}
