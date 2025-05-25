import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
    );

    const data = await response.json();
    console.log('Places API response:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching from Places API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch place data' },
      { status: 500 }
    );
  }
} 