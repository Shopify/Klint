import { KlintContext } from "../Klint";

export interface Triangle {
  p1: { x: number; y: number };
  p2: { x: number; y: number };
  p3: { x: number; y: number };
}

type Point2D = { x: number; y: number };

// ════════════════════════════════════════════════════════
// Earcut internals — polygon triangulation with holes
// ════════════════════════════════════════════════════════

class ENode {
  i: number;
  x: number;
  y: number;
  prev!: ENode;
  next!: ENode;
  z: number;
  prevZ: ENode | null;
  nextZ: ENode | null;
  steiner: boolean;

  constructor(i: number, x: number, y: number) {
    this.i = i;
    this.x = x;
    this.y = y;
    this.z = 0;
    this.prevZ = null;
    this.nextZ = null;
    this.steiner = false;
  }
}

function insertNode(i: number, x: number, y: number, last?: ENode): ENode {
  const p = new ENode(i, x, y);
  if (!last) {
    p.prev = p;
    p.next = p;
  } else {
    p.next = last.next;
    p.prev = last;
    last.next.prev = p;
    last.next = p;
  }
  return p;
}

function removeNode(p: ENode): void {
  p.next.prev = p.prev;
  p.prev.next = p.next;
  if (p.prevZ) p.prevZ.nextZ = p.nextZ;
  if (p.nextZ) p.nextZ.prevZ = p.prevZ;
}

function signedArea(
  data: number[],
  start: number,
  end: number,
  dim: number,
): number {
  let sum = 0;
  for (let i = start, j = end - dim; i < end; i += dim) {
    sum += (data[j] - data[i]) * (data[i + 1] + data[j + 1]);
    j = i;
  }
  return sum;
}

function nodeEquals(a: ENode, b: ENode): boolean {
  return a.x === b.x && a.y === b.y;
}

