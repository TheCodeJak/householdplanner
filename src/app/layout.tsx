import "@fontsource-variable/inter";
import "jaklib/styles.css";
import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Householdplanner",
  description: "Eine App zum Verwalten von Haulhaltsaufgaben",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className="flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
