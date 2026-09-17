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
  layout.js              root layout, fonts, metadata
  page.js                renders the Home component
  globals.css
components/Home/
  Home.jsx               the entire page
  Home.module.css
public/assets/           resume PDF and profile photo
next.config.mjs          /resume redirect to the current PDF
```

`/resume` redirects to the latest resume PDF, so the link stays stable as the
file is updated.
