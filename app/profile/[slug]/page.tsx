import { notFound } from 'next/navigation';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

type Props = { params: Promise<{ slug: string }> };

export const dynamic = 'force-dynamic';

export default async function PublicProfilePage({ params }: Props) {
  const { slug } = await params;
  if (!/^[a-z0-9-]{3,32}$/.test(slug)) notFound();

  const supabase = getSupabaseAdmin();
  if (!supabase) notFound();

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('public_slug, game_name, tagline, region, account_level, rank_name, rank_rr, riot_verified_at')
    .eq('public_slug', slug)
    .eq('share_publicly', true)
    .maybeSingle();

  if (error || !profile) notFound();

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: '56px 24px' }}>
      <a href="/" style={{ color: '#ff4655', fontWeight: 850, letterSpacing: 2, textDecoration: 'none' }}>RADCASE.GG</a>
      <section style={{ marginTop: 32, padding: 28, border: '1px solid #2b2c38', borderRadius: 16, background: '#11121a' }}>
        <p style={{ color: '#ff4655', fontWeight: 800, letterSpacing: 1.5, marginTop: 0 }}>PUBLIC PLAYER PROFILE</p>
        <h1 style={{ fontSize: 38, marginBottom: 8 }}>{profile.game_name}{profile.tagline ? <span style={{ color: '#9b9ba7', fontSize: 24 }}>#{profile.tagline}</span> : null}</h1>
        <p style={{ color: '#9b9ba7' }}>{profile.region || 'EU'} · RadCase.gg profil</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginTop: 24 }}>
          <Stat label="Fiókszint" value={profile.account_level ?? '—'} />
          <Stat label="Rang" value={profile.rank_name || '—'} />
          <Stat label="RR" value={profile.rank_rr ?? '—'} />
        </div>
        <p style={{ color: '#777987', fontSize: 13, lineHeight: 1.6, marginBottom: 0, marginTop: 24 }}>
          {profile.riot_verified_at
            ? 'A fiók Riot-hitelesítése rögzítve van.'
            : 'A megjelenített adatok a profil tulajdonosa által megadott adatok; Riot-hitelesítés még nincs bekötve.'}
        </p>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return <div style={{ border: '1px solid #2b2c38', borderRadius: 10, padding: 16, background: '#0c0d13' }}>
    <p style={{ color: '#858593', fontSize: 13, marginTop: 0 }}>{label}</p>
    <strong style={{ fontSize: 22 }}>{value}</strong>
  </div>;
}
