/**
 * Modelos de autenticación.
 * Corresponden a los DTOs del backend Java.
 */

// REQUEST DTOs
export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  nombre: string;
  email: string;
  password: string;
}

// RESPONSE DTOs
export interface AuthResponse {
  id: number;
  nombre: string;
  email: string;
  temaPreferido?: 'light' | 'dark';
  emailVerificado?: boolean;
  telefono?: string;
  fechaRegistro?: string;
  fechaUltimoAcceso?: string;
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  mensaje?: string;
}

export interface User {
  id: number;
  nombre: string;
  email: string;
  emailVerificado?: boolean;
  temaPreferido?: 'light' | 'dark';
  telefono?: string;
  avatar?: string;
  fechaRegistro?: string;
  fechaUltimoAcceso?: string;
}

// TOKEN MANAGEMENT
export interface StoredTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresAt: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// ERROR RESPONSES
export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  errors?: FieldError[];
}

export interface FieldError {
  field: string;
  message: string;
  rejectedValue?: unknown;
}
