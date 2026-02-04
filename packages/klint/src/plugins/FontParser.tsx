// Working miniParser - Direct bundle of typr-minimal components
// Based on the proven working version from test_typr_minimal.html

// Type definitions
interface BinaryBuffers {
  buff: ArrayBuffer;
  int8: Int8Array;
  uint8: Uint8Array;
  int16: Int16Array;
  uint16: Uint16Array;
  int32: Int32Array;
  uint32: Uint32Array;
}

// Binary reading utilities
class BinaryReader {
  t: BinaryBuffers;

  constructor() {
    const ab = new ArrayBuffer(8);
    this.t = {
      buff: ab,
      int8: new Int8Array(ab),
      uint8: new Uint8Array(ab),
      int16: new Int16Array(ab),
      uint16: new Uint16Array(ab),
      int32: new Int32Array(ab),
      uint32: new Uint32Array(ab),
    };
  }

  readFixed(data: Uint8Array, o: number): number {
    return (
      ((data[o] << 8) | data[o + 1]) +
      ((data[o + 2] << 8) | data[o + 3]) / (256 * 256 + 4)
    );
  }

  readF2dot14(data: Uint8Array, o: number): number {
    const num = this.readShort(data, o);
    return num / 16384;
  }

  readInt(buff: Uint8Array, p: number): number {
    const a = this.t.uint8;
    a[0] = buff[p + 3];
    a[1] = buff[p + 2];
    a[2] = buff[p + 1];
    a[3] = buff[p];
    return this.t.int32[0];
  }

  readInt8(buff: Uint8Array, p: number): number {
    const a = this.t.uint8;
    a[0] = buff[p];
    return this.t.int8[0];
  }

  readShort(buff: Uint8Array, p: number): number {
    const a = this.t.uint16;
    a[0] = (buff[p] << 8) | buff[p + 1];
    return this.t.int16[0];
  }

  readUshort(buff: Uint8Array, p: number): number {
    return (buff[p] << 8) | buff[p + 1];
  }

  readUshorts(buff: Uint8Array, p: number, len: number): number[] {
    const arr: number[] = [];
    for (let i = 0; i < len; i++) {
      arr.push(this.readUshort(buff, p + i * 2));
    }
    return arr;
  }

  readUint(buff: Uint8Array, p: number): number {
    const a = this.t.uint8;
    a[3] = buff[p];
    a[2] = buff[p + 1];
    a[1] = buff[p + 2];
    a[0] = buff[p + 3];
    return this.t.uint32[0];
  }

  readUint64(buff: Uint8Array, p: number): number {
    return (
      this.readUint(buff, p) * (0xffffffff + 1) + this.readUint(buff, p + 4)
    );
  }

  readASCII(buff: Uint8Array, p: number, l: number): string {
    let s = "";
    for (let i = 0; i < l; i++) s += String.fromCharCode(buff[p + i]);
    return s;
  }

  readBytes(buff: Uint8Array, p: number, l: number): number[] {
    const arr: number[] = [];
    for (let i = 0; i < l; i++) arr.push(buff[p + i]);
    return arr;
  }
}

const bin = new BinaryReader();

// Internal types for font parsing
interface ContourSegment {
  cmd: string;
  coords: number[];
}

interface Contour {
  startX: number;
  startY: number;
  segments: ContourSegment[];
}

// FontParser Types - Clean interfaces for creative coding
export interface FontPoint {
  x: number;
  y: number;
  contour: number;
}

export interface FontLetter {
  center: { x: number; y: number };
  letterIndex: number;
  wordIndex: number;
  lineIndex: number;
  width: number;
  height: number;
  char?: string;
}

export interface FontLetterWithPath extends FontLetter {
  path: Path2D;
}

export interface FontLetterWithPoints extends FontLetter {
  shape: FontPoint[];
}

export interface FontTextBlock {
  width: number;
  height: number;
}

export interface FontPathsResult {
  letters: FontLetterWithPath[];
  block: FontTextBlock;
}

export interface FontPointsResult {
  letters: FontLetterWithPoints[];
  block: FontTextBlock;
}

export interface FontTextOptions {
  align?: "left" | "center" | "right";
  baseline?: "top" | "center" | "bottom" | "baseline";
  anchor?: "default" | "center";
  letterSpacing?: number;
  lineSpacing?: number;
  wordSpacing?: number;
  sampling?: number;
  axisValues?: number[]; // For variable fonts
}

// Main FontData interface - what you get when you load a font
export interface FontData {
  toPaths(
    text: string,
    size?: number,
    options?: FontTextOptions
  ): FontPathsResult;
  toPoints(
    text: string,
    size?: number,
    options?: FontTextOptions
  ): FontPointsResult;
  layoutText(
    font: any,
    text: string,
    size: number,
    options?: FontTextOptions
  ): any;

  // Font metadata
  head?: {
    unitsPerEm: number;
    xMin: number;
    yMin: number;
    xMax: number;
    yMax: number;
  };
  hhea?: { ascender: number; descender: number; lineGap: number };
  name?: { fontFamily: string; postScriptName: string };
  fvar?: any; // Variable font axis data

  [key: string]: any;
}

// Utility to find table in font data
function findTable(
  data: Uint8Array,
  tab: string,
  foff: number = 0
): [number, number] | null {
  const numTables = bin.readUshort(data, foff + 4);
  let offset = foff + 12;

  for (let i = 0; i < numTables; i++) {
    const tag = bin.readASCII(data, offset, 4);
    const checkSum = bin.readUint(data, offset + 4);
    const toffset = bin.readUint(data, offset + 8);
    const length = bin.readUint(data, offset + 12);
    if (tag === tab) return [toffset, length];
    offset += 16;
  }
  return null;
}

