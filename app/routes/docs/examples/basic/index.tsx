import { KlintCanvas } from "./canvas";
import { useState } from "react";

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
      <div className="w-4/5 h-4/5 flex justify-center items-center bg-[#398575] overflow-hidden rounded-[8px]">
        <KlintCanvas />
      </div>
    </div>
  );
}
