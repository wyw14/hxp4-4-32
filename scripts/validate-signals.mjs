import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

let errors = 0;

function logError(message) {
  console.error(`❌ ${message}`);
  errors++;
}

function logSuccess(message) {
  console.log(`✅ ${message}`);
}

function validateSignalsJson() {
  const signalsPath = path.join(rootDir, 'public', 'signals.json');
  
  if (!fs.existsSync(signalsPath)) {
    logError('signals.json 文件不存在');
    return;
  }

  try {
    const content = fs.readFileSync(signalsPath, 'utf-8');
    const data = JSON.parse(content);

    if (!Array.isArray(data.signals)) {
      logError('signals.json: signals 必须是数组');
    } else {
      const expectedCount = 4;
      if (data.signals.length !== expectedCount) {
        logError(`signals.json: 信号数量应为 ${expectedCount}，实际为 ${data.signals.length}`);
      }

      const requiredFields = ['id', 'vhfRange', 'uhfRange', 'antennaAngle', 'name', 'fragmentPath', 'description', 'intensity', 'weatherAffected'];
      
      data.signals.forEach((signal, index) => {
        requiredFields.forEach(field => {
          if (!(field in signal)) {
            logError(`signals.json: 信号[${index}] 缺少必填字段 ${field}`);
          }
        });

        if (signal.vhfRange && (!Array.isArray(signal.vhfRange) || signal.vhfRange.length !== 2)) {
          logError(`signals.json: 信号[${index}] vhfRange 格式错误，应为 [min, max]`);
        }
        if (signal.uhfRange && (!Array.isArray(signal.uhfRange) || signal.uhfRange.length !== 2)) {
          logError(`signals.json: 信号[${index}] uhfRange 格式错误，应为 [min, max]`);
        }
        if (signal.antennaAngle && (!Array.isArray(signal.antennaAngle) || signal.antennaAngle.length !== 2)) {
          logError(`signals.json: 信号[${index}] antennaAngle 格式错误，应为 [min, max]`);
        }

        if (typeof signal.intensity === 'number' && (signal.intensity < 0 || signal.intensity > 1)) {
          logError(`signals.json: 信号[${index}] intensity 应在 0-1 之间`);
        }
      });
    }

    if (!data.weatherConfig) {
      logError('signals.json: 缺少 weatherConfig');
    } else {
      if (!data.weatherConfig.baseOffset) {
        logError('signals.json: weatherConfig 缺少 baseOffset');
      } else {
        ['vhfShift', 'uhfShift', 'antennaShift'].forEach(field => {
          const offset = data.weatherConfig.baseOffset[field];
          if (!offset || !Array.isArray(offset) || offset.length !== 2) {
            logError(`signals.json: weatherConfig.baseOffset.${field} 格式错误`);
          }
        });
      }
      if (typeof data.weatherConfig.intervalMs !== 'number') {
        logError('signals.json: weatherConfig.intervalMs 应为数字');
      }
      if (typeof data.weatherConfig.stormIntensity !== 'number') {
        logError('signals.json: weatherConfig.stormIntensity 应为数字');
      }
    }

    logSuccess('signals.json 格式验证通过');
  } catch (e) {
    logError(`signals.json 解析失败: ${e.message}`);
  }
}

function validateShaders() {
  const shadersDir = path.join(rootDir, 'src', 'shaders');
  const requiredShaders = ['vertex.glsl', 'fragment.glsl'];

  requiredShaders.forEach(shader => {
    const shaderPath = path.join(shadersDir, shader);
    if (!fs.existsSync(shaderPath)) {
      logError(`Shader 文件缺失: ${shader}`);
    } else {
      const content = fs.readFileSync(shaderPath, 'utf-8');
      if (content.trim().length === 0) {
        logError(`Shader 文件为空: ${shader}`);
      } else {
        logSuccess(`Shader 文件存在且有效: ${shader}`);
      }
    }
  });
}

function validateHtmlStructure() {
  const htmlPath = path.join(rootDir, 'index.html');
  
  if (!fs.existsSync(htmlPath)) {
    logError('index.html 文件不存在');
    return;
  }

  const content = fs.readFileSync(htmlPath, 'utf-8');
  const requiredElements = [
    'id="glCanvas"',
    'id="vhfKnob"',
    'id="uhfKnob"',
    'id="antennaKnob"',
    'id="vhfValue"',
    'id="uhfValue"',
    'id="antennaValue"',
    'id="signalFill"',
    'id="signalOverlay"',
    'id="audioToggle"',
    'id="foundCount"'
  ];

  requiredElements.forEach(selector => {
    if (!content.includes(selector)) {
      logError(`index.html 缺少必需元素: ${selector}`);
    }
  });

  logSuccess('index.html 结构验证通过');
}

console.log('🔍 开始静态资源验证...\n');

validateSignalsJson();
console.log('');
validateShaders();
console.log('');
validateHtmlStructure();

console.log('');
if (errors === 0) {
  console.log('🎉 所有静态资源验证通过!');
  process.exit(0);
} else {
  console.log(`\n💥 发现 ${errors} 个错误，请修复后重试`);
  process.exit(1);
}
