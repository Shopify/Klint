import Klint, { KlintContext } from "~/Klint/src/component/Klint";
import useKlint from "~/Klint/src/hooks/useKlint";
import { useVideo } from "~/Klint/src/hooks/useVideo";

import { useState, useEffect } from "react";

export function KlintCanvas() {
  const klint = useKlint();
  const { video, load } = useVideo(
    "https://cdn.shopify.com/videos/c/o/v/61c02cdf1fba42d18b0cf577a3733895.mp4"
  );

  const preload = async (K: KlintContext) => {
    await load();
    console.log(video());
  };

  const setup = () => {};

  const draw = (K: KlintContext) => {
    // video().play();
    K.background("#111");
    K.fillColor("#FFF");
    // console.log("hey");
    K.image(video(), 0, 0, K.width, K.height);
  };

  // useEffect(() => {
  //   // Pause after 5 seconds
  //   setTimeout(() => {
  //     video?.pause();
  //   }, 5000);

  //   // Resume after 7 seconds
  //   setTimeout(() => {
  //     video?.play();
  //   }, 7000);
  // }, []);

  return (
    <Klint
      context={klint}
      preload={preload}
      draw={draw}
      options={{
        origin: "corner",
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
