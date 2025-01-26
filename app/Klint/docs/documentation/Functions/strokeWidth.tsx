import useKlint, { KlintContext } from "~/Klint/src/hooks/useKlint";
import DocLinks from "../../components/DocLinks";
import Banner from "../../components/DocBanners";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import jsx from "react-syntax-highlighter/dist/esm/languages/prism/jsx";
import a11yDark from "react-syntax-highlighter/dist/esm/styles/prism/a11y-dark";

SyntaxHighlighter.registerLanguage("jsx", jsx);

export function KlintCanvas() {
  const { Klint, context } = useKlint();

  const widths = [0, 1, 2, 3, 10, 100];
  const draw = (K: KlintContext) => {
    K.background("#CCC");
    const margins = K.width * 0.1;
    K.push();
    for (let i = 0; i < widths.length; i++) {
      const x = margins * 2 + i * margins;
      const y = K.height / 2;
      K.strokeWidth(widths[i]);
      K.line(x, y - margins * 2, x, y + margins * 2);
    }
    K.pop();
  };

  return (
    <Klint
      context={context}
      // preload={preload}
      draw={draw}
      // setup={setup}
      options={{
        origin: "corner",
        static: "true",
      }}
    />
  );
}

const StrokeWidth = () => {
  const codeExample = `
Klint.strokeWidth(width: number): void
  `.trim();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 ">
      <h1 className="text-4xl font-bold mb-4">strokeWidth()</h1>

      <p className="text-gray-600 mb-8">
        Sets the width of lines, points and the borders of shapes.
      </p>
      <div className="mb-8">
        <div className="w-full sm:w-[480px] md:w-[640px] aspect-video bg-black rounded-xl overflow-hidden mx-auto mb-4">
          <KlintCanvas />
        </div>
      </div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Syntax</h2>
        <div>
          <SyntaxHighlighter
            className="rounded-lg"
            language="jsx"
            style={a11yDark}
          >
            {codeExample}
          </SyntaxHighlighter>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Parameters</h2>
        <div className="bg-[#2b2b2b] p-4 rounded-lg">
          <ul className="list-disc list-inside">
            <li>
              <code>width</code>: number - The width of the stroke in pixels
            </li>
          </ul>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Code</h2>
        <pre className="bg-[#2b2b2b] p-4 rounded-lg overflow-x-auto">
          <code className="language-typescript">{codeExample}</code>
        </pre>
      </div>

      <Banner type="info">
        The stroke width is measured in pixels and affects all subsequent
        drawing operations.
      </Banner>

      <Banner type="success">
        For consistent visuals across different devices, consider using relative
        stroke widths based on canvas size.
      </Banner>

      <Banner type="warning">
        Very large stroke widths may impact performance on complex drawings.
      </Banner>

      <Banner type="error">
        Negative stroke widths are not supported and will be converted to their
        absolute value.
      </Banner>

      <DocLinks
        githubUrl="https://github.com/yourusername/klint"
        canvasApiUrl="https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineWidth"
        additionalLinks={[
          {
            label: "Processing strokeWeight()",
            url: "https://processing.org/reference/strokeWeight_.html",
          },
        ]}
      />
    </div>
  );
};

export default StrokeWidth;
