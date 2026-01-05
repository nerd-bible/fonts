// Generate CSS @font-face blocks
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
// TODO: replace with klippa to eliminate a dependency
import { parse } from "opentype.js";
import { cssName, outDir, tmpPath } from "./config.ts";
import walk from "./walk.ts";

type CSSFace = {
	name: string;
	postscript: string;
	weight: string;
	unicodeRange: string;
	path: string;
};

async function getFace(path: string): Promise<CSSFace> {
	const bytes = await readFile(path);
	const parsed = parse(bytes.buffer);
	// weights
	let weightMin: number | undefined;
	let weightMax: number | undefined;
	const weightClasses: Record<string, number> = (parsed as any).usWeightClasses;
	for (const wname in weightClasses) {
		const n = weightClasses[wname];
		if (!weightMin || n < weightMin) weightMin = n;
		if (!weightMax || n > weightMax) weightMax = n;
	}
	// range gathering
	let unicodeRange = "";
	const codepoints: number[] = [];
	for (let i = 0; i < parsed.glyphs.length; i++) {
		const g = parsed.glyphs.get(i);
		for (const cp of g.unicodes) codepoints.push(cp);
	}
	codepoints.sort((a, b) => a - b);
	// range finding
	const fmtN = (n: number) => n.toString(16).padStart(4, "0").toUpperCase();
	let start = codepoints[0];
	const isPrintable = /[^\p{C}]$/u;
	const delimeter = ", ";
	for (let i = 1; i < codepoints.length; i++) {
		const end = codepoints[i - 1];
		if (
			end + 1 !== codepoints[i] &&
			isPrintable.test(String.fromCodePoint(end))
		) {
			unicodeRange +=
				end === start ? `U${fmtN(start)}` : `U+${fmtN(start)}-${fmtN(end)}`;
			unicodeRange += delimeter;
			start = codepoints[i];
		}
	}

	return {
		name: parsed.names.fontFamily["en"],
		postscript: parsed.names.postScriptName["en"],
		weight: `${weightMin} ${weightMax}`,
		unicodeRange: unicodeRange.substring(
			0,
			unicodeRange.length - delimeter.length,
		),
		path: path.replace(tmpPath, ".").replace(/\.ttf$/, ".woff2"),
	};
}

const promises: Promise<CSSFace>[] = [];
for await (const f of walk(tmpPath)) {
	promises.push(getFace(f));
}
const fontFaces = await Promise.all(promises);
const cssOutPath = join(outDir, cssName);
const faceCss = (face: CSSFace) => `@font-face {
	font-family: '${face.name}';
	font-weight: ${face.weight};
	font-display: swap;
	src: url('${face.path}') format('woff2');
	unicode-range: ${face.unicodeRange};
}`;
await writeFile(cssOutPath, fontFaces.map(faceCss).join("\n\n"));
console.log("wrote", fontFaces.length, "faces to", cssOutPath);
