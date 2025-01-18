import Klint, { KlintContext } from "~/Klint/src/component/Klint";
import useKlint from "~/Klint/src/hooks/useKlint";
import Text from "~/Klint/src/plugins/Text";
import { useState } from "react";

export function KlintCanvas() {
  const klint = useKlint();
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(
    null
  );

  const preload = async (K: KlintContext) => {
    // const video = document.createElement("video");
    // video.src =
    //   "https://cdn.shopify.com/videos/c/o/v/61c02cdf1fba42d18b0cf577a3733895.mp4";
    // video.autoplay = true;
    // video.loop = true;
    // video.muted = true;
    // await video.play();
    // setVideoElement(video);

    K.createOffscreen(
      "buffer",
      1024,
      1024,
      { static: "false" },
      (K: KlintContext) => {
        K.extend("T", new Text(K));
        // K.background("#0DF");
        K.fillColor("FFF");
        // K.circle(K.width / 2, K.height / 2, 100);
        K.translate(K.width / 2, K.height / 2);
        K.textSize(64);
        K.T.circularText("hello world !", 640);
      }
    );
  };

  const draw = (K: KlintContext) => {
    K.background("#FFF");
    K.fillColor("#FFF");
    K.push();
    K.translate(K.mouse.x, K.mouse.y);
    K.rotate(K.frame * 0.03);
    K.image(K.getOffscreen("buffer"), 0, 0, 512, 512);
    K.pop();
    // if (videoElement) {
    //   K.image(videoElement, 0, 0, K.width, K.height);
    // }
    // console.log("painting");
  };

  return (
    <Klint
      context={klint}
      preload={preload}
      draw={draw}
      options={{
        origin: "center",
        noloop: "false",
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
      <div className="w-4/5 h-4/5 flex justify-center items-center bg-[#398575] overflow-hidden rounded-[8px]">
        <KlintCanvas />
      </div>
    </div>
  );
}
