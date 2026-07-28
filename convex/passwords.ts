// Convex's TS config (lib: ["ES2020"]) doesn't include DOM / WebWorker, so
// the global `crypto` and `btoa` / `atob` aren't typed. They're available at
// runtime in the V8 isolate; we just need to declare them for the typecheck.
declare const crypto: {
  subtle: {
    digest(algorithm: string, data: Uint8Array | ArrayBuffer): Promise<ArrayBuffer>;
    importKey(
      format: string,
      keyData: Uint8Array | ArrayBuffer,
      algorithm: any,
      extractable: boolean,
      keyUsages: string[],
    ): Promise<any>;
    deriveBits(algorithm: any, baseKey: any, length: number): Promise<ArrayBuffer>;
  };
  getRandomValues<T>(array: T): T;
};
declare function btoa(s: string): string;
declare function atob(s: string): string;

// Password hashing helpers used by convex/auth.ts.
//
// We use PBKDF2-SHA256 via the Web Crypto API rather than bcrypt because
// crypto.subtle is available in Convex's V8 isolate runtime. This means the
// signup/login flows can stay as plain mutations (no node action wrapper
// required) and we don't have to add any npm dependencies — important since
// the convex bundler is sensitive to transitive dep changes.
//
// Hash format (single string, ":" separated, base64url for binary parts):
//   pbkdf2-sha256:<iterations>:<salt>:<hash>
//
// Iterations is included in the stored hash so we can rotate the cost
// factor in the future without forcing a flag-day migration: verifyPassword
// reads back whatever value was used at hash time.

const ITERATIONS = 100_000;
const SALT_BYTES = 16;
const KEY_BYTES = 32;
const PREFIX = "pbkdf2-sha256";

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  // btoa is available in Convex's V8 runtime.
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBytes(b64url: string): Uint8Array {
  const padded = b64url.replace(/-/g, "+").replace(/_/g, "/") +
    "=".repeat((4 - (b64url.length % 4)) % 4);
  const binary = atob(padded);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    out[i] = binary.charCodeAt(i);
  }
  return out;
}

async function deriveKey(
  password: string,
  salt: Uint8Array,
  iterations: number
): Promise<Uint8Array> {
  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations,
      hash: "SHA-256",
    },
    baseKey,
    KEY_BYTES * 8
  );
  return new Uint8Array(bits);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const derived = await deriveKey(password, salt, ITERATIONS);
  return [
    PREFIX,
    String(ITERATIONS),
    bytesToBase64Url(salt),
    bytesToBase64Url(derived),
  ].join(":");
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  if (!stored || typeof stored !== "string") return false;
  const parts = stored.split(":");
  if (parts.length !== 4 || parts[0] !== PREFIX) return false;
  const iterations = Number(parts[1]);
  if (!Number.isFinite(iterations) || iterations <= 0) return false;
  let salt: Uint8Array;
  let expected: Uint8Array;
  try {
    salt = base64UrlToBytes(parts[2]);
    expected = base64UrlToBytes(parts[3]);
  } catch {
    return false;
  }
  const derived = await deriveKey(password, salt, iterations);
  if (derived.length !== expected.length) return false;
  // Constant-time-ish compare. JS doesn't give us a real one but XOR-then-OR
  // avoids early exits on byte mismatch.
  let diff = 0;
  for (let i = 0; i < derived.length; i += 1) {
    diff |= derived[i] ^ expected[i];
  }
  return diff === 0;
}
