import type OpenAI from 'openai';

export type AIRole = 'system' | 'user' | 'assistant';

export type MessageHistoryType = {
  role: AIRole;
  content: string;
};

export type OpenAIChatModel = OpenAI.Chat.ChatModel;

export type OpenAISendPromptRequest =
  OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming;
