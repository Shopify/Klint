// // import { useState, useRef, useEffect } from "react";
// /*
// // interface CanvasProps {
// //   counter: number;
// // }

// // export function KlintCanvas({ ...props }: CanvasProps) {
// //   const { counter } = props;
// //   console.log("Forced re-render");
// //   const klint = useKlint();
// //   const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(
// //     null
// //   );

// //   const P = useProps({
// //     counter: counter,
// //     hello: "world",
// //     "click-test": 0,
// //   });

// //   // const propsRef = useRef(props);
// //   useEffect(() => {
// //     P.set("counter", props.counter);
// //   }, [props, P]);
// //   // const [isLoading, setIsLoading] = useState(false);
// //   // const [isError, setIsError] = useState(false);

// //   const preload = async (K: KlintContext) => {
// //     // const video = document.createElement("video");
// //     // video.src =
// //     //   "https://cdn.shopify.com/videos/c/o/v/61c02cdf1fba42d18b0cf577a3733895.mp4";
// //     // video.autoplay = true;
// //     // video.loop = true;
// //     // video.muted = true;
// //     // await video.play();
// //     // setVideoElement(video);
// //     // await new Promise((resolve) => setTimeout(resolve, 2000));

// //     // Simulate random error (50% chance)
// //     // if (Math.random() > 0.5) {
// //     //   throw new Error("Something went wrong!");
// //     // }

// //     K.createOffscreen(
// //       "buffer",
// //       1024,
// //       1024,
// //       { static: "false" },
// //       (K: KlintOffscreenContext) => {
// //         K.extend("T", new Text(K));
// //         // K.background("#0DF");
// //         K.fillColor("FFF");
// //         // K.circle(K.width / 2, K.height / 2, 100);
// //         K.translate(K.width / 2, K.height / 2);
// //         K.textSize(64);
// //         K.T.circularText("hello world !", 640);
// //       }
// //     );

// //     // K.pause();
// //   };

// //   const setup = (K: KlintContext) => {
// //     K.textSize(100);
// //     K.alignText("center", "middle");
// //   };

// //   const onResize = (K: KlintContext) => {
// //     console.log("resize");
// //   };

// //   const onClick = (K: KlintContext) => {
// //     P.set("click-test", Number(P.get("click-test")) + 1);
// //     console.log("click");
// //   };

// //   const onMouseIn = (K: KlintContext) => {
// //     K.play();
// //     console.log("mouse in");
// //   };

// //   const onMouseOut = (K: KlintContext) => {
// //     K.pause();
// //     console.log("mouse out");
// //   };
// //   const draw = (K: KlintContext) => {
// //     K.background("#FFF");
// //     K.fillColor("#FFF");
// //     K.push();

// //     K.translate(K.width / 2, K.height / 2);
// //     K.rotate(K.frame * 0.03);
// //     // console.log(counterRef);
// //     K.fillColor("#00FF00");
// //     K.text(String(P.get("counter")), 0, -100);
// //     K.fillColor("#0000FF");
// //     K.text(String(P.get("click-test")), 0, 100);
// //     // K.image(K.getOffscreen("buffer"), 0, 0, 512, 512);
// //     K.pop();
// //     // if (videoElement) {
// //     //   K.image(videoElement, 0, 0, K.width, K.height);
// //     // }
// //     // console.log("painting");
// //   };

//   // return (
//   //   <>
//        {isLoading && (
//         <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
//           <div className="bg-slate-800 px-6 py-3 rounded-lg">Loading...</div>
//         </div>
//       )}
//       {isError && (
//         <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
//           <div className="bg-red-800 px-6 py-3 rounded-lg">Error !</div>
//         </div>
//       )}
//        <Klint
//         context={klint}
//         preload={preload}
//         draw={draw}
//         setup={setup}
//         options={{
//           origin: "corner",
//           // noloop: "true",
//         }}
//         onClick={onClick}
//         onResize={onResize}
//         onMouseIn={onMouseIn}
//         onMouseOut={onMouseOut}
//         // onLoading={setIsLoading}
//         // onError={setIsError}
//       />
//     </>
//   );
// } */

// import { redirect } from "@remix-run/node";

// export async function loader() {
//   return redirect("/documentation");
// }

// export default function Index() {
//   return null;
// }

