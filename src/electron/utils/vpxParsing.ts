import CFB from 'cfb';
import fs from 'fs';
import path from 'path';

import { resolveUserPath } from './path';

const QUOTED_CGAMENAME_REGEX = /\bcGameName\s*=\s*(["'])([^\r\n]*?)\1/i;
const UNQUOTED_CGAMENAME_REGEX = /\bcGameName\s*=\s*([^\r\n]+)/i;

const ROM_REQUIRED_PATTERNS = [
  /\bLoadVPM\s*\(/i,
  /\bvpmInit\s*\(/i,
  /\bCreateObject\s*\(\s*"VPinMAME\.Controller"\s*\)/i,
  /\bController\.GameName\s*=\s*cGameName\b/i,
  /\bWith\s+Controller\b[\s\S]{0,1000}\b\.GameName\s*=\s*cGameName\b/i,
  /\bController\.Run\s+GetPlayerHWnd\b/i,
  /\bController\.Games\s*\(\s*cGameName\s*\)/i,
  /\bUseSolenoids\b/i,
  /\bUseLamps\b/i,
  /\bUseGI\b/i,
];

const QUICK_ROM_HINT_REGEX =
  /loadvpm|vpminit|vpinmame\.controller|controller\.gamename|with\s+controller|controller\.run|controller\.games|usesolenoids|uselamps|usegi/i;

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
  const quotedMatch = scriptText.match(QUOTED_CGAMENAME_REGEX);

  if (quotedMatch?.[2] != null) {
    return stripCommentAndSpace(quotedMatch[2]);
  }

  const unquotedMatch = scriptText.match(UNQUOTED_CGAMENAME_REGEX);

  if (unquotedMatch?.[1] != null) {
    return stripCommentAndSpace(unquotedMatch[1]);
  }

  return null;
}

function stripVbLineComment(line: string): string {
  let inQuote = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      inQuote = !inQuote;
      continue;
    }

    if (char === "'" && !inQuote) {
      return line.slice(0, i);
    }
  }

  return line;
}

function getScriptWithoutComments(scriptText: string): string {
  return scriptText
    .split(/\r?\n/)
    .map((line) => stripVbLineComment(line))
    .join('\n');
}

function scriptRequiresRom(scriptText: string): boolean {
  if (!QUICK_ROM_HINT_REGEX.test(scriptText)) {
    return false;
  }

  const script = getScriptWithoutComments(scriptText);

  return ROM_REQUIRED_PATTERNS.some((pattern) => pattern.test(script));
}

function isLikelyScriptEntryName(entryName: string): boolean {
  return /^(GameData|Code|Script)$/i.test(entryName.trim());
}

export function getExpectedRomNameFromVpxFile(
  vpxFilePath: string,
): string | null {
  if (!vpxFilePath) {
    throw new Error('A VPX file path is required.');
  }

  const resolvedPath = path.resolve(resolveUserPath(vpxFilePath));

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

  const fileIndex = cfb.FileIndex || [];
  const prioritizedEntries = fileIndex.filter((entry: { name?: string }) =>
    isLikelyScriptEntryName(entry?.name || ''),
  );
  const entriesToScan =
    prioritizedEntries.length > 0 ? prioritizedEntries : fileIndex;

  for (const entry of entriesToScan) {
    const streamBuffer = normalizeContentBuffer(entry?.content);

    if (!streamBuffer || streamBuffer.length === 0) {
      continue;
    }

    const candidates = getDecodeCandidates(streamBuffer);
    let detectedRomName: string | null = null;

    for (const candidateText of candidates) {
      if (detectedRomName === null) {
        detectedRomName = extractGameName(candidateText);
      }
    }

    if (detectedRomName === null) {
      continue;
    }

    for (const candidateText of candidates) {
      if (scriptRequiresRom(candidateText)) {
        return detectedRomName;
      }
    }
  }

  return null;
}