// Core table parsers
const Tables: any = {
  head: {
    parseTab(data: Uint8Array, offset: number, length: number): any {
      const obj: any = {};
      const tableVersion = bin.readFixed(data, offset);
      offset += 4;

      obj.fontRevision = bin.readFixed(data, offset);
      offset += 4;
      const checkSumAdjustment = bin.readUint(data, offset);
      offset += 4;
      const magicNumber = bin.readUint(data, offset);
      offset += 4;
      obj.flags = bin.readUshort(data, offset);
      offset += 2;
      obj.unitsPerEm = bin.readUshort(data, offset);
      offset += 2;
      obj.created = bin.readUint64(data, offset);
      offset += 8;
      obj.modified = bin.readUint64(data, offset);
      offset += 8;
      obj.xMin = bin.readShort(data, offset);
      offset += 2;
      obj.yMin = bin.readShort(data, offset);
      offset += 2;
      obj.xMax = bin.readShort(data, offset);
      offset += 2;
      obj.yMax = bin.readShort(data, offset);
      offset += 2;
      obj.macStyle = bin.readUshort(data, offset);
      offset += 2;
      obj.lowestRecPPEM = bin.readUshort(data, offset);
      offset += 2;
      obj.fontDirectionHint = bin.readShort(data, offset);
      offset += 2;
      obj.indexToLocFormat = bin.readShort(data, offset);
      offset += 2;
      obj.glyphDataFormat = bin.readShort(data, offset);
      offset += 2;
      return obj;
    },
  },

  maxp: {
    parseTab(data: Uint8Array, offset: number, length: number): any {
      const obj: any = {};
      const ver = bin.readUint(data, offset);
      offset += 4;
      obj.numGlyphs = bin.readUshort(data, offset);
      offset += 2;
      return obj;
    },
  },

  hhea: {
    parseTab(data: Uint8Array, offset: number, length: number): any {
      const obj: any = {};
      const tableVersion = bin.readFixed(data, offset);
      offset += 4;

      const keys = [
        "ascender",
        "descender",
        "lineGap",
        "advanceWidthMax",
        "minLeftSideBearing",
        "minRightSideBearing",
        "xMaxExtent",
        "caretSlopeRise",
        "caretSlopeRun",
        "caretOffset",
        "res0",
        "res1",
        "res2",
        "res3",
        "metricDataFormat",
        "numberOfHMetrics",
      ];

      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const func =
          key === "advanceWidthMax" || key === "numberOfHMetrics"
            ? bin.readUshort
            : bin.readShort;
        obj[key] = func.call(bin, data, offset + i * 2);
      }
      return obj;
    },
  },

  hmtx: {
    parseTab(data: Uint8Array, offset: number, length: number, font: any): any {
      const aWidth: number[] = [];
      const lsBearing: number[] = [];

      const nG = font.maxp.numGlyphs;
      const nH = font.hhea.numberOfHMetrics;
      let aw = 0,
        lsb = 0,
        i = 0;

      while (i < nH) {
        aw = bin.readUshort(data, offset + (i << 2));
        lsb = bin.readShort(data, offset + (i << 2) + 2);
        aWidth.push(aw);
        lsBearing.push(lsb);
        i++;
      }
      while (i < nG) {
        aWidth.push(aw);
        lsBearing.push(lsb);
        i++;
      }

      return { aWidth, lsBearing };
    },
  },

  loca: {
    parseTab(
      data: Uint8Array,
      offset: number,
      length: number,
      font: any
    ): number[] {
      const obj: number[] = [];
      const ver = font.head.indexToLocFormat;
      const len = font.maxp.numGlyphs + 1;

      if (ver === 0) {
        for (let i = 0; i < len; i++) {
          obj.push(bin.readUshort(data, offset + (i << 1)) << 1);
        }
      }
      if (ver === 1) {
        for (let i = 0; i < len; i++) {
          obj.push(bin.readUint(data, offset + (i << 2)));
        }
      }

      return obj;
    },
  },

  kern: {
    parseTab(data: Uint8Array, offset: number, length: number, font: any): any {
      const version = bin.readUshort(data, offset);
      if (version === 1) return this.parseV1(data, offset, length, font);
      const nTables = bin.readUshort(data, offset + 2);
      offset += 4;

      const map = { glyph1: [], rval: [] };
      for (let i = 0; i < nTables; i++) {
        offset += 2;
        const length = bin.readUshort(data, offset);
        offset += 2;
        const coverage = bin.readUshort(data, offset);
        offset += 2;
        let format = coverage >>> 8;
        format &= 0xf;
        if (format === 0) offset = this.readFormat0(data, offset, map);
      }
      return map;
    },

    parseV1(data: Uint8Array, offset: number, length: number, font: any): any {
      const version = bin.readFixed(data, offset);
      const nTables = bin.readUint(data, offset + 4);
      offset += 8;

      const map = { glyph1: [], rval: [] };
      for (let i = 0; i < nTables; i++) {
        const length = bin.readUint(data, offset);
        offset += 4;
        const coverage = bin.readUshort(data, offset);
        offset += 2;
        const tupleIndex = bin.readUshort(data, offset);
        offset += 2;
        const format = coverage & 0xff;
        if (format === 0) offset = this.readFormat0(data, offset, map);
      }
      return map;
    },

    readFormat0(data: Uint8Array, offset: number, map: any): number {
      let pleft = -1;
      const nPairs = bin.readUshort(data, offset);
      const searchRange = bin.readUshort(data, offset + 2);
      const entrySelector = bin.readUshort(data, offset + 4);
      const rangeShift = bin.readUshort(data, offset + 6);
      offset += 8;

      for (let j = 0; j < nPairs; j++) {
        const left = bin.readUshort(data, offset);
        offset += 2;
        const right = bin.readUshort(data, offset);
        offset += 2;
        const value = bin.readShort(data, offset);
        offset += 2;

        if (left !== pleft) {
          map.glyph1.push(left);
          map.rval.push({ glyph2: [], vals: [] });
        }
        const rval = map.rval[map.rval.length - 1];
        rval.glyph2.push(right);
        rval.vals.push(value);
        pleft = left;
      }
      return offset;
    },
  },
};

// Character mapping table parser
const cmap = {
  parseTab(data: Uint8Array, offset: number, length: number): any {
    const obj: any = { tables: [], ids: {}, off: offset };
    data = new Uint8Array(data.buffer, offset, length);
    offset = 0;

    const version = bin.readUshort(data, offset);
    offset += 2;
    const numTables = bin.readUshort(data, offset);
    offset += 2;

    const offs: number[] = [];

    for (let i = 0; i < numTables; i++) {
      const platformID = bin.readUshort(data, offset);
      offset += 2;
      const encodingID = bin.readUshort(data, offset);
      offset += 2;
      const noffset = bin.readUint(data, offset);
      offset += 4;

      const id = "p" + platformID + "e" + encodingID;

      let tind = offs.indexOf(noffset);

      if (tind === -1) {
        tind = obj.tables.length;
        let subt: any = {};
        offs.push(noffset);
        const format = (subt.format = bin.readUshort(data, noffset));
        if (format === 0) subt = this.parse0(data, noffset, subt);
        else if (format === 4) subt = this.parse4(data, noffset, subt);
        else if (format === 6) subt = this.parse6(data, noffset, subt);
        else if (format === 12) subt = this.parse12(data, noffset, subt);
        obj.tables.push(subt);
      }

      obj.ids[id] = tind;
    }
    return obj;
  },

  parse0(data: Uint8Array, offset: number, obj: any): any {
    const startOffset = offset;
    const format = bin.readUshort(data, offset);
    offset += 2;
    const length = bin.readUshort(data, offset);
    offset += 2;
    const language = bin.readUshort(data, offset);
    offset += 2;

    obj.map = [] as number[];
    for (let i = 0; i < 256; i++) obj.map.push(data[offset + i]);

    return obj;
  },

  parse4(data: Uint8Array, offset: number, obj: any): any {
    const startOffset = offset;
    const format = bin.readUshort(data, offset);
    offset += 2;
    const length = bin.readUshort(data, offset);
    offset += 2;
    const language = bin.readUshort(data, offset);
    offset += 2;
    const segCountX2 = bin.readUshort(data, offset);
    offset += 2;
    const segCount = segCountX2 >>> 1;
    obj.searchRange = bin.readUshort(data, offset);
    offset += 2;
    obj.entrySelector = bin.readUshort(data, offset);
    offset += 2;
    obj.rangeShift = bin.readUshort(data, offset);
    offset += 2;

    obj.endCount = bin.readUshorts(data, offset, segCount);
    offset += segCount * 2;
    offset += 2;
    obj.startCount = bin.readUshorts(data, offset, segCount);
    offset += segCount * 2;
    obj.idDelta = [] as number[];
    for (let i = 0; i < segCount; i++) {
      obj.idDelta.push(bin.readShort(data, offset));
      offset += 2;
    }
    obj.idRangeOffset = bin.readUshorts(data, offset, segCount);
    offset += segCount * 2;
    obj.glyphIdArray = bin.readUshorts(
      data,
      offset,
      (startOffset + length - offset) >> 1
    );

    return obj;
  },

  parse6(data: Uint8Array, offset: number, obj: any): any {
    const startOffset = offset;
    const format = bin.readUshort(data, offset);
    offset += 2;
    const length = bin.readUshort(data, offset);
    offset += 2;
    const language = bin.readUshort(data, offset);
    offset += 2;
    obj.firstCode = bin.readUshort(data, offset);
    offset += 2;
    obj.entryCount = bin.readUshort(data, offset);
    offset += 2;

    obj.glyphIdArray = bin.readUshorts(data, offset, obj.entryCount);

    return obj;
  },

  parse12(data: Uint8Array, offset: number, obj: any): any {
    const startOffset = offset;
    offset += 4;
    const length = bin.readUint(data, offset);
    offset += 4;
    const language = bin.readUint(data, offset);
    offset += 4;
    const nGroups = bin.readUint(data, offset) * 3;
    offset += 4;

    obj.groups = new Uint32Array(nGroups);
    for (let i = 0; i < nGroups; i += 3) {
      obj.groups[i] = bin.readUint(data, offset + (i << 2));
      obj.groups[i + 1] = bin.readUint(data, offset + (i << 2) + 4);
      obj.groups[i + 2] = bin.readUint(data, offset + (i << 2) + 8);
    }

    return obj;
  },
};

