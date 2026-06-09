# BotBuildr.ai — Webapp Blueprint

## Tech stack

- Vite + React 19 + TypeScript
- Tailwind CSS 4 (design tokens live in `src/index.css` as CSS variables)
- Google Fonts: Inter + Geist Mono

## Structure

```
site/
├── public/assets/botbuildr-iss-hero.mp4   # scroll-scrub hero video
├── src/
│   ├── index.css                          # full design system + layout from Claude Design export
│   ├── landingMarkup.ts                 # editorial landing HTML (handoff source of truth)
│   ├── hooks/useLandingInteractions.ts  # scroll video, reveals, stat counters
│   └── App.tsx
└── ../design.md                           # brand source of truth
```

## Design rules

- Liquid glass: `.glass` utility — `backdrop-filter`, inset shine, soft shadow
- Hero video: sticky 100vh pin, 350vh scroll distance (200vh mobile), `currentTime` mapped to scroll
- Editorial hero: fade-in handoff from video via `.hero.video-handoff.in`
- Tokens: `--ink` #154359, `--accent` #066377, `--highlight` #4BBDF0, `--gold` #9C7A43

## Commands

```bash
npm run dev      # local preview
npm run build    # production build → dist/
npm run preview  # serve dist/
```

## Deploy

From `site/`: `vercel deploy --prod` (or connect repo in Vercel dashboard).
