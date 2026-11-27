import { Barlow_Condensed } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./train.css";

// /train has its own root layout so the homepage's monospace sheet styles
// never reach it, and vice versa. Moving between the two is a full page load.
const barlow = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-barlow",
  display: "swap",
});

// Applies a saved dark choice before first paint, so a dark visitor never
// sees a light flash. Shares its key with the homepage's appearance control.
const themeScript = `try{if(localStorage.getItem("ideations.theme")==="dark")document.documentElement.classList.add("dark")}catch(e){}`;

export default function TrainLayout({ children }) {
  return (
    <html lang="en" className={barlow.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        {children}
        {/* Page views, so it's clear whether shared links bring visits. */}
        <Analytics />
      </body>
    </html>
  );
}
