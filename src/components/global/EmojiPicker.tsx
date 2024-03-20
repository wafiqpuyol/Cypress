"use client"
import dynamic from 'next/dynamic'
import React, { FC, ReactNode, memo } from 'react'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { EmojiClickData, EmojiStyle, Theme } from 'emoji-picker-react';

interface EmojiPickerProps {
    children: ReactNode;
    getValue: (emoji: string) => void;
}
const EmojiPicker: FC<EmojiPickerProps> = ({ children, getValue }) => {
    const Picker = dynamic(() => import('emoji-picker-react'), { ssr: false });

    return (
        <div>
            <Popover>
                <PopoverTrigger className="cursor-pointer">{children}</PopoverTrigger>
                <PopoverContent className='border-0 p-0'>
                    <Picker onEmojiClick={(emoji: EmojiClickData) => getValue(emoji.emoji)}
                        lazyLoadEmojis={true}
                        theme={Theme.AUTO}
                        emojiStyle={EmojiStyle.APPLE} style={{ width: '450px', height: '400px' }}
                    />
                </PopoverContent>
            </Popover>
        </div>
    )
}

export default memo(EmojiPicker);