
// @/components/order-back-dialog.tsx
'use client';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "./ui/button";
import { Phone } from 'lucide-react';
import { SiWhatsapp } from "react-icons/si";

interface OrderBackDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export function OrderBackDialog({ open, onClose, onConfirm }: OrderBackDialogProps) {

  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl">Finalize Your Order</AlertDialogTitle>
          <AlertDialogDescription>
            Have you connected with us to complete your payment? To ensure your order is processed, a 50% advance is required. We're here to help!
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex flex-col gap-3 mt-2">
            <Button asChild className="h-auto w-full py-2 bg-white hover:bg-gray-200 text-custom-purple-dark rounded-full font-plex-sans shadow-lg font-semibold">
                <a href="https://wa.me/917411414007" target="_blank" rel="noopener noreferrer">
                <SiWhatsapp className="h-5 w-5" /> Whatsapp Us
                </a>
            </Button>
            <Button asChild variant="outline" className="h-auto w-full py-2 text-white border-white/50 bg-transparent hover:bg-white/10 hover:text-white rounded-full font-plex-sans shadow-lg">
                <a href="tel:+917411414007">
                <Phone className="h-4 w-4" /> Call Us
                </a>
            </Button>
             <Button onClick={onConfirm} variant="ghost" className="h-auto w-full py-2 text-white/70 hover:text-white rounded-full font-plex-sans">
                I'll Do It Later
            </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
