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
    <path d="M5 12h14m-7-7l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `,
  'arrow-left': `
    <path d="M19 12H5m7 7l-7-7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `,
  'arrow-external-right': `
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6m4-3h6v6m-11 5L21 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `,
  'arrow-external-left': `
    <path d="M6 13v6a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-6M3 9V3h6M3 3l11 11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `,
  'chevron-left': `
    <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `,
  'chevron-right': `
    <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `,
  'chevron-down': `
    <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `,
  'chevron-up': `
    <path d="M18 15l-6-6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `,

  // ========== Acciones ==========
  'close': `
    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `,
  'add': `
    <path d="M12 5v14m-7-7h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `,
  'less': `
    <path d="M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `,
  'search': `
    <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
    <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `,
  'check': `
    <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `,
  'circle-check': `
    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
    <path d="m9 12 2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `,

  // ========== Usuario e Identidad ==========
  'user': `
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `,
  'users': `
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `,
  'email': `
    <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" stroke-width="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `,
  'phone': `
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `,
  'password': `
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `,

  // ========== Interfaz ==========
  'home': `
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M9 22V12h6v10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `,
  'calendar': `
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
    <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `,
  'message': `
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `,
  'bell': `
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `,
  'cog': `
    <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
    <path d="M12 1v6m0 6v6m5.2-14l-1.7 4.6m-3 8.8L10.8 23M23 12h-6m-6 0H1m14-5.2l-4.6 1.7m-8.8 3L1 10.8M23 13.2l-4.6-1.7m-8.8-3L1 10.8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `,
  'settings': `
    <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `,
  'clock': `
    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
    <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `,
  'bin': `
    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `,

  // ========== Finanzas ==========
  'dollar': `
    <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `,
  'credit-card': `
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
    <path d="M1 10h22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `,
  'wallet': `
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4M3 5v14a2 2 0 0 0 2 2h16v-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="16" cy="15.5" r="1" fill="currentColor"/>
  `,
  'coin': `
    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
    <path d="M12 6v12m-3-9h4.5a1.5 1.5 0 1 1 0 3H9m0 3h4.5a1.5 1.5 0 1 1 0 3H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `,

  // ========== Medios ==========
  'eye': `
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
  `,
  'play': `
    <path d="m5 3 14 9-14 9V3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `,
  'camera': `
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2v11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="12" cy="13" r="4" stroke="currentColor" stroke-width="2"/>
  `,
  'video-camera': `
    <path d="M23 7l-7 5 7 5V7ZM16 5H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `,

  // ========== Dispositivos ==========
  'mobile': `
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
    <path d="M12 18h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `,
  'laptop': `
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
    <path d="M2 17h20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `,
  'desktop': `
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
    <path d="M8 21h8M12 17v4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `,

  // ========== Archivos y Documentos ==========
  'folder': `
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2v11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `,
  'bookmark': `
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `,
  'database': `
    <ellipse cx="12" cy="5" rx="9" ry="3" stroke="currentColor" stroke-width="2"/>
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `,
  'report': `
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M14 2v6h6M16 13H8m8 6H8m2-9H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `,

  // ========== Comunicación ==========
  'send': `
    <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `,
  'share': `
    <circle cx="18" cy="5" r="3" stroke="currentColor" stroke-width="2"/>
    <circle cx="6" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
    <circle cx="18" cy="19" r="3" stroke="currentColor" stroke-width="2"/>
    <path d="m8.59 13.51 6.83 3.98m-.01-10.98-6.82 3.98" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `,
  'link': `
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `,
  'wifi': `
    <path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `,

  // ========== Edición ==========
  'pencil': `
    <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `,
  'pencil-writing': `
    <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `,
  'pen': `
    <path d="m12 19 7-7 3 3-7 7-3-3ZM18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5ZM2 2l7.586 7.586" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="11" cy="11" r="2" stroke="currentColor" stroke-width="2"/>
  `,

  // ========== Gráficos y Análisis ==========
  'graph': `
    <path d="M3 3v18h18M7 16l4-6 4 6 6-9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `,
  'graph-ascend': `
    <path d="M3 17l6-6 4 4 8-8m0 0v6m0-6h-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `,
  'graph-descend': `
    <path d="M3 7l6 6 4-4 8 8m0 0v-6m0 6h-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `,
  'analytics-pie': `
    <path d="M21.21 15.89A10 10 0 1 1 8 2.83M22 12A10 10 0 0 0 12 2v10h10Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `,

  // ========== Marca y Utilidad ==========
  'star': `
    <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `,
  'heart': `
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `,
  'flag': `
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1v18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `,
  'tag': `
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82ZM7 7h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `,
  'filter': `
    <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `,
  'megaphone': `
    <path d="m3 11 18-5v12L3 13v-2Zm0 0h7M3.34 20.02l3.22-2.15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `,
  'support': `
    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3m.08 4h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `,
  'info': `
    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
    <path d="M12 16v-4m0-4h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `,
  'lightning': `
    <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `,
  'tools': `
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `,
  'briefcase': `
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `,
  'badge': `
    <circle cx="12" cy="8" r="6" stroke="currentColor" stroke-width="2"/>
    <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `,
  'care': `
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78ZM12 6v12m-6-6h12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `,
  'sync': `
    <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `,
  'code': `
    <path d="m16 18 6-6-6-6M8 6l-6 6 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `,
  'web': `
    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `,
  'mark': `
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z" stroke="currentColor" stroke-width="2"/>
    <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2"/>
  `,
  'test': `
    <path d="M9 11H3v10h6V11ZM15 1h-6v20h6V1ZM21 6h-6v15h6V6Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `,
  'design-tools': `
    <path d="M12 19l7-7 3 3-7 7-3-3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M2 2l7.586 7.586" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="11" cy="11" r="2" stroke="currentColor" stroke-width="2"/>
  `,
  'download': `
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `,

  // ========== Tema ==========
  'sun': `
    <circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="2"/>
    <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `,
  'moon': `
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `,
} as const;

/**
 * Tipo union de todos los nombres de iconos disponibles.
 * Proporciona autocompletado en TypeScript para el prop `name` del componente Icon.
 */
export type IconName = keyof typeof ICON_PATHS;
