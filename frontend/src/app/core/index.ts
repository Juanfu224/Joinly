/**
 * Barrel export para módulo core.
 *
 * Facilita importaciones desde otros módulos.
 */

// Config
export { API_CONFIG, type ApiConfig } from './config/api.config';

// Services
export { ApiService, type ApiRequestOptions, type RetryConfig } from './services/api.service';
