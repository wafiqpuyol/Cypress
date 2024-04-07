"use client"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from '@/components/ui/alert-dialog';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import useDebounce from '@/hooks/useDebounce';
import { useAppState } from '@/lib/providers/state-providers';
import { useSubscriptionModal } from '@/lib/providers/subscription-modal-provider';
import { useSupabaseUser } from '@/lib/providers/supabase-user-provider';
import { addCollaborators, getCollaborators, getUserById, removeCollaborators, updateWorkspace } from '@/lib/supabase/queries';
import { User, Workspace } from '@/lib/supabase/schema-type';
import {
    Briefcase,
    ExternalLink,
    Lock,
    Plus,
    Share
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import CollaboratorSearch from '../global/CollaboratorSearch';
import { AlertDescription } from '../ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { toast } from '../ui/use-toast';
import { Badge } from '../ui/badge';


type TitleType = { workspaceTitle: string | undefined }
const SettingsForm = () => {
    const { dispatch, state, workspaceId } = useAppState();
    const { setSubscriptionModalOpen } = useSubscriptionModal()
    const { user, subscription } = useSupabaseUser();
    const [currentWorkspace, setCurrentWorkspace] = useState<Workspace>();
    const [title, setTitle] = useState<TitleType>({ workspaceTitle: undefined });
    const [uploadLogo, setUploadLogo] = useState<boolean>(false);
    const [permission, setPermission] = useState<string>("private");
    const [collaborators, setCollaborators] = useState<User[] | []>([]);
    const [alert, setAlert] = useState<boolean>(false);
    const [admin, setAdmin] = useState<User | null>(null)
    const [loadingPortal, setLoadingPortal] = useState(false);
    const debounceValue = useDebounce(title);
    const router = useRouter()

    /*----- fetch current workspace from global state & save to local state -----*/
    useEffect(() => {
        if (!workspaceId) {
            return;
        }
        const workspace = state.workspaces.find((w) => w.id === workspaceId);
        if (workspace) setCurrentWorkspace(workspace)
    }, [state.workspaces, workspaceId])

    /*----- update workspace title -----*/
    useEffect(() => {
        if (typeof debounceValue !== "string" && typeof debounceValue.workspaceTitle !== "undefined") {
            if (!workspaceId || !debounceValue.workspaceTitle.length) return;
            dispatch({
                type: "UPDATE_WORKSPACE",
                payload: {
                    workspaceId,
                    workspace: { title: debounceValue.workspaceTitle },
                }
            });
            (async () => {
                const { error } = await updateWorkspace({ title: debounceValue.workspaceTitle }, workspaceId);
                if (error) {
                    toast({
                        title: "Error updating workspace title",
                        variant: "destructive"
                    })
                }
            })()
        }
    }, [debounceValue])

    /*----- fetch collaborators -----*/
    useEffect(() => {
        if (!workspaceId) return;
        (async () => {
            const { data: collaborators, error } = await getCollaborators(workspaceId);
            if (error) {
                toast({
                    title: "Something went wrong while fetching collaborators",
                    description: "There might be some server issue. Please try again.",
                    variant: "destructive"
                })
                return;
            }
            if (!collaborators) {
                return;
            }
            setPermission("shared");
            setCollaborators(collaborators);
        })()
    }, [workspaceId])

    /*----- fetch workspace owner -----*/
    useEffect(() => {
        if (permission !== "shared" || !currentWorkspace) return;
        (async () => {
            const { data: workspaceOwner, error: workspaceOwnerError } = await getUserById(currentWorkspace.workspaceOwner);
            if (workspaceOwnerError) {
                toast({
                    title: workspaceOwnerError || "Something went wrong while fetching workspace owner",
                    variant: "destructive"
                })
            }
            if (workspaceOwner) {
                setAdmin(workspaceOwner);
            }
        })()
    }, [currentWorkspace, permission])

    const onPermissionsChange = (permissionType: string) => {
        if (permissionType === "private") {
            setAlert(true);
        } else {
            setPermission(permissionType);
        }
    }

    const onClickAlertConfirm = async (e: any) => {
        if (!workspaceId) return;
        if (collaborators.length > 0) {
            const { error } = await removeCollaborators(collaborators, workspaceId);
            if (error) {
                return toast({
                    title: "Something went wrong while removing collaborator",
                    variant: "destructive"
                })
            }
            router.refresh();
        }
        setPermission("private");
        setAlert(false);
    }

    const onClickAlertCancel = () => {
        setAlert(false);
    }

    const addCollaborator = async (user: User) => {
        if (!workspaceId) return;
        if (subscription?.status !== "active" && collaborators.length === 3) {
            setSubscriptionModalOpen(true);
            return;
        }
        const { error } = await addCollaborators([user], workspaceId);
        if (error) {
            return toast({
                title: "Something went wrong while adding collaborator",
                variant: "destructive"
            })
        }
        setCollaborators(prev => [...prev, user]);
        router.refresh();
    }

    const removeCollaborator = async (user: User) => {
        if (!workspaceId) return;
        if (collaborators.length > 1) {
            const { error } = await removeCollaborators([user], workspaceId);
            if (error) {
                return toast({
                    title: "Something went wrong while removing collaborator",
                    variant: "destructive"
                })
            }
            setCollaborators(collaborators.filter(c => c.id !== user.id));
            router.refresh();
        }
        setAlert(true);
    }

    const redirectToCustomerPortal = () => {
        setLoadingPortal(true);
        /**
         * 
         * Stripe check page redirection logic.
         * 
         */
        setLoadingPortal(false);
    }

    return (
        <div className="flex gap-4 flex-col">
            <p className="flex items-center gap-2 mt-6">
                <Briefcase size={20} />
                Workspace
            </p>
            <Separator />

            <div>
                <Label>Workspace Name</Label>
                {/* ----- Input for workspace name -----*/}
                <Input
                    type='text'
                    className='mb-4 mt-1'
                    placeholder='Set your workspace name - '
                    value={title?.workspaceTitle != undefined ? title.workspaceTitle : (currentWorkspace ? currentWorkspace.title : "")}
                    onChange={(e) => setTitle({ ...title, workspaceTitle: e.target.value })}
                />
                {title.workspaceTitle && title.workspaceTitle.length === 0 && <p className='text-red-700 text-sm'>Workspace title cannot be empty</p>}

                <Label>Workspace Logo</Label>
                {/* ----- Input for workspace logo -----*/}
                <Input
                    type='file'
                    className='mt-1'
                    placeholder='Choose a logo'
                    accept="image/*"
                    disabled={uploadLogo || subscription?.status !== "active"}
                />
            </div>

            {/* Select for workspace permission */}
            <>
                <Label>Permission</Label>
                <Select
                    onValueChange={onPermissionsChange}
                    value={permission}
                >
                    <SelectTrigger className="w-full h-26 -mt-3">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectItem value="private">
                                <div
                                    className="p-2 flex gap-4 justify-center items-center"
                                >
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
                                    <Share></Share>
                                    <article className="text-left flex flex-col">
                                        <span>Shared</span>
                                        <span>You can invite collaborators.</span>
                                    </article>
                                </div>
                            </SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>

                {permission === 'shared' && (
                    <div>
                        <CollaboratorSearch
                            existingCollaborators={collaborators}
                            getCollaborator={(user) => addCollaborator(user)}
                        >
                            <Button type="button" className="text-sm mt-4">
                                <Plus />
                                Add Collaborators
                            </Button>
                        </CollaboratorSearch>

                        {/** Admin list **/}
                        <div className="mt-4">
                            <span className="text-sm text-muted-foreground">
                                Admin {collaborators.length || ''}
                            </span>
                            <ScrollArea
                                className="h-[120px] w-full rounded-md border border-muted-foreground/20"
                            >
                                {/** Render workspace owner **/}
                                {admin &&
                                    (<div className="p-4 flex justify-between items-center" key={admin.id}>
                                        <div className="flex gap-4 items-center">
                                            <Avatar>
                                                <AvatarImage src="/avatars/7.png" />
                                                <AvatarFallback>PJ</AvatarFallback>
                                            </Avatar>
                                            <div
                                                className="text-sm  gap-2 text-muted-foreground overflow-hidden overflow-ellipsis sm:w-[300px] w-[140px]"
                                            >
                                                {admin.email}
                                            </div>
                                        </div>
                                        <Badge
                                            className='rounded-3xl text-xs font-extrabold  px-2 bg-indigo-500'
                                        // onClick={() => removeCollaborator(collaborator)}
                                        >
                                            Owner
                                        </Badge>
                                    </div>
                                    )
                                }
                            </ScrollArea>
                        </div>

                        {/** Collaborators list **/}
                        <div className="mt-4">
                            <span className="text-sm text-muted-foreground">
                                Collaborators {collaborators.length || ''}
                            </span>
                            <ScrollArea
                                className="h-[120px] w-full rounded-md border border-muted-foreground/20">

                                {collaborators.length ? (
                                    collaborators.map((collaborator) => (
                                        <div
                                            className="pl-4 py-4 flex items-center"
                                            key={collaborator.id}
                                        >
                                            <div className="w-[330px] flex gap-4 items-center">
                                                <Avatar>
                                                    <AvatarImage src="/avatars/7.png" />
                                                    <AvatarFallback>PJ</AvatarFallback>
                                                </Avatar>
                                                <div
                                                    className="text-sm  gap-2 text-muted-foreground overflow-hidden overflow-ellipsis sm:w-[300px] w-[140px]"
                                                >
                                                    {collaborator.email}
                                                </div>
                                            </div>
                                            {admin && user && (user.id === admin.id) && <Button
                                                variant="secondary"
                                                onClick={() => removeCollaborator(collaborator)}
                                            >
                                                Remove
                                            </Button>}
                                        </div>
                                    ))
                                ) : (
                                    <div className="absolute right-0 left-0 top-0 bottom-0 flex justify-center items-center">
                                        <span className="text-muted-foreground text-sm">
                                            You have no collaborators
                                        </span>
                                    </div>
                                )}
                            </ScrollArea>
                        </div>
                    </div>
                )}

                {/* 
        //TODO delete workspace
        //TODO Profile
        //TODO Logout
*/}
                <p className="flex items-center mt-4">Billing & plan</p>
                <Separator />
                <p className="text-muted-foreground">You're currently on a {subscription?.status === "active" ? "Pro " : "Free "}plan</p>
                <Link href="/" target="_blank" className="text-muted-foreground flex flex-row items-center gap-2">
                    View Plans <ExternalLink size={16} />
                </Link>
                {subscription?.status === 'active' ? (
                    <div>
                        <Button
                            type="button"
                            size="sm"
                            variant={'secondary'}
                            disabled={loadingPortal}
                            className="text-sm"
                            onClick={redirectToCustomerPortal}
                        >
                            Manage Subscription
                        </Button>
                    </div>
                ) : (
                    <div>
                        <Button
                            type="button"
                            size="sm"
                            variant={'secondary'}
                            className="text-sm"
                            onClick={() => setSubscriptionModalOpen(true)}
                        >
                            Start Plan
                        </Button>
                    </div>
                )}
            </>

            <AlertDialog open={alert} >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDescription>
                            Changing a Shared workspace to a Private workspace will remove all
                            collaborators permanantly.
                        </AlertDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => onClickAlertCancel()}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={(e) => onClickAlertConfirm(e)}>
                            Continue
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div >
    )
}

export default SettingsForm