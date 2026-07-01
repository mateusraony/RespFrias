// Uses the Web Crypto API (globalThis.crypto.subtle) so this module
// works in both Edge Runtime (middleware) and Node.js (route handlers).
export async function deriveSessionToken(password: string): Promise<string> {
  const enc = new TextEncoder()
  const key = await globalThis.crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await globalThis.crypto.subtle.sign('HMAC', key, enc.encode('respfrias-session-v1'))
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}
