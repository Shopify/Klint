import { describe, it, expect } from "vitest";
import { evaluateCode } from "./evaluateCode";

describe("evaluateCode", () => {
  it("extracts a draw function", () => {
    const result = evaluateCode("function draw(K) { K.background('#000'); }");
    expect(result.error).toBeNull();
    expect(typeof result.code?.draw).toBe("function");
    expect(result.code?.setup).toBeUndefined();
    expect(result.code?.preload).toBeUndefined();
  });

  it("extracts setup and draw together", () => {
    const result = evaluateCode(`
      function setup(K) { K.noStroke(); }
      function draw(K) { K.circle(0, 0, 10); }
    `);
    expect(result.error).toBeNull();
    expect(typeof result.code?.setup).toBe("function");
    expect(typeof result.code?.draw).toBe("function");
  });

  it("extracts a preload function", () => {
    const result = evaluateCode(
      "async function preload(K) { await K.loadFont('test'); }"
    );
    expect(result.error).toBeNull();
    expect(typeof result.code?.preload).toBe("function");
  });

  it("returns a syntax error for invalid code", () => {
    const result = evaluateCode("function draw(K) {{{");
    expect(result.code).toBeNull();
    expect(result.error).toBeTruthy();
  });

  it("returns an error for runtime exceptions during evaluation", () => {
    const result = evaluateCode("throw new Error('boom');");
    expect(result.code).toBeNull();
    expect(result.error).toBe("boom");
  });

  it("returns empty code object when no functions are defined", () => {
    const result = evaluateCode("const x = 42;");
    expect(result.error).toBeNull();
    expect(result.code).toEqual({});
  });

  it("handles code that uses const and let", () => {
    const result = evaluateCode(`
      const speed = 0.01;
      let count = 0;
      function draw(K) {
        count++;
        K.circle(0, 0, count * speed);
      }
    `);
    expect(result.error).toBeNull();
    expect(typeof result.code?.draw).toBe("function");
  });

  it("isolates scope between calls", () => {
    evaluateCode("var leaked = 'hello';");
    const result = evaluateCode(
      "function draw() { return typeof leaked; }"
    );
    expect(result.error).toBeNull();
    // leaked should not be visible — typeof returns "undefined" for undeclared vars
    expect(result.code?.draw!(null as any)).toBe("undefined");
  });

  it("rejects implicit globals via strict mode", () => {
    const result = evaluateCode("undeclared = 42;");
    expect(result.error).toBeTruthy();
    expect(result.code).toBeNull();
  });

  it("injects scope variables so user code can reference them", () => {
    const mouse = { x: 100, y: 200, isPressed: false };
    const result = evaluateCode(
      "function draw(K) { return mouse.x + mouse.y; }",
      { mouse },
    );
    expect(result.error).toBeNull();
    expect(typeof result.code?.draw).toBe("function");
  });

  it("scope variables reflect mutations (mutable ref pattern)", () => {
    const mouse = { x: 0 };
    const result = evaluateCode(
      "function draw() { return mouse.x; }",
      { mouse },
    );
    // Mutate after evaluation — draw should see the new value
    mouse.x = 42;
    expect(result.code?.draw!(null as any)).toBe(42);
  });
});
