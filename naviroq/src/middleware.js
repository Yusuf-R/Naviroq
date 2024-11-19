import { getToken } from "next-auth/jwt"
import { NextResponse } from 'next/server'

export async function middleware(req) {
  console.log('Middleware started')
  console.log('Request URL:', req.url)
  console.log('Request Pathname:', req.nextUrl.pathname)

  try {
    const token = await getToken({ req, secret: process.env.AUTH_SECRET })
    
    console.log('Token retrieved:', !!token)
    console.log('Token details:', token ? {
      role: token.role,
      id: token.id,
      email: token.email
    } : 'No token')

    // No token - redirect to login
    if (!token) {
      console.warn('No token found, redirecting to login')
      const loginUrl = new URL('/auth/signin', req.url)
      loginUrl.searchParams.set('callbackUrl', req.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Role-based access control
    const userRole = token.role
    console.log('User Role:', userRole)

    const roleRoutes = {
      'Admin': ['/admin', '/user', '/driver'],
      'Client': ['/user'],
      'Driver': ['/driver']
    }

    const allowedRoutes = roleRoutes[userRole] || []
    const isAuthorized = allowedRoutes.some(route => req.nextUrl.pathname.startsWith(route))

    console.log('Authorized Routes for role:', allowedRoutes)
    console.log('Is Route Authorized:', isAuthorized)

    if (!isAuthorized) {
      console.warn(`Unauthorized access attempt: ${userRole} tried to access ${req.nextUrl.pathname}`)
      return NextResponse.redirect(new URL('/', req.url))
    }

    return NextResponse.next()
  } catch (error) {
    console.error('Middleware Error:', error)
    return NextResponse.redirect(new URL('/', req.url))
  }
}

export const config = {
  matcher: ['/user/:path*', '/driver/:path*', '/admin/:path*']
}