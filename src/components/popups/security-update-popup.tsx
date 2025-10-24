
// @/components/security-update-popup.tsx
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
import { reauthenticateAndChangePassword } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import { Loader } from '../loaders/loader';
import { X, Eye, EyeOff, Lock } from 'lucide-react';
import { Separator } from '../ui/separator';

interface SecurityUpdatePopupProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onForgotPasswordClick: () => void;
}

export function SecurityUpdatePopup({ open, onOpenChange, onForgotPasswordClick }: SecurityUpdatePopupProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!open) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setIsLoading(false);
    }
  }, [open]);

  const handleUpdate = async () => {
    if (!currentPassword) {
        toast({ title: "Password Required", description: "Please enter your current password to make any changes.", variant: "destructive" });
        return;
    }

    if (!newPassword) {
        toast({ title: "No Changes", description: "Please enter a new password to update.", variant: "destructive" });
        return;
    }

    setIsLoading(true);

    if (newPassword !== confirmPassword) {
        toast({ title: "Passwords Do Not Match", description: "Your new password and confirmation do not match.", variant: "destructive" });
        setIsLoading(false);
        return;
    }
    if (newPassword.length < 6) {
        toast({ title: "Password Too Weak", description: "Your new password must be at least 6 characters long.", variant: "destructive" });
        setIsLoading(false);
        return;
    }
    try {
        await reauthenticateAndChangePassword(currentPassword, newPassword);
        toast({ title: "Password Updated", variant: "success" });
        onOpenChange(false);
    } catch (error: any) {
        let message = "An unexpected error occurred while updating your password.";
        if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            message = "The current password you entered is incorrect. Please try again.";
        } else if (error.code === 'auth/too-many-requests') {
            message = "Access to this account has been temporarily disabled due to many failed attempts. Please try again later."
        }
        toast({ title: "Update Failed", description: message, variant: "destructive" });
    }
    
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isLoading && onOpenChange(isOpen)}>
      <DialogContent className={cn("p-0 w-[90vw] md:w-full max-w-sm md:max-w-md bg-custom-purple-dark border-2 border-custom-gold rounded-2xl md:rounded-[30px]")}>
        <DialogHeader className="p-4 text-center border-b border-white/20">
          <DialogTitle className="text-white text-lg md:text-xl">Update Security</DialogTitle>
          <DialogClose disabled={isLoading} className="absolute right-3 top-2 md:top-3 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground text-white z-10">
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-4 h-96">
            <Loader size={48} />
            <p className="text-white font-semibold">Updating details...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 p-6 text-white overflow-y-auto custom-scrollbar max-h-[80vh]">
            <p className="text-sm text-center text-white/80 -mt-2 mb-2">
                For your security, please enter your current password to make changes.
            </p>

            <div className="space-y-1 text-left">
                <label htmlFor="current-password" className="pl-2 text-sm font-medium text-white">Current Password*</label>
                <div className="relative">
                    <Input
                        id="current-password"
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="bg-white/10 border-white/20 text-white rounded-lg h-11 text-base pr-10"
                    />
                    <button
                        type="button"
                        onClick={() => setShowCurrentPassword(p => !p)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-white/70 hover:text-white"
                    >
                        {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            <button onClick={onForgotPasswordClick} className="text-xs text-custom-gold font-montserrat self-end hover:underline -mt-2">Forgot Password?</button>
            
            <Separator className="bg-white/20 my-2" />
            
            <div className="space-y-3">
              <p className="text-base font-semibold text-white flex items-center gap-2"><Lock size={18} /> Change Password</p>
              <div className="space-y-1 text-left">
                  <label htmlFor="new-password" className="pl-2 text-sm font-medium text-white">New Password</label>
                  <div className="relative">
                      <Input
                          id="new-password"
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="bg-white/10 border-white/20 text-white rounded-lg h-11 text-base pr-10"
                      />
                      <button
                          type="button"
                          onClick={() => setShowNewPassword(p => !p)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-white/70 hover:text-white"
                      >
                          {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                  </div>
              </div>
              
              <div className="space-y-1 text-left">
                  <label htmlFor="confirm-password" className="pl-2 text-sm font-medium text-white">Confirm New Password</label>
                  <Input
                      id="confirm-password"
                      type={showNewPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="bg-white/10 border-white/20 text-white rounded-lg h-11 text-base"
                  />
              </div>
            </div>

            <Button onClick={handleUpdate} isLoading={isLoading} className="mt-4 w-full bg-custom-gold text-custom-purple-dark font-bold hover:bg-custom-gold/90 h-11 text-base rounded-full">
              Save Changes
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
