export function normalizeCsvValue(value: unknown): string {
  if (value === null || value === undefined) {
    return ''
  }

  if (typeof value === 'string') {
    return value
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }

  if (value instanceof Date) {
    return value.toISOString()
  }

  return JSON.stringify(value)
}

export function escapeCsvValue(value: unknown): string {
  return `"${normalizeCsvValue(value).replaceAll('"', '""')}"`
}

export function getHeaderLabel(header: unknown, fallback: string): string {
  return typeof header === 'string' ? header : fallback
}
