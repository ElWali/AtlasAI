# Atlas.js Agents

This document describes the **Agent layer** in Atlas.js: concepts, data models, runtime workflow, and how agents interact with providers, tools, and conversations.

It is intended as an implementation guide for both human teams and AI agents contributing to the project.

---

## 1. Concept & Responsibilities

In Atlas.js, an **Agent** is a configured “LLM persona” that encapsulates:

- **Model configuration**: provider, model, temperature, max tokens, system prompt.
- **Behavioral context**: name, description, metadata.
- **Tooling**: a set of callable tools/functions.
- **Runtime binding**: how it talks to a provider and handles messages.

Atlas core (`Atlas` instance) does **conversation orchestration**; the **Agent** encapsulates everything specific to the LLM + tools that should handle that conversation.

An Agent **does not own**:

- Transport-level concerns (HTTP details are in Providers).
- UI (DOM rendering is in `@atlas/ui`).
- Persistent storage (handled via stores/plugins).

---

## 2. Core Agent Data Model

### 2.1 Types Overview

All types below are conceptual TypeScript interfaces; actual code may refine them.

```ts
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
```

### 2.2 Agent Configuration

```ts
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
```

### 2.3 Agent Runtime Object

The public `Agent` object is lightweight:

```ts
export interface Agent {
  id: string;
  options: AgentOptions;
}
```

Internally, the runtime will use an **AgentRuntime** (implementation detail):

```ts
export interface AgentRuntime {
  agent: Agent;
  tools: Map<string, Tool>;
  providerId: string;

  // High-level API: orchestrate provider and tools for a single turn
  chat(
    conversation: Conversation,
    nextMessage: Message,
    opts?: { streaming?: boolean }
  ): Promise<AgentChatResult | AgentChatStream>;
}
```

Where:

```ts
export interface AgentChatResult {
  assistantMessage: Message;
  intermediateMessages: Message[]; // e.g., tool calls/results if any
}

export interface AgentChatStream {
  streamId: string;
  // Implementation detail: Atlas wraps this into AtlasStream
}
```

The `AgentRuntime` is responsible for:

- Translating conversation history into a `ProviderRequest`.
- Invoking the provider (streaming or not).
- Detecting tool calls and coordinating tool execution.
- Producing final `assistant` messages plus any intermediate `tool` messages.

---

## 3. Tools & Agent Tooling Model

### 3.1 Tool Schemas

```ts
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
```

### 3.2 Tool Runtime

```ts
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
```

Each Agent:

- Has a list of `ToolDefinition` in `AgentOptions.tools` (the schema exposed to the LLM).
- At runtime, each definition is bound to a `handler` and stored in `AgentRuntime.tools`.

`AgentRuntime` does:

1. Expose tool schemas to the provider in `ProviderRequest.tools`.
2. When a tool call is returned by provider:
   - Lookup the `Tool` by `name`.
   - Execute `handler(args, ctx)`.
   - Append a `tool` role message with `ToolResultContent` to the conversation.
   - Re-enter the provider with updated history.

---

## 4. Provider Interface from Agent’s Perspective

Agents do not talk directly to HTTP. They talk to Providers via a standard interface.

### 4.1 Provider Types

```ts
export interface ProviderCapabilities {
  streaming: boolean;
  tools: boolean;
}

export interface ProviderRequestMessage {
  role: Role;
  content: string;        // normalized text for provider
  name?: string;          // for tools/tool results if required by provider
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
```

### 4.2 Translation Layer

`AgentRuntime` is responsible for:

- Mapping `Conversation` + `nextMessage` → `ProviderRequest`:
  - **System prompt**: from `AtlasOptions` + `AgentOptions.systemPrompt`.
  - **Text messages**: user and assistant messages are concatenated text in `ProviderRequestMessage.content`.
  - **Tool calls**:
    - `ToolCallContent` becomes a provider-specific representation (e.g. `role: "assistant", content: ""`, with special `name` and JSON arguments for an OpenAI-style provider, or a text marker for simpler ones).
  - **Tool results**:
    - `ToolResultContent` becomes a `tool` role message or similar, depending on provider.

- Mapping `ProviderResponseChunk` → internal `MessageContent`:
  - `type: 'text'` → `TextContent`.
  - `type: 'tool_call'` → `ToolCallContent`.
  - `type: 'done'` → terminates streaming.

---

## 5. Agent-Oriented Workflows

This section explains the **full workflow** for the two main interaction patterns: non-streaming and streaming with tools.

### 5.1 Non-Streaming Single Turn (`Atlas.ask`)

**Goal:** User sends a message; Agent produces a full assistant response using its provider and tools (if any), but the user does not receive incremental tokens.

#### Steps

1. **User call**

   ```ts
   const reply = await atlas.ask("Explain WebSockets");
   ```

2. **Atlas prepares user message**

   - Generates `Message`:

     ```ts
     const userMessage: Message = {
       id: generateId(),
       role: 'user',
       createdAt: Date.now(),
       content: [{ type: 'text', text: "Explain WebSockets" }]
     };
     ```

   - Optionally passes through `interceptors.outgoingMessage`.
   - Adds `userMessage` to `conversation.messages`.

