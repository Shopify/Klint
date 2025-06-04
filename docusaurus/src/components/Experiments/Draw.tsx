import React, { useEffect, useRef, useState } from "react";
import { Klint, useKlint, type KlintContext } from "@shopify/klint";
import patterns from "./drawPatterns";

export default function Draw() {
  const { context, useDev, KlintMouse } = useKlint();
  useDev();
  const mouse = KlintMouse().mouse;
  const cols = 8;
  const cellWidthRef = useRef<number>(null);
  const rowsRef = useRef<number>(null);
  const cellsArray = useRef<number[]>([]);

  const setup = (K: KlintContext) => {
    K.noStroke();
    K.background(K.Color.crimson);
    const cellWidth = K.width / cols;
    const numRows = Math.ceil(K.height / cellWidth);

    cellWidthRef.current = cellWidth;
    rowsRef.current = numRows;

    cellsArray.current = Array.from({ length: cols * numRows }, (_, i) => 0);
  };

  function fillCell(
    K: KlintContext,
    x: number,
    y: number,
    size: number,
    value: number
  ) {
    const gridSize = size / 9;
    const grid = patterns[value];
    if (!grid) return;
    K.noStroke();
    K.fillColor(K.Color.crimson);
    K.rectangle(x * size, y * size, size, size);

    grid.forEach((row, i) => {
      row.forEach((cell, j) => {
        if (cell > 0) {
          K.strokeColor(K.Color.coral);
          K.strokeWidth(gridSize * 0.8);
          K.strokeCap("round");
          K.beginPath();
          K.moveTo(x * size + j * gridSize, y * size + i * gridSize);
          K.lineTo(
            x * size + j * gridSize + gridSize,
            y * size + i * gridSize + gridSize
          );
          K.stroke();
          K.beginPath();
          K.moveTo(x * size + j * gridSize, y * size + i * gridSize + gridSize);
          K.lineTo(x * size + j * gridSize + gridSize, y * size + i * gridSize);
          K.stroke();
        }
      });
    });
  }

  function getNewIndex(index: number, isPressed: boolean) {
    const newIndex = index + (isPressed ? -1 : 1);
    if (newIndex < 0) return 0;
    if (newIndex > patterns.length) return patterns.length;
    return newIndex;
  }

  const draw = (K: KlintContext) => {
    if (!cellsArray.current) return;
    const cells = cellsArray.current;

    const size = K.width / cols;
    console.log(mouse.x, mouse.y);
    const x = Math.floor(mouse.x / size);
    const y = Math.floor(mouse.y / size);
    const isPressed = mouse.isPressed;

    const index = y * cols + x;

    cells[index] = getNewIndex(cells[index], isPressed);

    fillCell(K, x, y, size, cells[index]);
  };

  return (
    <Klint context={context} setup={setup} draw={draw} options={{ fps: 10 }} />
  );
}