// Glyph outline table parser
const glyf = {
  parseTab(data: any, offset: any, length: any, font: any): any {
    const obj = [];
    const ng = font.maxp.numGlyphs;
    for (let g = 0; g < ng; g++) obj.push(null);
    return obj;
  },

  parseGlyf(font: any, g: any): any {
    const data = font._data;
    const loca = font.loca;

    if (loca[g] === loca[g + 1]) return null;

    const offset = findTable(data, "glyf", font._offset)![0] + loca[g];
    const gl: any = {};

    gl.noc = bin.readShort(data, offset); // number of contours
    let off = offset + 2;
    gl.xMin = bin.readShort(data, off);
    off += 2;
    gl.yMin = bin.readShort(data, off);
    off += 2;
    gl.xMax = bin.readShort(data, off);
    off += 2;
    gl.yMax = bin.readShort(data, off);
    off += 2;

    if (gl.xMin >= gl.xMax || gl.yMin >= gl.yMax) return null;

    if (gl.noc > 0) {
      // Simple glyph
      gl.endPts = [];
      for (let i = 0; i < gl.noc; i++) {
        gl.endPts.push(bin.readUshort(data, off));
        off += 2;
      }

      const instructionLength = bin.readUshort(data, off);
      off += 2;
      if (data.length - off < instructionLength) return null;
      gl.instructions = bin.readBytes(data, off, instructionLength);
      off += instructionLength;

      const crdnum = gl.endPts[gl.noc - 1] + 1;
      gl.flags = [];
      for (let i = 0; i < crdnum; i++) {
        const flag = data[off];
        off++;
        gl.flags.push(flag);
        if ((flag & 8) !== 0) {
          const rep = data[off];
          off++;
          for (let j = 0; j < rep; j++) {
            gl.flags.push(flag);
            i++;
          }
        }
      }

      gl.xs = [];
      for (let i = 0; i < crdnum; i++) {
        const i8 = (gl.flags[i] & 2) !== 0;
        const same = (gl.flags[i] & 16) !== 0;
        if (i8) {
          gl.xs.push(same ? data[off] : -data[off]);
          off++;
        } else {
          if (same) gl.xs.push(0);
          else {
            gl.xs.push(bin.readShort(data, off));
            off += 2;
          }
        }
      }

      gl.ys = [];
      for (let i = 0; i < crdnum; i++) {
        const i8 = (gl.flags[i] & 4) !== 0;
        const same = (gl.flags[i] & 32) !== 0;
        if (i8) {
          gl.ys.push(same ? data[off] : -data[off]);
          off++;
        } else {
          if (same) gl.ys.push(0);
          else {
            gl.ys.push(bin.readShort(data, off));
            off += 2;
          }
        }
      }

      let x = 0,
        y = 0;
      for (let i = 0; i < crdnum; i++) {
        x += gl.xs[i];
        y += gl.ys[i];
        gl.xs[i] = x;
        gl.ys[i] = y;
      }
    } else {
      // Composite glyph constants
      const ARG_1_AND_2_ARE_WORDS = 1;
      const ARGS_ARE_XY_VALUES = 2;
      const WE_HAVE_A_SCALE = 8;
      const MORE_COMPONENTS = 32;
      const WE_HAVE_AN_X_AND_Y_SCALE = 64;
      const WE_HAVE_A_TWO_BY_TWO = 128;
      const WE_HAVE_INSTRUCTIONS = 256;

      gl.parts = [];
      let flags;
      do {
        flags = bin.readUshort(data, off);
        off += 2;
        const part: any = {
          m: { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 },
          p1: -1,
          p2: -1,
        };
        gl.parts.push(part);
        part.glyphIndex = bin.readUshort(data, off);
        off += 2;

        let arg1, arg2;
        if (flags & ARG_1_AND_2_ARE_WORDS) {
          arg1 = bin.readShort(data, off);
          off += 2;
          arg2 = bin.readShort(data, off);
          off += 2;
        } else {
          arg1 = bin.readInt8(data, off);
          off++;
          arg2 = bin.readInt8(data, off);
          off++;
        }

        if (flags & ARGS_ARE_XY_VALUES) {
          part.m.tx = arg1;
          part.m.ty = arg2;
        } else {
          part.p1 = arg1;
          part.p2 = arg2;
        }

        if (flags & WE_HAVE_A_SCALE) {
          part.m.a = part.m.d = bin.readF2dot14(data, off);
          off += 2;
        } else if (flags & WE_HAVE_AN_X_AND_Y_SCALE) {
          part.m.a = bin.readF2dot14(data, off);
          off += 2;
          part.m.d = bin.readF2dot14(data, off);
          off += 2;
        } else if (flags & WE_HAVE_A_TWO_BY_TWO) {
          part.m.a = bin.readF2dot14(data, off);
          off += 2;
          part.m.b = bin.readF2dot14(data, off);
          off += 2;
          part.m.c = bin.readF2dot14(data, off);
          off += 2;
          part.m.d = bin.readF2dot14(data, off);
          off += 2;
        }
      } while (flags & MORE_COMPONENTS);

      if (flags & WE_HAVE_INSTRUCTIONS) {
        const numInstr = bin.readUshort(data, off);
        off += 2;
        gl.instr = [];
        for (let i = 0; i < numInstr; i++) {
          gl.instr.push(data[off]);
          off++;
        }
      }
    }
    return gl;
  },
};

