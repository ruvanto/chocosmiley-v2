
// @/components/header/navigation.tsx
'use client';

import Link from "next/link";
import { cn } from "@/lib/utils";
import { useRouter, usePathname } from 'next/navigation';
import type { ActiveView } from '@/types';
import { useAppContext } from "@/context/app-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

interface NavigationProps {
  onNavigate: (view: 'about' | 'faq' | 'admin' | 'admin-analytics') => void;
  activeView: ActiveView;
}

const navLinks = [
    { id: "about", label: "About", href: "/about" },
    { id: "faq", label: "FAQ", href: "/faq" },
] as const;


export function Navigation({ activeView }: NavigationProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { isAdmin, setIsGlobalLoading } = useAppContext();

    const handleLinkClick = (href: string) => {
        if (pathname === href) return;
        setIsGlobalLoading(true);
    };
    
    const handleAdminClick = (path: string) => {
        if (pathname === path) return;
        setIsGlobalLoading(true);
        router.push(path);
    }

    return (
        <nav className={cn(
            "hidden md:flex justify-center items-center gap-4 lg:gap-8 text-base lg:text-lg animate-slide-down"
        )} style={{ animationDuration: '0.3s' }}>
            {navLinks.map((link) => {
                const isActive = activeView === link.id;
                return (
                    <Link
                        key={link.id}
                        href={link.href}
                        onClick={() => handleLinkClick(link.href)}
                        className={cn(
                            "transition-colors hover:text-custom-gold", 
                            isActive ? "text-custom-gold font-base" : "text-foreground/80"
                        )}
                    >
                        {link.label}
                    </Link>
                )
            })}
             {isAdmin && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            className={cn(
                                "flex items-center gap-1 transition-colors hover:text-custom-gold",
                                (activeView === 'admin' || activeView === 'admin-analytics') ? "text-custom-gold font-base" : "text-foreground/80"
                            )}
                        >
                            Admin <ChevronDown className="h-4 w-4" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-custom-purple-dark text-white border-custom-gold">
                        <DropdownMenuItem onClick={() => handleAdminClick('/admin')} className="cursor-pointer hover:!bg-white/20 hover:!text-white">
                            Manage Orders
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAdminClick('/admin/analytics')} className="cursor-pointer hover:!bg-white/20 hover:!text-white">
                            Analytics
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </nav>
    );
}
