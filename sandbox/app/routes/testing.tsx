import { useState } from "react";
import { Klint, useKlint, KlintContext } from "@shopify/klint";

export function KlintCanvas() {
  const { context, KlintImage, useDev } = useKlint();
  const { loadImages } = KlintImage();
  useDev();

  const preload = async () => {
    await loadImages({
      lamp: "https://cdn.shopify.com/s/files/1/0817/9308/9592/files/lamp.png?v=1734625960",
    });
  };

  const setup = (K: KlintContext) => {
    K.textFont("Inter");
    K.textSize(64);
    // K.textLeading(60);
    K.noStroke();
    K.alignText("center", "middle");
    K.setImageOrigin("center");
    K.setRectOrigin("center");
  };

  const draw = (K: KlintContext) => {
    K.background(`#222`);
    K.push();
    K.fillColor("cyan");
    // K.textSize(24);
    K.alignText("center", "middle");
    K.text("Line 1\nLine 2\nLine 3", K.width / 2, K.height / 2);
    K.pop();
    // // Helper function to draw alignment guides
    // const drawGuides = (x: number, y: number, label: string) => {
    //   K.strokeColor("rgba(255, 255, 255, 0.3)");
    //   K.strokeWidth(1);
    //   // Vertical line
    //   K.line(x, y - 100, x, y + 100);
    //   // Horizontal line
    //   K.line(x - 100, y, x + 100, y);
    //   // Center point
    //   K.fillColor("red");
    //   K.circle(x, y, 3);

    //   // Label
    //   K.fillColor("white");
    //   K.textSize(12);
    //   K.alignText("center", "bottom");
    //   K.text(label, x, y - 110);
    // };

    // // Test 1: Basic multi-line text with default alignment
    // const x1 = 150,
    //   y1 = 150;
    // drawGuides(x1, y1, "Default (left, top)");
    // K.push();
    // K.fillColor("cyan");
    // K.textSize(24);
    // K.alignText("left", "top");
    // K.text("Line 1\nLine 2\nLine 3", x1, y1);
    // K.pop();
    // // Test 2: Center horizontal, middle vertical
    // const x2 = 450,
    //   y2 = 150;
    // drawGuides(x2, y2, "Center, Middle");
    // K.push();
    // K.fillColor("yellow");
    // K.textSize(24);
    // K.alignText("center", "middle");
    // K.text("Centered\nText Block\nWith Three Lines", x2, y2);

    // // Test 3: Right horizontal, bottom vertical
    // const x3 = 750,
    //   y3 = 150;
    // drawGuides(x3, y3, "Right, Bottom");
    // K.push();
    // K.fillColor("lightgreen");
    // K.textSize(24);
    // K.alignText("right", "bottom");
    // K.text("Right Aligned\nBottom Aligned\nText Block", x3, y3);

    // // Test 4: Custom line height
    // const x4 = 150,
    //   y4 = 350;
    // drawGuides(x4, y4, "Custom Line Height");
    // K.push();
    // K.fillColor("orange");
    // K.textSize(20);
    // K.alignText("left", "top");
    // K.textLeading(40); // Set custom line height
    // K.text("Line 1\nLine 2\nLine 3\nLine 4", x4, y4);
    // K.pop();
    // // Test 5: Large text with center alignment
    // const x5 = 450,
    //   y5 = 350;
    // drawGuides(x5, y5, "Large Text");
    // K.push();
    // K.fillColor("magenta");
    // K.textSize(32);
    // K.alignText("center", "middle");
    // K.textLeading(45);
    // K.text("BIG\nTEXT\nBLOCK", x5, y5);
    // K.pop();
    // // Test 6: Mixed content (numbers and text)
    // const x6 = 750,
    //   y6 = 350;
    // drawGuides(x6, y6, "Mixed Content");
    // K.push();
    // K.fillColor("lightblue");
    // K.textSize(18);
    // K.alignText("right", "middle");
    // K.textLeading(25);
    // K.text("Score: 1000\nLevel: 5\nLives: 3\nTime: 60s", x6, y6);
    // K.pop();
    // // Test 7: Animation with multi-line text
    // const x7 = 300,
    //   y7 = 550;
    // drawGuides(x7, y7, "Animated");
    // K.push();
    // const time = K.time * 0.001;
    // const animatedText = `Frame: ${K.frame}\nTime: ${time.toFixed(
    //   1
    // )}s\nAnimated!`;

    // K.fillColor(`hsl(${time * 50}, 70%, 70%)`);
    // K.textSize(20);
    // K.alignText("center", "middle");
    // K.textLeading(30);
    // K.text(animatedText, x7, y7);
    // K.pop();
    // // Test 8: Long lines vs short lines
    // const x8 = 600,
    //   y8 = 550;
    // drawGuides(x8, y8, "Mixed Line Lengths");
    // K.push();
    // K.fillColor("white");
    // K.textSize(16);
    // K.alignText("center", "middle");
    // K.textLeading(22);
    // K.text("Short\nThis is a much longer line\nMedium length\nA", x8, y8);
    // K.pop();
    // // Test 9: Single line (should work as before)
    // const x9 = 150,
    //   y9 = 650;
    // drawGuides(x9, y9, "Single Line");
    // K.push();
    // K.fillColor("lightcoral");
    // K.textSize(24);
    // K.alignText("left", "middle");
    // K.text("Single line text", x9, y9);
    // K.pop();
    // // Test 10: Empty lines
    // const x10 = 750,
    //   y10 = 650;
    // drawGuides(x10, y10, "Empty Lines");
    // K.push();
    // K.fillColor("lightsteelblue");
    // K.textSize(20);
    // K.alignText("center", "middle");
    // K.textLeading(30);
    // K.text("Line 1\n\nLine 3\n\nLine 5", x10, y10);
    // K.push();
    // // Show instructions
    // K.fillColor("white");
    // K.textSize(14);
    // K.alignText("left", "top");
    // K.text("Red dots = anchor points | White lines = alignment guides", 20, 20);
    // K.text("Testing multi-line text with \\n line breaks", 20, 40);
  };

  return (
    <Klint
      context={context}
      preload={preload}
      draw={draw}
      setup={setup}
      options={{
        origin: "corner",
        // fps: 8,
      }}
    />
  );
}

export default function Index() {
  const [count, setCount] = useState(0);

  // const { colors } = useKlint();

  return (
    <div className="flex h-screen items-center justify-center flex-col gap-4">
      <button
        onClick={() => setCount((c) => c + 1)}
        className="px-4 py-2 bg-white rounded"
      >
        Count: {count}
      </button>
      <div className="w-4/5 h-4/5 flex justify-center items-center bg-[#000] overflow-hidden rounded-[8px]">
        <KlintCanvas />
      </div>
    </div>
  );
}