function triArea(p: ENode, q: ENode, r: ENode): number {
  return (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
}

function triSign(n: number): number {
  return n > 0 ? 1 : n < 0 ? -1 : 0;
}

function onSegment(p: ENode, q: ENode, r: ENode): boolean {
  return (
    q.x <= Math.max(p.x, r.x) &&
    q.x >= Math.min(p.x, r.x) &&
    q.y <= Math.max(p.y, r.y) &&
    q.y >= Math.min(p.y, r.y)
  );
}

function segmentsIntersect(
  p1: ENode,
  q1: ENode,
  p2: ENode,
  q2: ENode,
): boolean {
  const o1 = triSign(triArea(p1, q1, p2));
  const o2 = triSign(triArea(p1, q1, q2));
  const o3 = triSign(triArea(p2, q2, p1));
  const o4 = triSign(triArea(p2, q2, q1));
  if (o1 !== o2 && o3 !== o4) return true;
  if (o1 === 0 && onSegment(p1, p2, q1)) return true;
  if (o2 === 0 && onSegment(p1, q2, q1)) return true;
  if (o3 === 0 && onSegment(p2, p1, q2)) return true;
  if (o4 === 0 && onSegment(p2, q1, q2)) return true;
  return false;
}

function pointInTriangle(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  cx: number,
  cy: number,
  px: number,
  py: number,
): boolean {
  return (
    (cx - px) * (ay - py) - (ax - px) * (cy - py) >= 0 &&
    (ax - px) * (by - py) - (bx - px) * (ay - py) >= 0 &&
    (bx - px) * (cy - py) - (cx - px) * (by - py) >= 0
  );
}

function locallyInside(a: ENode, b: ENode): boolean {
  return triArea(a.prev, a, a.next) < 0
    ? triArea(a, b, a.next) >= 0 && triArea(a, a.prev, b) >= 0
    : triArea(a, b, a.prev) < 0 || triArea(a, a.next, b) < 0;
}

function middleInside(a: ENode, b: ENode): boolean {
  let p = a;
  let inside = false;
  const px = (a.x + b.x) / 2;
  const py = (a.y + b.y) / 2;
  do {
    if (
      p.y > py !== p.next.y > py &&
      p.next.y !== p.y &&
      px < ((p.next.x - p.x) * (py - p.y)) / (p.next.y - p.y) + p.x
    )
      inside = !inside;
    p = p.next;
  } while (p !== a);
  return inside;
}

function intersectsPolygon(a: ENode, b: ENode): boolean {
  let p = a;
  do {
    if (
      p.i !== a.i &&
      p.next.i !== a.i &&
      p.i !== b.i &&
      p.next.i !== b.i &&
      segmentsIntersect(p, p.next, a, b)
    )
      return true;
    p = p.next;
  } while (p !== a);
  return false;
}

function isValidDiagonal(a: ENode, b: ENode): boolean {
  return (
    a.next.i !== b.i &&
    a.prev.i !== b.i &&
    !intersectsPolygon(a, b) &&
    ((locallyInside(a, b) &&
      locallyInside(b, a) &&
      middleInside(a, b) &&
      (triArea(a.prev, a, b.prev) !== 0 || triArea(a, b.prev, b) !== 0)) ||
      (nodeEquals(a, b) &&
        triArea(a.prev, a, a.next) > 0 &&
        triArea(b.prev, b, b.next) > 0))
  );
}

function splitPolygon(a: ENode, b: ENode): ENode {
  const a2 = new ENode(a.i, a.x, a.y);
  const b2 = new ENode(b.i, b.x, b.y);
  const an = a.next;
  const bp = b.prev;

  a.next = b;
  b.prev = a;
  a2.next = an;
  an.prev = a2;
  b2.next = a2;
  a2.prev = b2;
  bp.next = b2;
  b2.prev = bp;

  return b2;
}

function zOrder(
  x: number,
  y: number,
  minX: number,
  minY: number,
  invSize: number,
): number {
  let lx = ((x - minX) * invSize) | 0;
  let ly = ((y - minY) * invSize) | 0;
  lx = (lx | (lx << 8)) & 0x00ff00ff;
  lx = (lx | (lx << 4)) & 0x0f0f0f0f;
  lx = (lx | (lx << 2)) & 0x33333333;
  lx = (lx | (lx << 1)) & 0x55555555;
  ly = (ly | (ly << 8)) & 0x00ff00ff;
  ly = (ly | (ly << 4)) & 0x0f0f0f0f;
  ly = (ly | (ly << 2)) & 0x33333333;
  ly = (ly | (ly << 1)) & 0x55555555;
  return lx | (ly << 1);
}

function getLeftmost(start: ENode): ENode {
  let p = start;
  let leftmost = start;
  do {
    if (p.x < leftmost.x || (p.x === leftmost.x && p.y < leftmost.y))
      leftmost = p;
    p = p.next;
  } while (p !== start);
  return leftmost;
}

function sectorContainsSector(m: ENode, p: ENode): boolean {
  return triArea(m.prev, m, p.prev) < 0 && triArea(p.next, m, m.next) < 0;
}

// ── Linked list construction ──

function buildLinkedList(
  data: number[],
  start: number,
  end: number,
  dim: number,
  clockwise: boolean,
): ENode | null {
  let last: ENode | undefined;
  if (clockwise === signedArea(data, start, end, dim) > 0) {
    for (let i = start; i < end; i += dim)
      last = insertNode(i, data[i], data[i + 1], last);
  } else {
    for (let i = end - dim; i >= start; i -= dim)
      last = insertNode(i, data[i], data[i + 1], last);
  }
  if (last && nodeEquals(last, last.next)) {
    removeNode(last);
    last = last.next;
  }
  return last ?? null;
}

function filterPoints(start: ENode, end?: ENode): ENode {
  if (!end) end = start;
  let p = start;
  let again: boolean;
  do {
    again = false;
    if (
      !p.steiner &&
      (nodeEquals(p, p.next) || triArea(p.prev, p, p.next) === 0)
    ) {
      removeNode(p);
      p = end = p.prev;
      if (p === p.next) break;
      again = true;
    } else {
      p = p.next;
    }
  } while (again || p !== end);
  return end;
}

// ── Z-order indexing ──

function sortLinked(list: ENode | null): ENode | null {
  let inSize = 1;
  let numMerges: number;
  let p: ENode | null;
  let q: ENode | null;
  let e: ENode | null;
  let tail: ENode | null;
  let pSize: number;
  let qSize: number;

  do {
    p = list;
    list = null;
    tail = null;
    numMerges = 0;

    while (p) {
      numMerges++;
      q = p;
      pSize = 0;
      for (let i = 0; i < inSize; i++) {
        pSize++;
        q = q.nextZ;
        if (!q) break;
      }
      qSize = inSize;
      while (pSize > 0 || (qSize > 0 && q)) {
        if (pSize !== 0 && (qSize === 0 || !q || p!.z <= q.z)) {
          e = p;
          p = p!.nextZ;
          pSize--;
        } else {
          e = q;
          q = q!.nextZ;
          qSize--;
        }
        if (tail) tail.nextZ = e;
        else list = e;
        e!.prevZ = tail;
        tail = e;
      }
      p = q;
    }

    tail!.nextZ = null;
    inSize *= 2;
  } while (numMerges > 1);

  return list;
}

function indexCurve(
  start: ENode,
  minX: number,
  minY: number,
  invSize: number,
): void {
  let p: ENode | null = start;
  do {
    if (p!.z === 0) p!.z = zOrder(p!.x, p!.y, minX, minY, invSize);
    p!.prevZ = p!.prev;
    p!.nextZ = p!.next;
    p = p!.next;
  } while (p !== start);
  p.prevZ!.nextZ = null;
  p.prevZ = null;
  sortLinked(p);
}

// ── Ear detection ──

function isEar(ear: ENode): boolean {
  const a = ear.prev,
    b = ear,
    c = ear.next;
  if (triArea(a, b, c) >= 0) return false;

  const ax = a.x,
    bx = b.x,
    cx = c.x;
  const ay = a.y,
    by = b.y,
    cy = c.y;
  const x0 = ax < bx ? (ax < cx ? ax : cx) : bx < cx ? bx : cx;
  const y0 = ay < by ? (ay < cy ? ay : cy) : by < cy ? by : cy;
  const x1 = ax > bx ? (ax > cx ? ax : cx) : bx > cx ? bx : cx;
  const y1 = ay > by ? (ay > cy ? ay : cy) : by > cy ? by : cy;

  let p = c.next;
  while (p !== a) {
    if (
      p.x >= x0 &&
      p.x <= x1 &&
      p.y >= y0 &&
      p.y <= y1 &&
      pointInTriangle(ax, ay, bx, by, cx, cy, p.x, p.y) &&
      triArea(p.prev, p, p.next) >= 0
    )
      return false;
    p = p.next;
  }
  return true;
}

function isEarHashed(
  ear: ENode,
  minX: number,
  minY: number,
  invSize: number,
): boolean {
  const a = ear.prev,
    b = ear,
    c = ear.next;
  if (triArea(a, b, c) >= 0) return false;

  const ax = a.x,
    bx = b.x,
    cx = c.x;
  const ay = a.y,
    by = b.y,
    cy = c.y;
  const x0 = ax < bx ? (ax < cx ? ax : cx) : bx < cx ? bx : cx;
  const y0 = ay < by ? (ay < cy ? ay : cy) : by < cy ? by : cy;
  const x1 = ax > bx ? (ax > cx ? ax : cx) : bx > cx ? bx : cx;
  const y1 = ay > by ? (ay > cy ? ay : cy) : by > cy ? by : cy;
  const minZ = zOrder(x0, y0, minX, minY, invSize);
  const maxZ = zOrder(x1, y1, minX, minY, invSize);

  let p = ear.prevZ;
  let n = ear.nextZ;

  while (p && p.z >= minZ && n && n.z <= maxZ) {
    if (
      p.x >= x0 &&
      p.x <= x1 &&
      p.y >= y0 &&
      p.y <= y1 &&
      p !== a &&
      p !== c &&
      pointInTriangle(ax, ay, bx, by, cx, cy, p.x, p.y) &&
      triArea(p.prev, p, p.next) >= 0
    )
      return false;
    p = p.prevZ;

    if (
      n.x >= x0 &&
      n.x <= x1 &&
      n.y >= y0 &&
      n.y <= y1 &&
      n !== a &&
      n !== c &&
      pointInTriangle(ax, ay, bx, by, cx, cy, n.x, n.y) &&
      triArea(n.prev, n, n.next) >= 0
    )
      return false;
    n = n.nextZ;
  }

  while (p && p.z >= minZ) {
    if (
      p.x >= x0 &&
      p.x <= x1 &&
      p.y >= y0 &&
      p.y <= y1 &&
      p !== a &&
      p !== c &&
      pointInTriangle(ax, ay, bx, by, cx, cy, p.x, p.y) &&
      triArea(p.prev, p, p.next) >= 0
    )
      return false;
    p = p.prevZ;
  }

  while (n && n.z <= maxZ) {
    if (
      n.x >= x0 &&
      n.x <= x1 &&
      n.y >= y0 &&
      n.y <= y1 &&
      n !== a &&
      n !== c &&
      pointInTriangle(ax, ay, bx, by, cx, cy, n.x, n.y) &&
      triArea(n.prev, n, n.next) >= 0
    )
      return false;
    n = n.nextZ;
  }

  return true;
}

// ── Hole elimination ──

function findHoleBridge(hole: ENode, outerNode: ENode): ENode | null {
  let p = outerNode;
  const hx = hole.x;
  const hy = hole.y;
  let qx = -Infinity;
  let m: ENode | null = null;

  do {
    if (hy <= p.y && hy >= p.next.y && p.next.y !== p.y) {
      const x = p.x + ((hy - p.y) / (p.next.y - p.y)) * (p.next.x - p.x);
      if (x <= hx && x > qx) {
        qx = x;
        m = p.x < p.next.x ? p : p.next;
        if (x === hx) return m;
      }
    }
    p = p.next;
  } while (p !== outerNode);

  if (!m) return null;

  const stop = m;
  const mx = m.x;
  const my = m.y;
  let tanMin = Infinity;

  p = m;
  do {
    if (
      hx >= p.x &&
      p.x >= mx &&
      hx !== p.x &&
      pointInTriangle(
        hy < my ? hx : qx,
        hy,
        mx,
        my,
        hy < my ? qx : hx,
        hy,
        p.x,
        p.y,
      )
    ) {
      const tan = Math.abs(hy - p.y) / (hx - p.x);
      if (
        locallyInside(p, hole) &&
        (tan < tanMin ||
          (tan === tanMin &&
            (p.x > m!.x || (p.x === m!.x && sectorContainsSector(m!, p)))))
      ) {
        m = p;
        tanMin = tan;
      }
    }
    p = p.next;
  } while (p !== stop);

  return m;
}

function eliminateHole(hole: ENode, outerNode: ENode): ENode {
  const bridge = findHoleBridge(hole, outerNode);
  if (!bridge) return outerNode;
  const bridgeReverse = splitPolygon(bridge, hole);
  filterPoints(bridgeReverse, bridgeReverse.next);
  return filterPoints(bridge, bridge.next);
}

function eliminateHoles(
  data: number[],
  holeIndices: number[],
  outerNode: ENode,
  dim: number,
): ENode {
  const queue: ENode[] = [];
  for (let i = 0, len = holeIndices.length; i < len; i++) {
    const start = holeIndices[i] * dim;
    const end = i < len - 1 ? holeIndices[i + 1] * dim : data.length;
    const list = buildLinkedList(data, start, end, dim, false);
    if (list && list === list.next) list.steiner = true;
    if (list) queue.push(getLeftmost(list));
  }
  queue.sort((a, b) => a.x - b.x);
  for (let i = 0; i < queue.length; i++) {
    outerNode = eliminateHole(queue[i], outerNode);
  }
  return outerNode;
}

// ── Main ear-clipping loop ──

function cureLocalIntersections(
  start: ENode,
  triangles: number[],
  dim: number,
): ENode {
  let p = start;
  do {
    const a = p.prev;
    const b = p.next.next;
    if (
      !nodeEquals(a, b) &&
      segmentsIntersect(a, p, p.next, b) &&
      locallyInside(a, b) &&
      locallyInside(b, a)
    ) {
      triangles.push((a.i / dim) | 0);
      triangles.push((p.i / dim) | 0);
      triangles.push((b.i / dim) | 0);
      removeNode(p);
      removeNode(p.next);
      p = start = b;
    }
    p = p.next;
  } while (p !== start);
  return filterPoints(p);
}

function splitEarcut(
  start: ENode,
  triangles: number[],
  dim: number,
  minX: number,
  minY: number,
  invSize: number,
): void {
  let a = start;
  do {
    let b = a.next.next;
    while (b !== a.prev) {
      if (a.i !== b.i && isValidDiagonal(a, b)) {
        let c = splitPolygon(a, b);
        a = filterPoints(a, a.next);
        c = filterPoints(c, c.next);
        earcutLinked(a, triangles, dim, minX, minY, invSize, 0);
        earcutLinked(c, triangles, dim, minX, minY, invSize, 0);
        return;
      }
      b = b.next;
    }
    a = a.next;
  } while (a !== start);
}

function earcutLinked(
  ear: ENode | null,
  triangles: number[],
  dim: number,
  minX: number,
  minY: number,
  invSize: number,
  pass: number,
): void {
  if (!ear) return;
  if (!pass && invSize) indexCurve(ear, minX, minY, invSize);

  let stop: ENode = ear;
  while (ear!.prev !== ear!.next) {
    const prev: ENode = ear!.prev;
    const next: ENode = ear!.next;

    if (invSize ? isEarHashed(ear!, minX, minY, invSize) : isEar(ear!)) {
      triangles.push((prev.i / dim) | 0);
      triangles.push((ear!.i / dim) | 0);
      triangles.push((next.i / dim) | 0);
      removeNode(ear!);
      ear = next.next;
      stop = next.next;
      continue;
    }

    ear = next;

    if (ear === stop) {
      if (!pass) {
        earcutLinked(filterPoints(ear), triangles, dim, minX, minY, invSize, 1);
      } else if (pass === 1) {
        ear = cureLocalIntersections(filterPoints(ear), triangles, dim);
        earcutLinked(ear, triangles, dim, minX, minY, invSize, 2);
      } else if (pass === 2) {
        splitEarcut(ear, triangles, dim, minX, minY, invSize);
      }
      break;
    }
  }
}

// ── Top-level earcut entry point ──

function earcutImpl(
  data: number[],
  holeIndices?: number[] | null,
  dim: number = 2,
): number[] {
  const hasHoles = holeIndices && holeIndices.length;
  const outerLen = hasHoles ? holeIndices[0] * dim : data.length;
  let outerNode = buildLinkedList(data, 0, outerLen, dim, true);
  const triangles: number[] = [];

  if (!outerNode || outerNode.next === outerNode.prev) return triangles;

  let minX = 0,
    minY = 0,
    maxX = 0,
    maxY = 0,
    invSize = 0;

  if (hasHoles)
    outerNode = eliminateHoles(data, holeIndices!, outerNode, dim);

  if (data.length > 80 * dim) {
    minX = maxX = data[0];
    minY = maxY = data[1];
    for (let i = dim; i < outerLen; i += dim) {
      const x = data[i],
        y = data[i + 1];
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
    invSize = Math.max(maxX - minX, maxY - minY);
    invSize = invSize !== 0 ? 32767 / invSize : 0;
  }

  earcutLinked(outerNode, triangles, dim, minX, minY, invSize, 0);
  return triangles;
}

// ════════════════════════════════════════════════════════
// Bowyer-Watson Delaunay triangulation
// ════════════════════════════════════════════════════════

interface BWTriangle {
  p1: Point2D;
  p2: Point2D;
  p3: Point2D;
  cx: number;
  cy: number;
  cr2: number;
}

function circumcircle(p1: Point2D, p2: Point2D, p3: Point2D): BWTriangle {
  const ax = p1.x,
    ay = p1.y;
  const bx = p2.x,
    by = p2.y;
  const cx = p3.x,
    cy = p3.y;
  const d = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by));

  if (Math.abs(d) < 1e-10) {
    const ccx = (ax + bx + cx) / 3;
    const ccy = (ay + by + cy) / 3;
    return { p1, p2, p3, cx: ccx, cy: ccy, cr2: Infinity };
  }

  const ux =
    ((ax * ax + ay * ay) * (by - cy) +
      (bx * bx + by * by) * (cy - ay) +
      (cx * cx + cy * cy) * (ay - by)) /
    d;
  const uy =
    ((ax * ax + ay * ay) * (cx - bx) +
      (bx * bx + by * by) * (ax - cx) +
      (cx * cx + cy * cy) * (bx - ax)) /
    d;
  const cr2 = (ax - ux) * (ax - ux) + (ay - uy) * (ay - uy);

  return { p1, p2, p3, cx: ux, cy: uy, cr2 };
}

