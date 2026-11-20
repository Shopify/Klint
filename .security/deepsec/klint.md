# Klint

## What this codebase does

Klint is the public `@shopify/klint` Canvas 2D library for React and vanilla
JavaScript. It supports creative coding, animation, and interactive graphics.
This project covers the whole repository, including:

- `packages/klint/src/`: the runtime, React hooks, drawing helpers, and plugins.
- `packages/klint/src/plugins/font-parser/`: TTF, OTF, WOFF, and WOFF2 decoders.
- `packages/klint/bin/`: shell commands that scaffold local Vite projects,
  including a live-code editor.
- `docusaurus/`: the public static documentation site and browser playgrounds.
- `scripts/` and `.github/workflows/`: release tooling, CI, npm publishing,
  and documentation deployment.

## Auth shape

- The library has no application server, user accounts, sessions, database,
  tenant model, or built-in authentication or authorization middleware.
- Consumer applications own their authentication and any sensitive data they
  expose to sketches; Klint callbacks execute in the consumer's browser context.
- The documentation and examples are intentionally public. Playground code
  executes in the browser, not in an authenticated server-side evaluator.
- Scaffold commands run with the invoking developer's local filesystem access.
- `.github/workflows/release-and-publish.yml` publishes using npm OIDC trusted
  publishing and uses `GITHUB_TOKEN` for GitHub releases. Treat release inputs,
  generated shell commands, and artifact provenance as privileged boundaries.

## Threat model

The main runtime boundary is between supplied assets and the page consuming
Klint. Malformed fonts or other externally supplied assets could exhaust browser
resources or affect a host application; establish the input's origin and impact.
The docs playground intentionally executes JavaScript: distinguish code a visitor
chooses to run from attacker-controlled code delivered to another visitor.
Scaffolding and release tooling can write files or execute commands with developer
or CI privileges, with published packages reaching downstream consumers.

## Project-specific patterns to flag

- In `FontParser.tsx` and `plugins/font-parser/`, trace `loadFontFile` and
  `parseFontBuffer` into binary decoders. Review file-controlled table lengths,
  offsets, decompression sizes, and glyph recursion for resource amplification.
- In `docusaurus/src/components/KlintPlayground/`, trace the source passed to
  `evaluateCode`. Flag attacker-controlled remote or persisted source reaching
  `new Function` across users; check both initial examples and editable code.
- In `packages/klint/bin/create-editor` and `create-sandbox`, follow the supplied
  project directory/name into shell operations and generated project files.
  Distinguish intended writes inside the chosen project from unintended writes
  or command execution caused by interpreted input.
- In `scripts/release.mjs` and release workflows, trace version/tag inputs into
  shell commands and publication. Check whether untrusted pull-request content
  can reach publishing credentials or alter the released artifact.

## Known false-positives

- `evaluateCode.ts` uses `new Function` to run sketches by design, and the
  generated editor also evaluates code. This is not a sandbox guarantee;
  demonstrate an attacker-to-victim source path rather than self-authored code.
- Asset URL fetching in `FontParser.load` / `loadFontFile` is a browser feature,
  not a server-side fetch service. Do not assume server credentials or SSRF;
  assess the actual runtime and caller-controlled input.
- `create-editor` and `create-sandbox` intentionally create files in a selected
  local directory. Intended scaffolding alone is not arbitrary remote file write.
- Public docs, examples, and library exports do not require login. The absence
  of authentication is not itself a missing authorization check.
