/**
 * Configuración centralizada de la API REST.
 *
 * Proporciona una única fuente de verdad para URLs base y configuración HTTP.
 * Facilita cambios entre entornos y mantiene consistencia en toda la aplicación.
 */
export const API_CONFIG = {
  /**
   * URL base de la API backend.
   * Ruta relativa que funciona con el proxy reverso de Nginx.
   */
  baseUrl: '/api/v1',

  /**
   * Timeout por defecto para requests HTTP (ms).
   */
  timeout: 30000,
} as const;

export type ApiConfig = typeof API_CONFIG;
