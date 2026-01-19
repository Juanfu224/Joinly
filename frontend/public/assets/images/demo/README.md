# Imágenes de Demostración - Joinly

## Estructura de archivos

Cada imagen tiene múltiples versiones:
- `{nombre}-small.{formato}` - 400px (móvil)
- `{nombre}-medium.{formato}` - 800px (tablet)
- `{nombre}-large.{formato}` - 1200px (desktop)

## Formatos

- **AVIF**: Mejor compresión, navegadores modernos (Chrome 85+, Firefox 93+, Safari 16+)
- **WebP**: Buena compresión, amplio soporte (Chrome 17+, Firefox 65+, Safari 14+)
- **JPG**: Fallback universal para navegadores antiguos

## Conversión de SVG a formatos de imagen

### Opción 1: Squoosh (Recomendado para pocas imágenes)
1. Abre https://squoosh.app/
2. Arrastra cada SVG
3. Selecciona el formato de salida (AVIF, WebP, JPG)
4. Ajusta calidad al 80-85%
5. Descarga y renombra según convención

### Opción 2: Sharp CLI (Recomendado para batch)
```bash
npm install -g sharp-cli

# Convertir a WebP
sharp -i hero-large.svg -o hero-large.webp -f webp --quality 85

# Convertir a AVIF
sharp -i hero-large.svg -o hero-large.avif -f avif --quality 80

# Convertir a JPG
sharp -i hero-large.svg -o hero-large.jpg -f jpg --quality 85
```

### Opción 3: ImageMagick
```bash
# Convertir SVG a JPG
convert hero-large.svg -quality 85 hero-large.jpg

# Nota: Para AVIF/WebP, usar libvips o ffmpeg
```

## Tamaños recomendados

| Tipo | Ancho | Uso |
|------|-------|-----|
| small | 400px | Móviles < 480px |
| medium | 800px | Tablets 480px - 1024px |
| large | 1200px | Desktop > 1024px |

## Peso máximo recomendado

Cada imagen debe pesar **menos de 200KB** en su versión más grande.

Ejemplo de pesos típicos para una imagen 1200px:
- AVIF: 30-50KB
- WebP: 50-80KB  
- JPG: 80-150KB
