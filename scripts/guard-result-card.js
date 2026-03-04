#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { TextDecoder } = require("util");

const CRITICAL_FILES = [path.join("src", "components", "ResultCard.tsx")];
const utf8Decoder = new TextDecoder("utf-8", { fatal: true });
let babelParser = null;

try {
  // Uses Next.js bundled parser to avoid adding a separate parser dependency.
  babelParser = require("next/dist/compiled/babel/parser");
} catch (error) {
  babelParser = null;
}

function ensureUtf8(filePath) {
  const absPath = path.join(process.cwd(), filePath);
  const buffer = fs.readFileSync(absPath);
  utf8Decoder.decode(buffer);
}

function ensureSyntax(filePath) {
  if (!babelParser) {
    throw new Error("syntax parser not available (install dependencies first)");
  }

  const absPath = path.join(process.cwd(), filePath);
  const source = fs.readFileSync(absPath, "utf8");
  babelParser.parse(source, {
    sourceType: "module",
    plugins: ["typescript", "jsx"],
  });
}

function main() {
  const failures = [];

  for (const filePath of CRITICAL_FILES) {
    const absPath = path.join(process.cwd(), filePath);
    if (!fs.existsSync(absPath)) {
      failures.push(`missing critical file: ${filePath}`);
      continue;
    }

    try {
      ensureUtf8(filePath);
    } catch (error) {
      failures.push(`invalid UTF-8 in ${filePath}: ${error.message}`);
      continue;
    }

    try {
      ensureSyntax(filePath);
    } catch (error) {
      failures.push(`syntax check failed in ${filePath}: ${error.message}`);
    }
  }

  if (failures.length > 0) {
    console.error("[guard:result-card] failed");
    failures.forEach((failure) => console.error(`- ${failure}`));
    process.exit(1);
  }

  console.log("[guard:result-card] passed");
}

main();
