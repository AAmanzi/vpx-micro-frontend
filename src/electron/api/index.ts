export * from './fileSystem'
export * from './tables'

export function ping(): { ok: true } {
  return { ok: true }
}