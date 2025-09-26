#!/usr/bin/env node

const { existsSync } = require('node:fs');
const { dirname, join } = require('node:path');
const { spawn, spawnSync } = require('node:child_process');

process.env.TAILWIND_DISABLE_LIGHTNINGCSS =
  process.env.TAILWIND_DISABLE_LIGHTNINGCSS || '1';
process.env.NEXT_DISABLE_LIGHTNINGCSS =
  process.env.NEXT_DISABLE_LIGHTNINGCSS || '1';

function resolveFromRoot(specifier) {
  try {
    return require.resolve(specifier, { paths: [process.cwd()] });
  } catch (error) {
    return null;
  }
}

function ensureLightningCssBinding() {
  const lightningEntry = resolveFromRoot('lightningcss');
  if (!lightningEntry) {
    console.warn('lightningcss is not installed. Skipping native binding check.');
    return;
  }

  const parts = [process.platform, process.arch];

  if (process.platform === 'linux') {
    try {
      const { MUSL, familySync } = require('detect-libc');
      const family = familySync();

      if (family === MUSL) {
        parts.push('musl');
      } else if (process.arch === 'arm') {
        parts.push('gnueabihf');
      } else {
        parts.push('gnu');
      }
    } catch (error) {
      parts.push('gnu');
    }
  } else if (process.platform === 'win32') {
    parts.push('msvc');
  }

  const bindingName = `lightningcss-${parts.join('-')}`;

  if (resolveFromRoot(bindingName)) {
    return;
  }

  const candidate = join(dirname(lightningEntry), `../lightningcss.${parts.join('-')}.node`);
  if (existsSync(candidate)) {
    return;
  }

  console.info(`Installing optional Lightning CSS native binding "${bindingName}"...`);
  const install = spawnSync('npm', ['install', `${bindingName}@^1.30.1`], {
    stdio: 'inherit',
    env: process.env
  });

  if (install.status !== 0) {
    console.warn(
      `Failed to install the optional Lightning CSS package "${bindingName}" (exit code ${install.status}). Falling back to WASM transformer.`
    );
    process.env.CSS_TRANSFORMER_WASM = '1';
  }
}

ensureLightningCssBinding();

const child = spawn('next', ['build'], {
  stdio: 'inherit',
  shell: process.platform === 'win32'
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
