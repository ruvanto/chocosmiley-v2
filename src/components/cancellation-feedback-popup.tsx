
// @/components/cancellation-feedback-popup.tsx
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { useToast } from '@/hooks/use-toast';
import type { Order } from '@/types';
import { useAppContext } from '@/context/app-context';

interface CancellationFeedbackPopupProps {
    order: Order | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CancellationFeedbackPopup({ order, open, onOpenChange }: CancellationFeedbackPopupProps) {
  const { saveCancellationReason } = useAppContext();
  const [reason, setReason] = useState('');
  const { toast } = useToast();
  
  if (!order) return null;
  
  const handleSubmit = () => {
    if (!reason.trim()) {
      toast({ title: "Please provide a reason", description: "Your feedback is valuable to us.", variant: "destructive" });
      return;
    }
    saveCancellationReason(order.uid, order.id, reason);
    toast({ title: "Thank you for your feedback!", variant: "success" });
    onOpenChange(false);
    setReason('');
  };

  const handleSkip = () => {
    saveCancellationReason(order.uid, order.id, 'SKIPPED');
    onOpenChange(false);
    setReason('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        onInteractOutside={(e) => e.preventDefault()}
        className="justify-center p-0 w-[90vw] md:w-full max-w-md bg-custom-purple-dark border-2 border-custom-gold rounded-2xl md:rounded-[30px]"
      >
        <DialogHeader className="p-4 text-center mb-4 border-b border-white/20">
          <DialogTitle className="text-white text-lg md:text-xl">Reason for Cancellation</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-6 px-6 pb-6 text-white">
          <div className='text-center'>
            <p className="text-white/80 mb-2">We're sorry to see you go. Please let us know why you cancelled this order to help us improve.</p>
          </div>
          
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Tell us more..."
            className="bg-white/10 rounded-xl h-24 border-white/30"
          />
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
             <Button onClick={handleSkip} variant="outline" className="w-full sm:w-auto bg-transparent text-base text-white border-custom-gold border-2 rounded-full px-10 hover:bg-custom-gold hover:text-custom-purple-dark">
                Skip
            </Button>
            <Button onClick={handleSubmit} className="w-full sm:w-auto bg-custom-gold text-custom-purple-dark font-bold hover:bg-custom-gold/90 h-10 text-base rounded-full px-8">
              Submit Feedback
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
