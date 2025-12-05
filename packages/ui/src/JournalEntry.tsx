import { useState } from 'react';
import type { EventBus, NoteCreatedPayload } from '@lemos/core';

interface JournalEntryProps {
  bus: EventBus;
}

const MAX_LENGTH = 500;

export function JournalEntry({ bus }: JournalEntryProps): JSX.Element {
  const [text, setText] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!text.trim()) {
      return;
    }

    const noteId = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    // Emit NoteCreated event - Logger will automatically enrich with context
    bus.emit<NoteCreatedPayload>({
      id: crypto.randomUUID(),
      type: 'NoteCreated',
      timestamp,
      payload: {
        noteId,
        text: text.trim(),
        timestamp,
      },
    });

    // Clear form and show success
    setText('');
    setShowSuccess(true);

    // Hide success message after 3 seconds
    const timeoutId = setTimeout(() => {
      setShowSuccess(false);
    }, 3000);

    return () => clearTimeout(timeoutId);
  };

  const charCount = text.length;
  const isOverLimit = charCount > MAX_LENGTH;

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#111827' }}>
        Quick Journal Entry
      </h3>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write your thoughts..."
        style={{
          padding: '10px 12px',
          fontSize: 14,
          background: 'white',
          border: '1px solid #d1d5db',
          borderRadius: 6,
          resize: 'vertical',
          minHeight: 100,
          fontFamily: 'Inter, system-ui, sans-serif',
          color: '#111827',
        }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div
          style={{
            fontSize: 12,
            color: isOverLimit ? '#ef4444' : '#6b7280',
          }}
        >
          {charCount} / {MAX_LENGTH} chars
        </div>

        <button
          type="submit"
          disabled={!text.trim() || isOverLimit}
          style={{
            padding: '8px 16px',
            fontSize: 13,
            background: !text.trim() || isOverLimit ? '#d1d5db' : '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            cursor: !text.trim() || isOverLimit ? 'not-allowed' : 'pointer',
            fontWeight: 500,
          }}
        >
          Submit ✓
        </button>
      </div>

      {showSuccess && (
        <div
          style={{
            padding: '8px 12px',
            background: '#d1fae5',
            border: '1px solid #10b981',
            borderRadius: 6,
            fontSize: 13,
            color: '#065f46',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span>✓</span>
          <span>Entry saved with context</span>
        </div>
      )}
    </form>
  );
}
