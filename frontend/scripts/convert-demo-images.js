import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEMO_DIR = path.join(__dirname, '../public/assets/images/demo');

const IMAGES = [
  'hero',
  'feature-save',
  'feature-share',
  'feature-manage',
  'step-1',
  'step-2'
];

const SIZES = {
  small: 400,
  medium: 800,
  large: 1200
};

const FORMATS = ['avif', 'webp', 'jpg'];
const QUALITY = { avif: 80, webp: 85, jpg: 85 };

async function convertImages() {
  console.log('Convirtiendo imágenes SVG a AVIF/WebP/JUG...\n');

  let totalConverted = 0;
  let errors = 0;

  for (const imgName of IMAGES) {
    console.log(`Procesando: ${imgName}`);

    for (const [sizeName, width] of Object.entries(SIZES)) {
      const svgPath = path.join(DEMO_DIR, `${imgName}-${sizeName}.svg`);

      try {
        const svgContent = await fs.readFile(svgPath);

        for (const format of FORMATS) {
          const outputPath = path.join(DEMO_DIR, `${imgName}-${sizeName}.${format}`);

          await sharp(svgContent)
            .toFormat(format, { quality: QUALITY[format] })
            .toFile(outputPath);

          const stats = await fs.stat(outputPath);
          const sizeKB = (stats.size / 1024).toFixed(2);
          console.log(`   ${imgName}-${sizeName}.${format} (${sizeKB} KB)`);
          totalConverted++;
        }
      } catch (error) {
        console.error(`   Error procesando ${imgName}-${sizeName}:`, error.message);
        errors++;
      }
    }

    console.log('');
  }

  console.log(`Conversión completada`);
  console.log(`   Total convertidas: ${totalConverted}`);
  console.log(`   Errores: ${errors}`);
  console.log(`   Ubicación: ${DEMO_DIR}\n`);
}

convertImages().catch(console.error);
