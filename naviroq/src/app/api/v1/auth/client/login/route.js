
import { NextResponse } from 'next/server';
import dbClient from '@/server/database/mongoDB';
import ClientController from '@/server/controllers/ClientController';


export async function POST(request) {
    const obj = await request.json();
    try {
        await dbClient.connect();
        const user = await ClientController.Login(obj);
        // Return the authenticated user data (user id, role)
        return NextResponse.json({
            id: user._id,
            role: user.role,
            email: user.email
        }, { status: 201 });

    } catch (error) {
        return NextResponse.json({ message: 'Login failed', error: error.message }, { status: 400 });
    }
}