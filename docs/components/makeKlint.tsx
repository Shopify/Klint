import { KlintContext } from "~/Klint/src/component/KlintTypes";
import { KlintCoreFunctions } from "~/Klint/src/component/KlintCoreFunctions";
import { KlintFunctions } from "Klint/Klint/component/KlintFunctions";

export function createKlintContext(
  ctx: CanvasRenderingContext2D
  // isTestingFunctions = false
): KlintContext {
  const context = ctx as unknown as KlintContext;

  // Initialize core properties
  context.__isMainContext = true;
  context.fps = 60;
  context.frame = 0;
  context.time = 0;
  context.deltaTime = 0;
  context.mouse = {
    x: 0,
    y: 0,
    px: 0,
    py: 0,
    vx: 0,
    vy: 0,
    angle: 0,
    isPressed: false,
    isHover: false,
  };

  // Initialize defaults
  context.__imageOrigin = "corner";
  context.__rectangleOrigin = "corner";
  context.__canvasOrigin = "corner";
  context.__textFont = "sans-serif";
  context.__textWeight = "normal";
  context.__textStyle = "normal";
  context.__textSize = 12;
  context.__textAlignment = {
    horizontal: "left" as CanvasTextAlign,
    vertical: "top" as CanvasTextBaseline,
  };
  context.__offscreens = new Map();
  context.__isPlaying = true;
  context.__currentContext = context;

  // Add Klint Functions
  Object.entries(KlintCoreFunctions).forEach(([name, fn]) => {
    context[name] = fn(context as unknown as KlintContext);
  });
  // if (isTestingFunctions) {
  Object.entries(KlintFunctions).forEach(([name, fn]) => {
    context[name] = fn(context as unknown as KlintContext);
  });
  // }
  return context;
}
