# Guía para Capturar Imágenes del Style Guide

## Capturas Requeridas (7 imágenes)

Necesitas capturar las siguientes imágenes y guardarlas en:
```
/home/juanfu224/Documentos/DAW/Proyecto/Joinly/docs/design/images/
```

### 1. Captura Completa del Style Guide

**Archivo:** `style-guide-completo.png`

**Cómo capturar:**
1. Navega a: http://localhost:4200/style-guide
2. Abre DevTools (F12)
3. Ve al menú (···) en la esquina superior derecha de DevTools
4. Selecciona "More tools" → "Capture full size screenshot"
5. Guarda como: `style-guide-completo.png`

### 2. Sección de Botones

**Archivo:** `style-guide-botones.png`

**Qué capturar:**
- Todas las variantes de botones (primary, purple, blue, yellow, secondary, ghost)
- Todos los tamaños (xs, sm, md, lg, xl)
- Ejemplos con iconos (izquierda y derecha)
- Estados (normal, disabled)

**Cómo capturar:**
1. Navega a: http://localhost:4200/style-guide
2. Haz scroll hasta la sección "Botones"
3. En DevTools (Elements panel), haz clic derecho en el `<section>` de botones
4. Selecciona "Capture node screenshot"
5. Guarda como: `style-guide-botones.png`

### 3. Sección de Tarjetas

**Archivo:** `style-guide-tarjetas.png`

**Qué capturar:**
- Tarjetas de ventajas (feature)
- Tarjetas de acción (action)
- Tarjetas de información (info)
- Tarjetas de lista (list)
- Tarjetas especializadas (grupo, suscripción, miembro)

**Cómo capturar:**
1. Haz scroll hasta las secciones de tarjetas
2. Puede necesitar capturar múltiples secciones y combinarlas
3. Guarda como: `style-guide-tarjetas.png`

### 4. Sección de Formularios

**Archivo:** `style-guide-formularios.png`

**Qué capturar:**
- Form Input (todos los tipos: text, email, password, number, tel, url)
- Form Textarea
- Form Select
- Form Checkbox
- Form Radio Group (vertical e inline)
- Estados: normal, con ayuda, con error, requerido, disabled

**Cómo capturar:**
1. Captura cada tipo de input
2. Combina en una imagen o captura varias secciones
3. Guarda como: `style-guide-formularios.png`

### 5. Sección de Navegación

**Archivo:** `style-guide-navegacion.png`

**Qué capturar:**
- Breadcrumbs con diferentes niveles (2, 3, 4 niveles)
- Sistema de Tabs con pestañas activas e inactivas

**Cómo capturar:**
1. Captura la sección completa de navegación
2. Guarda como: `style-guide-navegacion.png`

### 6. Sección de Feedback (Alertas y Toasts)

**Archivo:** `style-guide-feedback.png`

**Qué capturar:**
- Alertas estáticas (success, error, warning, info)
- Alertas dismissibles
- Toasts visuales (success, error, warning, info)

**Cómo capturar:**
1. Captura las secciones de "Alertas" y "Toasts"
2. Haz clic en los botones para que aparezcan los toasts
3. Guarda como: `style-guide-feedback.png`

### 7. Sección de Comunicación entre Componentes

**Archivo:** `style-guide-comunicacion.png`

**Qué capturar:**
- Componentes Notification Sender y Receiver
- Lista de características implementadas

**Cómo capturar:**
1. Captura la sección "Comunicación entre Componentes"
2. Guarda como: `style-guide-comunicacion.png`

## Cómo Usar DevTools de Chrome para Capturas

### Método 1: Captura de nodo específico (RECOMENDADO)
1. Abre DevTools (F12)
2. Ve al panel "Elements"
3. Haz clic derecho en el elemento HTML que quieres capturar
4. Selecciona "Capture node screenshot"
5. La imagen se descarga automáticamente

### Método 2: Captura completa de página scrolleable
1. Abre DevTools (F12)
2. Ve a "Settings" (F1 o gear icon)
3. Habilita: "Experiments" → "Screenshots"
4. Ve al menú (···) de DevTools
5. Selecciona "Capture full size screenshot"
6. La imagen incluye toda la página scrolleable

### Método 3: Captura de área específica
1. Abre DevTools (F12)
2. Ve al menú (···)
3. Selecciona "More tools" → "Capture area screenshot"
4. Dibuja el rectángulo del área a capturar

## Verificación de Capturas

Antes de continuar, verifica que:

- ✅ Todas las imágenes tienen buena resolución (mínimo 1920px de ancho)
- ✅ Los textos son legibles y nítidos
- ✅ Los colores son correctos (sin comprimir excesivamente)
- ✅ Los nombres de archivo son correctos
- ✅ Los tamaños de archivo son razonables (< 500KB cada una)
- ✅ Las imágenes están en el directorio correcto

## Solución de Problemas

### Las imágenes aparecen oscuras o con colores incorrectos

**Solución:**
1. Ve a DevTools → Rendering → "Emulate CSS media feature prefers-color-scheme"
2. Asegúrate que esté en "No emulation" o "prefers-color-scheme: light"

### El texto aparece borroso

**Solución:**
1. Asegúrate de que la captura está al 100% de zoom (Ctrl + 0)
2. Usa "Capture node screenshot" en lugar de captura de pantalla del sistema

### Las imágenes son demasiado grandes

**Solución:**
1. Usa "Capture node screenshot" en lugar de "full size screenshot"
2. Comprime las imágenes con una herramienta como TinyPNG (online)

## Una vez completadas todas las capturas

Ejecuta el siguiente comando para verificar que todas las imágenes existen:

```bash
ls -lh /home/juanfu224/Documentos/DAW/Proyecto/Joinly/docs/design/images/style-guide-*.png
```

Deberías ver 7 archivos con tamaños razonables.
