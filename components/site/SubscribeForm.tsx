'use client';

import { useState } from 'react';

export default function SubscribeForm({ note }: { note?: string }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage("You're in. Thanks for subscribing!");
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex max-w-[440px] gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          required
          aria-label="Email address"
          disabled={status === 'loading'}
          className="min-w-0 flex-1 rounded-lg border border-line bg-surface px-3.5 py-2.5 text-[15px] text-foreground placeholder:text-[#5a5a5a] focus:border-accent focus:outline-none disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="shrink-0 rounded-lg bg-foreground px-4 text-[15px] font-medium text-black transition-colors hover:bg-white disabled:opacity-60"
        >
          {status === 'loading' ? 'Subscribing…' : 'Subscribe'}
        </button>
      </form>
      <p
        className={`mt-2.5 text-[13px] ${
          status === 'success' ? 'text-success' : status === 'error' ? 'text-danger' : 'text-muted'
        }`}
        aria-live="polite"
      >
        {message || note}
      </p>
    </div>
  );
}
