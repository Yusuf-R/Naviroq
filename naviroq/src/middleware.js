// src/middleware.js
import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

export async function middleware(req) {
    const { pathname } = req.nextUrl;
    // Define public routes that don't require authentication
    const publicRoutes = [
        // client
        '/api/v1/auth/client/register',
        '/api/v1/auth/client/login',
        '/api/v1/auth/client/social-login',
        // driver
        '/api/v1/auth/driver/register',
        '/api/v1/auth/driver/login',
        '/api/v1/auth/driver/social-login',
        // db test
        '/api/v1/auth/db/test',
        // decrypt
        '/api/v1/auth/decrypt',
        // reset and set password
        '/api/v1/auth/reset-password',
        '/api/v1/auth/set-password',

        // admin
        '/api/v1/auth/admin',
    ];

    // Allow public routes to proceed without token validation
    if (publicRoutes.some((route) => pathname.includes(route))) {
        return NextResponse.next();
    }
    // Fetch the token using getToken
    const token = await getToken({
        req,
        secret: process.env.AUTH_SECRET,
        secureCookie: process.env.NODE_ENV === 'production',
        cookieName:
            process.env.NODE_ENV === 'production'
                ? '__Secure-next-auth.session-token'
                : 'next-auth.session-token',
    });

    // Redirect to login if no token is found
    if (!token) {
        console.log('Failed to retrieve token.');
        return NextResponse.redirect(new URL('/auth/user', req.url));
    }
    const userRole = token.role;

    // Define role-based access logic for frontend paths
    const rolePaths = {
        Admin: '/admin',
        User: '/user',
        Driver: '/driver',
    };

    // Check role access for frontend routes
    
    const expectedPath = rolePaths[userRole];
    if (expectedPath && pathname.includes(expectedPath)) {
        return NextResponse.next();
    }
    console.warn(`Access denied for Role: ${userRole} on Path: ${pathname}`);
    return NextResponse.next();
}

export const config = {
    matcher: ['/user/:path*', '/driver/:path*', '/admin/:path*', 'api/v1/:path*'], // Define routes to match
};
