#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { TextDecoder } = require("util");

const CRITICAL_FILES = [
  path.join("src", "components", "result", "ResultCard.tsx"),
  path.join("src", "lib", "saju", "saju-hanja.ts"),
];
const utf8Decoder = new TextDecoder("utf-8", { fatal: true });
let babelParser = null;
const REQUIRED_HANJA_ESCAPES = [
  "\\uBAA9(\\u6728)",
  "\\uD654(\\u706B)",
  "\\uD1A0(\\u571F)",
  "\\uAE08(\\u91D1)",
  "\\uC218(\\u6C34)",
  "\\u7532",
  "\\u4E59",
  "\\u4E19",
  "\\u4E01",
  "\\u620A",
  "\\u5DF1",
  "\\u5E9A",
  "\\u8F9B",
  "\\u58EC",
  "\\u7678",
  "\\u5B50",
  "\\u4E11",
  "\\u5BC5",
  "\\u536F",
  "\\u8FB0",
  "\\u5DF3",
  "\\u5348",
  "\\u672A",
  "\\u7533",
  "\\u9149",
  "\\u620C",
  "\\u4EA5",
];

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

function ensureNoReplacementCharacter(filePath) {
  const absPath = path.join(process.cwd(), filePath);
  const source = fs.readFileSync(absPath, "utf8");
  if (source.includes("\uFFFD")) {
    throw new Error(`replacement character found in ${filePath}`);
  }
}

function ensureNfc(filePath) {
  const absPath = path.join(process.cwd(), filePath);
  const source = fs.readFileSync(absPath, "utf8");
  if (source !== source.normalize("NFC")) {
    throw new Error(`unicode normalization (NFC) mismatch in ${filePath}`);
  }
}

function ensureHanjaEscapes(filePath) {
  if (!filePath.endsWith(path.join("src", "lib", "saju", "saju-hanja.ts"))) return;

  const absPath = path.join(process.cwd(), filePath);
  const source = fs.readFileSync(absPath, "utf8");
  const missing = REQUIRED_HANJA_ESCAPES.filter((token) => !source.includes(token));
  if (missing.length > 0) {
    throw new Error(`missing required hanja unicode escapes in ${filePath}: ${missing.join(", ")}`);
  }
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
      ensureNoReplacementCharacter(filePath);
      ensureNfc(filePath);
      ensureHanjaEscapes(filePath);
    } catch (error) {
      failures.push(`unicode guard failed in ${filePath}: ${error.message}`);
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
