import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, sizes, categories } = body;

    console.log('Size recommendation API - Request body:', { productId, sizes, categories });

    // Get token from headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Size recommendation API - No authorization header');
      return NextResponse.json(
        { message: 'Authorization token required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    console.log('Size recommendation API - Token exists:', !!token);

    // Call backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://nidas-be.onrender.com';
    console.log('Size recommendation API - Backend URL:', backendUrl);
    
    const apiUrl = `${backendUrl}/api/size-recommendation`;
    console.log('Size recommendation API - Full API URL:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        productId,
        sizes,
        categories,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || 'Failed to get size recommendation' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in size recommendation API:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 