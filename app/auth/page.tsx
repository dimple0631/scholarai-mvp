
'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

type Mode = 'signup' | 'login';

export default function AuthPage() {
  const router = useRouter();

  const [mode, setMode] = useState<Mode>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [connection, setConnection] = useState('Checking connection...');
  const [signedInEmail, setSignedInEmail] = useState('');

  useEffect(() => {
    let active = true;

    async function checkConnection() {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (!active) return;

        if (error) {
          setConnection('Connection check failed');
          setError(error.message);
          return;
        }

        setConnection('Supabase client connected');

        if (data.session?.user.email) {
          setSignedInEmail(data.session.user.email);
        }
      } catch {
        if (active) {
          setConnection('Connection check failed');
          setError(
            'Could not contact Supabase. Check your project URL, publishable key and internet connection.'
          );
        }
      }
    }

    void checkConnection();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) {
        setSignedInEmail(session?.user.email ?? '');
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { full_name: name.trim() },
          },
        });

        if (error) throw error;

        if (data.session) {
          setMessage('Account created successfully!');
          router.replace('/');
          router.refresh();
        } else {
          setMessage(
            'Account created! Check your email for the confirmation link before logging in.'
          );
          setMode('login');
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) throw error;

        setSignedInEmail(data.user.email ?? email.trim());
        setMessage('Login successful! Opening your workspace...');

        router.replace('/');
        router.refresh();
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      setSignedInEmail('');
      setMessage('You have logged out.');
      setMode('login');
      router.replace('/auth');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not log out.');
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    display: 'block',
    boxSizing: 'border-box' as const,
    width: '100%',
    marginTop: '7px',
    padding: '13px 14px',
    border: '1px solid #dbe3ef',
    borderRadius: '10px',
    background: '#ffffff',
    color: '#243b53',
    fontSize: '15px',
    outline: 'none',
  };

  const buttonStyle = {
    width: '100%',
    padding: '14px',
    border: 0,
    borderRadius: '10px',
    background: '#315fce',
    color: '#ffffff',
    fontWeight: 600,
    fontSize: '15px',
    cursor: 'pointer',
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: 'linear-gradient(135deg, #f8faff, #edf4ff)',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <section
        style={{
          width: '100%',
          maxWidth: '430px',
          padding: '34px',
          border: '1px solid #e1e8f0',
          borderRadius: '20px',
          background: '#ffffff',
          boxShadow: '0 15px 45px rgba(40,70,110,0.09)',
        }}
      >
        <div
          style={{
            width: '46px',
            height: '46px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '14px',
            background: '#eaf0ff',
            color: '#315fce',
            fontSize: '24px',
            fontWeight: 700,
          }}
        >
          S
        </div>

        <h1
          style={{
            color: '#243b53',
            fontSize: '28px',
            margin: '18px 0 8px',
          }}
        >
          Welcome to ScholarAI
        </h1>

        <p
          style={{
            color: '#64748b',
            lineHeight: 1.6,
            marginBottom: '26px',
          }}
        >
          Your study-abroad journey starts with a clearer plan.
        </p>

        {signedInEmail ? (
          <>
            <h2 style={{ color: '#243b53', fontSize: '20px' }}>
              You’re signed in!
            </h2>
            <p style={{ color: '#64748b', overflowWrap: 'anywhere' }}>
              {signedInEmail}
            </p>

            <button
              type="button"
              onClick={() => router.push('/')}
              style={buttonStyle}
            >
              Open dashboard
            </button>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loading}
              style={{
                ...buttonStyle,
                marginTop: '10px',
                background: '#ffffff',
                color: '#315fce',
                border: '1px solid #dbe3ef',
              }}
            >
              {loading ? 'Please wait...' : 'Log out'}
            </button>
          </>
        ) : (
          <>
            <div
              style={{
                display: 'flex',
                gap: '8px',
                padding: '5px',
                background: '#f3f6fb',
                borderRadius: '12px',
                marginBottom: '24px',
              }}
            >
              {(['signup', 'login'] as Mode[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setMode(item);
                    setError('');
                    setMessage('');
                  }}
                  style={{
                    flex: 1,
                    padding: '11px',
                    border: 0,
                    borderRadius: '9px',
                    background: mode === item ? '#ffffff' : 'transparent',
                    color: mode === item ? '#315fce' : '#64748b',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow:
                      mode === item
                        ? '0 2px 8px rgba(30,50,80,0.08)'
                        : 'none',
                  }}
                >
                  {item === 'signup' ? 'Create account' : 'Log in'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit}>
              {mode === 'signup' && (
                <label
                  style={{
                    display: 'block',
                    marginBottom: '17px',
                    color: '#334155',
                    fontSize: '14px',
                    fontWeight: 600,
                  }}
                >
                  Full name
                  <input
                    type="text"
                    autoComplete="name"
                    required
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Enter your name"
                    style={inputStyle}
                  />
                </label>
              )}

              <label
                style={{
                  display: 'block',
                  marginBottom: '17px',
                  color: '#334155',
                  fontSize: '14px',
                  fontWeight: 600,
                }}
              >
                Email address
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  style={inputStyle}
                />
              </label>

              <label
                style={{
                  display: 'block',
                  marginBottom: '20px',
                  color: '#334155',
                  fontSize: '14px',
                  fontWeight: 600,
                }}
              >
                Password
                <input
                  type="password"
                  autoComplete={
                    mode === 'signup' ? 'new-password' : 'current-password'
                  }
                  minLength={6}
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 6 characters"
                  style={inputStyle}
                />
              </label>

              {error && (
                <p
                  role="alert"
                  style={{
                    color: '#b42318',
                    background: '#fff1f0',
                    borderRadius: '8px',
                    padding: '11px',
                    fontSize: '13px',
                    lineHeight: 1.5,
                  }}
                >
                  {error}
                </p>
              )}

              {message && (
                <p
                  role="status"
                  style={{
                    color: '#18794e',
                    background: '#ecfdf3',
                    borderRadius: '8px',
                    padding: '11px',
                    fontSize: '13px',
                    lineHeight: 1.5,
                  }}
                >
                  {message}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  ...buttonStyle,
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? 'wait' : 'pointer',
                }}
              >
                {loading
                  ? 'Please wait...'
                  : mode === 'signup'
                    ? 'Create my account'
                    : 'Log in to ScholarAI'}
              </button>
            </form>

            <p
              style={{
                color: '#64748b',
                fontSize: '12px',
                marginTop: '20px',
                textAlign: 'center',
              }}
            >
              {connection}
            </p>

            <p
              style={{
                color: '#94a3b8',
                fontSize: '12px',
                lineHeight: 1.6,
                textAlign: 'center',
                marginBottom: 0,
              }}
            >
              Use accurate information and verify university details through
              official sources.
            </p>
          </>
        )}
      </section>
    </main>
  );
}
