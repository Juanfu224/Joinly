/**
 * Genera un UUID v4 compatible con todos los navegadores.
 * 
 * Usa crypto.randomUUID() si está disponible en contexto seguro (HTTPS),
 * o un fallback basado en Math.random() para contextos inseguros.
 * 
 * @returns UUID v4 string en formato estándar (xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx)
 * 
 * @example
 * ```typescript
 * const userId = generateUUID();
 * // => "a3bb189e-8bf9-4c8e-9fce-1f9b8e3a9d2b"
 * ```
 */
export function generateUUID(): string {
  // Usar crypto.randomUUID() solo si está disponible y en contexto seguro (HTTPS)
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function' &&
    (window.isSecureContext || window.location.protocol === 'https:')
  ) {
    try {
      return crypto.randomUUID();
    } catch {
      // Fallback si falla
    }
  }

  // Fallback para navegadores que no soportan crypto.randomUUID() o contextos HTTP
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Genera un ID corto basado en UUID (8 caracteres).
 * Útil para IDs únicos de elementos del DOM (ARIA, formularios, etc.).
 * 
 * @param prefix - Prefijo opcional para el ID (mejora legibilidad en DevTools)
 * @returns ID corto con prefijo opcional
 * 
 * @example
 * ```typescript
 * const inputId = generateShortId('form-input');
 * // => "form-input-a3bb189e"
 * 
 * const tabId = generateShortId();
 * // => "a3bb189e"
 * ```
 */
export function generateShortId(prefix = ''): string {
  const uuid = generateUUID();
  const shortId = uuid.slice(0, 8);
  return prefix ? `${prefix}-${shortId}` : shortId;
}
