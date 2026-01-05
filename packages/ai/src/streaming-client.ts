import { openai } from '@ai-sdk/openai';
import type { StreamTextResult } from 'ai';
import { streamText } from 'ai';

export type StreamingMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export type StreamingChatOptions = {
  messages: StreamingMessage[];
  systemPrompt?: string;
  model?: string;
  onError?: (error: Error) => void;
};

export class StreamingAIClient {
  private defaultModel: string;

  public constructor(model = 'gpt-4o-mini') {
    this.defaultModel = model;
  }

  public createStream(
    options: StreamingChatOptions
  ): StreamTextResult<never, never> {
    const { messages, systemPrompt, model = this.defaultModel } = options;

    try {
      return streamText({
        model: openai(model),
        system: systemPrompt,
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
      });
    } catch (error) {
      if (options.onError) {
        options.onError(error as Error);
      }
      throw error;
    }
  }

  public streamChatWithContext(options: {
    userInput: string;
    previousMessages: StreamingMessage[];
    contextData?: string[];
    systemPrompt: string;
  }): StreamTextResult<never, never> {
    const {
      userInput,
      previousMessages,
      contextData = [],
      systemPrompt,
    } = options;

    // Prepare context for AI
    const contextPrompt =
      contextData.length > 0
        ? `Here is relevant information based on our database:\n${contextData.join('\n')}`
        : 'No specific information found in the database.';

    const messages: StreamingMessage[] = [
      ...previousMessages,
      {
        role: 'user',
        content: `${userInput}\n\n${contextPrompt}`,
      },
    ];

    return this.createStream({
      messages,
      systemPrompt,
    });
  }
}
