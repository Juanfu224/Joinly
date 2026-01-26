import { execSync } from 'child_process';
import fs from 'fs/promises';
import { ROOT, TSC } from './metrics-utils.js';

async function runCommand(command, description) {
  try {
    console.log(`\n🔄 ${description}...`);
    execSync(command, { cwd: ROOT, stdio: 'inherit' });
    console.log(`✅ ${description} completado`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} falló`);
    return false;
  }
}

async function checkMetricsExist(filename) {
  try {
    await fs.access(`${ROOT}/docs/metrics/${filename}`);
    return true;
  } catch {
    return false;
  }
}

async function runPipeline(mode = 'quick') {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 Iniciando Pipeline de Métricas Joinly');
  console.log(`📦 Modo: ${mode}`);
  console.log('='.repeat(60) + '\n');

  let results = {
    typeCheck: false,
    build: false,
    quality: false,
    bundles: false,
    coverage: mode === 'full',
    performance: mode === 'full',
  };

  mode === 'full'
    ? console.log('⚠️  Modo completo: Esto incluye Lighthouse y tests completos\n')
    : console.log('🚀 Modo rápido: Solo verifica críticos (no ejecuta Lighthouse ni tests)\n');

  const typeCheckSuccess = await runCommand(`${TSC} --noEmit`, 'TypeScript Check');
  results.typeCheck = typeCheckSuccess;

  if (!typeCheckSuccess) {
    console.log('\n❌ TypeScript check falló. Abortando pipeline.');
    process.exit(1);
  }

  if (mode === 'full') {
    const buildSuccess = await runCommand('npm run build:prod', 'Build Producción');
    results.build = buildSuccess;

    if (buildSuccess) {
      const bundlesSuccess = await runCommand('npm run metrics:bundles -- --skip-build', 'Análisis de Bundles');
      results.bundles = bundlesSuccess;
    }

    const coverageSuccess = await runCommand('npm run test:coverage', 'Tests con Coverage');
    results.coverage = coverageSuccess;

    if (coverageSuccess) {
      await runCommand('npm run metrics:coverage -- --skip-tests', 'Procesar Coverage');
    }

    const qualitySuccess = await runCommand('npm run metrics:quality', 'Análisis de Calidad');
    results.quality = qualitySuccess;

    console.log('\n💡 Para ejecutar Lighthouse manualmente: npm run metrics:performance');
  } else {
    const qualitySuccess = await runCommand('npm run metrics:quality', 'Análisis de Calidad');
    results.quality = qualitySuccess;

    if (await checkMetricsExist('bundles.json')) {
      results.bundles = true;
      console.log('✅ Bundles: Usando métricas existentes');
    }
  }

  const reportSuccess = await runCommand('npm run metrics:report', 'Generar Reporte');
  results.report = reportSuccess;

  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN DEL PIPELINE');
  console.log('='.repeat(60) + '\n');

  const checks = [
    { name: 'TypeScript Check', passed: results.typeCheck },
    { name: 'Build Producción', passed: results.build || mode !== 'full' },
    { name: 'Análisis de Bundles', passed: results.bundles },
    { name: 'Coverage de Tests', passed: results.coverage || mode !== 'full' },
    { name: 'Análisis de Calidad', passed: results.quality },
    { name: 'Reporte Generado', passed: results.report },
  ];

  let passedCount = 0;
  checks.forEach(check => {
    const status = check.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} - ${check.name}`);
    if (check.passed) passedCount++;
  });

  console.log(`\n📈 Resultado: ${passedCount}/${checks.length} checks pasados\n`);

  if (passedCount === checks.length) {
    console.log('🎉 ¡Pipeline completado exitosamente!\n');
    process.exit(0);
  } else {
    console.log('⚠️  Pipeline completado con advertencias\n');
    process.exit(0);
  }
}

const args = process.argv.slice(2);
const mode = args[0] || 'quick';

if (!['quick', 'full'].includes(mode)) {
  console.log('Uso: node scripts/ci-pipeline.js [quick|full]');
  process.exit(1);
}

runPipeline(mode).catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
