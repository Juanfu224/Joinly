import { execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { ensureMetricsDir, saveMetrics, formatBytes, checkStatus, ROOT, METRICS } from './metrics-utils.js';

const DIST_DIR = path.join(ROOT, 'dist/joinly/browser');
const GZIP_RATIOS = {
  main: 0.28,
  polyfills: 0.8,
  vendor: 0.35,
  lazy: 0.3,
};

async function buildProduction() {
  console.log('\n🔨 Ejecutando build de producción...\n');

  try {
    execSync('npm run build:prod', {
      cwd: ROOT,
      stdio: 'inherit',
    });

    console.log('\n✅ Build completado\n');
    return true;
  } catch (error) {
    console.error('\n❌ Error en el build:', error.message);
    return false;
  }
}

async function analyzeBundles() {
  console.log('📦 Analizando bundles...\n');

  try {
    await fs.access(DIST_DIR);
  } catch {
    console.error('❌ No existe el directorio dist. Ejecuta el build primero.');
    return null;
  }

  const files = await fs.readdir(DIST_DIR);
  const jsFiles = files.filter(f => f.endsWith('.js'));

  const bundleMetrics = {
    main: { size: 0, gzip: 0 },
    polyfills: { size: 0, gzip: 0 },
    vendor: { size: 0, gzip: 0 },
    lazy: [],
    totalSize: 0,
    totalGzip: 0,
    timestamp: new Date().toISOString(),
  };

  for (const file of jsFiles) {
    const filePath = path.join(DIST_DIR, file);
    const stats = await fs.stat(filePath);
    const size = stats.size;

    if (file.startsWith('main-')) {
      bundleMetrics.main.size = size;
      bundleMetrics.main.gzip = Math.round(size * GZIP_RATIOS.main);
      bundleMetrics.totalSize += size;
      bundleMetrics.totalGzip += bundleMetrics.main.gzip;
    } else if (file.startsWith('polyfills-')) {
      bundleMetrics.polyfills.size = size;
      bundleMetrics.polyfills.gzip = Math.round(size * GZIP_RATIOS.polyfills);
      bundleMetrics.totalSize += size;
      bundleMetrics.totalGzip += bundleMetrics.polyfills.gzip;
    } else if (file.startsWith('vendor-')) {
      bundleMetrics.vendor.size = size;
      bundleMetrics.vendor.gzip = Math.round(size * GZIP_RATIOS.vendor);
      bundleMetrics.totalSize += size;
      bundleMetrics.totalGzip += bundleMetrics.vendor.gzip;
    } else if (file.includes('chunk') || file.match(/^\d+\./)) {
      const chunk = { name: file, size, gzip: Math.round(size * GZIP_RATIOS.lazy) };
      bundleMetrics.lazy.push(chunk);
      bundleMetrics.totalSize += size;
      bundleMetrics.totalGzip += chunk.gzip;
    }
  }

  return bundleMetrics;
}

function printBundleMetrics(metrics) {
  console.log('📊 Métricas de Bundles:');
  console.log('┌───────────────────┬──────────────┬──────────────┬──────────────┐');
  console.log('│ Bundle           │ Raw Size     │ Gzip Size    │ Objetivo     │');
  console.log('├───────────────────┼──────────────┼──────────────┼──────────────┤');

  const mainStatus = checkStatus(metrics.main.gzip, 500000, true);
  const polyfillsStatus = checkStatus(metrics.polyfills.gzip, 10000, true);
  const vendorStatus = checkStatus(metrics.vendor.gzip, 300000, true);
  const totalStatus = checkStatus(metrics.totalGzip, 1000000, true);
  const lazySize = metrics.totalSize - metrics.main.size - metrics.polyfills.size - metrics.vendor.size;

  console.log(
    `│ Main             │ ${formatBytes(metrics.main.size).padEnd(12)} │ ${formatBytes(metrics.main.gzip).padEnd(12)} │ <500 KB      │ ${mainStatus}   │`,
  );
  console.log(
    `│ Polyfills        │ ${formatBytes(metrics.polyfills.size).padEnd(12)} │ ${formatBytes(metrics.polyfills.gzip).padEnd(12)} │ <10 KB       │ ${polyfillsStatus}   │`,
  );
  console.log(
    `│ Vendor           │ ${formatBytes(metrics.vendor.size).padEnd(12)} │ ${formatBytes(metrics.vendor.gzip).padEnd(12)} │ <300 KB      │ ${vendorStatus}   │`,
  );
  console.log(
    `│ Lazy Chunks      │ ${metrics.lazy.length.toString().padStart(2)} archivos   │ ${formatBytes(lazySize).padEnd(12)} │ -            │ -             │`,
  );
  console.log('├───────────────────┼──────────────┼──────────────┼──────────────┤');
  console.log(
    `│ TOTAL            │ ${formatBytes(metrics.totalSize).padEnd(12)} │ ${formatBytes(metrics.totalGzip).padEnd(12)} │ <1 MB        │ ${totalStatus}   │`,
  );
  console.log('└───────────────────┴──────────────┴──────────────┴───────────────┘\n');

  if (metrics.lazy.length > 0) {
    console.log('📂 Lazy Chunks:');
    metrics.lazy
      .sort((a, b) => b.size - a.size)
      .slice(0, 10)
      .forEach(chunk => {
        console.log(`   ${formatBytes(chunk.size).padStart(10)} - ${chunk.name}`);
      });
    console.log('');
  }
}

async function measureBundles(shouldBuild = true) {
  await ensureMetricsDir();

  console.log('🎯 Iniciando análisis de bundles...\n');

  if (shouldBuild) {
    const buildSuccess = await buildProduction();
    if (!buildSuccess) {
      process.exit(1);
    }
  }

  const metrics = await analyzeBundles();

  if (!metrics) {
    process.exit(1);
  }

  printBundleMetrics(metrics);
  await saveMetrics('bundles.json', metrics);

  const allPassed = metrics.main.gzip <= 500000 && metrics.totalGzip <= 1000000;

  if (allPassed) {
    console.log('🎉 ¡Los bundles cumplen los objetivos!\n');
  } else {
    console.log('⚠️  Algunos bundles exceden los objetivos. Considera:\n');
    console.log('   • Lazy loading de rutas no críticas');
    console.log('   • Tree shaking de dependencias no usadas');
    console.log('   • Optimización de imágenes y assets\n');
  }

  return metrics;
}

const args = process.argv.slice(2);
const skipBuild = args.includes('--skip-build');

measureBundles(!skipBuild)
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
