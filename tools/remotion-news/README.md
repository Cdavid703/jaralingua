# Greenford studio introduction

Remotion 4.0.536 composition for the first fictional classroom news scene. Uses the approved studio image derived from David’s portrait and ElevenLabs **Chris** (`iP95p4xoKVk53GoZ742B`, catalogue voice). No cloned voice is used.

The 14-second, 1920×1080, 30 fps H.264/AAC MP4 includes the full first-scene script, a 0.7-second lead-in, a slow 4.5% camera push-in and a permanent fictional-classroom label. This is an animated still with narration, not generated body movement or lip sync. The voice is a demonstration model; students still perform their exam live without reading.

## Run

With Node 24 and npm available:

```sh
npm ci
npm run dev
npm run lint
npm run render
```

`prepare.mjs` copies the image and MP3 from their canonical repository locations into ignored `public/`. The output is `../../assets/video/english-intermediate-2/final-oral-news/01-studio.mp4`. The render command can receive `-- --browser-executable='/path/to/Chrome' --concurrency=2`.

On this Mac, npm is installed under `/Users/davidaramillo/Projects/.remotion-runtime/bin`; add that directory to PATH. Remotion skills are installed under the user’s Codex skills directory. Dependencies and copied media are excluded from Git.

Audio script, voice settings, checksum and matching Scribe transcript are in `../../ingles/intermediate-2/audio/unit-6-final-oral-news/`. Do not regenerate approved audio unnecessarily. If replacing the narration, measure its duration and update the composition to retain the full audio plus the lead-in and ending pause.

The clip can be selected in the exam page’s **Teacher setup → Load the three clips → Studio introduction**. Its narration matches scene 1 only; do not replay its opening dialogue during the closing scene. Other clips and the page’s automatic playback behaviour are unchanged.
