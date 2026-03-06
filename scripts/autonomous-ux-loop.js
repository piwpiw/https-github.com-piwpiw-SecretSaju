#!/usr/bin/env node

const fs = require("fs/promises");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = process.cwd();
const args = process.argv.slice(2);

function getArg(name, fallback) {
  const idx = args.indexOf(`--${name}`);
  if (idx === -1 || idx === args.length - 1) return fallback;
  return args[idx + 1];
}

function getArgInt(name, fallback) {
  const value = Number(getArg(name, fallback));
  return Number.isFinite(value) ? value : fallback;
}

function hasFlag(name) {
  return args.includes(`--${name}`);
}

const APP_DIR = path.join(ROOT, "src", "app");
const LOG_DIR = path.join(ROOT, "logs");
const LOOP_WORKER_ID = getArgInt("shard-id", Number(process.env.AUTO_LOOP_SHARD_ID || 0));
const LOOP_WORKER_TOTAL = Math.max(1, getArgInt("shard-total", Number(process.env.AUTO_LOOP_SHARD_TOTAL || 1)));
const LOOP_WORKER_DOCS = (() => {
  const docsArg = getArg("docs", null);
  if (docsArg === "1") return true;
  if (docsArg === "0") return false;
  if (process.env.AUTO_LOOP_DOCS === "1") return true;
  if (process.env.AUTO_LOOP_DOCS === "0") return false;
  return LOOP_WORKER_ID === 0;
})();
const LOOP_SUFFIX = LOOP_WORKER_TOTAL > 1 ? `-w${LOOP_WORKER_ID}` : "";
const LOG_FILE = path.join(LOG_DIR, `autonomous-ui-loop${LOOP_SUFFIX}.jsonl`);
const SUMMARY_FILE = path.join(ROOT, "docs", "residual-issue-queue-summary.md");
const WORKLIST_FILE = path.join(ROOT, "docs", "continuous-development-queue.md");
const TASK_POOL_FILE = path.join(ROOT, "docs", "task-pool.jsonl");
const WORKER_TASK_POOL_FILE = path.join(ROOT, `docs/task-pool-w${LOOP_WORKER_ID}.jsonl`);
let BACKLOG_TASK_DOCS = null;
const HOURLY_REPORT_FILE = path.join(
  ROOT,
  "docs",
  LOOP_WORKER_TOTAL > 1 ? `hourly-ux-improvement-report${LOOP_SUFFIX}.md` : "hourly-ux-improvement-report.md"
);

const ONCE = args.includes("--once") || hasFlag("once");
const HOURS = Number(process.env.AUTO_LOOP_HOURS || getArgInt("hours", 5));
const INTERVAL_MS = Number(process.env.AUTO_LOOP_INTERVAL_MS || getArgInt("interval-ms", 10 * 60 * 1000));
const REPORT_INTERVAL_MS = Number(process.env.AUTO_LOOP_REPORT_INTERVAL_MS || getArgInt("report-ms", 60 * 60 * 1000));
const CONTINUOUS = process.env.AUTO_LOOP_CONTINUOUS === "1";
const END_TIME = Date.now() + Math.max(1, HOURS) * 60 * 60 * 1000;
const DURATION_LABEL = CONTINUOUS ? "infinite" : `${Math.max(1, HOURS)}h`;

function formatNow(date = new Date()) {
  return date.toISOString().replace("T", " ").replace("Z", "Z");
}

function chooseShard(filePath) {
  const rel = path.relative(ROOT, filePath).replace(/\\/g, "/");
  let hash = 0;
  for (let i = 0; i < rel.length; i += 1) {
    hash = (hash + rel.charCodeAt(i)) >>> 0;
  }
  return hash % LOOP_WORKER_TOTAL === LOOP_WORKER_ID;
}

