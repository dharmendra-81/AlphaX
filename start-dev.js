import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('\x1b[36m%s\x1b[0m', '==============================================');
console.log('\x1b[36m%s\x1b[0m', '   Starting AlphaX (Frontend + Backend)       ');
console.log('\x1b[36m%s\x1b[0m', '==============================================');

const server = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'server'),
  stdio: 'pipe',
  shell: true,
  env: { ...process.env, FORCE_COLOR: '1' }
});

const client = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'client'),
  stdio: 'pipe',
  shell: true,
  env: { ...process.env, FORCE_COLOR: '1' }
});

const pipeOutput = (child, prefix, color) => {
  child.stdout?.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    lines.forEach(line => {
      if (line.trim()) {
        console.log(`${color}${prefix}\x1b[0m ${line}`);
      }
    });
  });

  child.stderr?.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    lines.forEach(line => {
      if (line.trim()) {
        console.error(`${color}${prefix} (err)\x1b[0m ${line}`);
      }
    });
  });
};

pipeOutput(server, '[SERVER]', '\x1b[32m'); // Green
pipeOutput(client, '[CLIENT]', '\x1b[34m'); // Blue

const cleanExit = () => {
  console.log('\n\x1b[33mStopping AlphaX servers...\x1b[0m');
  try { server.kill('SIGINT'); } catch {}
  try { client.kill('SIGINT'); } catch {}
  process.exit();
};

process.on('SIGINT', cleanExit);
process.on('SIGTERM', cleanExit);
process.on('exit', cleanExit);

