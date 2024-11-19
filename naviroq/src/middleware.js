// src/middleware.js
import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

export async function middleware(req) {

    const tq = req.cookies['next-auth.session-token'] || req.cookies['__Secure-next-auth.session-token'];
    console.log({
        req,
        tq
    })

    // Fetch the token using getToken
    const token = await getToken({
        req,
        secret: process.env.AUTH_SECRET,
    });

    console.log('Middleware Token:', token);
    // Redirect to login if no token is found
    if (!token) {
        console.log('No token found');
        return NextResponse.redirect(new URL('/', req.url));
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
