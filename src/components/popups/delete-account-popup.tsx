
// @/components/delete-account-popup.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useToast } from "@/hooks/use-toast";
import { deleteUserAccount, reauthenticateWithGoogle } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import { Loader } from '../loader';
import { X, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import { useAppContext } from '@/context/app-context';

interface DeleteAccountPopupProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const DELETION_CONFIRMATION_TEXT = "DELETE";

export function DeleteAccountPopup({ open, onOpenChange }: DeleteAccountPopupProps) {
  const [password, setPassword] = useState('');
  const [confirmationText, setConfirmationText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const { logout, user } = useAppContext();
  
  const isGoogleSignIn = user?.providerData.some(provider => provider.providerId === 'google.com');

  useEffect(() => {
    if (!open) {
      setPassword('');
      setConfirmationText('');
      setShowPassword(false);
      setIsLoading(false);
    }
  }, [open]);

  const handleDeleteAccount = async () => {
    if (confirmationText !== DELETION_CONFIRMATION_TEXT) {
        toast({ title: "Confirmation Mismatch", description: `Please type "${DELETION_CONFIRMATION_TEXT}" to confirm.`, variant: "destructive" });
        return;
    }

    setIsLoading(true);
    try {
        if (isGoogleSignIn) {
            // For Google users, re-authenticate with Google popup
            await reauthenticateWithGoogle();
        }
        // Proceed with deletion, passing password only for email users
        await deleteUserAccount(isGoogleSignIn ? undefined : password);
        
        toast({ title: "Account Deleted", variant: "success" });
        logout(); // Log the user out after successful deletion
        onOpenChange(false);
    } catch (error: any) {
        let message = "An unexpected error occurred. Please try again.";
        if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            message = "The password you entered is incorrect. Please try again.";
        } else if (error.code === 'auth/too-many-requests') {
            message = "Access to this account has been temporarily disabled due to many failed attempts. Please try again later."
        } else if (error.code === 'auth/popup-closed-by-user') {
            message = "Re-authentication cancelled. Account deletion aborted.";
        } else if (error.code === 'auth/unverified-email' && isGoogleSignIn) {
            message = "Please re-authenticate with Google to proceed with account deletion.";
        }
        toast({ title: "Deletion Failed", description: message, variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  };

  const isDeleteDisabled = confirmationText !== DELETION_CONFIRMATION_TEXT;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isLoading && onOpenChange(isOpen)}>
      <DialogContent className={cn("p-0 w-[90vw] max-w-sm bg-custom-purple-dark border-2 border-red-500 rounded-2xl md:rounded-[30px]")}>
        <DialogHeader className="p-4 pt-6 text-center border-b border-red-500/50">
          <DialogTitle className="text-white text-lg md:text-xl flex items-center justify-center gap-2">
            <ShieldAlert className="h-6 w-6 text-red-400" />
            Delete Account
          </DialogTitle>
          <DialogClose disabled={isLoading} className="absolute right-3 top-2 md:top-3 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground text-white z-10">
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-4 h-96">
            <Loader size={48} />
            <p className="text-white font-semibold">Deleting your account...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 p-4 md:p-6 text-white overflow-y-auto custom-scrollbar max-h-[80vh]">
            <p className="text-sm text-center text-red-300">
                This is an irreversible action. You will lose all your profile information, order history, and wishlist.
            </p>

            {!isGoogleSignIn && (
                <div className="space-y-1 text-left">
                    <label htmlFor="delete-password" className="pl-2 text-xs md:text-sm font-medium text-white">Enter Your Password</label>
                    <div className="relative">
                        <Input
                            id="delete-password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-white/10 border-white/20 text-white rounded-lg h-10 md:h-11 text-base pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(p => !p)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-white/70 hover:text-white"
                        >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                </div>
            )}
            
            <div className="space-y-1 text-left">
                <label htmlFor="delete-confirm" className="pl-2 text-xs md:text-sm font-medium text-white">To confirm, type "{DELETION_CONFIRMATION_TEXT}" below</label>
                <Input
                    id="delete-confirm"
                    type="text"
                    value={confirmationText}
                    onChange={(e) => setConfirmationText(e.target.value)}
                    className="bg-white/10 border-white/20 text-white rounded-lg h-10 md:h-11 text-base"
                />
            </div>
            
            {isGoogleSignIn && (
                <div className="text-center text-xs md:text-sm p-3 bg-blue-900/30 border border-blue-500/50 rounded-lg">
                    <p>You will be asked to sign in with Google again to confirm your identity before deletion.</p>
                </div>
            )}

            <Button 
                onClick={handleDeleteAccount} 
                isLoading={isLoading} 
                disabled={isDeleteDisabled}
                className="mt-2 w-full bg-red-600 text-white font-bold hover:bg-red-700 py-2.5 text-base rounded-full disabled:bg-gray-500 disabled:cursor-not-allowed whitespace-normal"
            >
              Permanently Delete My Account
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