// Variable font tables (full implementation)
const VariableTables: any = {
  fvar: {
    parseTab(data: any, offset: any, length: any, obj: any): any {
      const name = obj.name;
      let off = offset;
      const axes: any[] = [];
      const inst: any[] = [];

      off += 8;
      const acnt = bin.readUshort(data, off);
      off += 2;
      off += 2;
      const icnt = bin.readUshort(data, off);
      off += 2;
      const isiz = bin.readUshort(data, off);
      off += 2;

      for (let i = 0; i < acnt; i++) {
        const tag = bin.readASCII(data, off, 4);
        const min = bin.readFixed(data, off + 4);
        const def = bin.readFixed(data, off + 8);
        const max = bin.readFixed(data, off + 12);
        const flg = bin.readUshort(data, off + 16);
        const nid = bin.readUshort(data, off + 18);
        axes.push([tag, min, def, max, flg, name ? name["_" + nid] : null]);
        off += 20;
      }

      for (let i = 0; i < icnt; i++) {
        const snid = bin.readUshort(data, off);
        let pnid = null;
        const flg = bin.readUshort(data, off + 2);
        const crd: any[] = [];
        for (let j = 0; j < acnt; j++) {
          crd.push(bin.readFixed(data, off + 4 + j * 4));
        }
        off += 4 + acnt * 4;
        if ((isiz & 3) === 2) {
          pnid = bin.readUshort(data, off);
          off += 2;
        }
        inst.push([name ? name["_" + snid] : null, flg, crd, pnid]);
      }

      return [axes, inst];
    },
  },

  avar: {
    parseTab(data: any, offset: any, length: any, obj: any): any {
      let off = offset;
      const out: any[] = [];

      off += 6;
      const acnt = bin.readUshort(data, off);
      off += 2;

      for (let ai = 0; ai < acnt; ai++) {
        const cnt = bin.readUshort(data, off);
        off += 2;
        const poly: any[] = [];
        out.push(poly);
        for (let i = 0; i < cnt; i++) {
          const x = bin.readF2dot14(data, off);
          const y = bin.readF2dot14(data, off + 2);
          off += 4;
          poly.push(x, y);
        }
      }

      return out;
    },
  },

  gvar: {
    parseTab(data: any, offset: any, length: any, obj: any): any {
      const EMBEDDED_PEAK_TUPLE = 0x8000;
      const INTERMEDIATE_REGION = 0x4000;
      const PRIVATE_POINT_NUMBERS = 0x2000;
      const DELTAS_ARE_ZERO = 0x80;
      const DELTAS_ARE_WORDS = 0x40;
      const POINTS_ARE_WORDS = 0x80;
      const SHARED_POINT_NUMBERS = 0x8000;

      function readTuple(data: any, o: any, acnt: any): any[] {
        const tup: any[] = [];
        for (let j = 0; j < acnt; j++)
          tup.push(bin.readF2dot14(data, o + j * 2));
        return tup;
      }

      function readTupleVarHeader(
        data: any,
        off: any,
        vcnt: any,
        acnt: any,
        eoff: any
      ): any[] {
        const out: any[] = [];
        for (let j = 0; j < vcnt; j++) {
          const dsiz = bin.readUshort(data, off);
          off += 2;
          const tind = bin.readUshort(data, off);
          const flag = tind & 0xf000;
          const tupleIndex = tind & 0xfff;
          off += 2;

          let peak = null,
            start = null,
            end = null;
          if (flag & EMBEDDED_PEAK_TUPLE) {
            peak = readTuple(data, off, acnt);
            off += acnt * 2;
          }
          if (flag & INTERMEDIATE_REGION) {
            start = readTuple(data, off, acnt);
            off += acnt * 2;
          }
          if (flag & INTERMEDIATE_REGION) {
            end = readTuple(data, off, acnt);
            off += acnt * 2;
          }
          out.push([dsiz, tupleIndex, flag, start, peak, end]);
        }
        return out;
      }

      function readPointNumbers(data: any, off: any, gid: any): [any[], any] {
        let cnt = data[off];
        off++;
        if (cnt === 0) return [[], off];
        if (127 < cnt) {
          cnt = ((cnt & 127) << 8) | data[off++];
        }

        const pts: any[] = [];
        let last = 0;
        while (pts.length < cnt) {
          const v = data[off];
          off++;
          const wds = (v & POINTS_ARE_WORDS) !== 0;
          const runLength = (v & 127) + 1;
          for (let i = 0; i < runLength; i++) {
            let dif = 0;
            if (wds) {
              dif = bin.readUshort(data, off);
              off += 2;
            } else {
              dif = data[off];
              off++;
            }
            last += dif;
            pts.push(last);
          }
        }
        return [pts, off];
      }

      let off = offset + 4;
      const acnt = bin.readUshort(data, off);
      off += 2;
      const tcnt = bin.readUshort(data, off);
      off += 2;
      const toff = bin.readUint(data, off);
      off += 4;
      const gcnt = bin.readUshort(data, off);
      off += 2;
      const flgs = bin.readUshort(data, off);
      off += 2;

      const goff = bin.readUint(data, off);
      off += 4;

      // glyphVariationDataOffsets
      const offs: any[] = [];
      for (let i = 0; i < gcnt + 1; i++) {
        offs.push(bin.readUint(data, off + i * 4));
      }

      // sharedTuples
      const tups: any[] = [],
        mins: any[] = [],
        maxs: any[] = [];
      off = offset + toff;
      for (let i = 0; i < tcnt; i++) {
        const peak = readTuple(data, off + i * acnt * 2, acnt);
        const imin: any[] = [],
          imax: any[] = [];
        tups.push(peak);
        mins.push(imin);
        maxs.push(imax);
        for (let k = 0; k < acnt; k++) {
          imin[k] = Math.min(peak[k], 0);
          imax[k] = Math.max(peak[k], 0);
        }
      }

      const i8 = new Int8Array(data.buffer);

      // GlyphVariationData table array
      const tabs: any[] = [];
      for (let i = 0; i < gcnt; i++) {
        off = offset + goff + offs[i];
        // tupleVariationCount
        let vcnt = bin.readUshort(data, off);
        off += 2;

        const snum = vcnt & SHARED_POINT_NUMBERS;
        vcnt &= 0xfff;
        //  offset to the serialized data
        const soff = bin.readUshort(data, off);
        off += 2;

        const hdr = readTupleVarHeader(
          data,
          off,
          vcnt,
          acnt,
          offset + goff + offs[i + 1]
        );

        const tab: any[] = [];
        tabs.push(tab);
        // Serialized Data
        off = offset + goff + offs[i] + soff;

        let sind: any[] = [];
        if (snum) {
          const oo = readPointNumbers(data, off, i);
          sind = oo[0];
          off = oo[1];
        }

        for (let j = 0; j < vcnt; j++) {
          const vr = hdr[j];
          const end = off + vr[0];

          let ind = sind;
          if (vr[2] & PRIVATE_POINT_NUMBERS) {
            const oo = readPointNumbers(data, off, i);
            ind = oo[0];
            off = oo[1];
          }
          // read packed deltas (delta runs)
          const ds: any[] = [];
          while (off < end) {
            const cb = data[off++]; // control byte;
            const cnt = (cb & 0x3f) + 1;
            if (cb & DELTAS_ARE_ZERO) {
              for (let k = 0; k < cnt; k++) ds.push(0);
            } else if (cb & DELTAS_ARE_WORDS) {
              for (let k = 0; k < cnt; k++) {
                ds.push(bin.readShort(data, off + k * 2));
              }
              off += cnt * 2;
            } else {
              for (let k = 0; k < cnt; k++) ds.push(i8[off + k]);
              off += cnt;
            }
          }
          const ti = vr[1];

          tab.push([
            [
              vr[3] ? vr[3] : mins[ti],
              vr[4] ? vr[4] : tups[ti],
              vr[5] ? vr[5] : maxs[ti],
            ],
            ds,
            ind.length == 0 ? null : ind,
          ]);

          if (ind.length != 0 && ind.length * 2 != ds.length) throw "e";
        }
      }
      return tabs;
    },
  },

  HVAR: {
    parseTab(data: any, offset: any, length: any, obj: any): any {
      let off = offset;
      const oo = offset;

      off += 4;

      const varO = bin.readUint(data, off);
      off += 4;
      const advO = bin.readUint(data, off);
      off += 4;
      const lsbO = bin.readUint(data, off);
      off += 4;
      const rsbO = bin.readUint(data, off);
      off += 4;
      if (lsbO !== 0 || rsbO !== 0) throw lsbO;

      off = oo + varO; // item variation store

      // ItemVariationStore
      const ioff = off;

      const fmt = bin.readUshort(data, off);
      off += 2;
      if (fmt !== 1) throw "e";
      const vregO = bin.readUint(data, off);
      off += 4;
      // itemVariationDataCount
      const vcnt = bin.readUshort(data, off);
      off += 2;

      const offs = [];
      for (let i = 0; i < vcnt; i++) offs.push(bin.readUint(data, off + i * 4));
      off += vcnt * 4;

      off = ioff + vregO;
      const acnt = bin.readUshort(data, off);
      off += 2;
      const rcnt = bin.readUshort(data, off);
      off += 2;

      const regs: any[] = [];
      for (let i = 0; i < rcnt; i++) {
        const crd: any[] = [[], [], []];
        regs.push(crd);
        for (let j = 0; j < acnt; j++) {
          (crd[0] as any[]).push(bin.readF2dot14(data, off + 0));
          (crd[1] as any[]).push(bin.readF2dot14(data, off + 2));
          (crd[2] as any[]).push(bin.readF2dot14(data, off + 4));
          off += 6;
        }
      }

      const i8 = new Int8Array(data.buffer);
      const varStore: any[] = [];
      for (let i = 0; i < offs.length; i++) {
        // ItemVariationData
        off = oo + varO + offs[i];
        const vdata: any[] = [];
        varStore.push(vdata);
        const icnt = bin.readUshort(data, off);
        off += 2; // itemCount
        const dcnt = bin.readUshort(data, off);
        off += 2;
        if (dcnt & 0x8000) throw "e";
        const rcnt = bin.readUshort(data, off);
        off += 2;
        const ixs: any[] = [];
        for (let j = 0; j < rcnt; j++) {
          ixs.push(bin.readUshort(data, off + j * 2));
        }
        off += rcnt * 2;

        for (let k = 0; k < icnt; k++) {
          // deltaSets
          const deltaData: any[] = [];
          for (let ri = 0; ri < rcnt; ri++) {
            deltaData.push(ri < dcnt ? bin.readShort(data, off) : i8[off]);
            off += ri < dcnt ? 2 : 1;
          }
          const dd = new Array(regs.length);
          dd.fill(0);
          vdata.push(dd);
          for (let j = 0; j < ixs.length; j++) dd[ixs[j]] = deltaData[j];
        }
      }

      // VariationRegionList
      off = oo + advO; // advance widths

      // DeltaSetIndexMap
      const fmt2 = data[off++];
      if (fmt2 !== 0) throw "e";
      const entryFormat = data[off++];

      const mapCount = bin.readUshort(data, off);
      off += 2;

      const INNER_INDEX_BIT_COUNT_MASK = 0x0f;
      const MAP_ENTRY_SIZE_MASK = 0x30;
      const entrySize = ((entryFormat & MAP_ENTRY_SIZE_MASK) >> 4) + 1;

      const dfs: any[] = [];
      for (let i = 0; i < mapCount; i++) {
        let entry = 0;
        if (entrySize === 1) entry = data[off++];
        else {
          entry = bin.readUshort(data, off);
          off += 2;
        }
        const outerIndex =
          entry >> ((entryFormat & INNER_INDEX_BIT_COUNT_MASK) + 1);
        const innerIndex =
          entry & ((1 << ((entryFormat & INNER_INDEX_BIT_COUNT_MASK) + 1)) - 1);
        dfs.push(varStore[outerIndex][innerIndex]);
      }

      return [regs, dfs];
    },
  },
};

