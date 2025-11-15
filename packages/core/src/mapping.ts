import {
  Agent,
  Conversation,
  Message,
  ProviderRequest,
  ProviderResponseChunk,
  TextContent,
} from './types';

/**
 * Maps a conversation and agent to a provider request.
 *
 * @param conversation - The current conversation.
 * @param agent - The agent handling the conversation.
 * @returns A provider request object.
 */
export function conversationToProviderRequest(
  conversation: Conversation,
  agent: Agent
): ProviderRequest {
  return {
    model: agent.options.model,
    messages: conversation.messages.map((message) => {
      // For now, we only handle simple text content.
      const textContent = message.content.find(
        (c) => c.type === 'text'
      ) as TextContent | undefined;
      return {
        role: message.role,
        content: textContent?.text || '',
      };
    }),
    temperature: agent.options.temperature,
    maxTokens: agent.options.maxTokens,
    // Tools will be handled in a later step
  };
}

/**
 * Maps provider response chunks to an assistant message.
 *
 * @param chunks - An array of provider response chunks.
 * @returns An assistant message.
 */
export function providerChunksToAssistantMessage(
  chunks: ProviderResponseChunk[]
): Message {
  const text = chunks
    .map((chunk) => (chunk.type === 'text' ? chunk.text : ''))
    .join('');

  return {
    id: `asst_${new Date().toISOString()}`, // Simple ID generation for now
    role: 'assistant',
    createdAt: Date.now(),
    content: [{ type: 'text', text }],
  };
}