3. **Atlas resolves Agent & AgentRuntime**

   - If `options.agentId` is provided, choose that agent; else use default.
   - Lookup `Agent` by ID.
   - Acquire `AgentRuntime` instance for that Agent:
     - Contains bound tools.
     - Knows which provider to use.

4. **AgentRuntime builds ProviderRequest**

   - Read full `conversation.messages` plus `userMessage`.
   - Prepend a system message with `systemPrompt` (Atlas-level + Agent-level).
   - Map each message to `ProviderRequestMessage`.
   - Include `tools` definitions if:
     - Provider supports tools (`capabilities.tools === true`).
     - Agent has tools configured.

5. **AgentRuntime invokes provider**

   ```ts
   const chunks = await provider.complete(providerRequest);
   ```

6. **AgentRuntime processes chunks**

   - For non-streaming `complete`, we treat `chunks` as the full response.
   - Aggregate `text` chunks into a single string.
   - If any `tool_call` chunks appear:
     - Even in non-streaming mode, we still need to process them; see “Tools” below.
   - Build final `assistant` `Message` from aggregated text.

7. **Tool Calls (if present)**

   For each tool call detected in `chunks`:

   - Create an intermediate assistant message with `ToolCallContent`.
   - Append to `conversation.messages`.
   - Execute tool via its `handler(args, ctx)`.
   - Produce a `tool` role message with `ToolResultContent` and append.
   - Re-enter step 4 with this updated history:
     - Call `provider.complete()` again to let the model react to the tool result.
   - Loop until provider returns no more tool calls and a final text answer.

8. **AgentRuntime returns result**

   - Returns:

     ```ts
     const result: AgentChatResult = {
       assistantMessage,
       intermediateMessages
     };
     ```

9. **Atlas updates conversation**

   - Append `assistantMessage` and any tool-related intermediate messages.
   - Emit events:
     - `'message:sent'` for user message.
     - `'message:received'` for `assistantMessage`.

10. **`ask` resolves**

    - `atlas.ask()` resolves with `assistantMessage`.

### 5.2 Streaming with Tools (`Atlas.send`)

**Goal:** User (or UI) sends a message; Agent produces streaming tokens with the possibility of tool calls mid-stream.

#### Steps

1. **User/Caller invocation**

   ```ts
   const userMessage = /* same as above */;
   const stream = atlas.send(userMessage);
   ```

2. **Atlas stores message and emits events**

   - Append `userMessage` to `conversation.messages`.
   - Emit `'message:sent'`.

3. **Atlas resolves Agent & AgentRuntime**

   Same as non-streaming.

4. **AgentRuntime builds ProviderRequest** (as above, but with streaming in mind).

5. **AgentRuntime calls `provider.stream()`**

   ```ts
   const providerStream = provider.stream(providerRequest);
   ```

6. **Streaming loop**

   Pseudocode:

   ```ts
   let partialText = '';
   for await (const chunk of providerStream) {
     if (chunk.type === 'text') {
       partialText += chunk.text || '';
       // Emit intermediate stream event; Atlas uses it to update UI
       atlas.emit('stream:chunk', { chunk, streamId });
     }

     if (chunk.type === 'tool_call') {
       // Tool call handling (see next section)
     }

     if (chunk.type === 'done') {
       break;
     }
   }
   ```

7. **Tool call during streaming**

   - When a `chunk` with `type: 'tool_call'` arrives:

     ```ts
     const { id: toolCallId, name, arguments: args } = chunk.toolCall!;
     ```

   - Emit `'tool:called'` with `{ tool, args, toolCallId }`.
   - Lookup the corresponding `Tool` in `AgentRuntime.tools`.
   - Execute `handler(args, ctx)`:

     ```ts
     const result = await tool.handler(args, {
       conversation,
       agent,
       requestId: streamId,
       metadata: {}
     });
     ```

   - Construct two messages:
     1. A partial assistant message reflecting the model’s tool call:

        ```ts
        const assistantToolCallMsg: Message = {
          id: generateId(),
          role: 'assistant',
          createdAt: Date.now(),
          content: [{
            type: 'tool_call',
            toolCallId,
            name,
            arguments: args
          }]
        };
        ```

     2. A `tool` role message with `ToolResultContent`:

        ```ts
        const toolResultMsg: Message = {
          id: generateId(),
          role: 'tool',
          createdAt: Date.now(),
          content: [{
            type: 'tool_result',
            toolCallId,
            status: 'ok',
            result
          }]
        };
        ```

   - Append both to the conversation.
   - Emit `'tool:result'` event.

   - **Re-entry:** After tool execution, we must let the LLM continue:

     - Build a new `ProviderRequest` using the updated conversation (including tool result).
     - Call `provider.stream()` again with the new request; continue streaming.
     - Keep the same `streamId` for the caller.

8. **Final assistant message**

   - `partialText` accumulated across all `text` chunks becomes the final assistant response text.
   - Build `assistantMessage: Message` with a single `TextContent` containing `partialText`.
   - Append to conversation.
   - Emit `'stream:end'` and `'message:received'`.
   - The stream closes.

