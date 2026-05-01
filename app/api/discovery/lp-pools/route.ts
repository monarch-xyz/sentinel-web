import { NextResponse } from 'next/server';
import { listLpPools, LpPoolDiscoveryError } from '@/lib/lp-pool-discovery/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') ?? '';
  const limit = Number(searchParams.get('limit') ?? '20');
  const chainId = Number(searchParams.get('chainId') ?? '1');

  try {
    const items = await listLpPools({
      search,
      limit,
      chainId,
    });

    return NextResponse.json({ items });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof LpPoolDiscoveryError ? 'lp_pools_fetch_failed' : 'lp_pools_unknown_error',
        details: error instanceof Error ? error.message : 'unknown_error',
      },
      { status: 502 }
    );
  }
}
