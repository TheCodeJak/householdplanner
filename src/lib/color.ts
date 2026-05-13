const PALETTE = ["#6366f1", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#ec4899", "#0ea5e9"];

export function colorFromUserId(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) & 0x7fffffff;
  }
  return PALETTE[hash % PALETTE.length];
}
