import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Diagnostic log for Vercel logs
    console.log(`Middleware processing path: ${pathname}`);

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
        console.log(`Redirecting unauthorized access to /access-code from ${pathname}`);
        const url = request.nextUrl.clone();
        url.pathname = '/access-code';
        url.searchParams.set('callbackUrl', pathname);
        const response = NextResponse.redirect(url);
        response.headers.set('x-middleware-active', 'true');
        return response;
    }

    const response = NextResponse.next();
    response.headers.set('x-middleware-active', 'true');
    return response;
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
