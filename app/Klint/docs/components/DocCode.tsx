type Props = {
  code: string;
  language?: "jsx" | "typescript";
};

function Code({ code }: Props) {
  // Basic tokenizer for common patterns
  const tokenize = (text: string) => {
    return text
      .split(/(\s+|[(){}[\],.]|:|\(.*?\))/)
      .filter(Boolean)
      .map((token, i) => {
        if (token.trim() === "") return <span key={i}>{token}</span>;
        // Match Klint specifically
        if (i === 0) {
          return (
            <span key={i} className="text-red-400">
              {token}
            </span>
          );
        }

        // Method names after a dot
        if (i === 2) {
          return (
            <span key={i} className="text-yellow-400">
              {token}
            </span>
          );
        }

        // Keywords
        if (
          ["const", "let", "var", "function", "return", "void"].includes(token)
        ) {
          return (
            <span key={i} className="text-purple-400">
              {token}
            </span>
          );
        }

        // Types
        if (["string", "number", "boolean"].includes(token)) {
          return (
            <span key={i} className="text-blue-400">
              {token}
            </span>
          );
        }

        // Punctuation
        if (token.match(/[(){}[\],.:]/)) {
          return (
            <span key={i} className="text-gray-400">
              {token}
            </span>
          );
        }

        // Default
        return (
          <span key={i} className="text-gray-100">
            {token}
          </span>
        );
      });
  };

  return (
    <pre className="bg-[#2b2b2b] p-4 rounded-lg font-mono text-sm">
      <code>{tokenize(code)}</code>
    </pre>
  );
}

export default Code;
