import {
  Agent,
  AgentChatResult,
  Conversation,
  Message,
  Provider,
  ProviderResponseChunk,
  Tool,
  ToolCallContent,
  ToolResultContent,
  TextContent,
  AgentChatStream,
} from './types';
import { conversationToProviderRequest, providerChunksToAssistantMessage } from './mapping';
import { generateId } from './id';

export interface ProviderRegistry {
  get(id: string): Provider | undefined;
}

export class AgentRuntime {
  public readonly agent: Agent;
  public readonly tools: Map<string, Tool>;
  private provider: Provider;

  constructor(agent: Agent, providerRegistry: ProviderRegistry, tools?: Tool[]) {
    this.agent = agent;
    this.tools = new Map();

    const agentToolNames = new Set(agent.options.tools?.map(t => t.name) ?? []);
    if (tools) {
      for (const tool of tools) {
        if (agentToolNames.has(tool.definition.name)) {
          this.tools.set(tool.definition.name, tool);
        }
      }
    }

    const provider = providerRegistry.get(agent.options.provider);
    if (!provider) {
      throw new Error(`Provider "${agent.options.provider}" not found.`);
    }
    this.provider = provider;
  }

  async chat(
    conversation: Conversation,
    nextMessage: Message,
    opts?: { streaming?: boolean }
  ): Promise<AgentChatResult | AsyncIterable<ProviderResponseChunk>> {
    if (opts?.streaming) {
      return this.streamChat(conversation, nextMessage);
    }
    return this.nonStreamChat(conversation, nextMessage);
  }

  private async nonStreamChat(
    conversation: Conversation,
    nextMessage: Message
  ): Promise<AgentChatResult> {
    const currentConversation: Conversation = {
      ...conversation,
      messages: [...conversation.messages, nextMessage],
    };
    const intermediateMessages: Message[] = [];

    while (true) {
      const providerRequest = conversationToProviderRequest(
        currentConversation,
        this.agent
      );
      const chunks = await this.provider.complete(providerRequest);
      const toolCalls = chunks.filter((chunk) => chunk.type === 'tool_call');

      if (toolCalls.length === 0) {
        const assistantMessage = providerChunksToAssistantMessage(chunks);
        return {
          assistantMessage,
          intermediateMessages,
        };
      }

      const { toolCallMessages, newIntermediateMessages } = await this.handleToolCalls(toolCalls, currentConversation);
      currentConversation.messages.push(...toolCallMessages);
      intermediateMessages.push(...newIntermediateMessages);
    }
  }

  private async *streamChat(
    conversation: Conversation,
    nextMessage: Message
  ): AsyncIterable<ProviderResponseChunk> {
    const currentConversation: Conversation = {
      ...conversation,
      messages: [...conversation.messages, nextMessage],
    };

    while (true) {
      const providerRequest = conversationToProviderRequest(
        currentConversation,
        this.agent
      );
      const stream = this.provider.stream(providerRequest);
      const toolCalls: ProviderResponseChunk[] = [];
      let hasToolCall = false;

      for await (const chunk of stream) {
        if (chunk.type === 'tool_call') {
          hasToolCall = true;
          toolCalls.push(chunk);
        }
        yield chunk;
      }

      if (!hasToolCall) {
        return;
      }

      const { toolCallMessages } = await this.handleToolCalls(toolCalls, currentConversation);
      currentConversation.messages.push(...toolCallMessages);
    }
  }

  private async handleToolCalls(toolCalls: ProviderResponseChunk[], currentConversation: Conversation): Promise<{toolCallMessages: Message[], newIntermediateMessages: Message[]}> {
      const toolCallMessages: Message[] = [];
      const newIntermediateMessages: Message[] = [];

      const assistantToolCallMsg: Message = {
        id: generateId('asst'),
        role: 'assistant',
        createdAt: Date.now(),
        content: toolCalls.map(
          (chunk) =>
            ({
              type: 'tool_call',
              toolCallId: chunk.toolCall!.id,
              name: chunk.toolCall!.name,
              arguments: chunk.toolCall!.arguments,
            } as ToolCallContent)
        ),
      };
      toolCallMessages.push(assistantToolCallMsg);
      newIntermediateMessages.push(assistantToolCallMsg);

      for (const chunk of toolCalls) {
        const toolCall = chunk.toolCall!;
        const tool = this.tools.get(toolCall.name);

        let result: any;
        let status: 'ok' | 'error' = 'ok';

        if (!tool) {
          result = `Tool "${toolCall.name}" not found.`;
          status = 'error';
        } else {
          try {
            result = await tool.handler(toolCall.arguments, {
              conversation: currentConversation,
              agent: this.agent,
              requestId: generateId('req'),
            });
          } catch (error) {
            result = error instanceof Error ? error.message : String(error);
            status = 'error';
          }
        }

        const toolResultMsg: Message = {
          id: generateId('tool'),
          role: 'tool',
          createdAt: Date.now(),
          content: [
            {
              type: 'tool_result',
              toolCallId: toolCall.id,
              status,
              result,
            } as ToolResultContent,
          ],
        };
        toolCallMessages.push(toolResultMsg);
        newIntermediateMessages.push(toolResultMsg);
      }

      return { toolCallMessages, newIntermediateMessages };
  }
}
