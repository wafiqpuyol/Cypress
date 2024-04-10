"use client";

import { Dispatch, FC, ReactNode, SetStateAction, createContext, useContext, useState } from "react";
import { ProductWithPrice } from "@/lib/supabase/schema-type"
import SubscriptionModal from "@/components/global/SubscriptionModal";


interface SubscriptionModalContextInterface {
    subscriptionModalOpen: boolean;
    setSubscriptionModalOpen: Dispatch<SetStateAction<boolean>>
}

/* Create context for SubscriptionModalProvider */
const SubscriptionModalContext = createContext<SubscriptionModalContextInterface>({
    subscriptionModalOpen: false,
    setSubscriptionModalOpen: () => { }
});

interface SubscriptionModalProviderProps {
    children: ReactNode;
    activeProducts: ProductWithPrice[] | []
    productError: any
}

export const SubscriptionModalProvider: FC<SubscriptionModalProviderProps> = ({ children, activeProducts, productError }) => {
    const [subscriptionModalOpen, setSubscriptionModalOpen] = useState<boolean>(false);
    if (productError !== null) console.error(productError);

    return <SubscriptionModalContext.Provider value={{ subscriptionModalOpen, setSubscriptionModalOpen }}>
        {children}
        <SubscriptionModal activeProducts={activeProducts} />
    </SubscriptionModalContext.Provider >
}

export const useSubscriptionModal = () => {
    return useContext(SubscriptionModalContext);
}