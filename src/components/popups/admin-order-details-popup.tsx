// @/components/admin-order-details.tsx
'use client';

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription as SheetDescriptionComponent,
} from "@/components/ui/sheet"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription as AlertDialogDescriptionComponent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle as AlertDialogTitleComponent,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "../ui/button";
import { X, User, Mail, Phone, Home, Star, MessageSquareWarning, Copy } from "lucide-react";
import type { Order } from "@/types";
import { cn } from "@/lib/utils";
import { Separator } from "../ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAppContext } from "@/context/app-context";
import { OrderConfirmedItemCard } from "../cards/order-confirmed-item-card";
import { ScrollArea } from "../ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { BillDetails } from "../bill-details";


interface AdminOrderDetailsProps {
    order: Order | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const DetailRow = ({ icon, label, value, action }: { icon: React.ReactNode, label: string, value: React.ReactNode, action?: React.ReactNode }) => (
    <div className="flex items-start gap-3">
        <div className="flex-shrink-0 text-white/70 mt-0.5">{icon}</div>
        <div className="flex-grow">
            <p className="text-xs text-white/70">{label}</p>
            <div className="font-semibold">{value}</div>
        </div>
         {action && <div className="flex-shrink-0">{action}</div>}
    </div>
);

const OrderDetailsContent = ({ order: initialOrder }: { order: Order, onOpenChange: (open: boolean) => void }) => {
    const { updateOrderStatus, allOrders } = useAppContext();
    const { toast } = useToast();
    const isMobile = useIsMobile();
    
    const [order, setOrder] = React.useState(initialOrder);

    React.useEffect(() => {
        const updatedOrder = allOrders.find(o => o.id === initialOrder.id);
        if (updatedOrder) {
            setOrder(updatedOrder);
        }
    }, [allOrders, initialOrder.id]);

    if (!order) return null;
    
    const orderDate = new Date(order.date);
    const formattedDate = orderDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const formattedTime = orderDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    const statusOptions: Order['status'][] = ['Order Requested', 'In Progress', 'Order Delivered', 'Order Cancelled'];

    const getStatusVariant = (status: Order['status'], isActive: boolean) => {
      if (isActive) {
        switch (status) {
          case 'Order Delivered': return 'bg-green-600 text-white hover:bg-green-700';
          case 'Order Cancelled': return 'bg-red-600 text-white hover:bg-red-700';
          case 'In Progress': return 'bg-blue-500 text-white hover:bg-blue-600';
          default: return 'bg-custom-gold text-custom-purple-dark hover:bg-custom-gold/90';
        }
      }
      return 'bg-white/10 text-white/70 hover:bg-white/20';
    };

    const handleStatusChange = (newStatus: Order['status']) => {
        if (order.id && order.uid && newStatus !== order.status) {
            updateOrderStatus(order.uid, order.id, newStatus, 'admin');
        }
    };
    
    const handleCopyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
          toast({
            title: "Copied to clipboard!",
            description: `Order ID: ${text}`,
            variant: 'success',
          });
        });
      };

    const desktopLayout = (
        <div className="grid grid-cols-2 h-full text-white">
            {/* Left Column (Scrollable Order Items) */}
            <div className="col-span-1 flex flex-col h-full min-h-0">
                <ScrollArea className="flex-grow min-h-0 custom-scrollbar">
                    <div className="space-y-3 px-6 py-4">
                        {order.items.map((item, index) => {
                            return (
                                <div 
                                    key={`${item.name}-${index}`}
                                >
                                    <OrderConfirmedItemCard
                                        item={item}
                                        isMobile={isMobile ?? false}
                                    />
                                </div>
                            )
                        })}
                    </div>
                </ScrollArea>
            </div>

            {/* Right Column (Scrollable Details & Actions) */}
            <div className="col-span-1 border-l border-white/20 flex flex-col h-full min-h-0">
                <ScrollArea className="flex-grow min-h-0 custom-scrollbar">
                    <div className="p-6 space-y-6 font-plex-sans">
                        <div className="space-y-4">
                           <DetailRow icon={<User size={16} />} label="Customer Name" value={order.customerName || 'Loading...'} />
                           <DetailRow icon={<Mail size={16} />} label="Email" value={order.customerEmail || 'Loading...'} action={order.customerEmail ? <a href={`https://mail.google.com/mail/?view=cm&fs=1&to=${order.customerEmail}`} target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white"><Mail size={18}/></a> : undefined} />
                           <DetailRow icon={<Phone size={16} />} label="Phone" value={order.customerPhone || 'Loading...'} action={order.customerPhone ? <a href={`tel:${order.customerPhone}`} className="text-white/70 hover:text-white"><Phone size={18}/></a> : undefined} />
                           <DetailRow icon={<Home size={16} />} label="Address" value={order.address || 'Not Provided'} />
                        </div>
                        <Separator className="bg-white/20" />
                        <div className="space-y-2">
                            <div>
                                <p className="text-xs text-white/70">Order ID</p>
                                <div className="font-semibold flex items-center gap-2">
                                  {order.customOrderId}
                                  <Button variant="ghost" size="icon" className="h-6 w-6 text-white/70 hover:text-white" onClick={() => handleCopyToClipboard(order.customOrderId)}>
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-white/70">Date &amp; Time</p>
                                <p className="font-semibold">{formattedDate} at {formattedTime}</p>
                            </div>
                        </div>

                        <Separator className="bg-white/20" />
                        
                         <div className="text-white">
                            <h4 className="font-bold text-lg mb-2">Bill Details</h4>
                            <div className="bg-white/5 p-3 rounded-lg text-sm">
                            <BillDetails order={order} showTotalPayable variant="dark" />
                            </div>
                        </div>
                        
                        {(order.rating || order.feedback) && (
                            <>
                                <Separator className="bg-white/20" />
                                <div>
                                    <h4 className="font-bold mb-2 flex items-center gap-2 text-lg"><Star size={18} /> Customer Feedback</h4>
                                    <div className="bg-white/5 p-3 rounded-lg space-y-2">
                                    {order.rating && (
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm text-white/80">Rating:</p>
                                            <div className="flex items-center">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className={cn("h-5 w-5", (order.rating || 0) > i ? "text-custom-gold fill-custom-gold" : "text-white/50")}/>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {order.feedback && (
                                        <div>
                                            <p className="text-sm text-white/80">Feedback:</p>
                                            <blockquote className="text-sm italic border-l-2 border-custom-gold pl-2 ml-1 mt-1">&quot;{order.feedback}&quot;</blockquote>
                                        </div>
                                    )}
                                    </div>
                                </div>
                            </>
                        )}
                        
                        {order.cancellationReason && (
                        <>
                            <Separator className="bg-white/20" />
                            <div>
                            <h4 className="font-bold mb-2 flex items-center gap-2 text-red-400"><MessageSquareWarning size={18} /> Cancellation Reason</h4>
                            <div className="bg-white/5 p-3 rounded-lg">
                                <blockquote className="text-sm italic border-l-2 border-red-400 pl-2 ml-1">&quot;{order.cancellationReason}&quot;</blockquote>
                            </div>
                            </div>
                        </>
                        )}

                        <Separator className="bg-white/20" />

                        {order.cancelledBy === 'user' ? (
                            <div className="flex flex-col items-center justify-center gap-2 pb-4 text-center">
                                <p className="text-sm font-semibold text-red-400">This order was cancelled by the customer.</p>
                                <p className="text-xs text-white/70">No further actions can be taken.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center gap-2 pb-4">
                                <p className="text-sm text-white/80">Change Order Status</p>
                                <div className="grid grid-cols-2 justify-center gap-2 font-plex-sans w-full">
                                    {statusOptions.map((status) => {
                                        const buttonContent = (
                                            <Button
                                                key={status}
                                                variant="ghost"
                                                onClick={() => { if (status !== 'Order Cancelled') handleStatusChange(status) }}
                                                className={cn(
                                                    "text-xs h-8 px-3 rounded-full border-none focus:ring-0 focus:ring-offset-0 transition-all duration-200",
                                                    getStatusVariant(status, order.status === status)
                                                )}
                                            >
                                                {status}
                                            </Button>
                                        );

                                        if (status === 'Order Cancelled') {
                                            return (
                                                <AlertDialog key="cancel-dialog">
                                                    <AlertDialogTrigger asChild>{buttonContent}</AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitleComponent>Are you sure?</AlertDialogTitleComponent>
                                                            <AlertDialogDescriptionComponent>
                                                                The user&apos;s order will be cancelled. You can change the status back if you wish.
                                                            </AlertDialogDescriptionComponent>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>No</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleStatusChange('Order Cancelled')}>Yes, Cancel Order</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            );
                                        }
                                        
                                        return buttonContent;
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>
        </div>
    );

    const mobileLayout = (
        <ScrollArea className="h-full">
            <div className="flex flex-col gap-4 px-4 py-4 text-white">
                <div className="grid grid-cols-1 gap-4">
                    <DetailRow icon={<User size={16} />} label="Customer Name" value={order.customerName || 'Loading...'} />
                    <DetailRow icon={<Mail size={16} />} label="Email" value={order.customerEmail || 'Loading...'} action={order.customerEmail ? <a href={`https://mail.google.com/mail/?view=cm&fs=1&to=${order.customerEmail}`} target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white"><Mail size={18}/></a> : undefined} />
                    <DetailRow icon={<Phone size={16} />} label="Phone" value={order.customerPhone || 'Loading...'} action={order.customerPhone ? <a href={`tel:${order.customerPhone}`} className="text-white/70 hover:text-white"><Phone size={18}/></a> : undefined} />
                    <DetailRow icon={<Home size={16} />} label="Address" value={order.address || 'Not Provided'} />
                    <Separator className="bg-white/20" />
                    <div>
                        <p className="text-xs text-white/70">Order ID</p>
                         <div className="font-semibold flex items-center gap-2">
                           {order.customOrderId}
                           <Button variant="ghost" size="icon" className="h-6 w-6 text-white/70 hover:text-white" onClick={() => handleCopyToClipboard(order.customOrderId)}>
                             <Copy className="h-3 w-3" />
                           </Button>
                         </div>
                    </div>
                    <div>
                        <p className="text-xs text-white/70">Date &amp; Time</p>
                        <p className="font-semibold">{formattedDate} at {formattedTime}</p>
                    </div>
                </div>

                <Separator className="bg-white/20" />
                
                <div>
                    <h4 className="font-bold mb-2 flex items-center gap-2">Order Items</h4>
                    <div className="bg-transparent p-0 rounded-lg space-y-3">
                        {order.items.map((item, index) => (
                            <div 
                                key={`${item.name}-${index}`}
                                className="cursor-pointer"
                            >
                                <OrderConfirmedItemCard
                                    item={item}
                                    isMobile={isMobile ?? false}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <Separator className="bg-white/20" />
                
                <div className="text-white">
                    <h4 className="font-bold text-lg mb-2">Bill Details</h4>
                    <div className="bg-white/5 p-3 rounded-lg text-sm">
                    <BillDetails order={order} showTotalPayable variant="dark" />
                    </div>
                </div>
                
                {(order.rating || order.feedback) && (
                     <>
                        <Separator className="bg-white/20" />
                         <div>
                            <h4 className="font-bold mb-2 flex items-center gap-2"><Star size={18} /> Customer Feedback</h4>
                            <div className="bg-white/5 p-3 rounded-lg space-y-2">
                               {order.rating && (
                                <div className="flex items-center gap-2">
                                    <p className="text-sm text-white/80">Rating:</p>
                                    <div className="flex items-center">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={cn("h-5 w-5", (order.rating || 0) > i ? "text-custom-gold fill-custom-gold" : "text-white/50")}/>
                                        ))}
                                    </div>
                                </div>
                               )}
                               {order.feedback && (
                                <div>
                                    <p className="text-sm text-white/80">Feedback:</p>
                                    <blockquote className="text-sm italic border-l-2 border-custom-gold pl-2 ml-1 mt-1">&quot;{order.feedback}&quot;</blockquote>
                                </div>
                               )}
                            </div>
                        </div>
                     </>
                )}
                
                {order.cancellationReason && (
                  <>
                    <Separator className="bg-white/20" />
                    <div>
                      <h4 className="font-bold mb-2 flex items-center gap-2 text-red-400"><MessageSquareWarning size={18} /> Cancellation Reason</h4>
                      <div className="bg-white/5 p-3 rounded-lg">
                        <blockquote className="text-sm italic border-l-2 border-red-400 pl-2 ml-1">&quot;{order.cancellationReason}&quot;</blockquote>
                      </div>
                    </div>
                  </>
                )}


                <Separator className="bg-white/20" />

                {order.cancelledBy === 'user' ? (
                    <div className="flex flex-col items-center justify-center gap-2 pb-4 text-center">
                        <p className="text-sm font-semibold text-red-400">This order was cancelled by the customer.</p>
                        <p className="text-xs text-white/70">No further actions can be taken.</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center gap-2 pb-4">
                        <p className="text-sm text-white/80">Change Order Status</p>
                        <div className="grid grid-cols-2 gap-2 font-plex-sans w-full">
                            {statusOptions.map((status) => {
                                const buttonContent = (
                                    <Button
                                        key={status}
                                        variant="ghost"
                                        onClick={() => { if (status !== 'Order Cancelled') handleStatusChange(status) }}
                                        className={cn(
                                            "text-xs h-8 px-3 rounded-full border-none focus:ring-0 focus:ring-offset-0 transition-all duration-200",
                                            getStatusVariant(status, order.status === status)
                                        )}
                                    >
                                        {status}
                                    </Button>
                                );

                                if (status === 'Order Cancelled') {
                                    return (
                                        <AlertDialog key="cancel-dialog">
                                            <AlertDialogTrigger asChild>{buttonContent}</AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitleComponent>Are you sure?</AlertDialogTitleComponent>
                                                    <AlertDialogDescriptionComponent>
                                                        The user&apos_s order will be cancelled. You can change the status back if you wish.
                                                    </AlertDialogDescriptionComponent>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>No</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleStatusChange('Order Cancelled')}>Yes, Cancel Order</AlertDialogAction>
                                                </AlertDialogFooter>
                                                    </AlertDialogContent>
                                        </AlertDialog>
                                    );
                                }
                                
                                return buttonContent;
                            })}
                        </div>
                    </div>
                )}
            </div>
        </ScrollArea>
    );

    return isMobile ? mobileLayout : desktopLayout;
};


export function AdminOrderDetails({ order, open, onOpenChange }: AdminOrderDetailsProps) {
  const isMobile = useIsMobile();
  
  if (!order) {
      return null;
  }

  return (
    <>
      {isMobile ? (
        <Sheet open={open} onOpenChange={onOpenChange}>
          <SheetContent side="bottom" className="bg-custom-purple-dark text-white border-t-2 border-custom-gold rounded-t-3xl h-[90vh] p-0 flex flex-col">
            <SheetHeader className="p-4 border-b border-white/20 text-center flex-shrink-0">
              <SheetTitle className="text-white text-lg">Order Details</SheetTitle>
              <SheetDescriptionComponent className="sr-only">
                A dialog showing the details of the selected order, including customer information, items, and bill breakdown.
              </SheetDescriptionComponent>
            </SheetHeader>
            <div className="flex-grow min-h-0">
                <OrderDetailsContent order={order} onOpenChange={onOpenChange} />
            </div>
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="p-0 h-[85vh] w-full max-w-4xl bg-custom-purple-dark border-2 border-custom-gold rounded-2xl md:rounded-[30px] overflow-hidden flex flex-col">
            <DialogHeader className="p-4 text-center border-b border-white/20">
              <DialogTitle className="text-white text-lg md:text-xl">Order Details</DialogTitle>
              <DialogDescription className="sr-only">
                A dialog showing the details of the selected order, including customer information, items, and bill breakdown.
              </DialogDescription>
              <DialogClose className="absolute right-3 top-2 md:top-3 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground text-white z-10">
                <X className="h-5 w-5" />
                <span className="sr-only">Close</span>
              </DialogClose>
            </DialogHeader>
            <div className="flex-grow min-h-0">
              <OrderDetailsContent order={order} onOpenChange={onOpenChange} />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}