"use Client"

import React, { FC, useEffect, useState } from 'react'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Input } from '../ui/input'
import { getUsersByEmail } from '@/lib/supabase/queries'
import { User } from '@/lib/supabase/schema-type'
import { ScrollArea } from '../ui/scroll-area'
import { Avatar, AvatarImage, AvatarFallback } from '@radix-ui/react-avatar'
import { Button } from '../ui/button'
import { toast } from '../ui/use-toast'
import { useSupabaseUser } from '@/lib/providers/supabase-user-provider'
import useDebounce from '@/hooks/useDebounce'
interface CollaboratorSearchProps {
    children: React.ReactNode;
    getCollaborator: (Collaborator: User) => void;
    existingCollaborators: User[];
}
const CollaboratorSearch: FC<CollaboratorSearchProps> = ({ children, getCollaborator, existingCollaborators }) => {
    const { user } = useSupabaseUser();
    const [searchResult, setSearchResult] = useState<User[] | string>([]);
    const [input, setInput] = useState("");
    const debouncedValue = useDebounce(input);

    useEffect(() => {
        (async () => {
            if (debouncedValue.trim() !== "") {
                const { data: users, error } = await getUsersByEmail(debouncedValue);
                if (error) {
                    toast({
                        title: "Something went wrong while searching user",
                        description: "Some server error occurred. Please try again later",
                        variant: "destructive"
                    })
                    setSearchResult(users)
                }
                if (!users.length) {
                    setSearchResult("No user found")
                }
                if (users.length) {
                    setSearchResult(users);
                }
            } else {
                setSearchResult([])
            }
        })();
    }, [debouncedValue])


    return (
        <Sheet onOpenChange={() => {
            setInput("");
            setSearchResult([])
        }}>
            <SheetTrigger>{children}</SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Search Collaborator</SheetTitle>
                    <SheetDescription>
                        <p className="text-sm text-muted-foreground">
                            You can also remove collaborators after adding them from the
                            settings tab.
                        </p>
                    </SheetDescription>
                </SheetHeader>
                <div className='lex justify-center items-center gap-2 mt-2'>
                    <Input name='name' type='email' value={input} className='dark:bg-background' placeholder='Search by Email' onChange={(e) => setInput(e.target.value)} />
                </div>
                {/* Render search result */}
                <ScrollArea className='mt-6 overflow-y-scroll w-full rounded-md'>
                    {Array.isArray(searchResult) ? searchResult.filter(searchedUser => !existingCollaborators.some(existingCollaborator => searchedUser.id === existingCollaborator.id))
                        .filter(u => u.id !== user?.id)
                        .map((user) => (
                            <div key={user.id} className='p-4 flex justify-between items-center'>
                                <div className="flex gap-4 items-center">
                                    <Avatar className="w-8 h-8">
                                        <AvatarImage src="/avatars/7.png" />
                                        <AvatarFallback>CP</AvatarFallback>
                                    </Avatar>
                                    <div
                                        className="text-sm gap-2 overflow-hidden overflow-ellipsis w-[180px] text-muted-foreground">
                                        {user.email}
                                    </div>
                                </div>
                                <Button
                                    variant="secondary"
                                    onClick={() => getCollaborator(user)}
                                >
                                    Add
                                </Button>
                            </div>))
                        : <p>{input && searchResult}</p>}
                </ScrollArea>
            </SheetContent>
        </Sheet>
    )
}

export default CollaboratorSearch