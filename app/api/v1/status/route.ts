import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    api_version: 'v1',
    endpoints: [
      'GET /api/v1/parcels/search?app_token=<token>&lat=<lat>&lon=<lon>&radius=<radius>&limit=<limit>',
      'GET /api/v1/parcels/apn?app_token=<token>&apn=<apn>&limit=<limit>',
      'GET /api/v1/parcels/address?app_token=<token>&address=<address>&limit=<limit>',
      'POST /api/v1/parcels/area (body: {app_token, geojson, limit})'
    ],
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      REGRID_API_TOKEN_SET: !!process.env.REGRID_API_TOKEN,
      RATE_LIMITING: {
        WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS || '3600000',
        MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS || '100'
      }
    }
  }, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}