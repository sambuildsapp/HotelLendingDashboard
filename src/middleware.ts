import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/request';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Paths that should be accessible without an access code
    const publicPaths = [
        '/access-code',
        '/api/verify-code',
        '/_next',
        '/favicon.ico',
    ];

    // Check if the path is public or a static asset
    const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
    const isStaticAsset = pathname.includes('.');

    if (isPublicPath || isStaticAsset) {
        return NextResponse.next();
    }

    // Check for the access cookie
    const authAccess = request.cookies.get('auth_access');

    if (!authAccess) {
        const url = request.nextUrl.clone();
        url.pathname = '/access-code';
        // Store the intended destination to redirect back after verification
        url.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
