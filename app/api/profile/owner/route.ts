import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const authorization = request.headers.get('authorization');
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7).trim() : '';

  if (!token) {
    return NextResponse.json({ ok: false, error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: 'DATABASE_NOT_CONFIGURED' }, { status: 503 });
  }

  const { data: authData, error: authError } = await supabase.auth.getUser(token);
  if (authError || !authData.user) {
    return NextResponse.json({ ok: false, error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('public_slug, game_name, tagline, region, account_level, rank_name, rank_rr, share_publicly, updated_at')
    .eq('owner_user_id', authData.user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ ok: false, error: 'PROFILE_LOOKUP_FAILED' }, { status: 500 });
  }
  if (!profile) {
    return NextResponse.json({ ok: false, error: 'PROFILE_NOT_FOUND' }, { status: 404 });
  }

  return NextResponse.json({ ok: true, profile }, { headers: { 'Cache-Control': 'no-store' } });
}
