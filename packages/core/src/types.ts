// core roles
export type Role = 'system' | 'user' | 'assistant' | 'tool';

// messages
export interface BaseMessage {
  id: string;
  role: Role;
  createdAt: number;
  metadata?: Record<string, any>;
}

export interface TextContent {
  type: 'text';
  text: string;
}

export interface ToolCallContent {
  type: 'tool_call';
  toolCallId: string;
  name: string;
  arguments: any;
}

export interface ToolResultContent {
  type: 'tool_result';
  toolCallId: string;
  status: 'ok' | 'error';
  result: any;
}

export type MessageContent = TextContent | ToolCallContent | ToolResultContent;

export interface Message extends BaseMessage {
  content: MessageContent[];
}

// conversation
export interface Conversation {
  id: string;
  messages: Message[];
  metadata?: Record<string, any>;
}

// Agent Configuration
export interface AgentOptions {
  id: string;
  name?: string;

  // Which provider and model to use
  provider: string;                 // provider id (e.g. 'openai', 'http')
  model: string;                    // model identifier

  // Behavior settings
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;

  // Tooling
  tools?: ToolDefinition[];

  metadata?: Record<string, any>;
}

// Agent Runtime Object
export interface Agent {
  id: string;
  options: AgentOptions;
}

export interface AgentChatResult {
    assistantMessage: Message;
    intermediateMessages: Message[]; // e.g., tool calls/results if any
}

export interface AgentChatStream {
    streamId: string;
    // Implementation detail: Atlas wraps this into AtlasStream
}

// Tools
export interface ToolParameterSchema {
    type: 'object';
    properties: Record<
      string,
      { type: 'string' | 'number' | 'boolean' | 'object' | 'array'; description?: string }
    >;
    required?: string[];
}

export interface ToolDefinition {
    name: string;
    description?: string;
    parameters: ToolParameterSchema;
}

export interface ToolHandlerContext {
    conversation: Conversation;  // full conversation up to this point
    agent: Agent;                // agent invoking the tool
    requestId: string;           // link to outer request/stream
    metadata?: Record<string, any>;
}

export interface Tool {
    definition: ToolDefinition;
    handler: (args: any, ctx: ToolHandlerContext) => Promise<any>;
}

// Provider
export interface ProviderCapabilities {
    streaming: boolean;
    tools: boolean;
}

export interface ProviderRequestMessage {
    role: Role;
    content: string | null;
    name?: string;
    tool_calls?: { id: string; name: string; arguments: any }[];
    tool_call_id?: string;
}

export interface ProviderTool {
    name: string;
    description?: string;
    parameters: ToolParameterSchema;
}

export interface ProviderRequest {
    model: string;
    messages: ProviderRequestMessage[];
    tools?: ProviderTool[];
    toolChoice?: 'auto' | 'none' | string;
    temperature?: number;
    maxTokens?: number;
    metadata?: Record<string, any>;
}

export interface ProviderToolCall {
    id: string;
    name: string;
    arguments: any;
}

export interface ProviderResponseChunk {
    type: 'text' | 'tool_call' | 'done';
    text?: string;
    toolCall?: ProviderToolCall;
    metadata?: Record<string, any>;
}

export interface Provider {
    id: string;
    capabilities: ProviderCapabilities;

    complete(input: ProviderRequest): Promise<ProviderResponseChunk[]>;

    stream(input: ProviderRequest): AsyncIterable<ProviderResponseChunk>;
}

// Atlas
export interface AtlasOptions {
    agents?: AgentOptions[];
    defaultAgentId?: string;
}
