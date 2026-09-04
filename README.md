# Rumi landing page

A static, one-page download site for Rumi. It uses no framework, build step, analytics, cookies, or third-party scripts. The supplied sprite atlas drives the live hero; all fonts and art are self-hosted.

## Run it locally

You can open `index.html` directly. For a closer match to production download and media behavior, serve the folder over HTTP:

```sh
python3 -m http.server 4173
```

Then open `http://localhost:4173`. There is no production build command; deploy this directory as-is.

## Page layout

- The 44 px sticky strip is both the menu bar and the site navigation (36 px on small screens).
- The hero fills the first screen (`100svh` less the menu bar) and its block is centred in that space, so the leftover height falls evenly above and below and nothing from the next section shows on load. Copy sits left, and the interactive atlas canvas sits beside it with his feet just above the download button. The block is deliberately compact, so keep it that way: if it grows, the even margins shrink rather than the hero growing past the fold.
- Sections separate by space, not by rules. The display face (Silkscreen) carries page structure at exactly three sizes: the headline, section titles, and group headings plus the download button. Entry and step titles use the body face in bold, which also renders them in real sentence case, since Silkscreen has no lowercase.
- Hearts are born at his ear line rather than at the manifest's anchor. The manifest anchors them near the top of his 50×50 canvas because the app's overlay window extends above the sprite; on the page the sprite is the whole stage, so the manifest value threw them clear of him.
- He renders at 8× above 960 px wide, 6× on tablets, and 4× below 640 px, set by the single `--px` custom property on the stage. Every step is an integer scale, so he stays pixel-crisp.
- The stage hugs his silhouette rather than the sprite. Across every frame the page draws he occupies rows 7–46 and columns 7–41 of the 50×50 canvas, so a full-size box would reserve 80 px of empty height and 120 px of empty width around him at 8×. The canvas and the heart layer sit behind the stage at full sprite geometry, which keeps heart coordinates in sprite space. If you add an animation that reaches further than the current set, widen the stage to match or it will clip. Above 960 px he sits beside the copy; below that he stacks under it, centred, and moves to the bottom-right corner on phones.
- “What he does” is grouped by who starts the behavior, using the twelve recordings from the shot list. The dinner recording appears in both relevant groups.
- “Get him” contains the four installation steps and the honest first-open dialog note.
- “About Rumi” shows his sprite now and places the real photograph beside it when supplied.
- On screens 800 px wide or narrower, both download buttons copy the current page link and read “Send this page to your Mac.”

## Add the twelve clips

Put the WebM and MP4 files in [`media/`](media/README.md) using the exact filenames listed there. Each slot already has both `<source>` elements, lazy loading, in-view play/pause, a still sprite fallback, and reduced-motion behavior. No HTML or CSS changes are needed.

The panels are 4:3 and expect recordings cropped tightly around Rumi at the app’s native 3× scale. Export pixel-crisp WebM/MP4 pairs at matching dimensions. The site never smooths the video, and the live fallback sprites render at exactly 3× inside these panels.

## Add the DMG

Put the notarized universal binary at:

```text
download/Rumi-1.0.dmg
```

All three links already point to `/download/Rumi-1.0.dmg`. The included [`_headers`](_headers) file sets the requested MIME type and attachment filename on hosts that support the Cloudflare Pages/Netlify headers format. Configure equivalent response headers if the eventual host uses another format. Do not re-zip or alter the DMG.

## Add the real photo and domain

- Put the real photo at `assets/rumi-photo.jpg`. It will appear beside the sprite portrait automatically when it loads. Use a square or near-square crop; the frame uses `object-fit: cover`.
- When the domain is chosen, make the `og:image` value in `index.html` absolute and add the site’s canonical URL. It is intentionally relative for now because `<DOMAIN>` is not a real host.

## What remains unavailable

The twelve real app recordings, DMG, real-cat photograph, and final domain were not supplied. The page uses atlas stills for the recordings and a larger atlas portrait in About until those files arrive. Everything else in the brief is implemented, including the exact palette and type scale, square pixel UI, sentence case, live eye-follow, timed fidgets, stroke-to-purr interaction, rising heart props, tab pausing, keyboard focus, responsive 360 px layout, and reduced-motion handling.
