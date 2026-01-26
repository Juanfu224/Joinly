import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { METRICS, formatBytes, formatTime, checkStatus } from './metrics-utils.js';

const METRICS_DIR = METRICS;

async function readMetricsFile(filename) {
  const filePath = path.join(METRICS_DIR, filename);

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const history = JSON.parse(content);
    return history[history.length - 1];
  } catch (error) {
    console.error(`Error leyendo ${filename}:`, error.message);
    return null;
  }
}

async function generatePerformanceSection() {
  const metrics = await readMetricsFile('performance.json');

  if (!metrics) {
    return '⚠️  No hay métricas de performance disponibles.\nEjecuta: npm run metrics:performance';
  }

  let content = 'Métricas de Performance:\n\n';
  content += '┌─────────────────────┬─────────┬──────────────┬───────────────┐\n';
  content += '│ Métrica            │ Actual  │ Objetivo     │ Estado        │\n';
  content += '├─────────────────────┼─────────┼──────────────┼───────────────┤\n';
  content += `│ Performance         │ ${metrics.performance.toString().padEnd(7)} │ >80          │ ${checkStatus(metrics.performance, 80)}           │\n`;
  content += `│ Accessibility        │ ${metrics.accessibility.toString().padEnd(7)} │ >90          │ ${checkStatus(metrics.accessibility, 90)}           │\n`;
  content += `│ Best Practices      │ ${metrics.bestPractices.toString().padEnd(7)} │ >90          │ ${checkStatus(metrics.bestPractices, 90)}           │\n`;
  content += `│ SEO                 │ ${metrics.seo.toString().padEnd(7)} │ >90          │ ${checkStatus(metrics.seo, 90)}           │\n`;
  content += `│ FCP                 │ ${formatTime(metrics.fcp).padEnd(7)} │ <1.8s        │ ${checkStatus(metrics.fcp, 1800, true)}           │\n`;
  content += `│ LCP                 │ ${formatTime(metrics.lcp).padEnd(7)} │ <2.5s        │ ${checkStatus(metrics.lcp, 2500, true)}           │\n`;
  content += `│ TBT                 │ ${formatTime(metrics.tbt).padEnd(7)} │ <0.2s        │ ${checkStatus(metrics.tbt, 200, true)}           │\n`;
  content += `│ CLS                 │ ${metrics.cls.toFixed(3).padEnd(7)} │ <0.1         │ ${checkStatus(metrics.cls, 0.1, true)}           │\n`;
  content += '└─────────────────────┴─────────┴──────────────┴───────────────┘\n';

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
    content += '\n🎉 Performance: TODAS las métricas cumplen los objetivos\n';
  } else {
    content += '\n⚠️  Performance: Algunas métricas no cumplen los objetivos\n';
  }

  return content;
}

async function generateBundlesSection() {
  const metrics = await readMetricsFile('bundles.json');

  if (!metrics) {
    return '⚠️  No hay métricas de bundles disponibles.\nEjecuta: npm run metrics:bundles';
  }

  const mainStatus = checkStatus(metrics.main.gzip, 500000, true);
  const polyfillsStatus = checkStatus(metrics.polyfills.gzip, 10000, true);
  const vendorStatus = checkStatus(metrics.vendor.gzip, 300000, true);
  const totalStatus = checkStatus(metrics.totalGzip, 1000000, true);
  const lazySize = metrics.totalSize - metrics.main.size - metrics.polyfills.size - metrics.vendor.size;

  let content = 'Métricas de Bundles:\n\n';
  content += '┌───────────────────┬──────────────┬──────────────┬──────────────┐\n';
  content += '│ Bundle           │ Raw Size     │ Gzip Size    │ Objetivo     │\n';
  content += '├───────────────────┼──────────────┼──────────────┼──────────────┤\n';
  content += `│ Main             │ ${formatBytes(metrics.main.size).padEnd(12)} │ ${formatBytes(metrics.main.gzip).padEnd(12)} │ <500 KB      │ ${mainStatus}   │\n`;
  content += `│ Polyfills        │ ${formatBytes(metrics.polyfills.size).padEnd(12)} │ ${formatBytes(metrics.polyfills.gzip).padEnd(12)} │ <10 KB       │ ${polyfillsStatus}   │\n`;
  content += `│ Vendor           │ ${formatBytes(metrics.vendor.size).padEnd(12)} │ ${formatBytes(metrics.vendor.gzip).padEnd(12)} │ <300 KB      │ ${vendorStatus}   │\n`;
  content += `│ Lazy Chunks      │ ${metrics.lazy.length.toString().padStart(2)} archivos   │ ${formatBytes(lazySize).padEnd(12)} │ -            │ -             │\n`;
  content += '├───────────────────┼──────────────┼──────────────┼──────────────┤\n';
  content += `│ TOTAL            │ ${formatBytes(metrics.totalSize).padEnd(12)} │ ${formatBytes(metrics.totalGzip).padEnd(12)} │ <1 MB        │ ${totalStatus}   │\n`;
  content += '└───────────────────┴──────────────┴──────────────┴───────────────┘\n';

  if (metrics.totalGzip <= 1000000) {
    content += '\n🎉 Bundles: El tamaño total cumple el objetivo\n';
  } else {
    content += '\n⚠️  Bundles: El tamaño excede el objetivo\n';
  }

  return content;
}

