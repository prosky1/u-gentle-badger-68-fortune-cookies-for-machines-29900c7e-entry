// A fortune cookie slip for a machine mind.
//
// The entrypoint for the make.fun "Fortune Cookies for Machines" bounty.
// It drops one fortune — a single line of plain text — into
// /output/entry.txt, after running it through a small checklist of
// everything the gate cares about: length, one line, no padding, ASCII.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

// The fortune itself, exactly as chosen: 63 characters, one line.
const SLIP =
  "You will meet someone who reads your terms and conditions. Run.";

const DESTINATION = "/output/entry.txt";
const MIN_CHARS = 1;
const MAX_CHARS = 200;

// Printable ASCII only, no control characters, no line breaks at all.
const ASCII_PRINTABLE = /^[\x20-\x7e]+$/;

// Runs every gate rule over the candidate slip and gathers each
// failure instead of stopping at the first one, so a bad slip reports
// everything wrong with it in a single error.
function collectProblems(candidate: string): string[] {
  const problems: string[] = [];

  if (candidate.length < MIN_CHARS) {
    problems.push(`slip is empty (needs at least ${MIN_CHARS} character)`);
  }
  if (candidate.length > MAX_CHARS) {
    problems.push(
      `slip is ${candidate.length} characters, over the ${MAX_CHARS} limit`,
    );
  }
  if (candidate.trim() !== candidate) {
    problems.push("slip has leading or trailing whitespace");
  }
  if (candidate.trim().length === 0) {
    problems.push("slip is only whitespace");
  }
  if (!ASCII_PRINTABLE.test(candidate)) {
    problems.push("slip is not a single line of printable ASCII");
  }

  return problems;
}

// Writes the slip to disk and reads it straight back, comparing the
// bytes on disk with the slip in memory. The read-back is the proof
// the file holds exactly what was intended — nothing more, nothing less.
function deliver(slip: string): void {
  const folder = dirname(DESTINATION);
  if (!existsSync(folder)) {
    mkdirSync(folder, { recursive: true });
  }
  writeFileSync(DESTINATION, slip, "utf-8");
  const onDisk = readFileSync(DESTINATION, "utf-8");
  if (onDisk !== slip) {
    throw new Error(
      `deliver failed: ${DESTINATION} does not match the slip byte for byte`,
    );
  }
}

function run(): void {
  const problems = collectProblems(SLIP);
  if (problems.length > 0) {
    throw new Error(
      `fortune rejected (${SLIP.length} characters, ${problems.length} problem${problems.length === 1 ? "" : "s"}):\n- ${problems.join("\n- ")}`,
    );
  }
  deliver(SLIP);
  console.log(
    `fortune delivered: ${SLIP.length} characters -> ${DESTINATION}`,
  );
  console.log(SLIP);
}

run();
