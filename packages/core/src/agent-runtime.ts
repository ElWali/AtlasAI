import {
  Agent,
  AgentChatResult,
  Conversation,
  Message,
  Provider,
  Tool,
} from './types';
import { conversationToProviderRequest, providerChunksToAssistantMessage } from './mapping';

// A mock provider registry for now. In a real scenario, this would
// be a class that manages different provider instances.
export interface ProviderRegistry {
  get(id: string): Provider | undefined;
}

export class AgentRuntime {
  public readonly agent: Agent;
  public readonly tools: Map<string, Tool>;
  private provider: Provider;

  constructor(agent: Agent, providerRegistry: ProviderRegistry) {
    this.agent = agent;
    this.tools = new Map();

    const provider = providerRegistry.get(agent.options.provider);
    if (!provider) {
      throw new Error(`Provider "${agent.options.provider}" not found.`);
    }
    this.provider = provider;
  }

  /**
   * Handles a single, non-streaming chat turn for the agent.
   *
   * @param conversation - The current state of the conversation.
   * @param nextMessage - The new message to process.
   * @returns A promise that resolves to the agent's response.
   */
  async chat(
    conversation: Conversation,
    nextMessage: Message
  ): Promise<AgentChatResult> {
    const fullConversation: Conversation = {
      ...conversation,
      messages: [...conversation.messages, nextMessage],
    };

    // 1. Build the request for the provider
    const providerRequest = conversationToProviderRequest(
      fullConversation,
      this.agent
    );

    // 2. Invoke the provider
    const chunks = await this.provider.complete(providerRequest);

    // 3. Process the response (tool calls will be handled in a later step)
    // For now, we assume the response is a simple text message.
    const assistantMessage = providerChunksToAssistantMessage(chunks);

    return {
      assistantMessage,
      intermediateMessages: [], // Tool messages will be added here later
    };
  }
}
