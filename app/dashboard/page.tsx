'use client';

import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { Session } from '@supabase/supabase-js';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

type ProfileForm = {
  public_slug: string;
  game_name: string;
  tagline: string;
  region: string;
  account_level: string;
  rank_name: string;
  rank_rr: string;
  share_publicly: boolean;
};

const emptyForm: ProfileForm = {
  public_slug: '',
  game_name: '',
  tagline: '',
  region: 'EU',
  account_level: '',
  rank_name: '',
  rank_rr: '',
  share_publicly: false,
};

export default function DashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [form, setForm] = useState<ProfileForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [savedUrl, setSavedUrl] = useState('');

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const supabase = getSupabaseBrowser();
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (!data.session) {
          router.replace('/login');
          return;
        }
        if (!active) return;
        setSession(data.session);

        const response = await fetch('/api/profile/owner', {
          headers: { Authorization: `Bearer ${data.session.access_token}` },
          cache: 'no-store',
        });

        if (response.ok) {
          const result = await response.json();
          const profile = result.profile;
          if (active && profile) {
            setForm({
              public_slug: profile.public_slug ?? '',
              game_name: profile.game_name ?? '',
              tagline: profile.tagline ?? '',
              region: profile.region ?? 'EU',
              account_level: profile.account_level == null ? '' : String(profile.account_level),
              rank_name: profile.rank_name ?? '',
              rank_rr: profile.rank_rr == null ? '' : String(profile.rank_rr),
              share_publicly: profile.share_publicly === true,
            });
            if (profile.share_publicly && profile.public_slug) setSavedUrl(`/profile/${profile.public_slug}`);
          }
        } else if (response.status !== 404) {
          throw new Error('Nem sikerült betölteni a profilodat.');
        }
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : 'Betöltési hiba.');
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => { active = false; };
  }, [router]);

  function update<K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) {
    setForm((previous) => ({ ...previous, [key]: value }));
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice('');
    setError('');
    setSavedUrl('');
    if (!session) {
      router.replace('/login');
      return;
    }
    if (form.share_publicly && !window.confirm('A profilod adatai nyilvánosan láthatók lesznek mindenkinek a megosztható linken. Folytatod?')) {
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          ...form,
          public_slug: form.public_slug.trim().toLowerCase(),
          game_name: form.game_name.trim(),
          tagline: form.tagline.trim() || null,
          account_level: form.account_level,
          rank_name: form.rank_name.trim() || null,
          rank_rr: form.rank_rr,
          confirm_public_share: form.share_publicly,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        const messages: Record<string, string> = {
          PROFILE_SLUG_TAKEN: 'Ez a profilcím már foglalt. Próbálj másikat.',
          INVALID_PROFILE_SLUG: 'A profilcím 3–32 karakter legyen; kisbetű, szám és kötőjel használható.',
          PUBLIC_SHARE_CONSENT_REQUIRED: 'A nyilvános megosztáshoz külön megerősítés szükséges.',
        };
        throw new Error(messages[result.error] || result.message || 'Nem sikerült menteni a profilt.');
      }
      setNotice(result.message || 'Profil mentve.');
      if (result.publicProfileUrl) setSavedUrl(result.publicProfileUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nem sikerült menteni a profilt.');
    } finally {
      setSaving(false);
    }
  }

  async function signOut() {
    const supabase = getSupabaseBrowser();
    await supabase.auth.signOut();
    router.replace('/');
  }

  if (loading) {
    return <main style={pageStyle}><p style={{ color: '#b5b5c0' }}>Betöltés…</p></main>;
  }

  return (
    <main style={pageStyle}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <a href="/" style={{ color: '#ff4655', fontWeight: 850, letterSpacing: 2, textDecoration: 'none' }}>RADCASE.GG</a>
        <button type="button" onClick={signOut} style={secondaryButtonStyle}>Kilépés</button>
      </header>
      <h1 style={{ fontSize: 36, marginBottom: 8 }}>Saját profil</h1>
      <p style={{ color: '#b5b5c0', lineHeight: 1.7, maxWidth: 740 }}>Ezeket az adatokat most kézzel adod meg. A profil nem Riot által hitelesített, és a skinek automatikus lekérése még nincs bekötve.</p>

      <form onSubmit={handleSave} style={{ display: 'grid', gap: 16, marginTop: 24, maxWidth: 720 }}>
        <div style={gridStyle}>
          <Field label="Profil URL végződése" hint="Példa: xdr3pp">
            <input required minLength={3} maxLength={32} pattern="[a-zA-Z0-9-]+" value={form.public_slug} onChange={(e) => update('public_slug', e.target.value.toLowerCase())} placeholder="sajat-profil" style={inputStyle} />
          </Field>
          <Field label="Riot ID játékosnév">
            <input required maxLength={32} value={form.game_name} onChange={(e) => update('game_name', e.target.value)} placeholder="Játékosnév" style={inputStyle} />
          </Field>
          <Field label="Tagline">
            <input maxLength={16} value={form.tagline} onChange={(e) => update('tagline', e.target.value)} placeholder="EUW" style={inputStyle} />
          </Field>
          <Field label="Régió">
            <select value={form.region} onChange={(e) => update('region', e.target.value)} style={inputStyle}>
              <option value="EU">Europe (EU)</option>
              <option value="NA">North America (NA)</option>
              <option value="AP">Asia Pacific (AP)</option>
              <option value="KR">Korea (KR)</option>
              <option value="BR">Brazil (BR)</option>
              <option value="LATAM">Latin America (LATAM)</option>
            </select>
          </Field>
          <Field label="Fiókszint">
            <input type="number" min={0} max={10000} value={form.account_level} onChange={(e) => update('account_level', e.target.value)} placeholder="Például 150" style={inputStyle} />
          </Field>
          <Field label="Rang">
            <input maxLength={50} value={form.rank_name} onChange={(e) => update('rank_name', e.target.value)} placeholder="Például Diamond 2" style={inputStyle} />
          </Field>
          <Field label="Rang RR">
            <input type="number" min={0} max={100} value={form.rank_rr} onChange={(e) => update('rank_rr', e.target.value)} placeholder="Például 63" style={inputStyle} />
          </Field>
        </div>

        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, lineHeight: 1.5, color: '#e5e5e8' }}>
          <input type="checkbox" checked={form.share_publicly} onChange={(e) => update('share_publicly', e.target.checked)} style={{ marginTop: 4 }} />
          <span><strong>Nyilvános profil engedélyezése</strong><br /><span style={{ color: '#b5b5c0', fontSize: 13 }}>A fent megadott adatokat bárki láthatja a nyilvános profil-linken. A megosztás külön megerősítést igényel mentéskor.</span></span>
        </label>

        <button type="submit" disabled={saving} style={primaryButtonStyle}>{saving ? 'Mentés…' : 'Profil mentése'}</button>
      </form>

      {notice && <p role="status" style={{ color: '#82e6a5', lineHeight: 1.6 }}>{notice}</p>}
      {error && <p role="alert" style={{ color: '#ff7b86', lineHeight: 1.6 }}>{error}</p>}
      {savedUrl && <p style={{ lineHeight: 1.8 }}>Nyilvános profil: <a href={savedUrl} style={{ color: '#ff7580' }}>{savedUrl}</a></p>}
      <p style={{ color: '#858593', fontSize: 13, lineHeight: 1.6, marginTop: 28 }}>A nyilvánosságot bármikor kikapcsolhatod a jelölőnégyzet eltávolításával és a profil újbóli mentésével.</p>
    </main>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return <label style={{ display: 'grid', gap: 7, color: '#e5e5e8', fontSize: 14 }}>
    <span>{label}{hint ? <span style={{ display: 'block', color: '#858593', fontSize: 12, marginTop: 3 }}>{hint}</span> : null}</span>
    {children}
  </label>;
}

const pageStyle = { maxWidth: 920, margin: '0 auto', padding: '40px 24px 72px' };
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 };
const inputStyle = { width: '100%', boxSizing: 'border-box' as const, background: '#15161f', color: '#f4f4f5', border: '1px solid #363744', borderRadius: 8, padding: '12px 13px', fontSize: 15 };
const primaryButtonStyle = { background: '#ff4655', color: '#fff', border: 0, borderRadius: 8, padding: '13px 16px', fontSize: 16, fontWeight: 750, cursor: 'pointer' };
const secondaryButtonStyle = { background: 'transparent', color: '#e5e5e8', border: '1px solid #363744', borderRadius: 8, padding: '9px 12px', cursor: 'pointer' };
