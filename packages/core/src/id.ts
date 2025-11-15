let idCounter = 0;

export function generateId(prefix: string): string {
  return `${prefix}_${idCounter++}`;
}
