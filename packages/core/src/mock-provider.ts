import { Provider, ProviderRequest, ProviderResponseChunk, ProviderCapabilities } from './types';

export class MockProvider implements Provider {
  id = 'mock-provider';
  capabilities: ProviderCapabilities = {
    streaming: false,
    tools: false,
  };

  async complete(input: ProviderRequest): Promise<ProviderResponseChunk[]> {
    const lastMessage = input.messages[input.messages.length - 1];
    const responseText = `This is a mock response to: "${lastMessage.content}"`;

    return [
      {
        type: 'text',
        text: responseText,
      },
      {
        type: 'done',
      },
    ];
  }

  async *stream(input: ProviderRequest): AsyncIterable<ProviderResponseChunk> {
    const lastMessage = input.messages[input.messages.length - 1];
    const responseText = `This is a mock streamed response to: "${lastMessage.content}"`;

    for (const char of responseText) {
      yield {
        type: 'text',
        text: char,
      };
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    yield {
      type: 'done',
    };
  }
}
