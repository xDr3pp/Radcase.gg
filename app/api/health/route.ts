
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  let databaseConnected = false;

  if (supabaseUrl && supabaseKey) {
    try {
      const response = await fetch(
        `${supabaseUrl.replace(/\/$/, '')}/rest/v1/profiles?select=id&limit=1`,
        {
          method: 'GET',
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
          cache: 'no-store',
          signal: AbortSignal.timeout(8000),
        }
      );

      databaseConnected = response.ok;
    } catch {
      databaseConnected = false;
    }
  }

  return NextResponse.json(
    {
      ok: true,
      app: 'RadCase.gg',
      mode: 'scaffold',
      riotConnected: false,
      databaseConnected,
      message: databaseConnected
        ? 'Supabase database connection verified.'
        : 'Supabase database connection is not available.',
    },
    {
      status: 200,
      headers: { 'Cache-Control': 'no-store' },
    }
  );
}
