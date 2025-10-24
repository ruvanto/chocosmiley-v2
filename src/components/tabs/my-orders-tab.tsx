
// @/components/my-orders-tab.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MyOrdersCard } from '../cards/my-orders-card';
import { EmptyState } from '../empty-state';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/app-context';
import { Loader } from '../loaders/loader';
import { OrderDetailsPopup } from '../popups/order-details-popup';
import { RatingPopup } from '../popups/rating-popup';
import type { Order } from '@/types';
import { CancellationFeedbackPopup } from '../popups/cancellation-feedback-popup';
import { OrderItemCardSkeleton } from '../skeletons/order-item-card-skeleton';
import { cn } from '@/lib/utils';

interface MyOrdersTabProps {
  isMobile?: boolean;
}

export function MyOrdersTab({ isMobile = false }: MyOrdersTabProps) {
    const { orders, isOrdersLoaded, reorder, isAuthenticated, loadMoreUserOrders, hasMoreUserOrders, setIsGlobalLoading, updateOrderStatus } = useAppContext();
    const router = useRouter();
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [ratingOrder, setRatingOrder] = useState<Order | null>(null);
    const [cancellationOrder, setCancellationOrder] = useState<Order | null>(null);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    
    if (!isOrdersLoaded) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <Loader />
            </div>
        )
    }

    // This is the ref that we will attach to our skeleton element
    const loaderRef = useRef<HTMLDivElement>(null);

    // This is the function that will be called when the skeleton is visible
    const handleLoadMore = useCallback(async () => {
      if (isFetchingMore || !hasMoreUserOrders) return;
      
      setIsFetchingMore(true);

      await loadMoreUserOrders();
      setIsFetchingMore(false);
    }, [isFetchingMore, hasMoreUserOrders, loadMoreUserOrders]);

    // This useEffect sets up the IntersectionObserver
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const firstEntry = entries[0];
                // If the skeleton is visible on screen, call the function
                if (firstEntry.isIntersecting) {
                    handleLoadMore();
                }
            },
            { threshold: 0.5 } // Trigger even when 50% of the skeleton is visible
        );

        const currentLoader = loaderRef.current;
        if (currentLoader) {
            observer.observe(currentLoader);
        }

        // Cleanup function to disconnect the observer
        return () => {
            if (currentLoader) {
                observer.disconnect();
            }
        };
    }, [handleLoadMore]);


       
    const handleExplore = () => {
      setIsGlobalLoading(true);
      router.push('/');
    }
    
    const handleCancelOrder = async (order: Order) => {
      if (order.uid && order.id) {
        await updateOrderStatus(order.uid, order.id, 'Order Cancelled', 'user');
        setCancellationOrder(order);
      }
    };
    
    if (!isAuthenticated) {
       return (
            <div className="flex-grow flex flex-col items-center justify-center h-full text-center gap-4 px-4 pt-24">
                <EmptyState
                  imageUrl="/icons/empty.png"
                  title="Log In to See Your Orders"
                  description="Your past orders will appear here once you log in."
                />
            </div>
       )
    }

    if (isMobile) {
        return (
            <>
                <div className={cn("flex flex-col", orders.length > 0 ? "min-h-screen" : "h-full" ,"text-white px-4 pb-4")}>
                     {orders.length > 0 ? (
                        <div className="bg-transparent flex flex-col overflow-y-auto no-scrollbar pt-4">
                            <div className="space-y-4">
                                {orders.map((order) => (
                                    <MyOrdersCard 
                                        key={order.id} 
                                        order={order} 
                                        isMobile={true} 
                                        onClick={() => setSelectedOrder(order)}
                                        onRate={() => setRatingOrder(order)}
                                        onCancel={() => handleCancelOrder(order)}
                                        onReorder={() => reorder(order.id)}
                                    />
                                ))}
                                {hasMoreUserOrders && (
                                    <div ref={loaderRef} className='flex flex-col items-center justify-center gap-3'>
                                        <OrderItemCardSkeleton isMobile={true}/>
                                        <p>Loading More...</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex-grow flex items-center justify-center h-full pt-24">
                            <EmptyState
                              imageUrl="/icons/empty.png"
                              title="You Haven't Ordered Yet"
                              description="Your next sweet moment is just a click away!"
                              buttonText="Explore Now"
                              onButtonClick={handleExplore}
                            />
                        </div>
                    )}
                     {orders.length > 0 && <div className="h-16 flex-shrink-0" />}
                </div>
                 <OrderDetailsPopup
                    order={selectedOrder}
                    open={!!selectedOrder}
                    onOpenChange={(isOpen) => { if (!isOpen) setSelectedOrder(null); }}
                />
                <RatingPopup
                    order={ratingOrder}
                    open={!!ratingOrder}
                    onOpenChange={(isOpen) => { if (!isOpen) setRatingOrder(null); }}
                />
                <CancellationFeedbackPopup
                    order={cancellationOrder}
                    open={!!cancellationOrder}
                    onOpenChange={(isOpen) => { if (!isOpen) setCancellationOrder(null); }}
                />
            </>
        )
    }

    return (
        <>
            <div className="p-8 text-white h-full flex flex-col relative pb-0">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-3xl font-normal font-poppins self-start">My Orders</h2>
                </div>
                 {orders.length > 0 ? (
                    <div className="flex-grow overflow-y-auto pr-2 no-scrollbar space-y-4 pb-4">
                        <div className="space-y-4">
                            {orders.map(order => (
                                <MyOrdersCard 
                                    key={order.id} 
                                    order={order} 
                                    onClick={() => setSelectedOrder(order)} 
                                    onRate={() => setRatingOrder(order)} 
                                    onCancel={() => handleCancelOrder(order)}
                                    onReorder={() => reorder(order.id)}
                                />
                            ))}
                            {hasMoreUserOrders && (
                              <div ref={loaderRef}>
                                <OrderItemCardSkeleton />
                              </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex-grow flex flex-col items-center justify-center h-full text-center gap-4">
                       <EmptyState
                          imageUrl="/icons/empty.png"
                          title="You Haven't Ordered Yet"
                          description="Your next sweet moment is just a click away!"
                          buttonText="Explore Now"
                          onButtonClick={handleExplore}
                        />
                    </div>
                 )}
            </div>
             <OrderDetailsPopup
                order={selectedOrder}
                open={!!selectedOrder}
                onOpenChange={(isOpen) => { if (!isOpen) setSelectedOrder(null); }}
            />
            <RatingPopup
                order={ratingOrder}
                open={!!ratingOrder}
                onOpenChange={(isOpen) => { if (!isOpen) setRatingOrder(null); }}
            />
            <CancellationFeedbackPopup
                order={cancellationOrder}
                open={!!cancellationOrder}
                onOpenChange={(isOpen) => { if (!isOpen) setCancellationOrder(null); }}
            />
        </>
    );
}