function toDate(ts) {
  return new Date(ts).toISOString().split(".")[0].replace("T", " ");
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function unique(items) {
  return [...new Set(items)];
}

function formatDate(ts) {
  return formatNow(new Date(ts)).slice(0, 16);
}

function buildTaskId(type, payload) {
  const base = `${type}|${payload.file || ""}|${payload.route || ""}|${payload.line || ""}|${payload.text || ""}`;
  let hash = 0;
  for (let i = 0; i < base.length; i += 1) {
    hash = (hash * 31 + base.charCodeAt(i)) >>> 0;
  }
  return `${type}-${hash}`;
}

function taskPriority(type) {
  if (type === "redirect") return "P1";
  if (type === "encoding") return "P2";
  if (type === "ui-enhancement") return "P2";
  return "P3";
}

function sanitizeText(value) {
  return String(value ?? "")
    .replace(/[\x00-\x1f\x7f-\x9f]/g, " ")
    .replace(/\r?\n/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function buildTask(file, type, extra = {}) {
  const task = {
    taskId: buildTaskId(type, { ...extra, file }),
    type,
    priority: taskPriority(type),
    source: "autonomous-ux-loop",
    area: "src/app",
    file,
    state: "open",
    discoveredAt: formatNow(),
    ...extra,
  };

  return {
    ...task,
    route: task.route ? sanitizeText(task.route) : task.route,
    action: sanitizeText(task.action),
    note: sanitizeText(task.note),
    recommendation: sanitizeText(task.recommendation),
    text: sanitizeText(task.text),
  };
}

async function walkDir(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const out = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const nested = await walkDir(fullPath);
      out.push(...nested);
      continue;
    }
    if (entry.isFile() && /\.(tsx|ts)$/.test(entry.name)) {
      out.push(fullPath);
    }
  }
  return out;
}

async function walkMarkdownFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const out = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const nested = await walkMarkdownFiles(fullPath);
      out.push(...nested);
      continue;
    }
    if (entry.isFile() && entry.name.endsWith(".md")) {
      out.push(fullPath);
    }
  }
  return out;
}

async function getBacklogTaskDocs() {
  if (BACKLOG_TASK_DOCS) return BACKLOG_TASK_DOCS;
  const all = await walkMarkdownFiles(path.join(ROOT, "docs"));
  BACKLOG_TASK_DOCS = all.filter((file) => !/task-pool|residual-issue-queue|continuous-development-queue|hourly-ux-improvement-report/.test(file));
  return BACKLOG_TASK_DOCS;
}

