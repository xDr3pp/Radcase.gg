import { NextResponse } from 'next/server';

export function GET() {
  return NextResponse.json({
    ok: true,
    app: 'RadCase.gg',
    mode: 'scaffold',
    riotConnected: false,
    databaseConnected: false,
    message: 'Starter API is running. Riot RSO and database are not configured.'
  });
}
