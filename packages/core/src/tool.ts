import { Tool, ToolDefinition } from './types';

/**
 * Factory function to create a new Tool.
 *
 * @param definition - The schema for the tool.
 * @param handler - The function to execute when the tool is called.
 * @returns A new Tool instance.
 */
export function tool<T extends Record<string, any>>(
  definition: ToolDefinition,
  handler: (args: T) => Promise<any>
): Tool {
  return {
    definition,
    handler,
  };
}
