import React from 'react'
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { redirect } from 'next/navigation';
import DashBoardSetup from '@/components/dashboard-setup/DashBoardSetup';
import { findFirstWorkspace, userSubscriptionStatus } from '@/lib/supabase/queries';


const DashBoardPage = async () => {
    // check whether user authenticate or not
    const cookieStore = cookies();
    const supabase = createServerComponentClient({ cookies: () => cookieStore });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect("/login");
    }

    // check whether user has any workspace available or not.
    const { data: workspace, error: workspaceError } = await findFirstWorkspace(user.id);
    if (workspaceError) throw new Error(workspaceError);

    // check whether user has any subscription or not.
    const { data: subscription, error: subscriptionError } = await userSubscriptionStatus(user.id);
    if (subscriptionError) throw new Error(subscriptionError);

    if (!workspace) {
        return (
            <div className='bg-background flex justify-center items-center w-screen h-screen'>
                <DashBoardSetup user={user} subscription={subscription} />
            </div>
        )
    }
    redirect(`/dashboard/${workspace.id}`)
}

export default DashBoardPage;