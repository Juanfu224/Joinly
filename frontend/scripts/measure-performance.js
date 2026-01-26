import { execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { ensureMetricsDir, saveMetrics, formatTime, checkStatus, ROOT, METRICS } from './metrics-utils.js';

async function runLighthouse(url) {
  console.log(`\n🚀 Ejecutando Lighthouse para: ${url}\n`);

  try {
    execSync(`npx lighthouse "${url}" --output=json --output=html --chrome-flags="--headless"`, {
      cwd: ROOT,
      stdio: 'inherit',
    });

    console.log('\n✅ Lighthouse completado\n');
    return true;
  } catch (error) {
    console.error('\n❌ Error ejecutando Lighthouse:', error.message);
    return false;
  }
}

async function parseLighthouseJson(jsonPath) {
  try {
    const content = await fs.readFile(jsonPath, 'utf-8');
    const data = JSON.parse(content);

    const categories = data.categories;
    const audits = data.audits;

    const metrics = {
      performance: Math.round(categories.performance.score * 100),
      accessibility: Math.round(categories.accessibility.score * 100),
      bestPractices: Math.round(categories['best-practices'].score * 100),
      seo: Math.round(categories.seo.score * 100),
      fcp: audits['first-contentful-paint'].numericValue,
      lcp: audits['largest-contentful-paint'].numericValue,
      tbt: audits['total-blocking-time'].numericValue,
      cls: audits['cumulative-layout-shift'].numericValue,
      si: audits['speed-index'].numericValue,
      timestamp: new Date().toISOString(),
    };

    return metrics;
  } catch (error) {
    console.error('Error parseando JSON de Lighthouse:', error.message);
    return null;
  }
}

function printMetricsTable(metrics) {
  console.log('📊 Métricas de Lighthouse:');
  console.log('┌─────────────────────┬─────────┬──────────────┬───────────────┐');
  console.log('│ Métrica            │ Actual  │ Objetivo     │ Estado        │');
  console.log('├─────────────────────┼─────────┼──────────────┼───────────────┤');

  console.log(`│ Performance         │ ${metrics.performance.toString().padEnd(7)} │ >80          │ ${checkStatus(metrics.performance, 80)}           │`);
  console.log(
    `│ Accessibility        │ ${metrics.accessibility.toString().padEnd(7)} │ >90          │ ${checkStatus(metrics.accessibility, 90)}           │`,
  );
  console.log(
    `│ Best Practices      │ ${metrics.bestPractices.toString().padEnd(7)} │ >90          │ ${checkStatus(metrics.bestPractices, 90)}           │`,
  );
  console.log(`│ SEO                 │ ${metrics.seo.toString().padEnd(7)} │ >90          │ ${checkStatus(metrics.seo, 90)}           │`);
  console.log(`│ FCP                 │ ${formatTime(metrics.fcp).padEnd(7)} │ <1.8s        │ ${checkStatus(metrics.fcp, 1800, true)}           │`);
  console.log(`│ LCP                 │ ${formatTime(metrics.lcp).padEnd(7)} │ <2.5s        │ ${checkStatus(metrics.lcp, 2500, true)}           │`);
  console.log(`│ TBT                 │ ${formatTime(metrics.tbt).padEnd(7)} │ <0.2s        │ ${checkStatus(metrics.tbt, 200, true)}           │`);
  console.log(`│ CLS                 │ ${metrics.cls.toFixed(3).padEnd(7)} │ <0.1         │ ${checkStatus(metrics.cls, 0.1, true)}           │`);
  console.log('└─────────────────────┴─────────┴──────────────┴───────────────┘\n');
}

async function measurePerformance(url = 'http://localhost:4200') {
  await ensureMetricsDir();

  console.log('🎯 Iniciando medición de performance...');

  const success = await runLighthouse(url);

  if (!success) {
    process.exit(1);
  }

  const reportFiles = await fs.readdir(ROOT).then(files =>
    files.filter(f => f.startsWith('lighthouse-') && f.endsWith('.report.json')),
  );

  if (reportFiles.length === 0) {
    console.error('❌ No se encontró el reporte de Lighthouse');
    process.exit(1);
  }

  const latestReport = reportFiles[reportFiles.length - 1];
  const reportPath = path.join(ROOT, latestReport);

  const metrics = await parseLighthouseJson(reportPath);

  if (!metrics) {
    process.exit(1);
  }

  printMetricsTable(metrics);
  await saveMetrics('performance.json', metrics);

  const allPassed =
    metrics.performance >= 80 &&
    metrics.accessibility >= 90 &&
    metrics.bestPractices >= 90 &&
    metrics.seo >= 90 &&
    metrics.fcp <= 1800 &&
    metrics.lcp <= 2500 &&
    metrics.tbt <= 200 &&
    metrics.cls <= 0.1;

  if (allPassed) {
    console.log('🎉 ¡Todas las métricas cumplen los objetivos!\n');
  } else {
    console.log('⚠️  Algunas métricas no cumplen los objetivos. Revisa el reporte HTML.\n');
  }

  return metrics;
}

const args = process.argv.slice(2);
const url = args[0] || 'http://localhost:4200';

measurePerformance(url)
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
