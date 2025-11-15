import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { Atlas } from '../src/atlas';
import { MockProvider } from '../src/mock-provider';
import { tool } from '../src/tool';
import { AgentOptions, Conversation, Message } from '../src/types';
import { ProviderRegistry } from '../src/agent-runtime';
import { Provider } from '../src/types';
import { agent } from '../src/agent';

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
const providerRegistry = new SimpleProviderRegistry([mockProvider]);

const getTimeTool = tool(
  {
    name: 'get_current_time',
    description: 'Gets the current time.',
    parameters: { type: 'object', properties: {} },
  },
  async () => new Date().toTimeString()
);

const getDateTool = tool(
    {
      name: 'get_current_date',
      description: 'Gets the current date.',
      parameters: { type: 'object', properties: {} },
    },
    async () => new Date().toDateString()
);

const failingTool = tool(
    {
        name: 'failing_tool',
        description: 'A tool that always fails.',
        parameters: { type: 'object', properties: {} },
    },
    async () => {
        throw new Error('This tool failed');
    }
)

const agentOpts: AgentOptions = {
  id: 'test-agent',
  provider: mockProvider.id,
  model: 'test-model',
  tools: [getTimeTool.definition, getDateTool.definition, failingTool.definition],
};

const atlas = new Atlas({ agents: [agentOpts] }, providerRegistry, [getTimeTool, getDateTool, failingTool]);

test('should handle multiple tool calls in one turn', async () => {
    const conversation: Conversation = { id: 'conv-1', messages: [] };
    const userMessage: Message = {
        id: 'msg-1',
        role: 'user',
        createdAt: Date.now(),
        content: [{ type: 'text', text: 'get_current_time_and_date' }],
    };

    const result = await atlas.ask(conversation, userMessage) as any;

    assert.ok(result.assistantMessage.content[0].text.includes('The tool execution was successful'));
    assert.equal(result.intermediateMessages.length, 3);
    assert.equal(result.intermediateMessages[0].content.length, 2);
    assert.equal(result.intermediateMessages[0].content[0].name, 'get_current_time');
    assert.equal(result.intermediateMessages[0].content[1].name, 'get_current_date');
});

test('should handle tool not found', async () => {
    const conversation: Conversation = { id: 'conv-2', messages: [] };
    const userMessage: Message = {
        id: 'msg-2',
        role: 'user',
        createdAt: Date.now(),
        content: [{ type: 'text', text: 'non_existent_tool' }],
    };

    const result = await atlas.ask(conversation, userMessage) as any;

    assert.ok(result.assistantMessage.content[0].text.includes('The tool execution was successful'));
    assert.equal(result.intermediateMessages[1].content[0].status, 'error');
    assert.ok(result.intermediateMessages[1].content[0].result.includes('not found'));
});

test('should handle tool handler error', async () => {
    const conversation: Conversation = { id: 'conv-3', messages: [] };
    const userMessage: Message = {
        id: 'msg-3',
        role: 'user',
        createdAt: Date.now(),
        content: [{ type: 'text', text: 'failing_tool' }],
    };

    const result = await atlas.ask(conversation, userMessage) as any;
    assert.ok(result.assistantMessage.content[0].text.includes('The tool execution was successful'));
    assert.equal(result.intermediateMessages[1].content[0].status, 'error');
    assert.ok(result.intermediateMessages[1].content[0].result.includes('This tool failed'));
})

test('should handle streaming with a mock provider that emits a tool call mid-stream', async () => {
    const conversation: Conversation = { id: 'conv-4', messages: [] };
    const userMessage: Message = {
        id: 'msg-4',
        role: 'user',
        createdAt: Date.now(),
        content: [{ type: 'text', text: 'get_current_time' }],
    };

    const stream = await atlas.send(conversation, userMessage) as any;
    let text = '';
    let toolCallCount = 0;
    for await (const chunk of stream) {
        if (chunk.type === 'text') {
            text += chunk.text;
        }
        if (chunk.type === 'tool_call') {
            toolCallCount++;
        }
    }

    assert.ok(text.includes('The tool execution was successful'));
    assert.equal(toolCallCount, 1);
});

test('should handle multi-agent selection', async () => {
    const agent2Opts: AgentOptions = {
        id: 'test-agent-2',
        provider: mockProvider.id,
        model: 'test-model-2',
    };
    atlas.registerAgent(agent(agent2Opts));
    atlas.setAgentById('test-agent-2');

    const conversation: Conversation = { id: 'conv-5', messages: [] };
    const userMessage: Message = {
        id: 'msg-5',
        role: 'user',
        createdAt: Date.now(),
        content: [{ type: 'text', text: 'Hello' }],
    };

    const result = await atlas.ask(conversation, userMessage, 'test-agent-2') as any;

    assert.ok(result.assistantMessage.content[0].text.includes('This is a mock response to: "Hello"'));
});

test.run();
