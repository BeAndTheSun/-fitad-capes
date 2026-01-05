// TODO: Check a better solution for jest testing with OpenAI to avoid this imports
import 'openai/shims/web';

import OpenAI from 'openai';

import { config } from './config/env';
import type {
  AIRole,
  MessageHistoryType,
  OpenAIChatModel,
  OpenAISendPromptRequest,
} from './types';

export class OpenAIClient {
  private client: OpenAI;

  private messageHistory: MessageHistoryType[];

  private defaultModel: OpenAIChatModel;

  public constructor(args?: {
    systemPrompt?: string;
    model?: OpenAIChatModel;
  }) {
    const { model, systemPrompt } = args || {};

    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    this.defaultModel =
      model || (config.openAi.defaultModel as OpenAIChatModel);

    this.messageHistory = [];

    if (systemPrompt) {
      this.messageHistory.push({ role: 'system', content: systemPrompt });
    }
  }

  private addMessageToHistory(args: { content: string; role: AIRole }): void {
    const { content, role } = args;

    this.messageHistory.push({ role, content });
  }

  public async sendPrompt(args: {
    prompt: string;
    content?: string;
    role?: AIRole;
    model?: OpenAIChatModel;
  }): Promise<string> {
    const { prompt, content, role, model } = args;

    const composedPrompt = content ? `${prompt}\n\n${content}` : prompt;

    this.addMessageToHistory({ role: role || 'user', content: composedPrompt });

    const request: OpenAISendPromptRequest = {
      model: model || this.defaultModel,
      messages: this.messageHistory,
      max_tokens: 2048,
      temperature: 0.3,
    };

    const response = await this.client.chat.completions.create(request);

    if (!response || !response.choices || response.choices.length === 0) {
      throw new Error('No choices returned from OpenAI API');
    }

    const completionText = response.choices[0]?.message.content ?? '';
    this.messageHistory.push({ role: 'assistant', content: completionText });

    return completionText;
  }

  public async getEmbeddings(text: string | string[]): Promise<number[][]> {
    const response = await this.client.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    });
    return response.data.map((item) => item.embedding);
  }

  public async processChatBotInput(
    input: string,
    retrievedData: string[]
  ): Promise<string> {
    const prompt = `
    The user asked: ${input}
    
    Respond to the user with a friendly, conversational tone, summarizing the key points and answering their query in a natural way.
   '`;

    // get the completion
    const completion = await this.sendPrompt({
      prompt,
      content: `Here is relevant information based on our database:
    ${retrievedData.join('\n')}`,
    });

    return completion;
  }
}
