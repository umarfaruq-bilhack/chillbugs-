import type { Metadata } from "next";
import { Audiowide, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const audiowide = Audiowide({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Chill Bugs — Enter the Playground',
  description: 'Connect your X account and wallet. Play games, complete daily quests, climb the leaderboard — earn your whitelist spot.',
  keywords: ['Chill Bugs', 'NFT', 'Whitelist', 'Web3', 'NFT Games', 'Bug Catcher', 'WL'],
  authors: [{ name: 'Chill Bugs' }],
  openGraph: {
    title: 'Chill Bugs — Enter the Bug Playground',
    description: 'Connect your X & wallet. Play games. Earn your WL spot. Season 1 now live.',
    url: 'https://chillbugs.xyz',
    siteName: 'Chill Bugs',
    images: [
      {
        url: 'https://chillbugs.xyz/api/og',
        width: 1200,
        height: 630,
        alt: 'Chill Bugs — Enter the Bug Playground',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chill Bugs — Enter the Bug Playground',
    description: 'Connect your X & wallet. Play games. Earn your WL spot.',
    site: '@TheChillBugs',
    creator: '@TheChillBugs',
    images: ['https://chillbugs.xyz/api/og'],
  },
  metadataBase: new URL('https://chillbugs.xyz'),
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${audiowide.variable} ${spaceGrotesk.variable}`}>
      <body className="min-h-screen bg-[#0a0a0a] text-white font-body">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