function bowyerWatson(points: Point2D[]): Triangle[] {
  if (points.length < 3) return [];

  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }

  const dx = maxX - minX;
  const dy = maxY - minY;
  const delta = Math.max(dx, dy);
  const midX = (minX + maxX) / 2;
  const midY = (minY + maxY) / 2;

  const st1: Point2D = { x: midX - 20 * delta, y: midY - delta };
  const st2: Point2D = { x: midX, y: midY + 20 * delta };
  const st3: Point2D = { x: midX + 20 * delta, y: midY - delta };

  let triangles: BWTriangle[] = [circumcircle(st1, st2, st3)];

  for (const point of points) {
    const bad: BWTriangle[] = [];
    for (const tri of triangles) {
      const pdx = point.x - tri.cx;
      const pdy = point.y - tri.cy;
      if (pdx * pdx + pdy * pdy < tri.cr2) bad.push(tri);
    }

    const boundary: Array<{ a: Point2D; b: Point2D }> = [];
    for (const tri of bad) {
      const edges = [
        { a: tri.p1, b: tri.p2 },
        { a: tri.p2, b: tri.p3 },
        { a: tri.p3, b: tri.p1 },
      ];
      for (const edge of edges) {
        let shared = false;
        for (const other of bad) {
          if (other === tri) continue;
          if (
            (edge.a === other.p1 || edge.a === other.p2 || edge.a === other.p3) &&
            (edge.b === other.p1 || edge.b === other.p2 || edge.b === other.p3)
          ) {
            shared = true;
            break;
          }
        }
        if (!shared) boundary.push(edge);
      }
    }

    triangles = triangles.filter((t) => !bad.includes(t));
    for (const edge of boundary) {
      triangles.push(circumcircle(edge.a, edge.b, point));
    }
  }

  return triangles
    .filter(
      (t) =>
        t.p1 !== st1 &&
        t.p1 !== st2 &&
        t.p1 !== st3 &&
        t.p2 !== st1 &&
        t.p2 !== st2 &&
        t.p2 !== st3 &&
        t.p3 !== st1 &&
        t.p3 !== st2 &&
        t.p3 !== st3,
    )
    .map((t) => ({ p1: t.p1, p2: t.p2, p3: t.p3 }));
}