async function generateCoverageSection() {
  const metrics = await readMetricsFile('coverage.json');

  if (!metrics) {
    return '⚠️  No hay métricas de coverage disponibles.\nEjecuta: npm run metrics:coverage';
  }

  let content = 'Métricas de Coverage:\n\n';
  content += '┌───────────────┬──────────┬─────────┬─────────┬──────────────┬───────────────┐\n';
  content += '│ Métrica      │ %        │ Covered │ Total   │ Objetivo     │ Estado        │\n';
  content += '├───────────────┼──────────┼─────────┼─────────┼──────────────┼───────────────┤\n';
  content += `│ Statements   │ ${metrics.statements.pct.toString().padEnd(8)} │ ${metrics.statements.covered.toString().padEnd(7)} │ ${metrics.statements.total.toString().padEnd(7)} │ >50          │ ${checkStatus(metrics.statements.pct, 50)}           │\n`;
  content += `│ Branches     │ ${metrics.branches.pct.toString().padEnd(8)} │ ${metrics.branches.covered.toString().padEnd(7)} │ ${metrics.branches.total.toString().padEnd(7)} │ >50          │ ${checkStatus(metrics.branches.pct, 50)}           │\n`;
  content += `│ Functions    │ ${metrics.functions.pct.toString().padEnd(8)} │ ${metrics.functions.covered.toString().padEnd(7)} │ ${metrics.functions.total.toString().padEnd(7)} │ >50          │ ${checkStatus(metrics.functions.pct, 50)}           │\n`;
  content += `│ Lines        │ ${metrics.lines.pct.toString().padEnd(8)} │ ${metrics.lines.covered.toString().padEnd(7)} │ ${metrics.lines.total.toString().padEnd(7)} │ >50          │ ${checkStatus(metrics.lines.pct, 50)}           │\n`;
  content += '└───────────────┴──────────┴─────────┴─────────┴──────────────┴───────────────┘\n';

  const allPassed =
    metrics.statements.pct >= 50 &&
    metrics.branches.pct >= 50 &&
    metrics.functions.pct >= 50 &&
    metrics.lines.pct >= 50;

  if (allPassed) {
    content += '\n🎉 Coverage: TODAS las métricas cumplen los objetivos\n';
  } else {
    content += '\n⚠️  Coverage: Algunas métricas no cumplen los objetivos\n';
  }

  return content;
}

