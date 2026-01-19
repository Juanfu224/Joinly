/**
 * Script para generar imágenes de demostración en múltiples formatos y tamaños
 * 
 * Uso: node scripts/generate-demo-images.js
 * 
 * Genera placeholders SVG que luego pueden ser convertidos a:
 * - AVIF (mejor compresión, navegadores modernos)
 * - WebP (buena compresión, amplio soporte)
 * - JPG (fallback universal)
 * 
 * Tamaños generados:
 * - small: 400px
 * - medium: 800px
 * - large: 1200px
 * 
 * NOTA: Para producción, usar herramientas como:
 * - Squoosh (https://squoosh.app/) 
 * - sharp-cli para conversión batch
 * - ImageOptim / FileOptimizer
 */

import fs from 'fs/promises';
import path from 'path';

const OUTPUT_DIR = './public/assets/images/demo';

// Definición de imágenes de demostración
const DEMO_IMAGES = [
  {
    name: 'hero',
    description: 'Imagen hero principal',
    aspectRatio: '16:9',
    colors: {
      bg: '#f8f5f2',
      accent: '#7c3aed',
      secondary: '#f97316'
    }
  },
  {
    name: 'feature-share',
    description: 'Compartir suscripciones',
    aspectRatio: '16:9',
    colors: {
      bg: '#fef3e6',
      accent: '#f97316',
      secondary: '#7c3aed'
    }
  },
  {
    name: 'feature-save',
    description: 'Ahorro en grupo',
    aspectRatio: '16:9',
    colors: {
      bg: '#f3e8ff',
      accent: '#7c3aed',
      secondary: '#10b981'
    }
  },
  {
    name: 'feature-manage',
    description: 'Gestión de grupos',
    aspectRatio: '4:3',
    colors: {
      bg: '#e0f2fe',
      accent: '#3b82f6',
      secondary: '#f97316'
    }
  },
  {
    name: 'step-1',
    description: 'Paso 1: Registro',
    aspectRatio: '1:1',
    colors: {
      bg: '#fef3e6',
      accent: '#f97316',
      secondary: '#7c3aed'
    }
  },
  {
    name: 'step-2',
    description: 'Paso 2: Crear grupo',
    aspectRatio: '1:1',
    colors: {
      bg: '#f3e8ff',
      accent: '#7c3aed',
      secondary: '#f97316'
    }
  }
];

// Tamaños a generar
const SIZES = {
  small: 400,
  medium: 800,
  large: 1200
};

/**
 * Genera un placeholder SVG con el diseño de Joinly
 */
function generatePlaceholderSVG(image, width) {
  const ratio = image.aspectRatio.split(':').map(Number);
  const height = Math.round(width * (ratio[1] / ratio[0]));
  
  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${image.colors.bg}"/>
  
  <!-- Patrón decorativo -->
  <circle cx="${width * 0.15}" cy="${height * 0.3}" r="${width * 0.08}" fill="${image.colors.accent}" opacity="0.2"/>
  <circle cx="${width * 0.85}" cy="${height * 0.7}" r="${width * 0.1}" fill="${image.colors.secondary}" opacity="0.15"/>
  
  <!-- Elemento central -->
  <rect x="${width * 0.3}" y="${height * 0.35}" width="${width * 0.4}" height="${height * 0.3}" rx="${width * 0.02}" fill="${image.colors.accent}" opacity="0.9"/>
  
  <!-- Líneas decorativas -->
  <rect x="${width * 0.35}" y="${height * 0.42}" width="${width * 0.3}" height="${height * 0.03}" rx="${width * 0.005}" fill="white" opacity="0.9"/>
  <rect x="${width * 0.35}" y="${height * 0.48}" width="${width * 0.2}" height="${height * 0.02}" rx="${width * 0.005}" fill="white" opacity="0.6"/>
  <rect x="${width * 0.35}" y="${height * 0.53}" width="${width * 0.25}" height="${height * 0.02}" rx="${width * 0.005}" fill="white" opacity="0.6"/>
  
  <!-- Icono/Logo simplificado -->
  <g transform="translate(${width * 0.46}, ${height * 0.75})">
    <circle r="${width * 0.015}" fill="${image.colors.secondary}"/>
    <circle cx="${width * 0.04}" r="${width * 0.012}" fill="${image.colors.accent}" opacity="0.6"/>
    <circle cx="${width * 0.02}" cy="${width * 0.035}" r="${width * 0.01}" fill="${image.colors.secondary}" opacity="0.4"/>
  </g>
</svg>`;
}

/**
 * Genera un archivo README con instrucciones de conversión
 */
function generateReadme() {
  return `# Imágenes de Demostración - Joinly

## Estructura de archivos

Cada imagen tiene múltiples versiones:
- \`{nombre}-small.{formato}\` - 400px (móvil)
- \`{nombre}-medium.{formato}\` - 800px (tablet)
- \`{nombre}-large.{formato}\` - 1200px (desktop)

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
\`\`\`bash
npm install -g sharp-cli

# Convertir a WebP
sharp -i hero-large.svg -o hero-large.webp -f webp --quality 85

# Convertir a AVIF
sharp -i hero-large.svg -o hero-large.avif -f avif --quality 80

# Convertir a JPG
sharp -i hero-large.svg -o hero-large.jpg -f jpg --quality 85
\`\`\`

### Opción 3: ImageMagick
\`\`\`bash
# Convertir SVG a JPG
convert hero-large.svg -quality 85 hero-large.jpg

# Nota: Para AVIF/WebP, usar libvips o ffmpeg
\`\`\`

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
`;
}

async function main() {
  console.log('🖼️  Generando imágenes de demostración...\n');

  // Crear directorio si no existe
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  // Generar cada imagen en todos los tamaños
  for (const image of DEMO_IMAGES) {
    console.log(`📷 Procesando: ${image.name}`);
    
    for (const [sizeName, width] of Object.entries(SIZES)) {
      const svg = generatePlaceholderSVG(image, width);
      const filename = `${image.name}-${sizeName}.svg`;
      const filepath = path.join(OUTPUT_DIR, filename);
      
      await fs.writeFile(filepath, svg, 'utf-8');
      console.log(`   ✓ ${filename}`);
    }
  }

  // Generar README
  const readme = generateReadme();
  await fs.writeFile(path.join(OUTPUT_DIR, 'README.md'), readme, 'utf-8');
  console.log('\n📄 README.md generado');

  console.log('\n✅ Imágenes generadas correctamente');
  console.log(`📁 Ubicación: ${OUTPUT_DIR}`);
  console.log('\n⚠️  IMPORTANTE: Convierte los SVG a AVIF, WebP y JPG usando Squoosh o sharp-cli');
  console.log('   Ver README.md para instrucciones detalladas\n');
}

main().catch(console.error);
