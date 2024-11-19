// src/middleware.js
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

// Create a custom middleware that wraps the built-in withAuth middleware
export default withAuth(
  async function middleware(req) {
    const token = req.nextauth.token;
    
    // If no token, redirect to login
    if (!token) {
      const loginUrl = new URL('/auth/signin', req.url);
      loginUrl.searchParams.set('callbackUrl', req.url);
      return NextResponse.redirect(loginUrl);
    }

    const userRole = token.role;
    const { pathname } = req.nextUrl;

    // Role-based access control
    if (userRole === 'Admin') {
      return NextResponse.next();
    }

    if (pathname.startsWith('/user') && userRole !== 'Client') {
      return NextResponse.redirect(new URL('/', req.url));
    }

    if (pathname.startsWith('/driver') && userRole !== 'Driver') {
      return NextResponse.redirect(new URL('/', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
    secret: process.env.AUTH_SECRET,
    pages: {
      signIn: '/auth/signin',
    }
  }
);

export const config = {
  matcher: ['/user/:path*', '/driver/:path*', '/admin/:path*']
};