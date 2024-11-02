// src/middleware.js
import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

// This middleware will check the session JWT token
export async function middleware(req) {
    const token = await getToken({ req, secret: process.env.AUTH_SECRET });

    // Redirect to login page if no token is found (user not logged in)
    if (!token) {
        console.log('No token found');
        return NextResponse.redirect(new URL('/', req.url));
    }

    // Extract the user role from the token
    const userRole = token.role;

    // Handle route protection based on user role
    const { pathname } = req.nextUrl;

    // Admin can access everything
    if (userRole === 'Admin') {
        return NextResponse.next();
    }

    // Restrict access for client-related routes
    if (pathname.startsWith('/user') && userRole !== 'Client') {
        console.log('User not allowed');
        return NextResponse.redirect(new URL('/', req.url));
    }

    // Restrict access for driver-related routes
    if (pathname.startsWith('/driver') && userRole !== 'Driver') {
        console.log('Driver not allowed');
        return NextResponse.redirect(new URL('/', req.url));
    }

    // Allow access to the route
    return NextResponse.next();
}

// Specify which routes this middleware should apply to
export const config = {
    matcher: ['/user/:path*', '/driver/:path*', '/admin/:path*'],
};