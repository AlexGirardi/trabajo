#!/usr/bin/env node
// Starts Ollama (if not up) then launches dev server (and optionally Electron)
import { spawn } from 'node:child_process';
import http from 'node:http';

const args = process.argv.slice(2);
const withElectron = args.includes('--electron');

// Resolve npm/npx commands cross-platform (Windows needs .cmd)
const NPM = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const NPX = process.platform === 'win32' ? 'npx.cmd' : 'npx';

function checkOllama() {
  return new Promise(resolve => {
    const req = http.request({ host: '127.0.0.1', port: 11434, path: '/api/tags', timeout: 1500 }, res => {
      res.resume();
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.end();
  });
}

async function ensureOllama() {
  const up = await checkOllama();
  if (up) {
    console.log('[EstudIA] Ollama already running.');
    return;
  }
  console.log('[EstudIA] Starting Ollama (ollama serve)...');
  const proc = spawn('ollama', ['serve'], { stdio: 'ignore', detached: true });
  proc.unref();
  // Poll until ready or timeout
  const start = Date.now();
  while (Date.now() - start < 15000) {
    if (await checkOllama()) {
      console.log('[EstudIA] Ollama is ready.');
      return;
    }
    await new Promise(r => setTimeout(r, 1000));
  }
  console.warn('[EstudIA] Ollama not ready after 15s, continuing anyway.');
}

function spawnLogged(cmd, args, opts={}) {
  console.log('[EstudIA] >', cmd, args.join(' '));
  const p = spawn(cmd, args, { stdio: 'inherit', ...opts });
  return p;
}

async function main() {
  await ensureOllama();
  // Start Vite dev server
  const vite = spawnLogged(NPM, ['run','dev']);
  if (withElectron) {
    // Wait until Vite responds
    const waitForPort = async () => new Promise(res => {
      const check = () => {
        const req = http.request({ host: '127.0.0.1', port: 5173, path: '/', timeout: 1000 }, r => { r.resume(); res(true); });
        req.on('error', () => setTimeout(check, 750));
        req.end();
      };
      check();
    });
    await waitForPort();
  spawnLogged(NPX, ['electron','.']);
  }
  vite.on('exit', code => process.exit(code ?? 0));
}

main().catch(e => { console.error(e); process.exit(1); });
