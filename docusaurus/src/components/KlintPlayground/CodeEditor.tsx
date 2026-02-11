import React from "react";
import Editor from "react-simple-code-editor";
import { Highlight, themes } from "prism-react-renderer";

const EDITOR_CSS = `
  /* Infima sets overflow:auto on all <pre> elements globally, which can
     cause scrollbar/sizing mismatch with the overlaid textarea. */
  .klint-code-editor pre { overflow: hidden !important; }
  /* Caret inherits the page text color — make it visible on dark bg. */
  .klint-code-editor textarea { caret-color: #f8f8f2 !important; }
`;

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  disabled?: boolean;
}

export default function CodeEditor({ code, onChange, disabled }: CodeEditorProps) {
  const theme = themes.dracula;

  const highlight = (value: string) => (
    <Highlight theme={theme} code={value} language="javascript">
      {({ tokens, getLineProps, getTokenProps }) => (
        <>
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ line })}>
              {line.map((token, key) => (
                <span key={key} {...getTokenProps({ token })} />
              ))}
            </div>
          ))}
        </>
      )}
    </Highlight>
  );

  return (
    <div
      className="klint-code-editor"
      style={{
        background: theme.plain.backgroundColor,
        fontSize: "var(--ifm-code-font-size, 13px)",
        fontFamily: "var(--ifm-font-family-monospace)",
        overflow: "auto",
        height: "100%",
      }}
    >
      <Editor
        value={code}
        onValueChange={onChange}
        highlight={highlight}
        disabled={disabled}
        padding={16}
        style={{
          fontFamily: "var(--ifm-font-family-monospace)",
          fontSize: "var(--ifm-code-font-size, 13px)",
          lineHeight: 1.5,
          minHeight: "100%",
        }}
      />
      <style dangerouslySetInnerHTML={{ __html: EDITOR_CSS }} />
    </div>
  );
}