// ════════════════════════════════════════════════════════
// Public API
// ════════════════════════════════════════════════════════

export class Delaunay {
  /**
   * Earcut polygon triangulation — triangulates a polygon (with optional holes)
   * given as a flat coordinate array.
   *
   * Returns an array of vertex indices where every three consecutive indices
   * form a triangle.
   *
   * @param vertices  Flat array of coordinates [x0,y0, x1,y1, ...]
   * @param holes     Array of hole start indices (in the vertices array, NOT flat index)
   * @param dimensions Coordinate dimensions, default 2
   */
  static earcut(
    vertices: number[],
    holes?: number[] | null,
    dimensions?: number,
  ): number[] {
    return earcutImpl(vertices, holes, dimensions ?? 2);
  }

  /**
   * Convert nested point arrays into the flat format earcut expects.
   *
   * @param rings  Array of rings: [outerRing, hole1, hole2, ...]
   *               Each ring is an array of {x,y} points.
   * @returns { vertices, holes, dimensions }
   */
  static flatten(
    rings: Point2D[][],
  ): { vertices: number[]; holes: number[]; dimensions: number } {
    const vertices: number[] = [];
    const holes: number[] = [];
    let count = 0;

    for (let i = 0; i < rings.length; i++) {
      if (i > 0) holes.push(count);
      for (const pt of rings[i]) {
        vertices.push(pt.x, pt.y);
        count++;
      }
    }

    return { vertices, holes, dimensions: 2 };
  }

