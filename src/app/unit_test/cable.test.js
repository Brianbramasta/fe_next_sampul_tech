// Mock the actioncable module before importing functions under test
jest.mock('@rails/actioncable', () => {
  const createConsumer = jest.fn((wsUrl) => {
    let lastCallbacks = null;
    return {
      subscriptions: {
        create: (params, callbacks) => {
          // return callbacks object as the subscription
          lastCallbacks = callbacks;
          return callbacks;
        }
      },
      // expose for tests
      __getLastCallbacks: () => lastCallbacks,
    };
  });
  return { createConsumer };
});

import { getConsumer, subscribeToChannel } from '../utils/cable';
import { createConsumer } from '@rails/actioncable';

describe('cable utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getConsumer returns same consumer and uses createConsumer', () => {
    const ws = 'ws://localhost/cable';
    const c1 = getConsumer(ws);
    const c2 = getConsumer(ws);

    expect(createConsumer).toHaveBeenCalled();
    expect(c1).toBe(c2);
  });

  test('subscribeToChannel creates a subscription and invokes callbacks when triggered', () => {
    const ws = 'ws://localhost/cable';
    const receivedSpy = jest.fn();
    const connectedSpy = jest.fn();

    const subscription = subscribeToChannel(ws, 'ChatChannel', { room_id: 1 }, {
      received: receivedSpy,
      connected: connectedSpy,
    });

    // subscription is the callbacks object
    expect(typeof subscription.received).toBe('function');

    // Manually call the callbacks to simulate events
    const sample = { content: 'hi' };
    subscription.received(sample);
    subscription.connected();

    expect(receivedSpy).toHaveBeenCalledWith(sample);
    expect(connectedSpy).toHaveBeenCalled();
  });
});
