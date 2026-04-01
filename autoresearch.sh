#!/bin/bash
set -euo pipefail

# KlintGPU autoresearch — API coverage session
# Primary metric: fps (must stay ≥ 370 — no regression)
# Secondary: TypeScript must compile clean

BENCH_N="${BENCH_N:-50000}"
# fps floor updated: user says 200fps is acceptable (new baseline after renderer rebuild)

# ── TypeScript check (fast, <5s) ─────────────────────────────────────────────
cd packages/klint-gpu
echo "--- TypeScript check ---"
TS_ERRORS=$(npx tsc --noEmit --skipLibCheck 2>&1 | grep -c "error TS" || true)
echo "TS errors: $TS_ERRORS"
if [ "$TS_ERRORS" -gt "0" ]; then
  npx tsc --noEmit --skipLibCheck 2>&1 | head -20
  echo "METRIC fps=0"
  exit 1
fi
echo "TypeScript: CLEAN"
cd ../..

# ── Benchmark (fps must not regress) ─────────────────────────────────────────
BENCH_N="$BENCH_N" BENCH_TIMEOUT=120000 node packages/klint-gpu/benchmark/run.mjs 2>&1
