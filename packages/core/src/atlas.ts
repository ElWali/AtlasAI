import { Agent, AgentOptions, AtlasOptions, Conversation, Message, Provider, Tool } from './types';
import { AgentRuntime, ProviderRegistry } from './agent-runtime';
import { agent as createAgent } from './agent';

export class Atlas {
  private agents: Map<string, Agent> = new Map();
  private agentRuntimes: Map<string, AgentRuntime> = new Map();
  private currentAgentId?: string;
  private providerRegistry: ProviderRegistry;

  constructor(options: AtlasOptions, providerRegistry: ProviderRegistry, tools?: Tool[]) {
    this.providerRegistry = providerRegistry;
    if (options.agents) {
      for (const agentOpts of options.agents) {
        const agent = createAgent(agentOpts);
        this.registerAgent(agent, tools);
      }
    }
    this.currentAgentId = options.defaultAgentId || options.agents?.[0]?.id;
  }

  registerAgent(agent: Agent, tools?: Tool[]): this {
    this.agents.set(agent.id, agent);
    this.agentRuntimes.set(agent.id, new AgentRuntime(agent, this.providerRegistry, tools));
    return this;
  }

  setAgent(agent: Agent): this {
    if (!this.agents.has(agent.id)) {
      throw new Error(`Agent with id "${agent.id}" not registered.`);
    }
    this.currentAgentId = agent.id;
    return this;
  }

  setAgentById(agentId: string): this {
    if (!this.agents.has(agentId)) {
      throw new Error(`Agent with id "${agentId}" not registered.`);
    }
    this.currentAgentId = agentId;
    return this;
  }

  getAgent(): Agent | null {
    return this.currentAgentId ? this.agents.get(this.currentAgentId) ?? null : null;
  }

  async ask(
    conversation: Conversation,
    nextMessage: Message,
    agentId?: string
  ) {
    const runtime = this.getAgentRuntime(agentId);
    return runtime.chat(conversation, nextMessage, { streaming: false });
  }

  async send(
    conversation: Conversation,
    nextMessage: Message,
    agentId?: string
  ) {
    const runtime = this.getAgentRuntime(agentId);
    return runtime.chat(conversation, nextMessage, { streaming: true });
  }

  private getAgentRuntime(agentId?: string): AgentRuntime {
    const id = agentId || this.currentAgentId;
    if (!id) {
      throw new Error('No agent specified and no default agent set.');
    }
    const runtime = this.agentRuntimes.get(id);
    if (!runtime) {
      throw new Error(`Agent with id "${id}" not found.`);
    }
    return runtime;
  }
}
