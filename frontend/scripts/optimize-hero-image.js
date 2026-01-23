import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEMO_DIR = path.join(__dirname, '../public/assets/images/demo');
const SOURCE_IMAGE = process.argv[2];

if (!SOURCE_IMAGE) {
  console.error('Uso: node scripts/optimize-hero-image.js <ruta-imagen-fuente>');
  process.exit(1);
}

const SIZES = {
  small: 400,
  medium: 800,
  large: 1200
};

const FORMATS = ['avif', 'webp', 'jpg'];
const QUALITY = { avif: 80, webp: 85, jpg: 85 };

async function optimizeHeroImage() {
  console.log('Optimizando imagen hero...\n');
  console.log(`Fuente: ${SOURCE_IMAGE}`);
  console.log(`Destino: ${DEMO_DIR}\n`);

  let totalGenerated = 0;

  try {
    const inputBuffer = await fs.readFile(SOURCE_IMAGE);
    const metadata = await sharp(inputBuffer).metadata();
    
    console.log(`Imagen original: ${metadata.width}x${metadata.height}`);
    console.log(`Formato original: ${metadata.format}\n`);

    for (const [sizeName, width] of Object.entries(SIZES)) {
      console.log(`Generando tamaño ${sizeName} (${width}px)...`);
      
      for (const format of FORMATS) {
        const outputPath = path.join(DEMO_DIR, `hero-${sizeName}.${format}`);
        
        const sharpInstance = sharp(inputBuffer)
          .resize(width, null, { 
            withoutEnlargement: true,
            fit: 'cover'
          });
        
        if (format === 'avif') {
          await sharpInstance.avif({ quality: QUALITY.avif }).toFile(outputPath);
        } else if (format === 'webp') {
          await sharpInstance.webp({ quality: QUALITY.webp }).toFile(outputPath);
        } else if (format === 'jpg') {
          await sharpInstance.jpeg({ quality: QUALITY.jpg, mozjpeg: true }).toFile(outputPath);
        }
        
        const stats = await fs.stat(outputPath);
        const sizeKB = (stats.size / 1024).toFixed(2);
        console.log(`  ✓ hero-${sizeName}.${format} (${sizeKB} KB)`);
        totalGenerated++;
      }
      console.log('');
    }

    console.log(`✅ Optimización completada`);
    console.log(`   Total generadas: ${totalGenerated} imágenes`);
    console.log(`   Ubicación: ${DEMO_DIR}\n`);
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

optimizeHeroImage().catch(console.error);
