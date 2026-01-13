let counter = 0;

export function generateId(prefix = 'msg'): string {
  counter += 1;
  return `${prefix}-${Date.now()}-${counter}`;
}
