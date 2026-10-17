import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  if (!/^[a-z0-9-]{3,32}$/.test(slug)) {
    return NextResponse.json({ ok: false, error: 'INVALID_PROFILE_SLUG' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: 'DATABASE_NOT_CONFIGURED', message: 'A Supabase-kapcsolat még nincs beállítva.' }, { status: 503 });
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, public_slug, game_name, tagline, region, account_level, rank_name, rank_rr, riot_verified_at, updated_at')
    .eq('public_slug', slug)
    .eq('share_publicly', true)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ ok: false, error: 'PROFILE_LOOKUP_FAILED' }, { status: 500 });
  }
  if (!profile) {
    return NextResponse.json({ ok: false, error: 'PROFILE_NOT_FOUND' }, { status: 404 });
  }

  const { id: profileId, ...publicProfile } = profile;
  const { data: featuredSkins, error: featuredError } = await supabase
    .from('profile_featured_skins')
    .select('weapon_type, skin_uuid, display_order')
    .eq('profile_id', profileId)
    .order('display_order', { ascending: true });

  if (featuredError) {
    return NextResponse.json({ ok: false, error: 'PROFILE_LOOKUP_FAILED' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, profile: publicProfile, featuredSkins: featuredSkins ?? [] }, {
    headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
  });
}
