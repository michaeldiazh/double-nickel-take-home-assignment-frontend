import { memo, useState, useCallback, FormEvent, ChangeEvent } from 'react';

interface Props {
  onSend: (text: string) => void;
  disabled: boolean;
}

function ChatInputComponent({ onSend, disabled }: Props) {
  const [value, setValue] = useState('');

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  }, []);

  const handleSubmit = useCallback((e: FormEvent) => {
    e.preventDefault();
    if (value.trim() && !disabled) {
      onSend(value.trim());
      setValue('');
    }
  }, [value, disabled, onSend]);

  return (
    <form className="chat-input-form" onSubmit={handleSubmit}>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="Type your message..."
        disabled={disabled}
      />
      <button type="submit" disabled={disabled || !value.trim()}>
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path
            fill="currentColor"
            d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"
          />
        </svg>
      </button>
    </form>
  );
}

export const ChatInput = memo(ChatInputComponent);
