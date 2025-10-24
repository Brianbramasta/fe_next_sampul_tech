import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UsernameModal from '../components/UsernameModal';

describe('UsernameModal', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('uses stored username from localStorage and calls onUsernameSubmit', async () => {
    const onUsernameSubmit = jest.fn();
    localStorage.setItem('chat_username', 'Alice');

    render(<UsernameModal onUsernameSubmit={onUsernameSubmit} />);

    await waitFor(() => {
      expect(onUsernameSubmit).toHaveBeenCalledWith('Alice');
    });

    // Modal should be closed when username exists
    expect(screen.queryByPlaceholderText('Your username')).toBeNull();
  });

  test('submits username and stores it in localStorage', async () => {
    const onUsernameSubmit = jest.fn();
    const user = userEvent.setup();

    render(<UsernameModal onUsernameSubmit={onUsernameSubmit} />);

    const input = screen.getByPlaceholderText('Your username');
    const button = screen.getByRole('button', { name: /Start Chatting/i });

    await user.type(input, 'Bob');
    await user.click(button);

    expect(onUsernameSubmit).toHaveBeenCalledWith('Bob');
    expect(localStorage.getItem('chat_username')).toBe('Bob');

    // Modal should close
    expect(screen.queryByPlaceholderText('Your username')).toBeNull();
  });
});
