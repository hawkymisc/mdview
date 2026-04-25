#!/usr/bin/env node
import { parseArgs } from "node:util";
import { spawn } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { createMdviewServer } from "../src/server.js";

const USAGE = `mdview — Markdown viewer (launches local server, renders in browser)

Usage:
  mdview <file.md> [options]

Options:
  -p, --port <num>   Port to listen on (default: 0 = random free port)
  -H, --host <host>  Host to bind (default: 127.0.0.1)
      --no-open      Do not auto-open the browser
  -h, --help         Show this help`;

function openBrowser(url) {
  const cmd =
    process.platform === "darwin"
      ? "open"
      : process.platform === "win32"
        ? "cmd"
        : "xdg-open";
  const args = process.platform === "win32" ? ["/c", "start", "", url] : [url];
  try {
    const child = spawn(cmd, args, {
      stdio: "ignore",
      detached: true,
    });
    child.on("error", () => {
      console.warn(`Could not auto-open browser. Visit: ${url}`);
    });
    child.unref();
  } catch {
    console.warn(`Could not auto-open browser. Visit: ${url}`);
  }
}

async function main() {
  let parsed;
  try {
    parsed = parseArgs({
      allowPositionals: true,
      options: {
        port: { type: "string", short: "p" },
        host: { type: "string", short: "H" },
        "no-open": { type: "boolean" },
        help: { type: "boolean", short: "h" },
      },
    });
  } catch (err) {
    console.error(`argument error: ${err.message}\n`);
    console.error(USAGE);
    process.exit(2);
  }

  if (parsed.values.help) {
    console.log(USAGE);
    return;
  }

  const [filePath] = parsed.positionals;
  if (!filePath) {
    console.error("error: markdown file path is required\n");
    console.error(USAGE);
    process.exit(2);
  }

  const absPath = path.resolve(filePath);
  if (!existsSync(absPath) || !statSync(absPath).isFile()) {
    console.error(`error: file not found: ${filePath}`);
    process.exit(1);
  }

  const port = parsed.values.port ? Number(parsed.values.port) : 0;
  if (!Number.isInteger(port) || port < 0 || port > 65535) {
    console.error(`error: invalid port: ${parsed.values.port}`);
    process.exit(2);
  }
  const host = parsed.values.host ?? "127.0.0.1";

  const server = await createMdviewServer({ filePath: absPath, port, host });
  const url = server.url;

  console.log(`mdview serving ${absPath}`);
  console.log(`  → ${url}`);
  console.log(`  (Ctrl+C to stop)`);

  if (!parsed.values["no-open"]) {
    openBrowser(url);
  }

  const shutdown = async () => {
    await server.close();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