---

## 6. Multi-Agent Workflows

Multi-agent is conceptually:

- Multiple agents defined in the same Atlas instance.
- Either:
  - User chooses agent per message (UI-level routing), or
  - System plugins orchestrate message routing between agents.

### 6.1 Agent Definitions in AtlasOptions

```ts
export interface AtlasOptions {
  agents?: AgentOptions[];     // multiple agents
  defaultAgentId?: string;
}
```

On initialization:

- Atlas:

  - Normalizes all `AgentOptions` into `Agent` objects.
  - Creates an `AgentRuntime` for each.
  - Tracks `currentAgentId` (defaults to `defaultAgentId` or first agent).

### 6.2 Switching Agents

Public API example:

```ts
atlas.setAgent(agent: Agent): this;
atlas.setAgentById(agentId: string): this;
atlas.getAgent(): Agent | null;
```

Switching agent affects:

- Which `AgentRuntime` is used for subsequent messages.
- Provider/model/temperature/tools used.

### 6.3 Multi-Agent Orchestration (Plugin)

Core Atlas will not implement complex multi-agent workflows; instead, a plugin like `@atlas/plugins-multi-agent` will:

- Attach orchestration logic to `Atlas` via events and new methods.
- Example strategies:
  - **Role-based routing**:
    - One agent handles “code” questions; another handles “product” questions.
  - **Supervisor pattern**:
    - A “router” agent sees the question and decides which specialist agent should handle it.
  - **Sequential chain**:
    - Agent A calls a tool that triggers Agent B for further processing.

Plugin responsibilities:

- Define additional APIs:

  ```ts
  atlas.registerAgent(agent: Agent): this;
  atlas.routeMessage(strategy: MultiAgentStrategy): this;
  ```

- Use `on('message:sent')` and `on('message:received')` to:
  - Decide which agent should respond.
  - Possibly inject synthetic messages (e.g., a router agent’s internal reasoning).

---

## 7. Agent Implementation Tasks

This section lists concrete tasks for implementing the Agent layer.

### 7.1 Minimal Implementation (MVP)

- [ ] Define `AgentOptions` and `Agent` interfaces in `@atlas/core`.
- [ ] Implement `agent(options: AgentOptions): Agent` factory.
- [ ] Implement `AgentRuntime` class:
  - Constructor accepts `Agent` and `ProviderRegistry`.
  - Stores `tools` map.
  - Implements `chat(conversation, nextMessage, opts)` with non-streaming support only.
- [ ] Implement mapping functions:
  - `conversationToProviderRequest(conversation, agent, atlasOptions)`.
  - `providerChunksToAssistantMessage(chunks)`.

### 7.2 Tools Support

- [ ] Implement `ToolDefinition` + `Tool` types.
- [ ] Implement `tool(definition, handler)` factory.
- [ ] In `AgentRuntime.chat`:
  - Detect tool calls from provider response (non-streaming).
  - Execute tools and re-enter provider until no more tool calls.

### 7.3 Streaming Support

- [ ] Extend `AgentRuntime.chat` for streaming with `Provider.stream`.
- [ ] Define `AgentChatStream` internal representation; integrate with `AtlasStream`.
- [ ] Implement tool call handling inside streaming loops.
- [ ] Ensure all events (`stream:start`, `stream:chunk`, `stream:end`, `tool:called`, `tool:result`) are emitted.

### 7.4 Multi-Agent Support (Core)

- [ ] Extend `AtlasOptions` to allow `agents` & `defaultAgentId`.
- [ ] Implement `Atlas.setAgent()`, `Atlas.getAgent()`:
  - Manage internal `currentAgentId`.
- [ ] Ensure `Atlas.ask` and `Atlas.send` pick the correct `AgentRuntime` based on `agentId` parameter or `currentAgentId`.

---

## 8. Invariants & Edge Cases

- **Single active provider per agent**:
  - Each `Agent` is tied to a single provider at a time (`options.provider`).
  - Changing provider requires recreating the `Agent` or its runtime.

- **Tool name uniqueness**:
  - Within a single Agent, tool names must be unique.
  - Across different agents, same name may map to different implementations; that is allowed.

- **History truncation**:
  - Before building `ProviderRequest`, `AgentRuntime` may need to truncate history according to `AtlasOptions.history`:
    - `maxMessages`: keep only the last N messages.
    - `maxTokens`: future extension; requires approximate token counting.

- **Error handling**:
  - If a tool handler throws or rejects:
    - Create a `tool` role message with `status: 'error'` and error description.
    - Optionally re-enter provider with this error result, so model can respond gracefully.
  - Provider errors (network, etc.) propagate as `ProviderError` and trigger `'error'` event.

- **Stream cancellation**:
  - `AtlasStream.cancel()` should:
    - Abort underlying provider stream (e.g., `AbortController`).
    - Prevent further tool execution.
    - Emit `'stream:end'` with a flag `cancelled: true`.

---
