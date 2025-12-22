/**
 * Genera un UUID v4 compatible con todos los navegadores.
 * 
 * Usa crypto.randomUUID() si está disponible en contexto seguro (HTTPS),
 * o un fallback basado en Math.random() para HTTP o navegadores antiguos.
 * 
 * @returns UUID v4 string
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
    } catch (e) {
      // Fallback si falla
    }
  }

  // Fallback para navegadores que no soportan crypto.randomUUID() o contexto HTTP
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Genera un ID corto basado en UUID (8 caracteres).
 * Útil para IDs de elementos del DOM.
 * 
 * @param prefix - Prefijo opcional para el ID
 * @returns ID corto con prefijo opcional
 */
export function generateShortId(prefix = ''): string {
  const uuid = generateUUID();
  const shortId = uuid.slice(0, 8);
  return prefix ? `${prefix}-${shortId}` : shortId;
}
