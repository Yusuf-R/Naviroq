
import { NextResponse } from 'next/server';
import DriverController from '@/server/controllers/DriverController';


export async function POST(request) {
    const obj = await request.json();
    try {
        
        const driver = await DriverController.Login(obj);
        // Return the authenticated user data (user id, role)
        return NextResponse.json({
            id: driver._id,
            role: driver.role,
            email: driver.email
        }, { status: 201 });

    } catch (error) {
        return NextResponse.json({ message: 'Login failed', error: error.message }, { status: 400 });
    }
}