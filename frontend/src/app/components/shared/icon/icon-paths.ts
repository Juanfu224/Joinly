/**
 * Paths SVG de iconos del sistema de diseño Joinly.
 * Basado en el diseño de Figma: https://www.figma.com/design/8q36kcT9LEqoXs99ZBxfV5/Joinly
 *
 * Iconos UI usan:
 * - viewBox="0 0 24 24"
 * - stroke="currentColor" (heredan el color del padre)
 * - stroke-width="2", stroke-linecap="round", stroke-linejoin="round"
 *
 * Iconos de Redes Sociales usan:
 * - viewBox="0 0 24 24"
 * - fill="currentColor" (relleno sólido, heredan el color del padre)
 */

export const ICON_PATHS = {
  // ========== Navegación ==========
  'arrow-right': `
    <path d="M12.647 1.847L22.8 12L12.647 22.153" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <path d="M22.8 12L1.2 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'arrow-left': `
    <path d="M1.2 12L22.8 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <path d="M11.353 22.153L1.2 12L11.353 1.847" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'arrow-external-right': `
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6m4-3h6v6m-11 5L21 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'arrow-external-left': `
    <path d="M6 13v6a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-6M3 9V3h6M3 3l11 11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'chevron-left': `
    <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'chevron-right': `
    <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'chevron-down': `
    <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'chevron-up': `
    <path d="M18 15l-6-6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,

  // ========== Acciones ==========
  'menu': `
    <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'close': `
    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'add': `
    <path d="M12 5v14m-7-7h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'less': `
    <path d="M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'search': `
    <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2" fill="none"/>
    <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'check': `
    <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'circle-check': `
    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
    <path d="m9 12 2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'circle-x': `
    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
    <path d="m15 9-6 6m0-6 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'alert-triangle': `
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0ZM12 9v4m0 4h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,

  // ========== Usuario e Identidad ==========
  'user': `
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'users': `
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'email': `
    <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" stroke-width="2" fill="none"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'phone': `
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'password': `
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" stroke-width="2" fill="none"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,

  // ========== Interfaz ==========
  'home': `
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <path d="M9 22V12h6v10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'calendar': `
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2" fill="none"/>
    <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'message': `
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'bell': `
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'cog': `
    <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" fill="none"/>
    <path d="M12 1v6m0 6v6m5.2-14l-1.7 4.6m-3 8.8L10.8 23M23 12h-6m-6 0H1m14-5.2l-4.6 1.7m-8.8 3L1 10.8M23 13.2l-4.6-1.7m-8.8-3L1 10.8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'settings': `
    <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" fill="none"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'clock': `
    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
    <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'bin': `
    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,

  // ========== Finanzas ==========
  'dollar': `
    <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'credit-card': `
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" stroke="currentColor" stroke-width="2" fill="none"/>
    <path d="M1 10h22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'wallet': `
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4M3 5v14a2 2 0 0 0 2 2h16v-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <circle cx="16" cy="15.5" r="1" stroke="currentColor" stroke-width="2" fill="none"/>
  `,
  'coin': `
    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
    <path d="M12 6v12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <path d="M15 9.5c0-1.1-.9-2-2-2h-2c-1.1 0-2 .9-2 2s.9 2 2 2h2c1.1 0 2 .9 2 2s-.9 2-2 2h-2c-1.1 0-2-.9-2-2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,

  // ========== Medios ==========
  'eye': `
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" fill="none"/>
  `,
  'play': `
    <path d="m5 3 14 9-14 9V3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'camera': `
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2v11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <circle cx="12" cy="13" r="4" stroke="currentColor" stroke-width="2" fill="none"/>
  `,
  'video-camera': `
    <path d="M23 7l-7 5 7 5V7ZM16 5H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,

  // ========== Dispositivos ==========
  'mobile': `
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" stroke="currentColor" stroke-width="2" fill="none"/>
    <path d="M12 18h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'laptop': `
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="currentColor" stroke-width="2" fill="none"/>
    <path d="M2 17h20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'desktop': `
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="currentColor" stroke-width="2" fill="none"/>
    <path d="M8 21h8M12 17v4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,

  // ========== Archivos y Documentos ==========
  'folder': `
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2v11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'bookmark': `
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'database': `
    <ellipse cx="12" cy="5" rx="9" ry="3" stroke="currentColor" stroke-width="2" fill="none"/>
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'report': `
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <path d="M14 2v6h6M16 13H8m8 6H8m2-9H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,

  // ========== Comunicación ==========
  'send': `
    <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'share': `
    <circle cx="18" cy="5" r="3" stroke="currentColor" stroke-width="2" fill="none"/>
    <circle cx="6" cy="12" r="3" stroke="currentColor" stroke-width="2" fill="none"/>
    <circle cx="18" cy="19" r="3" stroke="currentColor" stroke-width="2" fill="none"/>
    <path d="m8.59 13.51 6.83 3.98m-.01-10.98-6.82 3.98" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'link': `
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'wifi': `
    <path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,

  // ========== Edición ==========
  'pencil': `
    <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'pencil-writing': `
    <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'pen': `
    <path d="m12 19 7-7 3 3-7 7-3-3ZM18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5ZM2 2l7.586 7.586" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <circle cx="11" cy="11" r="2" stroke="currentColor" stroke-width="2" fill="none"/>
  `,

  // ========== Gráficos y Análisis ==========
  'graph': `
    <path d="M3 3v18h18M7 16l4-6 4 6 6-9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'graph-ascend': `
    <path d="M3 17l6-6 4 4 8-8m0 0v6m0-6h-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'graph-descend': `
    <path d="M3 7l6 6 4-4 8 8m0 0v-6m0 6h-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'analytics-pie': `
    <path d="M21.21 15.89A10 10 0 1 1 8 2.83M22 12A10 10 0 0 0 12 2v10h10Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,

  // ========== Marca y Utilidad ==========
  'star': `
    <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'heart': `
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'flag': `
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1v18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'tag': `
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82ZM7 7h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'filter': `
    <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'megaphone': `
    <path d="m3 11 18-5v12L3 13v-2Zm0 0h7M3.34 20.02l3.22-2.15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'support': `
    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3m.08 4h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'info': `
    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
    <path d="M12 16v-4m0-4h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'lightning': `
    <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'tools': `
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'briefcase': `
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" stroke="currentColor" stroke-width="2" fill="none"/>
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'badge': `
    <circle cx="12" cy="8" r="6" stroke="currentColor" stroke-width="2" fill="none"/>
    <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'care': `
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78ZM12 6v12m-6-6h12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'sync': `
    <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'code': `
    <path d="m16 18 6-6-6-6M8 6l-6 6 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'web': `
    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'mark': `
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z" stroke="currentColor" stroke-width="2" fill="none"/>
    <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2" fill="none"/>
  `,
  'test': `
    <path d="M9 11H3v10h6V11ZM15 1h-6v20h6V1ZM21 6h-6v15h6V6Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'design-tools': `
    <path d="M12 19l7-7 3 3-7 7-3-3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <path d="M2 2l7.586 7.586" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <circle cx="11" cy="11" r="2" stroke="currentColor" stroke-width="2" fill="none"/>
  `,
  'download': `
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,

  // ========== Tema ==========
  'sun': `
    <circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="2" fill="none"/>
    <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'moon': `
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,

  // ========== Redes Sociales (Iconos con relleno) ==========
  'facebook': `
    <path d="M24 12c0-6.627-5.373-12-12-12S0 5.373 0 12c0 5.99 4.388 10.954 10.125 11.854V15.47H7.078V12h3.047V9.356c0-3.007 1.792-4.668 4.533-4.668 1.312 0 2.686.234 2.686.234v2.953H15.83c-1.491 0-1.956.925-1.956 1.875V12h3.328l-.532 3.469h-2.796v8.385C19.612 22.954 24 17.99 24 12Z" fill="currentColor"/>
  `,
  'twitter': `
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" fill="currentColor"/>
  `,
  'instagram': `
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069ZM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0Zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881Z" fill="currentColor"/>
  `,
  'linkedin': `
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065Zm1.782 13.019H3.555V9h3.564v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003Z" fill="currentColor"/>
  `,
  'youtube': `
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814ZM9.545 15.568V8.432L15.818 12l-6.273 3.568Z" fill="currentColor"/>
  `,
  'dribbble': `
    <path d="M12 24C5.385 24 0 18.615 0 12S5.385 0 12 0s12 5.385 12 12-5.385 12-12 12Zm10.12-10.358c-.35-.11-3.17-.953-6.384-.438 1.34 3.684 1.887 6.684 1.992 7.308a10.174 10.174 0 0 0 4.392-6.87Zm-6.115 7.808c-.153-.9-.75-4.032-2.19-7.77l-.066.02c-5.79 2.015-7.86 6.025-8.04 6.4a10.13 10.13 0 0 0 6.29 2.166c1.42 0 2.77-.29 4.006-.816Zm-11.62-2.58c.232-.4 3.045-5.055 8.332-6.765.135-.045.27-.084.405-.12-.26-.585-.54-1.167-.832-1.74C7.17 11.775 2.206 11.71 1.756 11.7l-.004.312c0 2.633.998 5.037 2.634 6.858Zm-2.42-8.955c.46.008 4.683.026 9.477-1.248-1.698-3.018-3.53-5.558-3.8-5.928-2.868 1.35-5.01 3.99-5.676 7.176Zm9.594-8.108c.282.385 2.14 2.913 3.822 6.006 3.645-1.367 5.19-3.44 5.373-3.702A10.15 10.15 0 0 0 12 1.756c-.405 0-.802.03-1.19.082Zm10.376 4.085c-.216.29-1.94 2.53-5.75 4.067.24.49.47.985.68 1.486.07.168.14.34.205.51 3.427-.43 6.827.26 7.17.338a10.086 10.086 0 0 0-2.305-6.4Z" fill="currentColor"/>
  `,
  'behance': `
    <path d="M6.938 4.503c.702 0 1.34.06 1.92.188.577.13 1.07.33 1.485.61.41.28.733.65.96 1.12.225.47.34 1.05.34 1.73 0 .74-.17 1.36-.507 1.86-.338.5-.837.9-1.502 1.22.906.26 1.576.72 2.022 1.37.448.66.665 1.45.665 2.36 0 .75-.13 1.39-.41 1.93-.28.55-.67 1-1.16 1.35-.48.348-1.05.6-1.67.767-.61.165-1.252.254-1.91.254H0V4.51h6.938v-.007ZM6.545 9.89c.595 0 1.062-.15 1.412-.454.35-.302.518-.753.518-1.346 0-.338-.06-.616-.18-.83-.12-.215-.29-.39-.49-.51-.2-.12-.438-.2-.71-.253-.27-.052-.56-.08-.852-.08H2.88v3.473h3.665Zm.324 5.905c.34 0 .653-.04.95-.117.29-.08.55-.2.75-.373.21-.17.37-.39.5-.66.12-.27.18-.6.18-.99 0-.79-.22-1.36-.66-1.72-.44-.36-1.04-.54-1.79-.54H2.88v4.4h3.99Zm8.73-10.68h7.07v1.77h-7.07V5.115Zm3.62 12.12c.51.51 1.25.77 2.2.77.69 0 1.28-.17 1.78-.52.5-.34.8-.7.9-1.07h2.97c-.47 1.47-1.19 2.53-2.15 3.17-.96.64-2.12.97-3.49.97-.95 0-1.82-.15-2.59-.47-.77-.31-1.44-.75-1.98-1.33-.55-.58-.97-1.27-1.27-2.08-.3-.81-.45-1.71-.45-2.69 0-.95.15-1.83.46-2.63.31-.8.74-1.5 1.29-2.08.55-.58 1.2-1.03 1.96-1.35.76-.32 1.59-.49 2.49-.49.98 0 1.86.18 2.63.55.77.37 1.42.88 1.94 1.53.52.65.91 1.42 1.16 2.31.25.88.34 1.85.27 2.9h-8.82c.05 1.01.35 1.79.86 2.3Zm3.83-6.4c-.41-.46-1.05-.7-1.9-.7-.56 0-1.02.1-1.39.29-.37.2-.66.44-.89.75-.23.3-.38.63-.47.98-.09.35-.14.66-.15.95h5.64c-.07-.86-.43-1.81-.84-2.27Z" fill="currentColor"/>
  `,
  'whatsapp': `
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" fill="currentColor"/>
  `,
  'tiktok': `
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07Z" fill="currentColor"/>
  `,
  'google': `
    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48Z" fill="currentColor"/>
  `,
  'spotify': `
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0Zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02Zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2Zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3Z" fill="currentColor"/>
  `,
  'product-hunt': `
    <path d="M13.604 8.4h-3.405V12h3.405a1.8 1.8 0 0 0 0-3.6ZM12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0Zm1.604 14.4h-3.405V18H7.801V6h5.804a4.2 4.2 0 0 1 0 8.4Z" fill="currentColor"/>
  `,
  'twitch': `
    <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0 1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" fill="currentColor"/>
  `,
  'tumblr': `
    <path d="M14.563 24c-5.093 0-7.031-3.756-7.031-6.411V9.747H5.116V6.648c3.63-1.313 4.512-4.596 4.71-6.469C9.84.05 9.941 0 9.999 0h3.517v6.114h4.801v3.633h-4.82v7.47c.016 1.001.375 2.371 2.207 2.371h.09c.631-.02 1.486-.205 1.936-.419l1.156 3.425c-.436.636-2.4 1.374-4.156 1.404h-.168Z" fill="currentColor"/>
  `,
  'github': `
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" fill="currentColor"/>
  `,
  'messenger': `
    <path d="M.001 11.639C.001 4.949 5.241 0 12.001 0S24 4.95 24 11.639c0 6.689-5.24 11.638-12 11.638-1.21 0-2.38-.16-3.47-.46a.96.96 0 0 0-.64.05l-2.39 1.05a.96.96 0 0 1-1.35-.85l-.07-2.14a.97.97 0 0 0-.32-.68A11.39 11.389 0 0 1 .002 11.64Zm8.32-2.19-4.03 6.41c-.3.5.3.99.75.64l3.4-2.6a.72.72 0 0 1 .88 0l2.51 1.89c.8.6 1.91.27 2.3-.63l4.03-6.4c.3-.5-.3-.99-.75-.64l-3.4 2.6a.72.72 0 0 1-.88 0l-2.51-1.89a1.44 1.44 0 0 0-2.3.63v-.01Z" fill="currentColor"/>
  `,
  'reddit': `
    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0Zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701ZM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249Zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249Zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095Z" fill="currentColor"/>
  `,
  'pinterest': `
    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0Z" fill="currentColor"/>
  `,
  'telegram': `
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0Zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635Z" fill="currentColor"/>
  `,
  'medium': `
    <path d="M13.54 12a6.8 6.8 0 0 1-6.77 6.82A6.8 6.8 0 0 1 0 12a6.8 6.8 0 0 1 6.77-6.82A6.8 6.8 0 0 1 13.54 12Zm7.42 0c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42ZM24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12Z" fill="currentColor"/>
  `,
  'snapchat': `
    <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301a.603.603 0 0 1 .274-.074c.12 0 .24.03.345.09.12.06.615.33.615.63 0 .36-.449.54-1.004.72-.091.03-.18.06-.27.09-.45.149-.99.27-1.17.54-.09.135-.075.255-.045.405.24 1.095 1.29 3.135 3.405 3.675.21.045.42.15.465.39.045.225-.09.449-.3.615a4.065 4.065 0 0 1-.87.465c-.615.24-1.26.36-1.92.359-.075.045-.09.195-.105.315-.015.12-.045.27-.075.42a.588.588 0 0 1-.615.45c-.135 0-.27-.015-.42-.045-1.11-.195-2.19-.225-3.18.375-1.155.7-2.01 1.35-3.135 1.35h-.27c-1.125 0-1.98-.645-3.135-1.35-.99-.6-2.07-.57-3.18-.375a2.58 2.58 0 0 1-.42.045c-.3 0-.54-.165-.615-.45a9.884 9.884 0 0 0-.075-.42c-.015-.12-.03-.27-.105-.315a4.79 4.79 0 0 1-1.92-.359 4.082 4.082 0 0 1-.87-.465c-.21-.165-.345-.39-.3-.615.045-.24.255-.345.465-.39 2.115-.54 3.165-2.58 3.405-3.675.03-.15.045-.27-.045-.405-.18-.27-.72-.39-1.17-.54-.09-.03-.18-.06-.27-.09-.555-.18-1.004-.36-1.004-.72 0-.225.345-.465.66-.615A.633.633 0 0 1 2.74 9.6c.12 0 .24.03.36.075.315.165.6.264.93.3.24.015.435-.06.525-.135 0-.015 0-.03-.015-.045-.015-.12-.03-.255-.045-.42-.12-1.635-.255-3.66.27-4.845C5.69 1.068 9.036.793 10.026.793h.09c.99-.003 1.5.003 2.09.003Z" fill="currentColor"/>
  `,
  'discord': `
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03ZM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418Zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418Z" fill="currentColor"/>
  `,
  'skype': `
    <path d="M12.069 1.966a6.104 6.104 0 0 1 6.015 7.108 6.137 6.137 0 0 1 3.95 5.738 6.104 6.104 0 0 1-6.103 6.104 6.067 6.067 0 0 1-1.862-.294 6.137 6.137 0 0 1-10.034-4.752c0-.65.102-1.276.292-1.862a6.104 6.104 0 0 1 7.742-11.942Zm.003 3.61c-2.412 0-3.936 1.267-3.936 2.984 0 .904.42 1.804 2.028 2.18l2.453.577c.746.176 1.12.52 1.12 1.053 0 .738-.756 1.278-1.782 1.278-1.453 0-2.003-.66-2.312-1.215-.157-.286-.365-.503-.82-.503-.44 0-.822.314-.822.78 0 .63.588 2.052 3.954 2.052 2.185 0 4.098-1.081 4.098-3.063 0-1.272-.852-2.08-2.42-2.457l-2.078-.497c-.698-.166-1.044-.447-1.044-.927 0-.617.537-1.157 1.5-1.157 1.446 0 1.807.694 2.106 1.122.15.21.35.436.77.436.47 0 .817-.35.817-.829 0-.346-.198-1.814-3.632-1.814Z" fill="currentColor"/>
  `,
  'yelp': `
    <path d="M20.16 12.594l-4.995 1.433c-.96.276-1.74-.8-1.176-1.63l2.905-4.308a1.072 1.072 0 0 1 1.596-.206 9.194 9.194 0 0 1 2.364 3.252 1.073 1.073 0 0 1-.694 1.46Zm-3.965 5.168c-.107-.287-.028-.605.195-.816l3.671-3.714c.244-.247.627-.284.915-.088a9.169 9.169 0 0 1 1.591 3.757c.096.374-.128.755-.5.876l-5.2.453c-.207.018-.398-.061-.525-.195a.611.611 0 0 1-.147-.273Zm-4.355-5.755L7.18 5.992a1.073 1.073 0 0 1 .553-1.208A9.21 9.21 0 0 1 11.788 3.5a1.073 1.073 0 0 1 1.155 1.056l.124 6.4c.035 1.004-1.123 1.537-1.823.779l-.403-.428Zm-4.6 2.13l4.68 2.328c.91.452.765 1.766-.219 2.01l-5.064 1.26a1.073 1.073 0 0 1-1.31-.8 9.171 9.171 0 0 1 .31-4.077 1.073 1.073 0 0 1 1.604-.72Zm4.614 4.73l1.84 4.927a1.073 1.073 0 0 1-.63 1.39 9.194 9.194 0 0 1-3.954.547 1.073 1.073 0 0 1-.98-1.32l1.363-5.122c.264-.996 1.696-1.132 2.161-.421Z" fill="currentColor"/>
  `,
  'vk': `
    <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.391 0 15.684 0Zm3.692 17.123h-1.744c-.66 0-.864-.525-2.05-1.727-1.033-1-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.118-5.335-3.202C4.624 10.857 4.03 8.57 4.03 8.096c0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.678.847 2.49 2.27 4.674 2.853 4.674.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.203.17-.407.44-.407h2.744c.373 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.254-1.406 2.151-3.574 2.151-3.574.119-.254.322-.491.762-.491h1.744c.525 0 .644.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.05.17.49-.085.744-.576.744Z" fill="currentColor"/>
  `,
  'line': `
    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386a.63.63 0 0 1-.63-.629V8.108a.63.63 0 0 1 .63-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755Zm-3.855 3.016a.633.633 0 0 1-.475.213.618.618 0 0 1-.63-.629V8.752l-2.18 3.544a.618.618 0 0 1-.524.316.618.618 0 0 1-.63-.629V8.108a.63.63 0 0 1 .63-.63.63.63 0 0 1 .63.63v3.028l2.184-3.505a.615.615 0 0 1 .481-.278.63.63 0 0 1 .63.63v3.874a.63.63 0 0 1-.116.022ZM8.882 12.85a.63.63 0 0 1-.63.629.63.63 0 0 1-.63-.629V8.108a.63.63 0 0 1 .63-.63.63.63 0 0 1 .63.63v4.742Zm-2.007.629H4.489a.63.63 0 0 1-.63-.629V8.108a.63.63 0 0 1 .63-.63.63.63 0 0 1 .63.63v4.113h1.756c.349 0 .63.285.63.63a.63.63 0 0 1-.63.628ZM24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.084.923.258 1.058.593.121.303.079.778.039 1.085l-.171 1.027c-.053.303-.242 1.186 1.039.647 1.281-.54 6.911-4.069 9.428-6.967C23.216 14.312 24 12.421 24 10.314Z" fill="currentColor"/>
  `,
  'soundcloud': `
    <path d="M1.175 12.225c-.051 0-.094.046-.101.1l-.233 2.154.233 2.105c.007.058.05.098.101.098.05 0 .09-.04.099-.098l.255-2.105-.27-2.154c0-.057-.045-.1-.09-.1m-.899.828c-.06 0-.091.037-.104.094L0 14.479l.165 1.308c0 .055.045.094.09.094s.089-.045.104-.104l.21-1.319-.21-1.334c0-.061-.044-.09-.09-.09m1.83-1.229c-.061 0-.12.045-.12.104l-.21 2.563.225 2.458c0 .06.045.12.12.12.06 0 .105-.061.12-.12l.24-2.458-.24-2.563c0-.06-.045-.104-.12-.104m.945-.089c-.075 0-.135.06-.15.135l-.193 2.64.21 2.544c.016.077.075.138.149.138.075 0 .135-.061.15-.15l.226-2.547-.227-2.625c0-.075-.06-.135-.135-.135m.93-.129c-.09 0-.149.075-.165.164l-.18 2.79.18 2.58c.016.09.075.149.165.149s.149-.06.165-.149l.21-2.58-.21-2.79c-.015-.089-.074-.149-.165-.149m1.065.445c-.09 0-.165.09-.18.18l-.15 2.355.165 2.52c.015.09.075.165.18.165.089 0 .164-.075.164-.165l.18-2.52-.18-2.355c-.015-.09-.075-.18-.165-.18m.87-1.005c-.105 0-.18.09-.195.195l-.135 3.36.15 2.535c0 .105.075.18.18.18s.18-.09.195-.195l.164-2.52-.164-3.36c0-.12-.09-.195-.18-.195m1.035.18c-.12 0-.21.09-.225.21l-.12 3.15.135 2.46c0 .12.09.21.21.21.105 0 .21-.09.21-.21l.15-2.46-.165-3.15c0-.12-.09-.21-.195-.21m.99-.555c-.135 0-.24.105-.255.24l-.09 3.63.105 2.43c0 .135.105.24.225.24.135 0 .24-.105.24-.24l.12-2.43-.12-3.63c-.015-.135-.105-.24-.24-.24m1.125.48c-.15 0-.255.12-.27.255l-.074 3.195.09 2.415c.014.15.12.255.255.255.149 0 .254-.105.27-.255l.09-2.415-.105-3.195c0-.15-.105-.27-.255-.27m1.065-.39c-.165 0-.285.135-.3.3L9.69 14.51l.075 2.385c.015.165.12.3.285.3.165 0 .285-.135.3-.3l.09-2.385-.09-3.645c0-.165-.135-.3-.285-.3m1.17-.645c-.18 0-.315.15-.33.33l-.06 4.275.075 2.34c0 .18.135.315.315.315.18 0 .315-.135.33-.315l.075-2.34-.075-4.275c-.015-.18-.15-.33-.315-.33m1.095.285c-.195 0-.33.164-.345.359l-.06 3.96.075 2.31c.015.18.165.33.345.33.195 0 .345-.15.359-.33l.075-2.31-.075-3.96c0-.21-.15-.359-.359-.359m1.155-.21c-.21 0-.36.18-.375.375l-.045 4.155.06 2.28c.015.195.165.36.359.36.21 0 .361-.18.375-.375l.075-2.265-.075-4.155c0-.21-.165-.375-.359-.375m1.185-.09c-.225 0-.39.18-.405.405l-.045 4.245.06 2.25c.016.21.18.39.405.39.21 0 .39-.195.405-.405l.06-2.235-.06-4.245c-.015-.21-.195-.405-.405-.405m7.14 2.55c-.24 0-.465.03-.69.075-.15-1.62-1.5-2.88-3.165-2.88-.42 0-.81.09-1.185.225-.135.06-.18.12-.18.24v5.67c0 .135.105.255.24.27h5.025c1.14 0 2.055-.93 2.055-2.07 0-1.14-.93-2.07-2.055-2.07" fill="currentColor"/>
  `,
  'google-podcast': `
    <path d="M12 0a1.44 1.44 0 0 0-1.44 1.44v2.88a1.44 1.44 0 1 0 2.88 0V1.44A1.44 1.44 0 0 0 12 0ZM1.44 8.64a1.44 1.44 0 1 0 0 2.88h2.88a1.44 1.44 0 0 0 0-2.88H1.44Zm17.28 0a1.44 1.44 0 1 0 0 2.88h2.88a1.44 1.44 0 0 0 0-2.88h-2.88ZM12 7.68a1.44 1.44 0 0 0-1.44 1.44v5.76a1.44 1.44 0 1 0 2.88 0V9.12A1.44 1.44 0 0 0 12 7.68ZM6.24 10.56a1.44 1.44 0 0 0-1.44 1.44v2.88a1.44 1.44 0 0 0 2.88 0V12a1.44 1.44 0 0 0-1.44-1.44Zm11.52 0a1.44 1.44 0 0 0-1.44 1.44v2.88a1.44 1.44 0 0 0 2.88 0V12a1.44 1.44 0 0 0-1.44-1.44Zm0 7.68a1.44 1.44 0 0 0-1.44 1.44v2.88a1.44 1.44 0 0 0 2.88 0v-2.88a1.44 1.44 0 0 0-1.44-1.44ZM12 17.28a1.44 1.44 0 0 0-1.44 1.44v3.84a1.44 1.44 0 1 0 2.88 0v-3.84A1.44 1.44 0 0 0 12 17.28ZM6.24 15.36a1.44 1.44 0 0 0-1.44 1.44v2.88a1.44 1.44 0 0 0 2.88 0V16.8a1.44 1.44 0 0 0-1.44-1.44Z" fill="currentColor"/>
  `,
  'apple-podcast': `
    <path d="M5.34 0A5.328 5.328 0 0 0 0 5.34v13.32A5.328 5.328 0 0 0 5.34 24h13.32A5.328 5.328 0 0 0 24 18.66V5.34A5.328 5.328 0 0 0 18.66 0H5.34Zm6.525 2.568c4.464 0 7.929 3.648 7.992 7.968a8.006 8.006 0 0 1-2.736 6.168c-.108.108-.36.216-.576.216-.252 0-.504-.108-.684-.324-.324-.432-.252-1.044.18-1.368a5.993 5.993 0 0 0 2.064-4.692c-.036-3.396-2.772-6.084-6.24-6.132-3.528-.036-6.42 2.808-6.42 6.312 0 1.86.792 3.54 2.088 4.692a.972.972 0 0 1 .18 1.368.97.97 0 0 1-.684.324.911.911 0 0 1-.576-.216 7.94 7.94 0 0 1-2.736-6.168c0-4.464 3.648-8.148 8.148-8.148Zm-.036 3.24c2.592 0 4.716 2.124 4.716 4.716 0 1.404-.612 2.664-1.584 3.528-.072.072-.144.144-.252.18a.475.475 0 0 1-.54-.252c-.108-.216-.036-.468.144-.612a3.703 3.703 0 0 0 1.224-2.736c0-2.052-1.668-3.72-3.72-3.72-2.052 0-3.72 1.668-3.72 3.72 0 1.044.432 1.992 1.116 2.664.144.144.252.396.144.612-.072.18-.288.288-.504.252a.69.69 0 0 1-.288-.18A4.706 4.706 0 0 1 7.1 10.524c0-2.592 2.124-4.716 4.728-4.716Zm-.072 3.24a1.471 1.471 0 1 0 0 2.944 1.471 1.471 0 0 0 0-2.944Zm0 3.672c.612 0 1.116.504 1.116 1.116v5.4c0 .612-.504 1.116-1.116 1.116-.612 0-1.116-.504-1.116-1.116v-5.4c0-.612.504-1.116 1.116-1.116Z" fill="currentColor"/>
  `,
  'apple': `
    <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09Zm3.24-3.701c.832-1.014 1.39-2.415 1.235-3.804-1.196.052-2.636.793-3.493 1.793-.753.87-1.415 2.272-1.235 3.61 1.326.104 2.676-.675 3.493-1.6Z" fill="currentColor"/>
  `,
  'google-play': `
    <path d="M22.018 13.298l-3.919 2.218-3.515-3.493 3.543-3.521 3.891 2.202a1.49 1.49 0 0 1 0 2.594zM1.337.924a1.486 1.486 0 0 0-.112.568v21.017c0 .217.045.419.124.6l11.155-11.087L1.337.924zm12.207 10.065l3.258-3.238L3.45.195a1.466 1.466 0 0 0-.946-.179l11.04 10.973zm0 2.067l-11 10.933c.298.036.612-.016.906-.183l13.324-7.54-3.23-3.21z" fill="currentColor"/>
  `,
  'wechat': `
    <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348ZM5.785 5.991a1.18 1.18 0 0 1 0 2.36 1.18 1.18 0 0 1 0-2.36Zm5.814 0a1.18 1.18 0 0 1 1.178 1.18 1.178 1.178 0 1 1-2.356 0c0-.652.528-1.18 1.178-1.18Zm3.163 2.267c2.018 0 3.862.766 5.146 1.958 1.33 1.234 2.092 2.963 2.092 4.837 0 1.706-.633 3.29-1.758 4.49a.5.5 0 0 0-.068.533l.497 1.058.073.169c0 .119-.098.211-.214.211a.418.418 0 0 1-.132-.03l-1.61-.7a.76.76 0 0 0-.56-.019c-.89.298-1.84.468-2.848.509-.269.011-.537.018-.807.018-2.018 0-3.862-.766-5.146-1.958-1.33-1.234-2.092-2.963-2.092-4.837 0-1.706.633-3.29 1.758-4.49l-.001-.001c1.292-1.422 3.175-2.392 5.306-2.677a8.92 8.92 0 0 1 1.181-.083l-.817.01Zm-2.136 2.924a.98.98 0 0 0 0 1.96.98.98 0 0 0 0-1.96Zm4.834 0a.98.98 0 0 0-.979.98c0 .54.44.98.98.98a.98.98 0 0 0 0-1.96Z" fill="currentColor"/>
  `,
  'apple-music': `
    <path d="M23.994 6.124a9.23 9.23 0 0 0-.24-2.19c-.317-1.31-1.062-2.31-2.18-3.043a5.022 5.022 0 0 0-1.877-.726 10.496 10.496 0 0 0-1.564-.15c-.04-.003-.083-.01-.124-.013H5.986c-.152.01-.303.017-.455.026-.747.043-1.49.123-2.193.4-1.336.53-2.3 1.452-2.865 2.78-.192.448-.292.925-.363 1.408-.056.392-.088.785-.1 1.18 0 .032-.007.062-.01.093v12.223c.01.14.017.283.027.424.05.815.154 1.624.497 2.373.65 1.42 1.738 2.353 3.234 2.8.42.127.856.187 1.293.228.555.053 1.11.06 1.667.06h11.03c.525 0 1.048-.034 1.57-.1.823-.106 1.597-.35 2.296-.81.84-.553 1.472-1.287 1.88-2.208.186-.42.293-.87.37-1.324.113-.675.138-1.358.137-2.04-.002-3.8 0-7.595-.003-11.393Zm-6.423 3.99v5.712c0 .417-.058.827-.244 1.206-.29.59-.76.962-1.388 1.14-.35.1-.706.157-1.07.173-.95.042-1.785-.6-1.943-1.536a1.97 1.97 0 0 1 1.562-2.254c.376-.085.755-.118 1.133-.18.34-.056.575-.24.66-.6.02-.085.028-.173.028-.26v-5.732a.488.488 0 0 0-.003-.053c-.018-.136-.08-.2-.215-.18a.89.89 0 0 0-.103.02l-5.02 1.07a.35.35 0 0 0-.273.334l-.01.26v7.12c0 .5-.077.99-.323 1.432-.303.545-.766.895-1.35 1.07-.327.097-.66.152-1 .165-.973.036-1.847-.56-2.016-1.52-.168-.957.36-1.89 1.29-2.192.422-.136.86-.17 1.296-.25.38-.07.594-.276.67-.673.012-.07.018-.14.018-.21v-8.77c0-.255.07-.476.265-.662.166-.158.373-.24.6-.286.478-.1.96-.19 1.44-.285L16.33 5.24c.263-.057.527-.11.796-.113.324-.004.508.18.515.505.003.087 0 .174 0 .262l-.07 4.22Z" fill="currentColor"/>
  `,

  // ========== Otros iconos UI ==========
  'fax': `
    <path d="M21 8V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2M3 8v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8M3 8h18m-4 4h.01M9 12h.01M9 16h6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'print': `
    <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6v-8Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'copy': `
    <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" stroke-width="2" fill="none"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'external-link': `
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6m4-3h6v6m-11 5L21 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'upload': `
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'refresh': `
    <path d="M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'log-out': `
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4m7 14 5-5-5-5m5 5H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'log-in': `
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4m-5-4 5-5-5-5m5 5H3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'image': `
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2" fill="none"/>
    <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" stroke-width="2" fill="none"/>
    <path d="m21 15-5-5L5 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'gift': `
    <path d="M20 12v10H4V12M22 7H2v5h20V7ZM12 22V7M12 7H7.5a2.5 2.5 0 1 1 0-5C11 2 12 7 12 7Zm0 0h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'globe': `
    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'map-pin': `
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z" stroke="currentColor" stroke-width="2" fill="none"/>
    <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2" fill="none"/>
  `,
  'target': `
    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
    <circle cx="12" cy="12" r="6" stroke="currentColor" stroke-width="2" fill="none"/>
    <circle cx="12" cy="12" r="2" stroke="currentColor" stroke-width="2" fill="none"/>
  `,
  'award': `
    <circle cx="12" cy="8" r="7" stroke="currentColor" stroke-width="2" fill="none"/>
    <path d="M8.21 13.89 7 23l5-3 5 3-1.21-9.12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'shield': `
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'shield-check': `
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" stroke="currentColor" stroke-width="2" fill="none"/>
    <path d="m9 12 2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'zap': `
    <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'trending-up': `
    <path d="m23 6-9.5 9.5-5-5L1 18M23 6v6m0-6h-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'trending-down': `
    <path d="m23 18-9.5-9.5-5 5L1 6M23 18v-6m0 6h-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'activity': `
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'layers': `
    <path d="m12 2 10 6v8l-10 6L2 16V8l10-6Zm0 20V8M2 8l10 6 10-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'grid': `
    <rect x="3" y="3" width="7" height="7" stroke="currentColor" stroke-width="2" fill="none"/>
    <rect x="14" y="3" width="7" height="7" stroke="currentColor" stroke-width="2" fill="none"/>
    <rect x="14" y="14" width="7" height="7" stroke="currentColor" stroke-width="2" fill="none"/>
    <rect x="3" y="14" width="7" height="7" stroke="currentColor" stroke-width="2" fill="none"/>
  `,
  'list': `
    <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'sidebar': `
    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2" fill="none"/>
    <path d="M9 3v18" stroke="currentColor" stroke-width="2" fill="none"/>
  `,
  'maximize': `
    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'minimize': `
    <path d="M4 14h6m0 0v6m0-6L3 21M20 10h-6m0 0V4m0 6 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'more-horizontal': `
    <circle cx="12" cy="12" r="1" fill="currentColor"/>
    <circle cx="19" cy="12" r="1" fill="currentColor"/>
    <circle cx="5" cy="12" r="1" fill="currentColor"/>
  `,
  'more-vertical': `
    <circle cx="12" cy="12" r="1" fill="currentColor"/>
    <circle cx="12" cy="5" r="1" fill="currentColor"/>
    <circle cx="12" cy="19" r="1" fill="currentColor"/>
  `,
  'loader': `
    <path d="M12 2v4m0 12v4m10-10h-4M6 12H2m15.07-5.07-2.83 2.83M9.76 14.24l-2.83 2.83m9.9 0-2.83-2.83M9.76 9.76 6.93 6.93" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'x': `
    <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'slash': `
    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
    <path d="m4.93 4.93 14.14 14.14" stroke="currentColor" stroke-width="2" fill="none"/>
  `,
  'eye-off': `
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'lock': `
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" stroke-width="2" fill="none"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'unlock': `
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" stroke-width="2" fill="none"/>
    <path d="M7 11V7a5 5 0 0 1 9.9-1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'key': `
    <path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777Zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'file': `
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <path d="M14 2v6h6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'file-text': `
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <path d="M14 2v6h6M16 13H8m8 4H8m2-8H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'archive': `
    <path d="M21 8v13H3V8M1 3h22v5H1V3Zm9 9h4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'inbox': `
    <path d="M22 12h-6l-2 3h-4l-2-3H2m20 0v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8l3.45-6.89A2 2 0 0 1 7.24 4h9.52a2 2 0 0 1 1.79 1.11L22 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'paperclip': `
    <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'save': `
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2ZM17 21v-8H7v8M7 3v5h8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'edit': `
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'user-plus': `
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M20 8v6m3-3h-6M8.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'user-minus': `
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M23 11h-6M8.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'user-check': `
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M8.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm8.5 0 2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'at-sign': `
    <circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="2" fill="none"/>
    <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'hash': `
    <path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'percent': `
    <path d="M19 5 5 19M6.5 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm11 11a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
} as const;

/**
 * Tipo union de todos los nombres de iconos disponibles.
 * Proporciona autocompletado en TypeScript para el prop `name` del componente Icon.
 */
export type IconName = keyof typeof ICON_PATHS;
