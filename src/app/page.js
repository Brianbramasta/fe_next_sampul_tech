'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import UsernameModal from './components/UsernameModal';
import ChatInterface from './components/ChatInterface';
import { subscribeToChannel } from './utils/cable';

// Configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'; // Rails API URL
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000/cable'; // Rails WebSocket URL

export default function Home() {
  const [username, setUsername] = useState('');
  const [messages, setMessages] = useState([]);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    if (!username) return;

    // Create a subscription and keep a reference to unsubscribe this exact
    // subscription when the effect cleans up. This avoids creating multiple
    // active subscriptions (which caused duplicate incoming messages).
    const sub = setupWebSocket();
    setSubscription(sub);

    return () => {
      if (sub) sub.unsubscribe();
      setSubscription(null);
    };
  }, [username]);

  const setupWebSocket = () => {
    console.log('🔄 Setting up WebSocket with username:', username);
    
    const sub = subscribeToChannel(WS_URL, 'MessageChannel', {
      username: username // Pass username as param
    }, {
      connected: () => {
        console.log('🟢 Connected to chat channel');
        console.log('Requesting initial messages...');
        sub.perform('fetch_messages');
      },
      disconnected: () => {
        console.log('🔴 Disconnected from chat channel');
      },
      rejected: () => {
        console.error('❌ Connection rejected');
      },
      received: (data) => {
        console.log('📩 Received WebSocket data:', data);
        
        if (data.type === 'initial_messages') {
          console.log('📥 Loading initial messages');
          setMessages(data.messages || []);
        } else if (data.type === 'new_message' && data.message) {
          console.log('📨 New message received');
          setMessages(prevMessages => {
            // Remove any optimistic message with the same content
            const filteredMessages = prevMessages.filter(msg => 
              !(
                msg.content === data.message.content &&
                msg.username === data.message.username &&
                // optimistic messages created locally use a temporary id prefix
                String(msg.id || '').startsWith('temp')
              )
            );
            return [...filteredMessages, data.message];
          });
        } else if (data.message) {
          // Handle direct message broadcasts
          setMessages(prevMessages => [...prevMessages, data.message]);
        }
      }
    });
    
    return sub;
  };

  const handleUsernameSubmit = (name) => {
    setUsername(name);
  };

  const handleSendMessage = async (content) => {
    let optimisticMessage = null;
    try {
      console.log('📤 Attempting to send message:', content);

      // Create optimistic message with a temporary string id so it can be
      // identified and removed/replaced when the server broadcasts the
      // authoritative message.
      optimisticMessage = {
        id: `temp-${Date.now()}`,
        username,
        content,
        created_at: new Date().toISOString()
      };

      // Add message immediately to UI
      setMessages(prevMessages => [...prevMessages, optimisticMessage]);

      // Send message through WebSocket
      if (!subscription) {
        throw new Error('WebSocket connection not established');
      }

      console.log('📡 Sending message via WebSocket');
      subscription.perform('send_message', {
        username,
        content
      });
    } catch (error) {
      console.error('Error sending message:', error);
      // If error occurs, remove the optimistic message
      if (optimisticMessage) {
        setMessages(prevMessages => 
          prevMessages.filter(msg => msg.id !== optimisticMessage.id)
        );
      }
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      {!username ? (
        <UsernameModal onUsernameSubmit={handleUsernameSubmit} />
      ) : (
        <ChatInterface 
          username={username} 
          messages={messages} 
          onSendMessage={handleSendMessage} 
        />
      )}
    </div>
  );
}