import { Provider, ProviderRequest, ProviderResponseChunk, ProviderCapabilities } from './types';
import { generateId } from './id';

export class MockProvider implements Provider {
  id = 'mock-provider';
  capabilities: ProviderCapabilities = {
    streaming: true,
    tools: true,
  };

  async complete(input: ProviderRequest): Promise<ProviderResponseChunk[]> {
    const chunks: ProviderResponseChunk[] = [];
    for await (const chunk of this.stream(input)) {
      chunks.push(chunk);
    }
    return chunks;
  }

  async *stream(input: ProviderRequest): AsyncIterable<ProviderResponseChunk> {
    const lastMessage = input.messages[input.messages.length - 1];

    if (lastMessage.role === 'tool') {
        const responseText = `The tool execution was successful. The result is: ${lastMessage.content}`;
        for (const char of responseText) {
            yield { type: 'text', text: char };
            await new Promise((resolve) => setTimeout(resolve, 5));
        }
        yield { type: 'done' };
        return;
    }

    const lastUserMessage = input.messages
      .filter((m) => m.role === 'user')
      .pop();

    if (lastUserMessage?.content?.includes('get_current_time_and_date')) {
        yield {
            type: 'tool_call',
            toolCall: { id: generateId('tool'), name: 'get_current_time', arguments: {} },
        };
        yield {
            type: 'tool_call',
            toolCall: { id: generateId('tool'), name: 'get_current_date', arguments: {} },
        };
        yield { type: 'done' };
        return;
    }

    if (lastUserMessage?.content?.includes('non_existent_tool')) {
        yield {
            type: 'tool_call',
            toolCall: { id: generateId('tool'), name: 'non_existent_tool', arguments: {} },
        };
        yield { type: 'done' };
        return;
    }

    if (lastUserMessage?.content?.includes('failing_tool')) {
        yield {
            type: 'tool_call',
            toolCall: { id: generateId('tool'), name: 'failing_tool', arguments: {} },
        };
        yield { type: 'done' };
        return;
    }

    if (
      lastUserMessage?.content?.includes('get_current_time') &&
      input.tools?.some((t) => t.name === 'get_current_time')
    ) {
      yield {
        type: 'tool_call',
        toolCall: {
          id: generateId('tool'),
          name: 'get_current_time',
          arguments: {},
        },
      };
      yield { type: 'done' };
      return;
    }

    const responseText = `This is a mock response to: "${lastUserMessage?.content}"`;
    for (const char of responseText) {
        yield { type: 'text', text: char };
        await new Promise((resolve) => setTimeout(resolve, 5));
    }
    yield { type: 'done' };
  }
}
