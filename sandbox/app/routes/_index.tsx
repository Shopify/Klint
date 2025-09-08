// // // import { useState, useRef, useEffect } from "react";
// // /*
// // // interface CanvasProps {
// // //   counter: number;
// // // }

// // // export function KlintCanvas({ ...props }: CanvasProps) {
// // //   const { counter } = props;
// // //   console.log("Forced re-render");
// // //   const klint = useKlint();
// // //   const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(
// // //     null
// // //   );

// // //   const P = useProps({
// // //     counter: counter,
// // //     hello: "world",
// // //     "click-test": 0,
// // //   });

// // //   // const propsRef = useRef(props);
// // //   useEffect(() => {
// // //     P.set("counter", props.counter);
// // //   }, [props, P]);
// // //   // const [isLoading, setIsLoading] = useState(false);
// // //   // const [isError, setIsError] = useState(false);

// // //   const preload = async (K: KlintContext) => {
// // //     // const video = document.createElement("video");
// // //     // video.src =
// // //     //   "https://cdn.shopify.com/videos/c/o/v/61c02cdf1fba42d18b0cf577a3733895.mp4";
// // //     // video.autoplay = true;
// // //     // video.loop = true;
// // //     // video.muted = true;
// // //     // await video.play();
// // //     // setVideoElement(video);
// // //     // await new Promise((resolve) => setTimeout(resolve, 2000));

// // //     // Simulate random error (50% chance)
// // //     // if (Math.random() > 0.5) {
// // //     //   throw new Error("Something went wrong!");
// // //     // }

// // //     K.createOffscreen(
// // //       "buffer",
// // //       1024,
// // //       1024,
// // //       { static: "false" },
// // //       (K: KlintOffscreenContext) => {
// // //         K.extend("T", new Text(K));
// // //         // K.background("#0DF");
// // //         K.fillColor("FFF");
// // //         // K.circle(K.width / 2, K.height / 2, 100);
// // //         K.translate(K.width / 2, K.height / 2);
// // //         K.textSize(64);
// // //         K.T.circularText("hello world !", 640);
// // //       }
// // //     );

// // //     // K.pause();
// // //   };

// // //   const setup = (K: KlintContext) => {
// // //     K.textSize(100);
// // //     K.alignText("center", "middle");
// // //   };

// // //   const onResize = (K: KlintContext) => {
// // //     console.log("resize");
// // //   };

// // //   const onClick = (K: KlintContext) => {
// // //     P.set("click-test", Number(P.get("click-test")) + 1);
// // //     console.log("click");
// // //   };

// // //   const onMouseIn = (K: KlintContext) => {
// // //     K.play();
// // //     console.log("mouse in");
// // //   };

// // //   const onMouseOut = (K: KlintContext) => {
// // //     K.pause();
// // //     console.log("mouse out");
// // //   };
// // //   const draw = (K: KlintContext) => {
// // //     K.background("#FFF");
// // //     K.fillColor("#FFF");
// // //     K.push();

// // //     K.translate(K.width / 2, K.height / 2);
// // //     K.rotate(K.frame * 0.03);
// // //     // console.log(counterRef);
// // //     K.fillColor("#00FF00");
// // //     K.text(String(P.get("counter")), 0, -100);
// // //     K.fillColor("#0000FF");
// // //     K.text(String(P.get("click-test")), 0, 100);
// // //     // K.image(K.getOffscreen("buffer"), 0, 0, 512, 512);
// // //     K.pop();
// // //     // if (videoElement) {
// // //     //   K.image(videoElement, 0, 0, K.width, K.height);
// // //     // }
// // //     // console.log("painting");
// // //   };

// //   // return (
// //   //   <>
// //        {isLoading && (
// //         <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
// //           <div className="bg-slate-800 px-6 py-3 rounded-lg">Loading...</div>
// //         </div>
// //       )}
// //       {isError && (
// //         <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
// //           <div className="bg-red-800 px-6 py-3 rounded-lg">Error !</div>
// //         </div>
// //       )}
// //        <Klint
// //         context={klint}
// //         preload={preload}
// //         draw={draw}
// //         setup={setup}
// //         options={{
// //           origin: "corner",
// //           // noloop: "true",
// //         }}
// //         onClick={onClick}
// //         onResize={onResize}
// //         onMouseIn={onMouseIn}
// //         onMouseOut={onMouseOut}
// //         // onLoading={setIsLoading}
// //         // onError={setIsError}
// //       />
// //     </>
// //   );
// // } */

