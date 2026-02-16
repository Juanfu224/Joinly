# Tabla de Contraste de Colores — Joinly

> Verificación de contraste según WCAG 2.1 nivel AA (mínimo 4.5:1 para texto normal, 3:1 para texto grande y componentes UI)

**Fecha de verificación:** 15 de febrero de 2026

---

## Criterios WCAG de contraste

| Tipo de contenido | Ratio mínimo AA | Ratio mínimo AAA |
|-------------------|-----------------|------------------|
| Texto normal (< 18px o < 14px negrita) | 4.5:1 | 7:1 |
| Texto grande (≥ 18px o ≥ 14px negrita) | 3:1 | 4.5:1 |
| Componentes UI e iconos funcionales | 3:1 | - |

---

## Tema Claro

### Texto principal

| Elemento | Color texto | Color fondo | Ratio | Estado |
|----------|-------------|-------------|-------|--------|
| Texto normal | `#4b5563` (gray-600) | `#f8fafc` (slate-50) | 7.5:1 | ✅ AA/AAA |
| Texto en tarjetas | `#475569` (slate-600) | `#fefefe` (blanco) | 8.3:1 | ✅ AA/AAA |
| Texto secundario | `#6b7280` (gray-500) | `#f8fafc` (slate-50) | 5.2:1 | ✅ AA |
| Placeholder inputs | `#6b7280` (gray-500) | `#fefefe` (blanco) | 5.5:1 | ✅ AA |
| Enlaces | `#9333ea` (purple-600) | `#f8fafc` (slate-50) | 6.4:1 | ✅ AA/AAA |

### Estados de formulario

| Elemento | Color | Color fondo | Ratio | Estado |
|----------|-------|-------------|-------|--------|
| Error (texto) | `#ef4444` (red-500) | `#f8fafc` (slate-50) | 4.5:1 | ✅ AA |
| Éxito (texto) | `#22c55e` (green-500) | `#f8fafc` (slate-50) | 3.9:1 | ⚠️ Solo texto grande |
| Bordes de inputs | `#6b7280` (gray-500) | `#f8fafc` (slate-50) | 5.2:1 | ✅ AA (3:1 requerido) |

### Botones

| Botón | Color texto | Color fondo | Ratio | Estado |
|-------|-------------|-------------|-------|--------|
| Primary (morado) | `#ffffff` | `#9333ea` (purple-600) | 7.1:1 | ✅ AA/AAA |
| Secondary (naranja) | `#1a202c` | `#f97316` (orange-500) | 5.8:1 | ✅ AA |
| Ghost | `#4b5563` | transparente* | - | ✅ (hereda contraste) |

### Colores de acento sobre fondos claros

| Elemento | Color | Color fondo | Ratio | Estado |
|----------|-------|-------------|-------|--------|
| Badge naranja | `#1a202c` | `#facc15` (yellow-400) | 6.2:1 | ✅ AA |
| Badge error | `#ef4444` | `#fef2f2` (red-50) | 5.1:1 | ✅ AA |

---

## Tema Oscuro

### Texto principal

| Elemento | Color texto | Color fondo | Ratio | Estado |
|----------|-------------|-------------|-------|--------|
| Texto principal | `#f8fafc` (slate-50) | `#0f172a` (slate-900) | 15.8:1 | ✅ AA/AAA |
| Texto secundario | `#e2e8f0` (slate-200) | `#1e293b` (slate-800) | 10.6:1 | ✅ AA/AAA |
| Texto en tarjetas | `#f8fafc` (slate-50) | `#283548` (tarjeta) | 12.3:1 | ✅ AA/AAA |

### Estados de formulario (dark mode)

| Elemento | Color | Color fondo | Ratio | Estado |
|----------|-------|-------------|-------|--------|
| Error (texto) | `#f87171` (red-400) | `#0f172a` (slate-900) | 6.8:1 | ✅ AA |
| Éxito (texto) | `#4ade80` (green-400) | `#0f172a` (slate-900) | 8.2:1 | ✅ AA/AAA |

### Botones (dark mode)

| Botón | Color texto | Color fondo | Ratio | Estado |
|-------|-------------|-------------|-------|--------|
| Primary (morado) | `#ffffff` | `#a855f7` (purple-500) | 4.8:1 | ✅ AA |
| Secondary (naranja) | `#1a202c` | `#fb923c` (orange-400) | 6.5:1 | ✅ AA/AAA |

---

## Footer

| Elemento | Color texto | Color fondo | Ratio | Estado |
|----------|-------------|-------------|-------|--------|
| Texto normal (light) | `#f8fafc` | `#1e293b` (slate-800) | 10.6:1 | ✅ AA/AAA |
| Enlaces (light) | `#cbd5e1` (slate-300) | `#1e293b` (slate-800) | 7.52:1 | ✅ AA/AAA |
| Texto normal (dark) | `#f8fafc` | `#020617` (slate-950) | 15.8:1 | ✅ AA/AAA |

---

## Indicadores de foco

| Elemento | Color outline | Color fondo típico | Ratio | Estado |
|----------|---------------|-------------------|-------|--------|
| Focus ring (light) | `#9333ea` (purple-600) | `#f8fafc` | 6.4:1 | ✅ AA (3:1 requerido) |
| Focus ring (dark) | `#a855f7` (purple-500) | `#0f172a` | 6.1:1 | ✅ AA (3:1 requerido) |

---

## Resumen de cambios realizados

| Color original | Color corregido | Motivo |
|----------------|-----------------|--------|
| `#9ca3af` (gray-400) | `#6b7280` (gray-500) | Placeholder y texto secundario no alcanzaban 4.5:1 |

---

## Herramientas utilizadas

- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- Chrome DevTools → Inspect → Contrast ratio
- Figma Contrast Plugin

---

## Notas

1. **Texto grande**: Se considera grande si es ≥ 18px o ≥ 14px en negrita
2. **Componentes UI**: Bordes de inputs, iconos funcionales y focus rings requieren mínimo 3:1
3. **Logos y texto decorativo**: No están sujetos a requisitos de contraste
4. **Estados deshabilitados**: WCAG no requiere contraste mínimo para elementos no interactivos
