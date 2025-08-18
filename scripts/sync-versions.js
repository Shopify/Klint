#!/usr/bin/env node

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const ROOT_VERSION = "0.0.98";

const packages = [
  "packages/klint/package.json",
  "packages/klint-plugins/package.json",
  "packages/klint-web-component/package.json",
  "packages/mcp-server/package.json",
];

console.log(`Syncing all packages to version ${ROOT_VERSION}...`);

packages.forEach((packagePath) => {
  try {
    const fullPath = resolve(packagePath);
    const packageJson = JSON.parse(readFileSync(fullPath, "utf8"));

    const oldVersion = packageJson.version;
    packageJson.version = ROOT_VERSION;

    // Update internal dependencies
    if (packageJson.dependencies) {
      Object.keys(packageJson.dependencies).forEach((dep) => {
        if (dep.startsWith("@shopify/klint")) {
          packageJson.dependencies[dep] = `^${ROOT_VERSION}`;
        }
      });
    }

    if (packageJson.peerDependencies) {
      Object.keys(packageJson.peerDependencies).forEach((dep) => {
        if (dep.startsWith("@shopify/klint")) {
          packageJson.peerDependencies[dep] = `^${ROOT_VERSION}`;
        }
      });
    }

    if (packageJson.optionalDependencies) {
      Object.keys(packageJson.optionalDependencies).forEach((dep) => {
        if (dep.startsWith("@shopify/klint")) {
          packageJson.optionalDependencies[dep] = `^${ROOT_VERSION}`;
        }
      });
    }

    writeFileSync(fullPath, JSON.stringify(packageJson, null, 2) + "\n");
    console.log(`✓ ${packagePath}: ${oldVersion} → ${ROOT_VERSION}`);
  } catch (error) {
    console.error(`✗ Failed to update ${packagePath}:`, error.message);
  }
});

console.log("Version sync complete!");
