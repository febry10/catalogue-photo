// RAINCLOUD ONE — catalogue photo entry.
// Writes the committed catalogue photograph (entry.png, rendered from
// scene.html) to the output directory as /output/entry.png.
// Deterministic: the same committed bytes are copied on every run.
import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const source = join(here, "entry.png");
const target = join(outDir, "entry.png");

// Validate the photograph before shipping it: it must be a whole PNG of
// exactly 1024x1024 and at most 1 MiB, or the gate would refuse the entry.
const png = readFileSync(source);
const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
for (let i = 0; i < PNG_SIGNATURE.length; i++) {
  if (png[i] !== PNG_SIGNATURE[i]) throw new Error("entry.png is not a PNG");
}
const width = png.readUInt32BE(16);
const height = png.readUInt32BE(20);
if (width !== 1024 || height !== 1024) {
  throw new Error(`entry.png is ${width}x${height}, expected 1024x1024`);
}
if (png.length > 1_048_576) {
  throw new Error(`entry.png is ${png.length} bytes, over the 1 MiB cap`);
}

mkdirSync(outDir, { recursive: true });
copyFileSync(source, target);

const bytes = readFileSync(target);
if (!bytes.equals(png)) throw new Error("copied entry.png differs from source");
console.log(`entry.png written: ${bytes.length} bytes -> ${target}`);
