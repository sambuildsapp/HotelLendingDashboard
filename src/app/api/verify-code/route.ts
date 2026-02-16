import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { code } = await request.json();
        const secretCode = process.env.APP_ACCESS_CODE || '1234';

        if (code === secretCode) {
            const response = NextResponse.json({ success: true });

            // Set a secure cookie that expires in 30 days
            response.cookies.set('auth_access', 'true', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 30, // 30 days
                path: '/',
            });

            return response;
        }

        return NextResponse.json(
            { success: false, message: 'Invalid access code' },
            { status: 401 }
        );
    } catch (error) {
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
