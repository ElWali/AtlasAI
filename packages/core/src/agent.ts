import { Agent, AgentOptions } from './types';

/**
 * Factory function to create a new Agent.
 *
 * @param options - The configuration options for the agent.
 * @returns A new Agent instance.
 */
export function agent(options: AgentOptions): Agent {
  return {
    id: options.id,
    options,
  };
}
