import { KlintContext } from "../Klint/src/component/KlintTypes";
import Klint from "../Klint/src/component/Klint";
import useKlint from "../Klint/src/hooks/useKlint";
import State from "../Klint/src/plugins/State";
import Vector from "../Klint/src/plugins/Vector";
import Text from "../Klint/src/plugins/Text";

export function KlintCanvas() {
  const cols = ["#F00", "#0F0", "#00F"];

  const klint = useKlint();
  // const {
  //   library: opentype,
  //   error: opentypeError,
  //   isLoading,
  // } = useLibrary("opentype");

  const preload = async (Klint: KlintContext) => {
    // Library is guaranteed to be loaded here
    // console.log("✅ OpenType ready in preload:", opentype);
    // Klint.extend("opentype", opentype);
    Klint.extend("createVector", (x: number, y: number): Vector => {
      return new Vector(x, y);
    });
    // console.log(Klint.opentype);
    Klint.extend("state", new State());

    Klint.extend("ease", (t: number): number => {
      const p = t;
      const m = p - 1;
      if (t < 1) return p * t;
      return 1 - m * m * 2;
    });

    Klint.extend("eased", (ctx: KlintContext) => (t: number): number => {
      return ctx.ease(t);
    });
    // using the extend ensure your plugin is loaded when drawing, can return a undefined on the first render if it's using the ctx
    Klint.extend("textHelper", new Text(Klint));

    Klint.state.set("hello", "world");

    // Klint.extend("bitmapText", new BitmapText(Klint));
    // console.log(Klint.bitmapText);
    // Klint.createOffscreen(
    //   "myBuffer",
    //   512,
    //   512,
    //   { origin: "center", static: "true" },
    //   (ctx: KlintContext) => {
    //     ctx.extend("textHelper", new Text(ctx));
    //     // ctx.clear("#FFF");
    //     ctx.textFont("Inter");
    //     ctx.textSize(64);
    //     ctx.alignText("center", "middle");
    //     ctx.noStroke();
    //     ctx.fillColor("#000");
    //     ctx.textHelper.circularText("hello world, i am Klint.", 300, "words");
    //   }
    // );
  };

  const setup = (Klint: KlintContext) => {
    const { setImageOrigin, alignText, textFont, strokeJoin } = Klint;
    alignText("center", "middle");
    textFont("Inter");
    setImageOrigin("corner");
    strokeJoin("round");
    Klint.noStroke();
    Klint.fillColor(cols[2]);
    Klint.textQuality("auto");
    Klint.background("#888");

    // console.log(textHelp);
    // console.log(Klint);
    // Create buffer
    // Klint.background("#888");
    // Klint.describe("hello world");
  };
  // const txt = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".repeat(3);
  const draw = (K: KlintContext) => {
    // console.log("🎨 Draw frame", K.frame);
    K.background("#888");
    K.textFont("Inter");
    // K.fillColor("#00F");
    // K.textSize(68);
    // console.log(window?.opentype as unknown);
    K.push();
    const gradient = K.conicGradient();
    K.addColor(gradient, 0, cols[0]);
    K.addColor(gradient, 1, cols[2]);
    K.fillColor(gradient);
    K.rectangle(0, 0, K.width, K.height);
    K.pop();
    // const characters = K.bitmapText.chars;
    // const A = characters.get("A");
    // console.log(A);

    // txt.split("").map((letter, id, arr) => {
    //   const char = characters.get(letter);
    //   const x = 10 + (id / arr.length) * K.width;
    //   const y =
    //     K.height / 2 +
    //     Math.sin((id / arr.length) * 2 * Math.PI + K.time * 0.03) * 200;
    //   const scale = 0.5;
    //   K.image(
    //     K.bitmapText.texture,
    //     char.x,
    //     char.y - char.height,
    //     char.width,
    //     char.height,
    //     x - char.width * scale * 0.5,
    //     y - char.height * scale * 0.5,
    //     char.width * scale,
    //     char.height * scale
    //   );
    // });
    // K.textSize(24);
    // // K.strokeColor("#000");
    // const b = txt.split("").map((letter, id, arr) => {
    //   const char = characters.get(letter);
    //   const x = 10 + (id / arr.length) * K.width;
    //   const y =
    //     K.height / 2 +
    //     Math.sin((id / arr.length) * 2 * Math.PI + K.time * 0.03) * 200;
    //   K.push();
    //   K.textAlign = "center";
    //   K.fillColor(cols[id % cols.length]);
    //   K.translate(x, y);
    //   K.scale(4, 4);
    //   K.text(letter, 0, 0);
    //   K.pop();
    // });
    /*
    for(let i = 0; i<100; i++){
      K.push();
      // K.blend("destination-in");
      // Set composite operation
  
      // K.fillColor("#F00"); // Your tint color
      // K.rectangle(0, 0, A.width, A.height);
      // Draw the original image
  
      K.image(
        K.bitmapText.texture,
        A.x,
        A.y - A.height,
        A.width,
        A.height,
        0,
        0,
        A.width,
        A.height
      );
  
      // Draw a colored rectangle over it
  
      // Reset composite operation
  
      K.pop();

    }
   */
    // const characters = K.bitmapText.chars;
    // console.log(characters);

    // K.bitmapText.text("Aa", 0, 0);
    // const y = Math.sin(K.frame * 0.03) * 200;
    // console.log(K.frame);
    // K.background("#888");
    // const buffer = K.getOffscreen("myBuffer");
    // console.log(K.__isReadyToDraw);
    // Get context and draw to it
    // K.push();
    // K.rotate(K.time * 0.03);
    // for (let i = 0; i < 48; i++) {
    //   K.push();
    //   const offset = (Math.sin(K.frame * 0.03) * 0.5 + 0.5) * (i / 48);
    //   K.rotate(offset);
    //   K.opacity(1 - (1 / 48) * i);
    //   K.image(buffer, 0, 0);
    //   K.pop();
    // }
    // K.pop();
    // Use in main context
    // K.push();
    // const a = (K.ease(Math.sin(K.frame * 0.03) * 0.5 + 0.5) * 2 - 1) * 200;
    // const y = Math.sin(K.frame * 0.03) * 200;
    // const buffer = K.getOffscreen("myBuffer");
    // // buffer.background("#00F");
    // // buffer.circle(0, 0, 100);
    // K.image(buffer, 0, a);
    // K.pop();
    // K.push();
    // K.rotate(K.time * 0.01);
    // K.scale(3, 3);
    // K.strokeColor(cols[1]);
    // K.beginShape();
    // // Outer square
    // K.vertex(-50, -100);
    // K.vertex(50, -100);
    // K.vertex(50, 100);
    // K.vertex(-50, 100);
    // // Inner circle (hole)
    // K.beginContour();
    // for (let i = 0; i < 32; i++) {
    //   const angle = (i / 32) * Math.PI * 2;
    //   K.vertex(Math.cos(angle) * 25, -50 + Math.sin(angle) * 25);
    // }
    // K.endContour();
    // K.beginContour();
    // for (let i = 0; i < 32; i++) {
    //   const angle = (i / 32) * Math.PI * 2;
    //   K.vertex(Math.cos(angle) * 25, 50 + Math.sin(angle) * 25);
    // }
    // K.endContour();
    // K.endShape(true);
    // K.pop();
    // K.push();
    // const scale = Math.sin(K.time * 0.03);
    // K.scale(2 + scale, 2 + scale);
    // K.fillColor(cols[1]);
    // K.text("KLINT", 0, 0);
    // K.pop();
    // K.push();
    // K.circle(K.mouse.x, K.mouse.y, 100);
    // K.pop();
  };

  // console.log("🔄 KlintCanvas render", { opentype, error: opentypeError });

  // Prevent Klint from starting until libraries are loaded
  // if (isLoading) {
  //   return <div>Loading libraries...</div>;
  // }

  // if (opentypeError) {
  //   return <div>Error loading libraries: {opentypeError.message}</div>;
  // }

  return (
    <Klint
      context={klint}
      draw={draw}
      setup={setup}
      preload={preload}
      options={{
        origin: "corner",
        fps: 60,
        noloop: "false",
      }}
    />
  );
}
