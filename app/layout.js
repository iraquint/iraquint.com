import "./globals.css";

export const metadata = {
  title: "Ira Quint",
  description:
    "Ira Quint — full-stack product engineer in Washington, D.C.",
};

export default function RootLayout({ children }) {
  // data-theme is set here so the first paint is already dark, no white flash.
  // The appearance control overwrites it on mount if a preference was saved.
  return (
    <html lang="en" data-theme="dark">
      <body>{children}</body>
    </html>
  );
}
