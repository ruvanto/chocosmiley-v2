
// @/components/order-back-dialog.tsx
'use client';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "../ui/button";
import { Phone } from 'lucide-react';
import { SiWhatsapp } from "react-icons/si";
import type { Order } from '@/types';

interface OrderBackDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    order: Order | null;
}

export function OrderBackDialog({ open, onClose, onConfirm, order }: OrderBackDialogProps) {

  const generateWhatsAppMessage = (order: Order | null) => {
    if (!order) return '';
    const intro = "Hello Choco Smiley,\n\nI've just placed an order request and would like to proceed with the payment.\n\nHere are my order details:\n";
    const orderId = `*Order ID:* ${order.customOrderId}\n\n`;

    const itemsList = order.items.map(item => {
      let itemString = `• *${item.quantity}x ${item.name}*`;
      if (item.flavours && item.flavours.length > 0) {
        const flavourNames = item.flavours.map(f => f.name).join(', ');
        itemString += `\n  - Flavours: ${flavourNames}`;
      }
      return itemString;
    }).join('\n');

    const total = `\n\n*Total Amount:* ₹${order.total.toFixed(2)}\n\nThank you!`;
    
    return encodeURIComponent(intro + orderId + itemsList + total);
  };
  
  const whatsAppUrl = order
    ? `https://api.whatsapp.com/send?phone=917411414007&text=${generateWhatsAppMessage(order)}`
    : `https://api.whatsapp.com/send?phone=917411414007`;


  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl">Finalize Your Order</AlertDialogTitle>
          <AlertDialogDescription>
          Your order isn’t finalized yet! Please contact us to confirm the details before leaving.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex flex-col gap-3 mt-2">
            <Button asChild className="h-auto w-full py-2 bg-white hover:bg-gray-200 text-custom-purple-dark rounded-full font-plex-sans shadow-lg font-semibold" onClick={onClose}>
                <a href={whatsAppUrl} target="_blank" rel="noopener noreferrer">
                <SiWhatsapp className="h-5 w-5" /> Whatsapp Us
                </a>
            </Button>
            <Button asChild variant="outline" className="h-auto w-full py-2 text-white border-white/50 bg-transparent hover:bg-white/10 hover:text-white rounded-full font-plex-sans shadow-lg" onClick={onClose}>
                <a href="tel:+917411414007">
                <Phone className="h-4 w-4" /> Call Us
                </a>
            </Button>
             <Button onClick={onConfirm} variant="ghost" className="h-auto w-full py-2 text-white/70 hover:text-white rounded-full font-plex-sans">
                Understood!
            </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
