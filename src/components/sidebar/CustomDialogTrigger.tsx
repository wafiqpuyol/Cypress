import React, { FC } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import clsx from 'clsx';


interface CustomDialogTriggerProps {
    header: string;
    description: string;
    children: React.ReactNode
    content: React.ReactNode
    className?: string
}
const CustomDialogTrigger: FC<CustomDialogTriggerProps> = ({ children, description, header, content, className }) => {

    return (
        <Dialog>
            <DialogTrigger className={clsx('', className)}>{children}</DialogTrigger>
            <DialogContent className="h-screen block sm:h-[440px] overflow-scroll w-full">
                <DialogHeader>
                    <DialogTitle>{header}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                {content}
            </DialogContent>
        </Dialog>)
}

export default CustomDialogTrigger