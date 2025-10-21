
// @/app/order-confirmed/order-confirmed-client-page.tsx
'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Lottie from 'lottie-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Footer } from '@/components/footer';
import { StaticSparkleBackground } from '@/components/static-sparkle-background';
import { SparkleBackground } from '@/components/sparkle-background';
import { Loader } from '@/components/loader';
import { useAppContext } from '@/context/app-context';
import type { SanityProduct, Order, ActiveView } from '@/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Phone, Copy } from 'lucide-react';
import { SiWhatsapp } from "react-icons/si";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { OrderConfirmedSummary } from '@/components/order-confirmed-summary';
import CheckmarkAnimation from '../../../public/animations/Checkmark.json';
import { Header } from '@/components/header';
import { BottomNavbar } from '@/components/bottom-navbar';
import { PopupsManager } from '@/components/popups/popups-manager';
import { OrderBackDialog } from '@/components/order-back-dialog';
import { useToast } from '@/hooks/use-toast';
import { client } from '@/lib/sanity';


async function getProductsForOrder(order: Order): Promise<SanityProduct[]> {
    if (!order || order.items.length === 0) return [];
    const productNames = order.items.map(item => item.name);
    const query = `*[_type == "product" && name in $productNames]{
        _id, name, slug, "images": images[].asset->url
    }`;
    const products = await client.fetch(query, { productNames });
    return products;
}

const TimelineNode = ({ isCompleted, isCurrent, children }: { isCompleted: boolean, isCurrent: boolean, children: React.ReactNode }) => (
  <div className="flex flex-col items-center">
    <div
      className={cn(
        'w-6 h-6 md:w-8 md:h-8 rounded-full border-2 flex items-center justify-center transition-all duration-500',
        isCompleted ? 'bg-custom-gold border-custom-gold' : 'bg-transparent border-white/50',
        isCurrent && 'animate-pulse'
      )}
    >
      {isCompleted && <div className="w-2 h-2 md:w-3 md:h-3 bg-custom-purple-dark rounded-full"></div>}
    </div>
    <p className={cn('text-xs md:text-sm mt-2 text-center', isCompleted || isCurrent ? 'text-white font-semibold' : 'text-white/60')}>
      {children}
    </p>
  </div>
);

const TimelineConnector = ({ isCompleted }: { isCompleted: boolean }) => (
  <div className="flex-1 h-0.5 transition-all duration-500" style={{ background: isCompleted ? 'hsl(var(--primary))' : 'hsla(0, 0%, 100%, 0.3)' }} />
);

