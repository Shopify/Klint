import { KlintCanvas } from "~/routes/typography";

export default function TypographyDocs() {
  return (
    <article className="max-w-3xl mx-auto prose prose-slate">
      <h1>Typography in Klint</h1>

      {/* Interactive Demo */}
      <div className="my-8 rounded-lg overflow-hidden">
        <KlintCanvas />
      </div>

      {/* Description */}
      <p>Explain the typography system here...</p>

      {/* Code Example */}
      <div className="my-6">
        <h2>Basic Usage</h2>
        <pre className="language-typescript">
          <code>{`
import { KlintCanvas, useTypography } from '@klint/core';

function MyComponent() {
  const typography = useTypography({
    // configuration
  });
  
  return <KlintCanvas {...typography} />;
}
          `}</code>
        </pre>
      </div>

      {/* API Reference */}
      <h2>API Reference</h2>
      <table>
        <thead>
          <tr>
            <th>Property</th>
            <th>Type</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>{/* API details */}</tbody>
      </table>
    </article>
  );
}
