/**
 * Paths SVG de iconos del sistema de diseño Joinly.
 * Basado en el diseño de Figma: https://www.figma.com/design/8q36kcT9LEqoXs99ZBxfV5/Joinly
 *
 * Todos los iconos usan:
 * - viewBox="0 0 24 24"
 * - stroke="currentColor" (heredan el color del padre)
 * - stroke-width="2"
 * - stroke-linecap="round"
 * - stroke-linejoin="round"
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
    <path d="M12 6v12m-3-9h4.5a1.5 1.5 0 1 1 0 3H9m0 3h4.5a1.5 1.5 0 1 1 0 3H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
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

  // ========== Redes Sociales ==========
  'facebook': `
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3V2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'twitter': `
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'instagram': `
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="currentColor" stroke-width="2" fill="none"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37ZM17.5 6.5h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'linkedin': `
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6ZM2 9h4v12H2V9Zm2-6a2 2 0 1 1 0 4 2 2 0 0 1 0-4Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'youtube': `
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <path d="m9.75 15.02 5.75-3.27-5.75-3.27v6.54Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'dribbble': `
    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
    <path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85m19.5 1.9c-3.5-.93-6.63-.82-8.94 0-2.58.92-5.01 2.86-7.44 6.32" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'behance': `
    <path d="M1 9.5h9a4 4 0 0 1 0 8H1V9.5Zm0-6h8a3 3 0 0 1 0 6H1V3.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <path d="M19 4h-5v2h5V4ZM19 12.5a4 4 0 0 0-8 0c0 2.21 1.79 4.5 4 4.5s4-1.79 4-4m0 0h-8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'whatsapp': `
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'tiktok': `
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'google': `
    <path d="M12 11v2.4h3.97c-.16 1.03-1.2 3.02-3.97 3.02-2.39 0-4.34-1.98-4.34-4.42S9.61 7.58 12 7.58c1.36 0 2.27.58 2.79 1.08l1.9-1.83C15.47 5.69 13.89 5 12 5 8.13 5 5 8.13 5 12s3.13 7 7 7c4.04 0 6.72-2.84 6.72-6.84 0-.46-.05-.81-.11-1.16H12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'spotify': `
    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
    <path d="M8 15c2.5-1 5.5-1 8 0M7 12c3-1.2 7-1.2 10 0M6 9c3.5-1.5 8.5-1.5 12 0" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'product-hunt': `
    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
    <path d="M9 8v8m0-4h3.5a2 2 0 1 0 0-4H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'yelp': `
    <path d="M12 3v7l4 2M7 19l5-5M17 19l-5-5M12 10V3c-3 0-5 2-5 5s2 5 5 7c3-2 5-4 5-7s-2-5-5-5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'twitch': `
    <path d="M21 2H3v16h5v4l4-4h5l4-4V2Zm-10 9V7m5 4V7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'tumblr': `
    <path d="M14 22h2a4 4 0 0 0 4-4v-4h-6m0 0V10h4V6h-4V2H10v4c-4 0-4 4-4 4v4h4v8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'vk': `
    <path d="M2 12c0 4.5 2.5 7 7.5 7 1.5 0 2.5-.5 3.5-1.5l.5-1 .5 1c1 1 2 1.5 3.5 1.5 5 0 7.5-2.5 7.5-7 0-4.5-2.5-7-7.5-7H9.5C4.5 5 2 7.5 2 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'line': `
    <path d="M19 8.5c0-4.42-4.03-8-9-8s-9 3.58-9 8c0 3.95 3.5 7.27 8.22 7.9.32.07.75.21.86.48.1.25.07.63.03.88l-.14.82c-.04.25-.19.98.86.54s5.74-3.38 7.83-5.79A7.1 7.1 0 0 0 19 8.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'soundcloud': `
    <path d="M1 18v-2m3 2v-4m3 4V8m3 10V6m3 12V8m3 10v-6a5 5 0 0 1 10 0v6H13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'github': `
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7a5.44 5.44 0 0 0-1.5-3.75 5.07 5.07 0 0 0-.09-3.77s-1.18-.35-3.91 1.48a13.38 13.38 0 0 0-7 0c-2.73-1.83-3.91-1.48-3.91-1.48a5.07 5.07 0 0 0-.09 3.77 5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7a3.37 3.37 0 0 0-.94 2.58V22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'messenger': `
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <path d="m8 13 3-3 2 2 3-3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'reddit': `
    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
    <path d="M8.5 14.5c2 1.5 5 1.5 7 0M15.5 11a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1Zm-7 0a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1ZM18.5 8a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM15 2l1 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'pinterest': `
    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
    <path d="M8.5 14.5c.5 2.5 3 4 5.5 4 3.5 0 6-2.5 6-6 0-3.5-2.5-6-6-6-4 0-7 3-6 7 .5 2 2 3 3.5 3 1 0 1.5-.5 1.5-1.5 0-.5-.5-2.5-.5-3.5 0-1 1-2 2.5-2s2.5 1.5 2.5 3c0 2-1 3.5-2.5 3.5-1 0-1.5-.5-1.5-1.5L12 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'telegram': `
    <path d="m22 2-11 9M22 2 15 22l-4-9-9-4 20-7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'medium': `
    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2" fill="none"/>
    <circle cx="8" cy="12" r="2.5" stroke="currentColor" stroke-width="2" fill="none"/>
    <ellipse cx="14" cy="12" rx="1.5" ry="2.5" stroke="currentColor" stroke-width="2" fill="none"/>
    <path d="M19 9v6" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/>
  `,
  'snapchat': `
    <path d="M12 3a6 6 0 0 1 6 6c0 2-.5 3-1 4 1 .5 2 1 2 2-1 0-2 .5-2.5 1-.5.5-1 1.5-1.5 2-.5.5-1.5 1-3 1s-2.5-.5-3-1c-.5-.5-1-1.5-1.5-2C7 15.5 6 15 5 15c0-1 1-1.5 2-2-.5-1-1-2-1-4a6 6 0 0 1 6-6Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'discord': `
    <path d="M18 8.5c-.93-.65-2-1.12-3.12-1.35l-.43.87a9.29 9.29 0 0 0-5.9 0l-.43-.87A12.1 12.1 0 0 0 6 8.5c-2.52 3.68-3.19 7.27-2.85 10.8a12.16 12.16 0 0 0 3.69 1.87c.3-.4.57-.83.8-1.28a7.92 7.92 0 0 1-1.26-.61l.31-.24a8.67 8.67 0 0 0 7.62 0l.31.24c-.4.24-.82.44-1.26.61.23.45.5.88.8 1.28a12.08 12.08 0 0 0 3.69-1.87c.4-4.17-.67-7.72-2.85-10.8Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <path d="M9.5 14a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm5 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" stroke="currentColor" stroke-width="2" fill="none"/>
  `,
  'skype': `
    <path d="M12 3a9 9 0 0 1 9 9c0 1.5-.4 2.9-1 4.2a6 6 0 0 1-8.2 8.2A8.88 8.88 0 0 1 3 12a9 9 0 0 1 9-9Z" stroke="currentColor" stroke-width="2" fill="none"/>
    <path d="M8 14c.5 1.5 2 2.5 4 2.5s3.5-1 3.5-2.5c0-1.5-1-2.5-3.5-3-2-.4-3.5-1-3.5-2.5S10 6 12 6c2 0 3.5 1 4 2.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'google-podcast': `
    <circle cx="12" cy="12" r="1.5" stroke="currentColor" stroke-width="2" fill="none"/>
    <path d="M12 4v3m0 10v3M17 7v10M7 7v10m5-12.5v2m0 10v2M17 8v8M7 8v8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'apple-podcast': `
    <path d="M12 2a10 10 0 0 0-5.36 18.43A1 1 0 0 0 8 19.72l.22-.89A8 8 0 1 1 12 20a7.92 7.92 0 0 1-3.78-.95l-.22.88a1 1 0 0 0 .72 1.22A10 10 0 1 0 12 2Z" stroke="currentColor" stroke-width="2" fill="none"/>
    <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2" fill="none"/>
    <path d="M10 15c0 2 1 5 2 7 1-2 2-5 2-7a2 2 0 0 0-4 0Z" stroke="currentColor" stroke-width="2" fill="none"/>
  `,
  'apple': `
    <path d="M12 2c1.5 0 3 .5 4.5 2-3 1.5-3 6.5 0 8.5-1 2-2.5 4.5-4.5 6.5-1.5 1.5-3 1.5-5 0-3-3-3-7 0-12 1.5-2 3-3 5-5Zm1.5 0c0-1.5-.5-2-1.5-2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'google-play': `
    <path d="m3 3 9 9-9 9V3Zm0 9 9-9 9 9-9 9-9-9Zm9 0 9 9V3l-9 9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'wechat': `
    <path d="M8.5 13a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11Zm7 9a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11ZM6.5 6h.01M10.5 6h.01M13.5 16h.01M17.5 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `,
  'apple-music': `
    <circle cx="6" cy="18" r="3" stroke="currentColor" stroke-width="2" fill="none"/>
    <circle cx="18" cy="16" r="3" stroke="currentColor" stroke-width="2" fill="none"/>
    <path d="M18 16V4l-12 2v12m0-6 12-2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
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