// Path building utilities
const PathBuilder = {
  MoveTo(p: any, x: any, y: any): void {
    p.cmds.push("M");
    p.crds.push(x, y);
  },
  LineTo(p: any, x: any, y: any): void {
    p.cmds.push("L");
    p.crds.push(x, y);
  },
  qCurveTo(p: any, a: any, b: any, c: any, d: any): void {
    p.cmds.push("Q");
    p.crds.push(a, b, c, d);
  },
  ClosePath(p: any): void {
    p.cmds.push("Z");
  },
};

// Character code to glyph ID mapping
function codeToGlyph(font: any, code: any): number {
  if (font._ctab == null) {
    const cmap = font.cmap;
    let tind = -1;
    const pps = [
      "p3e10",
      "p0e4",
      "p3e1",
      "p1e0",
      "p0e3",
      "p0e1",
      "p3e0",
      "p3e5",
    ];

    for (let i = 0; i < pps.length; i++) {
      if (cmap.ids[pps[i]] != null) {
        tind = cmap.ids[pps[i]];
        break;
      }
    }
    if (tind === -1) throw "no familiar platform and encoding!";
    font._ctab = cmap.tables[tind];
  }

  const tab = font._ctab;
  const fmt = tab.format;
  let gid = -1;

  if (fmt === 0) {
    if (code >= tab.map.length) gid = 0;
    else gid = tab.map[code];
  } else if (fmt === 4) {
    const ec = tab.endCount;
    gid = 0;
    if (code <= ec[ec.length - 1]) {
      let sind = arrSearch(ec, 1, code);
      if (ec[sind] < code) sind++;

      if (code >= tab.startCount[sind]) {
        let gli = 0;
        if (tab.idRangeOffset[sind] !== 0) {
          gli =
            tab.glyphIdArray[
              code -
                tab.startCount[sind] +
                (tab.idRangeOffset[sind] >> 1) -
                (tab.idRangeOffset.length - sind)
            ];
        } else {
          gli = code + tab.idDelta[sind];
        }
        gid = gli & 0xffff;
      }
    }
  } else if (fmt === 6) {
    const off = code - tab.firstCode;
    const arr = tab.glyphIdArray;
    if (off < 0 || off >= arr.length) gid = 0;
    else gid = arr[off];
  } else if (fmt === 12) {
    const grp = tab.groups;
    gid = 0;
    if (code <= grp[grp.length - 2]) {
      const i = arrSearch(grp, 3, code);
      if (grp[i] <= code && code <= grp[i + 1]) {
        gid = grp[i + 2] + (code - grp[i]);
      }
    }
  } else {
    throw "unknown cmap table format " + tab.format;
  }

  return gid;
}

// Binary search helper
function arrSearch(arr: any, k: any, v: any): number {
  let l = 0;
  let r = Math.floor(arr.length / k);
  while (l + 1 !== r) {
    const mid = l + ((r - l) >>> 1);
    if (arr[mid * k] <= v) l = mid;
    else r = mid;
  }
  return l * k;
}

// Get kerning between two glyphs
function getGlyphPosition(font: any, gls: any, i1: any): number[] {
  const g1 = gls[i1];
  const g2 = gls[i1 + 1];
  const kern = font.kern;

  if (kern) {
    const ind1 = kern.glyph1.indexOf(g1);
    if (ind1 !== -1) {
      const ind2 = kern.rval[ind1].glyph2.indexOf(g2);
      if (ind2 !== -1) return [0, 0, kern.rval[ind1].vals[ind2], 0];
    }
  }
  return [0, 0, 0, 0];
}

// Normalize axis values for variable fonts
function normalizeAxis(font: any, vv: any): any[] {
  const fvar = font.fvar;
  const avar = font.avar;
  const fv = fvar ? fvar[0] : null;

  const nv = [];
  for (let i = 0; i < fv.length; i++) {
    const min = fv[i][1];
    const def = fv[i][2];
    const max = fv[i][3];
    const v = Math.max(min, Math.min(max, vv[i]));
    if (v < def) nv[i] = (def - v) / (min - def);
    else if (v > def) nv[i] = (v - def) / (max - def);
    else nv[i] = 0;

    if (avar && nv[i] !== -1) {
      const av = avar[i];
      let j = 0;
      for (; j < av.length; j += 2) if (av[j] >= nv[i]) break;
      const f: number = (nv[i] - av[j - 2]) / (av[j] - av[j - 2]);
      nv[i] = f * av[j + 1] + (1 - f) * av[j - 1];
    }
  }
  return nv;
}

// Basic text shaping (no complex scripts)
function shape(font: any, str: any, prm: any = {}): any {
  let axs = prm.axs;

  if (font.fvar && axs == null) axs = font.fvar[1][font._index || 0][2];

  const HVAR = font.HVAR;
  if (axs && HVAR) {
    axs = normalizeAxis(font, axs);
  }

  const gls: any[] = [];
  for (let i = 0; i < str.length; i++) {
    const cc = str.codePointAt(i);
    if (cc > 0xffff) i++;
    gls.push(codeToGlyph(font, cc));
  }

  const shape = [];
  let x = 0,
    y = 0;

  for (let i = 0; i < gls.length; i++) {
    const padj = getGlyphPosition(font, gls, i);
    const gid = gls[i];
    let ax = font.hmtx.aWidth[gid] + padj[2];

    if (HVAR && HVAR[1][gid]) {
      const difs = HVAR[1][gid];
      for (let j = 0; j < HVAR[0].length; j++) {
        ax += _interpolate(HVAR[0][j], axs) * difs[j];
      }
    }

    shape.push({ g: gid, cl: i, dx: 0, dy: 0, ax: ax, ay: 0 });
    x += ax;
  }
  return shape;
}

// Convert glyph to path
function glyphToPath(font: any, gid: any, noColor: any, axs: any): any {
  const path = { cmds: [], crds: [] };

  if (font.fvar) {
    if (axs == null) axs = font.fvar[1][font._index || 0][2];
    axs = normalizeAxis(font, axs);
  }

  if (font.glyf) {
    drawGlyf(gid, font, path, axs);
  }
  return { cmds: path.cmds, crds: path.crds };
}

function drawGlyf(gid: any, font: any, path: any, axs: any): void {
  let gl = font.glyf[gid];

  if (gl == null) {
    gl = font.glyf[gid] = glyf.parseGlyf(font, gid);
  }
  if (gl != null) {
    if (gl.noc > -1) simpleGlyph(gl, font, gid, path, axs);
    else compoGlyph(gl, font, gid, path, axs);
  }
}