// // import { redirect } from "@remix-run/node";

// // export async function loader() {
// //   return redirect("/documentation");
// // }

// // export default function Index() {
// //   return null;
// // }

// // import Klint, { KlintContext } from "../../Klint/lib/src/Klint";
// // import useKlint, { useStorage } from "../../Klint/lib/src/useKlint";
// // import { Color } from "../../Klint/lib/src/plugins";
// import {
//   Klint,
//   type KlintContext,
//   KlintOffscreenContext,
//   useKlint,
//   useStorage,
// } from "@shopify/klint";

// import { useState } from "react";

// // interface KlintCanvasProps {
// //   counter: number;
// // }

// interface Points {
//   pos?: KlintVector;
//   color: number[];
// }

// interface KlintStorageProps {
//   points?: Points[];
// }

// // import svgType from "../src/Marcel-semibold.svg";

// if (import.meta.hot) {
//   console.log("hey");
// }

// export function KlintCanvas(/*{ ...props }: KlintCanvasProps*/) {
//   const { context, KlintMouse, useDev, KlintImage, KlintGesture, KlintWindow } =
//     useKlint();
//   const { mouse, onClick } = KlintMouse();
//   useDev();
//   const { images, loadImages } = KlintImage();
//   const { onResize } = KlintWindow();
//   const { onTap } = KlintGesture();
//   onTap(() => {
//     console.log("hey");
//   });
//   onResize(() => {
//     console.log("resized");
//   });
//   // const { onResize } = useWindow();
//   // // const { onResize } = useWindow();
//   // // const { images, loading } = useImage(src);
//   onClick(() => {
//     console.log("mouse click !");
//   });
//   // onResize(() => {
//   //   console.log("resized");
//   // });

//   // const klintProps = useProps<KlintCanvasProps>(props);
//   const P = useStorage<KlintStorageProps>({
//     points: [],
//   });

//   const preload = async (K: KlintContext) => {
//     await loadImages({
//       lamp: "https://cdn.shopify.com/s/files/1/0817/9308/9592/files/lamp.png?v=1734625960",
//     });

//     // const lamp = images.lamp;
//     // const os = K.scaleTo(lamp.width, lamp.height, K.width, K.height);
//     // K.createOffscreen(
//     //   "lamp",
//     //   lamp.width * os * 0.5,
//     //   lamp.height * os * 0.5,
//     //   {},
//     //   (O: KlintOffscreenContext) => {
//     //     O.setImageOrigin("center");
//     //     const s = O.scaleTo(lamp.width, lamp.height, O.width, O.height);
//     //     O.push();
//     //     O.translate(O.width / 2, O.height / 2);
//     //     O.scale(s, s);
//     //     O.image(lamp, 0, 0);
//     //     O.pop();
//     //   }
//     // );
//     /*
//     const offscreen = K.getOffscreen("lamp") as KlintOffscreenContext;
//     const steps = 20;
//     const points = [];
//     P.set("points", []);
//     for (let j = 0; j < offscreen.height; j += steps) {
//       for (let i = 0; i < offscreen.width; i += steps) {
//         const pixel = offscreen.readPixels(i, j);
//         if (pixel[3] !== 0) {
//           points?.push({
//             pos: K.createVector(i, j),
//             color: [pixel[0], pixel[1], pixel[2]],
//           });
//         }
//       }
//     }
//     points.sort((a, b) => a.pos.x - b.pos.x);
//     // points.sort((a, b) => a.pos.y - b.pos.y);
//     console.log(points);
//     P.set("points", points);
//     // console.log(points);
//     // Thing.attach(K)
//     */
//     // No need to extend Color anymore, it's already available in the context
//     // K.extend("Color", new Color());

