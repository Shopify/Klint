// import { KlintOffscreenContext, KlintContext } from "../component/KlintTypes";
import { KlintContexts } from "../component/KlintTypes";

interface KlintPath {
  context: KlintContexts;
  log(): void;
}

interface KlintSVGPathCommands {
  moveTo(x: number, y: number): KlintSVGPathCommand;
  lineTo(x: number, y: number): KlintSVGPathCommand;
  curveTo(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x: number,
    y: number
  ): KlintSVGPathCommand;
  qCurveTo(x1: number, y1: number, x: number, y: number): KlintSVGPathCommand;
  closePath(): KlintSVGPathCommand;
}
type KlintSVGPathCommand = { cmd: string; coord: number[] };
class SVGPathCommands implements KlintSVGPathCommands {
  moveTo(x: number, y: number): KlintSVGPathCommand {
    return { cmd: "M", coord: [x, y] };
  }
  lineTo(x: number, y: number): KlintSVGPathCommand {
    return { cmd: "L", coord: [x, y] };
  }
  curveTo(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x: number,
    y: number
  ): KlintSVGPathCommand {
    return { cmd: "C", coord: [x1, y1, x2, y2, x, y] };
  }
  qCurveTo(x1: number, y1: number, x: number, y: number): KlintSVGPathCommand {
    return { cmd: "Q", coord: [x1, y1, x, y] };
  }
  closePath(): KlintSVGPathCommand {
    return { cmd: "Z", coord: [] };
  }
}

class Path implements KlintPath {
  constructor(public readonly context: KlintContexts) {}
  private points = [];
  log(): void {
    console.log(this.context);
  }
}

export default Path;
