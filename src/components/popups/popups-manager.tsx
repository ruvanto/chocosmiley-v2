
// @/components/popups/popups-manager.tsx
'use client';

import { CartPopup } from '@/components/cart-popup';
import { ProfilePopup } from '@/components/profile-popup';
import type { SanityProduct } from '@/types';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/app-context';
import { LoginPopup } from '../login-popup';
import { SignUpPopup } from '../signup-popup';
import { CompleteDetailsPopup } from '../provide-details-popup';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { ForgotPasswordPopup } from '../forgot-password-popup';
import { motion, AnimatePresence } from 'framer-motion';

interface PopupsManagerProps {
  isProfileOpen: boolean;
  setIsProfileOpen: (isOpen: boolean) => void;
  isCartOpen?: boolean;
  onToggleCartPopup?: () => void;
  isEnquireOpen?: boolean;
}

export function PopupsManager({
  isProfileOpen,
  setIsProfileOpen,
  isCartOpen = false,
  onToggleCartPopup = () => {},
  isEnquireOpen = false,
}: PopupsManagerProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { 
    cart, 
    addOrder, 
    authPopup, 
    setAuthPopup, 
    isAuthenticated, 
    profileInfo, 
    updateProfileInfo, 
    setIsProcessingOrder, 
    logout,
    clearCart,
  } = useAppContext();
  

  const isAnyPopupVisible = isCartOpen || isProfileOpen || !!authPopup || isEnquireOpen;

  const handleFinalizeOrder = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to finalize your order.",
        action: <ToastAction altText="Login" onClick={() => setAuthPopup('login')}>Login</ToastAction>,
      });
      return;
    }
    if (!profileInfo.name || !profileInfo.phone || !profileInfo.address) {
        toast({
            title: "Profile Incomplete",
            description: "Please complete your profile before placing an order.",
            action: (
                <ToastAction altText="Complete Profile" onClick={() => {
                  onToggleCartPopup();
                  setIsProfileOpen(true);
                }}>
                    Complete Profile
                </ToastAction>
            ),
        });
        return;
    }
    if (!cart || Object.keys(cart).length === 0) {
        toast({ title: "Your cart is empty!", variant: "destructive" });
        return;
    }

    setIsProcessingOrder(true);
    const newOrderId = await addOrder(cart);

    if (newOrderId) {
      clearCart();
      onToggleCartPopup(); // Close the cart popup
      router.push(`/order-confirmed?orderId=${newOrderId}`);
    } else {
      setIsProcessingOrder(false); // Make sure to stop processing on failure
    }
  };

  const handleProductClick = (product: SanityProduct) => {
    onToggleCartPopup();
    router.push(`/product/${product.slug.current}`);
  }

  const handleDetailsConfirm = (name: string, phone: string, address: string) => {
    updateProfileInfo({ name, phone, address });
    setAuthPopup(null);
  };

  const cartPopupVariants = {
    hidden: { y: "100%", opacity: 0 },
    visible: { y: "0%", opacity: 1 },
    exit: { y: "100%", opacity: 0 },
  };

  return (
    <>
        {isAnyPopupVisible && <div className="fixed inset-0 z-[50] bg-black/50" />}
      
       <AnimatePresence>
        {isCartOpen && (
          <motion.div
            variants={cartPopupVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
            className={cn("fixed inset-x-0 bottom-0 z-[50] h-[82vh]")}
          >
            <div className="h-full relative w-[80vw] left-1/2 -translate-x-1/2">
              <CartPopup
                onClose={onToggleCartPopup}
                onFinalizeOrder={handleFinalizeOrder}
                onProductClick={handleProductClick}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isProfileOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center">
            <ProfilePopup
              onClose={() => setIsProfileOpen(false)}
              onLogout={logout}
            />
          </div>
      )}

      <LoginPopup 
        open={authPopup === 'login'} 
        onOpenChange={(open) => {
            if (!open) {
                setAuthPopup(null);
            }
        }}
        onSignUpClick={() => setAuthPopup('signup')}
        onForgotPasswordClick={() => setAuthPopup('forgotPassword')}
      />
      <SignUpPopup
        open={authPopup === 'signup'}
        onOpenChange={(open) => {
            if (!open) {
                setAuthPopup(null);
            }
        }}
        onLoginClick={() => setAuthPopup('login')}
      />
      <ForgotPasswordPopup
        open={authPopup === 'forgotPassword'}
        onOpenChange={(open) => !open && setAuthPopup(null)}
        onLoginClick={() => setAuthPopup('login')}
        isAuthenticated={isAuthenticated}
      />
      <CompleteDetailsPopup
        open={authPopup === 'completeDetails'}
        onOpenChange={(open) => !open && setAuthPopup(null)}
        onConfirm={handleDetailsConfirm}
      />
    </>
  );
}
