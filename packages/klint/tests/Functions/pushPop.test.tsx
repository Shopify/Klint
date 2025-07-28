import { describe, it, expect, beforeEach } from "vitest";

// Partial representation of Klint
type KlintContext = {
  save: () => void;
  restore: () => void;
  push: () => void;
  pop: () => void;
  fillStyle: string;
  strokeStyle: string;
  lineWidth: number;
  _ctx: CanvasRenderingContext2D;
};

describe("push and pop", () => {
  let K: KlintContext;
  let saveCalled = false;
  let restoreCalled = false;
  let stateStack: Array<{
    fillStyle: string;
    strokeStyle: string;
    lineWidth: number;
  }> = [];

  beforeEach(() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    saveCalled = false;
    restoreCalled = false;
    stateStack = [];

    // Create minimal mock context
    K = {
      save() {
        saveCalled = true;
        // Save the current state to our stack
        stateStack.push({
          fillStyle: this.fillStyle,
          strokeStyle: this.strokeStyle,
          lineWidth: this.lineWidth,
        });
        // Also call the real ctx.save() for completeness
        ctx.save();
      },
      restore() {
        restoreCalled = true;
        // Restore the previous state from our stack
        if (stateStack.length > 0) {
          const prevState = stateStack.pop()!;
          this.fillStyle = prevState.fillStyle;
          this.strokeStyle = prevState.strokeStyle;
          this.lineWidth = prevState.lineWidth;
        }
        // Also call the real ctx.restore() for completeness
        ctx.restore();
      },
      push() {
        this.save();
      },
      pop() {
        this.restore();
      },
      fillStyle: "#000000",
      strokeStyle: "#000000",
      lineWidth: 1,
      _ctx: ctx,
    };
  });

  it("should call save when push is called", () => {
    K.push();
    expect(saveCalled).toBe(true);
  });

  it("should call restore when pop is called", () => {
    K.pop();
    expect(restoreCalled).toBe(true);
  });

  it("should save and restore canvas state correctly", () => {
    // Store initial state
    const initialFillStyle = K.fillStyle;
    const initialStrokeStyle = K.strokeStyle;
    const initialLineWidth = K.lineWidth;

    // Push state then change properties
    K.push();
    K.fillStyle = "red";
    K.strokeStyle = "blue";
    K.lineWidth = 5;

    // Verify properties have changed
    expect(K.fillStyle).toBe("red");
    expect(K.strokeStyle).toBe("blue");
    expect(K.lineWidth).toBe(5);

    // Pop to restore the previous state
    K.pop();

    // Verify original properties were restored
    expect(K.fillStyle).toBe(initialFillStyle);
    expect(K.strokeStyle).toBe(initialStrokeStyle);
    expect(K.lineWidth).toBe(initialLineWidth);
  });

  it("should handle nested push/pop correctly", () => {
    // Initial state
    K.fillStyle = "black";

    // First push
    K.push();
    K.fillStyle = "red";

    // Second push
    K.push();
    K.fillStyle = "blue";
    expect(K.fillStyle).toBe("blue");

    // First pop goes back to red
    K.pop();
    expect(K.fillStyle).toBe("red");

    // Second pop goes back to black
    K.pop();
    expect(K.fillStyle).toBe("black");
  });
});
