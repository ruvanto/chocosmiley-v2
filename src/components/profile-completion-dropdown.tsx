// @/components/profile-completion-dropdown.tsx
'use client';

import { X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileCompletionDropdownProps {
    onClose: () => void;
    onClick: () => void;
}

export function ProfileCompletionDropdown({ onClose, onClick }: ProfileCompletionDropdownProps) {
    return (
        <div 
            onClick={onClick} 
            className="bg-custom-purple-dark text-custom-gold p-3 flex items-center relative cursor-pointer rounded-xl border border-custom-gold"
        >
            <AlertCircle className="h-5 w-5 text-custom-gold flex-shrink-0" />
            <p className="text-sm font-bold leading-tight ml-3 mr-6">
                Complete Your Profile
            </p>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                }}
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 right-1.5 text-custom-gold/70 hover:text-custom-gold p-1 rounded-full",
                  "focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                )}
                aria-label="Close"
            >
                <X size={16} />
            </button>
        </div>
    );
}
