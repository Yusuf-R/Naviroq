// loguut
'use server'
import { NextResponse } from 'next/server'
import AuthController from '@/server/controllers/AuthController'
import DriverController from '@/server/controllers/DriverController';
export const dynamic = 'force-dynamic'; // Ensure the route is always dynamic
export async function POST(req) {
    try {
        const driverId = await AuthController.headlessCheck(req)
        if (driverId instanceof Error) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }
        const driverProfile = await DriverController.Logout(driverId)
        if (!driverProfile) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
          }
        return NextResponse.json({ message: 'Logged out successfully' }, { status: 200 });
    } catch (error) {
        console.error('Logout Error:', error)
        return NextResponse.json({ message: 'Logout failed' }, { status: 500 })
    }
}

