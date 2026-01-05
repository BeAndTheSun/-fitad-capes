'use client';

import type { AssistantRuntime } from '@assistant-ui/react';
import {
  AssistantRuntimeProvider,
  ComposerPrimitive,
  ThreadPrimitive,
} from '@assistant-ui/react';

import { MessageComponent } from './message-component';

type ChatInterfaceProps = {
  runtime: AssistantRuntime;
  currentChatId: string | null;
  showSidebar: boolean;
  onCloseSidebar: () => void;
};

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  runtime,
  currentChatId,
  showSidebar,
  onCloseSidebar,
}) => {
  if (!currentChatId) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <div className="text-center">
          <p className="mb-2">Select a chat or create a new one to start</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile overlay to close sidebar when clicking outside */}
      {showSidebar && (
        <button
          type="button"
          className="absolute inset-0 z-[5] bg-black/20 md:hidden"
          onClick={onCloseSidebar}
          aria-label="Close sidebar"
        />
      )}
      <AssistantRuntimeProvider runtime={runtime}>
        <ThreadPrimitive.Root className="flex flex-1 flex-col overflow-hidden">
          <ThreadPrimitive.Viewport className="min-h-0 flex-1 overflow-y-auto p-4">
            <ThreadPrimitive.Messages
              components={{
                Message: MessageComponent,
              }}
            />
          </ThreadPrimitive.Viewport>
          <ComposerPrimitive.Root className="shrink-0 border-t p-2 sm:p-4">
            <ComposerPrimitive.Input
              className="min-h-[44px] w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-base"
              placeholder="Type your message..."
            />
          </ComposerPrimitive.Root>
        </ThreadPrimitive.Root>
      </AssistantRuntimeProvider>
    </>
  );
};
