"use client"

import { AuthUser } from "@supabase/supabase-js";
import { FC, createContext, useContext, useEffect, useState } from "react";
import { Subscription } from "@/lib/supabase/schema-type"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { userSubscriptionStatus } from "@/lib/supabase/queries"
import { toast } from "@/components/ui/use-toast";
interface SupabaseUserContextInterface {
    user: AuthUser | null
    subscription: Subscription | null
}
interface SupabaseUserProviderProps {
    children: React.ReactNode
}

const SupabaseUserContext = createContext<SupabaseUserContextInterface>({
    user: null, subscription: null
})
export const SupabaseUserProvider: FC<SupabaseUserProviderProps> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [subscription, setSubscription] = useState<Subscription | null>(null)
    const supabase = createClientComponentClient();

    useEffect(() => {
        (async () => {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (user) {
                setUser(user);
                const { data: userSubscription, error } = await userSubscriptionStatus(user.id);
                if (userSubscription) {
                    /*@ts-ignore*/
                    setSubscription(userSubscription);
                }
                if (error) {
                    console.log("Supabase-User-Provider", error);
                    toast({
                        title: 'Unexpected Error',
                        description: 'Something went wrong. Try again later.',
                    });
                }
            }
        })()
    }, [supabase.auth]);

    return (<SupabaseUserContext.Provider value={{ user, subscription }}>
        {children}
    </SupabaseUserContext.Provider>)
}

export const useSupabaseUser = () => {
    return useContext(SupabaseUserContext);
}