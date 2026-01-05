import type { StreamingMessage } from '@meltstudio/ai';
import { StreamingAIClient } from '@meltstudio/ai';
import { VectorDBService } from '@meltstudio/db';
import type { Request, Response } from 'express';
import { Router } from 'express';

import { db } from '@/api/db';

const chatAssistantRouter = Router();
const vector = new VectorDBService();
const streamingAI = new StreamingAIClient();

// List all chats for a workspace
chatAssistantRouter.get(
  '/:workspaceId/chat/list',
  async (req: Request, res: Response) => {
    try {
      const { workspaceId } = req.params;

      if (!workspaceId) {
        return res.status(400).json({ error: 'Workspace ID is required' });
      }

      const chats = await db.chat.findChatsByWorkspace(workspaceId);

      return res.json(chats);
    } catch (error) {
      return res.status(500).json({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

// Create a new chat
chatAssistantRouter.post(
  '/:workspaceId/create',
  async (req: Request, res: Response) => {
    try {
      const { workspaceId } = req.params;
      const { userId } = req.body as { userId: string };

      if (!workspaceId) {
        return res.status(400).json({ error: 'Workspace ID is required' });
      }

      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      const newChat = await db.chat.create({
        data: {
          workspaceId,
          userId,
        },
      });

      return res.json(newChat);
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// List messages for a specific chat
chatAssistantRouter.get(
  '/messages/:chatId/list',
  async (req: Request, res: Response) => {
    try {
      const { chatId } = req.params;

      if (!chatId) {
        return res.status(400).json({ error: 'Chat ID is required' });
      }

      // Use the specific method that properly filters by chatId
      const messages = await db.message.findMessagesByChat(chatId);

      // Ensure we always return an array, even if null
      const messageList = messages || [];

      return res.json(messageList);
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Streaming chat endpoint for assistant-ui integration
chatAssistantRouter.post(
  '/:workspaceId/:chatId/stream',
  async (req: Request, res: Response) => {
    try {
      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ error: 'OpenAI API key not configured' });
      }

      // TODO: Add proper authentication when needed
      // const user = req.auth?.user;
      // if (!user) {
      //   return res.status(401).json({ error: 'Unauthorized' });
      // }

      const { workspaceId, chatId } = req.params;
      const { messages, userId } = req.body as {
        messages: Array<{ role: string; content: string }>;
        userId?: string;
      };

      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'Messages are required' });
      }

      if (!workspaceId || !chatId) {
        return res
          .status(400)
          .json({ error: 'Workspace ID and Chat ID are required' });
      }

      // Get the latest user message
      const lastMessage = messages[messages.length - 1];
      const userInput = lastMessage?.content || '';

      // Save user message to database
      // TODO: Add proper user ID when authentication is implemented
      await db.message.create({
        data: {
          chatId,
          userId: userId || null, // Use provided userId or null
          senderId: userId || null,
          direction: 'outgoing',
          content: userInput,
        },
      });

      // Query vector database for relevant information
      let retrievedData: string[] = [];
      try {
        const query = await vector.queryEmbedding({
          workspaceId,
          userQuery: userInput,
        });
        retrievedData = query || [];
      } catch (error) {
        // For now, continue without vector data instead of failing
        // This allows basic chat to work even if vector DB is not set up
        retrievedData = [];
      }

      // Convert previous messages to the proper format
      const previousMessages: StreamingMessage[] = messages
        .slice(0, -1)
        .map((msg) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        }));

      // Generate streaming AI response using the AI package
      const systemPrompt =
        'You are a friendly chatbot. We send a relevant information based on our database. Respond to the user with a friendly, conversational tone, summarizing the key points and answering their query in a natural way.';

      const result = streamingAI.streamChatWithContext({
        userInput,
        previousMessages,
        contextData: retrievedData,
        systemPrompt,
      });

      // Set up streaming response headers
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'keep-alive');

      let fullResponse = '';

      // Stream the response using the Vercel AI SDK streaming approach
      const stream = result.textStream;
      const reader = stream.getReader();

      const processStream = async (): Promise<void> => {
        const streamResult = await reader.read();
        if (!streamResult.done && streamResult.value) {
          fullResponse += streamResult.value;
          res.write(streamResult.value);
          await processStream();
        }
      };

      await processStream();
      reader.releaseLock();

      // Save complete AI response to database after streaming is complete
      await db.message.create({
        data: {
          chatId,
          userId: null, // AI messages don't have a userId
          senderId: null, // AI is the sender, not a specific user
          direction: 'inbound',
          content: fullResponse,
        },
      });

      return res.end();
    } catch (error) {
      return res.status(500).json({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

export { chatAssistantRouter };
