import {
    getCollaboratingWorkspaces,
    getFolders,
    getPrivateWorkspaces,
    getSharedWorkspaces,
    userSubscriptionStatus
} from '@/lib/supabase/queries'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { FC } from 'react'
import { twMerge } from 'tailwind-merge'
import { validate } from "uuid"
import WorkspaceDropDown from "./WorkspaceDropDown"
import UserPlanUsage from './UserPlanUsage'

interface SidebarProp {
    params: { workspaceId: string }
    className?: string
}
const Sidebar: FC<SidebarProp> = async ({ params: { workspaceId }, className }) => {
    const cookieStore = cookies();
    const supabase = createServerComponentClient({ cookies: () => cookieStore })
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.id) {
        redirect("/login");
    }

    const isValidWorkspaceId = validate(workspaceId);
    if (!isValidWorkspaceId) throw new Error("Invalid Workspace ID");

    const { data: subscription, error: subscriptionError } = await userSubscriptionStatus(user.id);
    if (subscriptionError) throw new Error("Subscription error: " + subscriptionError);

    const { data: folders, error: folderError } = await getFolders(workspaceId);
    if (folderError) throw new Error("Folder Error: ", folderError);

    const { data: privateWorkspaces, error: privateWorkspaceError } = await getPrivateWorkspaces(user.id);
    if (privateWorkspaceError) throw new Error("Private Workspace Error: ", privateWorkspaceError);

    const { data: sharedWorkspaces, error: sharedWorkspacesError } = await getSharedWorkspaces(user.id);
    if (sharedWorkspacesError) throw new Error("Shared Workspaces Error: ", privateWorkspaceError);

    const { data: collaborativeWorkspaces, error: collaborativeWorkspacesError } = await getCollaboratingWorkspaces(user.id);
    if (collaborativeWorkspacesError) throw new Error("Collaborative Workspaces Error: ", privateWorkspaceError);

    return (
        <aside className={twMerge("hidden sm:flex sm:flex-col w-[280px] shrink-0 p-4 md:gap-4 !justify-between", className)}>
            <div>
                <WorkspaceDropDown
                    collaboratingWorkspaces={collaborativeWorkspaces}
                    privateWorkspaces={privateWorkspaces}
                    sharedWorkspaces={sharedWorkspaces}
                    defaultValue={
                        [...privateWorkspaces, ...sharedWorkspaces, ...collaborativeWorkspaces]
                            .find((workspace) => (workspace.id === workspaceId) && workspace)
                    }
                />
                <UserPlanUsage subscription={subscription} numberOfFolder={folders.length} />
            </div>

        </aside>
    )
}

export default Sidebar;