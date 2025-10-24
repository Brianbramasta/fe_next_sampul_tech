'use client';

import { useState, useEffect, useRef } from 'react';

export default function ChatInterface({ username }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      // In a real app, this would send the message to the server
      // For now, we'll just add it to the local state
      const message = {
        id: Date.now(),
        username,
        content: newMessage,
        created_at: new Date().toISOString(),
      };
      
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen">
      <div className="bg-white dark:bg-zinc-800 p-4 shadow-md">
        <h1 className="text-xl font-bold text-black dark:text-white">Chat Room</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Logged in as: {username}</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 bg-zinc-100 dark:bg-zinc-900">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-zinc-500 dark:text-zinc-400">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div 
              key={message.id}
              className={`mb-4 ${message.username === username ? 'text-right' : 'text-left'}`}
            >
              <div 
                className={`inline-block rounded-lg p-3 max-w-xs md:max-w-md ${message.username === username 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white dark:bg-zinc-700 text-black dark:text-white'}`}
              >
                {message.username !== username && (
                  <p className="font-bold text-xs mb-1">{message.username}</p>
                )}
                <p>{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {new Date(message.created_at).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-800 p-4 border-t border-zinc-200 dark:border-zinc-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-3 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-black dark:text-white"
          />
          <button 
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-md transition-colors"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
