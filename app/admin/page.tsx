'use client';

import { useState, useEffect } from 'react';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Check if already authenticated
    const auth = localStorage.getItem('admin_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
      loadPosts();
    }
  }, []);

  const loadPosts = async () => {
    try {
      const response = await fetch('/api/admin/posts');
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      } else {
        setError('Failed to load posts');
      }
    } catch (err) {
      setError('Failed to load posts');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        localStorage.setItem('admin_auth', 'true');
        setIsAuthenticated(true);
        loadPosts();
      } else {
        setError('Invalid password');
      }
    } catch (err) {
      setError('Authentication failed');
    }
  };

  const handleSendEmail = async (post: any) => {
    if (!confirm(`Send email notification for "${post.title}"?`)) {
      return;
    }

    setLoading(post.slug);
    setSuccessMessage('');
    setError('');

    try {
      const response = await fetch('/api/notify-subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postTitle: post.title,
          postExcerpt: post.excerpt,
          postSlug: post.slug,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Handle the case when there are no subscribers
        if (data.message && data.message.includes('No subscribers')) {
          setError('No subscribers found. Add subscribers first!');
        } else if (data.successful !== undefined) {
          const successCount = data.successful || 0;
          const failedCount = data.failed || 0;
          let message = `Successfully sent to ${successCount} subscriber(s)!`;
          if (failedCount > 0) {
            message += ` (${failedCount} failed)`;
          }
          setSuccessMessage(message);
        } else {
          setError('Unexpected response from server');
        }
      } else {
        setError(data.error || 'Failed to send emails');
      }
    } catch (err) {
      setError('Failed to send emails');
    } finally {
      setLoading(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_auth');
    setIsAuthenticated(false);
    setPassword('');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="max-w-md w-full">
          <h1 className="text-3xl font-bold text-foreground mb-8 text-center">
            Admin Login
          </h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter admin password"
                required
              />
            </div>
            {error && (
              <p className="text-red-600 text-sm">{error}</p>
            )}
            <button
              type="submit"
              className="w-full bg-foreground text-white py-3 rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-3xl font-bold text-foreground">
            Admin Dashboard
          </h1>
          <button
            onClick={handleLogout}
            className="text-sm text-text-light hover:text-foreground"
          >
            Logout
          </button>
        </div>

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {error}
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Send Email Notifications
          </h2>
          <p className="text-text-secondary mb-6">
            Click "Send Email" to notify all subscribers about a post.
          </p>
        </div>

        <div className="space-y-6">
          {posts.map((post) => (
            <div
              key={post.slug}
              className="border border-border rounded-lg p-6 hover:border-primary transition-colors"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {post.title}
                  </h3>
                  <p className="text-text-secondary text-sm mb-3">
                    {post.excerpt}
                  </p>
                  <div className="flex gap-4 text-sm text-text-light">
                    <span>Published: {post.date}</span>
                    <span>Slug: {post.slug}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleSendEmail(post)}
                  disabled={loading === post.slug}
                  className="px-6 py-2 bg-foreground text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {loading === post.slug ? 'Sending...' : 'Send Email'}
                </button>
              </div>
            </div>
          ))}

          {posts.length === 0 && (
            <p className="text-center text-text-light py-12">
              No posts found. Add some posts to content/posts/ to get started.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
