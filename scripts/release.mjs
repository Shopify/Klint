#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

const args = new Set(process.argv.slice(2));
const checkOnly = args.has("--check") || args.has("--dry-run");
const assumeYes = args.has("--yes");

const run = (command, commandArgs, options = {}) =>
  execFileSync(command, commandArgs, {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: options.capture === false ? "inherit" : ["ignore", "pipe", "pipe"],
  }).trim();

const fail = (message) => {
  console.error(`Release check failed: ${message}`);
  process.exit(1);
};

const rootPackage = JSON.parse(readFileSync("package.json", "utf8"));
const klintPackage = JSON.parse(
  readFileSync("packages/klint/package.json", "utf8"),
);
const packageLock = JSON.parse(readFileSync("package-lock.json", "utf8"));
const changelog = readFileSync("CHANGELOG.md", "utf8");

const version = rootPackage.version;
const tag = `v${version}`;

if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version)) {
  fail(`invalid root package version ${JSON.stringify(version)}`);
}
if (klintPackage.version !== version) {
  fail(
    `version mismatch: root is ${version}, packages/klint is ${klintPackage.version}`,
  );
}
if (
  packageLock.version !== version ||
  packageLock.packages?.[""]?.version !== version ||
  packageLock.packages?.["packages/klint"]?.version !== version
) {
  fail("package-lock.json versions do not match package.json");
}

const releaseHeading = new RegExp(
  `^## ${tag.replaceAll(".", "\\.")} \\(\\d{4}-\\d{2}-\\d{2}\\)$`,
  "m",
);
if (!releaseHeading.test(changelog)) {
  fail(`CHANGELOG.md must contain a dated "## ${tag} (YYYY-MM-DD)" heading`);
}
if (changelog.includes(`## ${tag} (Unreleased)`)) {
  fail(`CHANGELOG.md still marks ${tag} as unreleased`);
}

const status = run("git", ["status", "--porcelain"]);
if (status) fail("the working tree is not clean");

const branch = run("git", ["branch", "--show-current"]);
const head = run("git", ["rev-parse", "HEAD"]);

console.log(`Release metadata is valid for ${tag} at ${head.slice(0, 12)}.`);

if (checkOnly) {
  if (branch !== "main") {
    console.log(
      `Preparation check passed on ${branch}. Merge it into main before releasing.`,
    );
  } else {
    console.log("Preparation check passed on main.");
  }
  process.exit(0);
}

if (branch !== "main") {
  fail(`releases must run from main, not ${branch || "detached HEAD"}`);
}

console.log("Fetching origin/main and release tags...");
run("git", ["fetch", "origin", "main", "--tags"], { capture: false });

const originMain = run("git", ["rev-parse", "origin/main"]);
if (head !== originMain) {
  fail("local main is not synchronized with origin/main");
}

try {
  run("git", ["rev-parse", "--verify", `refs/tags/${tag}`]);
  fail(`tag ${tag} already exists locally`);
} catch (error) {
  if (error?.status === 1 || error?.status === 128) {
    // Expected: the tag is available.
  } else {
    throw error;
  }
}

const remoteTag = run("git", ["ls-remote", "--tags", "origin", `refs/tags/${tag}`]);
if (remoteTag) fail(`tag ${tag} already exists on origin`);

if (!assumeYes) {
  if (!stdin.isTTY || !stdout.isTTY) {
    fail("interactive confirmation is unavailable; rerun with --yes");
  }
  const prompt = createInterface({ input: stdin, output: stdout });
  const answer = await prompt.question(
    `Create and push ${tag}? This triggers npm publication via GitHub Actions. [y/N] `,
  );
  prompt.close();
  if (!/^y(?:es)?$/i.test(answer.trim())) {
    console.log("Release cancelled.");
    process.exit(0);
  }
}

run("git", ["tag", "--annotate", tag, "--message", `Release ${tag}`], {
  capture: false,
});
run("git", ["push", "origin", tag], { capture: false });

console.log(`Pushed ${tag}. GitHub Actions now owns publication:`);
console.log(
  `https://github.com/Shopify/Klint/actions/workflows/release-and-publish.yml`,
);
