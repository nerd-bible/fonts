# fonts

Font build pipeline.

## Goals
- [x] Cover ALL languages in unicode (iOS, macOS, Android, and Windows sadly don't)
- [x] Support variable axes for weight where possible
- [x] Subset megafonts and compress to WOFF2 for fast initial loads
- [ ] Static site frontend viewer similar to
[FontDrop](https://fontdrop.info) or
[Wakamai Fondue](https://wakamaifondue.com) with a unicode page map to see
coverage.

## Adding a font
Confirm redistrubution is allowed and then add to ./src/download.ts.

## Why not in monorepo?
Anything that requires a download step (outside of `npm i` or `cargo install`)
to build should not be in the monorepo because postinstall steps are icky.