//     // Vector is now directly accessible
//     // const vec = K.createVector(100, 100);
//     // console.log("Vector example:", vec.x, vec.y);

//     // // Use the built-in Color methods
//     // const redColor = K.Color.rgb(255, 0, 0);
//     // console.log("Red color:", redColor);

//     // P.set("counter", props.counter);
//     //K.extend("T", new Text(K));
//     // console.log(K, "Welcome to Klint ! 🎨");
//     // K.extend("E", new Easing(K));
//     // K.install("Color", new Color(K));
//     // K.extend("SVG", new SVGfont(K));
//     // K.SVG.parse(svgType);

//     // P.set(
//     //   "points",
//     //   K.SVG.getPoints("Ah !", {
//     //     factor: 0.1,
//     //     align: "center",
//     //     center: "middle",
//     //   })
//     // );
//     // K.describe("A set of circles");

//     K.createOffscreen("buffer", K.width, K.height, {});
//   };
//   const setup = (K: KlintContext) => {
//     K.textFont("Marcel");
//     K.textSize(64);
//     // K.noStroke();
//     K.noStroke();
//     // K.strokeCap("round");
//     K.strokeJoin("round");
//     K.alignText("left", "middle");

//     console.log(K.height);

//     // K.setImageOrigin("center");
//   };

//   const draw = (K: KlintContext) => {
//     // Use Color directly from the context
//     // const redColor = K.Color.rgb(255, 0, 0);

//     // console.log(images["lamp"]);
//     // const scrollAmount = P.get("scroll") as {
//     //   distance: number;
//     //   velocity: number;
//     // };
//     // console.log(x, y);
//     // const lamp = P.get("lamp") as HTMLImageElement;
//     // const rawpoints = P.get("points") as SVGFontPaths;
//     // const pts = K.SVG.flatten(rawpoints, ({ point }) => {
//     //   return {
//     //     x: point.x * 2,
//     //     y: point.y * 2 + 72,
//     //   };
//     // });

//     // const col = C.hsl(scroll.velocity * 360, 100, 50);
//     K.background("#FFFFFF22");
//     const speed = 0.05;
//     //
//     const txt = "hello world";
//     let steps = 0;
//     txt.split("").forEach((letter, i, a) => {
//       const x = steps;
//       const motion =
//         Math.sin(K.frame * speed + (i / a.length) * Math.PI * 2) * 100;
//       const dx = Math.cos(K.frame * speed + (i / a.length) * Math.PI * 2);
//       const y = K.height / 2 + motion;
//       // Derivative of motion w.r.t. frame for angle (dy/dx)

//       const dmotion = Math.cos(K.frame * 0.1 + (i / a.length) * Math.PI * 2);

//       K.push();
//       K.translate(x + K.width / 2 - K.textWidth(txt) * 0.5, y);
//       K.rotate(dx);
//       K.text(letter, 0, 0);
//       K.pop();
//       steps += K.textWidth(letter);
//     });
//     // K.text("hello\nworld", K.width / 2, K.height / 2);
//     // const lamp = K.getOffscreen("lamp");
//     // const points = P.get("points");
//     // K.push();
//     // if (points) {
//     //   for (const point of points) {
//     //     const { pos, color } = point;
//     //     K.push();
//     //     K.strokeColor(K.Color.rgb(color[0], color[1], color[2]));
//     //     K.point(pos.x, pos.y);
//     //     K.pop();
//     //   }
//     // }
//     // K.pop();
//     // K.image(lamp, 0, 0);

//     // K.circle(mouse.x, mouse.y, 200);
//     // for (let i = 0; i <= 200; i++) {
//     //   const x = (i / 200) * K.width;
//     //   const y =
//     //     K.height * 0.5 +
//     //     Math.sin(K.frame * 0.03 + (i / 500) * Math.PI * 2) * 240;
//     //   K.push();
//     //   K.fillColor("#0FF");
//     //   K.circle(x, y, 100);
//     //   K.pop();
//     // }

//     // K.push();
//     // K.fillColor(mouse.isPressed ? "#FFF" : "#000");
//     // // console.log(mouse);
//     // K.circle(mouse.x, mouse.y, 100);
//     // // K.text("Ah !", K.width / 2, K.height / 2);
//     // K.pop();