function simpleGlyph(gl: any, font: any, gid: any, p: any, axs: any): void {
  let xs = gl.xs;
  let ys = gl.ys;

  // Apply variable font deltas if present
  if (font.fvar && axs) {
    xs = xs.slice(0);
    ys = ys.slice(0);
    const gvar = font.gvar;
    const gv = gvar ? gvar[gid] : null;

    if (gv) {
      for (let vi = 0; vi < gv.length; vi++) {
        const axv = gv[vi][0];
        const S = _interpolate(axv, axs);
        if (S < 1e-9) continue;
        let dfs = gv[vi][1];
        const ind = gv[vi][2];

        if (ind) {
          // Interpolate deltas if needed
          dfs = gv[vi][1] = interpolateDeltas(dfs, ind, xs, ys, gl.endPts);
          gv[vi][2] = null;
        }

        if (dfs.length === xs.length * 2 + 8) {
          for (let i = 0; i < xs.length; i++) {
            xs[i] += S * dfs[i];
            ys[i] += S * dfs[i + xs.length + 4];
          }
        }
      }
    }
  }

  for (let c = 0; c < gl.noc; c++) {
    const i0 = c === 0 ? 0 : gl.endPts[c - 1] + 1;
    const il = gl.endPts[c];

    for (let i = i0; i <= il; i++) {
      const pr = i === i0 ? il : i - 1;
      const nx = i === il ? i0 : i + 1;
      const onCurve = gl.flags[i] & 1;
      const prOnCurve = gl.flags[pr] & 1;
      const nxOnCurve = gl.flags[nx] & 1;

      const x = xs[i],
        y = ys[i];

      if (i === i0) {
        if (onCurve) {
          if (prOnCurve) PathBuilder.MoveTo(p, xs[pr], ys[pr]);
          else {
            PathBuilder.MoveTo(p, x, y);
            continue;
          }
        } else {
          if (prOnCurve) PathBuilder.MoveTo(p, xs[pr], ys[pr]);
          else
            PathBuilder.MoveTo(
              p,
              Math.floor((xs[pr] + x) * 0.5),
              Math.floor((ys[pr] + y) * 0.5)
            );
        }
      }

      if (onCurve) {
        if (prOnCurve) PathBuilder.LineTo(p, x, y);
      } else {
        if (nxOnCurve) PathBuilder.qCurveTo(p, x, y, xs[nx], ys[nx]);
        else
          PathBuilder.qCurveTo(
            p,
            x,
            y,
            Math.floor((x + xs[nx]) * 0.5),
            Math.floor((y + ys[nx]) * 0.5)
          );
      }
    }
    PathBuilder.ClosePath(p);
  }
}

function compoGlyph(gl: any, font: any, gid: any, p: any, axs: any): void {
  const dx = [0, 0, 0, 0, 0, 0];
  const dy = [0, 0, 0, 0, 0, 0];
  const ccnt = gl.parts.length;

  if (font.fvar && axs) {
    const gvar = font.gvar;
    const gv = gvar ? gvar[gid] : null;
    if (gv) {
      for (let vi = 0; vi < gv.length; vi++) {
        const axv = gv[vi][0];
        const S = _interpolate(axv, axs);
        if (S < 1e-6) continue;
        const dfs = gv[vi][1];
        const ind = gv[vi][2];
        if (ind == null) {
          for (let i = 0; i < ccnt; i++) {
            dx[i] += S * dfs[i];
            dy[i] += S * dfs[i + ccnt + 4];
          }
        } else {
          for (let j = 0; j < ind.length; j++) {
            const i = ind[j];
            dx[i] += S * dfs[0];
            dy[i] += S * dfs[0 + ccnt];
          }
        }
      }
    }
  }

  for (let j = 0; j < ccnt; j++) {
    const path = { cmds: [], crds: [] };
    const prt = gl.parts[j];
    drawGlyf(prt.glyphIndex, font, path, axs);

    const m = prt.m;
    const tx = m.tx + dx[j];
    const ty = m.ty + dy[j];
    for (let i = 0; i < path.crds.length; i += 2) {
      const x = path.crds[i];
      const y = path.crds[i + 1];
      p.crds.push(x * m.a + y * m.c + tx);
      p.crds.push(x * m.b + y * m.d + ty);
    }
    for (let i = 0; i < path.cmds.length; i++) p.cmds.push(path.cmds[i]);
  }
}

// Delta interpolation for variable fonts
// Original _interpolate function from typr.js
function _interpolate(axs: any, v: any): number {
  var acnt = v.length,
    S = 1;
  var s = axs[0]; // start
  var p = axs[1]; // peak
  var e = axs[2]; // end

  for (var i = 0; i < v.length; i++) {
    var AS = 1;
    if (s[i] > p[i] || p[i] > e[i]) AS = 1;
    else if (s[i] < 0 && e[i] > 0 && p[i] != 0) AS = 1;
    else if (p[i] == 0) AS = 1;
    else if (v[i] < s[i] || v[i] > e[i]) AS = 0;
    else {
      if (v[i] == p[i]) AS = 1;
      else if (v[i] < p[i]) AS = (v[i] - s[i]) / (p[i] - s[i]);
      else AS = (e[i] - v[i]) / (e[i] - p[i]);
    }
    S = S * AS;
  }
  return S;
}

function interpolateDeltas(
  dfs: any,
  ind: any,
  xs: any,
  ys: any,
  endPts: any
): any {
  const N = xs.length;
  const ndfs = new Array(N * 2 + 8);
  ndfs.fill(0);

  for (let i = 0; i < N; i++) {
    let dx = 0,
      dy = 0;
    const ii = ind.indexOf(i);
    if (ii !== -1) {
      dx = dfs[ii];
      dy = dfs[ind.length + ii];
    } else {
      let cmp = 0;
      while (endPts[cmp] < i) cmp++;
      const cmp0 = cmp === 0 ? 0 : endPts[cmp - 1] + 1;
      const cmp1 = endPts[cmp];

      let i0 = -1,
        i1 = -1;

      for (let j = 0; j < ind.length; j++) {
        const v = ind[j];
        if (v < cmp0 || v > cmp1 || v >= N) continue;
        i0 = j;
        if (i1 === -1) i1 = j;
      }
      for (let j = 0; j < ind.length; j++) {
        const v = ind[j];
        if (v < cmp0 || v > cmp1 || v >= N) continue;
        if (v < i) i0 = j;
        if (i < v) {
          i1 = j;
          break;
        }
      }

      for (let ax = 0; ax < 2; ax++) {
        const crd = ax === 0 ? xs : ys;
        const ofs = ax * ind.length;
        let dlt = 0;
        const c0 = crd[ind[i0]];
        const c1 = crd[ind[i1]];
        const cC = crd[i];
        const d0 = dfs[ofs + i0];
        const d1 = dfs[ofs + i1];

        if (c0 === c1) {
          if (d0 === d1) dlt = d0;
          else dlt = 0;
        } else {
          if (cC <= Math.min(c0, c1)) {
            if (c0 < c1) dlt = d0;
            else dlt = d1;
          } else if (Math.max(c0, c1) <= cC) {
            if (c0 < c1) dlt = d1;
            else dlt = d0;
          } else {
            const prop = (cC - c0) / (c1 - c0);
            dlt = prop * d1 + (1 - prop) * d0;
          }
        }
        if (ax === 0) dx = dlt;
        else dy = dlt;
      }
    }
    ndfs[i] = dx;
    ndfs[N + 4 + i] = dy;
  }
  return ndfs;
}

// Convert shape to combined path
function shapeToPath(font: any, shape: any, prm: any = {}): any {
  const tpath = { cmds: [], crds: [] };
  let x = 0,
    y = 0;
  const axs = prm.axs;

  for (let i = 0; i < shape.length; i++) {
    const it = shape[i];
    const path = glyphToPath(font, it.g, false, axs);
    const crds = path.crds;

    for (let j = 0; j < crds.length; j += 2) {
      (tpath.crds as any[]).push(crds[j] + x + it.dx);
      (tpath.crds as any[]).push(crds[j + 1] + y + it.dy);
    }
    for (let j = 0; j < path.cmds.length; j++) {
      (tpath.cmds as any[]).push(path.cmds[j]);
    }

    x += it.ax;
    y += it.ay;
  }
  return { cmds: tpath.cmds, crds: tpath.crds };
}

