// In-memory notes store.
//
// IMPORTANT (see docs/DOMAIN_REF.md LF-1): getNote/listNotes return SHALLOW
// COPIES of the stored Note objects. The Map holds the canonical instances;
// handing out the live reference let callers mutate stored state by accident.
// The store resets on process restart — there is no durability (DEFERRED #1).

import { Note } from "./types.js";

const notes = new Map<string, Note>();

let nextId = 1;

/** Return a shallow copy so callers cannot mutate the stored instance (LF-1). */
function copy(note: Note): Note {
  return { ...note };
}

/** List all notes, newest first. */
export function listNotes(): Note[] {
  return Array.from(notes.values())
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(copy);
}

/** Get a single note by id, or undefined if it does not exist. */
export function getNote(id: string): Note | undefined {
  const note = notes.get(id);
  return note ? copy(note) : undefined;
}

/** Create a note and return a copy of the stored record. */
export function createNote(title: string, body: string): Note {
  const id = String(nextId++);
  const note: Note = {
    id,
    title,
    body,
    createdAt: new Date().toISOString(),
  };
  notes.set(id, note);
  return copy(note);
}

/** Delete a note by id. Returns true if a note was removed. */
export function deleteNote(id: string): boolean {
  return notes.delete(id);
}