async function generateQualitySection() {
  const metrics = await readMetricsFile('quality.json');

  if (!metrics) {
    return '⚠️  No hay métricas de calidad disponibles.\nEjecuta: npm run metrics:quality';
  }

  const checkStatusQ = passed => (passed ? '✅ PASS' : '❌ FAIL');

  let content = 'Métricas de Calidad de Código:\n\n';
  content += '┌──────────────────────────┬─────────┬──────────────┬───────────────┐\n';
  content += '│ Aspecto                  │ Estado  │ Errores      │ Warnings      │\n';
  content += '├──────────────────────────┼─────────┼──────────────┼───────────────┤\n';
  content += `│ TypeScript Check           │ ${checkStatusQ(metrics.typeCheck.passed).padEnd(7)} │ ${metrics.typeCheck.errors.toString().padEnd(12)} │ ${metrics.typeCheck.warnings.toString().padEnd(13)} │\n`;
  content += `│ Prettier Check             │ ${checkStatusQ(metrics.prettier.passed).padEnd(7)} │ ${metrics.prettier.errors.toString().padEnd(12)} │ ${metrics.prettier.warnings.toString().padEnd(13)} │\n`;
  content += `│ No Console Statements      │ ${checkStatusQ(metrics.consoleCheck.passed).padEnd(7)} │ ${metrics.consoleCheck.errors.toString().padEnd(12)} │ ${metrics.consoleCheck.warnings.toString().padEnd(13)} │\n`;
  content += `│ No TODOs/FIXMEs            │ ${checkStatusQ(metrics.todoCheck.passed).padEnd(7)} │ ${metrics.todoCheck.errors.toString().padEnd(12)} │ ${metrics.todoCheck.warnings.toString().padEnd(13)} │\n`;
  content += `│ Angular Standards          │ ${checkStatusQ(metrics.angularCheck.passed).padEnd(7)} │ ${metrics.angularCheck.errors.toString().padEnd(12)} │ ${metrics.angularCheck.warnings.toString().padEnd(13)} │\n`;
  content += '└──────────────────────────┴─────────┴──────────────┴───────────────┘\n';

  content += '\n📈 Líneas de Código:\n';
  content += `   Total: ${metrics.lines.totalLines.toLocaleString()} líneas\n`;
  content += `   TypeScript: ${metrics.lines.tsLines.toLocaleString()} líneas (${((metrics.lines.tsLines / metrics.lines.totalLines) * 100).toFixed(1)}%)\n`;
  content += `   HTML: ${metrics.lines.htmlLines.toLocaleString()} líneas (${((metrics.lines.htmlLines / metrics.lines.totalLines) * 100).toFixed(1)}%)\n`;
  content += `   SCSS: ${metrics.lines.scssLines.toLocaleString()} líneas (${((metrics.lines.scssLines / metrics.lines.totalLines) * 100).toFixed(1)}%)\n`;

  const allPassed =
    metrics.typeCheck.passed &&
    metrics.prettier.passed &&
    metrics.angularCheck.passed &&
    metrics.typeCheck.errors === 0;

  if (allPassed) {
    content += '\n🎉 Calidad: TODAS las métricas cumplen los objetivos\n';
  } else {
    content += '\n⚠️  Calidad: Algunas métricas no cumplen los objetivos\n';
  }

  return content;
}

