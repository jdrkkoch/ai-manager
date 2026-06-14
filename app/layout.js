import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Panel osobisty",
  description: "Minimalistyczny, responsywny panel osobisty wyświetlający pogodę, kalendarz, wiadomości ze świata i asystenta AI.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pl" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body>
        {children}
      </body>
    </html>
  );
}
