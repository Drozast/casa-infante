import { NextRequest, NextResponse } from 'next/server';

const INTERNAL_API_URL =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:3031/api/v1';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');

  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const response = await fetch(
      `${INTERNAL_API_URL}/dashboard/guardian-summary`,
      {
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: 'Error connecting to backend' },
      { status: 502 },
    );
  }
}
