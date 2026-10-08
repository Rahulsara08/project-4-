# Shubh weds Ayushi: wedding invitation

A scroll-animated Jaipur-themed wedding invitation website.

## Run it

```bash
npm start          # builds index.html, serves on http://localhost:3000
npm run dev        # same, but rebuilds on every page load while you edit src/sections
npm run build      # only rebuild index.html
```

No packages to install: plain Node.js, HTML, CSS and JavaScript.

**Personal invitation links:** add `?to=` with the guest's name, e.g. `http://localhost:3000/?to=Rahul%20Sharma`.
The name appears at the top of the gate page.

## Publish

`index.html` is already built and committed, so the folder works on any static host (GitHub Pages,
Netlify, Vercel) or with `npm start` on a Node host. After editing anything in `src/`, run `npm run build`.

## Where things are

| Path | What |
|---|---|
| `js/config.js` | **Wedding details**: default guest text, countdown date, venue name and city |
| `src/index.html` | Page shell (head, fonts, styles, scripts); includes the sections below |
| `src/sections/01-hero.html` | Page 1: Hawa Mahal hero |
| `src/sections/02-gate.html` | Road strip + page 2: gate with guest name, invitation, names, countdown, venue |
| `src/sections/03-events.html` | Page 3: events wall and ceremony cards |
| `src/sections/04-patrika.html` | Cloud band + page 4: Patrika Gate and the couple |
| `src/sections/05-family.html` | Page 5: Meet the Bride & Groom Family |
| `src/sections/06-rsvp.html` | Page 6: RSVP |
| `src/sections/07-end.html` | Page 7: closing page |
| `css/*.css` | One stylesheet per section (`base`, `common`, `hero`, `road`, `gate`, `events`, `patrika`, `family`, `rsvp`, `end`) |
| `js/*.js` | One script per feature (`hero`, `gate`, `road`, `events`, `patrika-couple`, `patrika-sky`, `cloud-band`, `reveal`, `rsvp`, `invitation`) |
| `assets/img/` | All images |
| `scripts/build.js` | Joins `src/index.html` + `src/sections/*` into `index.html` |
| `server.js` | Node server (serves only the public files) |