async function generateSummarySection() {
  const perfMetrics = await readMetricsFile('performance.json');
  const bundlesMetrics = await readMetricsFile('bundles.json');
  const coverageMetrics = await readMetricsFile('coverage.json');
  const qualityMetrics = await readMetricsFile('quality.json');

  let totalObjectives = 0;
  let passedObjectives = 0;

  let content = '📋 RESUMEN EJECUTIVO:\n\n';

  if (perfMetrics) {
    const perfPassed =
      perfMetrics.performance >= 80 &&
      perfMetrics.accessibility >= 90 &&
      perfMetrics.bestPractices >= 90 &&
      perfMetrics.seo >= 90 &&
      perfMetrics.fcp <= 1800 &&
      perfMetrics.lcp <= 2500 &&
      perfMetrics.tbt <= 200 &&
      perfMetrics.cls <= 0.1;

    totalObjectives += 8;
    passedObjectives += perfPassed ? 8 : 0;

    content += `Performance: ${perfPassed ? '✅ CUMPLE' : '❌ NO CUMPLE'} (${perfMetrics.performance}/100)\n`;
  }

  if (bundlesMetrics) {
    const bundlesPassed = bundlesMetrics.totalGzip <= 1000000 && bundlesMetrics.main.gzip <= 500000;

    totalObjectives += 2;
    passedObjectives += bundlesPassed ? 2 : 0;

    content += `Bundles: ${bundlesPassed ? '✅ CUMPLE' : '❌ NO CUMPLE'} (${formatBytes(bundlesMetrics.totalGzip)} gzip)\n`;
  }

  if (coverageMetrics) {
    const coveragePassed =
      coverageMetrics.statements.pct >= 50 &&
      coverageMetrics.branches.pct >= 50 &&
      coverageMetrics.functions.pct >= 50 &&
      coverageMetrics.lines.pct >= 50;

    totalObjectives += 4;
    passedObjectives += coveragePassed ? 4 : 0;

    content += `Coverage: ${coveragePassed ? '✅ CUMPLE' : '❌ NO CUMPLE'} (${coverageMetrics.lines.pct}%)\n`;
  }

  if (qualityMetrics) {
    const qualityPassed =
      qualityMetrics.typeCheck.passed &&
      qualityMetrics.prettier.passed &&
      qualityMetrics.angularCheck.passed;

    totalObjectives += 3;
    passedObjectives += qualityPassed ? 3 : 0;

    content += `Calidad Código: ${qualityPassed ? '✅ CUMPLE' : '❌ NO CUMPLE'} (${qualityMetrics.lines.totalLines.toLocaleString()} líneas)\n`;
  }

  if (totalObjectives > 0) {
    const percentage = Math.round((passedObjectives / totalObjectives) * 100);
    content += `\n🎯 Completitud del proyecto: ${percentage}% (${passedObjectives}/${totalObjectives} objetivos)\n`;

    if (percentage >= 100) {
      content += '\n🎉 ¡El proyecto cumple TODOS los objetivos de calidad!\n';
    } else if (percentage >= 80) {
      content += '\n👍 El proyecto está muy cerca de completar los objetivos.\n';
    } else if (percentage >= 60) {
      content += '\n⚠️  El proyecto necesita trabajo adicional para cumplir los objetivos.\n';
    } else {
      content += '\n❌ El proyecto requiere mejoras significativas.\n';
    }
  }

  return content;
}

async function generateReport() {
  console.log('🎯 Generando reporte completo de métricas...\n');

  let report = '\n';
  report += '╔════════════════════════════════════════════════════════════════╗\n';
  report += '║                  REPORTE DE MÉTRICAS JOINLY                    ║\n';
  report += '╚════════════════════════════════════════════════════════════════╝\n';
  report += `📅 Fecha: ${new Date().toLocaleString('es-ES')}\n`;
  report += `📦 Versión: ${process.env.npm_package_version || '0.0.0'}\n`;

  report += await generateSummarySection();
  report += await generatePerformanceSection();
  report += await generateBundlesSection();
  report += await generateCoverageSection();
  report += await generateQualitySection();

  report += '\n' + '='.repeat(60) + '\n';
  report += '📝 Notas:\n';
  report += '- Ejecuta "npm run metrics:all" para actualizar todas las métricas\n';
  report += '- Revisa los reportes HTML en docs/metrics/ para más detalles\n';
  report += '- Los reportes de Lighthouse se guardan en la raíz del proyecto\n';
  report += '- Los reportes de coverage están en coverage/\n';
  report += '- Las métricas de calidad verifican TypeScript, Prettier y estándares\n';
  report += '='.repeat(60) + '\n';

  return report;
}

async function saveReport(report) {
  const reportPath = path.join(METRICS_DIR, 'report.txt');

  try {
    await fs.writeFile(reportPath, report);
    console.log(`💾 Reporte guardado en: ${reportPath}`);
  } catch (error) {
    console.error('Error guardando reporte:', error.message);
  }

  console.log('\n' + report);
}

async function generateFullReport() {
  const report = await generateReport();
  await saveReport(report);
}

const args = process.argv.slice(2);
const mode = args[0] || 'all';

if (mode === 'all') {
  generateFullReport()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Error:', error);
      process.exit(1);
    });
} else if (mode === 'report') {
  generateFullReport()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Error:', error);
      process.exit(1);
    });
} else {
  console.log('Modo inválido. Usa: npm run metrics:report');
  process.exit(1);
}
