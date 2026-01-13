# fonts

Font build pipeline.

## Goals
- [x] Cover ALL languages in unicode (iOS, macOS, Android, and Windows sadly don't)
- [x] Consistent look and feel
- [x] Subset megafonts and compress to WOFF2 for fast initial loads
- [ ] Static site frontend viewer similar to
[FontDrop](https://fontdrop.info) or
[Wakamai Fondue](https://wakamaifondue.com) with a unicode page map to see
coverage and demo fonts.

## Coverage
### Font family
Noto supports the largest amount of unicode with a consistent look and feel.

I tried serif designs for the main body text. While they look fancy and feel
formal, they're slower to read. They're also not available for a large number
of minority languages. Oh, and they double the app size.

For that reason we'll use sans-serif fonts.

### Variable axes
Variable font weights are about double the size of regular fonts. Additionally,
they may change _any_ part of the layout of fonts. I don't want user highlights
to change the text layout because that's not what happens in real life!

For that reason we'll rely on the browser's font synthesis which does not
affect layout.

## Adding a font
Confirm redistrubution is allowed and then add to ./src/download.ts.

## Why not in monorepo?
Anything that requires a download step (outside of `npm i` or `cargo install`)
to build should not be in the monorepo because postinstall steps are icky.
