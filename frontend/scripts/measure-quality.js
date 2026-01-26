import { execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { ensureMetricsDir, saveMetrics, ROOT, METRICS, getAllFiles, TSC } from './metrics-utils.js';

async function runTypeCheck() {
  console.log('\n🔍 Ejecutando TypeScript type check...\n');

  try {
    execSync(`${TSC} --noEmit`, {
      cwd: ROOT,
      stdio: 'pipe',
    });

    console.log('✅ TypeScript type check: PASÓ (0 errores)\n');
    return { passed: true, errors: 0, warnings: 0 };
  } catch (error) {
    const output = error.stdout?.toString() || error.stderr?.toString() || '';
    const errorLines = output.split('\n').filter(line => line.includes('error TS'));

    console.log(`❌ TypeScript type check: FALLÓ (${errorLines.length} errores)\n`);
    return { passed: false, errors: errorLines.length, warnings: 0 };
  }
}

async function runPrettierCheck() {
  console.log('🎨 Ejecutando Prettier check...\n');

  try {
    execSync('npx prettier --check "src/**/*.ts" "src/**/*.html" "src/**/*.scss"', {
      cwd: ROOT,
      stdio: 'pipe',
    });

    console.log('✅ Prettier check: PASÓ\n');
    return { passed: true, errors: 0, warnings: 0 };
  } catch (error) {
    const output = error.stdout?.toString() || error.stderr?.toString() || '';
    const formattedFiles = (output.match(/Code style issues found/g) || []).length;

    console.log(`⚠️  Prettier check: Requiere formateo (${formattedFiles} archivos)\n`);
    return { passed: false, errors: 0, warnings: formattedFiles };
  }
}

async function checkNoConsoleLogs() {
  console.log('🔍 Buscando console.log() en producción...\n');

  try {
    const files = await getAllFiles(path.join(ROOT, 'src'));
    const filesWithConsole = [];

    for (const file of files) {
      if (file.endsWith('.ts') || file.endsWith('.html')) {
        const content = await fs.readFile(file, 'utf-8');

        if (content.includes('console.log') || content.includes('console.warn') || content.includes('console.error')) {
          filesWithConsole.push(path.relative(ROOT, file));
        }
      }
    }

    if (filesWithConsole.length > 0) {
      console.log(`⚠️  Se encontraron console statements en ${filesWithConsole.length} archivos:\n`);

      filesWithConsole.slice(0, 10).forEach(file => console.log(`   - ${file}`));

      if (filesWithConsole.length > 10) {
        console.log(`   ... y ${filesWithConsole.length - 10} más`);
      }

      console.log('');
      return { passed: false, errors: filesWithConsole.length, warnings: 0 };
    }

    console.log('✅ No se encontraron console statements\n');
    return { passed: true, errors: 0, warnings: 0 };
  } catch (error) {
    console.error('Error buscando console statements:', error.message);
    return { passed: false, errors: 0, warnings: 1 };
  }
}

async function checkTODOs() {
  console.log('📝 Buscando TODOs sin resolver...\n');

  try {
    const files = await getAllFiles(path.join(ROOT, 'src'));
    const todos = [];
    const todoPatterns = ['TODO:', 'FIXME:', 'HACK:'];

    for (const file of files) {
      if (file.endsWith('.ts') || file.endsWith('.html')) {
        const content = await fs.readFile(file, 'utf-8');
        const lines = content.split('\n');

        lines.forEach((line, index) => {
          if (todoPatterns.some(pattern => line.includes(pattern)) && !line.trim().startsWith('//')) {
            todos.push({ file: path.relative(ROOT, file), line: index + 1, text: line.trim() });
          }
        });
      }
    }

    if (todos.length > 0) {
      console.log(`⚠️  Se encontraron ${todos.length} TODOs/FIXMEs:\n`);

      todos.slice(0, 10).forEach(todo => {
        console.log(`   ${todo.file}:${todo.line}`);
        console.log(`   ${todo.text}\n`);
      });

      if (todos.length > 10) {
        console.log(`   ... y ${todos.length - 10} más\n`);
      }

      return { passed: false, errors: 0, warnings: todos.length };
    }

    console.log('✅ No se encontraron TODOs/FIXMEs\n');
    return { passed: true, errors: 0, warnings: 0 };
  } catch (error) {
    console.error('Error buscando TODOs:', error.message);
    return { passed: false, errors: 0, warnings: 1 };
  }
}

async function countLinesOfCode() {
  console.log('📊 Contando líneas de código...\n');

  try {
    const files = await getAllFiles(path.join(ROOT, 'src'));
    const counts = { total: 0, ts: 0, html: 0, scss: 0 };

    for (const file of files) {
      const content = await fs.readFile(file, 'utf-8');
      const lines = content.split('\n').filter(line => line.trim() !== '').length;
      counts.total += lines;

      if (file.endsWith('.ts')) counts.ts += lines;
      else if (file.endsWith('.html')) counts.html += lines;
      else if (file.endsWith('.scss')) counts.scss += lines;
    }

    console.log(`   Total: ${counts.total.toLocaleString()} líneas`);
    console.log(`   TypeScript: ${counts.ts.toLocaleString()} líneas (${((counts.ts / counts.total) * 100).toFixed(1)}%)`);
    console.log(`   HTML: ${counts.html.toLocaleString()} líneas (${((counts.html / counts.total) * 100).toFixed(1)}%)`);
    console.log(`   SCSS: ${counts.scss.toLocaleString()} líneas (${((counts.scss / counts.total) * 100).toFixed(1)}%)\n`);

    return { totalLines: counts.total, tsLines: counts.ts, htmlLines: counts.html, scssLines: counts.scss };
  } catch (error) {
    console.error('Error contando líneas:', error.message);
    return { totalLines: 0, tsLines: 0, htmlLines: 0, scssLines: 0 };
  }
}

async function checkAngularStandards() {
  console.log('📐 Verificando estándares de Angular...\n');

  const issues = [];

  try {
    const files = (await getAllFiles(path.join(ROOT, 'src'))).filter(f =>
      f.endsWith('.ts') && f.includes('components'),
    );

    for (const file of files) {
      const content = await fs.readFile(file, 'utf-8');
      const relativePath = path.relative(ROOT, file);

      if (content.includes('@Input(') || content.includes('@Output(')) {
        issues.push({ file: relativePath, issue: 'Usa decoradores @Input/@Output (debería usar input()/output())' });
      }

      if (content.includes('ChangeDetectionStrategy.Default')) {
        issues.push({ file: relativePath, issue: 'Usa ChangeDetectionStrategy.Default (debería usar OnPush)' });
      }
    }

    if (issues.length > 0) {
      console.log(`⚠️  Se encontraron ${issues.length} desviaciones de estándares:\n`);

      issues.slice(0, 10).forEach(issue => {
        console.log(`   ${issue.file}`);
        console.log(`   ${issue.issue}\n`);
      });

      if (issues.length > 10) {
        console.log(`   ... y ${issues.length - 10} más\n`);
      }

      return { passed: false, errors: issues.length, warnings: 0 };
    }

    console.log('✅ Todos los estándares de Angular se cumplen\n');
    return { passed: true, errors: 0, warnings: 0 };
  } catch (error) {
    console.error('Error verificando estándares:', error.message);
    return { passed: false, errors: 0, warnings: 1 };
  }
}

function getQualityStatus(passed) {
  return passed ? '✅ PASS' : '❌ FAIL';
}

function printQualityTable(metrics) {
  console.log('📊 Métricas de Calidad de Código:');
  console.log('┌──────────────────────────┬─────────┬──────────────┬───────────────┐');
  console.log('│ Aspecto                  │ Estado  │ Errores      │ Warnings      │');
  console.log('├──────────────────────────┼─────────┼──────────────┼───────────────┤');

  const tsStatus = getQualityStatus(metrics.typeCheck.passed);
  const prettierStatus = getQualityStatus(metrics.prettier.passed);
  const consoleStatus = getQualityStatus(metrics.consoleCheck.passed);
  const todoStatus = getQualityStatus(metrics.todoCheck.passed);
  const angularStatus = getQualityStatus(metrics.angularCheck.passed);

  console.log(
    `│ TypeScript Check           │ ${tsStatus.padEnd(7)} │ ${metrics.typeCheck.errors.toString().padEnd(12)} │ ${metrics.typeCheck.warnings.toString().padEnd(13)} │`,
  );
  console.log(
    `│ Prettier Check             │ ${prettierStatus.padEnd(7)} │ ${metrics.prettier.errors.toString().padEnd(12)} │ ${metrics.prettier.warnings.toString().padEnd(13)} │`,
  );
  console.log(
    `│ No Console Statements      │ ${consoleStatus.padEnd(7)} │ ${metrics.consoleCheck.errors.toString().padEnd(12)} │ ${metrics.consoleCheck.warnings.toString().padEnd(13)} │`,
  );
  console.log(
    `│ No TODOs/FIXMEs            │ ${todoStatus.padEnd(7)} │ ${metrics.todoCheck.errors.toString().padEnd(12)} │ ${metrics.todoCheck.warnings.toString().padEnd(13)} │`,
  );
  console.log(
    `│ Angular Standards          │ ${angularStatus.padEnd(7)} │ ${metrics.angularCheck.errors.toString().padEnd(12)} │ ${metrics.angularCheck.warnings.toString().padEnd(13)} │`,
  );
  console.log('└──────────────────────────┴─────────┴──────────────┴───────────────┘\n');

  console.log('📈 Líneas de Código:');
  console.log(`   Total: ${metrics.lines.totalLines.toLocaleString()} líneas`);
  console.log(`   TypeScript: ${metrics.lines.tsLines.toLocaleString()} líneas`);
  console.log(`   HTML: ${metrics.lines.htmlLines.toLocaleString()} líneas`);
  console.log(`   SCSS: ${metrics.lines.scssLines.toLocaleString()} líneas\n`);
}

async function measureQuality() {
  await ensureMetricsDir();

  console.log('🎯 Iniciando análisis de calidad de código...\n');

  const typeCheck = await runTypeCheck();
  const prettier = await runPrettierCheck();
  const consoleCheck = await checkNoConsoleLogs();
  const todoCheck = await checkTODOs();
  const angularCheck = await checkAngularStandards();
  const lines = await countLinesOfCode();

  const metrics = {
    typeCheck,
    prettier,
    consoleCheck,
    todoCheck,
    angularCheck,
    lines,
    timestamp: new Date().toISOString(),
  };

  printQualityTable(metrics);
  await saveMetrics('quality.json', metrics);

  const criticalErrors = typeCheck.errors;
  const totalWarnings = prettier.warnings + consoleCheck.errors + todoCheck.warnings + angularCheck.errors;

  if (criticalErrors === 0) {
    if (totalWarnings === 0) {
      console.log('🎉 ¡La calidad del código es excelente!\n');
    } else {
      console.log(`⚠️  Hay ${totalWarnings} advertencias que deberías revisar\n`);
    }
  } else {
    console.log(`❌ Hay ${criticalErrors} errores críticos que deben ser corregidos\n`);
  }

  return metrics;
}

measureQuality()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
