import Klint, {
  KlintContext,
  KlintOffscreenContext,
} from "~/Klint/src/component/Klint";
import useKlint from "~/Klint/src/hooks/useKlint";
import Text from "~/Klint/src/plugins/Text";
import { useState } from "react";

export function KlintCanvas() {
  const klint = useKlint();
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const preload = async (K: KlintContext) => {
    // const video = document.createElement("video");
    // video.src =
    //   "https://cdn.shopify.com/videos/c/o/v/61c02cdf1fba42d18b0cf577a3733895.mp4";
    // video.autoplay = true;
    // video.loop = true;
    // video.muted = true;
    // await video.play();
    // setVideoElement(video);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Simulate random error (50% chance)
    // if (Math.random() > 0.5) {
    //   throw new Error("Something went wrong!");
    // }

    K.createOffscreen(
      "buffer",
      1024,
      1024,
      { static: "false" },
      (K: KlintOffscreenContext) => {
        K.extend("T", new Text(K));
        // K.background("#0DF");
        K.fillColor("FFF");
        // K.circle(K.width / 2, K.height / 2, 100);
        K.translate(K.width / 2, K.height / 2);
        K.textSize(64);
        K.T.circularText("hello world !", 640);
      }
    );

    K.pause();
  };

  // const setup=()=>{

  // }

  const onResize = (K: KlintContext) => {
    console.log("resize");
  };

  const onClick = (K: KlintContext) => {
    console.log("click");
  };

  const onMouseIn = (K: KlintContext) => {
    K.play();
    console.log("mouse in");
  };

  const onMouseOut = (K: KlintContext) => {
    K.pause();
    console.log("mouse out");
  };
  const draw = (K: KlintContext) => {
    K.background("#FFF");
    K.fillColor("#FFF");
    K.push();

    // K.translate(K.mouse.x, K.mouse.y);
    K.rotate(K.frame * 0.03);
    K.image(K.getOffscreen("buffer"), 0, 0, 512, 512);
    K.pop();
    // if (videoElement) {
    //   K.image(videoElement, 0, 0, K.width, K.height);
    // }
    // console.log("painting");
  };

  return (
    <>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
          <div className="bg-slate-800 px-6 py-3 rounded-lg">Loading...</div>
        </div>
      )}
      {isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
          <div className="bg-red-800 px-6 py-3 rounded-lg">Error !</div>
        </div>
      )}
      <Klint
        context={klint}
        preload={preload}
        draw={draw}
        options={{
          origin: "center",
          // noloop: "true",
        }}
        onClick={onClick}
        onResize={onResize}
        onMouseIn={onMouseIn}
        onMouseOut={onMouseOut}
        // onLoading={setIsLoading}
        // onError={setIsError}
      />
    </>
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
      <div className="w-4/5 h-4/5 flex justify-center items-center bg-[#398575] overflow-hidden rounded-[8px]">
        <KlintCanvas />
      </div>
    </div>
  );
}
