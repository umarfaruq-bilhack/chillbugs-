import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — Chill Bugs',
  description: 'Privacy Policy for the Chill Bugs NFT platform.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <nav className="border-b border-[#2a2a2a] px-4 md:px-8 py-5 max-w-4xl mx-auto flex items-center justify-between">
        <a href="/" className="flex items-center gap-2">
          <span className="text-xl">🐛</span>
          <span className="font-display font-bold text-white tracking-tight">CHILL BUGS</span>
        </a>
        <a href="/" className="text-white/40 hover:text-white text-sm transition-colors">← Back to Home</a>
      </nav>

      <main className="max-w-3xl mx-auto px-4 md:px-8 py-12">
        <div className="mb-10">
          <h1 className="font-display font-black text-4xl text-white mb-3">Privacy Policy</h1>
          <p className="text-white/40 text-sm">Last updated: June 2025</p>
        </div>

        <div className="space-y-8 text-white/70 leading-relaxed">

          <section>
            <h2 className="font-display font-black text-xl text-white mb-3">1. Introduction</h2>
            <p>Chill Bugs ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our platform at chillbugs.xyz. By using the Site, you agree to the collection and use of information in accordance with this policy.</p>
          </section>

          <section>
            <h2 className="font-display font-black text-xl text-white mb-3">2. Information We Collect</h2>
            <p className="mb-3">We collect the following information when you use Chill Bugs:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-white">X (Twitter) Account Data</strong> — When you sign in with X, we receive your X user ID, username, and profile picture. We do not access your tweets, direct messages, or followers.</li>
              <li><strong className="text-white">Wallet Address</strong> — When you connect a cryptocurrency wallet, we store your public wallet address. We never have access to your private keys or seed phrase.</li>
              <li><strong className="text-white">Activity Data</strong> — We record your in-platform activities including check-ins, game scores, quiz results, and referrals to calculate Bug Points.</li>
              <li><strong className="text-white">Usage Data</strong> — We may collect basic analytics such as page visits and feature usage to improve the platform.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-black text-xl text-white mb-3">3. How We Use Your Information</h2>
            <p className="mb-3">We use the collected information to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Create and manage your Chill Bugs profile</li>
              <li>Track and award Bug Points for completed activities</li>
              <li>Display your username and rank on the public leaderboard</li>
              <li>Process referral bonuses</li>
              <li>Communicate important platform updates</li>
              <li>Prevent fraud and abuse of the platform</li>
              <li>Deliver whitelist spots to your connected wallet</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-black text-xl text-white mb-3">4. Information We Do NOT Collect</h2>
            <p className="mb-3">We want to be clear about what we never do:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>We never post on your X account or access your DMs</li>
              <li>We never access your wallet's private keys or seed phrase</li>
              <li>We never sell your personal data to third parties</li>
              <li>We never collect payment information</li>
              <li>We never collect your email address</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-black text-xl text-white mb-3">5. Data Storage & Security</h2>
            <p>Your data is stored securely in our database hosted by Supabase, which is protected with industry-standard encryption and Row Level Security (RLS). We implement appropriate technical and organizational measures to protect your information against unauthorized access, alteration, or destruction.</p>
          </section>

          <section>
            <h2 className="font-display font-black text-xl text-white mb-3">6. Public Information</h2>
            <p>Please note that your X username, profile picture, Bug Points total, and wallet address (truncated) are displayed publicly on the Chill Bugs leaderboard. By using the platform, you consent to this public display of your information.</p>
          </section>

          <section>
            <h2 className="font-display font-black text-xl text-white mb-3">7. Third-Party Services</h2>
            <p className="mb-3">We use the following third-party services:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-white">X (Twitter) OAuth</strong> — for authentication. Subject to X's Privacy Policy.</li>
              <li><strong className="text-white">Supabase</strong> — for database storage. Subject to Supabase's Privacy Policy.</li>
              <li><strong className="text-white">WalletConnect / RainbowKit</strong> — for wallet connections. Subject to their respective Privacy Policies.</li>
              <li><strong className="text-white">Vercel</strong> — for website hosting. Subject to Vercel's Privacy Policy.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-black text-xl text-white mb-3">8. Cookies</h2>
            <p>We use essential cookies to maintain your login session. We do not use tracking cookies or advertising cookies. You can disable cookies in your browser settings, but this may prevent you from using certain features of the Site.</p>
          </section>

          <section>
            <h2 className="font-display font-black text-xl text-white mb-3">9. Your Rights</h2>
            <p className="mb-3">You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your account and associated data</li>
              <li>Disconnect your X account or wallet at any time</li>
            </ul>
            <p className="mt-3">To exercise any of these rights, contact us at <a href="mailto:thechillbugs@gmail.com" className="text-[#00ff87] hover:underline">thechillbugs@gmail.com</a></p>
          </section>

          <section>
            <h2 className="font-display font-black text-xl text-white mb-3">10. Children's Privacy</h2>
            <p>The Site is not directed to children under the age of 18. We do not knowingly collect personal information from anyone under 18. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.</p>
          </section>

          <section>
            <h2 className="font-display font-black text-xl text-white mb-3">11. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify users of significant changes by updating the date at the top of this page. Continued use of the Site after changes constitutes acceptance of the new policy.</p>
          </section>

          <section>
            <h2 className="font-display font-black text-xl text-white mb-3">12. Contact Us</h2>
            <p>If you have any questions or concerns about this Privacy Policy or our data practices, please contact us at:<br />
            <a href="mailto:thechillbugs@gmail.com" className="text-[#00ff87] hover:underline">thechillbugs@gmail.com</a>
            </p>
          </section>

        </div>
      </main>

      <footer className="border-t border-[#2a2a2a] max-w-4xl mx-auto px-4 md:px-8 py-6 flex items-center justify-between mt-12">
        <span className="text-white/20 text-xs">© 2025 Chill Bugs. All rights reserved.</span>
        <a href="/terms" className="text-white/40 hover:text-white text-xs transition-colors">Terms of Service →</a>
      </footer>
    </div>
  )
}
