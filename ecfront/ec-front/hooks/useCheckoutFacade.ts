import { useState } from 'react';
import { useAppDispatch } from '@/lib/hooks';
import { CheckoutFacade, CheckoutRequest, CheckoutResult } from '@/lib/facades/CheckoutFacade';

export const useCheckoutFacade = () => {
    const [isProcessing, setIsProcessing] = useState(false);
    const dispatch = useAppDispatch();
    const checkoutFacade = CheckoutFacade.getInstance();

    const processCheckout = async (request: CheckoutRequest): Promise<CheckoutResult> => {
        setIsProcessing(true);
        try {
            const result = await checkoutFacade.processCheckout(request, dispatch);
            return result;
        } finally {
            setIsProcessing(false);
        }
    };

    const calculateTotal = (subtotal: number, taxRate?: number, shipping?: number): number => {
        return checkoutFacade.calculateTotal(subtotal, taxRate, shipping);
    };

    const formatPrice = (price: number, currency?: string): string => {
        return checkoutFacade.formatPrice(price, currency);
    };

    const getPaymentMethods = async () => {
        return await checkoutFacade.getPaymentMethods();
    };

    return {
        processCheckout,
        calculateTotal,
        formatPrice,
        getPaymentMethods,
        isProcessing
    };
};