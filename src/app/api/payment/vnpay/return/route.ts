import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.toString();

    console.log('[Frontend API] VNPAY return query:', query);

    // Forward to backend - loại bỏ /api từ baseURL nếu có
    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'https://nidas-be.onrender.com';
    const cleanBaseURL = baseURL.replace(/\/api$/, '');
    const apiUrl = `${cleanBaseURL}/api/payment/vnpay/return?${query}`;

    console.log('[Frontend API] Calling backend:', apiUrl);

    // Lấy token từ cookies nếu có
    const authToken = request.cookies.get('auth_token')?.value;
    console.log('[Frontend API] Auth token from cookies:', authToken ? 'exists' : 'not found');

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    // Thêm Authorization header nếu có token
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    console.log('[Frontend API] Making fetch request to:', apiUrl);
    console.log('[Frontend API] Headers:', headers);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers,
      credentials: 'include',
    });

    console.log('[Frontend API] Fetch completed, status:', response.status);

    console.log('[Frontend API] Backend response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Frontend API] Backend error:', errorText);
      return NextResponse.json(
        { error: 'Backend error', detail: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('[Frontend API] Backend response:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('[Frontend API] VNPAY return error:', error);
    return NextResponse.json(
      { error: 'Xác thực returnUrl thất bại', detail: (error as { message?: string })?.message },
      { status: 400 }
    );
  }
}