  /**
   * Measure triangulation quality. Returns the max deviation from the polygon
   * area as a ratio. 0 means perfect, >0 means triangles don't perfectly
   * cover the polygon.
   */
  static deviation(
    data: number[],
    holeIndices: number[] | null | undefined,
    dim: number,
    triangles: number[],
  ): number {
    const hasHoles = holeIndices && holeIndices.length;
    const outerLen = hasHoles ? holeIndices[0] * dim : data.length;

    let polygonArea = Math.abs(signedArea(data, 0, outerLen, dim));
    if (hasHoles) {
      for (let i = 0, len = holeIndices.length; i < len; i++) {
        const start = holeIndices[i] * dim;
        const end = i < len - 1 ? holeIndices[i + 1] * dim : data.length;
        polygonArea -= Math.abs(signedArea(data, start, end, dim));
      }
    }

    let trianglesArea = 0;
    for (let i = 0; i < triangles.length; i += 3) {
      const a = triangles[i] * dim;
      const b = triangles[i + 1] * dim;
      const c = triangles[i + 2] * dim;
      trianglesArea += Math.abs(
        (data[a] - data[c]) * (data[b + 1] - data[a + 1]) -
          (data[a] - data[b]) * (data[c + 1] - data[a + 1]),
      );
    }

    return polygonArea === 0 && trianglesArea === 0
      ? 0
      : Math.abs((trianglesArea - polygonArea) / polygonArea);
  }

