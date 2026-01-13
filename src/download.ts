import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { tmpPath } from "./config.ts";

// https://notofonts.github.io/
function notoUrl(
	family: string,
	name = `${family}-Regular`,
	mirror: "jsdelivr" | "github" = "jsdelivr",
) {
	// hinted = for low-res displays
	// full = low-res displays + latin
	// unhinted = smallest and what we want since we already have latin support
	// variable = light to bold is a spectrum
	//
	// despite being larger uncompressed, TTFs compress with woff2 slightly
	// better than OTFs
	if (mirror === "jsdelivr")
		return `https://cdn.jsdelivr.net/gh/notofonts/notofonts.github.io/fonts/${family}/unhinted/ttf/${name}.ttf`;

	return `https://github.com/notofonts/notofonts.github.io/raw/refs/heads/main/fonts/${family}/unhinted/ttf/${name}.ttf`;
}

// Base fonts will be subset.
const families = {
	sans: {
		base: notoUrl("NotoSans"),
		// "base-italic": getDownloadUrl("NotoSans", "NotoSans-Italic[wght]"),
		hebrew: notoUrl("NotoSansHebrew"),
		// Once it reaches 99% support, I'd like to use VARC fonts for CJK which
		// will are 90% smaller.
		// https://github.com/harfbuzz/boring-expansion-spec/blob/main/VARC.md
		// jp: `${cjk}Sans/Variable/TTF/Subset/NotoSansJP-VF.ttf`,
		// kr: `${cjk}Sans/Variable/TTF/Subset/NotoSansKR-VF.ttf`,
		// "zh-hans": `${cjk}Sans/Variable/TTF/Subset/NotoSansSC-VF.ttf`,
		// "zh-hant-hk": `${cjk}Sans/Variable/TTF/Subset/NotoSansHK-VF.ttf`,
		// "zh-hant-tw": `${cjk}Sans/Variable/TTF/Subset/NotoSansTC-VF.ttf`,
	},
	// serif: {
	// 	base: notoUrl("NotoSerif"),
	// 	"base-italic": getDownloadUrl("NotoSerif", "NotoSerif-Italic[wght]"),
	// 	hebrew: notoUrl("NotoSerifHebrew"),
	// 	jp: `${cjk}Serif/Variable/TTF/Subset/NotoSerifJP-VF.ttf`,
	// 	kr: `${cjk}Serif/Variable/TTF/Subset/NotoSerifKR-VF.ttf`,
	// 	"zh-hans": `${cjk}Sans/Variable/TTF/Subset/NotoSansSC-VF.ttf`,
	// 	"zh-hant-hk": `${cjk}Sans/Variable/TTF/Subset/NotoSansHK-VF.ttf`,
	// 	"zh-hant-tw": `${cjk}Sans/Variable/TTF/Subset/NotoSansTC-VF.ttf`,
	// },
	// "mono": {
	// 	base: `${base}NotoSansMono/unhinted/variable/NotoSansMono%5Bwdth%2Cwght%5D.ttf`,
	// },
	// cursive: {
	// 	"gloria-hallelujah":
	// 		"https://github.com/google/fonts/raw/main/ofl/gloriahallelujah/GloriaHallelujah.ttf",
	// },
};

async function downloadFont(url: string, path: string) {
	console.log(url, "->", path);
	await mkdir(dirname(path), { recursive: true });
	const resp = await fetch(url);
	if (!resp.ok) throw Error(resp.statusText);
	const body = await resp.bytes();
	await writeFile(path, body);
}

const promises: Promise<void>[] = [];
for (const [familyName, faces] of Object.entries(families)) {
	for (const [fontName, url] of Object.entries(faces)) {
		const path = join(tmpPath, familyName, `${fontName}.ttf`);
		promises.push(downloadFont(url, path));
	}
}
await Promise.all(promises);
console.log("downloaded", promises.length, "fonts to", tmpPath);
