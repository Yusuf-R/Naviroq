// src/middleware.js
import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import { auth as middleware } from "@/server/auth/options";

export async function middleware(req) {
    const token = await getToken({
        req,
        secret: process.env.AUTH_SECRET,
        signingKey: process.env.JWT_SIGNING_PRIVATE_KEY, // Custom signing key
        encryptionKey: process.env.JWT_ENCRYPTION_PRIVATE_KEY, // Custom encryption key
    });
    console.log({ req });
    console.log('Token:', token);

    // Redirect to login if no token is found
    if (!token) {
        console.log('No token found');
        return NextResponse.redirect(new URL('/', req.url));
    }

    const userRole = token.role;
    const { pathname } = req.nextUrl;
    console.log(`Pathname: ${pathname}, Role: ${userRole}`);

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
    matcher: ['/user/:path*', '/driver/:path*', '/admin/:path*'],
};