function isPureRedirectPage(content) {
  return /import\s+\{\s*redirect\s*\}\s+from\s+["']next\/navigation["']/.test(content)
    && !/^["']use client["']/.test(content.trim())
    && /\bredirect\(\s*["'][^"']+["']\s*\)\s*;?\s*$/.test(content)
    && !/return\s*</s.test(content);
}

function routeFromFile(filePath) {
  const rel = path.relative(APP_DIR, filePath).replace(/\\/g, "/");
  return `/${rel.replace("/page.tsx", "")}`;
}

function routeSegmentsForTitle(routePath) {
  const segment = routePath.split("/").filter(Boolean).slice(-1)[0] || "page";
  const clean = segment
    .replace(/\[.*?\]/g, "")
    .replace(/[-_]/g, " ")
    .trim() || "section";
  return clean
    .split(" ")
    .map((p) => (p ? p[0].toUpperCase() + p.slice(1) : p))
    .join(" ");
}

function safeString(value) {
  return String(value ?? "").replace(/`/g, "\\`").replace(/\r?\n/g, "\\n");
}

function buildRedirectLandingPage(routePath) {
  const title = `${routeSegmentsForTitle(routePath)} Hub`;
  return `'use client';\n\nimport Link from "next/link";\nimport { Compass, ArrowRight, House } from "lucide-react";\n\nexport default function RedirectLandingPage() {\n  return (\n    <main className="min-h-screen bg-background flex items-center justify-center px-4 py-10">\n      <section className="w-full max-w-xl rounded-4xl bg-surface border border-border-color p-8 text-center shadow-2xl">\n        <Compass className="w-12 h-12 mx-auto mb-5 text-primary" />\n        <h1 className="text-2xl font-black text-foreground mb-3">${safeString(title)}</h1>\n        <p className="text-sm sm:text-base text-secondary mb-8 leading-relaxed">\n          This entry route now points to an updated access screen with direct actions.\n        </p>\n        <div className="grid gap-3 sm:grid-cols-2">\n          <Link\n            href="${safeString(routePath)}"\n            className="w-full inline-flex items-center justify-center gap-2 px-4 py-4 bg-primary text-white font-black rounded-2xl hover:scale-105 transition-all"\n          >\n            Go now\n            <ArrowRight className="w-4 h-4" />\n          </Link>\n          <Link\n            href="/"\n            className="w-full inline-flex items-center justify-center gap-2 px-4 py-4 border border-border-color text-secondary font-black rounded-2xl hover:text-foreground transition-all"\n          >\n            <House className="w-4 h-4" />\n            Back home\n          </Link>\n        </div>\n      </section>\n    </main>\n  );\n}\n`;
}

async function appendJsonLog(payload) {
  await fs.mkdir(LOG_DIR, { recursive: true });
  await fs.appendFile(LOG_FILE, `${JSON.stringify(payload)}\n`, "utf8");
}

function getGitStatusHint() {
  try {
    const raw = execSync("git status --short src docs scripts", { cwd: ROOT });
    return String(raw || "")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

function summarizeCycleActions(payload) {
  const modifiedFiles = [];
  const highlights = [];
  for (const action of payload.actions || []) {
    if (action.includes("-> landing shim")) {
      modifiedFiles.push(action.split(" -> ")[0].trim());
      highlights.push(`Fixed redirect page: ${action}`);
    } else {
      highlights.push(action);
    }
  }
  return {
    modifiedFiles: unique(modifiedFiles),
    highlights: unique(highlights),
  };
}

async function upsertTaskPool(payload) {
  const tasks = [
    ...payload.redirectSamples.map((file) =>
      buildTask(path.relative(ROOT, file), "redirect", {
        route: routeFromFile(file),
        action: "landing_shim_generated",
        note: `Redirect-only page replaced with landing shim: ${routeFromFile(file)}`,
        recommendation: "Route shim generated. Add domain-appropriate CTA flow and copy refinement.",
      })
    ),
    ...payload.garbledSamples.map((file) =>
      buildTask(path.relative(ROOT, file), "encoding", {
        route: routeFromFile(file),
        action: "encoding_cleanup_needed",
        note: "Encoding suspicious character detected",
        recommendation: "Verify file text strings and normalize to UTF-8. Rebuild and run smoke check.",
      })
    ),
    ...payload.markerSamples.map((marker) =>
      buildTask(marker.file, "marker", {
        route: routeFromFile(marker.file),
        action: "marker_follow_up",
        line: marker.line,
        text: marker.text,
        note: `DEV marker detected: ${marker.text}`,
        recommendation: "Convert this marker into a concrete improvement ticket and close it after actioning.",
      })
    ),
    ...(payload.backlogSamples || []).map((marker) =>
      buildTask(marker.file, "backlog", {
        route: `/${marker.file.replace(/\\/g, "/")}`,
        action: "backlog_item_pending",
        line: marker.line,
        text: marker.text,
        note: `Pending backlog item: ${marker.text}`,
        recommendation: "Convert backlog item into a DO/ticket, set owner, and assign a concrete owner action plan."
      })
    ),
    ...(payload.screenEnhancementSamples || []).map((sample) =>
      buildTask(sample.file, "ui-enhancement", {
        route: routeFromFile(sample.file),
        action: "ux_audit_needed",
        line: sample.line,
        text: sample.text,
        note: `UI/UX enhancement candidate: ${sample.text}`,
        recommendation: `${sample.recommendation}. Reopen UX review and close after 적용.`,
      })
    ),
  ];

  if (!tasks.length) return { redirect: 0, encoding: 0, marker: 0, backlog: 0 };

  const appendUnique = async (targetPath) => {
    const existing = await fs.readFile(targetPath, "utf8").catch(() => "");
    const existingIds = new Set(
      existing
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          try {
            return JSON.parse(line).taskId;
          } catch {
            return null;
          }
        })
        .filter(Boolean)
    );

    const addable = tasks.filter((task) => {
      if (existingIds.has(task.taskId)) return false;
      existingIds.add(task.taskId);
      return true;
    });
    if (addable.length > 0) {
      const sanitizedLines = addable.map((task) => JSON.stringify(task));
      await fs.appendFile(targetPath, `${sanitizedLines.join("\n")}\n`, "utf8");
    }
    return addable;
  };

  const added = await appendUnique(WORKER_TASK_POOL_FILE);
  const addedGlobal = await appendUnique(TASK_POOL_FILE);

  return {
    redirect: [...added, ...addedGlobal].filter((task) => task.type === "redirect").length,
    encoding: [...added, ...addedGlobal].filter((task) => task.type === "encoding").length,
    marker: [...added, ...addedGlobal].filter((task) => task.type === "marker").length,
    backlog: [...added, ...addedGlobal].filter((task) => task.type === "backlog").length,
    uiEnhancement: [...added, ...addedGlobal].filter((task) => task.type === "ui-enhancement").length,
  };
}

async function appendHourlyReport({ batchIndex, from, to, cycles, payloads }) {
  if (!LOOP_WORKER_DOCS) return;
  const reduced = payloads.reduce(
    (acc, item) => {
      const s = summarizeCycleActions(item);
      acc.modified.push(...s.modifiedFiles);
      acc.actions.push(...s.highlights);
    acc.redirect += item.redirectCount || 0;
    acc.encoding += item.garbledCount || 0;
    acc.markers += item.markerCount || 0;
    acc.backlog += item.backlogCount || 0;
    acc.uiEnhancement += item.screenEnhancementCount || 0;
    return acc;
    },
    { modified: [], actions: [], redirect: 0, encoding: 0, markers: 0, backlog: 0, uiEnhancement: 0 }
  );

  const lines = [
    `## Hourly Report #${batchIndex} (${formatNow(new Date(to))})`,
    `- Window: ${formatDate(from)} ~ ${formatDate(to)}`,
    `- Cycles: ${cycles}`,
    `- Redirect candidates fixed: ${reduced.redirect}`,
    `- Encoding suspects: ${reduced.encoding}`,
    `- Dev markers found: ${reduced.markers}`,
    `- Backlog checklist items: ${reduced.backlog}`,
    `- UI/UX enhancement candidates: ${reduced.uiEnhancement}`,
    "- Changes applied:",
    ...(reduced.modified.length ? reduced.modified.map((item) => `  - ${item}`) : ["  - none"]),
    "- Summary actions:",
    ...(reduced.actions.length ? reduced.actions.map((item) => `  - ${item}`) : ["  - no changes"]),
    `- Git hint count: ${getGitStatusHint().length}`,
  ];

  const existing = await fs.readFile(HOURLY_REPORT_FILE, "utf8").catch(() => "");
  const content = existing
    ? `${existing}\n\n${lines.join("\n")}`
    : `# Hourly UI/UX Improvement Report\n\n${lines.join("\n")}`;
  await fs.writeFile(HOURLY_REPORT_FILE, content, "utf8");
}

async function upsertWorklist(payload) {
  if (!LOOP_WORKER_DOCS) return;
  const header = `## Cycle ${payload.cycle} (${payload.timestamp})`;
  const redirectBlock = payload.redirectCount > 0
    ? `- Redirect-only page candidates: ${payload.redirectCount} files\n  - ${payload.redirectSamples.map((f) => path.relative(ROOT, f)).join("\n  - ")}`
    : "- Redirect-only page candidates: none";
  const garbledBlock = payload.garbledCount > 0
    ? `- Encoding-suspect files: ${payload.garbledCount} files\n  - ${payload.garbledSamples.map((f) => path.relative(ROOT, f)).join("\n  - ")}`
    : "- Encoding-suspect files: none";
  const markerBlock = payload.markerCount > 0
    ? `- Dev markers: ${payload.markerCount}\n  - ${payload.markerSamples?.map((m) => `${m.file}:${m.line} ${m.text}`).join("\n  - ")}`
    : "- Dev markers: none";
  const backlogBlock = payload.backlogCount > 0
    ? `- Backlog checklist: ${payload.backlogCount} items\n  - ${payload.backlogSamples?.map((m) => `${m.file}:${m.line} ${m.text}`).join("\n  - ")}`
    : "- Backlog checklist: none";
  const screenBlock = payload.screenEnhancementCount > 0
    ? `- UI/UX enhancement candidates: ${payload.screenEnhancementCount}\n  - ${payload.screenEnhancementSamples?.map((m) => `${m.file}:${m.line} ${m.text}`).join("\n  - ")}`
    : "- UI/UX enhancement candidates: none";
  const actions = payload.actions?.length ? payload.actions.join(", ") : "scan + documentation log only";

  const lines = [
    header,
    `- Status: ${payload.redirectCount || payload.garbledCount || (payload.actions || []).length > 0 ? "work processed" : "stable"}`,
    redirectBlock,
    garbledBlock,
    markerBlock,
    backlogBlock,
    screenBlock,
    `- Actions applied: ${actions}`,
    "",
  ].join("\n");

  const existing = await fs.readFile(WORKLIST_FILE, "utf8").catch(() => "");
  const updated = existing ? `${existing}\n\n${lines}` : `# Continuous Development Queue\n\n${lines}`;
  await fs.writeFile(WORKLIST_FILE, updated, "utf8");
}

async function appendSummary(payload, note) {
  if (!LOOP_WORKER_DOCS) return;
  const ts = formatNow();
  const lines = [
    "",
    `### Autonomous UI/UX Dev Loop (${ts})`,
    `- Cycle: #${payload.cycle}`,
    `- Redirect candidates: ${payload.redirectCount}`,
    `- Encoding suspects: ${payload.garbledCount}`,
    `- Dev markers: ${payload.markerCount ?? 0}`,
    `- Backlog checklist: ${payload.backlogCount ?? 0}`,
    `- UI/UX enhancement candidates: ${payload.screenEnhancementCount ?? 0}`,
    `- Note: ${note}`,
    `- Mode: ${payload.standalone ? "single pass" : "persistent loop"} (${DURATION_LABEL})`,
  ];
  await fs.appendFile(SUMMARY_FILE, `${lines.join("\n")}\n`, "utf8");
}

async function scanRedirectPages() {
  const files = await walkDir(APP_DIR);
  const results = [];
  for (const file of files.filter((f) => /[\\/]page\.tsx$/.test(f))) {
    if (!chooseShard(file)) continue;
    const content = await fs.readFile(file, "utf8");
    if (isPureRedirectPage(content)) {
      results.push(file);
    }
  }
  return results;
}

async function scanEncodingSuspects() {
  const files = await walkDir(APP_DIR);
  const suspects = [];
  for (const file of files) {
    if (!chooseShard(file)) continue;
    const content = await fs.readFile(file, "utf8");
    if (/\uFFFD/.test(content)) {
      suspects.push(file);
    }
  }
  return suspects;
}

async function scanDevMarkers() {
  const files = await walkDir(APP_DIR);
  const markers = [];
  const pattern = /(TODO|FIXME|BUG|HACK)/i;
  for (const file of files) {
    if (!chooseShard(file)) continue;
    const content = await fs.readFile(file, "utf8");
    const lines = content.split(/\r?\n/);
    lines.forEach((line, index) => {
      if (pattern.test(line)) {
        markers.push({
          file: path.relative(ROOT, file),
          line: index + 1,
          text: line.trim(),
        });
      }
    });
  }
  return markers;
}

async function scanBacklogTaskItems() {
  if (LOOP_WORKER_ID !== 0) {
    return [];
  }
  const items = [];
  const pattern = /^\s*-\s*\[\s\]\s*(.+)$/;
  const backlogDocs = await getBacklogTaskDocs();
  for (const file of backlogDocs) {
    try {
      const content = await fs.readFile(file, "utf8");
      const lines = content.split(/\r?\n/);
      for (let index = 0; index < lines.length; index += 1) {
        const match = lines[index].match(pattern);
        if (!match || !match[1]?.trim()) continue;
        items.push({
          file: path.relative(ROOT, file),
          line: index + 1,
          text: sanitizeText(match[1]).slice(0, 240),
        });
      }
    } catch {
      // Ignore missing doc source.
    }
  }
  return items;
}

function isLandingLikePage(content) {
  return /<main|<section|<article|<header|<footer/.test(content);
}

function hasPrimaryAction(content) {
  return /<button|<a|<Link|href=/.test(content);
}

function hasFormOrInput(content) {
  return /<form|<input|<textarea|<select/.test(content);
}

function hasAccessibleTypography(content) {
  return /<h1|<h2|<h3/.test(content);
}

async function scanScreenEnhancementCandidates() {
  const files = await walkDir(APP_DIR);
  const candidates = [];
  const placeholderPatterns = [
    /추가\s*예정/i,
    /준비\s*중/i,
    /임시/i,
    /샘플/i,
    /sample/i,
    /todo/i,
    /placeholder/i,
    /under construction/i,
    /coming soon/i,
    /not ready/i,
    /beta|알려드리겠습니다|테스트/i,
  ];
  for (const file of files.filter((f) => /[\\/]page\.tsx$/.test(f))) {
    if (!chooseShard(file)) continue;
    const content = await fs.readFile(file, "utf8");
    const reasons = [];

    const hasRouteShell = /return\s*\(/.test(content) && /<main|<section|<article|<div/.test(content);
    const hasPrimaryAction = /<button|<a\\b|href=|onClick=/.test(content);
    const hasFormFlow = /<form|<input|<select|<textarea|onSubmit=|onChange=/.test(content);
    const hasDataFlow = /(fetch\(|axios\.|useQuery|useMutation|createServerComponent|getServerSideProps|getStaticProps|searchParams|params\.|useState\(|useReducer\(|useMemo\(|useCallback)/.test(content);
    const hasTextualValue = content
      .replace(/<[^>]+>/g, " ")
      .replace(/[\\r\\n\\t]+/g, " ")
      .match(/[가-힣A-Za-z]{4,}/g)?.length || 0;
    const hasStructureTitles = /<h[1-4]|title=/.test(content);
    const hasLoadingOrErrorUX = /loading|isLoading|error|fallback|skeleton|Spinner|toast|alert|빈 값|빈\\s*상태|no data|빈목록/.test(content);
    const hasListPresentation = /<ul|<ol|<table|Card|Table|List|Grid/.test(content);
    const hasAccessibilitySemantics = /aria-label|aria-describedby|role=/.test(content);
    const hasPlaceholderCopy = placeholderPatterns.some((pattern) => pattern.test(content));
    const hasOnlyThinStub = hasRouteShell && hasTextualValue < 4 && !hasPrimaryAction && !hasListPresentation && !hasDataFlow;

    if (!hasStructureTitles) {
      reasons.push("제목/섹션 계층이 약해 사용자 안내/구분이 어려움");
    }
    if (!hasPrimaryAction) {
      reasons.push("페이지 진입 후 실행할 핵심 동작(CTA, 이동/제출, 토글)이 없음");
    }
    if (!hasFormFlow && /입력|설문|등록|신청|등록하기|전송|검색/.test(content)) {
      reasons.push("기획된 입력/전송 플로우가 있는데 UI 동작 요소가 부실함");
    }
    if (!hasListPresentation && /목록|리스트|cards|카드|리스트/.test(content)) {
      reasons.push("목록형 데이터 표현 레이아웃이 없어 정보 밀도 개선 필요");
    }
    if (!hasLoadingOrErrorUX && hasDataFlow) {
      reasons.push("데이터 로드 및 예외 처리 UI(로딩/빈값/에러) 미비");
    }
    if (!hasAccessibilitySemantics && (hasPrimaryAction || hasFormFlow)) {
      reasons.push("액션/입력 컴포넌트 접근성 속성 누락 가능성 존재");
    }
    if (hasPlaceholderCopy) {
      reasons.push("임시/샘플/미구현 문구 존재로 실제 기능 고도화 필요");
    }
    if (hasOnlyThinStub) {
      reasons.push("정적 스켈레톤 성격으로 기능 구현 밀도 부족");
    }

    if (reasons.length >= 2) {
      candidates.push({
        file: path.relative(ROOT, file),
        line: 1,
        text: sanitizeText(reasons.slice(0, 4).join("; ")),
        recommendation:
          "핵심 기능 흐름(조회/입력/액션)을 추가하고, 제목/CTA/빈상태/에러/로딩 상태까지 포함한 표준 화면 패턴으로 고도화",
      });
    }
  }
  return candidates;
}

async function autoFixRedirectPages(files) {
  const actions = [];
  for (const filePath of files) {
    const route = routeFromFile(filePath);
    const content = buildRedirectLandingPage(route);
    await fs.writeFile(filePath, content, "utf8");
    actions.push(`${path.relative(ROOT, filePath)} -> landing shim`);
  }
  return actions;
}

async function runCycle(state) {
  const cycle = ++state.cycle;
  const redirectPages = await scanRedirectPages();
  const encodingSuspects = await scanEncodingSuspects();
  const devMarkers = await scanDevMarkers();
  const backlogItems = await scanBacklogTaskItems();
  const screenEnhancementItems = await scanScreenEnhancementCandidates();
  const actions = [];

  if (redirectPages.length > 0) {
    const fixed = await autoFixRedirectPages(redirectPages);
    actions.push(...fixed);
  } else {
    actions.push("no redirect fixes to apply");
  }

  if (encodingSuspects.length > 0) {
    actions.push("encoding suspects logged");
  }
  if (devMarkers.length > 0) {
    actions.push(`dev-marker list updated (${devMarkers.length})`);
  }
  if (backlogItems.length > 0) {
    actions.push(`backlog checklist discovered (${backlogItems.length})`);
  }
  if (screenEnhancementItems.length > 0) {
    actions.push(`ui enhancement candidates discovered (${screenEnhancementItems.length})`);
  }

  const payload = {
    timestamp: formatNow(),
    cycle,
    redirectCount: redirectPages.length,
    redirectSamples: redirectPages,
    garbledCount: encodingSuspects.length,
    garbledSamples: encodingSuspects,
    markerCount: devMarkers.length,
    markerSamples: devMarkers.slice(0, 20),
    backlogCount: backlogItems.length,
    backlogSamples: backlogItems.slice(0, 20),
    screenEnhancementCount: screenEnhancementItems.length,
    screenEnhancementSamples: screenEnhancementItems.slice(0, 20),
    standalone: ONCE,
    actions,
  };

  const note = redirectPages.length === 0 && encodingSuspects.length === 0 && devMarkers.length === 0 && backlogItems.length === 0 && screenEnhancementItems.length === 0
    ? "No actionable anomalies found."
    : "Anomalies found and tracked.";
  const taskStats = await upsertTaskPool({
    redirectSamples: redirectPages,
    garbledSamples: encodingSuspects,
    markerSamples: devMarkers,
    backlogSamples: backlogItems,
    screenEnhancementSamples: screenEnhancementItems,
  });
  const pooled = taskStats.redirect + taskStats.encoding + taskStats.marker + taskStats.backlog + taskStats.uiEnhancement;
  if (pooled > 0) {
    actions.push(`task-pool added ${pooled} items (redirect=${taskStats.redirect}, encoding=${taskStats.encoding}, marker=${taskStats.marker}, backlog=${taskStats.backlog}, ui-enhancement=${taskStats.uiEnhancement})`);
  } else {
    actions.push("task-pool unchanged");
  }

  await appendJsonLog(payload);
  await appendSummary(payload, note);
  await upsertWorklist(payload);
  return payload;
}

process.on("uncaughtException", (error) => {
  void appendJsonLog({
    timestamp: formatNow(),
    cycle: "error",
    type: "uncaughtException",
    error: String(error?.stack || error),
    standalone: ONCE,
  });
  console.error("[autonomous-ux-loop] uncaughtException", error);
});

process.on("unhandledRejection", (reason) => {
  void appendJsonLog({
    timestamp: formatNow(),
    cycle: "error",
    type: "unhandledRejection",
    error: String(reason?.stack || reason),
    standalone: ONCE,
  });
  console.error("[autonomous-ux-loop] unhandledRejection", reason);
});

(async () => {
  const state = { cycle: 0 };
  const loopStart = Date.now();
  let batchStart = loopStart;
  let nextReportAt = loopStart + REPORT_INTERVAL_MS;
  let batchPayloads = [];

  await appendSummary(
    {
      cycle: "start",
      redirectCount: "run",
      garbledCount: "run",
      standalone: ONCE,
      markerCount: 0,
      actions: ["loop boot"],
    },
    `AUTO_LOOP_HOURS=${HOURS}, AUTO_LOOP_INTERVAL_MS=${INTERVAL_MS}, AUTO_LOOP_REPORT_INTERVAL_MS=${REPORT_INTERVAL_MS}`
  );

  while (true) {
    const payload = await runCycle(state);
    batchPayloads.push(payload);

    const now = Date.now();
    const remain = CONTINUOUS ? "infinite" : `${Math.max(0, Math.round((END_TIME - now) / 60000))}m`;
    const batchIndex = Math.floor((batchStart - loopStart) / REPORT_INTERVAL_MS) + 1;

    if (now >= nextReportAt || (!CONTINUOUS && now >= END_TIME)) {
      await appendHourlyReport({
        batchIndex,
        from: batchStart,
        to: now,
        cycles: batchPayloads.length,
        payloads: batchPayloads,
      });
      batchPayloads = [];
      batchStart = now;
      nextReportAt = now + REPORT_INTERVAL_MS;
    }

    console.log(`[autonomous-ux-loop] cycle=${payload.cycle} redirect=${payload.redirectCount} garbled=${payload.garbledCount} ui-enh=${payload.screenEnhancementCount ?? 0} remain=${remain}`);
    if (ONCE) break;
    if (!CONTINUOUS && now >= END_TIME) break;
    await sleep(Math.max(5000, INTERVAL_MS));
  }
})();