//     // K.push();
//     // // K.blend("difference");
//     // for (let i = 0; i < 10; i++) {
//     //   K.fillColor("#FFFFFF");

//     //   K.circle(
//     //     -K.width / 2 + (K.width * i) / 9,
//     //     Math.sin(K.time * 0.03 + i / 10) * 240,
//     //     100
//     //   );

//     //   // K.circle(
//     //   //   -K.width / 2 + (K.width * i) / 9,
//     //   //   Math.sin(K.time * 0.03 + i / 10) * 240,
//     //   //   100
//     //   // );
//     // }
//     // K.pop();

//     // K.push();
//     // K.strokeColor("#F0F");
//     // K.translate(K.width / 2, K.height / 2);
//     // K.SVG.draw(rawpoints, ({ point }) => {
//     //   return {
//     //     x: point.x,
//     //     y: point.y + 72,
//     //   };
//     // });

//     // K.pop();

//     // for (const point of pts) {
//     //   const { x, y } = point;
//     //   const px = x + K.width / 2;
//     //   const py = y + K.height / 2;
//     //   K.push();
//     //   const d =
//     //     K.E.inout(
//     //       K.remap(K.distance(px, py, K.mouse.x, K.mouse.y), 0, 400, 1, 0.0)
//     //     ) * 0.4;
//     //   const a = Math.atan2(py - K.mouse.y, px - K.mouse.x);
//     //   K.translate(px, py);
//     //   K.scale(d, d);
//     //   K.rotate(a);
//     //   K.image(lamp, 0, 0);
//     //   K.pop();
//     // }

//     // const b = K.getOffscreen("buffer");
//     // const s = K.scaleTo(b.width, b.height, K.width - 50, 100, true);

//     // const _size = Math.min(K.height, K.width) * 0.5;
//     // const count = 20;
//     // const dx = Math.abs(K.mouse.x / K.width - 0.5);
//     // const dy = Math.abs(K.mouse.y / K.height - 0.5);
//     // // console.log(d);
//     // for (let i = 0; i < count; i++) {
//     //   const s = Math.sin(i / 2 + K.time * 0.03 + dx);
//     //   const x = K.width / 2 + s * dx * K.width;
//     //   const y = K.height / 2 + ((count / 2 - i) * K.height) / count;

//     //   const cx = K.width / 2;
//     //   const cy = K.height / 2;
//     //   const ex = -(cx - K.mouse.x) / 25;
//     //   const ey = -(cy - K.mouse.y) / 25;
//     //   K.push();
//     //   K.translate(x - ex, y - ey);
//     //   K.rotate(s / 2);
//     //   const size = _size - (1 - i / count) * (_size - 100);
//     //   K.fillColor(`rgba(0, 0, 0, 0.25)`);
//     //   K.rectangle(-size / 2, -size / 2, size, size);
//     //   K.translate(ex, ey);
//     //   K.rotate(s / 8);
//     //   K.fillColor(C.colors[i % 6]);
//     //   K.rectangle(-size / 2, -size / 2, size, size);
//     //   K.pop();
//     // }
//     // // K.push();
//     // // K.scale(s, s);
//     // // K.image(K.getOffscreen("buffer"), 0, 0);
//     // // K.pop();
//     // K.fillColor("#FFF");
//     // K.textSize(K.width * 0.25);
//     // K.text(String(P.get("hello")), K.width / 2, K.width * 0.25);
//   };

//   return (
//     // <KlintErrorBoundary
//     //   fallback={
//     //     <div className="p-4 bg-red-100 text-red-800 rounded">
//     //       Something went wrong with the canvas rendering. Please try again
//     //       later.
//     //     </div>
//     //   }
//     // >
//     <Klint
//       context={context}
//       preload={preload}
//       draw={draw}
//       setup={setup}
//       options={{
//         origin: "corner",
//         // noloop: "true",
//         // fps: 24,
//         // static: "true",
//         // unsafemode: "true",
//       }}
//     />
//     // </KlintErrorBoundary>
//   );
// }

