import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

const REGIONS = new Set(['EU', 'NA', 'AP', 'KR', 'BR', 'LATAM']);
const CONSENT_VERSION = 'public-profile-v1';

function cleanText(value: unknown, maxLength: number): string | null {
  if (typeof value !== 'string') return null;
  const text = value.trim();
  if (!text || text.length > maxLength) return null;
  return text;
}

function nullableText(value: unknown, maxLength: number): string | null | undefined {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value !== 'string' || value.trim().length > maxLength) return undefined;
  return value.trim() || null;
}

export async function POST(request: Request) {
  const authorization = request.headers.get('authorization');
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7).trim() : '';

  if (!token) {
    return NextResponse.json({ ok: false, error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: 'DATABASE_NOT_CONFIGURED' }, { status: 503 });
  }

  // Validate the supplied access token with Supabase Auth; never trust a user id from the request body.
  const { data: authData, error: authError } = await supabase.auth.getUser(token);
  if (authError || !authData.user) {
    return NextResponse.json({ ok: false, error: 'UNAUTHORIZED' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    const parsed: unknown = await request.json();
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return NextResponse.json({ ok: false, error: 'INVALID_BODY' }, { status: 400 });
    }
    body = parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: 'INVALID_BODY' }, { status: 400 });
  }

  const publicSlug = cleanText(body.public_slug, 32)?.toLowerCase();
  const gameName = cleanText(body.game_name, 32);
  const tagline = nullableText(body.tagline, 16);
  const rankName = nullableText(body.rank_name, 50);
  const region = typeof body.region === 'string' ? body.region.toUpperCase() : '';
  const accountLevel = body.account_level === '' || body.account_level === null || body.account_level === undefined
    ? null
    : Number(body.account_level);
  const rankRr = body.rank_rr === '' || body.rank_rr === null || body.rank_rr === undefined
    ? null
    : Number(body.rank_rr);
  const sharePublicly = body.share_publicly === true;
  const confirmPublicShare = body.confirm_public_share === true;

  if (!publicSlug || !/^[a-z0-9-]{3,32}$/.test(publicSlug)) {
    return NextResponse.json({ ok: false, error: 'INVALID_PROFILE_SLUG', message: 'A profilcím 3–32 karakter legyen; kisbetű, szám és kötőjel használható.' }, { status: 400 });
  }
  if (!gameName) {
    return NextResponse.json({ ok: false, error: 'INVALID_GAME_NAME', message: 'Add meg a Riot ID játékosnevét.' }, { status: 400 });
  }
  if (tagline === undefined || rankName === undefined) {
    return NextResponse.json({ ok: false, error: 'INVALID_OPTIONAL_FIELD' }, { status: 400 });
  }
  if (!REGIONS.has(region)) {
    return NextResponse.json({ ok: false, error: 'INVALID_REGION', message: 'Válassz érvényes régiót.' }, { status: 400 });
  }
  if (accountLevel !== null && (!Number.isInteger(accountLevel) || accountLevel < 0 || accountLevel > 10000)) {
    return NextResponse.json({ ok: false, error: 'INVALID_ACCOUNT_LEVEL' }, { status: 400 });
  }
  if (rankRr !== null && (!Number.isInteger(rankRr) || rankRr < 0 || rankRr > 100)) {
    return NextResponse.json({ ok: false, error: 'INVALID_RANK_RR' }, { status: 400 });
  }
  if (sharePublicly && !confirmPublicShare) {
    return NextResponse.json({ ok: false, error: 'PUBLIC_SHARE_CONSENT_REQUIRED', message: 'A nyilvános profil közzétételéhez erősítsd meg a hozzájárulást.' }, { status: 400 });
  }

  // Never publish as part of the upsert. A separate step is taken only after an explicit consent record is saved.
  const { data: saved, error: saveError } = await supabase
    .from('profiles')
    .upsert({
      owner_user_id: authData.user.id,
      public_slug: publicSlug,
      game_name: gameName,
      tagline,
      region,
      account_level: accountLevel,
      rank_name: rankName,
      rank_rr: rankRr,
      share_publicly: false,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'owner_user_id' })
    .select('id, public_slug')
    .single();

  if (saveError || !saved) {
    if (saveError?.code === '23505') {
      return NextResponse.json({ ok: false, error: 'PROFILE_SLUG_TAKEN', message: 'Ez a profilcím már foglalt. Válassz másikat.' }, { status: 409 });
    }
    return NextResponse.json({ ok: false, error: 'PROFILE_SAVE_FAILED' }, { status: 500 });
  }

  const now = new Date().toISOString();
  const { error: revokeError } = await supabase
    .from('profile_share_consents')
    .update({ revoked_at: now })
    .eq('profile_id', saved.id)
    .is('revoked_at', null);

  if (revokeError) {
    return NextResponse.json({ ok: false, error: 'CONSENT_UPDATE_FAILED' }, { status: 500 });
  }

  if (sharePublicly) {
    const { error: consentError } = await supabase
      .from('profile_share_consents')
      .insert({ profile_id: saved.id, consent_version: CONSENT_VERSION });

    if (consentError) {
      return NextResponse.json({ ok: false, error: 'CONSENT_SAVE_FAILED' }, { status: 500 });
    }

    const { error: publishError } = await supabase
      .from('profiles')
      .update({ share_publicly: true, updated_at: new Date().toISOString() })
      .eq('id', saved.id)
      .eq('owner_user_id', authData.user.id);

    if (publishError) {
      return NextResponse.json({ ok: false, error: 'PROFILE_PUBLISH_FAILED' }, { status: 500 });
    }
  }

  return NextResponse.json({
    ok: true,
    publicProfileUrl: sharePublicly ? `/profile/${saved.public_slug}` : null,
    sharePublicly,
    message: sharePublicly ? 'A profil mentve és nyilvánosan elérhető.' : 'A profil mentve, jelenleg privát.',
  }, { headers: { 'Cache-Control': 'no-store' } });
}
