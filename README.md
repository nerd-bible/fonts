# fonts

Noto font build pipeline. Also includes a static site frontend viewer similar
to [FontDrop](https://fontdrop.info) or
[Wakamai Fondue](https://wakamaifondue.com).

## Why?
System fonts on popular platforms (iOS, macOS, Android, and Windows) do not
cover minority languages and do not look consistent. We need minority language
support, and at that point, we might as well bundle other fonts for
consistency.

I really wish these were smaller since they add to the app bundle size!

## Goals
- Cover ALL languages in unicode
- Support variable axes for weight where possible
- Subset megafonts and compress to WOFF2 for fast initial loads
- Confirm SIL license

## Maintenance
Just add your font to src/config.ts.
