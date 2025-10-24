
// @/components/forgot-password-popup.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AuthLayout } from "../ui/auth-layout";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useToast } from "@/hooks/use-toast";
import { sendPasswordReset } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import { Loader } from '../loaders/loader';

interface ForgotPasswordPopupProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onLoginClick: () => void;
    isAuthenticated?: boolean;
}

export function ForgotPasswordPopup({ open, onOpenChange, onLoginClick, isAuthenticated = false }: ForgotPasswordPopupProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!open) {
      setEmail('');
    }
  }, [open]);

  const handleSendResetLink = async () => {
    if (!email) {
      toast({ title: "Error", description: "Please enter your email address.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      await sendPasswordReset(email);
      toast({ title: "Password reset link sent!", variant: "success" });
      onOpenChange(false);
    } catch (error: any) {
        let message = "An error occurred. Please try again.";
        if (error.code === 'auth/invalid-email') {
            message = "Please enter a valid email address.";
        } else if (error.code === 'auth/user-not-found') {
            message = "No account found with this email address.";
        }
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isLoading && onOpenChange(isOpen)}>
      <DialogContent className={cn("p-0 w-[90vw] md:w-full max-w-sm md:max-w-md rounded-2xl md:rounded-[40px]")}>
        <DialogHeader>
          <DialogTitle className="sr-only">Forgot Password</DialogTitle>
        </DialogHeader>
        <AuthLayout>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-4 h-64">
              <Loader />
              <p className="text-white font-semibold">Sending link...</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2 md:gap-4 p-4 md:px-8 md:pb-8 w-full">
                <h2 className="text-xl md:text-3xl font-medium text-white font-plex-sans self-start">Forgot Password</h2>
                <p className="text-xs md:text-sm text-white/80 text-left">
                    Enter your email address and we&apos;ll send you a link to reset your password. If you don’t see the email, please check your spam folder.
                </p>
                
                <div className="space-y-1 text-left mt-2">
                    <label className="pl-2 text-xs md:text-sm text-white font-plex-sans">Email</label>
                    <Input 
                        placeholder="Enter your email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-white rounded-2xl text-black placeholder:text-gray-400 placeholder:font-montserrat font-montserrat h-10 md:h-12"
                    />
                </div>

                <Button onClick={handleSendResetLink} className="w-full h-10 md:h-12 bg-custom-gold text-custom-purple-dark font-montserrat font-bold text-base md:text-lg rounded-full hover:bg-custom-gold/90 mt-2 md:mt-4">
                    Send Reset Link
                </Button>
                
                {!isAuthenticated && (
                  <p className="text-center text-xs md:text-sm text-white font-plex-sans mt-2 md:mt-4">
                      Remember your password? <button onClick={onLoginClick} className="font-bold text-custom-gold hover:underline">Log In</button>
                  </p>
                )}
            </div>
          )}
        </AuthLayout>
      </DialogContent>
    </Dialog>
  )
}
