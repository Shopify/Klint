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
    // Parse all metrics from result line
    const mFps     = text.match(/fps:([\d.]+)/);
    const mFrameMs = text.match(/frame_ms:([\d.]+)/);
    const mSpeedup = text.match(/speedup:([\d.]+)/);
    const mJsMs    = text.match(/js_ms:([\d.]+)/);
    const mGpuMs   = text.match(/gpu_wait_ms:([\d.]+)/);
    if (mFps)     fps = parseInt(mFps[1]);
    if (mFrameMs) process.stdout.write(`frame_ms=${mFrameMs[1]}\n`);
    if (mSpeedup) process.stdout.write(`speedup=${mSpeedup[1]}\n`);
    if (mJsMs)    process.stdout.write(`js_ms=${mJsMs[1]}\n`);
    if (mGpuMs)   process.stdout.write(`gpu_wait_ms=${mGpuMs[1]}\n`);
    const mGpuCFps = text.match(/gpu_compute_fps:([\d.]+)/);
    const mGpuCMs  = text.match(/gpu_compute_ms:([\d.]+)/);
    if (mGpuCFps) process.stdout.write(`gpu_compute_fps=${mGpuCFps[1]}\n`);
    if (mGpuCMs)  process.stdout.write(`gpu_compute_ms=${mGpuCMs[1]}\n`);
    const mOpaqueFps = text.match(/opaque_fps:([\d.]+)/);
    const mOpaqueMs  = text.match(/opaque_ms:([\d.]+)/);
    if (mOpaqueFps) process.stdout.write(`opaque_fps=${mOpaqueFps[1]}\n`);
    if (mOpaqueMs)  process.stdout.write(`opaque_ms=${mOpaqueMs[1]}\n`);
    const mGcOFps = text.match(/gc_opaque_fps:([\d.]+)/);
    const mGcOMs  = text.match(/gc_opaque_ms:([\d.]+)/);
    if (mGcOFps) process.stdout.write(`gc_opaque_fps=${mGcOFps[1]}\n`);
    if (mGcOMs)  process.stdout.write(`gc_opaque_ms=${mGcOMs[1]}\n`);
    if (mFrameMs) process.stdout.write(`METRIC frame_ms=${mFrameMs[1]}\n`);
    if (mSpeedup) process.stdout.write(`METRIC speedup=${mSpeedup[1]}\n`);

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
