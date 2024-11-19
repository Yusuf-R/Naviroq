// src/middleware.js
import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

export async function middleware(req) {
    // Fetch the token using getToken
    const token = await getToken({
        req,
        secret: process.env.AUTH_SECRET,
    });

    console.log('Middleware Token:', token);

    // Redirect to login if no token is found
    if (!token) {
        const loginUrl = new URL('/auth/signin', req.url);
        loginUrl.searchParams.set('callbackUrl', req.url); // Redirect back to the original URL post-login
        return NextResponse.redirect(loginUrl);
    }

    const userRole = token.role;
    const { pathname } = req.nextUrl;

    console.log(`Pathname: ${pathname}, Role: ${userRole}`);

    // Role-based access control
    if (userRole === 'Admin') {
        return NextResponse.next();
    }

    if (pathname.startsWith('/user') && userRole !== 'Client') {
        console.log('User not allowed');
        return NextResponse.redirect(new URL('/', req.url));
    }

    if (pathname.startsWith('/driver') && userRole !== 'Driver') {
        console.log('Driver not allowed');
        return NextResponse.redirect(new URL('/', req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/user/:path*', '/driver/:path*', '/admin/:path*'], // Define routes to match
};
