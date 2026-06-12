# B2B Drive — Landing Page

Done-for-you B2B lead generation & appointment-setting landing page. Static site (HTML + a compiled Tailwind CSS build), styled with a bold, high-contrast, results-forward design.

## Structure

```
.
├── index.html          # The landing page
├── 404.html            # Custom not-found page (standalone CSS)
├── src/input.css       # Tailwind entry + custom CSS (edit this, then build)
├── tailwind.config.js  # Tailwind theme (colors, fonts, shadows)
├── package.json        # Build scripts + dev deps
├── vercel.json         # Vercel config (clean URLs, security headers, caching)
├── robots.txt          # Crawl directives
├── sitemap.xml         # Sitemap (update lastmod when content changes)
└── assets/
    ├── css/styles.css  # Compiled, minified CSS (generated — committed)
    └── images/         # Logo, client logos, testimonial avatars, OG cover
```

## Build the CSS

The page links one compiled stylesheet (`assets/css/styles.css`). Rebuild it whenever you change classes in `index.html` or edit `src/input.css`:

```bash
npm install        # once
npm run build      # one-off minified build
npm run watch      # rebuild on every change while developing
```

The compiled CSS is committed, so deploys don't require a build step.

## Before you go live

1. **Contact form** — the form posts to Formspree. In `index.html`, replace `YOUR_FORM_ID` in the form `action` with your real Formspree form ID from <https://formspree.io>:
   ```html
   <form action="https://formspree.io/f/abcdwxyz" method="POST">
   ```
   (Free tier handles a contact form fine. Alternatively swap in any form endpoint.)

2. **Domain** — meta tags, canonical, Open Graph, `robots.txt`, and `sitemap.xml` all assume `https://b2bdrive.net/`. Change them if you deploy elsewhere.

3. **Social share image** — `assets/images/og-cover.png` (1200×630) is included for link previews. To regenerate it, recreate a 1200×630 `og.html` and render with headless Edge/Chrome: `msedge --headless --window-size=1200,630 --screenshot=assets/images/og-cover.png file:///…/og.html`.

## Deploy to Vercel

`vercel.json` already sets `buildCommand` (`npm run build`) and `outputDirectory` (`.` — the repo root, where `index.html` lives), so the import just works.

- **Dashboard:** import the GitHub repo at <https://vercel.com/new>. Framework preset: **Other** → Deploy. (Build command and output directory come from `vercel.json`; don't override them with `public`.)
- **CLI:**
  ```bash
  npm i -g vercel
  vercel        # preview
  vercel --prod # production
  ```

Then add your custom domain (`b2bdrive.net`) in Vercel → Project → Settings → Domains.

## Local preview

Any static server works, e.g.:

```bash
npx serve .
# or
python -m http.server 8000
```

## Notes

- Tailwind is compiled ahead of time via the CLI (~34 KB minified) — no CDN runtime, no console notice, fast first paint. Run `npm run build` after editing classes.
- Stats shown ("8–10 calls/month", "US · EU · APAC") are drawn from real client testimonials and footnoted as representative, not guarantees.
