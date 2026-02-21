'use client';

import { useState } from 'react';

export default function Hero() {
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('Thanks for subscribing!');
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
    <section id="about" className="pt-16 pb-16">
      <div className="max-w-5xl mx-auto px-6">
        <p className="text-lg text-text-secondary leading-relaxed mb-8 max-w-2xl">
        I’m a former Venture Capitalist and now building global B2B payments powered by stablecoins at <a href="https://lumx.io" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground transition-colors">@Lumx</a>. I write about the topics that excite me most — financial infrastructure, stablecoins, AI, business, sports, and startups. If you’re interested in following my writing, you can subscribe below:
        </p>

        <form onSubmit={handleSubmit} className="flex gap-3 mb-16 max-w-2xl">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Type your email..."
            required
            disabled={status === 'loading'}
            className="flex-1 px-4 py-3 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-foreground focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-base"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="px-6 py-3 bg-foreground text-white rounded-md font-medium hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-base"
          >
            {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>
        {message && (
          <p
            className={`mb-8 text-sm ${
              status === 'success' ? 'text-green-700' : 'text-red-700'
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </section>
  );
}
