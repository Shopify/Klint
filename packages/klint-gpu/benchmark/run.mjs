#!/usr/bin/env node
/**
 * KlintGPU benchmark runner — uses Playwright to open the benchmark page
 * in a real Chromium with WebGPU enabled and reads the FPS result.
 */

import { chromium } from 'playwright';
import { createServer } from 'http';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const N = process.env.BENCH_N || '500';
const TIMEOUT = parseInt(process.env.BENCH_TIMEOUT || '45000');

// ─── Minimal static HTTP server ──────────────────────────────────────────────
function startServer(dir) {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      const safePath = req.url.split('?')[0].replace(/\.\./g, '');
      const filePath = join(dir, safePath === '/' ? 'index.html' : safePath);
      try {
        const data = readFileSync(filePath);
        const ext = filePath.split('.').pop();
        const mime = { html:'text/html', js:'application/javascript', wgsl:'text/plain' }[ext] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': mime });
        res.end(data);
      } catch {
        res.writeHead(404); res.end('not found');
      }
    });
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolve({ server, port });
    });
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const { server, port } = await startServer(__dir);
  const url = `http://127.0.0.1:${port}/?n=${N}`;

  const browser = await chromium.launch({
    headless: false,          // headed mode → real GPU / Metal on macOS
    args: [
      '--no-sandbox',
      '--enable-unsafe-webgpu',
      '--enable-features=Vulkan,UseSkiaRenderer',
      '--disable-gpu-sandbox',
    ],
  });

  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });

  let fps = 0;
  let error = null;

  try {
    await page.goto(url);

    // Wait for the #result element to contain fps data (benchmark complete)
    const result = await page.waitForFunction(
      () => {
        const el = document.getElementById('result');
        return el && el.textContent && el.textContent.startsWith('fps:') ? el.textContent : null;
      },
      { timeout: TIMEOUT, polling: 200 },
    );

    const text = await result.jsonValue();
    // Parse "fps:123 n:500 avg_fps:120"
    const match = text.match(/fps:(\d+)/);
    if (match) fps = parseInt(match[1]);

    // Also grab console logs for debugging
    const consoleLogs = await page.evaluate(() =>
      window.__klint_bench_logs || []
    );

  } catch (err) {
    error = err.message;
  } finally {
    await browser.close();
    server.close();
  }

  if (error) {
    process.stderr.write(`Benchmark error: ${error}\n`);
    process.stdout.write(`METRIC fps=0\n`);
    process.exit(1);
  }

  // Structured output for autoresearch
  process.stdout.write(`METRIC fps=${fps}\n`);
  process.stdout.write(`n=${N} fps=${fps}\n`);
}

main().catch(err => {
  process.stderr.write(err.stack + '\n');
  process.stdout.write('METRIC fps=0\n');
  process.exit(1);
});
