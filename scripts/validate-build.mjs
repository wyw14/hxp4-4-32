import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

let errors = 0;

function logError(message) {
  console.error(`❌ ${message}`);
  errors++;
}

function logSuccess(message) {
  console.log(`✅ ${message}`);
}

function validateDistFolder() {
  if (!fs.existsSync(distDir)) {
    logError('dist 目录不存在，请先运行 npm run build');
    return false;
  }
  logSuccess('dist 目录存在');
  return true;
}

function validateRequiredFiles() {
  const requiredFiles = [
    'index.html',
    'signals.json'
  ];

  const distFiles = fs.readdirSync(distDir);
  const assetDir = distFiles.find(f => f.startsWith('assets'));
  
  if (!assetDir) {
    logError('未找到 assets 目录，构建产物不完整');
    return;
  }

  requiredFiles.forEach(file => {
    const filePath = path.join(distDir, file);
    if (!fs.existsSync(filePath)) {
      logError(`构建产物缺少文件: ${file}`);
    } else {
      logSuccess(`构建产物包含: ${file}`);
    }
  });

  const assetsPath = path.join(distDir, assetDir);
  const assetFiles = fs.readdirSync(assetsPath);
  
  const hasJs = assetFiles.some(f => f.endsWith('.js'));
  const hasCss = assetFiles.some(f => f.endsWith('.css'));

  if (!hasJs) {
    logError('构建产物中没有找到 JS 文件');
  } else {
    logSuccess('构建产物包含 JS bundle');
  }

  if (!hasCss) {
    logError('构建产物中没有找到 CSS 文件');
  } else {
    logSuccess('构建产物包含 CSS bundle');
  }
}

function validateIndexHtmlContent() {
  const indexPath = path.join(distDir, 'index.html');
  if (!fs.existsSync(indexPath)) return;

  const content = fs.readFileSync(indexPath, 'utf-8');
  
  if (!content.includes('<script') || !content.includes('.js')) {
    logError('index.html 中未引用 JS bundle');
  } else {
    logSuccess('index.html 正确引用 JS bundle');
  }

  if (!content.includes('<link') || !content.includes('.css')) {
    logError('index.html 中未引用 CSS bundle');
  } else {
    logSuccess('index.html 正确引用 CSS bundle');
  }
}

console.log('🔍 开始构建产物验证...\n');

if (validateDistFolder()) {
  console.log('');
  validateRequiredFiles();
  console.log('');
  validateIndexHtmlContent();
}

console.log('');
if (errors === 0) {
  console.log('🎉 所有构建产物验证通过!');
  process.exit(0);
} else {
  console.log(`\n💥 发现 ${errors} 个错误，请修复后重试`);
  process.exit(1);
}
