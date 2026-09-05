# Clips and screenshots

## Format: GIF, never MP4 or WebM

This was measured, not assumed (brief §6). All 203 frames and props together
use 42 distinct colours, so a 256-colour GIF palette holds every pixel exactly
and a GIF of Rumi is lossless. An H.264 recording of the same clip came back
with 16,959 colours and 72 % of its Retina pixel-blocks smeared into gradients.
Animated WebP in **lossless** mode is the only accepted alternative if smaller
files are wanted; rename the slot's `data-src` if you use it.

## Record against the backdrop tool, never a real desktop

```sh
swift scripts/backdrop.swift 120        # in the desktop repo; `dark` for navy
```

It covers the wallpaper and every other window while leaving Rumi on top, in
this page's own cream. Two reasons: the clips then sit seamlessly in their
panels, and the owner's filenames, windows and messages never reach a public
site. Crop tight around him with headroom above his head for hearts, the "!"
and the food bubble. 2–6 s, looping cleanly, starting and ending on his
resting pose. Record at the app's 3×.

### Size

Measured panel sizes, 4:3 throughout:

| where | feature panel | menu panel |
|---|---|---|
| desktop, 1100 px and up | 419 × 314 | 460 × 345 |
| tablet, around 960 px | 366 × 275 | 460 × 345 |
| phone, 430 px | 398 × 299 | 398 × 299 |

The page never resamples upward: a clip smaller than its panel sits centred at
its natural size. But `max-width: 100%` will scale a clip *down* to fit, and a
fractional downscale is exactly what this project avoids everywhere else.

So size the export to the **smallest** panel it has to fit: **360 × 270**. That
displays 1:1 at every breakpoint. The menu screenshot can go up to 398 × 299.

## The eleven motion clips

```text
pet-him.gif                sleeps-when-away.gif
pick-him-up.gif            types-with-you.gif
tuck-him-away.gif          watches-you.gif
send-him-somewhere.gif     keeps-time.gif
play-with-him.gif          gets-out-of-the-way.gif
feed-him.gif
```

`feed-him.gif` is used twice, in "Feed him" and in "Hungry at nine".

## The four screenshots

Motion for behaviours, stills for panels (brief §4.2): animating a static
window costs weight and pulls the eye for nothing.

```text
reminds-you.png          the New Reminder window
makes-you-stretch.png    the Breaks window
knows-your-name.png      the Tell him your name window
menu.png                 the right-click menu, everything in one shot
```

These load even under `prefers-reduced-motion`, since they do not move.

**One thing to confirm before recording.** §4.2 names *New Reminder…*,
*Breaks…* and *Tell him your name…* as the three screenshot entries, but §7's
shot list still describes "Reminds you" and "Makes you stretch" as motion
clips (the hop and the bubble; the slide to centre and the stretch). The page
currently follows §4.2 and expects a `.png` for both. If you would rather show
the behaviour, drop a `.gif` in instead and change those two slots in
`index.html` from `data-src="media/….png"` with `data-static="true"` to
`data-src="media/….gif"` without it.

## How the slots work

Each slot is an `<img class="clip-media">` with a `data-src`. The script sets
`src` only when the panel comes into view, so nothing below the fold is
fetched on load. Until a file exists the panel shows a still sprite drawn from
the atlas, and a missing file leaves that still in place rather than showing
broken-image alt text. No HTML or CSS changes are needed to add a file.
