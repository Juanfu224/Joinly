import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DESIGN_IMAGES_DIR = path.join(__dirname, '../../docs/design/images');

async function optimizePNGs() {
  console.log('Optimizando PNGs de documentación...\n');

  const files = await fs.readdir(DESIGN_IMAGES_DIR);
  const pngFiles = files.filter(f => f.endsWith('.png'));

  let totalOptimized = 0;
  let totalSaved = 0;
  let errors = 0;

  for (const file of pngFiles) {
    const inputPath = path.join(DESIGN_IMAGES_DIR, file);

    try {
      const inputStats = await fs.stat(inputPath);
      const originalSize = inputStats.size;

      const originalSizeKB = (originalSize / 1024).toFixed(2);

      if (originalSize <= 200 * 1024) {
        console.log(`${file}`);
        console.log(`  Ya está optimizado: ${originalSizeKB} KB (< 200KB)\n`);
        totalOptimized++;
        continue;
      }

      const buffer = await fs.readFile(inputPath);

      const result = await sharp(buffer)
        .png({
          quality: 85,
          compressionLevel: 9,
          adaptiveFiltering: true
        })
        .toBuffer();

      const outputPath = path.join(DESIGN_IMAGES_DIR, file);
      await fs.writeFile(outputPath, result);

      const optimizedSize = result.length;
      const saved = originalSize - optimizedSize;
      const percentSaved = ((saved / originalSize) * 100).toFixed(1);

      console.log(`${file}`);
      console.log(`  Original: ${originalSizeKB} KB`);
      console.log(`  Optimizado: ${(optimizedSize / 1024).toFixed(2)} KB`);
      console.log(`  Ahorro: ${(saved / 1024).toFixed(2)} KB (${percentSaved}%)\n`);

      totalOptimized++;
      totalSaved += saved;
    } catch (error) {
      console.error(`Error procesando ${file}:`, error.message);
      errors++;
    }
  }

  console.log(`Optimización completada`);
  console.log(`   Total optimizados: ${totalOptimized}`);
  console.log(`   Total ahorrado: ${(totalSaved / 1024).toFixed(2)} KB`);
  console.log(`   Errores: ${errors}\n`);
}

optimizePNGs().catch(console.error);
