
// @/components/rating-popup.tsx
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "./ui/button";
import { X, Star } from "lucide-react";
import { Textarea } from "./ui/textarea";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { Order } from '@/types';
import { useAppContext } from '@/context/app-context';

interface RatingPopupProps {
    order: Order | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function RatingPopup({ order, open, onOpenChange }: RatingPopupProps) {
  const { rateOrder } = useAppContext();
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const { toast } = useToast();
  
  if (!order) return null;
  
  const handleSubmit = () => {
    if (rating === 0) {
      toast({ title: "Please select a rating", variant: "destructive" });
      return;
    }
    rateOrder(order.uid, order.id, rating, feedback);
    toast({ title: "Thank you for your feedback!", variant: "success" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="justify-center p-0 w-[90vw] md:w-full max-w-md bg-custom-purple-dark border-2 border-custom-gold rounded-2xl md:rounded-[30px]">
        <DialogHeader className="p-4 text-center mb-4 border-b border-white/20">
          <DialogTitle className="text-white text-lg md:text-xl">Rate Your Order</DialogTitle>
          <DialogClose className="absolute right-3 top-2 md:top-3 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground text-white z-10">
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>
        <div className="flex flex-col gap-6 px-6 pb-6 text-white">
          <div className='text-center'>
            <p className="text-white/80 mb-2">How would you describe your experience?</p>
            <div className="flex justify-center gap-2" onMouseLeave={() => setHoverRating(0)}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHoverRating(star)}
                  onClick={() => setRating(star)}
                >
                  <Star
                    className={cn(
                      "h-8 w-8 transition-colors",
                      (hoverRating || rating) >= star
                        ? "text-custom-gold fill-custom-gold"
                        : "text-white/50"
                    )}
                  />
                </button>
              ))}
            </div>
          </div>
          
          <Textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Tell us more about your experience (optional)"
            className="bg-white/10 rounded-xl h-24 border-white/30"
          />
          
          <Button onClick={handleSubmit} className="w-full bg-custom-gold text-custom-purple-dark font-bold hover:bg-custom-gold/90 h-10 text-base rounded-full">
            Submit Feedback
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
