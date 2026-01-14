import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe para formatear códigos de invitación como XXXX-XXXX-XXXX
 *
 * @usageNotes
 * ```html
 * {{ 'ABC123456789' | formatCodigo }}
 * <!-- Output: ABC1-2345-6789 -->
 * ```
 *
 * ### Características:
 * - Elimina caracteres no alfanuméricos
 * - Convierte a mayúsculas
 * - Agrupa en bloques de 4 caracteres separados por guiones
 * - Máximo 3 grupos (12 caracteres)
 */
@Pipe({
  name: 'formatCodigo',
  standalone: true,
  pure: true,
})
export class FormatCodigoPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';

    // Limpiar: solo letras y números, convertir a mayúsculas
    const clean = value.replace(/[^A-Z0-9]/gi, '').toUpperCase();

    // Agrupar en chunks de 4 caracteres
    const chunks = clean.match(/.{1,4}/g) ?? [];

    // Tomar máximo 3 grupos y unir con guiones
    return chunks.slice(0, 3).join('-');
  }
}
