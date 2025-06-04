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

    // Example 1: Normal circular clip
    K.push();
    K.translate(250, 200);

    K.clipTo((K) => {
      K.circle(0, 0, 80);
    });

    // Draw something that will be clipped
    K.fillColor("red");
    K.rectangle(-100, -100, 200, 200);
    K.fillColor("blue");
    K.rectangle(-50, -50, 100, 100);
    K.fillColor("yellow");
    K.circle(30, 30, 40);

    K.pop();

    // Example 2: Inverted circular clip
    K.push();
    K.translate(600, 200);

    K.clipTo((K) => {
      K.circle(0, 0, 80);
    }, true); // revert = true

    // Draw something that will be clipped (everything EXCEPT the circle)
    K.fillColor("red");
    K.rectangle(-100, -100, 200, 200);
    K.fillColor("blue");
    K.rectangle(-50, -50, 100, 100);
    K.fillColor("yellow");
    K.circle(30, 30, 40);

    K.pop();

    // Example 3: Normal rectangle clip
    K.push();
    K.translate(250, 450);

    K.clipTo((K) => {
      K.rectangle(-60, -40, 120, 80);
    });

    // Draw pattern
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2;
      const x = Math.cos(angle) * 70;
      const y = Math.sin(angle) * 70;
      K.fillColor(`hsl(${i * 18}, 70%, 60%)`);
      K.circle(x, y, 15);
    }

    K.pop();

    // Example 4: Inverted rectangle clip
    K.push();
    K.translate(600, 450);

    K.clipTo((K) => {
      K.rectangle(-60, -40, 120, 80);
    }, true); // revert = true

    // Draw pattern (everything EXCEPT the rectangle)
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2;
      const x = Math.cos(angle) * 70;
      const y = Math.sin(angle) * 70;
      K.fillColor(`hsl(${i * 18}, 70%, 60%)`);
      K.circle(x, y, 15);
    }

    K.pop();

    // Labels
    K.fillColor("white");
    K.textSize(16);
    K.alignText("center", "top");
    K.text("Normal Circle Clip", 250, 100);
    K.text("Inverted Circle Clip", 600, 100);
    K.text("Normal Rectangle Clip", 250, 350);
    K.text("Inverted Rectangle Clip", 600, 350);

    // Instructions
    K.fillColor("white");
    K.textSize(14);
    K.alignText("left", "top");
    K.text("ClipTo Function Test:", 20, 20);
    K.textSize(12);
    K.text("• Left side: Normal clipping (revert=false)", 20, 45);
    K.text("• Right side: Inverted clipping (revert=true)", 20, 60);
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
