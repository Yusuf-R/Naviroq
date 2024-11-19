
import { NextResponse } from 'next/server';
import dbClient from '@/server/database/mongoDB';
import DriverController from '@/server/controllers/DriverController';


export async function POST(request) {
    const obj = await request.json(); // Parse the request body
    try {
        await dbClient.connect();
        const newUser = await DriverController.RegisterNew(obj);
        return NextResponse.json({ message: 'Driver registered successfully', user: newUser }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: 'Registration failed', error: error.message }, { status: 400 });
    }
}