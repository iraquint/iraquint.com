# iraquint.com

My personal site — a single-page introduction with links to my resume and profiles.

**Live at [iraquint.com](https://iraquint.com)**

## Stack

- [Next.js](https://nextjs.org) 15 (App Router)
- React 19
- CSS Modules
- [Geist](https://vercel.com/font) via `next/font`
- Deployed on [Vercel](https://vercel.com)

## Running locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Layout

```
app/
  (home)/                the homepage, with its own root layout
    layout.js            metadata, html/body
    page.js              renders the Bio component
    globals.css          the monospace sheet styles
  (train)/train/         /train, a separate root layout so the two
    layout.js            designs never share styles
    page.js              the training page
    train.css
    ThemeToggle.jsx      light/dark switch
    SprintStrip.jsx      looping sprint clip under the headline
components/Bio/          the homepage: ink redaction, rainbow mode, music
public/assets/           resume PDFs, photos, and the sprint clip
next.config.mjs          /resume redirect to the current PDF
```

The route groups (`(home)`, `(train)`) don't change URLs; they only let each
page have its own root layout. Navigating between them is a full page load.

`/resume` redirects to the latest resume PDF, so the link stays stable as the
file is updated.
