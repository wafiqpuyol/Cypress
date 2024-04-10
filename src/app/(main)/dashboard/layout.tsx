import { ReactNode } from 'react';
import { SubscriptionModalProvider } from '@/lib/providers/subscription-modal-provider';
import { getActiveProductsWithPrice } from '@/lib/supabase/queries';
import { ProductWithPrice } from "@/lib/supabase/schema-type";

const DashboardLayout = async ({ children }: { children: ReactNode }) => {
    let productError: any;
    let activeProductsWithPrice: ProductWithPrice[] | [] = [];
    try {
        const { data, error } = await getActiveProductsWithPrice();
        activeProductsWithPrice = data;
        if (!error) productError = error;
    } catch (error) {
        productError = error
    }

    return (
        <main className='flex overflow-hidden h-screen'>
            <SubscriptionModalProvider activeProducts={activeProductsWithPrice} productError={productError}>
                {children}
            </SubscriptionModalProvider>
        </main>
    )
}

export default DashboardLayout;