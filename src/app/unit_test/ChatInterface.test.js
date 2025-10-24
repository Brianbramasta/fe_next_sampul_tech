import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatInterface from '../components/ChatInterface';

describe('ChatInterface', () => {
  test('shows no messages text when messages empty and sends message with username', async () => {
    const onSendMessage = jest.fn();
    const user = userEvent.setup();

    render(<ChatInterface username="Alice" messages={[]} onSendMessage={onSendMessage} />);

    expect(screen.getByText(/No messages yet/i)).toBeInTheDocument();

    const input = screen.getByPlaceholderText('Type a message...');
    const sendBtn = screen.getByRole('button', { name: /Send/i });

    await user.type(input, 'Hello world');
    await user.click(sendBtn);

    expect(onSendMessage).toHaveBeenCalledWith('Hello world');
    // input should be cleared after send
    expect(input).toHaveValue('');
  });
});
