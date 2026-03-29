#!/bin/bash
set -euo pipefail

# KlintGPU benchmark — measures FPS of 500-shape animated WebGPU scene
# Outputs: METRIC fps=<value>

BENCH_DIR="packages/klint-gpu/benchmark"
BENCH_N="${BENCH_N:-500}"

# ── Quick syntax check on changed TS files ─────────────────────────────────
cd packages/klint-gpu
node_modules_path="../../node_modules"
if [ -d "$node_modules_path/.bin" ]; then
  # Fast type-check (no emit) — skip if no changes
  if command -v tsc >/dev/null 2>&1; then
    tsc --noEmit --skipLibCheck 2>&1 | head -20 || true
  fi
fi
cd ../..

# ── Run benchmark via Playwright ──────────────────────────────────────────
BENCH_N="$BENCH_N" BENCH_TIMEOUT=50000 node packages/klint-gpu/benchmark/run.mjs 2>&1
