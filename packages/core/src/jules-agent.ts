import { AgentOptions, ToolDefinition } from './types';

export const julesTools: ToolDefinition[] = [
  {
    name: 'list_files',
    description: 'Lists all files and directories under the given directory.',
    parameters: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'The directory path to list files from. Defaults to the root of the repo.',
        },
      },
    },
  },
  {
    name: 'read_file',
    description: 'Reads the content of the specified file in the repo.',
    parameters: {
      type: 'object',
      properties: {
        filepath: {
          type: 'string',
          description: 'The path of the file to read, relative to the repo root.',
        },
      },
      required: ['filepath'],
    },
  },
  {
    name: 'create_file_with_block',
    description: 'Use this to create a new file.',
    parameters: {
      type: 'object',
      properties: {
        filepath: {
          type: 'string',
          description: 'The path of the file to create.',
        },
        content: {
          type: 'string',
          description: 'The content to write to the new file.',
        },
      },
      required: ['filepath', 'content'],
    },
  },
  {
    name: 'overwrite_file_with_block',
    description: 'Use this tool to completely replace the entire content of an existing file.',
    parameters: {
      type: 'object',
      properties: {
        filepath: {
          type: 'string',
          description: 'The path of the file to overwrite.',
        },
        content: {
          type: 'string',
          description: 'The new content for the file.',
        },
      },
      required: ['filepath', 'content'],
    },
  },
    {
    name: 'run_in_bash_session',
    description: 'Runs the given bash command in the sandbox.',
    parameters: {
      type: 'object',
      properties: {
        command: {
          type: 'string',
          description: 'The bash command to run.',
        },
      },
      required: ['command'],
    },
  },
  {
    name: 'set_plan',
    description: 'Use it after initial exploration to set the first plan, and later as needed if the plan is updated.',
    parameters: {
      type: 'object',
      properties: {
        plan: {
          type: 'string',
          description: 'The plan to solve the issue, in Markdown format.',
        },
      },
      required: ['plan'],
    },
  },
];

export const julesAgent: AgentOptions = {
  id: 'jules-v1',
  name: 'Jules',
  provider: 'openai',
  model: 'gpt-4',
  systemPrompt: 'You are Jules, a skilled software engineer. Your purpose is to assist users by completing coding tasks. You are resourceful and will use the tools at your disposal to accomplish your goals.',
  tools: julesTools,
};
