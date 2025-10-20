// @/app/privacy/privacy-content.tsx
import { SectionTitle } from "@/components/section-title";

const PolicySection = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-custom-gold mb-3 font-plex-sans-condensed">{title}</h2>
        <div className="space-y-3 text-white/90 text-sm md:text-base leading-relaxed font-plex-sans">
            {children}
        </div>
    </div>
);

export function PrivacyContent() {
  return (
    <div className="bg-[#5D2B79] rounded-[20px] md:rounded-[30px] lg:rounded-[40px] mt-8 mb-8 mx-4 md:mx-16 lg:mx-32 animate-fade-in flex flex-col flex-grow" style={{ animationDuration: '0.5s', animationDelay: '0.2s', animationFillMode: 'both' }}>
      <div className="bg-white/10 rounded-[20px] md:rounded-[30px] lg:rounded-[40px] py-8 px-6 md:py-10 md:px-16 lg:px-24 flex-grow">
        <SectionTitle className="text-3xl md:text-4xl text-center mb-8 md:mb-12 font-poppins px-0 md:px-0">
          Privacy Policy
        </SectionTitle>
        
        <div className="max-w-4xl mx-auto">
            <p className="text-center text-white/70 italic text-sm mb-8">Last Updated: October 7, 2025</p>

            <PolicySection title="1. Introduction">
                <p>Welcome to Choco Smiley. We are committed to protecting your privacy and handling your personal data in an open and transparent manner. This privacy policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.</p>
            </PolicySection>

            <PolicySection title="2. Information We Collect">
                <p>We may collect information about you in a variety of ways. The information we may collect on the Site includes:</p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                    <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, shipping address, email address, and telephone number, that you voluntarily give to us when you register with the Site.</li>
                    <li><strong>Order Information:</strong> Information related to your purchases, such as the products you buy and order details.</li>
                    <li><strong>Derivative Data:</strong> Information our servers automatically collect when you access the Site, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Site.</li>
                </ul>
            </PolicySection>

            <PolicySection title="3. Use of Your Information">
                <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:</p>
                 <ul className="list-disc list-inside space-y-2 pl-4">
                    <li>Create and manage your account.</li>
                    <li>Process your orders and deliver the products you have purchased.</li>
                    <li>Email you regarding your account or order.</li>
                    <li>Monitor and analyze usage and trends to improve your experience with the Site.</li>
                </ul>
            </PolicySection>

            <PolicySection title="4. Disclosure of Your Information">
                <p>We do not share, sell, rent, or trade your personal information with third parties for their commercial purposes. We may share information we have collected about you in certain situations:</p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                    <li><strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others, we may share your information as permitted or required by any applicable law, rule, or regulation.</li>
                </ul>
            </PolicySection>
            
            <PolicySection title="5. Security of Your Information">
                <p>We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.</p>
            </PolicySection>

            <PolicySection title="6. Your Rights">
                <p>You have the right to access, correct, or delete your personal information. You can review and change your information by logging into your account settings. You may also contact us to exercise your rights.</p>
            </PolicySection>
            
            <PolicySection title="7. Contact Us">
                 <p>If you have questions or comments about this Privacy Policy, please contact us at:</p>
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
