'use client';

import { createConsumer } from '@rails/actioncable';

let consumer;

export function getConsumer(wsUrl) {
  console.log('🔄 Initializing WebSocket consumer for:', wsUrl);
  if (!consumer) {
    try {
      consumer = createConsumer(wsUrl);
      console.log('✅ WebSocket consumer created successfully');
    } catch (error) {
      console.error('❌ Error creating WebSocket consumer:', error);
    }
  } else {
    console.log('ℹ️ Using existing WebSocket consumer');
  }
  return consumer;
}

export function subscribeToChannel(wsUrl, channelName, params = {}, callbacks = {}) {
  console.log('🔄 Attempting to subscribe to channel:', channelName, 'with params:', params);
  const consumer = getConsumer(wsUrl);
  
  try {
    const subscription = consumer.subscriptions.create(
      { 
        channel: channelName,
        ...params 
      },
      {
        connected() {
          console.log('🟢 WebSocket Connected to channel:', channelName);
          console.log('Channel params:', params);
          if (callbacks.connected) callbacks.connected();
        },
        disconnected() {
          console.log('🔴 WebSocket Disconnected from channel:', channelName);
          if (callbacks.disconnected) callbacks.disconnected();
        },
        rejected() {
          console.error('❌ WebSocket Connection Rejected for channel:', channelName);
          console.error('Attempted with params:', params);
          if (callbacks.rejected) callbacks.rejected();
        },
        received(data) {
          console.log('📩 Received on channel:', channelName);
          console.log('Data:', data);
          if (callbacks.received) callbacks.received(data);
        }
      }
    );
    console.log('✅ Channel subscription created:', channelName);
    return subscription;
  } catch (error) {
    console.error('❌ Error subscribing to channel:', error);
    throw error;
  }
}