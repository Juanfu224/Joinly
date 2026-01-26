import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe para formatear el número de suscripciones en texto legible.
 *
 * @usageNotes
 * ```html
 * {{ totalSuscripciones | formatSuscripciones }}
 * <!-- 0 → 'Ninguna' -->
 * <!-- 1 → '1 suscripción' -->
 * <!-- 3 → '3 suscripciones' -->
 * ```
 */
@Pipe({
  name: 'formatSuscripciones',
  standalone: true,
})
export class FormatSuscripcionesPipe implements PipeTransform {
  transform(total: number | null | undefined): string {
    const cantidad = total ?? 0;
    return cantidad === 0
      ? 'Ninguna'
      : cantidad === 1
        ? '1 suscripción'
        : `${cantidad} suscripciones`;
  }
}