  /**
   * High-level polygon triangulation with holes.
   * Takes {x,y} point arrays and returns Triangle objects.
   *
   * @param outer  Outer contour points
   * @param holes  Optional array of hole contours
   */
  static triangulatePolygon(
    outer: Point2D[],
    holes?: Point2D[][],
  ): Triangle[] {
    const rings = [outer, ...(holes || [])];
    const { vertices, holes: holeIndices } = Delaunay.flatten(rings);
    const indices = earcutImpl(
      vertices,
      holeIndices.length ? holeIndices : null,
    );

    const allPoints = rings.flat();
    const result: Triangle[] = [];
    for (let i = 0; i < indices.length; i += 3) {
      result.push({
        p1: allPoints[indices[i]],
        p2: allPoints[indices[i + 1]],
        p3: allPoints[indices[i + 2]],
      });
    }
    return result;
  }

  /**
   * Delaunay triangulation of a point cloud (Bowyer-Watson algorithm).
   */
  static triangulate(points: Point2D[]): Triangle[] {
    return bowyerWatson(points);
  }

  /**
   * Draw an array of triangles to the canvas.
   */
  static drawTriangles(
    ctx: KlintContext,
    triangles: Triangle[],
    options?: {
      fill?: boolean;
      stroke?: boolean;
      fillStyle?: string;
      strokeStyle?: string;
    },
  ): void {
    const { fill = true, stroke = true } = options || {};
    for (const tri of triangles) {
      ctx.beginPath();
      ctx.moveTo(tri.p1.x, tri.p1.y);
      ctx.lineTo(tri.p2.x, tri.p2.y);
      ctx.lineTo(tri.p3.x, tri.p3.y);
      ctx.closePath();
      if (fill) {
        if (options?.fillStyle) {
          const prev = ctx.fillStyle;
          ctx.fillStyle = options.fillStyle;
          ctx.fill();
          ctx.fillStyle = prev;
        } else {
          ctx.fill();
        }
      }
      if (stroke) {
        if (options?.strokeStyle) {
          const prev = ctx.strokeStyle;
          ctx.strokeStyle = options.strokeStyle;
          ctx.stroke();
          ctx.strokeStyle = prev;
        } else {
          ctx.stroke();
        }
      }
    }
  }

