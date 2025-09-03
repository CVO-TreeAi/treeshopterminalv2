import { NextRequest, NextResponse } from 'next/server';

const REGRID_BASE_URL = 'https://app.regrid.com/api/v1';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { app_token, geojson, limit = 50 } = body;

    if (!app_token) {
      return NextResponse.json({ error: 'app_token is required' }, { status: 400 });
    }

    if (!geojson) {
      return NextResponse.json({ error: 'geojson is required' }, { status: 400 });
    }

    const regridToken = process.env.REGRID_API_TOKEN;
    if (!regridToken) {
      return NextResponse.json({ error: 'REGRID_API_TOKEN not configured' }, { status: 500 });
    }

    const response = await fetch(
      `${REGRID_BASE_URL}/parcels/search`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${regridToken}`,
        },
        body: JSON.stringify({
          geometry: geojson,
          limit: limit,
        }),
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
    console.error('Error fetching parcels by area:', error);
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