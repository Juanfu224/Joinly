import { execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { ensureMetricsDir, saveMetrics, checkStatus, ROOT, METRICS, getAllFiles } from './metrics-utils.js';

const COVERAGE_DIR = path.join(ROOT, 'coverage');

async function runCoverage() {
  console.log('\n🧪 Ejecutando tests con coverage...\n');

  try {
    execSync('npm run test:coverage', {
      cwd: ROOT,
      stdio: 'inherit',
    });

    console.log('\n✅ Tests completados\n');
    return true;
  } catch (error) {
    console.error('\n❌ Error ejecutando tests:', error.message);
    return false;
  }
}

async function parseCoverageReport() {
  console.log('📊 Analizando coverage...\n');

  try {
    const summaryPath = path.join(COVERAGE_DIR, 'coverage-summary.json');
    const content = await fs.readFile(summaryPath, 'utf-8');
    const data = JSON.parse(content);

    const total = data.total;

    const metrics = {
      statements: {
        pct: total.statements.pct,
        covered: total.statements.covered,
        total: total.statements.total,
        skipped: total.statements.skipped,
      },
      branches: {
        pct: total.branches.pct,
        covered: total.branches.covered,
        total: total.branches.total,
        skipped: total.branches.skipped,
      },
      functions: {
        pct: total.functions.pct,
        covered: total.functions.covered,
        total: total.functions.total,
        skipped: total.functions.skipped,
      },
      lines: {
        pct: total.lines.pct,
        covered: total.lines.covered,
        total: total.lines.total,
        skipped: total.lines.skipped,
      },
      timestamp: new Date().toISOString(),
    };

    return metrics;
  } catch (error) {
    console.error('Error parseando reporte de coverage:', error.message);
    return null;
  }
}

function printCoverageTable(metrics) {
  console.log('📊 Métricas de Coverage:');
  console.log('┌───────────────┬──────────┬─────────┬─────────┬──────────────┬───────────────┐');
  console.log('│ Métrica      │ %        │ Covered │ Total   │ Objetivo     │ Estado        │');
  console.log('├───────────────┼──────────┼─────────┼─────────┼──────────────┼───────────────┤');

  console.log(
    `│ Statements   │ ${metrics.statements.pct.toString().padEnd(8)} │ ${metrics.statements.covered.toString().padEnd(7)} │ ${metrics.statements.total.toString().padEnd(7)} │ >50          │ ${checkStatus(metrics.statements.pct, 50)}           │`,
  );
  console.log(
    `│ Branches     │ ${metrics.branches.pct.toString().padEnd(8)} │ ${metrics.branches.covered.toString().padEnd(7)} │ ${metrics.branches.total.toString().padEnd(7)} │ >50          │ ${checkStatus(metrics.branches.pct, 50)}           │`,
  );
  console.log(
    `│ Functions    │ ${metrics.functions.pct.toString().padEnd(8)} │ ${metrics.functions.covered.toString().padEnd(7)} │ ${metrics.functions.total.toString().padEnd(7)} │ >50          │ ${checkStatus(metrics.functions.pct, 50)}           │`,
  );
  console.log(
    `│ Lines        │ ${metrics.lines.pct.toString().padEnd(8)} │ ${metrics.lines.covered.toString().padEnd(7)} │ ${metrics.lines.total.toString().padEnd(7)} │ >50          │ ${checkStatus(metrics.lines.pct, 50)}           │`,
  );
  console.log('└───────────────┴──────────┴─────────┴─────────┴──────────────┴───────────────┘\n');
}

async function countTestFiles() {
  const srcDir = path.join(ROOT, 'src');
  const testFiles = (await getAllFiles(srcDir)).filter(f => f.endsWith('.spec.ts'));

  const countByDir = async dir =>
    (await getAllFiles(path.join(srcDir, dir))).filter(f => f.endsWith('.spec.ts')).length;

  return {
    total: testFiles.length,
    components: await countByDir('components'),
    services: await countByDir('services'),
    pipes: await countByDir('utils'),
    resolvers: await countByDir('resolvers'),
  };
}

function printTestFileStats(stats) {
  console.log('📁 Archivos de Tests:');
  console.log('┌───────────────┬──────────┬──────────────┬───────────────┐');
  console.log('│ Tipo          │ Actual   │ Objetivo     │ Estado        │');
  console.log('├───────────────┼──────────┼──────────────┼───────────────┤');

  console.log(
    `│ Componentes   │ ${stats.components.toString().padEnd(8)} │ 3            │ ${checkStatus(stats.components, 3)}           │`,
  );
  console.log(
    `│ Servicios     │ ${stats.services.toString().padEnd(8)} │ 3            │ ${checkStatus(stats.services, 3)}           │`,
  );
  console.log(
    `│ Pipes         │ ${stats.pipes.toString().padEnd(8)} │ 2            │ ${checkStatus(stats.pipes, 2)}           │`,
  );
  console.log(
    `│ Resolvers     │ ${stats.resolvers.toString().padEnd(8)} │ -            │ -             │`,
  );
  console.log('├───────────────┼──────────┼──────────────┼───────────────┤');
  console.log(
    `│ TOTAL         │ ${stats.total.toString().padEnd(8)} │ 8+           │ ${checkStatus(stats.total, 8)}           │`,
  );
  console.log('└───────────────┴──────────┴──────────────┴───────────────┘\n');
}

async function measureCoverage(shouldRunTests = true) {
  await ensureMetricsDir();

  console.log('🎯 Iniciando medición de coverage...\n');

  if (shouldRunTests) {
    const testsSuccess = await runCoverage();
    if (!testsSuccess) {
      console.log('\n⚠️  Los tests fallaron, pero se procesará el coverage existente\n');
    }
  }

  const metrics = await parseCoverageReport();

  if (!metrics) {
    process.exit(1);
  }

  printCoverageTable(metrics);
  await saveMetrics('coverage.json', metrics);

  const testStats = await countTestFiles();
  printTestFileStats(testStats);

  const allPassed =
    metrics.statements.pct >= 50 &&
    metrics.branches.pct >= 50 &&
    metrics.functions.pct >= 50 &&
    metrics.lines.pct >= 50 &&
    testStats.components >= 3 &&
    testStats.services >= 3 &&
    testStats.pipes >= 2;

  if (allPassed) {
    console.log('🎉 ¡Todos los objetivos de coverage cumplidos!\n');
  } else {
    console.log('⚠️  Algunos objetivos no cumplidos. Considera:\n');
    console.log('   • Agregar tests a componentes y servicios críticos');
    console.log('   • Priorizar casos de uso importantes');
    console.log('   • Usar mocks para dependencias externas\n');
  }

  return { metrics, testStats };
}

const args = process.argv.slice(2);
const skipTests = args.includes('--skip-tests');

measureCoverage(!skipTests)
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
