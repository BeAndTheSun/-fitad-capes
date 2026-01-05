'use client';

import { useExternalStoreRuntime } from '@assistant-ui/react';
import { useCallback, useMemo, useState } from 'react';

import type { AssistantChatProps } from './assistant-chat-types';
import { useAssistantRuntime as useCustomRuntime } from './assistant-runtime-adapter';
import { ChatInterface } from './chat-interface';
import { ChatSidebar } from './chat-sidebar';
import { MobileHeader } from './mobile-header';

export const AssistantChatLayout: React.FC<AssistantChatProps> = ({
  workspaceId,
  userId,
  onError,
}) => {
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  const runtimeConfig = useMemo(
    () => ({
      workspaceId,
      userId,
      apiEndpoint: '/api',
      onError,
    }),
    [workspaceId, userId, onError]
  );

  const customRuntime = useCustomRuntime(runtimeConfig);

  // Create streaming runtime using the custom adapter
  const runtime = useExternalStoreRuntime({
    isRunning: customRuntime.isLoading,
    messages: customRuntime.messages.map((msg) => ({
      id: msg.id,
      role: (msg.direction === 'outgoing' ? 'user' : 'assistant') as
        | 'user'
        | 'assistant',
      content: [{ type: 'text' as const, text: msg.content }],
      createdAt: new Date(msg.createdAt),
    })),
    convertMessage: (message) => message, // No conversion needed
    onNew: async (message) => {
      if (!customRuntime.currentChatId) {
        onError?.(new Error('No chat selected'));
        return;
      }

      try {
        // Get the text content from the message
        const textContent =
          message.content.find((part) => part.type === 'text')?.text || '';

        if (!textContent.trim()) {
          onError?.(new Error('Message cannot be empty'));
          return;
        }

        // Add user message to the runtime immediately for better UX
        const userMessage = {
          id: `temp-user-${Date.now()}`,
          chatId: customRuntime.currentChatId,
          content: textContent,
          userId,
          senderId: userId,
          direction: 'outgoing' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        customRuntime.addMessage(userMessage);

        // Send streaming request to the API endpoint
        const response = await fetch(
          `/api/chat-assistant/${workspaceId}/${customRuntime.currentChatId}/stream`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messages: [
                ...customRuntime.messages.map((msg) => ({
                  role: msg.direction === 'outgoing' ? 'user' : 'assistant',
                  content: msg.content,
                })),
                {
                  role: 'user',
                  content: textContent,
                },
              ],
              userId, // Include the userId from props
            }),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `API request failed (${response.status}): ${errorText}`
          );
        }

        // Create AI message placeholder for streaming
        const aiMessageId = `temp-ai-${Date.now()}`;
        const aiMessage = {
          id: aiMessageId,
          chatId: customRuntime.currentChatId,
          content: '',
          userId: null, // AI messages don't belong to users
          senderId: null, // AI is the sender, not a specific user
          direction: 'inbound' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        customRuntime.addMessage(aiMessage);

        // Handle streaming response
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullResponse = '';

        if (reader) {
          const processStream = async (): Promise<void> => {
            try {
              const readChunk = async (): Promise<void> => {
                const result = await reader.read();
                if (result.done) return;

                if (result.value) {
                  const chunk = decoder.decode(result.value, { stream: true });
                  fullResponse += chunk;
                  // Update the AI message with the accumulated response
                  customRuntime.updateMessage(aiMessageId, fullResponse);
                }

                await readChunk();
              };

              await readChunk();
            } finally {
              reader.releaseLock();
            }
          };

          await processStream();
        }

        // Don't reload messages - they're already in the correct state locally
        // Reloading causes ordering issues and message loss
      } catch (error) {
        onError?.(error as Error);
      }
    },
  });

  const handleNewChat = useCallback(async () => {
    setIsCreatingChat(true);
    try {
      const newChat = await customRuntime.createChat();
      if (newChat) {
        customRuntime.setCurrentChatId(newChat.id);
      }
    } catch (error) {
      onError?.(error as Error);
    } finally {
      setIsCreatingChat(false);
    }
  }, [customRuntime, onError]);

  const handleChatSelect = useCallback(
    (chatId: string) => {
      customRuntime.setCurrentChatId(chatId);
      setShowSidebar(false); // Close sidebar on mobile after selecting chat
    },
    [customRuntime]
  );

  const handleCloseSidebar = useCallback(() => {
    setShowSidebar(false);
  }, []);

  const handleToggleSidebar = useCallback(() => {
    setShowSidebar((prev) => !prev);
  }, []);

  const currentChatName = customRuntime.currentChatId
    ? customRuntime.chats.find((c) => c.id === customRuntime.currentChatId)
        ?.name || undefined
    : undefined;

  return (
    <div className="flex h-[calc(100vh-100px)] w-full flex-col overflow-hidden rounded-md border md:h-[600px]">
      <MobileHeader
        chatName={currentChatName}
        onToggleSidebar={handleToggleSidebar}
      />

      <div className="relative flex min-h-0 flex-1">
        <ChatSidebar
          chats={customRuntime.chats}
          currentChatId={customRuntime.currentChatId}
          isCreatingChat={isCreatingChat}
          showSidebar={showSidebar}
          loadChatsError={customRuntime.loadChatsError}
          onNewChat={handleNewChat}
          onChatSelect={handleChatSelect}
          onCloseSidebar={handleCloseSidebar}
        />

        <div className="flex min-h-0 w-full flex-1 flex-col">
          <ChatInterface
            runtime={runtime}
            currentChatId={customRuntime.currentChatId}
            showSidebar={showSidebar}
            onCloseSidebar={handleCloseSidebar}
          />
        </div>
      </div>
    </div>
  );
};
