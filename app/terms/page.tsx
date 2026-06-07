import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service — Chill Bugs',
  description: 'Terms of Service for the Chill Bugs NFT platform.',
}

export default function TermsPage() {
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
          <h1 className="font-display font-black text-4xl text-white mb-3">Terms of Service</h1>
          <p className="text-white/40 text-sm">Last updated: June 2025</p>
        </div>

        <div className="space-y-8 text-white/70 leading-relaxed">

          <section>
            <h2 className="font-display font-black text-xl text-white mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using the Chill Bugs platform at chillbugs.xyz ("the Site"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Site. These terms apply to all visitors, users, and others who access or use the Site.</p>
          </section>

          <section>
            <h2 className="font-display font-black text-xl text-white mb-3">2. Description of Service</h2>
            <p>Chill Bugs is a community engagement platform for an NFT project. The Site allows users to connect their X (Twitter) account and cryptocurrency wallet, earn Bug Points through games and activities, and potentially earn whitelist ("WL") spots for the Chill Bugs NFT collection.</p>
          </section>

          <section>
            <h2 className="font-display font-black text-xl text-white mb-3">3. Eligibility</h2>
            <p>You must be at least 18 years of age to use the Site. By using the Site, you represent and warrant that you meet this requirement and that you have the legal capacity to enter into these Terms.</p>
          </section>

          <section>
            <h2 className="font-display font-black text-xl text-white mb-3">4. User Accounts</h2>
            <p>To access certain features of the Site, you must sign in with your X (Twitter) account and connect a cryptocurrency wallet. You are responsible for maintaining the security of your accounts and wallet. Chill Bugs is not responsible for any loss or damage arising from your failure to maintain account security.</p>
          </section>

          <section>
            <h2 className="font-display font-black text-xl text-white mb-3">5. Bug Points & Whitelist Spots</h2>
            <p className="mb-3">Bug Points are virtual points earned through platform activities. They have no monetary value and cannot be transferred, sold, or exchanged for cash. Whitelist spots grant priority access to the Chill Bugs NFT mint and are subject to the following conditions:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>WL spots are earned by reaching 2,000 Bug Points or ranking in the top 50 on the leaderboard</li>
              <li>Chill Bugs reserves the right to modify WL requirements at any time</li>
              <li>A WL spot does not guarantee the ability to successfully mint an NFT</li>
              <li>WL spots are non-transferable and tied to your connected wallet address</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-black text-xl text-white mb-3">6. Prohibited Conduct</h2>
            <p className="mb-3">You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use bots, scripts, or automated tools to earn Bug Points</li>
              <li>Create multiple accounts to abuse the referral system</li>
              <li>Attempt to manipulate, hack, or exploit the platform</li>
              <li>Impersonate other users or team members</li>
              <li>Use the platform for any illegal purpose</li>
            </ul>
            <p className="mt-3">Violation of these rules may result in account suspension and forfeiture of all Bug Points and WL spots.</p>
          </section>

          <section>
            <h2 className="font-display font-black text-xl text-white mb-3">7. NFT Risks</h2>
            <p>NFTs are speculative digital assets. Purchasing or minting NFTs involves significant financial risk. The value of NFTs can decrease to zero. Chill Bugs makes no representations or warranties about the future value of any NFT. You should only participate if you can afford to lose your entire investment.</p>
          </section>

          <section>
            <h2 className="font-display font-black text-xl text-white mb-3">8. Intellectual Property</h2>
            <p>All content on the Site, including but not limited to artwork, logos, text, and code, is the property of Chill Bugs and is protected by copyright and other intellectual property laws. You may not reproduce, distribute, or create derivative works without express written permission.</p>
          </section>

          <section>
            <h2 className="font-display font-black text-xl text-white mb-3">9. Disclaimers</h2>
            <p>The Site is provided "as is" without warranties of any kind. Chill Bugs does not warrant that the Site will be uninterrupted, error-free, or free of viruses. We are not responsible for any losses arising from your use of the Site or participation in the NFT mint.</p>
          </section>

          <section>
            <h2 className="font-display font-black text-xl text-white mb-3">10. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, Chill Bugs shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or goodwill, arising out of your use of the Site.</p>
          </section>

          <section>
            <h2 className="font-display font-black text-xl text-white mb-3">11. Governing Law</h2>
            <p>These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.</p>
          </section>

          <section>
            <h2 className="font-display font-black text-xl text-white mb-3">12. Changes to Terms</h2>
            <p>We reserve the right to modify these Terms at any time. We will notify users of significant changes by updating the date at the top of this page. Continued use of the Site after changes constitutes acceptance of the new Terms.</p>
          </section>

          <section>
            <h2 className="font-display font-black text-xl text-white mb-3">13. Contact</h2>
            <p>For questions about these Terms, please contact us at <a href="mailto:thechillbugs@gmail.com" className="text-[#00ff87] hover:underline">thechillbugs@gmail.com</a></p>
          </section>

        </div>
      </main>

      <footer className="border-t border-[#2a2a2a] max-w-4xl mx-auto px-4 md:px-8 py-6 flex items-center justify-between mt-12">
        <span className="text-white/20 text-xs">© 2025 Chill Bugs. All rights reserved.</span>
        <a href="/privacy" className="text-white/40 hover:text-white text-xs transition-colors">Privacy Policy →</a>
      </footer>
    </div>
  )
}
