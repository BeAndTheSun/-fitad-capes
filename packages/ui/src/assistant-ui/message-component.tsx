'use client';

import { MessagePrimitive } from '@assistant-ui/react';

export const MessageComponent = (): JSX.Element => (
  <MessagePrimitive.Root className="mb-4">
    <MessagePrimitive.If user>
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-lg bg-blue-500 p-3 text-sm text-white sm:max-w-[80%] sm:text-base">
          <MessagePrimitive.Content />
        </div>
      </div>
    </MessagePrimitive.If>
    <MessagePrimitive.If assistant>
      <div className="flex justify-start">
        <div className="max-w-[85%] rounded-lg bg-gray-100 p-3 text-sm text-gray-900 sm:max-w-[80%] sm:text-base">
          <MessagePrimitive.Content />
        </div>
      </div>
    </MessagePrimitive.If>
  </MessagePrimitive.Root>
);
