"use client"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useSupabaseUser } from '@/lib/providers/supabase-user-provider'
import { User, Workspace } from '@/lib/supabase/schema-type'
import { Lock, Plus, Share } from 'lucide-react'
import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { ScrollArea } from '../ui/scroll-area'
import CollaboratorSearch from "../global/CollaboratorSearch"
import { v4 } from "uuid"
import { addWorkspaceCollaborator, createWorkspace } from "@/lib/supabase/queries"
import { toast } from "../ui/use-toast"
import { useRouter } from "next/navigation"

const WorkspaceCreate = () => {
    const { user } = useSupabaseUser()
    const [title, setTitle] = useState<string>("");
    const [permission, setPermission] = useState("");
    const [collaborators, setCollaborators] = useState<User[]>([]);
    const [error, setError] = useState<string>("");
    const router = useRouter();

    const addCollaborator = (user: User) => {
        setCollaborators([...collaborators, user]);
    };

    const removeCollaborator = (user: User) => {
        setCollaborators(collaborators.filter((c) => c.id !== user.id));
    };

    const handleCreateWorkspace = async () => {
        if (["private", "shared"].includes(permission) && user?.id) {
            const newWorkspaceId = v4();
            const newWorkspace: Workspace = {
                id: newWorkspaceId,
                data: "",
                workspaceOwner: user.id,
                title: title,
                iconId: "🔮",
                inTrash: "",
                logo: null,
                bannerUrl: "",
                createdAt: new Date().toISOString(),
            }
            if (permission === "private") {
                const { data, error: createWorkspaceError } = await createWorkspace(newWorkspace);
                if (data) {
                    toast({
                        title: "Workspace created successfully",
                    })
                }
                if (createWorkspaceError) {
                    return toast({
                        title: "Failed to create new workspace",
                        variant: "destructive"
                    })
                }
            }
            if (permission === "shared") {
                const { error: createWorkspaceError } = await createWorkspace(newWorkspace);
                if (createWorkspaceError) {
                    return toast({
                        title: "Failed to create new workspace",
                        variant: "destructive"
                    })
                }
                const { error: addWorkspaceCollaboratorError } = await addWorkspaceCollaborator(collaborators, newWorkspaceId);
                if (addWorkspaceCollaboratorError) {
                    return toast({
                        title: "Failed to add collaborators",
                    })
                }
                toast({
                    title: "Workspace created successfully",
                })
            }
            router.refresh();
        } else {
            setError("Please choose a workspace type");
        }
    }
    const handleOnValueChange = (val: string) => {
        setPermission(val);
        setError("");
    }

    return (
        <div className='flex flex-col gap-4'>
            <div>
                <Label htmlFor="name" className='text-sm text-muted-foreground'>Workspace Name</Label>
                <div
                    className="flex justify-center items-center gap-2">
                    <Input
                        name="name"
                        value={title}
                        placeholder="Workspace Name"
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>
            </div>

            <div>
                <Label htmlFor="name" className='text-sm text-muted-foreground'>Workspace Type</Label>
                <Select onValueChange={(val) => handleOnValueChange(val)} >
                    <SelectTrigger className="w-full h-26 -mt-3x">
                        <SelectValue placeholder="Type of Workspace" />
                    </SelectTrigger>
                    {error && <small className="font-semibold ml-2 text-center text-destructive">{error}</small>}
                    <SelectContent>
                        <SelectItem value="private" >
                            <div className="p-2 flex gap-4 justify-center items-center">
                                <Lock />
                                <article className="text-left flex flex-col">
                                    <span>Private</span>
                                    <p>
                                        Your workspace is private to you. You can choose to share
                                        it later.
                                    </p>
                                </article>
                            </div>
                        </SelectItem>
                        <SelectItem value="shared">
                            <div className="p-2 flex gap-4 justify-center items-center">
                                <Share />
                                <article className="text-left flex flex-col">
                                    <span>Shared</span>
                                    <span>You can invite collaborators.</span>
                                </article>
                            </div>
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {permission === "shared" && (
                <div>
                    <CollaboratorSearch getCollaborator={addCollaborator} existingCollaborators={collaborators}>
                        <Button className="text-sm mt-4">
                            <Plus />Add Collaborator
                        </Button>
                    </CollaboratorSearch>

                    <div className="mt-4">
                        <span>Number of Collaborators - {collaborators.length || 0}</span>
                    </div>

                    {/* ADDED COLLABORATORS LIST */}
                    <ScrollArea
                        className=" h-[120px] overflow-y-scroll w-full rounded-md border border-muted-foreground/20">
                        {collaborators.length ? (
                            collaborators.map((collaborator: User) => (
                                <div
                                    className="p-4 flex justify-between items-center" key={collaborator.id}>
                                    <div className="flex gap-4 items-center">
                                        <Avatar>
                                            <AvatarImage src="/avatars/7.png" />
                                            <AvatarFallback>PJ</AvatarFallback>
                                        </Avatar>
                                        <div className="text-sm  gap-2 text-muted-foreground overflow-hidden overflow-ellipsis sm:w-[300px] w-[140px]">
                                            {collaborator.email}
                                        </div>
                                    </div>
                                    <Button
                                        variant="secondary"
                                        onClick={() => removeCollaborator(collaborator)}
                                    >
                                        Remove
                                    </Button>
                                </div>
                            ))
                        ) : (
                            <div className="absolute right-0 left-0 top-0 bottom-0 flex justify-center items-center">
                                <span className="text-muted-foreground text-sm">
                                    Currently you have no collaborators.
                                </span>
                            </div>
                        )}
                    </ScrollArea>
                </div>
            )}

            <Button
                variant={"secondary"}
                disabled={title.length === 0 || (permission === "shared" && collaborators.length === 0)}
                onClick={() => handleCreateWorkspace()}
            >
                Create Workspace
            </Button>
        </div>
    )
}

export default WorkspaceCreate