"use client"

import { useAppState } from "@/lib/providers/state-providers";
import { Workspace } from "@/lib/supabase/schema-type";
import React, { FC, useEffect, useState } from "react";
import SelectedWorkspace from "./SelectedWorkspace";
import CustomDialogTrigger from "./CustomDialogTrigger";
import WorkspaceCreate from "./WorkspaceCreate";

interface WorkspaceDropDownProps {
    collaboratingWorkspaces: Workspace[] | [];
    privateWorkspaces: Workspace[] | [];
    sharedWorkspaces: Workspace[] | [];
    defaultValue: Workspace | undefined;
}
const WorkspaceDropDown: FC<WorkspaceDropDownProps> = ({
    defaultValue,
    collaboratingWorkspaces,
    privateWorkspaces,
    sharedWorkspaces
}) => {
    const { state, dispatch } = useAppState();
    const [currentWorkspace, setCurrentWorkspace] = useState(defaultValue);
    const [isOpen, setIsOpen] = useState(false);
    const handleClick = (option: Workspace) => {
        setCurrentWorkspace(option);
        setIsOpen(false)
    }

    useEffect(() => {
        if (!state.workspaces.length) {
            dispatch({
                type: 'SET_WORKSPACES',
                payload: {
                    workspaces: [
                        ...privateWorkspaces,
                        ...sharedWorkspaces,
                        ...collaboratingWorkspaces,
                    ].map((workspace) => ({ ...workspace, folders: [] })),
                },
            });
        }
    }, [privateWorkspaces, collaboratingWorkspaces, sharedWorkspaces, state.workspaces.length]);

    return <div className="relative inline-block text-left">
        <div>
            <span onClick={() => setIsOpen((prev) => !prev)}>
                {currentWorkspace ? <SelectedWorkspace workspace={currentWorkspace} /> : "Select a workspace"}
            </span>
        </div>
        {isOpen && (
            <div
                className="origin-top-right absolute w-full rounded-md shadow-md z-50 max-h-screen bg-black/10 backdrop-blur-lg group overflow-scroll-y border-[1px] border-muted">
                <div className="rounded-md flex flex-col">
                    <div className="p-2">
                        {!!privateWorkspaces.length && (
                            <div>
                                <p className="text-muted-foreground">Private</p>
                                <hr></hr>
                                {privateWorkspaces.map((option) => (
                                    <SelectedWorkspace
                                        key={option.id}
                                        workspace={option}
                                        onClick={() => handleClick(option)}
                                    />
                                ))}
                            </div>
                        )}
                        {!!sharedWorkspaces.length && (
                            <div>
                                <p className="text-muted-foreground">Shared</p>
                                <hr />
                                {sharedWorkspaces.map((option) => (
                                    <SelectedWorkspace
                                        key={option.id}
                                        workspace={option}
                                        onClick={() => handleClick(option)}
                                    />
                                ))}
                            </div>
                        )}
                        {!!collaboratingWorkspaces.length && (
                            <div>
                                <p className="text-muted-foreground">Collaborating</p>
                                <hr />
                                {collaboratingWorkspaces.map((option) => (
                                    <SelectedWorkspace
                                        key={option.id}
                                        workspace={option}
                                        onClick={() => handleClick(option)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                    <CustomDialogTrigger
                        header="Create A Workspace"
                        content={<WorkspaceCreate />}
                        description="Workspaces give you the power to collaborate with others. You can change your workspace privacy settings after creating the workspace too."
                    >
                        <div
                            className="flex transition-all hover:bg-muted justify-center items-center gap-2 p-2 w-full">
                            <article
                                className="text-slate-500  rounded-full bg-slate-800  w-4  h-4  flex  items-center  justify-center">
                                +
                            </article>
                            Create workspace
                        </div>
                    </CustomDialogTrigger>
                </div>
            </div>
        )}
    </div>;
};

export default WorkspaceDropDown;
