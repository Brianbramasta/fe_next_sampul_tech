'use client';

import { createConsumer } from '@rails/actioncable';

let consumer;

export function getConsumer(wsUrl) {
  if (!consumer) {
    consumer = createConsumer(wsUrl);
  }
  return consumer;
}

export function subscribeToChannel(wsUrl, channelName, callbacks) {
  const consumer = getConsumer(wsUrl);
  
  return consumer.subscriptions.create(channelName, {
    connected() {
      console.log(`Connected to ${channelName}`);
      if (callbacks.connected) callbacks.connected();
    },
    disconnected() {
      console.log(`Disconnected from ${channelName}`);
      if (callbacks.disconnected) callbacks.disconnected();
    },
    received(data) {
      console.log(`Received data from ${channelName}:`, data);
      if (callbacks.received) callbacks.received(data);
    }
  });
}