// Main font parser class
class FontUtils {
  static parse(buff: any): any {
    const data = new Uint8Array(buff);
    const tmap = {};

    const font = readFont(data, 0, 0, tmap);

    // Handle variable font instances
    const fvar = font.fvar;
    if (fvar) {
      const out = [font];
      for (let i = 0; i < fvar[1].length; i++) {
        const fv = fvar[1][i];
        const obj = {};
        out.push(obj);
        for (const p in font) (obj as any)[p] = font[p];
        (obj as any)._index = i;
        const name = ((obj as any).name = JSON.parse(
          JSON.stringify((obj as any).name || {})
        ));
        name.fontSubfamily = fv[0];
        if (fv[3] == null) {
          fv[3] = (
            (name.fontFamily || "Font") +
            "-" +
            (name.fontSubfamily || "Regular")
          ).replace(/ /g, "");
        }
        name.postScriptName = fv[3];
      }
      return out;
    }

    return [font];
  }

  static U = {
    shape,
    shapeToPath,
    glyphToPath,
    codeToGlyph,
  };
}

function readFont(data: any, idx: any, offset: any, tmap: any): any {
  const parsers = {
    cmap: cmap,
    head: Tables.head,
    hhea: Tables.hhea,
    maxp: Tables.maxp,
    hmtx: Tables.hmtx,
    loca: Tables.loca,
    kern: Tables.kern,
    glyf: glyf,
    fvar: VariableTables.fvar,
    gvar: VariableTables.gvar,
    avar: VariableTables.avar,
    HVAR: VariableTables.HVAR,
  };

  const obj = { _data: data, _index: idx, _offset: offset };

  for (const t in parsers) {
    const tab = findTable(data, t, offset);
    if (tab) {
      const off = tab[0];
      let tobj = tmap[off];
      if (tobj == null) {
        tobj = (parsers as any)[t].parseTab(data, off, tab[1], obj);
      }
      (obj as any)[t] = tmap[off] = tobj;
    }
  }

  // Add basic name parsing for font identification
  if (!(obj as any).name) {
    (obj as any).name = { fontFamily: "Unknown", postScriptName: "Unknown" };
  }

  return obj;
}

// FontParser class - TTF font loading and rendering for Klint
export default class FontParser {
  fonts: Map<any, any>;

  constructor() {
    this.fonts = new Map();
  }

