
// @/components/ui/auth-layout.tsx
import Image from "next/image"

export function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="bg-custom-purple-dark text-white text-center relative">
            <div className="pt-4 pb-0 md:pt-8 md:pb-4">
                <Image 
                    src="/Choco Smiley Logo.png" 
                    alt="Choco Smiley Logo" 
                    width={180} 
                    height={70}
                    className="mx-auto w-32 md:w-40 h-auto"
                    onDragStart={(e) => e.preventDefault()}
                />
            </div>
            {children}
        </div>
    )
}
