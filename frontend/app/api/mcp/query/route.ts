import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL;
if (!BACKEND_URL) {
  throw new Error('BACKEND_URL environment variable is required');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/api/mcp/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    // Check if response is ok before trying to parse JSON
    if (!response.ok) {
      let errorMessage = `Backend returned ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = `Backend error: ${response.status} ${response.statusText}`;
      }
      return NextResponse.json(
        {
          status_code: response.status,
          status: false,
          message: errorMessage,
          path: '/api/mcp/query',
          data: null,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Backend now returns standardized format, so we can pass it through
    return NextResponse.json(data, { status: data.status_code || response.status });
  } catch (error: any) {
    console.error('Error running query:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Error processing request';
    if (error.message?.includes('fetch')) {
      errorMessage = `Cannot connect to backend at ${BACKEND_URL}. Make sure the backend server is running.`;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      {
        status_code: 500,
        status: false,
        message: errorMessage,
        path: '/api/mcp/query',
        data: null,
      },
      { status: 500 }
    );
  }
}
