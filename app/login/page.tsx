'use client';

import { useState, type FormEvent } from 'react';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setError('');
    setBusy(true);

    try {
      const supabase = getSupabaseBrowser();
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: `${window.location.origin}/dashboard` },
      });
      if (signInError) throw signInError;
      setMessage('Elküldtük a belépési linket az e-mail-címedre. Nyisd meg a levelet, majd kattints a linkre.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nem sikerült elküldeni a belépési linket.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ maxWidth: 520, margin: '0 auto', padding: '64px 24px' }}>
      <a href="/" style={{ color: '#ff4655', fontWeight: 800, letterSpacing: 2, textDecoration: 'none' }}>RADCASE.GG</a>
      <h1 style={{ fontSize: 36, marginBottom: 8 }}>Belépés</h1>
      <p style={{ color: '#b5b5c0', lineHeight: 1.7 }}>E-mailes belépési linkkel tudsz fiókot létrehozni vagy visszalépni. Riot-jelszót nem kérünk.</p>
      <form onSubmit={handleSubmit} style={{ marginTop: 28, display: 'grid', gap: 14 }}>
        <label htmlFor="email" style={{ color: '#e5e5e8' }}>E-mail-cím</label>
        <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="te@email.com" style={inputStyle} />
        <button type="submit" disabled={busy} style={buttonStyle}>{busy ? 'Küldés…' : 'Belépési link küldése'}</button>
      </form>
      {message && <p role="status" style={{ color: '#82e6a5', lineHeight: 1.6 }}>{message}</p>}
      {error && <p role="alert" style={{ color: '#ff7b86', lineHeight: 1.6 }}>{error}</p>}
      <p style={{ color: '#858593', fontSize: 13, lineHeight: 1.6, marginTop: 28 }}>A belépés működéséhez a Supabase Auth e-mailes bejelentkezését és a RadCase.gg visszairányítási URL-jét engedélyezni kell.</p>
    </main>
  );
}

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box' as const,
  background: '#15161f',
  color: '#f4f4f5',
  border: '1px solid #363744',
  borderRadius: 8,
  padding: '13px 14px',
  fontSize: 16,
};

const buttonStyle = {
  background: '#ff4655',
  color: '#ffffff',
  border: 0,
  borderRadius: 8,
  padding: '13px 16px',
  fontSize: 16,
  fontWeight: 750,
  cursor: 'pointer',
};
