// Notebook web client — plain DOM, no framework.
// Fetches notes from the API, renders them, and posts new ones.

/** Mirrors the API's Note shape (api/src/types.ts). */
interface Note {
  id: string;
  title: string;
  body: string;
  createdAt: string;
}

const API_BASE = "http://localhost:8787";

const listEl = document.getElementById("note-list") as HTMLUListElement;
const formEl = document.getElementById("note-form") as HTMLFormElement;
const titleEl = document.getElementById("title") as HTMLInputElement;
const bodyEl = document.getElementById("body") as HTMLTextAreaElement;

async function fetchNotes(): Promise<Note[]> {
  const res = await fetch(`${API_BASE}/notes`);
  if (!res.ok) throw new Error(`GET /notes failed: ${res.status}`);
  return (await res.json()) as Note[];
}

async function createNote(title: string, body: string): Promise<Note> {
  const res = await fetch(`${API_BASE}/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, body }),
  });
  if (!res.ok) throw new Error(`POST /notes failed: ${res.status}`);
  return (await res.json()) as Note;
}

function render(notes: Note[]): void {
  listEl.replaceChildren();
  if (notes.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty";
    empty.textContent = "No notes yet. Add one above.";
    listEl.append(empty);
    return;
  }
  for (const note of notes) {
    const li = document.createElement("li");

    const h3 = document.createElement("h3");
    h3.textContent = note.title;

    const p = document.createElement("p");
    p.textContent = note.body;

    const time = document.createElement("time");
    time.dateTime = note.createdAt;
    time.textContent = new Date(note.createdAt).toLocaleString();

    li.append(h3, p, time);
    listEl.append(li);
  }
}

async function refresh(): Promise<void> {
  try {
    render(await fetchNotes());
  } catch (err) {
    console.error(err);
    listEl.replaceChildren();
    const li = document.createElement("li");
    li.className = "empty";
    li.textContent = "Could not reach the API. Is it running on :8787?";
    listEl.append(li);
  }
}

formEl.addEventListener("submit", async (event) => {
  event.preventDefault();
  const title = titleEl.value.trim();
  const body = bodyEl.value.trim();
  if (!title || !body) return;
  await createNote(title, body);
  formEl.reset();
  titleEl.focus();
  await refresh();
});

void refresh();
