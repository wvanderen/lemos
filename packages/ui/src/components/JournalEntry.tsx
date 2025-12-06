import { useState, useRef, useEffect } from 'react';
import type { EventBus, NoteCreatedPayload } from '@lemos/core';
import { Button, TextArea } from '../atoms';

interface JournalEntryProps {
  bus: EventBus;
}

const MAX_LENGTH = 500;

export function JournalEntry({ bus }: JournalEntryProps): JSX.Element {
  const [text, setText] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

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
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  const charCount = text.length;
  const isOverLimit = charCount > MAX_LENGTH;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-primary">
          Quick Journal Entry
        </h3>
        <div className={`text-xs ${isOverLimit ? 'text-accent-danger' : 'text-text-tertiary'}`}>
          {charCount} / {MAX_LENGTH}
        </div>
      </div>

      <TextArea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write your thoughts..."
        error={isOverLimit}
        fullWidth
        rows={4}
      />

      <div className="flex justify-between items-center">
        {showSuccess ? (
          <div className="text-xs text-accent-success flex items-center gap-1.5 animate-in fade-in duration-300">
            <span>✓</span>
            <span>Saved to active context</span>
          </div>
        ) : (
          <div /> // Spacer
        )}

        <Button
          type="submit"
          disabled={!text.trim() || isOverLimit}
          variant="primary"
          size="sm"
          className="min-w-[80px]"
        >
          Submit
        </Button>
      </div>
    </form>
  );
}
