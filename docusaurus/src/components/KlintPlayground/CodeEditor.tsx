import React from "react";
import Editor from "react-simple-code-editor";
import { Highlight, themes } from "prism-react-renderer";
import styles from "./KlintPlayground.module.css";

const theme = themes.dracula;

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  disabled?: boolean;
}

export default function CodeEditor({
  code,
  onChange,
  disabled,
}: CodeEditorProps) {
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
      className={styles.codeEditor}
      style={{ background: theme.plain.backgroundColor }}
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
    </div>
  );
}
