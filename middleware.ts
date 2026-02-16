import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Diagnostic log for Vercel logs - helps identify if middleware is even firing
    console.log(`[Middleware] Processing: ${pathname}`);

    // Define public paths that DON'T need protection
    const isPublic =
        pathname.startsWith('/access-code') ||
        pathname.startsWith('/api/verify-code') ||
        pathname.startsWith('/_next') ||
        pathname === '/favicon.ico' ||
        pathname.includes('.'); // Usually static files like .png, .jpg, etc.

    let response;

    if (isPublic) {
        response = NextResponse.next();
    } else {
        // Check for the access cookie
        const authAccess = request.cookies.get('auth_access');

        if (!authAccess) {
            console.log(`[Middleware] Unauthorized access to ${pathname} - Redirecting to /access-code`);
            const url = request.nextUrl.clone();
            url.pathname = '/access-code';
            url.searchParams.set('callbackUrl', pathname);
            response = NextResponse.redirect(url);
        } else {
            response = NextResponse.next();
        }
    }

    // ADD DIAGNOSTIC HEADER TO ALL RESPONSES
    // This makes it VERY easy to debug: just check headers in the browser Network tab.
    response.headers.set('x-middleware-debug', 'active');

    return response;
}

// Simple matcher to ensure it's not skipped. 
// We handle specific logic inside the function for maximum control.
export const config = {
    matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
};
