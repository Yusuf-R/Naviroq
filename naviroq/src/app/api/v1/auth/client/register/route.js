
import { NextResponse } from 'next/server';
import dbClient from '@/server/database/mongoDB';
import ClientController from '@/server/controllers/ClientController';

export const dynamic = 'force-dynamic'; // Ensure all routes in /client are dynamic

export async function POST(request) {
    const obj = await request.json(); // Parse the request body
    try {
        await dbClient.connect();
        const newUser = await ClientController.RegisterNew(obj);
        return NextResponse.json({ message: 'User registered successfully', user: newUser }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: 'Registration failed', error: error.message }, { status: 400 });
    }
}