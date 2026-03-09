#!/usr/bin/env node

const { spawn } = require("child_process");

function readMode() {
  const argValue = process.argv.find((arg) => arg.startsWith("--mode="));
  if (argValue) return argValue.split("=", 2)[1];

  const modeIdx = process.argv.indexOf("--mode");
  if (modeIdx >= 0 && process.argv[modeIdx + 1]) return process.argv[modeIdx + 1];

  return process.env.DEPLOY_MODE || "preview";
}

const mode = readMode();
const args = ["deploy", "-y"];

if (mode === "production") {
  args.push("--prod");
}

const child = spawn("vercel", args, {
  shell: true,
  stdio: ["inherit", "pipe", "pipe"],
});

let output = "";

child.stdout.on("data", (chunk) => {
  const text = chunk.toString();
  output += text;
  process.stdout.write(text);
});

child.stderr.on("data", (chunk) => {
  const text = chunk.toString();
  output += text;
  process.stderr.write(text);
});

child.on("close", (code) => {
  if (code !== 0) {
    process.exit(code || 1);
  }

  const matches = output.match(/https:\/\/[^\s"]+\.vercel\.app/g) || [];
  const url = matches[matches.length - 1];

  if (url) {
    console.log(`[vercel-deploy] deployment ready: ${url}`);
  } else {
    console.log("[vercel-deploy] deployment finished. URL not detected from CLI output.");
  }
});
