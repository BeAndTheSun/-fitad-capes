'use client';

import type { Chat } from './assistant-chat-types';

type ChatSidebarProps = {
  chats: Chat[];
  currentChatId: string | null;
  isCreatingChat: boolean;
  showSidebar: boolean;
  loadChatsError: Error | null;
  onNewChat: () => void;
  onChatSelect: (chatId: string) => void;
  onCloseSidebar?: () => void;
};

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  chats,
  currentChatId,
  isCreatingChat,
  showSidebar,
  loadChatsError,
  onNewChat,
  onChatSelect,
  onCloseSidebar,
}) => {
  return (
    <div
      className={`
        overflow-hidden border-r bg-muted/10 p-4
        md:relative md:block md:w-[250px]
        ${showSidebar ? 'absolute inset-y-0 left-0 z-10 block w-[280px] bg-background shadow-lg' : 'hidden'}
      `}
    >
      <div className="mb-4">
        <button
          type="button"
          onClick={onNewChat}
          disabled={isCreatingChat}
          className="w-full rounded-md border px-3 py-2 text-sm hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isCreatingChat ? 'Creating...' : 'New Chat'}
        </button>
      </div>
      <div className="space-y-2 overflow-y-auto">
        {loadChatsError && (
          <div className="rounded-md border-l-4 border-red-500 bg-red-50 p-2">
            <div className="text-xs font-medium text-red-800">
              Failed to load chats
            </div>
            <div className="mt-1 text-xs text-red-600">
              {loadChatsError.message}
            </div>
          </div>
        )}
        {!loadChatsError && chats.length === 0 && (
          <div className="p-2 text-xs text-muted-foreground">
            No chats yet. Create your first chat!
          </div>
        )}
        {!loadChatsError &&
          chats.length > 0 &&
          chats.map((chat) => (
            <button
              key={chat.id}
              type="button"
              className={`w-full cursor-pointer rounded-md px-3 py-2 text-left text-sm hover:bg-muted ${
                currentChatId === chat.id ? 'bg-muted' : ''
              }`}
              onClick={() => {
                onChatSelect(chat.id);
                onCloseSidebar?.();
              }}
            >
              {chat.name}
            </button>
          ))}
      </div>
    </div>
  );
};
