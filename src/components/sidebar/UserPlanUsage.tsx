"use client";

import { Subscription } from '@/lib/supabase/schema-type'
import React, { FC, useEffect, useState } from 'react'
import CypressDiamondIcon from "../icons/cypressDiamondIcon"
import { MAX_FOLDERS_FREE_PLAN } from "@/lib/constants"
import { useAppState } from '@/lib/providers/state-providers';
import { Progress } from '../ui/progress';
interface UserPlanUsageProps {
    subscription: Subscription | null
    numberOfFolder: number
}
const UserPlanUsage: FC<UserPlanUsageProps> = ({ subscription, numberOfFolder }) => {
    const { state, workspaceId } = useAppState();
    const [folderLength, setFolderLength] = useState(numberOfFolder);
    const planPercentage = (folderLength / MAX_FOLDERS_FREE_PLAN) * 100;

    useEffect(() => {
        const stateFoldersLength = state.workspaces.find((workspace) => workspace.id === workspaceId)?.folders.length;
        if (stateFoldersLength === undefined) return;
        setFolderLength((stateFoldersLength));
    }, [state, workspaceId]);

    return (
        <article className="mb-4">
            {subscription?.status !== 'active' && (
                <div className="flex gap-2text-muted-foreground mb-2 items-center">
                    <div className="h-4 w-4">
                        <CypressDiamondIcon />
                    </div>
                    <div className="flex justify-between w-full items-center"
                    >
                        <div>Free Plan</div>
                        <small>{planPercentage.toFixed(0)}% / 100%</small>
                    </div>
                </div>
            )}
            {subscription?.status !== 'active' && (
                <Progress
                    value={planPercentage}
                    className="h-1"
                />
            )}
        </article>
    )
}

export default UserPlanUsage;