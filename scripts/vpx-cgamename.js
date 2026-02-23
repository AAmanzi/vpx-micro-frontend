#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const CFB = require('cfb');

const USAGE = 'Usage: npm run vpx:cgamename -- <path-to-file.vpx>';

function parseArgs(argv) {
  const args = argv.slice(2);

  if (args.length === 0) {
    return null;
  }

  const fileFlagIndex = args.findIndex((arg) => arg === '--file' || arg === '-f');

  if (fileFlagIndex !== -1) {
    return args[fileFlagIndex + 1] || null;
  }

  return args[0];
}

function normalizeContentBuffer(content) {
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

function decodeBuffer(buffer, encoding) {
  try {
    return new TextDecoder(encoding, { fatal: false }).decode(buffer);
  } catch {
    return null;
  }
}

function utf16beToLe(buffer) {
  if (buffer.length < 2) {
    return buffer;
  }

  const source = buffer.length % 2 === 0 ? buffer : buffer.subarray(0, buffer.length - 1);
  const swapped = Buffer.from(source);

  for (let i = 0; i < swapped.length; i += 2) {
    const tmp = swapped[i];
    swapped[i] = swapped[i + 1];
    swapped[i + 1] = tmp;
  }

  return swapped;
}

function getDecodeCandidates(buffer) {
  const candidates = [];
  const seen = new Set();

  const add = (text) => {
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

function stripCommentAndSpace(value) {
  const commentIndex = value.indexOf("'");
  const withoutComment = commentIndex === -1 ? value : value.slice(0, commentIndex);

  return withoutComment.trim();
}

function extractGameName(scriptText) {
  const quotedMatch = scriptText.match(/\bcGameName\s*=\s*(["'])([^\r\n]*?)\1/i);

  if (quotedMatch?.[2] != null) {
    return stripCommentAndSpace(quotedMatch[2]);
  }

  const unquotedMatch = scriptText.match(/\bcGameName\s*=\s*([^\r\n]+)/i);

  if (unquotedMatch?.[1] != null) {
    return stripCommentAndSpace(unquotedMatch[1]);
  }

  return null;
}

function main() {
  const fileArg = parseArgs(process.argv);

  if (!fileArg) {
    console.error(USAGE);
    process.exit(1);
  }

  const resolvedPath = path.resolve(fileArg);

  if (!fs.existsSync(resolvedPath)) {
    console.error(`File not found: ${resolvedPath}`);
    process.exit(1);
  }

  const isVpxExtension = path.extname(resolvedPath).toLowerCase() === '.vpx';

  if (!isVpxExtension) {
    console.error('Warning: file does not have a .vpx extension; attempting to parse anyway.');
  }

  const fileBuffer = fs.readFileSync(resolvedPath);
  let cfb;

  try {
    cfb = CFB.read(fileBuffer, { type: 'buffer' });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Failed to parse file as OLE Compound File: ${message}`);
    process.exit(1);
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
        console.log(value);
        return;
      }
    }
  }

  console.error('Could not find cGameName in any OLE stream.');
  process.exit(2);
}

main();
