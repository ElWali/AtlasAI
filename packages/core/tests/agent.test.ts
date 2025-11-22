import { Atlas } from '../src/atlas';
import { MockProvider } from '../src/mock-provider';
import { tool } from '../src/tool';
import { AgentOptions, Conversation, Message, Provider } from '../src/types';
import { ProviderRegistry } from '../src/agent-runtime';
import assert from 'assert';

class SimpleProviderRegistry implements ProviderRegistry {
    private providers: Map<string, Provider> = new Map();
    constructor(providers: Provider[]) {
        for (const provider of providers) {
            this.providers.set(provider.id, provider);
        }
    }
    get(id: string): Provider | undefined {
        return this.providers.get(id);
    }
}

const mockProvider = new MockProvider();
const mockOpenAIProvider = new MockProvider();
mockOpenAIProvider.id = 'openai';

const providerRegistry = new SimpleProviderRegistry([mockProvider, mockOpenAIProvider]);

const getTimeTool = tool(
  {
    name: 'get_current_time',
    description: 'Gets the current time.',
    parameters: {
      type: 'object',
      properties: {},
    },
  },
  async () => new Date().toISOString()
);

const agentOpts: AgentOptions = {
  id: 'test-agent',
  provider: mockProvider.id,
  model: 'test-model',
  tools: [getTimeTool.definition],
};

const atlas = new Atlas({ agents: [agentOpts], defaultAgentId: agentOpts.id }, providerRegistry, [getTimeTool]);

async function testNonStreamingToolCall() {
    const conversation: Conversation = {
        id: 'conv-1',
        messages: [],
    };
    const userMessage: Message = {
        id: 'msg-1',
        role: 'user',
        createdAt: Date.now(),
        content: [{ type: 'text', text: 'get_current_time' }],
    };

    const result = await atlas.ask(conversation, userMessage, agentOpts.id) as any;

    assert(result.assistantMessage.content[0].text.includes('The tool execution was successful'));
}

async function testStreaming() {
    const conversation: Conversation = {
        id: 'conv-2',
        messages: [],
    };
    const userMessage: Message = {
        id: 'msg-2',
        role: 'user',
        createdAt: Date.now(),
        content: [{ type: 'text', text: 'Hello' }],
    };

    const stream = await atlas.send(conversation, userMessage, agentOpts.id) as any;
    let text = '';
    for await (const chunk of stream) {
        if (chunk.type === 'text') {
            text += chunk.text;
        }
    }

    assert(text.includes('This is a mock response to: "Hello"'));
}

async function runTests() {
    await testNonStreamingToolCall();
    await testStreaming();
}

runTests().then(() => console.log('All tests passed!')).catch(err => {
    console.error('Tests failed:', err);
    process.exit(1);
});
