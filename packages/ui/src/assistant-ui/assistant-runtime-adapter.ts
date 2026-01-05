'use client';

import { format } from 'date-fns';
import { useCallback, useEffect, useState } from 'react';

import type {
  AssistantRuntimeConfig,
  Chat,
  ChatMessage,
} from './assistant-chat-types';

export const useAssistantRuntime = (
  config: AssistantRuntimeConfig
): {
  chats: Chat[];
  messages: ChatMessage[];
  currentChatId: string | null;
  isLoading: boolean;
  loadChatsError: Error | null;
  setCurrentChatId: (id: string) => void;
  createChat: () => Promise<Chat | null>;
  sendMessage: (content: string) => Promise<void>;
  loadChats: () => Promise<void>;
  loadMessages: (chatId: string) => Promise<void>;
  addMessage: (message: ChatMessage) => void;
  updateMessage: (messageId: string, newContent: string) => void;
} => {
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadedChats, setHasLoadedChats] = useState(false);
  const [loadChatsError, setLoadChatsError] = useState<Error | null>(null);
  const [loadingChats, setLoadingChats] = useState(false);

  // Fetch chats for the workspace
  const loadChats = useCallback(async () => {
    // Prevent multiple concurrent requests - NEVER reset this flag once set
    if (hasLoadedChats || loadingChats) return;

    try {
      setLoadingChats(true);
      setHasLoadedChats(true); // Set immediately to prevent any further attempts
      setLoadChatsError(null);

      const response = await fetch(
        `${config.apiEndpoint}/chat-assistant/${config.workspaceId}/chat/list`
      );
      if (!response.ok) {
        throw new Error(
          `Failed to fetch chats: ${response.status} ${response.statusText}`
        );
      }
      const data = (await response.json()) as {
        id: string;
        createdAt: string;
        userId: string;
        workspaceId: string;
        updatedAt: string;
      }[];

      // Format chats with proper names using same format as old chat
      const formattedChats = data.map((chat) => ({
        id: chat.id,
        name: `Chat ${format(new Date(chat.createdAt), 'yyyy-MM-dd - hh:mm a')}`,
        userId: chat.userId,
        workspaceId: chat.workspaceId,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
      }));

      setChats(formattedChats);
    } catch (error) {
      setLoadChatsError(error as Error);
      config.onError?.(error as Error);
      // CRITICAL: DO NOT reset hasLoadedChats - prevent infinite loops!
    } finally {
      setLoadingChats(false);
    }
  }, [config, hasLoadedChats, loadingChats]);

  // Fetch messages for a specific chat
  const loadMessages = useCallback(
    async (chatId: string) => {
      try {
        const url = `${config.apiEndpoint}/chat-assistant/messages/${chatId}/list`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch messages');
        const data = (await response.json()) as ChatMessage[];
        setMessages(data);
      } catch (error) {
        config.onError?.(error as Error);
      }
    },
    [config]
  );

  // Create a new chat
  const createChat = useCallback(async (): Promise<Chat | null> => {
    try {
      const response = await fetch(
        `${config.apiEndpoint}/chat-assistant/${config.workspaceId}/create`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: config.userId,
          }),
        }
      );
      if (!response.ok) throw new Error('Failed to create chat');
      const newChat = (await response.json()) as Chat;
      loadChats().catch(() => {
        // Handle error silently
      });
      return newChat;
    } catch (error) {
      config.onError?.(error as Error);
      return null;
    }
  }, [config, loadChats]);

  // Add a message to the local state (for immediate UI update)
  const addMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  // Update a message in the local state (for streaming updates)
  const updateMessage = useCallback((messageId: string, newContent: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, content: newContent } : msg
      )
    );
  }, []);

  // Send a message
  const sendMessage = useCallback(
    async (content: string): Promise<void> => {
      if (!currentChatId) return;

      setIsLoading(true);
      try {
        // Add user message to local state immediately for UI responsiveness
        const userMessage: ChatMessage = {
          id: `temp-user-${Date.now()}`,
          content,
          chatId: currentChatId,
          userId: config.userId,
          senderId: config.userId,
          direction: 'outgoing',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        addMessage(userMessage);

        // Prepare messages for API (convert to format expected by streaming API)
        const apiMessages = [...messages, userMessage].map((msg) => ({
          role: msg.direction === 'outgoing' ? 'user' : 'assistant',
          content: msg.content,
        }));

        // Use the new streaming chat-assistant endpoint
        const response = await fetch(
          `${config.apiEndpoint}/chat-assistant/${config.workspaceId}/${currentChatId}/stream`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messages: apiMessages,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        // Handle streaming response
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('No response body');
        }

        // Add empty assistant message for streaming updates
        const assistantMessageId = `temp-assistant-${Date.now()}`;
        const assistantMessage: ChatMessage = {
          id: assistantMessageId,
          content: '',
          chatId: currentChatId,
          userId: null, // AI messages don't belong to users
          senderId: null, // AI is the sender, not a specific user
          direction: 'inbound',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        addMessage(assistantMessage);

        const decoder = new TextDecoder();
        let accumulatedContent = '';

        const processStream = async (): Promise<void> => {
          const readChunk = async (): Promise<void> => {
            const result = await reader.read();
            if (result.done) {
              return;
            }

            if (result.value) {
              const chunk = decoder.decode(result.value, { stream: true });
              accumulatedContent += chunk;
              updateMessage(assistantMessageId, accumulatedContent);
            }

            await readChunk();
          };

          await readChunk();
        };

        await processStream();

        // Don't reload messages here - it causes ordering issues
        // The messages are already in the correct state locally
      } catch (error) {
        config.onError?.(error as Error);
      } finally {
        setIsLoading(false);
      }
    },
    [currentChatId, config, messages, addMessage, updateMessage]
  );

  // Initialize - only load chats once on mount
  useEffect(() => {
    loadChats().catch(() => {
      // Handle error silently to prevent loops
    });
  }, [loadChats]);

  // Auto-select the latest chat if no chat is currently selected
  useEffect(() => {
    if (!currentChatId && chats.length > 0 && chats[0]) {
      setCurrentChatId(chats[0].id);
    }
  }, [chats, currentChatId]);

  // Load messages when chat changes
  useEffect(() => {
    if (currentChatId) {
      // Clear existing messages first to avoid showing wrong chat's messages
      setMessages([]);
      loadMessages(currentChatId).catch(() => {
        // Handle error silently
      });
    } else {
      // No chat selected, clear messages
      setMessages([]);
    }
  }, [currentChatId, loadMessages]);

  return {
    chats,
    messages,
    currentChatId,
    isLoading,
    loadChatsError,
    setCurrentChatId,
    createChat,
    sendMessage,
    loadChats,
    loadMessages,
    addMessage,
    updateMessage,
  };
};
