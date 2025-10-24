'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import UsernameModal from './components/UsernameModal';
import ChatInterface from './components/ChatInterface';
import { subscribeToChannel } from './utils/cable';

// Configuration
const API_URL = 'http://localhost:3000'; // Rails API URL
const WS_URL = 'ws://localhost:3000/cable'; // Rails WebSocket URL

export default function Home() {
  const [username, setUsername] = useState('');
  const [messages, setMessages] = useState([]);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    if (username) {
      fetchMessages();
      setupWebSocket();
    }
    
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [username]);

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`${API_URL}/messages`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const setupWebSocket = () => {
    const sub = subscribeToChannel(WS_URL, 'MessageChannel', {
      received: (data) => {
        if (data.message) {
          setMessages(prevMessages => [...prevMessages, data.message]);
        }
      }
    });
    
    setSubscription(sub);
  };

  const handleUsernameSubmit = (name) => {
    setUsername(name);
  };

  const handleSendMessage = async (content) => {
    try {
      await axios.post(`${API_URL}/messages`, {
        message: {
          username,
          content
        }
      });
      // The new message will be received through the WebSocket
    } catch (error) {
      console.error('Error sending message:', error);
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