  /**
   * Triangulate a polygon (with optional holes) and draw it in one call.
   */
  static drawPolygon(
    ctx: KlintContext,
    outer: Point2D[],
    holes?: Point2D[][],
    options?: {
      fill?: boolean;
      stroke?: boolean;
      fillStyle?: string;
      strokeStyle?: string;
    },
  ): Triangle[] {
    const triangles = Delaunay.triangulatePolygon(outer, holes);
    Delaunay.drawTriangles(ctx, triangles, options);
    return triangles;
  }

  /**
   * Calculate the circumcenter of a triangle.
   */
  static circumcenter(triangle: Triangle): Point2D {
    const { p1, p2, p3 } = triangle;
    const ax = p1.x,
      ay = p1.y;
    const bx = p2.x,
      by = p2.y;
    const cx = p3.x,
      cy = p3.y;
    const d = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by));
    if (Math.abs(d) < 1e-6) {
      return { x: (ax + bx + cx) / 3, y: (ay + by + cy) / 3 };
    }
    return {
      x:
        ((ax * ax + ay * ay) * (by - cy) +
          (bx * bx + by * by) * (cy - ay) +
          (cx * cx + cy * cy) * (ay - by)) /
        d,
      y:
        ((ax * ax + ay * ay) * (cx - bx) +
          (bx * bx + by * by) * (ax - cx) +
          (cx * cx + cy * cy) * (bx - ax)) /
        d,
    };
  }

  /**
   * Check if a point is inside a triangle's circumcircle.
   */
  static inCircumcircle(point: Point2D, triangle: Triangle): boolean {
    const center = Delaunay.circumcenter(triangle);
    const r2 =
      (triangle.p1.x - center.x) ** 2 + (triangle.p1.y - center.y) ** 2;
    const d2 = (point.x - center.x) ** 2 + (point.y - center.y) ** 2;
    return d2 < r2;
  }

  /**
   * Generate Voronoi edges from a Delaunay triangulation.
   * Each edge connects circumcenters of adjacent triangles.
   */
  static voronoi(
    triangles: Triangle[],
  ): Array<{ x1: number; y1: number; x2: number; y2: number }> {
    const edges: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
    const centers = triangles.map((t) => Delaunay.circumcenter(t));
    const edgeMap = new Map<string, number>();
    const key = (a: Point2D, b: Point2D) => {
      const k1 = `${a.x},${a.y}`;
      const k2 = `${b.x},${b.y}`;
      return k1 < k2 ? `${k1}|${k2}` : `${k2}|${k1}`;
    };

    for (let i = 0; i < triangles.length; i++) {
      const { p1, p2, p3 } = triangles[i];
      for (const [a, b] of [[p1, p2], [p2, p3], [p3, p1]] as const) {
        const k = key(a, b);
        const j = edgeMap.get(k);
        if (j === undefined) {
          edgeMap.set(k, i);
        } else {
          edges.push({
            x1: centers[i].x,
            y1: centers[i].y,
            x2: centers[j].x,
            y2: centers[j].y,
          });
        }
      }
    }
    return edges;
  }
}
