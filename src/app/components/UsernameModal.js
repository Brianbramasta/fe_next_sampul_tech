'use client';

import { useState, useEffect } from 'react';

export default function UsernameModal({ onUsernameSubmit }) {
  const [username, setUsername] = useState('');
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    // Check if username exists in localStorage
    const storedUsername = localStorage.getItem('chat_username');
    if (storedUsername) {
      setUsername(storedUsername);
      onUsernameSubmit(storedUsername);
      setIsOpen(false);
    }
  }, [onUsernameSubmit]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      localStorage.setItem('chat_username', username);
      onUsernameSubmit(username);
      setIsOpen(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-zinc-800 rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">Welcome to Chat App</h2>
        <p className="mb-6 text-zinc-600 dark:text-zinc-300">Please enter your username to continue</p>
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Your username"
            className="w-full p-3 border border-zinc-300 dark:border-zinc-600 rounded-md mb-4 bg-white dark:bg-zinc-700 text-black dark:text-white"
            required
          />
          <button 
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition-colors"
          >
            Start Chatting
          </button>
        </form>
      </div>
    </div>
  );
}
