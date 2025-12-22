import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/api/mcp/activate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    // Backend now returns standardized format, so we can pass it through
    return NextResponse.json(data, { status: data.status_code || response.status });
  } catch (error: any) {
    console.error('Error activating MCP configuration:', error);
    return NextResponse.json(
      {
        status_code: 500,
        status: false,
        message: error.message || 'Failed to activate configuration',
        path: '/api/mcp/activate',
        data: null,
      },
      { status: 500 }
    );
  }
}