function OrderConfirmedPageComponent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { orders, cart, setIsGlobalLoading, setIsProcessingOrder } = useAppContext();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [orderedProducts, setOrderedProducts] = useState<SanityProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEnquireOpen, setIsEnquireOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [isBackDialogOpen, setIsBackDialogOpen] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);


  useEffect(() => {
    setIsGlobalLoading(false);
    setIsProcessingOrder(false);

    const orderId = searchParams.get('orderId');
    if (!orderId) {
      router.replace('/');
      return;
    }
  
    const loadOrderData = async (foundOrder: Order) => {
        const products = await getProductsForOrder(foundOrder);
        setOrderedProducts(products);
        setIsLoading(false);
    };

    const timeout = setTimeout(() => {
        const foundOrder = orders.find(o => o.id === orderId);
        if (foundOrder) {
            setConfirmedOrder(foundOrder);
            loadOrderData(foundOrder);
        } else {
            console.warn(`Order with ID ${orderId} not found.`);
            const secondTimeout = setTimeout(() => router.replace('/'), 3000);
            return () => clearTimeout(secondTimeout);
        }
    }, 500);

    return () => {
      clearTimeout(timeout);
    };
  
  }, [searchParams, orders, router, setIsGlobalLoading, setIsProcessingOrder]);
  
  const attemptNavigation = (navAction: () => void) => {
    setPendingNavigation(() => navAction);
    setIsBackDialogOpen(true);
  };
  
  const handleConfirmNavigation = () => {
    if (pendingNavigation) {
      setIsGlobalLoading(true);
      pendingNavigation();
    }
    setIsBackDialogOpen(false);
    setPendingNavigation(null);
  };

  const handleNavigation = (view: ActiveView) => {
    const newPath = view === 'home' ? '/' : `/${view}`;
    if (pathname === newPath) return;
    attemptNavigation(() => router.replace(newPath));
  };
  
  const handleLogoClick = () => {
    if (pathname === '/') return;
    setIsGlobalLoading(true);
    router.replace('/');
  };

  const handleContinueShopping = () => {
    if (pathname === '/') return;
    attemptNavigation(() => router.replace('/'));
  };
  
  const handleSearchSubmit = (query: string) => {
    attemptNavigation(() => router.replace(`/search?q=${encodeURIComponent(query)}`));
  };

  const handleHeaderNavigate = (view: 'about' | 'faq' | 'admin' | 'admin-analytics') => {
    const newPath = `/${view}`;
    if (pathname === newPath) return;
    attemptNavigation(() => router.replace(newPath));
  }
  
  const cartItemCount = Object.values(cart).reduce((acc, item) => acc + item.quantity, 0);

  const statusSteps = ['Order Requested', 'In Progress', 'Order Delivered'];
  const currentStatusIndex = confirmedOrder ? statusSteps.indexOf(confirmedOrder.status) : -1;
  const isCancelled = confirmedOrder?.status === 'Order Cancelled';

  const generateWhatsAppMessage = (order: Order) => {
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

  const whatsAppUrl = confirmedOrder
    ? `https://api.whatsapp.com/send?phone=917411414007&text=${generateWhatsAppMessage(confirmedOrder)}`
    : `https://api.whatsapp.com/send?phone=917411414007`;
    
  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied to clipboard!",
        description: `Order ID: ${text}`,
        variant: 'success',
      });
    });
  };


  if (isLoading || !confirmedOrder) {
    return (
        <div className="flex flex-col h-screen w-screen bg-background">
            {isMobile ? <StaticSparkleBackground /> : <SparkleBackground />}
            <main className="flex-grow flex flex-col justify-center items-center">
                <Loader />
            </main>
        </div>
    );
  }

  return (
    <>
      <div className="flex flex-col min-h-screen bg-background text-white">
        {isMobile ? <StaticSparkleBackground /> : <SparkleBackground />}
        <Header 
          onProfileOpenChange={setIsProfileOpen}
          isContentScrolled={true}
          onReset={handleLogoClick}
          onNavigate={handleHeaderNavigate}
          activeView={'order-confirmed'}
          onSearchSubmit={handleSearchSubmit}
          searchInput={searchInput}
          onSearchInputChange={setSearchInput}
          isEnquireOpen={isEnquireOpen}
          onEnquireOpenChange={setIsEnquireOpen}
        />
        <main className="flex-grow flex flex-col items-center justify-center px-6 pt-24 pb-16 md:pt-32">
          <motion.div 
            className="w-full max-w-2xl mx-auto flex flex-col items-center gap-4 md:gap-6 text-center"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.2, delayChildren: 0.1 }
              }
            }}
          >
            <motion.div variants={{ hidden: { scale: 0.5, opacity: 0 }, visible: { scale: 1, opacity: 1 } }} className="w-32 h-32 md:w-40 md:h-40">
              <Lottie animationData={CheckmarkAnimation} loop={false} />
            </motion.div>

            <motion.h1 variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }} className="text-4xl md:text-5xl font-bold text-custom-gold font-plex-sans">Thank You!</motion.h1>
            
            <motion.p variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }} className="text-base md:text-lg text-white/80">Your order request has been received.</motion.p>
            
            <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }} className="bg-white/10 rounded-full px-4 py-1.5 text-sm flex items-center gap-2">
              <span>Order ID: <span className="font-bold">{confirmedOrder.customOrderId}</span></span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-white/70 hover:text-white hover:bg-white/20"
                onClick={() => handleCopyToClipboard(confirmedOrder.customOrderId)}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </motion.div>

            <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }} className="w-full max-w-lg mt-4">
              <div className="flex items-center w-full">
                <TimelineNode isCompleted={currentStatusIndex >= 0} isCurrent={currentStatusIndex === 0}>Order<br/>Requested</TimelineNode>
                <TimelineConnector isCompleted={currentStatusIndex >= 1} />
                <TimelineNode isCompleted={currentStatusIndex >= 1} isCurrent={currentStatusIndex === 1}>In<br/>Progress</TimelineNode>
                <TimelineConnector isCompleted={currentStatusIndex >= 2} />
                <TimelineNode isCompleted={currentStatusIndex >= 2} isCurrent={currentStatusIndex === 2}>Order<br/>Delivered</TimelineNode>
              </div>
               {isCancelled && (
                <p className="text-red-400 font-semibold mt-4 text-sm">This order has been cancelled.</p>
              )}
            </motion.div>

            <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }} className="mt-4 md:mt-6 bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6 w-full max-w-lg">
              <p className="font-semibold text-sm md:text-base max-w-md mx-auto text-white/90">
              You’re one step away from chocolate happiness! Just contact us to confirm the final details.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-3 mt-4 w-full justify-center">
                <Button asChild variant="outline" className="h-auto w-full sm:w-auto py-2 px-6 text-sm md:text-base text-white border-white/50 bg-transparent hover:bg-white/10 hover:text-white rounded-full font-plex-sans shadow-lg">
                  <a href="tel:+917411414007">
                    <span className="flex items-center gap-2"><Phone className="h-4 w-4" /> Call Us</span>
                  </a>
                </Button>
                <Button asChild className="h-auto w-full sm:w-auto py-2 px-6 text-sm md:text-base bg-white hover:bg-gray-200 text-custom-purple-dark rounded-full font-plex-sans shadow-lg font-semibold">
                  <a href={whatsAppUrl} target="_blank" rel="noopener noreferrer">
                    <span className="flex items-center gap-2"><SiWhatsapp className="h-5 w-5" /> Whatsapp</span>
                  </a>
                </Button>
              </div>
            </motion.div>

            <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }} className="w-full max-w-lg mt-2">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1" className="border-none">
                  <AccordionTrigger className="w-full bg-white/10 hover:bg-white/20 text-white hover:no-underline rounded-xl px-4 py-3 font-semibold text-base">
                    View Your Order Summary
                  </AccordionTrigger>
                  <AccordionContent className="mt-2">
                    <OrderConfirmedSummary 
                      order={confirmedOrder}
                      products={orderedProducts}
                      isMobile={isMobile ?? false}
                    />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </motion.div>
            
            <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }} className="mt-6">
              <Button onClick={handleContinueShopping} className="bg-custom-gold text-custom-purple-dark hover:bg-custom-gold/90 rounded-full px-8 font-bold text-base h-11">
                Continue Shopping
              </Button>
            </motion.div>

          </motion.div>
        </main>
        <Footer />
        <div className="h-16 flex-shrink-0 md:hidden" />
      </div>
      <BottomNavbar activeView={'order-confirmed'} onNavigate={handleNavigation} cartItemCount={cartItemCount} />
      <PopupsManager 
        isProfileOpen={isProfileOpen}
        setIsProfileOpen={setIsProfileOpen}
        isEnquireOpen={isEnquireOpen}
      />
      <OrderBackDialog
        open={isBackDialogOpen}
        onClose={() => setIsBackDialogOpen(false)}
        onConfirm={handleConfirmNavigation} order={confirmedOrder}      />
    </>
  );
}

export default function OrderConfirmedClientPage() {
    return (
        <Suspense fallback={null}>
            <OrderConfirmedPageComponent />
        </Suspense>
    )
}
