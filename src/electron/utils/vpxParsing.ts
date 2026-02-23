import CFB from 'cfb';
import fs from 'fs';
import path from 'path';

function normalizeContentBuffer(content: unknown): Buffer | null {
  if (!content) {
    return null;
  }

  if (Buffer.isBuffer(content)) {
    return content;
  }

  if (ArrayBuffer.isView(content)) {
    return Buffer.from(content.buffer, content.byteOffset, content.byteLength);
  }

  if (content instanceof ArrayBuffer) {
    return Buffer.from(content);
  }

  return null;
}

function decodeBuffer(buffer: Buffer, encoding: string): string | null {
  try {
    return new TextDecoder(encoding, { fatal: false }).decode(buffer);
  } catch {
    return null;
  }
}

function utf16beToLe(buffer: Buffer): Buffer {
  if (buffer.length < 2) {
    return buffer;
  }

  const source =
    buffer.length % 2 === 0 ? buffer : buffer.subarray(0, buffer.length - 1);
  const swapped = Buffer.from(source);

  for (let i = 0; i < swapped.length; i += 2) {
    const tmp = swapped[i];
    swapped[i] = swapped[i + 1];
    swapped[i + 1] = tmp;
  }

  return swapped;
}

function getDecodeCandidates(buffer: Buffer): string[] {
  const candidates: string[] = [];
  const seen = new Set<string>();

  const add = (text: string | null) => {
    if (!text || seen.has(text)) {
      return;
    }

    seen.add(text);
    candidates.push(text);
  };

  if (buffer.length >= 2 && buffer[0] === 0xff && buffer[1] === 0xfe) {
    add(decodeBuffer(buffer.subarray(2), 'utf-16le'));
  }

  if (buffer.length >= 2 && buffer[0] === 0xfe && buffer[1] === 0xff) {
    add(decodeBuffer(utf16beToLe(buffer.subarray(2)), 'utf-16le'));
  }

  add(decodeBuffer(buffer, 'utf-8'));
  add(decodeBuffer(buffer, 'utf-16le'));
  add(decodeBuffer(buffer, 'windows-1252'));
  add(decodeBuffer(buffer, 'latin1'));

  return candidates;
}

function stripCommentAndSpace(value: string): string {
  const commentIndex = value.indexOf("'");
  const withoutComment =
    commentIndex === -1 ? value : value.slice(0, commentIndex);

  return withoutComment.trim();
}

function extractGameName(scriptText: string): string | null {
  const quotedMatch = scriptText.match(
    /\bcGameName\s*=\s*(["'])([^\r\n]*?)\1/i,
  );

  if (quotedMatch?.[2] != null) {
    return stripCommentAndSpace(quotedMatch[2]);
  }

  const unquotedMatch = scriptText.match(/\bcGameName\s*=\s*([^\r\n]+)/i);

  if (unquotedMatch?.[1] != null) {
    return stripCommentAndSpace(unquotedMatch[1]);
  }

  return null;
}

export function getExpectedRomNameFromVpxFile(
  vpxFilePath: string,
): string | null {
  if (!vpxFilePath) {
    throw new Error('A VPX file path is required.');
  }

  const resolvedPath = path.resolve(vpxFilePath);

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`File not found: ${resolvedPath}`);
  }

  let cfb;

  try {
    const fileBuffer = fs.readFileSync(resolvedPath);
    cfb = CFB.read(fileBuffer, { type: 'buffer' });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to parse file as OLE Compound File: ${message}`);
  }

  for (const entry of cfb.FileIndex || []) {
    const streamBuffer = normalizeContentBuffer(entry?.content);

    if (!streamBuffer || streamBuffer.length === 0) {
      continue;
    }

    const candidates = getDecodeCandidates(streamBuffer);

    for (const candidateText of candidates) {
      const value = extractGameName(candidateText);

      if (value !== null) {
        return value;
      }
    }
  }

  return null;
}