  async load(url: string): Promise<any> {
    // Format detection
    const ext = url.split(".").pop()?.toLowerCase();
    if (ext === "otf") {
      console.warn("OTF not supported. Convert: http://convertio.co/otf-ttf/");
      throw new Error("OTF not supported");
    }
    if (ext === "woff") {
      console.warn(
        "WOFF not supported. Convert: http://convertio.co/woff-ttf/"
      );
      throw new Error("WOFF not supported");
    }
    if (ext === "woff2") {
      console.warn(
        "WOFF2 not supported. Convert: http://convertio.co/woff2-ttf/"
      );
      throw new Error("WOFF2 not supported");
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to load font");
    const buffer = await response.arrayBuffer();
    return this.loadFromBuffer(buffer);
  }

  loadFromBuffer(buffer: any): any {
    const fonts = FontUtils.parse(buffer);
    return this.createAPI(fonts[0]);
  }

  createAPI(font: any): any {
    return {
      // For compatibility with the test - expose the font directly
      ...font,

      // Real API implementation
      toPaths(text: string, size: number = 100, options: any = {}): any {
        const layout = this.layoutText(font, text, size, options);
        const letters: any[] = [];
        const scale = size / font.head.unitsPerEm;

        // Get axis values for variable fonts
        const axisValues =
          options.axisValues ||
          (font.fvar ? font.fvar[1][font._index || 0][2] : null);

        for (const letter of layout.letters) {
          const path2D = new Path2D();
          const glyphPath = FontUtils.U.glyphToPath(
            font,
            letter.glyph.g,
            false,
            axisValues
          );

          // Transform glyph coordinates from font units to pixels
          let cmdIndex = 0;
          for (let i = 0; i < glyphPath.cmds.length; i++) {
            const cmd = glyphPath.cmds[i];
            if (cmd === "M") {
              path2D.moveTo(
                glyphPath.crds[cmdIndex] * scale,
                -glyphPath.crds[cmdIndex + 1] * scale
              );
              cmdIndex += 2;
            } else if (cmd === "L") {
              path2D.lineTo(
                glyphPath.crds[cmdIndex] * scale,
                -glyphPath.crds[cmdIndex + 1] * scale
              );
              cmdIndex += 2;
            } else if (cmd === "Q") {
              path2D.quadraticCurveTo(
                glyphPath.crds[cmdIndex] * scale,
                -glyphPath.crds[cmdIndex + 1] * scale,
                glyphPath.crds[cmdIndex + 2] * scale,
                -glyphPath.crds[cmdIndex + 3] * scale
              );
              cmdIndex += 4;
            } else if (cmd === "Z") {
              path2D.closePath();
            }
          }

          letters.push({
            path: path2D,
            letterIndex: letter.letterIndex,
            wordIndex: letter.wordIndex,
            lineIndex: letter.lineIndex,
            width: letter.width,
            height: letter.height,
            center: { x: letter.x, y: letter.y },
          });
        }

        return { letters, block: layout.block };
      },

      toPoints(text: string, size: number = 100, options: any = {}): any {
        const layout = this.layoutText(font, text, size, options);
        const letters: any[] = [];
        const sampling = options.sampling || 0.25;
        const scale = size / font.head.unitsPerEm;

        // Get axis values for variable fonts
        const axisValues =
          options.axisValues ||
          (font.fvar ? font.fvar[1][font._index || 0][2] : null);

        for (const letter of layout.letters) {
          const glyphPath = FontUtils.U.glyphToPath(
            font,
            letter.glyph.g,
            false,
            axisValues
          );
          const rawPoints = this.samplePathPoints(glyphPath, sampling);

          // Transform points from font units to pixels (keep in glyph-local space)
          const points = rawPoints.map((point: any) => ({
            x: point.x * scale,
            y: -point.y * scale,
            contour: point.contour, // Preserve contour information!
          }));

          letters.push({
            shape: points,
            center: { x: letter.x, y: letter.y },
            letterIndex: letter.letterIndex,
            wordIndex: letter.wordIndex,
            lineIndex: letter.lineIndex,
            width: letter.width,
            height: letter.height,
          });
        }

        return { letters, block: layout.block };
      },

      // Helper methods
      layoutText(font: any, text: any, size: any, options: any = {}): any {
        const lines = text.split(/\r?\n/);
        const scale = size / font.head.unitsPerEm;
        const letters = [];

        const letterSpacing = options.letterSpacing || 0;
        const wordSpacing = options.wordSpacing || 0;
        const lineSpacing = options.lineSpacing || 0;

        // Get axis values for variable fonts
        const axisValues =
          options.axisValues ||
          (font.fvar ? font.fvar[1][font._index || 0][2] : null);

        const ascender = font.hhea.ascender * scale;
        const descender = font.hhea.descender * scale;
        const lineGap = (font.hhea.lineGap || 0) * scale;
        // Match native canvas text line height (1.2 * fontSize)
        const lineHeight = size * 1.2 + lineSpacing;

        let letterIndex = 0;
        let wordIndex = 0;

        // Pre-calculate line widths for proper alignment
        const shapeOptions = { ltr: true };
        if (axisValues) {
          (shapeOptions as any).axs = axisValues;
        }

        const lineWidths = lines.map((line: any) => {
          const shaped = FontUtils.U.shape(font, line, shapeOptions);
          let width = 0;
          for (let i = 0; i < shaped.length; i++) {
            const glyph = shaped[i];
            const char = line.charAt(i);
            width += (glyph.ax || 0) * scale;
            if (char === " ") {
              width += wordSpacing;
            } else if (i < shaped.length - 1) {
              width += letterSpacing;
            }
          }
          return width;
        });

        const blockWidth = Math.max(...lineWidths, 0);
        const blockHeight = lineHeight * lines.length;

        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
          const line = lines[lineIndex];
          const shaped = FontUtils.U.shape(font, line, shapeOptions);
          const lineWidth = lineWidths[lineIndex];

          let x = 0;

          // Apply text alignment
          if (options.align === "center") {
            x = (blockWidth - lineWidth) / 2;
          } else if (options.align === "right") {
            x = blockWidth - lineWidth;
          }

          // If using anchor center, don't apply additional centering offset
          if (options.anchor === "center" && options.align === "center") {
            x = -lineWidth / 2;
          }

          // Calculate Y position to match native text rendering
          let y;
          if (options.baseline === "center") {
            // For single line, center around 0. For multiline, center the block
            if (lines.length === 1) {
              y = 0; // Center single line at y=0
            } else {
              y = -blockHeight / 2 + lineHeight / 2 + lineIndex * lineHeight;
            }
          } else if (options.baseline === "top") {
            y = -lineHeight / 2 + lineIndex * lineHeight;
          } else {
            // baseline (default) - match native canvas text exactly
            y = -lineHeight / 2 + lineIndex * lineHeight;
          }

          // Adjust for the difference between textBaseline='middle' and actual glyph baseline
          // The y position calculated above is for the middle of the text line
          // But our glyphs are positioned relative to their baseline
          // We need to shift up by the distance from middle to baseline
          const middleToBaseline = (ascender + descender) / 2;
          y += middleToBaseline;

          for (let i = 0; i < shaped.length; i++) {
            const glyph = shaped[i];
            const char = line.charAt(i);
            const advanceWidth = (glyph.ax || 0) * scale;

            letters.push({
              glyph,
              char,
              x,
              y,
              letterIndex: letterIndex++,
              wordIndex,
              lineIndex,
              width: advanceWidth,
              height: size,
            });

            x += advanceWidth;

            if (char === " ") {
              x += wordSpacing;
              wordIndex++;
            } else if (i < shaped.length - 1) {
              x += letterSpacing;
            }
          }
          if (line.includes(" ")) wordIndex++;
        }

        // Apply anchor offset (only when not already centered by align)
        let offsetX = 0,
          offsetY = 0;
        if (options.anchor === "center") {
          // Only apply X offset if not already centered by align
          if (options.align !== "center") {
            offsetX = -blockWidth / 2;
          }
          // Only apply Y offset if not already centered by baseline
          if (options.baseline !== "center") {
            offsetY = -blockHeight / 2;
          }
        }

        letters.forEach((letter) => {
          letter.x += offsetX;
          letter.y += offsetY;
        });

        return { letters, block: { width: blockWidth, height: blockHeight } };
      },

      samplePathPoints(glyphPath: any, sampling: any): any {
        // Parse contours separately - each contour should be sampled independently
        const rawContours = this.parseContours(glyphPath);
        const contoursWithLength = rawContours.map(
          (contour: any, index: any) => ({
            contour,
            originalIndex: index,
            length: this.calculateContourLength(contour),
          })
        );

        contoursWithLength.sort((a: any, b: any) => b.length - a.length);

        const allPoints = [];

        for (let i = 0; i < contoursWithLength.length; i++) {
          const { contour } = contoursWithLength[i];
          const contourPoints = this.sampleContour(contour, sampling, i);
          allPoints.push(...contourPoints);
        }

        return allPoints;
      },

      // Calculate total length of a contour
      calculateContourLength(contour: any): number {
        let totalLength = 0;
        let currentX = contour.startX;
        let currentY = contour.startY;

        for (const seg of contour.segments) {
          if (seg.cmd === "L") {
            const endX = seg.coords[0];
            const endY = seg.coords[1];
            totalLength += Math.sqrt(
              (endX - currentX) ** 2 + (endY - currentY) ** 2
            );
            currentX = endX;
            currentY = endY;
          } else if (seg.cmd === "Q") {
            const controlX = seg.coords[0];
            const controlY = seg.coords[1];
            const endX = seg.coords[2];
            const endY = seg.coords[3];
            totalLength += this.approximateQuadraticLength(
              currentX,
              currentY,
              controlX,
              controlY,
              endX,
              endY
            );
            currentX = endX;
            currentY = endY;
          }
        }

        return totalLength;
      },

      // Parse glyph path into separate contours
      parseContours(glyphPath: any): Contour[] {
        const contours: Contour[] = [];
        let currentContour: Contour | null = null;
        let cmdIndex = 0;

        for (let i = 0; i < glyphPath.cmds.length; i++) {
          const cmd = glyphPath.cmds[i];

          if (cmd === "M") {
            // Start new contour
            if (currentContour) {
              contours.push(currentContour);
            }
            currentContour = {
              startX: glyphPath.crds[cmdIndex],
              startY: glyphPath.crds[cmdIndex + 1],
              segments: [],
            };
            cmdIndex += 2;
          } else if (cmd === "L" || cmd === "Q") {
            if (currentContour) {
              currentContour.segments.push({
                cmd,
                coords: glyphPath.crds.slice(
                  cmdIndex,
                  cmdIndex + (cmd === "L" ? 2 : 4)
                ),
              });
            }
            cmdIndex += cmd === "L" ? 2 : 4;
          } else if (cmd === "Z") {
            // Close current contour
            if (currentContour) {
              contours.push(currentContour);
              currentContour = null;
            }
          }
        }

        // Add final contour if not closed
        if (currentContour) {
          contours.push(currentContour);
        }

        return contours;
      },

      // Sample a single contour uniformly
      sampleContour(contour: any, sampling: any, contourIndex: any): any {
        const segments = [];
        let currentX = contour.startX;
        let currentY = contour.startY;
        let totalLength = 0;

        // Build segments for this contour
        for (const seg of contour.segments) {
          if (seg.cmd === "L") {
            const endX = seg.coords[0];
            const endY = seg.coords[1];
            const length = Math.sqrt(
              (endX - currentX) ** 2 + (endY - currentY) ** 2
            );

            segments.push({
              type: "L",
              startX: currentX,
              startY: currentY,
              endX,
              endY,
              length,
              startLength: totalLength,
            });

            totalLength += length;
            currentX = endX;
            currentY = endY;
          } else if (seg.cmd === "Q") {
            const controlX = seg.coords[0];
            const controlY = seg.coords[1];
            const endX = seg.coords[2];
            const endY = seg.coords[3];

            const length = this.approximateQuadraticLength(
              currentX,
              currentY,
              controlX,
              controlY,
              endX,
              endY
            );

            segments.push({
              type: "Q",
              startX: currentX,
              startY: currentY,
              controlX,
              controlY,
              endX,
              endY,
              length,
              startLength: totalLength,
            });

            totalLength += length;
            currentX = endX;
            currentY = endY;
          }
        }

        // Sample this contour uniformly
        const points = [];
        const targetPoints = Math.max(
          5,
          Math.floor(totalLength * sampling * 0.1)
        );

        for (let i = 0; i <= targetPoints; i++) {
          const targetLength = (i / targetPoints) * totalLength;
          const pointData = this.getPointAtLengthInContour(
            segments,
            targetLength
          );
          if (pointData) {
            points.push({
              x: pointData.x,
              y: pointData.y,
              contour: contourIndex,
            });
          }
        }

        return points;
      },

      // Get point at length within a single contour
      getPointAtLengthInContour(segments: any, targetLength: any): any {
        for (const segment of segments) {
          if (
            targetLength >= segment.startLength &&
            targetLength <= segment.startLength + segment.length
          ) {
            const localT =
              (targetLength - segment.startLength) / segment.length;

            if (segment.type === "L") {
              return {
                x: segment.startX + (segment.endX - segment.startX) * localT,
                y: segment.startY + (segment.endY - segment.startY) * localT,
              };
            } else if (segment.type === "Q") {
              const t = localT;
              return {
                x:
                  (1 - t) * (1 - t) * segment.startX +
                  2 * (1 - t) * t * segment.controlX +
                  t * t * segment.endX,
                y:
                  (1 - t) * (1 - t) * segment.startY +
                  2 * (1 - t) * t * segment.controlY +
                  t * t * segment.endY,
              };
            }
          }
        }
        return null;
      },

      // Helper function to approximate quadratic curve length
      approximateQuadraticLength(
        x0: any,
        y0: any,
        x1: any,
        y1: any,
        x2: any,
        y2: any
      ): number {
        // Use simple approximation: chord + control polygon
        const chordLength = Math.sqrt((x2 - x0) ** 2 + (y2 - y0) ** 2);
        const controlLength =
          Math.sqrt((x1 - x0) ** 2 + (y1 - y0) ** 2) +
          Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        return (chordLength + controlLength) / 2;
      },
    };
  }
}
