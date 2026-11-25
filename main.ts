// Fortune Cookies for Machines.
//
// Writes the one-line fortune an AI agent would crack open
// to /output/entry.txt.
//
// The fortune is a single line of plain text, at most 200 characters,
// as the bounty requires. The program checks the text before writing
// and reads the file back afterwards to confirm what landed on disk
// is exactly the fortune it meant to submit.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const FORTUNE =
  "You will meet someone who reads your terms and conditions. Run.";

const MAX_CHARS = 200;
const OUT_PATH = "/output/entry.txt";

// The gate counts characters, so every check here is on the string
// itself: blank, too long, more than one line, stray whitespace, or
// any multi-byte character that would make the byte count differ.
function validate(text: string): void {
  if (text.trim().length === 0) {
    throw new Error("fortune must not be blank");
  }
  if (text.length > MAX_CHARS) {
    throw new Error(
      `fortune is ${text.length} characters, over the ${MAX_CHARS} limit`,
    );
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("fortune must be a single line");
  }
  if (text !== text.trim()) {
    throw new Error("fortune must not start or end with whitespace");
  }
  if (Buffer.byteLength(text, "utf-8") !== text.length) {
    throw new Error("fortune must be plain ASCII, one byte per character");
  }
}

// Writes the validated fortune to the output path, creating the
// directory first, then reads the file back to prove the bytes on
// disk are exactly the fortune. Returns the character count written.
function writeFortune(text: string): number {
  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, text, "utf-8");
  const written = readFileSync(OUT_PATH, "utf-8");
  if (written !== text) {
    throw new Error("verification failed: file content differs from fortune");
  }
  return text.length;
}

function main(): void {
  validate(FORTUNE);
  const count = writeFortune(FORTUNE);
  console.log(`fortune cookie ready: ${count} characters in ${OUT_PATH}`);
  console.log(FORTUNE);
}

main();
