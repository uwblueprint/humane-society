import type { QueryInterface } from "sequelize";

export type Rec = Record<string, any>;

export async function resolveTable(qi: QueryInterface, candidates: string[]) {
  for (const name of candidates) {
    try { await qi.describeTable(name); return name; } catch {}
  }
  throw new Error(`None of the table candidates exist: ${candidates.join(", ")}`);
}

export async function tsKeys(qi: QueryInterface, table: string) {
  const cols = await qi.describeTable(table);
  const createdKey = cols["createdAt"] ? "createdAt" : (cols["created_at"] ? "created_at" : undefined);
  const updatedKey = cols["updatedAt"] ? "updatedAt" : (cols["updated_at"] ? "updated_at" : undefined);
  return { createdKey, updatedKey };
}

export function withTS(r: Rec, createdKey?: string, updatedKey?: string) {
  const now = new Date();
  if (createdKey) r[createdKey] = now;
  if (updatedKey) r[updatedKey] = now;
  return r;
}
