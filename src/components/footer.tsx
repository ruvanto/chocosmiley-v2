
// @/components/footer.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Mail } from 'lucide-react';
import { AiOutlineInstagram } from 'react-icons/ai';
import { SiWhatsapp } from "react-icons/si";
import { IoLogoFacebook } from "react-icons/io";
import { Separator } from './ui/separator';
import { useAppContext } from '@/context/app-context';

const FooterSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="flex flex-col gap-3">
        <h3 className="font-poppins font-medium text-white text-sm md:text-base lg:text-lg">{title}</h3>
        {children}
    </div>
);

export function Footer() {
    const { setIsGlobalLoading } = useAppContext();
    const pathname = usePathname();

    const handleLinkClick = (href: string) => {
        if (pathname === href) return;
        setIsGlobalLoading(true);
    };
    
    return (
        <footer className="bg-[#161616] text-white font-poppins py-4 px-8 md:rounded-t-[20px] lg:rounded-t-[30px] mx-0 lg:mx-8 xl:mx-12 md:pt-10 border-t border-white/20 md:border-t-0">
            <div className="container mx-auto flex flex-col lg:flex-row justify-between items-start gap-6 lg:gap-8 pb-6 lg:px-6">
                {/* Logo and Driven By */}
                <div className="flex flex-col items-start">
                    <Image
                        src="/Choco Smiley Logo.png"
                        alt="Choco Smiley Logo"
                        width={200}
                        height={80}
                        className="w-36 md:w-48 h-auto"
                        onDragStart={(e) => e.preventDefault()}
                    />
                    <div className="flex flex-col items-start ml-2 gap-1">
                        <p className="text-xs font-poppins text-white/80">Driven By</p>
                        <a href='https://ruvanto.com'>
                        <Image
                            src="/ruvanto_logo.png"
                            alt="Ruvanto Logo"
                            width={100}
                            height={40}
                            className="w-20 md:w-24 h-auto"
                            onDragStart={(e) => e.preventDefault()}
                        /></a>
                    </div>
                </div>

                {/* Contact */}
                <FooterSection title="Contact">
                    <a href="mailto:chocosmiley79@gmail.com" className="flex items-center gap-2 text-xs md:text-sm text-gray-300 hover:text-custom-gold transition-colors">
                        <Mail size={16} />
                        <span>chocosmiley79@gmail.com</span>
                    </a>
                    <a href="https://wa.me/917411414007" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs md:text-sm text-gray-300 hover:text-custom-gold transition-colors">
                        <SiWhatsapp size={16} />
                        <span>+91 74114 14007</span>
                    </a>
                </FooterSection>

                {/* Company */}
                <FooterSection title="Company">
                    <div className="flex flex-col gap-2">
                        <Link href="/about" onClick={() => handleLinkClick('/about')} className="flex items-center gap-2 text-xs md:text-sm text-gray-300 hover:text-custom-gold transition-colors">About Us</Link>
                        <Link href="/faq" onClick={() => handleLinkClick('/faq')} className="flex items-center gap-2 text-xs md:text-sm text-gray-300 hover:text-custom-gold transition-colors">FAQ</Link>
                        <Link href="/" onClick={() => handleLinkClick('/')} className="flex items-center gap-2 text-xs md:text-sm text-gray-300 hover:text-custom-gold transition-colors">Explore</Link>
                    </div>
                </FooterSection>

                {/* Policies */}
                <FooterSection title="Policies">
                    <div className="flex flex-col gap-2">
                        <Link href="/privacy" onClick={() => handleLinkClick('/privacy')} className="flex items-center gap-2 text-xs md:text-sm text-gray-300 hover:text-custom-gold transition-colors">Privacy Policy</Link>
                        <Link href="/terms" onClick={() => handleLinkClick('/terms')} className="flex items-center gap-2 text-xs md:text-sm text-gray-300 hover:text-custom-gold transition-colors">Terms & Conditions</Link>
                    </div>
                </FooterSection>

                {/* Follow Us */}
                <FooterSection title="Follow Us">
                    <div className="flex items-center gap-2">
                        <a href="https://www.instagram.com/chocosmileygifts/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                            <AiOutlineInstagram className="h-7 w-7 transition-colors hover:text-custom-gold" />
                        </a>
                        <a href="https://www.facebook.com/chocosmileychocolates" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                            <IoLogoFacebook className="h-7 w-7 transition-colors hover:text-custom-gold" />
                        </a>
                    </div>
                </FooterSection>
            </div>

            <Separator className="my-4 bg-white/50" />

            <div className="text-center text-white/80 text-xs md:text-sm">
                <p>© 2025 Choco Smiley. All rights reserved.</p>
            </div>
        </footer>
    );
}
