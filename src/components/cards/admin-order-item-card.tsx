
// @/components/admin-order-item-card.tsx
'use client';

import type { Order } from '@/types';
import { cn } from '@/lib/utils';
import { Badge } from "@/components/ui/badge";
import { Star } from 'lucide-react';
import { useAppContext } from '@/context/app-context';

interface AdminOrderItemCardProps {
    order: Order;
    onClick: () => void;
}

export function AdminOrderItemCard({ order: initialOrder, onClick }: AdminOrderItemCardProps) {
    const { allOrders } = useAppContext();

    // Find the latest version of the order from the global state
    const order = allOrders.find(o => o.id === initialOrder.id) || initialOrder;

    const orderDate = new Date(order.date);
    const formattedDate = orderDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
    
    const statusVariant = (status: Order['status']): "success" | "destructive" | "default" | "info" => {
        switch (status) {
            case 'Order Delivered': return 'success';
            case 'Order Cancelled': return 'destructive';
            case 'In Progress': return 'info';
            default: return 'default';
        }
    };

    return (
        <div 
            onClick={onClick}
            className={cn(
                "w-full bg-white/10 p-4 text-white relative overflow-hidden rounded-2xl border border-white/20 hover:bg-white/20 transition-colors cursor-pointer"
            )}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                {/* Customer & Order Info */}
                <div className="md:col-span-1">
                    <p className="font-bold text-base truncate">{order.customerName}</p>
                    <p className="text-xs text-white/70">ID: {order.customOrderId}</p>
                    <p className="text-xs text-white/70">{formattedDate}</p>
                </div>

                {/* Items Summary */}
                <div className="md:col-span-2">
                    <div className="max-h-20 overflow-y-auto custom-scrollbar pr-2">
                        {order.items.map(item => (
                            <div key={item.name} className="text-sm text-white/90">
                                <span className="font-semibold">{item.quantity}x</span> {item.name}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Total & Status */}
                <div className="md:col-span-1 flex md:flex-col justify-between items-center md:items-end gap-2">
                    <p className="font-bold text-lg">₹{order.total.toFixed(2)}</p>
                    <div className="flex items-center font-plex-sans gap-2">
                        {order.rating && (
                            <div className="flex items-center gap-1 text-custom-gold bg-black/20 px-2 py-1 rounded-full">
                                <Star className="h-3 w-3 fill-current" />
                                <span className="text-xs font-bold">{order.rating}</span>
                            </div>
                        )}
                        <Badge 
                          variant={statusVariant(order.status)} 
                          className={cn(
                            "text-xs", 
                            order.status === 'Order Requested' && 'text-custom-purple-dark'
                          )}
                        >
                            {order.status}
                        </Badge>
                    </div>
                </div>
            </div>
        </div>
    )
}
