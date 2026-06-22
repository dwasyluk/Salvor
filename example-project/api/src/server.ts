// Tiny Notes REST API built on Node's built-in `http` module — no framework.
//
// Routes:
//   GET    /notes        -> list all notes
//   GET    /notes/:id    -> single note (404 if missing)
//   POST   /notes        -> create a note from JSON { title, body }
//   DELETE /notes/:id    -> delete a note (404 if missing)
//
// Listens on process.env.PORT ?? 8787. State is in-memory (resets on restart).

import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { createNote, deleteNote, getNote, listNotes } from "./store.js";

const PORT = Number(process.env.PORT ?? 8787);

function sendJson(res: ServerResponse, status: number, payload: unknown): void {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "Content-Type": "application/json",
    // Permit the static `web` page (different origin) to call this API.
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(body);
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

const server = createServer(async (req, res) => {
  const method = req.method ?? "GET";
  const url = new URL(req.url ?? "/", `http://localhost:${PORT}`);
  const path = url.pathname;

  // CORS preflight.
  if (method === "OPTIONS") {
    sendJson(res, 204, null);
    return;
  }

  // Collection routes.
  if (path === "/notes") {
    if (method === "GET") {
      sendJson(res, 200, listNotes());
      return;
    }
    if (method === "POST") {
      const raw = await readBody(req);
      let parsed: unknown;
      try {
        parsed = raw ? JSON.parse(raw) : {};
      } catch {
        sendJson(res, 400, { error: "invalid JSON" });
        return;
      }
      const { title, body } = (parsed ?? {}) as {
        title?: unknown;
        body?: unknown;
      };
      if (typeof title !== "string" || typeof body !== "string") {
        sendJson(res, 400, { error: "title and body must be strings" });
        return;
      }
      sendJson(res, 201, createNote(title, body));
      return;
    }
    sendJson(res, 405, { error: "method not allowed" });
    return;
  }

  // Item routes: /notes/:id
  const itemMatch = path.match(/^\/notes\/([^/]+)$/);
  if (itemMatch) {
    const id = decodeURIComponent(itemMatch[1]);
    if (method === "GET") {
      const note = getNote(id);
      if (!note) {
        sendJson(res, 404, { error: "not found" });
        return;
      }
      sendJson(res, 200, note);
      return;
    }
    if (method === "DELETE") {
      const removed = deleteNote(id);
      sendJson(res, removed ? 204 : 404, removed ? null : { error: "not found" });
      return;
    }
    sendJson(res, 405, { error: "method not allowed" });
    return;
  }

  sendJson(res, 404, { error: "not found" });
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Notebook API listening on http://localhost:${PORT}`);
});
