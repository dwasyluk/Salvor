// Shared domain types for the Notebook API.

/** A single note. `createdAt` is an ISO-8601 timestamp string. */
export interface Note {
  id: string;
  title: string;
  body: string;
  createdAt: string;
}
