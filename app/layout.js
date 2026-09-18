import "./globals.css";

export const metadata = {
  title: "Ira Quint",
  description:
    "Ira Quint — full-stack product engineer in Washington, D.C.",
};

export default function RootLayout({ children }) {
  // No data-theme: light is the base palette on :root, so the first paint is
  // already light. The appearance control sets the attribute on mount if a
  // preference was saved.
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
