"use client";

import Loader from "@/components/global/Loader";
import { createWorkspaceAction } from "@/lib/server-actions/workspace";
import type { Subscription } from "@/lib/supabase/schema-type";
import {
    workspacePayload,
    workspaceValidator,
} from "@/lib/validation/workspace";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@radix-ui/react-label";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { AuthUser } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { FC, useState } from "react";
import { useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import EmojiPicker from "../global/EmojiPicker";
import { Button } from "../ui/button";
import { useAppState } from '@/lib/providers/state-providers';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { toast } from "../ui/use-toast";


interface DashBoardSetupProps {
    user: AuthUser;
    subscription: Subscription | undefined;
}
const DashBoardSetup: FC<DashBoardSetupProps> = ({ subscription, user }) => {
    const supabase = createClientComponentClient();
    const router = useRouter();
    const { dispatch } = useAppState();
    const [selectedEmoji, setSelectedEmoji] = useState<string>("🌐");
    const {
        register,
        handleSubmit,
        formState: { isSubmitting, errors },
        reset
    } = useForm<workspacePayload>({
        mode: "onChange",
        resolver: zodResolver(workspaceValidator),
        defaultValues: {
            workspaceName: "",
            logo: "",
        },
    });
    const onSubmit = async (payload: workspacePayload) => {
        const file = payload.logo[0];
        const workspaceUUID = uuidv4();
        let filePath = null;
        if (file) {
            try {
                const { data, error } = await supabase.storage
                    .from("workspace-logos")
                    .upload(`workspaceLogo.${workspaceUUID}`, file, {
                        cacheControl: "3600",
                        upsert: true,
                    });
                if (error) throw new Error("");
                filePath = data.path;
            } catch (error) {
                toast({
                    variant: "destructive",
                    title: "Error! Could not upload your workspace logo",
                });
            }
        }

        /* 𝗰𝗿𝗲𝗮𝘁𝗲 𝗮 𝗻𝗲𝘄 𝘄𝗼𝗿𝗸𝘀𝗽𝗮𝗰𝗲 */
        try {
            const { data: newWorkspaceData, error: workspaceError } = await createWorkspaceAction(user.id, filePath, selectedEmoji, workspaceUUID, payload.workspaceName);
            if (workspaceError) {
                throw new Error(workspaceError.message);
            }
            if (!newWorkspaceData) {
                return toast({
                    title: 'Failed to create a new workspace',
                    description: "Something went wrong while create your workspace. Try again or come back later.",
                    variant: "destructive"
                });
            }
            toast({
                title: "Toast created Successfully"
            })
            dispatch({
                type: 'ADD_WORKSPACE',
                payload: { ...newWorkspaceData, folders: [] },
            });

            router.replace(`/dashboard/${newWorkspaceData.id}`);
        } catch (error) {
            console.log('Error', error);
            toast({
                title: 'Something went wrong',
                description:
                    "Oops! Something went wrong, and we couldn't create your workspace. Try again or come back later.",
                variant: 'destructive',
            });
        } finally {
            reset();
        }

    };

    return (
        <div>
            <Card className="w-[800px] h-screen sm:h-auto">
                <CardHeader>
                    <CardTitle>Create A Workspace</CardTitle>
                    <CardDescription>
                        Lets create a private workspace to get you started.You can add
                        collaborators later from the workspace settings tab.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-2">
                                <div className="text-2xl mt-5">
                                    <EmojiPicker getValue={(emoji) => setSelectedEmoji(emoji)}>
                                        {selectedEmoji}
                                    </EmojiPicker>
                                </div>
                                <div className="w-full">
                                    <Label
                                        htmlFor="workspaceName"
                                        className="text-sm text-muted-foreground"
                                    >
                                        Name
                                    </Label>
                                    <Input
                                        id="workspaceName"
                                        type="text"
                                        placeholder="Workspace Name"
                                        disabled={isSubmitting}
                                        {...register("workspaceName", {
                                            required: "Workspace name is required",
                                        })}
                                    />
                                    <small className="text-red-600">
                                        {errors?.workspaceName?.message?.toString()}
                                    </small>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="logo" className="text-sm text-muted-foreground">
                                    Workspace Logo
                                </Label>
                                <Input
                                    id="logo"
                                    type="file"
                                    accept="image/*"
                                    className="cursor-pointer"
                                    // disabled={isSubmitting || subscription?.status !== 'active'}
                                    {...register("logo", {
                                        required: false,
                                    })}
                                />
                                <small className="text-red-600">
                                    {errors?.logo?.message?.toString()}
                                </small>
                                {subscription?.status !== "active" && (
                                    <small className="text-muted-foreground block">
                                        To customize your workspace, you need to be on a Pro Plan
                                    </small>
                                )}
                            </div>
                            <div className="self-end">
                                <Button disabled={isSubmitting} type="submit">
                                    {!isSubmitting ? "Create Workspace" : <Loader />}
                                </Button>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default DashBoardSetup;