// export default function Index() {
//   const [count, setCount] = useState(0);

//   return (
//     <div className="flex h-screen items-center justify-center flex-col gap-4">
//       <button
//         onClick={() => setCount((c) => c + 1)}
//         className="px-4 py-2 bg-white rounded"
//       >
//         Count: {count}
//       </button>
//       <div className="w-4/5 h-4/5 flex justify-center items-center bg-[#000] overflow-hidden rounded-[8px]">
//         <KlintCanvas /*counter={count} */ />
//       </div>
//     </div>
//   );
// }
import { useState } from "react";
import { Klint, useKlint, useStorage, KlintContext } from "@shopify/klint";

export function KlintCanvas() {
  const { context, KlintImage, KlintMouse, useDev } = useKlint();
  const { images, loadImages } = KlintImage();
  const { mouse } = KlintMouse();
  useDev();
  const P = useStorage({
    hello: "Klint",
    headphones:
      "https://cdn.shopify.com/s/files/1/0817/9308/9592/files/headphones.png?v=1734625935",
    lamp: "https://cdn.shopify.com/s/files/1/0817/9308/9592/files/lamp.png?v=1734625960",
  });

  const preload = async (K: KlintContext) => {
    //K.extend("T", new Text(K));
    console.log(K, "Welcome to Klint ! 🎨");
    // K.extend("C", new Color(K));
    // K.extend("E", new Easing(K));

    await loadImages({
      lamp: "https://cdn.shopify.com/s/files/1/0817/9308/9592/files/lamp.png?v=1734625960",
    });

    // P.set("lamp", lampImg);
    // P.set("headphones", headphonesImg);
  };
  const setup = (K: KlintContext) => {
    K.textFont("Inter");
    K.textSize(64);
    K.noStroke();
    K.alignText("center", "middle");
    K.setImageOrigin("center");
    K.setRectOrigin("center");
  };

  const draw = (K: KlintContext) => {
    // const { C, E } = K as unknown as { E: Easing; C: Color };
    K.background(`rgba(0, 0, 0, 1)`);

    const margins = K.width * 0.8;
    const nx = 10;
    const ny = 10;
    const dx = (K.width - margins * 2) / (nx - 1);
    const dy = (K.height - margins * 2) / (ny - 1);
    const lamp = images.lamp;
    const ratio = 0.25;
    K.fillColor("#FFF");
    K.push();
    for (let j = 0; j < ny; j++) {
      for (let i = 0; i < nx; i++) {
        const x = K.width / 2 - (dx * (nx - 1)) / 2 + i * dx;
        const y = K.height / 2 - (dy * (ny - 1)) / 2 + j * dy;
        const b = mouse.x - x;
        const a = mouse.y - y;
        const c = Math.sqrt(a * a + b * b) || 1;
        // const a = Math.atan2(y - mouse.y, x - mouse.x);
        const d = K.remap(
          K.distance(x, y, mouse.x, mouse.y),
          0,
          K.width * 0.25,
          0,
          1
        );

        const e =
          ((Math.acos(b / c) * Math.PI) / Math.PI) * (mouse.y > y ? 1 : -1);
        K.push();
        K.translate(x, y);
        K.scale(d, d);
        K.rotate(e);

        //K.text("A", 0, 0);
        K.image(lamp, 0, 0, lamp.width * ratio, lamp.height * ratio);

        // K.text("hello", 0, 0);
        // K.image(lamp, 0, 0, lamp.width * ratio, lamp.height * ratio);
        // K.image(headphones, 0, 0, lamp.width * ratio, lamp.height * ratio);
        // K.rectangle(0, 0, 25, 100);
        //
        K.pop();
      }
    }
    K.pop();

    // K.image(lamp, 0, 0, lamp.width * ratio, lamp.height * ratio);
    // K.image(
    //   headphones,
    //   0,
    //   0,
    //   headphones.width * ratio * 1.5,
    //   headphones.height * ratio * 1.5
    // );
  };

  return (
    <Klint
      context={context}
      preload={preload}
      draw={draw}
      setup={setup}
      options={{
        origin: "corner",
        static: "false",
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
