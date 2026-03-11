import express from "express";
import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
  unlinkSync,
} from "fs";
import { dirname, join } from "path";
import { homedir } from "os";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const PORT = 7823;
export const TRACES_DIR = join(homedir(), ".agentrace", "traces");
export const UI_FILE = join(__dirname, "ui", "index.html");

function withCors(req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }

  next();
}

function toTraceSummary(trace) {
  return {
    trace_id: trace.trace_id,
    run_name: trace.run_name,
    started_at: trace.started_at,
    status: trace.status,
    total_duration_ms: trace.total_duration_ms,
    total_tokens: trace.total_tokens,
    total_cost_usd: trace.total_cost_usd,
    step_count: Array.isArray(trace.steps) ? trace.steps.length : 0,
    error: trace.error,
  };
}

function matchesFilters(trace, filters) {
  const { q, status, model, from_date, to_date } = filters;

  if (q != null) {
    const runName = String(trace.run_name ?? "").toLowerCase();
    if (!runName.includes(String(q).toLowerCase())) {
      return false;
    }
  }

  if (status != null && trace.status !== status) {
    return false;
  }

  if (model != null) {
    const steps = Array.isArray(trace.steps) ? trace.steps : [];
    const hasModel = steps.some((step) => step?.model === model);
    if (!hasModel) {
      return false;
    }
  }

  if (from_date != null) {
    const startedAt = String(trace.started_at ?? "");
    if (startedAt < String(from_date)) {
      return false;
    }
  }

  if (to_date != null) {
    const startedAt = String(trace.started_at ?? "");
    if (startedAt > `${to_date}T23:59:59Z`) {
      return false;
    }
  }

  return true;
}

export function listAllTraces(filters = {}) {
  if (!existsSync(TRACES_DIR)) {
    return [];
  }

  return readdirSync(TRACES_DIR)
    .filter((fileName) => fileName.endsWith(".json"))
    .map((fileName) => {
      const filePath = join(TRACES_DIR, fileName);

      try {
        const trace = JSON.parse(readFileSync(filePath, "utf8"));
        return {
          trace,
          summary: toTraceSummary(trace),
          mtimeMs: statSync(filePath).mtimeMs,
        };
      } catch {
        return null;
      }
    })
    .filter((entry) => entry !== null)
    .sort((a, b) => b.mtimeMs - a.mtimeMs)
    .filter((entry) => matchesFilters(entry.trace, filters))
    .map((entry) => entry.summary);
}

export function loadTrace(traceId) {
  const filePath = join(TRACES_DIR, `${traceId}.json`);

  if (!existsSync(filePath)) {
    return null;
  }

  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

export function deleteTrace(traceId) {
  const filePath = join(TRACES_DIR, `${traceId}.json`);

  if (!existsSync(filePath)) {
    return false;
  }

  unlinkSync(filePath);
  return true;
}

export function createApp() {
  const app = express();

  app.use(withCors);
  app.options("*", (req, res) => {
    res.sendStatus(200);
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", version: "0.1.0", runtime: "node" });
  });

  app.get("/api/traces", (req, res) => {
    const { q, status, model, from_date, to_date } = req.query;
    const traces = listAllTraces({ q, status, model, from_date, to_date });
    res.json(traces);
  });

  app.get("/api/traces/:traceId", (req, res) => {
    const trace = loadTrace(req.params.traceId);

    if (trace === null) {
      res.status(404).json({ error: "Trace not found" });
      return;
    }

    res.json(trace);
  });

  app.delete("/api/traces/:traceId", (req, res) => {
    const deleted = deleteTrace(req.params.traceId);

    if (!deleted) {
      res.status(404).json({ error: "Trace not found" });
      return;
    }

    res.json({ deleted: req.params.traceId });
  });

  const serveUI = (req, res) => {
    if (existsSync(UI_FILE)) {
      res.sendFile(UI_FILE);
      return;
    }

    res.type("html").send("<h1>AgentTrace UI not found</h1>");
  };

  app.get("/", serveUI);
  app.get("/trace/:traceId", serveUI);

  return app;
}


