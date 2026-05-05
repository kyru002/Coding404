const { spawn } = require('child_process');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

const children = [];

const run = (name, cwd, args) => {
  const child = spawn(npmCmd, args, {
    cwd,
    stdio: 'inherit',
    shell: false,
    env: process.env,
  });

  child.on('exit', (code) => {
    if (code !== 0) {
      console.error(`❌ ${name} terminó con código ${code}`);
      shutdown(code || 1);
    }
  });

  children.push(child);
  return child;
};

const shutdown = (code = 0) => {
  children.forEach((child) => {
    if (!child.killed) {
      try {
        child.kill('SIGTERM');
      } catch (_error) {
        // Ignore kill errors while shutting down.
      }
    }
  });
  process.exit(code);
};

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

console.log('▶ Iniciando Backend + Frontend...');
run('Backend', path.join(rootDir, 'Backend'), ['run', 'dev']);
run('Frontend', path.join(rootDir, 'Frontend'), ['run', 'dev']);
