import { NextRequest, NextResponse } from 'next/server';

const REGRID_BASE_URL = 'https://app.regrid.com/api/v1';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const app_token = searchParams.get('app_token');
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const radius = searchParams.get('radius') || '1000';
  const limit = searchParams.get('limit') || '50';

  if (!app_token) {
    return NextResponse.json({ error: 'app_token is required' }, { status: 400 });
  }

  if (!lat || !lon) {
    return NextResponse.json({ error: 'lat and lon are required' }, { status: 400 });
  }

  try {
    const regridToken = process.env.REGRID_API_TOKEN;
    if (!regridToken) {
      return NextResponse.json({ error: 'REGRID_API_TOKEN not configured' }, { status: 500 });
    }

    const response = await fetch(
      `${REGRID_BASE_URL}/parcels?token=${regridToken}&lat=${lat}&lon=${lon}&radius=${radius}&limit=${limit}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Regrid API error: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Error fetching parcels:', error);
    return NextResponse.json(
      { error: 'Failed to fetch parcel data' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}