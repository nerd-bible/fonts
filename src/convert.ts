import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
// NOT THREAD SAFE!! :(
import wawoff from "wawoff2";
import { outDir, tmpPath } from "./config.ts";
import walk from "./walk.ts";

async function convert(f: string) {
	const outPath = f.replace(tmpPath, join(outDir, "fonts")).replace(/\.[to]tf$/, ".woff2");
	const v = await readFile(f);
	const woff2 = await wawoff.compress(new Uint8Array(v));
	console.log(
		f,
		"->",
		outPath,
		`${((woff2.length / v.length) * 100).toPrecision(2)}%`,
	);
	await mkdir(dirname(outPath), { recursive: true });
	await writeFile(outPath, new Uint8Array(woff2));
	await unlink(f);
}

// TODO: spawn processes or fix wawoff2
let n = 0;
for await (const f of walk(tmpPath)) {
	await convert(f);
	n++;
}
console.log("converted", n, "fonts");
