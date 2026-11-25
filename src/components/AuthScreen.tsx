'use client';

import { useState, useCallback, useRef } from 'react';
import { useApp } from '@/lib/store';
import { useTheme } from '@/lib/theme';
import GravityField from './GravityField';

export default function AuthScreen({ onSuccess }: { onSuccess?: () => void }) {
  const { dispatch } = useApp();
  const { theme } = useTheme();
  const passwordRef = useRef<HTMLInputElement>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Artificial 600ms delay per spec
    await new Promise((r) => setTimeout(r, 600));

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (data.success) {
        setFadeOut(true);
        setTimeout(() => {
          dispatch({ type: 'LOGIN', username });
          onSuccess?.();
        }, 400);
      } else {
        setShaking(true);
        setError(data.error || 'ACCESS DENIED — invalid credentials');
        setTimeout(() => setShaking(false), 240);
      }
    } catch {
      setError('CONNECTION ERROR — try again');
    } finally {
      setLoading(false);
    }
  }, [username, password, dispatch]);

  return (
    <div
      className={`fixed inset-0 bg-void flex items-center justify-center transition-opacity duration-400 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Gravity repulsion field background */}
      <GravityField />

      <form
        onSubmit={handleSubmit}
        className={`w-full max-w-[380px] border rounded-lg p-8 relative ${
          shaking ? 'shake' : ''
        }`}
        style={{
          backgroundColor: theme === 'dark' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.15)',
          borderColor: 'rgba(255, 46, 56, 0.7)', 
          borderWidth: theme === 'dark' ? '1px' : '2px',
          zIndex: 1,
          backdropFilter: 'blur(16px)',
          boxShadow: '0 0 25px rgba(255, 46, 56, 0.15)',
        }}
      >
        {/* System label */}
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ghost mb-6 text-center">
          SYSTEM ACCESS
        </p>

        {/* Product name */}
        <h1 className="font-mono text-2xl text-white text-center tracking-tight mb-2">
          RedTeam
        </h1>

        {/* Description */}
        <p className="text-sm text-fog text-center mb-6">
          Refine Your Ideas
        </p>

        {/* Divider */}
        <div className="h-px bg-stone mb-6" />

        {/* Username field */}
        <div className="mb-4">
          <label className="block font-mono text-[10px] uppercase tracking-[0.2em] text-ghost mb-2">
            USERNAME
          </label>
          <input
            id="auth-username"
            type="text"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            placeholder="Enter username"
            className="w-full bg-void text-cloud text-sm px-3 py-2.5 rounded-none outline-none placeholder:text-ghost transition-colors duration-150"
            style={{
              border: '1px solid rgba(255, 46, 56, 0.3)',
              outline: 'none',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#ff2e38')}
            onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 46, 56, 0.3)')}
            autoComplete="off"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                passwordRef.current?.focus();
              }
            }}
          />
        </div>

        {/* Password field */}
        <div className="mb-6">
          <label className="block font-mono text-[10px] uppercase tracking-[0.2em] text-ghost mb-2">
            PASSWORD
          </label>
          <div className="relative w-full">
            <input
              id="auth-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full bg-void text-cloud text-sm pl-3 pr-10 py-2.5 rounded-none outline-none placeholder:text-ghost transition-colors duration-150"
              style={{
                border: '1px solid rgba(255, 46, 56, 0.3)',
                outline: 'none',
              }}
              ref={passwordRef}
              onFocus={(e) => (e.target.style.borderColor = '#ff2e38')}
              onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 46, 56, 0.3)')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-fog hover:text-white transition-colors flex items-center justify-center"
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Submit button */}
        <button
          id="auth-submit"
          type="submit"
          disabled={loading || !username || !password}
          className="w-full font-mono text-xs uppercase tracking-[0.15em] py-3 transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            border: '1px solid #ff2e38',
            background: 'transparent',
            color: '#ff2e38',
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              (e.target as HTMLButtonElement).style.background = '#ff2e38';
              (e.target as HTMLButtonElement).style.color = 'white';
            }
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.background = 'transparent';
            (e.target as HTMLButtonElement).style.color = '#ff2e38';
          }}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              AUTHENTICATING
              <span className="flex w-[12px] ml-[2px]">
                <span className="dot-1">.</span>
                <span className="dot-2">.</span>
                <span className="dot-3">.</span>
              </span>
            </span>
          ) : (
            'AUTHENTICATE →'
          )}
        </button>

        {/* Error message */}
        {error && (
          <p className="font-mono text-xs text-accent-red mt-4 text-center">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}
