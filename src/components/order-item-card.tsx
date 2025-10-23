
// @/components/order-item-card.tsx
'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';
import type { Order } from '@/types';
import { Button } from './ui/button';
import { useAppContext } from '@/context/app-context';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { RotateCcw, Star } from 'lucide-react';
import { Separator } from './ui/separator';
import { useRouter } from 'next/navigation';

interface OrderItemCardProps {
    order: Order;
    isMobile?: boolean;
    onClick: () => void;
    onRate: () => void;
    onCancel: () => void;
    onReorder: () => void;
}

export function OrderItemCard({ order: initialOrder, isMobile = false, onClick, onRate, onCancel, onReorder }: OrderItemCardProps) {
    const { orders } = useAppContext();
    const router = useRouter();

    // Find the latest version of the order from the context to ensure UI updates
    const order = orders.find(o => o.id === initialOrder.id) || initialOrder;

    const orderDate = new Date(order.date);
    const formattedDate = orderDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
     const formattedTime = orderDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
    
    const statusVariant = (status: Order['status']): "success" | "destructive" | "default" | "info" => {
        switch (status) {
            case 'Order Delivered': return 'success';
            case 'Order Cancelled': return 'destructive';
            case 'In Progress': return 'info';
            default: return 'default';
        }
    };

    const handleReorderClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onReorder();
        if (isMobile) {
            router.push('/cart');
        }
    };

    return (
        <div 
            onClick={onClick}
            className="bg-white/90 p-3 md:p-4 text-black w-full relative overflow-hidden rounded-xl md:rounded-2xl shadow-md text-left flex flex-col cursor-pointer hover:bg-white"
        >
            <div className="flex flex-col gap-2 mb-2">
                <div className="flex items-center overflow-x-auto no-scrollbar gap-2 pb-1">
                    {order.items.map((item, index) => (
                        <div key={index} className="relative flex-shrink-0">
                             <div className="relative w-14 h-14 md:w-16 md:h-16">
                                 <Image
                                    src={item.coverImage || "/placeholder.png"}
                                    alt={item.name}
                                    fill
                                    sizes="(max-width: 768px) 15vw, 5vw"
                                    className="rounded-xl object-cover border-2 border-white"
                                    data-ai-hint="chocolate box"
                                    onDragStart={(e) => e.preventDefault()}
                                />
                                 <div className="absolute -bottom-1 -right-1 bg-custom-purple-dark text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white">
                                    {item.quantity}
                                </div>
                             </div>
                        </div>
                    ))}
                </div>

                <div className="self-start">
                    <Badge 
                        variant={statusVariant(order.status)}
                        className={cn(
                            "text-xs font-plex-sans",
                            order.status === 'Order Requested' && 'text-custom-purple-dark hover:bg-primary'
                        )}
                    >
                        {order.status}
                    </Badge>
                </div>
                
                <div className="flex justify-between items-center w-full">
                    <p className="text-xs text-black/70">{formattedDate} at {formattedTime}</p>
                    <p className="text-base md:text-lg font-bold">₹{order.total.toFixed(2)}</p>
                </div>
            </div>
            
            <Separator className="bg-custom-purple-dark/20" />

            <div className="flex items-center justify-between mt-2">
                <div onClick={(e) => e.stopPropagation()}>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="link" className="p-0 h-auto text-custom-purple-dark font-poppins text-xs md:text-sm hover:no-underline flex items-center gap-1">
                                <RotateCcw className="h-3.5 w-3" />
                                <span>Order Again</span>
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Add Items to Cart?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will add all items from this past order to your current cart.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleReorderClick}>Confirm</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
                
                {(order.status === 'Order Cancelled' || <Separator orientation="vertical" className="h-4 bg-custom-purple-dark/20" />)}

                {(order.status === 'Order Requested' || order.status === 'In Progress') && (
                    <div onClick={(e) => e.stopPropagation()}>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                               <Button variant="link" className="p-0 h-auto text-red-600 font-poppins text-xs md:text-sm hover:no-underline flex items-center gap-1">
                                 <span>Cancel Order</span>
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure you want to cancel this order?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>No, Keep It</AlertDialogCancel>
                                <AlertDialogAction onClick={onCancel} >Yes, Cancel</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                )}
                {order.status === 'Order Delivered' && (
                    <>
                        {order.rating ? (
                            <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={cn("h-4 w-4", order.rating! > i ? "text-custom-gold fill-custom-gold" : "text-gray-300")}/>
                                ))}
                            </div>
                        ) : (
                            <Button onClick={(e) => { e.stopPropagation(); onRate(); }} variant="link" className="p-0 h-auto text-custom-purple-dark font-poppins text-xs md:text-sm hover:no-underline">
                                <span>Rate Order</span>
                            </Button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
