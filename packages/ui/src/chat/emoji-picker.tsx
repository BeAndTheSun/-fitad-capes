'use client';

import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { SmileIcon } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Popover, PopoverContent, PopoverTrigger } from '@/theme/index';

type EmojiPickerProps = {
  onChange: (value: string) => void;
};

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ onChange }) => {
  const { theme } = useTheme();

  return (
    <Popover>
      <PopoverTrigger>
        <SmileIcon className="size-5 text-muted-foreground transition hover:text-foreground" />
      </PopoverTrigger>
      <PopoverContent className="w-full">
        <Picker
          emojiSize={18}
          theme={theme || 'light'}
          data={data}
          maxFrequentRows={1}
          onEmojiSelect={(emoji: { native: string }): void =>
            onChange(emoji.native)
          }
        />
      </PopoverContent>
    </Popover>
  );
};
