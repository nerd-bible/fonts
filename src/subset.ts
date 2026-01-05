import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import { subsetBytes } from "@nerd-bible/klippa";
import { tmpPath } from "./config.ts";
import walk from "./walk.ts";

// Bundles are loosely based off Google font's:
// https://fonts.googleapis.com/css2?family=Noto+Sans
// Helpful block views:
// https://unicodeplus.com/block
// https://en.wikipedia.org/wiki/Unicode_block
const subsets = {
	latin: [
		// This should be enough for initial page load before translation.
		// Aside: Ideally we would break up our HTML by supported language and
		// pre-translate, but dynamically serving HTML is a lot to ask of static
		// hosts.
		[0x0000, 0x007f], // Basic Latin (enough for initial load)
		[0xfff0, 0xffff], // Specials Block
	],
	"latin-ext": [
		[0x0080, 0x00ff], // Latin-1 Supplement
		[0x0100, 0x017f], // Latin Extended-A
		[0x0180, 0x024f], // Latin Extended-B
		[0x1e00, 0x1eff], // Latin Extended Additional
		[0x2100, 0x214f], // Letterlike Symbols
		[0x2c60, 0x2c7f], // Latin Extended-C
		[0xa720, 0xa7ff], // Latin Extended-D
		[0xab30, 0xab6f], // Latin Extended-E
		[0xfb00, 0xfb00], // Alphabetic Presentation Forms (latin)
		[0xff01, 0xff5e], // Halfwidth and Fullwidth Forms (ascii)
		[0x10780, 0x107bf], // Latin Extended-F
		[0x1df00, 0x1dfff], // Latin Extended-G
	],
	phonetic: [
		[0x1d00, 0x1d7f], // Phonetic Extensions
		[0x0250, 0x02af], // IPA extensions
	],
	symbols: [
		[0x2190, 0x21ff], // Arrows
		[0x25a0, 0x25ff], // Geometric Shapes
		[0x20a0, 0x20cf], // Currency Symbols
		[0x2150, 0x218f], // Number Forms
		[0x2070, 0x209f], // Superscripts and Subscripts
	],
	spacing: [
		[0x02b0, 0x02ff], // Spacing Modifier Letters
		[0x0300, 0x036f], // Combining Diacritical Marks
		[0x2000, 0x206f], // General punctuation
		[0xfe20, 0xfe2f], // Combining Half Marks
		[0xffe0, 0xffee], // Halfwidth and Fullwidth Forms (common)
	],
	cyrillic: [
		[0x0400, 0x04ff], // Cyrillic
	],
	"cyrillic-ext": [
		[0x0500, 0x052f], // Cyrillic Supplement
		[0x1c80, 0x1c8f], // Cyrillic Extended-C
		[0x2de0, 0x2dff], // Cyrillic Extended-A
		[0xa640, 0xa69f], // Cyrillic Extended-B
		[0x1e030, 0x1e08f], // Cyrillic Extended-D
	],
	// devanagari: [
	// 	[0x0900, 0x097f], // Devanagari
	// 	[0x1cd0, 0x1cff], // Vedic Extensions
	// 	[0xa830, 0xa83f], // Common Indic Number Forms
	// 	[0xa8e0, 0xa8ff], // Devanagari Extended Block
	// ],
	greek: [
		[0x0370, 0x03ff], // Greek and Coptic
	],
	"greek-ext": [
		[0x1f00, 0x1fff], // Greek extended
	],
	// vietnamese: [
	// Latin Extended-A
	// Combining Diacritical
	// Latin Extended Additional
	// ],
};

function fmtUnicodes(v: (typeof subsets)[keyof typeof subsets]) {
	return v.map(([a, b]) => `U+${a.toString(16)}-${b.toString(16)}`).join(",");
}

let n = 0;

async function writeSubsets(fname: string) {
	const ttfBytes = await readFile(fname);
	for (const [k, v] of Object.entries(subsets)) {
		const unicodes = fmtUnicodes(v);
		const subset = subsetBytes(ttfBytes, { unicodes });
		const outPath = fname.replace("base", join("base", k));
		console.log(fname, "->", outPath);
		await mkdir(dirname(outPath), { recursive: true });
		await writeFile(outPath, subset);
		n++;
	}
	await unlink(fname);
}

const promises: Promise<void>[] = [];

for await (const f of walk(tmpPath)) {
	if (!basename(f).startsWith("base")) continue;
	promises.push(writeSubsets(f));
}
await Promise.all(promises);
console.log("subset", promises.length, "fonts to", n, "fonts");
