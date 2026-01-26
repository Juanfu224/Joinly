import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FRONTEND_DIR = path.join(__dirname, '../');
const ROOT_DIR = path.join(__dirname, '../../');
const METRICS_DIR = path.join(FRONTEND_DIR, 'docs/metrics');
const TSC_BIN = path.join(FRONTEND_DIR, 'node_modules/typescript/bin/tsc');

export const ROOT = FRONTEND_DIR;
export const METRICS = METRICS_DIR;
export const PROJECT_ROOT = ROOT_DIR;
export const TSC = TSC_BIN;

export async function ensureMetricsDir() {
  try {
    await fs.mkdir(METRICS_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creando directorio de métricas:', error.message);
  }
}

export async function saveMetrics(filename, data) {
  const filePath = path.join(METRICS_DIR, filename);

  try {
    const existingData = await fs.readFile(filePath, 'utf-8').catch(() => null);
    const history = existingData ? JSON.parse(existingData) : [];
    history.push(data);

    await fs.writeFile(filePath, JSON.stringify(history, null, 2));
    console.log(`💾 Métricas guardadas en: ${filePath}\n`);
  } catch (error) {
    console.error('Error guardando métricas:', error.message);
  }
}

export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function formatTime(ms) {
  return `${(ms / 1000).toFixed(2)}s`;
}

export function checkStatus(actual, target, inverse = false) {
  const passed = inverse ? actual <= target : actual >= target;
  return passed ? '✅ PASS' : '❌ FAIL';
}

export async function getAllFiles(dir, fileList = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
      await getAllFiles(fullPath, fileList);
    } else if (entry.isFile()) {
      fileList.push(fullPath);
    }
  }

  return fileList;
}
