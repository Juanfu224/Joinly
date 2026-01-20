import { optimize } from 'svgo';
import fs from 'fs/promises';

const ICON_PATHS_FILE = './src/app/components/shared/icon/icon-paths.ts';

const svgoConfig = {
  plugins: [
    'preset-default',
    { name: 'removeViewBox', active: false },
    { name: 'removeDimensions', active: true },
    { name: 'removeUselessStrokeAndFill', active: false },
    { name: 'convertColors', params: { currentColor: true } },
    { name: 'mergePaths', active: true },
    { name: 'convertPathData', params: { floatPrecision: 2, transformPrecision: 2 } },
  ],
};

async function optimizeIconPaths() {
  const content = await fs.readFile(ICON_PATHS_FILE, 'utf-8');
  let optimizedContent = content;
  let totalSavings = 0;
  let iconsOptimized = 0;
  let totalIcons = 0;

  const iconRegex = /'([^']+)':\s*`([^`]+)`/g;

  for (const match of content.matchAll(iconRegex)) {
    totalIcons++;
    const [fullMatch, iconName, svgPath] = match;
    const fullSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">${svgPath.trim()}</svg>`;

    try {
      const result = optimize(fullSvg, svgoConfig);
      const optimizedPath = result.data.replace(/<\/?svg[^>]*>/g, '').trim();

      const savings = svgPath.length - optimizedPath.length;
      if (savings > 0) {
        // Reemplazo específico usando el match completo para evitar reemplazos duplicados
        optimizedContent = optimizedContent.replace(fullMatch, `'${iconName}': \`${optimizedPath}\``);
        totalSavings += savings;
        iconsOptimized++;
        console.log(`✓ ${iconName}: ${svgPath.length}B → ${optimizedPath.length}B (-${savings}B)`);
      }
    } catch (error) {
      console.error(`✗ Error optimizing ${iconName}:`, error.message);
    }
  }

  await fs.writeFile(ICON_PATHS_FILE, optimizedContent, 'utf-8');
  console.log(`\n✓ Optimizados: ${iconsOptimized}/${totalIcons} iconos`);
  console.log(`✓ Ahorrado: ${(totalSavings / 1024).toFixed(2)} KB`);
}

optimizeIconPaths().catch(console.error);
