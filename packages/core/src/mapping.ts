import {
  Agent,
  Conversation,
  Message,
  ProviderRequest,
  ProviderRequestMessage,
  ProviderResponseChunk,
  TextContent,
  ToolCallContent,
  ToolResultContent,
} from './types';
import { generateId } from './id';

/**
 * Maps a conversation and agent to a provider request.
 */
export function conversationToProviderRequest(
  conversation: Conversation,
  agent: Agent
): ProviderRequest {
  const messages = conversation.messages.flatMap((message) => {
    const textContent = message.content
      .filter((c) => c.type === 'text')
      .map((c) => (c as TextContent).text)
      .join('\n');

    const toolCalls = message.content
      .filter((c) => c.type === 'tool_call')
      .map((c) => c as ToolCallContent);

    const toolResults = message.content
      .filter((c) => c.type === 'tool_result')
      .map((c) => c as ToolResultContent);

    const providerMessages: ProviderRequestMessage[] = [];

    if (textContent) {
      providerMessages.push({
        role: message.role,
        content: textContent,
      });
    }

    if (toolCalls.length > 0) {
      providerMessages.push({
        role: 'assistant',
        content: null,
        tool_calls: toolCalls.map(tc => ({ id: tc.toolCallId, name: tc.name, arguments: tc.arguments })),
      });
    }

    if (toolResults.length > 0) {
        for (const result of toolResults) {
            providerMessages.push({
                role: 'tool',
                content: JSON.stringify(result.result),
                tool_call_id: result.toolCallId,
            });
        }
    }

    return providerMessages;
  });

  return {
    model: agent.options.model,
    messages: messages,
    tools: agent.options.tools, // Pass tool definitions
    temperature: agent.options.temperature,
    maxTokens: agent.options.maxTokens,
  };
}

/**
 * Maps provider response chunks to an assistant message.
 */
export function providerChunksToAssistantMessage(
  chunks: ProviderResponseChunk[]
): Message {
  const text = chunks
    .filter((chunk) => chunk.type === 'text')
    .map((chunk) => chunk.text || '')
    .join('');

  return {
    id: generateId('asst'),
    role: 'assistant',
    createdAt: Date.now(),
    content: [{ type: 'text', text }],
  };
}