// import Klint, { KlintContext } from "../../Klint/lib/src/Klint";
// import useKlint, { useStorage } from "../../Klint/lib/src/useKlint";
// import { Color } from "../../Klint/lib/src/plugins";
import { Color } from "@shopify/klint/plugins";
import { Klint, type KlintContext, useKlint, useStorage } from "@shopify/klint";

import { useState } from "react";

// interface KlintCanvasProps {
//   counter: number;
// }
interface KlintStorageProps {
  hello?: string;
}

// import svgType from "../src/Marcel-semibold.svg";

export function KlintCanvas(/*{ ...props }: KlintCanvasProps*/) {
  const { context, useMouse, useWindow, useImage /*useScroll*/ } = useKlint();
  const { /*mouse,*/ onClick } = useMouse();
  const { images, loadImages } = useImage();
  console.log(context);
  const { onResize } = useWindow();
  // const { images, loading } = useImage(src);
  onClick(() => {
    console.log("mouse click !");
  });
  onResize(() => {
    console.log("resized");
  });

  // const klintProps = useProps<KlintCanvasProps>(props);
  const P = useStorage<KlintStorageProps>({
    hello: "world",
  });

  const preload = async (K: KlintContext) => {
    await loadImages({
      lamp: "https://cdn.shopify.com/s/files/1/0817/9308/9592/files/lamp.png?v=1734625960",
    });
    K.extend("Color", new Color());
    // Thing.attach(K)

    // K.extend("createVector", (x: number, y: number): Vector => {
    //   return new Vector(x, y);
    // });

    // P.set("counter", props.counter);
    //K.extend("T", new Text(K));
    // console.log(K, "Welcome to Klint ! 🎨");
    // K.extend("E", new Easing(K));
    // K.install("Color", new Color(K));
    // K.extend("SVG", new SVGfont(K));
    // K.SVG.parse(svgType);

    // P.set(
    //   "points",
    //   K.SVG.getPoints("Ah !", {
    //     factor: 0.1,
    //     align: "center",
    //     center: "middle",
    //   })
    // );
    // K.describe("A set of circles");

    // K.createOffscreen(
    //   "buffer",
    //   K.width,
    //   K.height,
    //   { static: "true" },
    //   (O: KlintOffscreenContext) => {
    //     O.textFont("Inter");
    //     O.textSize(360);
    //     O.noStroke();
    //     O.alignText("center", "middle");
    //     O.computeFont();
    //     const tx = O.measureText(String(P.get("hello")));
    //     console.log(tx);
    //     O.resizeCanvas(
    //       tx.width,
    //       tx.actualBoundingBoxAscent + tx.actualBoundingBoxDescent + 24
    //     );
    //     O.fillColor("#FFF");
    //     O.text(String(P.get("hello")), O.width / 2, (O.height / 2) * 1.18);
    //   }
    // );
  };
  const setup = (K: KlintContext) => {
    K.textFont("Marcel");
    K.textSize(512);
    K.noStroke();
    K.alignText("center", "middle");
    K.setImageOrigin("center");
  };

  const draw = (K: KlintContext) => {
    const { Color } = K;
    // console.log(images["lamp"]);
    // const scrollAmount = P.get("scroll") as {
    //   distance: number;
    //   velocity: number;
    // };
    // console.log(x, y);
    // const lamp = P.get("lamp") as HTMLImageElement;
    // const rawpoints = P.get("points") as SVGFontPaths;
    // const pts = K.SVG.flatten(rawpoints, ({ point }) => {
    //   return {
    //     x: point.x * 2,
    //     y: point.y * 2 + 72,
    //   };
    // });

    // const col = C.hsl(scroll.velocity * 360, 100, 50);
    K.background(`#F00`);

    for (let i = 0; i <= 100; i++) {
      const x = (i / 100) * K.width;
      const y =
        K.height * 0.5 +
        Math.sin(K.frame * 0.03 + (i / 50) * Math.PI * 2) * 240;
      K.push();
      K.fillColor(Color.hsl((i / 100) * 360, 50, 50));
      K.circle(x, y, 100);
      K.pop();
    }

    // K.push();
    // K.fillColor(mouse.isPressed ? "#FFF" : "#000");
    // // console.log(mouse);
    // K.circle(mouse.x, mouse.y, 100);
    // // K.text("Ah !", K.width / 2, K.height / 2);
    // K.pop();

    // K.push();
    // // K.blend("difference");
    // for (let i = 0; i < 10; i++) {
    //   K.fillColor("#FFFFFF");

    //   K.circle(
    //     -K.width / 2 + (K.width * i) / 9,
    //     Math.sin(K.time * 0.03 + i / 10) * 240,
    //     100
    //   );

    //   // K.circle(
    //   //   -K.width / 2 + (K.width * i) / 9,
    //   //   Math.sin(K.time * 0.03 + i / 10) * 240,
    //   //   100
    //   // );
    // }
    // K.pop();

    // K.push();
    // K.strokeColor("#F0F");
    // K.translate(K.width / 2, K.height / 2);
    // K.SVG.draw(rawpoints, ({ point }) => {
    //   return {
    //     x: point.x,
    //     y: point.y + 72,
    //   };
    // });

    // K.pop();

    // for (const point of pts) {
    //   const { x, y } = point;
    //   const px = x + K.width / 2;
    //   const py = y + K.height / 2;
    //   K.push();
    //   const d =
    //     K.E.inout(
    //       K.remap(K.distance(px, py, K.mouse.x, K.mouse.y), 0, 400, 1, 0.0)
    //     ) * 0.4;
    //   const a = Math.atan2(py - K.mouse.y, px - K.mouse.x);
    //   K.translate(px, py);
    //   K.scale(d, d);
    //   K.rotate(a);
    //   K.image(lamp, 0, 0);
    //   K.pop();
    // }

    // const b = K.getOffscreen("buffer");
    // const s = K.scaleTo(b.width, b.height, K.width - 50, 100, true);

    // const _size = Math.min(K.height, K.width) * 0.5;
    // const count = 20;
    // const dx = Math.abs(K.mouse.x / K.width - 0.5);
    // const dy = Math.abs(K.mouse.y / K.height - 0.5);
    // // console.log(d);
    // for (let i = 0; i < count; i++) {
    //   const s = Math.sin(i / 2 + K.time * 0.03 + dx);
    //   const x = K.width / 2 + s * dx * K.width;
    //   const y = K.height / 2 + ((count / 2 - i) * K.height) / count;

    //   const cx = K.width / 2;
    //   const cy = K.height / 2;
    //   const ex = -(cx - K.mouse.x) / 25;
    //   const ey = -(cy - K.mouse.y) / 25;
    //   K.push();
    //   K.translate(x - ex, y - ey);
    //   K.rotate(s / 2);
    //   const size = _size - (1 - i / count) * (_size - 100);
    //   K.fillColor(`rgba(0, 0, 0, 0.25)`);
    //   K.rectangle(-size / 2, -size / 2, size, size);
    //   K.translate(ex, ey);
    //   K.rotate(s / 8);
    //   K.fillColor(C.colors[i % 6]);
    //   K.rectangle(-size / 2, -size / 2, size, size);
    //   K.pop();
    // }
    // // K.push();
    // // K.scale(s, s);
    // // K.image(K.getOffscreen("buffer"), 0, 0);
    // // K.pop();
    // K.fillColor("#FFF");
    // K.textSize(K.width * 0.25);
    // K.text(String(P.get("hello")), K.width / 2, K.width * 0.25);
  };

  return (
    // <KlintErrorBoundary
    //   fallback={
    //     <div className="p-4 bg-red-100 text-red-800 rounded">
    //       Something went wrong with the canvas rendering. Please try again
    //       later.
    //     </div>
    //   }
    // >
    <Klint
      context={context}
      preload={preload}
      draw={draw}
      setup={setup}
      options={{
        origin: "corner",
        // fps: 24,
        // static: "true",
      }}
    />
    // </KlintErrorBoundary>
  );
}

export default function Index() {
  const [count, setCount] = useState(0);

  return (
    <div className="flex h-screen items-center justify-center flex-col gap-4">
      <button
        onClick={() => setCount((c) => c + 1)}
        className="px-4 py-2 bg-white rounded"
      >
        Count: {count}
      </button>
      <div className="w-4/5 h-4/5 flex justify-center items-center bg-[#000] overflow-hidden rounded-[8px]">
        <KlintCanvas /*counter={count} */ />
      </div>
    </div>
  );
}
