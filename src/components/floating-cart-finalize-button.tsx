
// @/components/floating-cart-finalize-button.tsx
'use client';

import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import type { Cart } from '@/context/app-context';
import type { SanityProduct } from '@/types';
import { AnimatedNumber } from '../ui/animated-number';

interface FloatingCartFinalizeButtonProps {
    cart: Cart;
    allProducts: SanityProduct[];
    onCheckout: () => void;
    isVisible: boolean;
    isLoading: boolean;
}

export function FloatingCartFinalizeButton({ cart, allProducts, onCheckout, isVisible, isLoading }: FloatingCartFinalizeButtonProps) {
    if (allProducts.length === 0) {
        return null;
    }
    
    const productsByName = allProducts.reduce((acc, product) => {
        acc[product.name] = product;
        return acc;
    }, {} as Record<string, SanityProduct>);
    
    let totalProductPrice = 0;
    let totalFlavoursCost = 0;

    Object.values(cart).forEach(item => {
        const product = productsByName[item.name];
        if (product) {
            totalProductPrice += (product.discountedPrice || 0) * item.quantity;
            
            const selectedFlavoursCount = item.flavours?.length || 0;
            if (selectedFlavoursCount > 0 && product.numberOfChocolates) {
                const baseCount = Math.floor(product.numberOfChocolates / selectedFlavoursCount);
                const remainder = product.numberOfChocolates % selectedFlavoursCount;
                
                let itemFlavourCost = 0;
                (item.flavours || []).forEach((flavourName, index) => {
                    const flavour = product.availableFlavours?.find(f => f.name === flavourName);
                    const pieces = baseCount + (index < remainder ? 1 : 0);
                    itemFlavourCost += (flavour?.price || 0) * pieces;
                });
                totalFlavoursCost += itemFlavourCost * item.quantity;
            }
        }
    });

    const subtotal = totalProductPrice + totalFlavoursCost;
    const gstRate = 0.05;
    const gstAmount = subtotal * gstRate;
    const total = subtotal + gstAmount;

    return (
        <div
            className={cn(
                "fixed bottom-16 left-0 right-0 z-10 transition-all duration-300",
                isVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
            )}
        >
            <div className="border-t border-white/20 bg-custom-purple-dark/80 p-2 px-4 backdrop-blur-md">
                <div className="flex justify-between items-center">
                    <div className="text-white">
                        <p className="text-xs">Total Payable</p>
                        <AnimatedNumber value={total} prefix="₹" className="text-base font-bold" />
                    </div>
                    <Button onClick={onCheckout} className="bg-custom-gold text-custom-purple-dark font-bold hover:bg-custom-gold/90 h-9 text-base rounded-full px-6" isLoading={isLoading}>
                        Finalize Order
                    </Button>
                </div>
            </div>
        </div>
    );
};
