// This rules are disabled as we are testing private methods and properties
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/dot-notation */
import OpenAI from 'openai';

import { OpenAIClient } from '@/ai/index';
import type {
  AIRole,
  OpenAIChatModel,
  OpenAISendPromptRequest,
} from '@/ai/types';

jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => {
    return {
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [{ message: { content: 'Test response' } }],
          }),
        },
      },
    };
  });
});

describe('OpenAIClient', () => {
  let client: OpenAIClient;
  let mockedOpenAI: jest.Mocked<OpenAI>;

  const mockedApiKey = process.env.OPENAI_API_KEY;
  const defaultMockModel = process.env.OPENAI_DEFAULT_MODEL as OpenAIChatModel;

  const mockModel: OpenAIChatModel = 'gpt-4';
  const fakeResponse = {
    choices: [{ message: { content: 'Test response' } }],
  };

  beforeEach(() => {
    mockedOpenAI = new OpenAI({ apiKey: mockedApiKey }) as jest.Mocked<OpenAI>;
    mockedOpenAI.chat.completions.create = jest
      .fn()
      .mockResolvedValue(fakeResponse);
    client = new OpenAIClient({
      systemPrompt: 'System prompt',
      model: mockModel,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize OpenAI client with default values', () => {
    expect(client).toBeDefined();
    expect(client['messageHistory']).toHaveLength(1);
    expect(client['messageHistory'][0]).toEqual({
      role: 'system',
      content: 'System prompt',
    });
    expect(client['defaultModel']).toEqual(mockModel);
  });

  it('should initialize OpenAI client env model if no model given', () => {
    const mockedClient = new OpenAIClient({ systemPrompt: 'System prompt' });
    expect(mockedClient).toBeDefined();
    expect(mockedClient['defaultModel']).toEqual(defaultMockModel);
  });

  it('should initialize with no system prompt and default model of no config is given', () => {
    const clientWithSystemPrompt = new OpenAIClient();

    expect(clientWithSystemPrompt['defaultModel']).toBe(defaultMockModel);
    expect(clientWithSystemPrompt['messageHistory']).toHaveProperty(
      'length',
      0
    );
  });

  it('should add messages to history correctly', () => {
    const message = { content: 'User message', role: 'user' as AIRole };
    client['addMessageToHistory'](message);
    expect(client['messageHistory']).toContainEqual(message);
  });

  it('should send a prompt and return the correct response', async () => {
    const promptText = 'Hello!';
    const result = await client.sendPrompt({ prompt: promptText });

    const expectedRequest: OpenAISendPromptRequest = {
      model: mockModel,
      messages: [
        { role: 'system', content: 'System prompt' },
        { role: 'user', content: promptText },
        { role: 'assistant', content: 'Test response' },
      ],
      max_tokens: 2048,
      temperature: 0.3,
    };

    expect(client['client'].chat.completions.create).toHaveBeenCalledWith(
      expectedRequest
    );

    expect(result).toEqual(fakeResponse.choices[0]?.message.content);

    expect(client['messageHistory']).toContainEqual({
      role: 'assistant',
      content: 'Test response',
    });
  });

  it('should handle empty response from OpenAI API', async () => {
    // Override mocked response to return no choices
    (
      client['client'].chat.completions.create as jest.Mock
    ).mockResolvedValueOnce({
      choices: [],
    });

    await expect(client.sendPrompt({ prompt: 'Test' })).rejects.toThrow(
      'No choices returned from OpenAI API'
    );
  });

  it('should handle empty message fallback from content to avoid unexpected errors', async () => {
    // Override mocked response to return undefined content
    (
      client['client'].chat.completions.create as jest.Mock
    ).mockResolvedValueOnce({
      choices: [{ message: { content: undefined } }],
    });

    const result = await client.sendPrompt({ prompt: 'Test' });

    expect(client['messageHistory']).toContainEqual({
      role: 'assistant',
      content: '',
    });
    expect(result).toEqual('');
  });

  it('should handle optional parameters correctly', async () => {
    const result = await client.sendPrompt({
      prompt: 'Test with role and content',
      content: 'Extra content',
      role: 'user',
    });

    expect(client['messageHistory']).toContainEqual({
      role: 'user',
      content: 'Test with role and content\n\nExtra content',
    });
    expect(result).toEqual('Test response');
  });
});
