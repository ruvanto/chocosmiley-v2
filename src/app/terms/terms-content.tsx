// @/app/terms/terms-content.tsx
import { SectionTitle } from "@/components/section-title";

const PolicySection = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-custom-gold mb-3 font-plex-sans-condensed">{title}</h2>
        <div className="space-y-3 text-white/90 text-sm md:text-base leading-relaxed font-plex-sans">
            {children}
        </div>
    </div>
);

export function TermsContent() {
  return (
    <div className="bg-[#5D2B79] rounded-[20px] md:rounded-[30px] lg:rounded-[40px] mt-8 mb-8 mx-4 md:mx-16 lg:mx-32 animate-fade-in flex flex-col flex-grow" style={{ animationDuration: '0.5s', animationDelay: '0.2s', animationFillMode: 'both' }}>
      <div className="bg-white/10 rounded-[20px] md:rounded-[30px] lg:rounded-[40px] py-8 px-6 md:py-10 md:px-16 lg:px-24 flex-grow">
        <SectionTitle className="text-3xl md:text-4xl text-center mb-8 lg:mb-12 font-poppins px-0 md:px-0">
          Terms & Conditions
        </SectionTitle>
        
        <div className="max-w-4xl mx-auto">
            <p className="text-center text-white/70 italic text-sm mb-8">Last Updated: October 7, 2025</p>

            <PolicySection title="1. Agreement to Terms">
                <p>By accessing and using the Choco Smiley website (the "Site"), you accept and agree to be bound by the terms and provision of this agreement. In addition, when using this Site's particular services, you shall be subject to any posted guidelines or rules applicable to such services. Any participation in this service will constitute acceptance of this agreement.</p>
            </PolicySection>

            <PolicySection title="2. User Accounts">
                <p>To access some features of the Site, you may have to create an account. You are responsible for safeguarding your account, so use a strong password and limit its use to this account. We cannot and will not be liable for any loss or damage arising from your failure to comply with the above.</p>
            </PolicySection>

            <PolicySection title="3. Orders and Payment">
                <p>We reserve the right to refuse or cancel any order for any reason, including limitations on quantities available for purchase, inaccuracies, or errors in product or pricing information. An order request is not a confirmed order until we have dispatched the goods. For all orders, a 50% advance payment is required to begin processing. The remaining balance is due upon delivery.</p>
            </PolicySection>

            <PolicySection title="4. Products and Pricing">
                <p>All descriptions of products or product pricing are subject to change at any time without notice, at our sole discretion. We have made every effort to display as accurately as possible the colors and images of our products. We cannot guarantee that your computer monitor's display of any color will be accurate.</p>
            </PolicySection>

            <PolicySection title="5. Intellectual Property">
                <p>The Site and its original content, features, and functionality are owned by Choco Smiley and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws. You agree not to copy, modify, or create derivative works from any part of the Site without our express written permission.</p>
            </PolicySection>

            <PolicySection title="6. Limitation of Liability">
                 <p>In no event shall Choco Smiley, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.</p>
            </PolicySection>
            
            <PolicySection title="7. Governing Law">
                <p>These Terms shall be governed and construed in accordance with the laws of Karnataka, India, without regard to its conflict of law provisions. Any dispute arising from these Terms will be subject to the exclusive jurisdiction of the courts in Bangalore, Karnataka.</p>
            </PolicySection>

            <PolicySection title="8. Contact Us">
                 <p>If you have any questions about these Terms, please contact us:</p>
                <div className="mt-2 bg-black/20 p-4 rounded-lg text-white/80">
                    <p>Choco Smiley</p>
                    <p>Bangalore, Karnataka, India</p>
                    <a href="mailto:chocosmiley79@gmail.com" className="text-custom-gold hover:underline">chocosmiley79@gmail.com</a>
                </div>
            </PolicySection>
        </div>
      </div>
    </div>
  );
}
