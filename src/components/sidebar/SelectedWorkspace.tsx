'use client';

import { Workspace } from '@/lib/supabase/schema-type';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

interface SelectedWorkspaceProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    workspace: Workspace;
}

const SelectedWorkspace: React.FC<SelectedWorkspaceProps> = ({
    workspace,
    ...props
}) => {
    const supabase = createClientComponentClient();
    const [workspaceLogo, setWorkspaceLogo] = useState('/cypresslogo.svg');

    useEffect(() => {
        if (workspace.logo) {
            const { data } = supabase
                .storage
                .from('workspace-logos')
                .getPublicUrl(workspace.logo);
            setWorkspaceLogo(data.publicUrl);
        }
    }, [supabase.storage, workspace]);

    return (
        <Link
            className="flex rounded-md hover:bg-muted transition-all flex-row p-2 gap-4 justify-center cursor-pointer items-center my-2"
            href={`/dashboard/${workspace.id}`}
            {...props}
        >
            <Image
                src={workspaceLogo}
                alt="workspace logo"
                width={26}
                height={26}
                objectFit="cover"
            />
            <div className="flex flex-col">
                <p className="text-lg w-[170px] overflow-hidden overflow-ellipsis whitespace-nowrap">
                    {workspace.title}
                </p>
            </div>
        </Link>
    );
};

export default SelectedWorkspace;