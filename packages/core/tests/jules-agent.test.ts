import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { Atlas } from '../src/atlas';
import { julesAgent } from '../src/jules-agent';
import { MockProvider } from '../src/mock-provider';
import { Provider } from '../src/types';

test('Jules agent is registered and can be retrieved', () => {
  const providerRegistry = new Map<string, Provider>();
  providerRegistry.set('openai', new MockProvider());
  const atlas = new Atlas({}, providerRegistry);
  const agent = atlas.getAgent();
  assert.is(agent?.id, julesAgent.id);
});

test.run();
