
// @/components/order-details-popup.tsx
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
import { X, Calendar, Hash, Check, Copy } from "lucide-react";
import type { Order } from "@/types";
import { cn } from "@/lib/utils";
import { Separator } from "./ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { OrderConfirmedItemCard } from "./order-confirmed-item-card";
import { ScrollArea } from "./ui/scroll-area";

interface OrderDetailsPopupProps {
    order: Order | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const DetailRow = ({ icon, label, value, onCopy }: { icon: React.ReactNode, label: string, value: React.ReactNode, onCopy?: () => void }) => (
    <div className="flex items-center gap-3">
        <div className="flex-shrink-0 text-white/70">{icon}</div>
        <div className="text-sm">
            <p className="text-xs text-white/70">{label}</p>
            <div className="font-semibold flex items-center gap-2">
              {value}
              {onCopy && (
                <Button variant="ghost" size="icon" className="h-6 w-6 text-white/70 hover:text-white" onClick={onCopy}>
                  <Copy className="h-3 w-3" />
                </Button>
              )}
            </div>
        </div>
    </div>
);

const TimelineNode = ({ isCompleted, isCurrent, status, children, isCancelled }: { isCompleted: boolean, isCurrent: boolean, status: Order['status'], children: React.ReactNode, isCancelled?: boolean }) => {
  const isBlinking = isCurrent && (status === 'Order Requested' || status === 'In Progress');
  
  return (
    <div className="flex flex-col items-center">
      <div
        className={cn(
          'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-500',
          isCancelled ? 'bg-red-500 border-red-500' :
          isCurrent && status === 'Order Requested' ? 'bg-custom-gold border-custom-gold' :
          isCurrent && status === 'In Progress' ? 'bg-blue-500 border-blue-500' :
          isCompleted ? 'bg-green-500 border-green-500' : 
          'bg-transparent border-white/50',
          isBlinking && 'animate-pulse'
        )}
      >
        {isCompleted && !isBlinking && <Check className="h-4 w-4 text-white" />}
        {isBlinking && <div className="w-2 h-2 md:w-3 md:h-3 bg-custom-purple-dark rounded-full"></div>}
      </div>
      <p className={cn('text-xs mt-2 text-center', (isCompleted || isCurrent || isCancelled) ? 'text-white font-semibold' : 'text-white/60')}>
        {children}
      </p>
    </div>
  );
};


const TimelineConnector = ({ isCompleted, isCancelled }: { isCompleted: boolean, isCancelled?: boolean }) => (
  <div className="flex-1 h-0.5 transition-all duration-500" style={{ background: isCancelled ? 'hsl(0, 100%, 50%)' : (isCompleted ? 'hsl(142.1, 76.2%, 36.3%)' : 'hsla(0, 0%, 100%, 0.3)') }} />
);


const OrderDetailsContent = ({ order }: { order: Order }) => {
    const { toast } = useToast();
    const isMobile = useIsMobile();

    if (!order) return null;
    
    const orderDate = new Date(order.date);
    const formattedDate = orderDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const formattedTime = orderDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    
    const totalMrp = order.items.reduce((acc, item) => {
        const itemMrp = item.mrp || 0;
        return acc + (itemMrp * item.quantity);
    }, 0);

    const totalDiscount = order.totalDiscount || 0;

    const totalProductPrice = order.items.reduce((acc, item) => {
        return acc + (item.finalProductPrice || 0);
    }, 0);
    
    const totalFlavoursCost = order.items.reduce((acc, item) => {
        return acc + ((item.finalSubtotal || 0) - (item.finalProductPrice || 0));
    }, 0);
    
    const subtotal = totalProductPrice + totalFlavoursCost;
    const gstAmount = order.total - subtotal;
    const totalPayable = order.total;
    
    const statusSteps = ['Order Requested', 'In Progress', 'Order Delivered'];
    const currentStatusIndex = statusSteps.indexOf(order.status);
    const isCancelled = order.status === 'Order Cancelled';
    
    const handleCopyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text).then(() => {
        toast({
          title: "Copied to clipboard!",
          description: `Order ID: ${text}`,
          variant: 'success',
        });
      });
    };


    if (isMobile) {
      return (
        <div className="flex flex-col gap-4 px-4 pb-4 md:px-6 md:py-3 text-white">
          <div className="grid grid-cols-1 gap-4">
              <DetailRow 
                icon={<Hash size={16} />} 
                label="Order ID" 
                value={order.customOrderId} 
                onCopy={() => handleCopyToClipboard(order.customOrderId)}
              />
              <DetailRow icon={<Calendar size={16} />} label="Date &amp; Time" value={`${formattedDate} at ${formattedTime}`} />
          </div>
          <Separator className="bg-white/20" />
          {/* ... mobile layout remains the same */}
            <div className="w-full">
              <h4 className="font-bold mb-3">Order Status</h4>
              <div className="flex items-center font-plex-sans w-full px-4">
                <TimelineNode isCompleted={currentStatusIndex >= 0} isCurrent={currentStatusIndex === 0} status={order.status} isCancelled={isCancelled}>Order<br/>Requested</TimelineNode>
                <TimelineConnector isCompleted={currentStatusIndex >= 1} isCancelled={isCancelled} />
                <TimelineNode isCompleted={currentStatusIndex >= 1} isCurrent={currentStatusIndex === 1} status={order.status} isCancelled={isCancelled}>In<br/>Progress</TimelineNode>
                <TimelineConnector isCompleted={currentStatusIndex >= 2} isCancelled={isCancelled}/>
                <TimelineNode isCompleted={currentStatusIndex >= 2} isCurrent={currentStatusIndex === 2} status={order.status} isCancelled={isCancelled}>Order<br />Delivered</TimelineNode>
              </div>
              {isCancelled && (
                <p className="text-red-400 font-semibold mt-4 text-sm text-center">This order has been cancelled.</p>
              )}
            </div>

            <Separator className="bg-white/20" />

            <div>
                <h4 className="font-bold mb-2">Order Items</h4>
                <div className="bg-transparent p-0 rounded-lg space-y-3">
                    {order.items.map((item, index) => (
                        <div 
                            key={`${item.name}-${index}`}
                            className={cn("cursor-pointer")}
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
            
            <div>
                 <h4 className="font-bold mb-2">Bill Details</h4>
                 <div className="space-y-1.5 bg-white/5 p-3 rounded-lg text-sm">
                    <div className="flex justify-between"><span className="text-white/80">Total MRP:</span> <span>₹{totalMrp.toFixed(2)}</span></div>
                    <div className="flex justify-between text-green-400"><span className="text-white/80">Total Discount:</span> <span>-₹{totalDiscount.toFixed(2)}</span></div>
                    <Separator className="bg-white/20 my-1"/>
                    <div className="flex justify-between"><span className="text-white/80">Product Price:</span> <span>₹{totalProductPrice.toFixed(2)}</span></div>
                    <div className="flex justify-between items-start">
                        <span className="text-white/80">Flavours &amp; Fillings:</span>
                        <span>+₹{totalFlavoursCost.toFixed(2)}</span>
                    </div>
                     {totalFlavoursCost > 0 && (
                        <div className="pl-4 text-xs space-y-1 text-white/70">
                            {order.items.map(item => {
                                const selectedFlavoursCount = item.flavours?.length || 0;
                                if (!item.numberOfChocolates || selectedFlavoursCount === 0) return null;

                                const baseCount = Math.floor(item.numberOfChocolates / selectedFlavoursCount);
                                const remainder = item.numberOfChocolates % selectedFlavoursCount;

                                return item.flavours?.map((flavour, idx) => {
                                    if (flavour.price > 0) {
                                        const pieces = baseCount + (idx < remainder ? 1 : 0);
                                        const flavourTotal = flavour.price * pieces * item.quantity;
                                        return (
                                            <div key={`${item.name}-${flavour.name}`} className="flex justify-between items-center">
                                                <span>{item.quantity}x {flavour.name} ({pieces} pcs)</span>
                                                <span>+₹{flavourTotal.toFixed(2)}</span>
                                            </div>
                                        );
                                    }
                                    return null;
                                });
                            })}
                        </div>
                    )}
                    <Separator className="bg-white/20 my-1"/>
                    <div className="flex justify-between font-bold"><span className="text-white/80">Subtotal:</span> <span>₹{subtotal.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span className="text-white/80">GST ({order.gstPercentage}%):</span> <span>+₹{gstAmount.toFixed(2)}</span></div>
                    <Separator className="bg-white/20 my-1"/>
                    <div className="flex justify-between font-bold text-base"><span className="text-custom-gold">Total Payable:</span> <span className="text-custom-gold">₹{totalPayable.toFixed(2)}</span></div>
                </div>
            </div>
        </div>
      );
    }
    
    return (
        <div className="grid grid-cols-2 h-full text-white">
            {/* Left Column (Scrollable) */}
            <div className="col-span-1 flex flex-col h-full min-h-0">
                <ScrollArea className="flex-grow min-h-0">
                    <div className="space-y-3 px-6 py-4">
                        {order.items.map((item, index) => {
                            return (
                                <div key={`${item.name}-${index}`} className="cursor-pointer">
                                    <OrderConfirmedItemCard item={item} isMobile={false} />
                                </div>
                            );
                        })}
                    </div>
                </ScrollArea>
            </div>

            {/* Right Column (Fixed) */}
            <div className="col-span-1 border-l border-white/20 flex flex-col h-full min-h-0">
                <ScrollArea className="flex-grow min-h-0">
                    <div className="p-6 space-y-6">
                        <div className="space-y-4">
                            <DetailRow icon={<Hash size={16} />} label="Order ID" value={order.customOrderId} onCopy={() => handleCopyToClipboard(order.customOrderId)} />
                            <DetailRow icon={<Calendar size={16} />} label="Date & Time" value={`${formattedDate} at ${formattedTime}`} />
                        </div>

                        <Separator className="bg-white/20" />

                        <div>
                            <h4 className="font-bold mb-3 text-lg">Order Status</h4>
                            <div className="flex items-center font-plex-sans w-full">
                                <TimelineNode isCompleted={currentStatusIndex >= 0} isCurrent={currentStatusIndex === 0} status={order.status} isCancelled={isCancelled}>Order<br />Requested</TimelineNode>
                                <TimelineConnector isCompleted={currentStatusIndex >= 1} isCancelled={isCancelled} />
                                <TimelineNode isCompleted={currentStatusIndex >= 1} isCurrent={currentStatusIndex === 1} status={order.status} isCancelled={isCancelled}>In<br />Progress</TimelineNode>
                                <TimelineConnector isCompleted={currentStatusIndex >= 2} isCancelled={isCancelled} />
                                <TimelineNode isCompleted={currentStatusIndex >= 2} isCurrent={currentStatusIndex === 2} status={order.status} isCancelled={isCancelled}>Order<br />Delivered</TimelineNode>
                            </div>
                             {isCancelled && <p className="text-red-400 font-semibold mt-4 text-sm text-center">This order has been cancelled.</p>}
                        </div>

                        <Separator className="bg-white/20" />

                        <div>
                            <h4 className="font-bold mb-2 text-lg">Bill Details</h4>
                            <div className="space-y-1.5 bg-white/5 p-3 rounded-lg text-sm">
                                <div className="flex justify-between"><span className="text-white/80">Total MRP:</span> <span>₹{totalMrp.toFixed(2)}</span></div>
                                <div className="flex justify-between text-green-400"><span className="text-white/80">Total Discount:</span> <span>-₹{totalDiscount.toFixed(2)}</span></div>
                                <Separator className="bg-white/20 my-1"/>
                                <div className="flex justify-between"><span className="text-white/80">Product Price:</span> <span>₹{totalProductPrice.toFixed(2)}</span></div>
                                <div className="flex justify-between items-start">
                                    <span className="text-white/80">Flavours &amp; Fillings:</span>
                                    <span>+₹{totalFlavoursCost.toFixed(2)}</span>
                                </div>
                                {totalFlavoursCost > 0 && (
                                    <div className="pl-4 text-xs space-y-1 text-white/70">
                                        {order.items.map(item => {
                                            const selectedFlavoursCount = item.flavours?.length || 0;
                                            if (!item.numberOfChocolates || selectedFlavoursCount === 0) return null;

                                            const baseCount = Math.floor(item.numberOfChocolates / selectedFlavoursCount);
                                            const remainder = item.numberOfChocolates % selectedFlavoursCount;

                                            return item.flavours?.map((flavour, idx) => {
                                                if (flavour.price > 0) {
                                                    const pieces = baseCount + (idx < remainder ? 1 : 0);
                                                    const flavourTotal = flavour.price * pieces * item.quantity;
                                                    return (
                                                        <div key={`${item.name}-${flavour.name}`} className="flex justify-between items-center">
                                                            <span>{item.quantity}x {flavour.name} ({pieces} pcs)</span>
                                                            <span>+₹{flavourTotal.toFixed(2)}</span>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            });
                                        })}
                                    </div>
                                )}
                                <Separator className="bg-white/20 my-1"/>
                                <div className="flex justify-between font-bold"><span className="text-white/80">Subtotal:</span> <span>₹{subtotal.toFixed(2)}</span></div>
                                <div className="flex justify-between"><span className="text-white/80">GST ({order.gstPercentage}%):</span> <span>+₹{gstAmount.toFixed(2)}</span></div>
                                <Separator className="bg-white/20 my-1"/>
                                <div className="flex justify-between font-bold text-base"><span className="text-custom-gold">Total Payable:</span> <span className="text-custom-gold">₹{totalPayable.toFixed(2)}</span></div>
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
};


export function OrderDetailsPopup({ order, open, onOpenChange }: OrderDetailsPopupProps) {
  const isMobile = useIsMobile();

  if (!order) return null;

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="bg-custom-purple-dark text-white border-t-2 border-custom-gold rounded-t-3xl h-[90vh] p-0 flex flex-col">
          <SheetHeader className="p-4 border-b border-white/20 text-center relative flex-shrink-0">
            <SheetTitle className="text-white text-lg">Order Details</SheetTitle>
            <SheetDescriptionComponent className="sr-only">
              A dialog showing the details of the selected order, including items, and bill breakdown.
            </SheetDescriptionComponent>
          </SheetHeader>
          <div className="flex-grow overflow-y-auto">
            <OrderDetailsContent order={order} />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 h-[85vh] w-full max-w-4xl bg-custom-purple-dark border-2 border-custom-gold rounded-2xl md:rounded-[30px] overflow-hidden flex flex-col">
          <DialogHeader className="p-4 text-center border-b border-white/20 flex-shrink-0">
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription className="sr-only">
                Detailed view of the selected order.
            </DialogDescription>
          </DialogHeader>
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground text-white z-10">
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </DialogClose>
          <div className="flex-grow min-h-0">
            <OrderDetailsContent order={order} />
          </div>
      </DialogContent>
    </Dialog>
  )
}
