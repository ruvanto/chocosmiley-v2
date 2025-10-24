
// @/components/signup-popup.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AuthLayout } from "../ui/auth-layout";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { signUpWithEmail, signInWithGoogle } from '@/lib/firebase';
import { useAppContext } from "@/context/app-context";
import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';

// Helper function to create user-friendly error messages
const getAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'This email address is already in use by another account.';
    case 'auth/weak-password':
      return 'The password is too weak. Please use a stronger password.';
    case 'auth/invalid-email':
      return 'The email address is not valid. Please enter a valid email.';
    case 'auth/network-request-failed':
      return 'Could not connect to the network. Please check your connection and try again.';
    default:
      return 'An unexpected error occurred. Please try again later.';
  }
};


interface SignUpPopupProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onLoginClick: () => void;
}

export function SignUpPopup({ open, onOpenChange, onLoginClick }: SignUpPopupProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const { login, isAuthenticating, setIsAuthenticating, setAuthPopup, setIsGlobalLoading } = useAppContext();

  useEffect(() => {
    if (!open) {
      setEmail('');
      setPassword('');
      setShowPassword(false);
    }
  }, [open]);

  const handleEmailSignUp = async () => {
    if (!email || !password) {
      toast({ title: "Please enter email and password", variant: "destructive" });
      return;
    }
    setIsAuthenticating(true, "Creating your account...");
    try {
      const userCredential = await signUpWithEmail(email, password);
      await login(userCredential.user, true); // true because it's a new user
      toast({ title: "Account Created!", variant: "success" });
    } catch (error: any) {
      const friendlyMessage = getAuthErrorMessage(error.code);
      toast({ title: friendlyMessage, variant: "destructive" });
      setIsAuthenticating(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsAuthenticating(true, "Signing you in...");
    try {
      const userCredential = await signInWithGoogle();
      const user = userCredential.user;
      const isNewUser = user.metadata.creationTime === user.metadata.lastSignInTime;
      
      await login(user, isNewUser);

      toast({ title: "Logged In Successfully!", variant: "success" });
    } catch (error: any) {
      toast({ title: "Sign Up Failed", description: "Could not sign up with Google. Please try again.", variant: "destructive" });
      setIsAuthenticating(false);
    }
  };
  
  const handleLinkClick = () => {
    setAuthPopup(null);
    setIsGlobalLoading(true);
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isAuthenticating && onOpenChange(isOpen)}>
      <DialogContent className={cn("p-0 w-[90vw] md:w-full max-w-sm md:max-w-md rounded-2xl md:rounded-[40px]")}>
        <DialogHeader>
          <DialogTitle className="sr-only">Sign Up</DialogTitle>
        </DialogHeader>
        <AuthLayout>
              <div className="flex flex-col gap-2 md:gap-4 p-4 md:px-8 md:pb-8 w-full">
                  <h2 className="text-xl md:text-3xl font-medium text-white font-plex-sans self-start">Sign Up</h2>
                  
                  <div className="space-y-1 text-left">
                      <label className="pl-2 text-xs md:text-sm text-white font-plex-sans">Email or Phone</label>
                      <Input 
                          placeholder="Enter your email or phone"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="bg-white rounded-2xl text-black placeholder:text-gray-400 placeholder:font-montserrat font-montserrat h-10 md:h-12"
                      />
                  </div>
                  
                  <div className="space-y-1 text-left">
                      <label className="pl-2 text-xs md:text-sm text-white font-plex-sans">Password</label>
                      <div className="relative">
                        <Input 
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-white rounded-2xl text-black placeholder:text-gray-400 placeholder:font-montserrat font-montserrat h-10 md:h-12 pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-black"
                        >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                  </div>

                  <p className="text-[10px] md:text-xs text-white font-montserrat self-center text-center">
                      By continuing, you agree to Choco Smiley’s <Link href="/terms" onClick={handleLinkClick} className="text-custom-gold hover:underline">Terms and Service</Link> and acknowledge Choco Smiley’s <Link href="/privacy" onClick={handleLinkClick} className="text-custom-gold hover:underline">Privacy Policy</Link>.
                  </p>

                  <Button onClick={handleEmailSignUp} className="w-full h-10 md:h-12 bg-custom-gold text-custom-purple-dark font-montserrat font-bold text-base md:text-lg rounded-full hover:bg-custom-gold/90 mt-1 md:mt-2">
                      Create Account
                  </Button>

                  <div className="flex items-center gap-2 my-1 md:my-2">
                      <div className="h-px flex-grow bg-white/50"></div>
                      <span className="text-white text-xs md:text-sm">OR</span>
                      <div className="h-px flex-grow bg-white/50"></div>
                  </div>

                  <Button variant="outline" onClick={handleGoogleSignUp} className="w-full md:w-[60%] h-10 md:h-12 bg-white font-semibold text-black self-center rounded-full hover:bg-white/90 hover:text-black/90 text-sm md:text-base gap-2 md:gap-3">
                      <Image src="/icons/google.png" alt="Google" width={25} height={25} className="w-5 h-5 md:w-6 md:h-6" onDragStart={(e) => e.preventDefault()} />
                      Sign up with Google
                  </Button>
                  
                  <p className="text-center text-xs md:text-sm text-white font-plex-sans mt-2 md:mt-4">
                      Already Have an Account? <button onClick={onLoginClick} className="font-bold text-custom-gold hover:underline">Log In</button>
                  </p>
              </div>
        </AuthLayout>
      </DialogContent>
    </Dialog>
  )
}
