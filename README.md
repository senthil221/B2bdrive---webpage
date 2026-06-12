# B2B Drive — Landing Page

Done-for-you B2B lead generation & appointment-setting landing page. Single-page static site (HTML + Tailwind via CDN), styled with a bold, high-contrast, results-forward design.

## Structure

```
.
├── index.html        # The landing page
├── 404.html          # Custom not-found page
├── vercel.json       # Vercel config (clean URLs, security headers, asset caching)
├── robots.txt        # Crawl directives
├── sitemap.xml       # Sitemap (update lastmod when content changes)
└── assets/images/    # Logo, client logos, testimonial avatars
```

## Before you go live

1. **Contact form** — the form posts to Formspree. In `index.html`, replace `YOUR_FORM_ID` in the form `action` with your real Formspree form ID from <https://formspree.io>:
   ```html
   <form action="https://formspree.io/f/abcdwxyz" method="POST">
   ```
   (Free tier handles a contact form fine. Alternatively swap in any form endpoint.)

2. **Domain** — meta tags, canonical, Open Graph, `robots.txt`, and `sitemap.xml` all assume `https://b2bdrive.net/`. Change them if you deploy elsewhere.

3. **Social share image** — `assets/images/og-cover.png` (1200×630) is included for link previews. To regenerate it, recreate a 1200×630 `og.html` and render with headless Edge/Chrome: `msedge --headless --window-size=1200,630 --screenshot=assets/images/og-cover.png file:///…/og.html`.

## Deploy to Vercel

No build step — it's a static site.

- **Dashboard:** import the GitHub repo at <https://vercel.com/new>. Framework preset: **Other**. Build command: none. Output dir: `./`. Deploy.
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

- Tailwind is loaded from the CDN, so there's nothing to compile. For a production build with no CDN runtime (smaller, no console notice), you can later add a Tailwind build step — not required for hosting.
- Stats shown ("8–10 calls/month", "US · EU · APAC") are drawn from real client testimonials and footnoted as representative, not guarantees.
