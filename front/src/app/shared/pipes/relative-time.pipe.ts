import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'relativeTime', standalone: true, pure: true })
export class RelativeTimePipe implements PipeTransform {
  transform(value: string | Date | null | undefined): string {
    if (!value) return '';
    const raw = typeof value === 'string' && !value.includes('T') ? `${value}T12:00:00` : value;
    const published = new Date(raw);
    if (Number.isNaN(published.getTime())) return '';

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    published.setHours(0, 0, 0, 0);
    const days = Math.max(0, Math.floor((today.getTime() - published.getTime()) / 86_400_000));

    if (days === 0) return 'Publicado hoy';
    if (days === 1) return 'Publicado ayer';
    if (days < 30) return `Publicado hace ${days} días`;

    const months = Math.max(1, Math.floor(days / 30));
    if (months < 12) return `Publicado hace ${months} ${months === 1 ? 'mes' : 'meses'}`;

    const years = Math.max(1, Math.floor(days / 365));
    return `Publicado hace ${years} ${years === 1 ? 'año' : 'años'}`;
  }
}
